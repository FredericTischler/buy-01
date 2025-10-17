package com.shop.user.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class PasswordServiceTest {

    private PasswordService passwordService;

    @BeforeEach
    void setUp() {
        PasswordEncoder encoder = new BCryptPasswordEncoder(10);
        passwordService = new PasswordService(encoder);
    }

    @Test
    void hashPasswordShouldReturnDifferentValueThanRaw() {
        String rawPassword = "StrongP@ssw0rd";

        String hash = passwordService.hashPassword(rawPassword);

        assertThat(hash).isNotEqualTo(rawPassword);
        assertThat(hash).isNotBlank();
    }

    @Test
    void matchesShouldValidatePassword() {
        String rawPassword = "StrongP@ssw0rd";
        String hash = passwordService.hashPassword(rawPassword);

        assertThat(passwordService.matches(rawPassword, hash)).isTrue();
        assertThat(passwordService.matches("WrongPassword1!", hash)).isFalse();
    }
}
