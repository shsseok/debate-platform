package com.debate.websocket;

import com.debate.domain.room.Room;
import com.debate.domain.room.RoomRepository;
import com.debate.domain.room.RoomStatus;
import com.debate.domain.vote.VoteService;
import com.debate.websocket.dto.VoteRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class VoteWebSocketHandler {

    private final RoomRepository roomRepository;
    private final VoteService voteService;

    @MessageMapping("/debate/{roomId}/vote")
    public void handleVote(
            @DestinationVariable Long roomId,
            @Payload VoteRequest request,
            Principal principal,
            SimpMessageHeaderAccessor headerAccessor) {

        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null || room.getStatus() != RoomStatus.ACTIVE) {
            return;
        }

        int value = Math.max(0, Math.min(100, request.value()));

        // 인증 유저는 userId, 비로그인은 세션 ID로 식별
        String voterId = (principal != null)
                ? principal.getName()
                : "anon:" + headerAccessor.getSessionId();

        voteService.recordVote(roomId, voterId, value);
        log.debug("투표 기록: roomId={}, voter={}, value={}", roomId, voterId, value);
    }
}
