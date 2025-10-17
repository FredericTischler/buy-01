package com.shop.user.controller;

import com.shop.user.domain.User;
import com.shop.user.dto.UpdateUserRequest;
import com.shop.user.dto.UserResponse;
import com.shop.user.mapper.UserMapper;
import com.shop.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        User storedUser = userService.getById(currentUser.getId());
        return ResponseEntity.ok(userMapper.toUserResponse(storedUser));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @AuthenticationPrincipal User currentUser, @Valid @RequestBody UpdateUserRequest request) {
        User updated = userService.updateUser(currentUser.getId(), request);
        return ResponseEntity.ok(userMapper.toUserResponse(updated));
    }
}
