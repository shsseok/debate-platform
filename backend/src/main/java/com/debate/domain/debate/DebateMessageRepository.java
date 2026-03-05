package com.debate.domain.debate;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DebateMessageRepository extends JpaRepository<DebateMessage, Long> {

    List<DebateMessage> findByRoomIdOrderBySentAtAsc(Long roomId);

    List<DebateMessage> findByRoomIdAndRole(Long roomId, DebateMessage.DebateRole role);

    long countByRoomId(Long roomId);
}
