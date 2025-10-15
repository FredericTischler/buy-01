package com.buy01.userservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.buy01.userservice.dto.LoginRequest;
import com.buy01.userservice.dto.RegisterRequest;
import com.buy01.userservice.dto.UpdateProfileRequest;
import com.buy01.userservice.exception.ApiException;
import com.buy01.userservice.model.Role;
import com.buy01.userservice.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class UserServiceIntegrationTests {

    @Container
    private static final MongoDBContainer MONGO = new MongoDBContainer("mongo:6.0.6");

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", MONGO::getReplicaSetUrl);
        registry.add("media.service.enabled", () -> "false");
    }

    @Autowired
    private UserService userService;

    private RegisterRequest sellerRequest;

    @BeforeEach
    void setup() {
        sellerRequest = new RegisterRequest();
        sellerRequest.setEmail("seller@example.com");
        sellerRequest.setPassword("Secret123!");
        sellerRequest.setFirstName("Ada");
        sellerRequest.setLastName("Lovelace");
        sellerRequest.setRole(Role.CLIENT);
    }

    @Test
    void registerAndLoginClient() {
        var authResponse = userService.register(sellerRequest);
        assertThat(authResponse.getUser().getId()).isNotNull();
        assertThat(authResponse.getAccessToken()).isNotBlank();

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("seller@example.com");
        loginRequest.setPassword("Secret123!");
        var loginResponse = userService.login(loginRequest);
        assertThat(loginResponse.getAccessToken()).isNotBlank();
        assertThat(loginResponse.getUser().getEmail()).isEqualTo("seller@example.com");
    }

    @Test
    void loginWithWrongPasswordFails() {
        userService.register(sellerRequest);
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("seller@example.com");
        loginRequest.setPassword("wrong");
        assertThrows(ApiException.class, () -> userService.login(loginRequest));
    }
}
