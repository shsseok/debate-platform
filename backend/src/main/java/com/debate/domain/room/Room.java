package com.debate.domain.room;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RoomType type;

    @Column(length = 200)
    private String topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private RoomStatus status = RoomStatus.WAITING;

    @Column(name = "pro_user_id")
    private Long proUserId;

    @Column(name = "con_user_id")
    private Long conUserId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime endedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void assignPro(Long userId) {
        this.proUserId = userId;
    }

    public void assignCon(Long userId) {
        this.conUserId = userId;
    }

    public void activate() {
        this.status = RoomStatus.ACTIVE;
    }

    public void end() {
        this.status = RoomStatus.ENDED;
        this.endedAt = LocalDateTime.now();
    }
}
