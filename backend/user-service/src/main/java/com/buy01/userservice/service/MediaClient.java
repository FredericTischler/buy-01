package com.buy01.userservice.service;

import com.buy01.userservice.exception.ApiException;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class MediaClient {

    private static final Logger log = LoggerFactory.getLogger(MediaClient.class);
    private final WebClient webClient;
    private final MediaClientProperties properties;

    public MediaClient(MediaClientProperties properties, WebClient.Builder builder) {
        this.properties = properties;
        this.webClient = builder.build();
    }

    public void assertMediaOwnership(String mediaId, String userId) {
        if (!properties.isEnabled() || !StringUtils.hasText(mediaId)) {
            return;
        }
        try {
            webClient
                    .get()
                    .uri(properties.getBaseUrl() + "/api/media/internal/validate?mediaId=" + mediaId + "&ownerId=" + userId)
                    .header("X-Service-Secret", properties.getInternalSecret())
                    .retrieve()
                    .toBodilessEntity()
                    .block(Duration.ofSeconds(5));
        } catch (WebClientResponseException.NotFound ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Media not found or not owned by user");
        } catch (WebClientResponseException ex) {
            log.error("Media validation failed: {}", ex.getResponseBodyAsString());
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unable to validate media ownership");
        }
    }
}
