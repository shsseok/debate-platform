package com.debate.websocket.dto;

import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long id,
        Long roomId,
        Long userId,
        String nickname,
        String role,
        String content,
        LocalDateTime sentAt
) {}
