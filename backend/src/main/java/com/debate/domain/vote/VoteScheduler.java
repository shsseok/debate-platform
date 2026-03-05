package com.debate.domain.vote;

import com.debate.websocket.dto.VoteResultResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class VoteScheduler {

    private final VoteService voteService;
    private final SimpMessagingTemplate messagingTemplate;

    /** 1초마다 투표 평균을 각 방에 브로드캐스트 */
    @Scheduled(fixedRate = 1000)
    public void broadcastVoteResults() {
        Set<String> activeRoomIds = voteService.getActiveRoomIds();
        for (String roomIdStr : activeRoomIds) {
            try {
                Long roomId = Long.parseLong(roomIdStr);
                double average = voteService.computeAverage(roomId);
                int voterCount = voteService.getVoterCount(roomId);

                VoteResultResponse result = new VoteResultResponse(roomId, average, voterCount);
                messagingTemplate.convertAndSend("/sub/debate/" + roomId + "/vote-result", result);
            } catch (Exception e) {
                log.warn("투표 브로드캐스트 실패: roomId={}, error={}", roomIdStr, e.getMessage());
            }
        }
    }
}
