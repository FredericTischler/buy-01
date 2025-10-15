package com.buy01.mediaservice.util;

import com.buy01.mediaservice.exception.ApiException;
import com.buy01.mediaservice.service.StorageProperties;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import org.apache.commons.io.FilenameUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ImageValidator {

    private static final Map<String, byte[]> MAGIC_NUMBERS = Map.of(
            "image/png", new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47},
            "image/jpeg", new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF});

    private final StorageProperties properties;

    public ImageValidator(StorageProperties properties) {
        this.properties = properties;
    }

    public void validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File exceeds 2 MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !MAGIC_NUMBERS.containsKey(contentType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported image type");
        }
        try (InputStream in = file.getInputStream()) {
            byte[] expectedMagic = MAGIC_NUMBERS.get(contentType);
            byte[] actual = in.readNBytes(expectedMagic.length);
            if (!matches(actual, expectedMagic)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "File signature does not match content type");
            }
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Failed to read uploaded file");
        }
        String extension = FilenameUtils.getExtension(file.getOriginalFilename());
        if (extension == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File extension required");
        }
        if (contentType.equals(MediaType.IMAGE_JPEG_VALUE) && !extension.matches("(?i)jpe?g")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "JPEG files must have .jpg or .jpeg extension");
        }
        if (contentType.equals(MediaType.IMAGE_PNG_VALUE) && !extension.equalsIgnoreCase("png")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PNG files must have .png extension");
        }
    }

    private boolean matches(byte[] actual, byte[] expected) {
        if (actual.length < expected.length) {
            return false;
        }
        for (int i = 0; i < expected.length; i++) {
            if (actual[i] != expected[i]) {
                return false;
            }
        }
        return true;
    }
}
