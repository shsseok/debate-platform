package com.debate.domain.room;

import com.debate.domain.room.dto.JoinRoomRequest;
import com.debate.domain.room.dto.JoinRoomResponse;
import com.debate.domain.room.dto.RoomCreateRequest;
import com.debate.domain.room.dto.RoomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public List<RoomResponse> getRooms() {
        return roomService.getRooms();
    }

    @GetMapping("/{roomId}")
    public RoomResponse getRoom(@PathVariable Long roomId) {
        return roomService.getRoom(roomId);
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @RequestBody @Valid RoomCreateRequest request,
            @AuthenticationPrincipal String userId) {
        RoomResponse room = roomService.createRoom(Long.parseLong(userId), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    @PostMapping("/{roomId}/join")
    public JoinRoomResponse joinRoom(
            @PathVariable Long roomId,
            @RequestBody @Valid JoinRoomRequest request,
            @AuthenticationPrincipal String userId) {
        Long uid = (userId != null) ? Long.parseLong(userId) : null;
        return roomService.joinRoom(roomId, uid, request);
    }

    @PostMapping("/{roomId}/end")
    public RoomResponse endRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal String userId) {
        return roomService.endRoom(roomId, Long.parseLong(userId));
    }
}
