package com.buy01.productservice.service;

import com.buy01.productservice.exception.ApiException;
import com.buy01.productservice.model.ProductMedia;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class MediaClient {

    private static final Logger log = LoggerFactory.getLogger(MediaClient.class);

    private final WebClient webClient;
    private final MediaClientProperties properties;

    public MediaClient(WebClient.Builder builder, MediaClientProperties properties) {
        this.webClient = builder.build();
        this.properties = properties;
    }

    public List<ProductMedia> fetchProductMedia(List<String> mediaIds, String sellerId) {
        if (!properties.isEnabled() || CollectionUtils.isEmpty(mediaIds)) {
            return Collections.emptyList();
        }
        try {
            MediaVerificationRequest request = new MediaVerificationRequest(mediaIds, sellerId);
            MediaDescriptor[] descriptors = webClient
                    .post()
                    .uri(properties.getBaseUrl() + "/api/media/internal/verify-batch")
                    .header("X-Service-Secret", properties.getInternalSecret())
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(MediaDescriptor[].class)
                    .block(Duration.ofSeconds(5));
            if (descriptors == null) {
                return Collections.emptyList();
            }
            return java.util.Arrays.stream(descriptors)
                    .map(descriptor -> new ProductMedia(descriptor.mediaId(), descriptor.secureUrl()))
                    .toList();
        } catch (WebClientResponseException ex) {
            log.error("Media verification failed: {}", ex.getResponseBodyAsString());
            if (ex.getStatusCode().is4xxClientError()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid media selection");
            }
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Media service unavailable");
        }
    }

    public record MediaDescriptor(String mediaId, String secureUrl) {}

    public record MediaVerificationRequest(List<String> mediaIds, String ownerId) {}
}
