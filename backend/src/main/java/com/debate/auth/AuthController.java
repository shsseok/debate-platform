package com.debate.auth;

import com.debate.auth.dto.AuthResponse;
import com.debate.config.JwtProvider;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtProvider jwtProvider;

    /**
     * 현재 로그인된 사용자 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal String userId,
                                            @RequestHeader("Authorization") String bearer) {
        String token = bearer.substring(7);
        Claims claims = jwtProvider.parseToken(token);

        return ResponseEntity.ok(AuthResponse.of(
                token,
                Long.parseLong(claims.getSubject()),
                claims.get("email", String.class),
                claims.get("nickname", String.class)
        ));
    }

    /**
     * 로그아웃 (클라이언트 측 토큰 삭제 안내)
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}
