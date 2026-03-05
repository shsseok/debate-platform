package com.debate.websocket;

import com.debate.domain.debate.DebateMessage;
import com.debate.domain.debate.DebateMessageRepository;
import com.debate.domain.room.Room;
import com.debate.domain.room.RoomRepository;
import com.debate.domain.room.RoomStatus;
import com.debate.domain.user.UserRepository;
import com.debate.websocket.dto.ChatMessageRequest;
import com.debate.websocket.dto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class DebateWebSocketHandler {

    private final RoomRepository roomRepository;
    private final DebateMessageRepository debateMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/debate/{roomId}/message")
    public void handleMessage(
            @DestinationVariable Long roomId,
            @Payload ChatMessageRequest request,
            Principal principal) {

        if (principal == null) {
            log.warn("비인증 사용자의 메시지 전송 시도: roomId={}", roomId);
            return;
        }

        Long userId = Long.parseLong(principal.getName());

        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) {
            log.warn("존재하지 않는 방: roomId={}", roomId);
            return;
        }

        if (room.getStatus() != RoomStatus.ACTIVE) {
            log.warn("활성화되지 않은 방에 메시지 전송 시도: roomId={}, status={}", roomId, room.getStatus());
            return;
        }

        DebateMessage.DebateRole role;
        if (userId.equals(room.getProUserId())) {
            role = DebateMessage.DebateRole.PRO;
        } else if (userId.equals(room.getConUserId())) {
            role = DebateMessage.DebateRole.CON;
        } else {
            log.warn("발언 권한 없는 사용자: userId={}, roomId={}", userId, roomId);
            return;
        }

        String content = request.content();
        if (content == null || content.isBlank() || content.length() > 1000) {
            log.warn("유효하지 않은 메시지 내용: userId={}", userId);
            return;
        }

        DebateMessage saved = debateMessageRepository.save(
                DebateMessage.builder()
                        .roomId(roomId)
                        .userId(userId)
                        .role(role)
                        .content(content.trim())
                        .build()
        );

        String nickname = userRepository.findById(userId)
                .map(u -> u.getNickname())
                .orElse("알 수 없음");

        ChatMessageResponse response = new ChatMessageResponse(
                saved.getId(),
                roomId,
                userId,
                nickname,
                role.name(),
                saved.getContent(),
                saved.getSentAt()
        );

        messagingTemplate.convertAndSend("/sub/debate/" + roomId + "/message", response);
        log.debug("메시지 브로드캐스트: roomId={}, userId={}, role={}", roomId, userId, role);
    }
}
