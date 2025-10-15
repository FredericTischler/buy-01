package com.buy01.mediaservice.service;

import com.buy01.mediaservice.dto.MediaBatchVerificationRequest;
import com.buy01.mediaservice.dto.MediaUploadResponse;
import com.buy01.mediaservice.dto.SecureMediaResponse;
import com.buy01.mediaservice.dto.SignedUrlResponse;
import com.buy01.mediaservice.exception.ApiException;
import com.buy01.mediaservice.model.MediaDocument;
import com.buy01.mediaservice.repository.MediaRepository;
import com.buy01.mediaservice.util.ImageValidator;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;
    private final ImageValidator imageValidator;
    private final StorageService storageService;
    private final StorageProperties storageProperties;

    public MediaService(
            MediaRepository mediaRepository,
            ImageValidator imageValidator,
            StorageService storageService,
            StorageProperties storageProperties) {
        this.mediaRepository = mediaRepository;
        this.imageValidator = imageValidator;
        this.storageService = storageService;
        this.storageProperties = storageProperties;
    }

    public MediaUploadResponse upload(String ownerId, MultipartFile file) {
        imageValidator.validate(file);
        StorageService.StoredMedia stored = storageService.save(ownerId, file);
        MediaDocument document = new MediaDocument();
        document.setOwnerId(ownerId);
        document.setOriginalFilename(Objects.requireNonNullElse(file.getOriginalFilename(), "upload"));
        document.setStorageFilename(stored.storageFilename());
        document.setContentType(Objects.requireNonNull(file.getContentType()));
        document.setSize(file.getSize());
        document.setChecksum(stored.checksum());
        MediaDocument saved = mediaRepository.save(document);
        SignedUrlResponse signedUrl = storageService.generateSignedUrl(saved);
        return new MediaUploadResponse(saved.getId(), signedUrl.getUrl(), saved.getOriginalFilename(), saved.getSize(), saved.getContentType());
    }

    public MediaDocument verifyOwnership(String mediaId, String ownerId) {
        return mediaRepository
                .findByIdAndOwnerId(mediaId, ownerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Media not found for owner"));
    }

    public List<SecureMediaResponse> verifyBatch(MediaBatchVerificationRequest request) {
        List<MediaDocument> documents = mediaRepository.findByIdInAndOwnerId(request.getMediaIds(), request.getOwnerId());
        if (documents.size() != request.getMediaIds().size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "One or more media items are invalid or not owned by user");
        }
        return documents.stream()
                .map(doc -> {
                    SignedUrlResponse signed = storageService.generateSignedUrl(doc);
                    return new SecureMediaResponse(doc.getId(), signed.getUrl());
                })
                .toList();
    }

    public SignedUrlResponse refreshSignedUrl(String mediaId, String ownerId) {
        MediaDocument media = verifyOwnership(mediaId, ownerId);
        return storageService.generateSignedUrl(media);
    }

    public MediaResource loadForPublicAccess(String mediaId, String token, long expires) {
        if (!StringUtils.hasText(token) || !storageService.isValidToken(mediaId, token, expires)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid or expired token");
        }
        MediaDocument doc = mediaRepository
                .findById(mediaId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Media not found"));
        return new MediaResource(storageService.load(doc.getStorageFilename()), doc.getContentType());
    }

    public void validateInternalSecret(String providedSecret) {
        if (providedSecret == null || !providedSecret.equals(storageProperties.getInternalServiceSecret())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Missing or invalid service secret");
        }
    }

    public record MediaResource(org.springframework.core.io.Resource resource, String contentType) {}
}
