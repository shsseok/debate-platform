package com.debate.websocket.dto;

public record VoteResultResponse(
        Long roomId,
        double average,  // 0.0 ~ 100.0 (찬성 비율)
        int voterCount
) {}
