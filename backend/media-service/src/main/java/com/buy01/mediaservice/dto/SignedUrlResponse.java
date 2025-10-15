package com.buy01.mediaservice.dto;

public class SignedUrlResponse {

    private String url;
    private long expiresAt;

    public SignedUrlResponse(String url, long expiresAt) {
        this.url = url;
        this.expiresAt = expiresAt;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public long getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(long expiresAt) {
        this.expiresAt = expiresAt;
    }
}
