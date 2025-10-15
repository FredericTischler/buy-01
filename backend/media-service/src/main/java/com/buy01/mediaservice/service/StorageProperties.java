package com.buy01.mediaservice.service;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "media.storage")
public class StorageProperties {

    private String location = "./media-storage";
    private String signingSecret = "media-signing-secret-change-me";
    private long signedUrlTtlSeconds = 900;
    private String internalServiceSecret = "internal-secret-change-me";
    private long maxFileSizeBytes = 2097152;

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSigningSecret() {
        return signingSecret;
    }

    public void setSigningSecret(String signingSecret) {
        this.signingSecret = signingSecret;
    }

    public long getSignedUrlTtlSeconds() {
        return signedUrlTtlSeconds;
    }

    public void setSignedUrlTtlSeconds(long signedUrlTtlSeconds) {
        this.signedUrlTtlSeconds = signedUrlTtlSeconds;
    }

    public String getInternalServiceSecret() {
        return internalServiceSecret;
    }

    public void setInternalServiceSecret(String internalServiceSecret) {
        this.internalServiceSecret = internalServiceSecret;
    }

    public long getMaxFileSizeBytes() {
        return maxFileSizeBytes;
    }

    public void setMaxFileSizeBytes(long maxFileSizeBytes) {
        this.maxFileSizeBytes = maxFileSizeBytes;
    }
}
