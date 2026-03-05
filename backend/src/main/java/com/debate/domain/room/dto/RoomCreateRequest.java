package com.debate.domain.room.dto;

import com.debate.domain.room.RoomType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RoomCreateRequest(
        @NotNull(message = "방 타입을 선택해주세요.")
        RoomType type,

        @Size(max = 200, message = "주제는 200자 이하로 입력해주세요.")
        String topic
) {}
