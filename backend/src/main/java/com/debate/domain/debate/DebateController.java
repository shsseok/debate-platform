package com.debate.domain.debate;

import com.debate.domain.user.UserRepository;
import com.debate.domain.vote.DebateResult;
import com.debate.domain.vote.DebateResultRepository;
import com.debate.websocket.dto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debate")
@RequiredArgsConstructor
public class DebateController {

    private final DebateMessageRepository debateMessageRepository;
    private final UserRepository userRepository;
    private final DebateResultRepository debateResultRepository;

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

    @GetMapping("/{roomId}/result")
    public ResponseEntity<Map<String, Object>> getResult(@PathVariable Long roomId) {
        return debateResultRepository.findByRoomId(roomId)
                .map(result -> ResponseEntity.ok(Map.<String, Object>of(
                        "roomId", result.getRoomId(),
                        "winner", result.getWinner().name(),
                        "voteAverage", result.getVoteAverage() != null ? result.getVoteAverage() * 100 : 50.0,
                        "createdAt", result.getCreatedAt()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
