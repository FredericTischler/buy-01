package com.shop.user.mapper;

import com.shop.user.domain.User;
import com.shop.user.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId() != null ? user.getId().toHexString() : null)
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
