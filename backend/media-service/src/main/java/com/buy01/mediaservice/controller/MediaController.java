package com.buy01.mediaservice.controller;

import com.buy01.mediaservice.dto.MediaBatchVerificationRequest;
import com.buy01.mediaservice.dto.MediaUploadResponse;
import com.buy01.mediaservice.dto.MediaMetadataResponse;
import com.buy01.mediaservice.dto.SecureMediaResponse;
import com.buy01.mediaservice.dto.SignedUrlResponse;
import com.buy01.mediaservice.model.MediaDocument;
import com.buy01.mediaservice.service.MediaService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER')")
    public MediaUploadResponse upload(@RequestParam("file") MultipartFile file, Principal principal) {
        return mediaService.upload(principal.getName(), file);
    }

    @GetMapping("/{mediaId}/signed-url")
    @PreAuthorize("hasRole('SELLER')")
    public SignedUrlResponse refreshSignedUrl(@PathVariable String mediaId, Principal principal) {
        return mediaService.refreshSignedUrl(mediaId, principal.getName());
    }

    @PostMapping("/internal/verify-batch")
    public List<SecureMediaResponse> verifyBatch(
            @RequestHeader(value = "X-Service-Secret", required = false) String secret,
            @Valid @org.springframework.web.bind.annotation.RequestBody MediaBatchVerificationRequest request) {
        mediaService.validateInternalSecret(secret);
        return mediaService.verifyBatch(request);
    }

    @GetMapping("/internal/validate")
    public MediaMetadataResponse validateSingle(
            @RequestHeader(value = "X-Service-Secret", required = false) String secret,
            @RequestParam String mediaId,
            @RequestParam String ownerId) {
        mediaService.validateInternalSecret(secret);
        MediaDocument document = mediaService.verifyOwnership(mediaId, ownerId);
        return new MediaMetadataResponse(document.getId(), document.getContentType(), document.getSize());
    }

    @GetMapping("/view/{mediaId}")
    public ResponseEntity<org.springframework.core.io.Resource> viewMedia(
            @PathVariable String mediaId, @RequestParam String token, @RequestParam long expires) {
        var mediaResource = mediaService.loadForPublicAccess(mediaId, token, expires);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=31536000")
                .contentType(MediaType.parseMediaType(mediaResource.contentType()))
                .body(mediaResource.resource());
    }
}
