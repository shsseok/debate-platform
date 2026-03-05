package com.debate.domain.vote;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface VoteRecordRepository extends JpaRepository<VoteRecord, Long> {

    List<VoteRecord> findByRoomIdOrderByRecordedAtDesc(Long roomId);

    Optional<VoteRecord> findByRoomIdAndSpectatorId(Long roomId, Long spectatorId);

    @Query("SELECT AVG(v.value) FROM VoteRecord v WHERE v.roomId = :roomId")
    Optional<Double> findAverageValueByRoomId(@Param("roomId") Long roomId);

    long countByRoomId(Long roomId);
}
