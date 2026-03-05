package com.debate.domain.vote;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DebateResultRepository extends JpaRepository<DebateResult, Long> {

    Optional<DebateResult> findByRoomId(Long roomId);

    boolean existsByRoomId(Long roomId);
}
