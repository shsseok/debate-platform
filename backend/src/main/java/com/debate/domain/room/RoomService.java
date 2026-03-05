package com.debate.domain.room;

import com.debate.domain.room.dto.JoinRoomRequest;
import com.debate.domain.room.dto.JoinRoomResponse;
import com.debate.domain.room.dto.RoomCreateRequest;
import com.debate.domain.room.dto.RoomResponse;
import com.debate.domain.user.UserRepository;
import com.debate.domain.vote.DebateResult;
import com.debate.domain.vote.DebateResultRepository;
import com.debate.domain.vote.VoteService;
import com.debate.websocket.dto.VoteResultResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RandomTopicGenerator randomTopicGenerator;
    private final VoteService voteService;
    private final DebateResultRepository debateResultRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public RoomResponse createRoom(Long userId, RoomCreateRequest request) {
        String topic = (request.type() == RoomType.RANDOM)
                ? randomTopicGenerator.generate()
                : request.topic();

        if (request.type() == RoomType.TOPIC && (topic == null || topic.isBlank())) {
            throw new IllegalArgumentException("주제를 입력해주세요.");
        }

        Room room = Room.builder()
                .type(request.type())
                .topic(topic)
                .proUserId(userId)
                .build();

        return toResponse(roomRepository.save(room));
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRooms() {
        return roomRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoom(Long roomId) {
        return toResponse(findRoom(roomId));
    }

    public JoinRoomResponse joinRoom(Long roomId, Long userId, JoinRoomRequest request) {
        Room room = findRoom(roomId);

        if (room.getStatus() == RoomStatus.ENDED) {
            throw new IllegalStateException("종료된 토론방입니다.");
        }

        String role = request.role().toUpperCase();

        switch (role) {
            case "PRO" -> {
                if (userId == null) throw new IllegalStateException("로그인이 필요합니다.");
                if (room.getProUserId() != null) throw new IllegalStateException("찬성 자리가 이미 차있습니다.");
                room.assignPro(userId);
            }
            case "CON" -> {
                if (userId == null) throw new IllegalStateException("로그인이 필요합니다.");
                if (room.getConUserId() != null) throw new IllegalStateException("반대 자리가 이미 차있습니다.");
                room.assignCon(userId);
            }
            case "SPECTATOR" -> { /* 항상 입장 가능 */ }
            default -> throw new IllegalArgumentException("올바르지 않은 역할입니다: " + role);
        }

        if (room.getProUserId() != null && room.getConUserId() != null
                && room.getStatus() == RoomStatus.WAITING) {
            room.activate();
        }

        return new JoinRoomResponse(roomId, role, "입장 완료");
    }

    public RoomResponse endRoom(Long roomId, Long userId) {
        Room room = findRoom(roomId);

        if (room.getStatus() == RoomStatus.ENDED) {
            throw new IllegalStateException("이미 종료된 토론방입니다.");
        }
        if (!userId.equals(room.getProUserId()) && !userId.equals(room.getConUserId())) {
            throw new IllegalStateException("토론 참가자만 방을 종료할 수 있습니다.");
        }

        double avg = voteService.computeAverage(roomId);
        DebateResult.Winner winner = avg > 50 ? DebateResult.Winner.PRO
                : avg < 50 ? DebateResult.Winner.CON
                : DebateResult.Winner.DRAW;

        voteService.persistFinalVotes(roomId);

        debateResultRepository.save(DebateResult.builder()
                .roomId(roomId)
                .winner(winner)
                .voteAverage(avg / 100.0)
                .build());

        room.end();
        voteService.cleanupRoom(roomId);

        // 방 상태 변경 브로드캐스트
        messagingTemplate.convertAndSend(
                "/sub/debate/" + roomId + "/status",
                Map.of("status", "ENDED", "winner", winner.name(), "voteAverage", avg)
        );

        return toResponse(room);
    }

    private Room findRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다. id=" + roomId));
    }

    private RoomResponse toResponse(Room room) {
        String proNickname = room.getProUserId() != null
                ? userRepository.findById(room.getProUserId())
                        .map(u -> u.getNickname()).orElse(null)
                : null;
        String conNickname = room.getConUserId() != null
                ? userRepository.findById(room.getConUserId())
                        .map(u -> u.getNickname()).orElse(null)
                : null;

        return new RoomResponse(
                room.getId(),
                room.getType(),
                room.getTopic(),
                room.getStatus(),
                room.getProUserId(),
                room.getConUserId(),
                proNickname,
                conNickname,
                room.getCreatedAt(),
                room.getEndedAt()
        );
    }
}
