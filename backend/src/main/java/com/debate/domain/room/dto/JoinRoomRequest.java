package com.debate.domain.room.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinRoomRequest(
        @NotBlank(message = "역할을 선택해주세요.")
        String role
) {}
