package com.buy01.mediaservice;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class MediaControllerIntegrationTests {

    @Container
    private static final MongoDBContainer MONGO = new MongoDBContainer("mongo:6.0.6");

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", MONGO::getReplicaSetUrl);
        registry.add("media.storage.location", () -> "./build/test-media");
        registry.add("media.storage.internal-service-secret", () -> "test-secret");
        registry.add("media.storage.signing-secret", () -> "media-sign-secret-media-sign-secret-1234");
        registry.add("security.jwt.secret", () -> "jwt-secret-should-be-long-and-secure-1234567890abcd");
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "seller-1", roles = "SELLER")
    void uploadsValidPngUnder2Mb() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", DummyImages.onePixelPng());
        mockMvc
                .perform(multipart("/api/media/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mediaId").exists())
                .andExpect(jsonPath("$.secureUrl").exists());
    }

    @Test
    @WithMockUser(username = "seller-1", roles = "SELLER")
    void rejectsOversizedUpload() throws Exception {
        byte[] largeBytes = new byte[2_100_000];
        MockMultipartFile file = new MockMultipartFile("file", "big.jpg", "image/jpeg", largeBytes);
        mockMvc
                .perform(multipart("/api/media/upload").file(file))
                .andExpect(status().isBadRequest());
    }

    static class DummyImages {
        static byte[] onePixelPng() {
            return new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
                0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                0x08, 0x02, 0x00, 0x00, 0x00, (byte) 0x90, 0x77, 0x53,
                (byte) 0xDE, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
                0x54, 0x78, (byte) 0xDA, 0x63, 0x60, 0x00, 0x00, 0x00,
                0x02, 0x00, 0x01, 0x5D, (byte) 0xC1, 0x02, (byte) 0x7F,
                0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
                (byte) 0xAE, 0x42, 0x60, (byte) 0x82};
        }
    }
}
