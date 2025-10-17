package com.shop.user.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.shop.user.domain.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService("test-secret-value", 3_600_000L);
    }

    @Test
    void issueTokenShouldEncodeUserIdAndRole() {
        String userId = "6638ad6d0df7a95e7c2a1234";
        Role role = Role.CLIENT;

        String token = jwtService.issueToken(userId, role);

        assertThat(token).isNotBlank();
        assertThat(jwtService.isTokenValid(token, userId)).isTrue();
        assertThat(jwtService.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtService.extractRole(token)).isEqualTo(role);
        assertThat(jwtService.parseToken(token).getIssuedAt()).isNotNull();
    }

    @Test
    void isTokenValidShouldReturnFalseWhenUserIdDiffers() {
        String token = jwtService.issueToken("6638ad6d0df7a95e7c2a1234", Role.SELLER);

        assertThat(jwtService.isTokenValid(token, "anotherUserId")).isFalse();
    }
}
