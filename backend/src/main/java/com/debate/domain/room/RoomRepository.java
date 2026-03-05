package com.debate.domain.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByStatusOrderByCreatedAtDesc(RoomStatus status);

    List<Room> findAllByOrderByCreatedAtDesc();

    @Query("SELECT r FROM Room r WHERE r.status = :status AND r.type = :type ORDER BY r.createdAt DESC")
    List<Room> findByStatusAndType(@Param("status") RoomStatus status, @Param("type") RoomType type);

    long countByStatus(RoomStatus status);
}
