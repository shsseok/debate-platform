package com.debate.domain.room.dto;

import com.debate.domain.room.RoomStatus;
import com.debate.domain.room.RoomType;

import java.time.LocalDateTime;

public record RoomResponse(
        Long id,
        RoomType type,
        String topic,
        RoomStatus status,
        Long proUserId,
        Long conUserId,
        String proNickname,
        String conNickname,
        LocalDateTime createdAt,
        LocalDateTime endedAt
) {}
