package com.debate.domain.room.dto;

public record JoinRoomResponse(
        Long roomId,
        String role,
        String message
) {}
