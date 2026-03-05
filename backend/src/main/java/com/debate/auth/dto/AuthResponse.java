package com.debate.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private Long userId;
    private String email;
    private String nickname;

    public static AuthResponse of(String token, Long userId, String email, String nickname) {
        return new AuthResponse(token, "Bearer", userId, email, nickname);
    }
}
