package com.buy01.mediaservice.service;

import com.buy01.mediaservice.dto.SignedUrlResponse;
import com.buy01.mediaservice.exception.ApiException;
import com.buy01.mediaservice.model.MediaDocument;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.io.FilenameUtils;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StorageService {

    private final StorageProperties properties;

    public StorageService(StorageProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(Path.of(properties.getLocation()));
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to create storage directory", ex);
        }
    }

    public StoredMedia save(String ownerId, MultipartFile file) {
        String extension = FilenameUtils.getExtension(file.getOriginalFilename());
        String storageName = ownerId + "/" + UUID.randomUUID() + "." + extension.toLowerCase();
        Path target = Path.of(properties.getLocation()).resolve(storageName);
        try {
            Files.createDirectories(target.getParent());
            byte[] bytes = file.getBytes();
            Files.write(target, bytes);
            String checksum = calculateChecksum(bytes);
            return new StoredMedia(storageName, checksum);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");
        }
    }

    public Resource load(String storageFilename) {
        try {
            Path path = Path.of(properties.getLocation()).resolve(storageFilename);
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists()) {
                throw new ApiException(HttpStatus.NOT_FOUND, "File not found");
            }
            return resource;
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to load file");
        }
    }

    public SignedUrlResponse generateSignedUrl(MediaDocument media) {
        long expiresAt = Instant.now().plusSeconds(properties.getSignedUrlTtlSeconds()).getEpochSecond();
        String token = sign(media.getId(), expiresAt);
        String url = "/api/media/view/" + media.getId() + "?token=" + token + "&expires=" + expiresAt;
        return new SignedUrlResponse(url, expiresAt);
    }

    public boolean isValidToken(String mediaId, String token, long expiresAtEpoch) {
        if (Instant.now().isAfter(Instant.ofEpochSecond(expiresAtEpoch))) {
            return false;
        }
        try {
            String expected = sign(mediaId, expiresAtEpoch);
            byte[] expectedBytes = Base64.getUrlDecoder().decode(expected);
            byte[] providedBytes = Base64.getUrlDecoder().decode(token);
            return MessageDigest.isEqual(expectedBytes, providedBytes);
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private String sign(String mediaId, long expiresAt) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.getSigningSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] signature = mac.doFinal((mediaId + ":" + expiresAt).getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign token", ex);
        }
    }

    private String calculateChecksum(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] checksum = digest.digest(data);
            return Base64.getEncoder().encodeToString(checksum);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }

    public record StoredMedia(String storageFilename, String checksum) {}
}
