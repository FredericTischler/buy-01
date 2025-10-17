package com.shop.user.dto;

import com.shop.user.domain.Role;
import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserResponse {
    String id;
    String email;
    String username;
    Role role;
    String avatarUrl;
    Instant createdAt;
}
