package com.debate.domain.vote;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final VoteRecordRepository voteRecordRepository;

    private static final String VOTE_HASH_PREFIX = "vote:room:";
    private static final String ACTIVE_ROOMS_KEY = "vote:active-rooms";

    /** 투표값을 Redis에 기록 (value: 0~100 정수) */
    public void recordVote(Long roomId, String voterId, int value) {
        redisTemplate.opsForHash().put(VOTE_HASH_PREFIX + roomId, voterId, value);
        redisTemplate.opsForSet().add(ACTIVE_ROOMS_KEY, String.valueOf(roomId));
    }

    /** Redis에서 방의 현재 투표 평균 계산 (0.0 ~ 100.0) */
    public double computeAverage(Long roomId) {
        Map<Object, Object> votes = redisTemplate.opsForHash().entries(VOTE_HASH_PREFIX + roomId);
        if (votes.isEmpty()) return 50.0;
        return votes.values().stream()
                .mapToDouble(v -> ((Number) v).doubleValue())
                .average()
                .orElse(50.0);
    }

    /** 현재 투표 참여자 수 */
    public int getVoterCount(Long roomId) {
        return (int) redisTemplate.opsForHash().size(VOTE_HASH_PREFIX + roomId);
    }

    /** 투표가 진행 중인 방 ID 목록 */
    public Set<String> getActiveRoomIds() {
        Set<Object> members = redisTemplate.opsForSet().members(ACTIVE_ROOMS_KEY);
        if (members == null) return Set.of();
        return members.stream().map(Object::toString).collect(Collectors.toSet());
    }

    /** 방 종료 시 Redis 투표를 DB에 저장 (인증된 사용자만) */
    public void persistFinalVotes(Long roomId) {
        Map<Object, Object> votes = redisTemplate.opsForHash().entries(VOTE_HASH_PREFIX + roomId);
        for (Map.Entry<Object, Object> entry : votes.entrySet()) {
            String key = entry.getKey().toString();
            if (key.startsWith("anon:")) continue;
            try {
                Long userId = Long.parseLong(key);
                double normalized = ((Number) entry.getValue()).doubleValue() / 100.0;
                voteRecordRepository.save(
                        VoteRecord.builder()
                                .roomId(roomId)
                                .spectatorId(userId)
                                .value(normalized)
                                .build()
                );
            } catch (NumberFormatException ignored) {}
        }
        log.debug("최종 투표 DB 저장 완료: roomId={}, 건수={}", roomId, votes.size());
    }

    /** Redis 데이터 정리 */
    public void cleanupRoom(Long roomId) {
        redisTemplate.delete(VOTE_HASH_PREFIX + roomId);
        redisTemplate.opsForSet().remove(ACTIVE_ROOMS_KEY, String.valueOf(roomId));
    }
}
