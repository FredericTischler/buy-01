package com.shop.user.service;

import com.shop.user.domain.User;
import com.shop.user.dto.SignupRequest;
import com.shop.user.dto.UpdateUserRequest;
import com.shop.user.exception.EmailAlreadyExistsException;
import com.shop.user.exception.UserNotFoundException;
import com.shop.user.repository.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;

    public User createUser(SignupRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            throw new EmailAlreadyExistsException(request.getEmail());
        });

        User user = User.builder()
                .id(new ObjectId())
                .email(request.getEmail().toLowerCase())
                .username(request.getUsername())
                .role(request.getRole())
                .passwordHash(passwordService.hashPassword(request.getPassword()))
                .avatarUrl(null)
                .build();

        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase());
    }

    public User getById(ObjectId id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public User getById(String id) {
        return getById(new ObjectId(id));
    }

    public User updateUser(ObjectId userId, UpdateUserRequest request) {
        User user = getById(userId);
        user.setUsername(request.getUsername());
        user.setAvatarUrl(request.getAvatarUrl());
        return userRepository.save(user);
    }
}
