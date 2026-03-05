package com.debate.domain.debate;

import com.debate.domain.user.UserRepository;
import com.debate.websocket.dto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/debate")
@RequiredArgsConstructor
public class DebateController {

    private final DebateMessageRepository debateMessageRepository;
    private final UserRepository userRepository;

    @GetMapping("/{roomId}/messages")
    public List<ChatMessageResponse> getMessages(@PathVariable Long roomId) {
        return debateMessageRepository.findByRoomIdOrderBySentAtAsc(roomId)
                .stream()
                .map(msg -> {
                    String nickname = userRepository.findById(msg.getUserId())
                            .map(u -> u.getNickname())
                            .orElse("알 수 없음");
                    return new ChatMessageResponse(
                            msg.getId(),
                            msg.getRoomId(),
                            msg.getUserId(),
                            nickname,
                            msg.getRole().name(),
                            msg.getContent(),
                            msg.getSentAt()
                    );
                })
                .toList();
    }
}
