package com.buy01.userservice.controller;

import com.buy01.userservice.dto.AuthenticationResponse;
import com.buy01.userservice.dto.LoginRequest;
import com.buy01.userservice.dto.RefreshTokenRequest;
import com.buy01.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public AuthenticationResponse login(@RequestBody @Valid LoginRequest request) {
        return userService.login(request);
    }

    @PostMapping("/refresh")
    @ResponseStatus(HttpStatus.OK)
    public AuthenticationResponse refresh(@RequestBody @Valid RefreshTokenRequest request) {
        return userService.refreshToken(request);
    }
}
