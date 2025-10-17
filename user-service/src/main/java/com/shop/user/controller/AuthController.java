package com.shop.user.controller;

import com.shop.user.domain.User;
import com.shop.user.dto.AuthResponse;
import com.shop.user.dto.LoginRequest;
import com.shop.user.dto.SignupRequest;
import com.shop.user.exception.InvalidCredentialsException;
import com.shop.user.mapper.UserMapper;
import com.shop.user.service.JwtService;
import com.shop.user.service.PasswordService;
import com.shop.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PasswordService passwordService;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        User user = userService.createUser(request);
        String token = jwtService.generateToken(user.getId().toHexString(), user.getRole());
        AuthResponse response = AuthResponse.builder()
                .token(token)
                .user(userMapper.toUserResponse(user))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordService.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user.getId().toHexString(), user.getRole());
        AuthResponse response = AuthResponse.builder()
                .token(token)
                .user(userMapper.toUserResponse(user))
                .build();
        return ResponseEntity.ok(response);
    }
}
