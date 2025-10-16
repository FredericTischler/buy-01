package com.buy01.userservice.service;

import com.buy01.userservice.dto.AuthenticationResponse;
import com.buy01.userservice.dto.LoginRequest;
import com.buy01.userservice.dto.RefreshTokenRequest;
import com.buy01.userservice.dto.RegisterRequest;
import com.buy01.userservice.dto.UpdateProfileRequest;
import com.buy01.userservice.dto.UserResponse;
import com.buy01.userservice.exception.ApiException;
import com.buy01.userservice.mapper.UserMapper;
import com.buy01.userservice.model.RefreshToken;
import com.buy01.userservice.model.Role;
import com.buy01.userservice.model.User;
import com.buy01.userservice.repository.RefreshTokenRepository;
import com.buy01.userservice.repository.UserRepository;
import com.buy01.userservice.security.JwtService;
import com.buy01.userservice.security.TokenPair;
import io.jsonwebtoken.Claims;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final MediaClient mediaClient;

    public UserService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserMapper userMapper,
            MediaClient mediaClient) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
        this.mediaClient = mediaClient;
    }

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already in use");
        }
        if (request.getRole() == Role.SELLER && request.getAvatarMediaId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Seller must provide an avatar image");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setAvatarMediaId(request.getAvatarMediaId());

        User saved = userRepository.save(user);
        if (saved.getRole() == Role.SELLER && saved.getAvatarMediaId() != null) {
            mediaClient.assertMediaOwnership(saved.getAvatarMediaId(), saved.getId());
        }
        TokenPair tokenPair = jwtService.generateTokenPair(saved);
        persistRefreshToken(saved.getId(), tokenPair.refreshToken());
        return new AuthenticationResponse(tokenPair.accessToken(), tokenPair.refreshToken(), userMapper.toResponse(saved));
    }

    public AuthenticationResponse login(LoginRequest request) {
        User user = userRepository
                .findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        TokenPair tokenPair = jwtService.generateTokenPair(user);
        refreshTokenRepository.deleteByUserId(user.getId());
        persistRefreshToken(user.getId(), tokenPair.refreshToken());
        return new AuthenticationResponse(tokenPair.accessToken(), tokenPair.refreshToken(), userMapper.toResponse(user));
    }

    public void logout(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        Claims claims = parseAndValidateRefreshToken(request.getRefreshToken());
        String userId = claims.getSubject();
        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token revoked"));
        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.deleteById(refreshToken.getId());
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        TokenPair tokenPair = jwtService.generateTokenPair(user);
        refreshTokenRepository.deleteByUserId(userId);
        persistRefreshToken(userId, tokenPair.refreshToken());
        return new AuthenticationResponse(tokenPair.accessToken(), tokenPair.refreshToken(), userMapper.toResponse(user));
    }

    public UserResponse getCurrentUser(String userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return userMapper.toResponse(user);
    }

    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        if (user.getRole() == Role.SELLER) {
            user.setAvatarMediaId(request.getAvatarMediaId());
            if (request.getAvatarMediaId() != null) {
                mediaClient.assertMediaOwnership(request.getAvatarMediaId(), userId);
            }
        } else if (request.getAvatarMediaId() != null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Clients cannot set an avatar");
        }
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    private void persistRefreshToken(String userId, String refreshTokenValue) {
        Claims claims = parseAndValidateRefreshToken(refreshTokenValue);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUserId(userId);
        refreshToken.setExpiresAt(claims.getExpiration().toInstant());
        refreshToken.setCreatedAt(Instant.now());
        refreshTokenRepository.save(refreshToken);
    }

    private Claims parseAndValidateRefreshToken(String token) {
        if (!jwtService.isTokenValid(token)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        return jwtService.parseToken(token);
    }
}
