package com.buy01.userservice.controller;

import com.buy01.userservice.dto.AuthenticationResponse;
import com.buy01.userservice.dto.RegisterRequest;
import com.buy01.userservice.dto.UpdateProfileRequest;
import com.buy01.userservice.dto.UserResponse;
import com.buy01.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthenticationResponse register(@RequestBody @Valid RegisterRequest request) {
        return userService.register(request);
    }

    @GetMapping("/me")
    public UserResponse currentUser(Authentication authentication) {
        return userService.getCurrentUser((String) authentication.getPrincipal());
    }

    @PutMapping("/me")
    public UserResponse updateProfile(@RequestBody @Valid UpdateProfileRequest request, Authentication authentication) {
        return userService.updateProfile((String) authentication.getPrincipal(), request);
    }
}
