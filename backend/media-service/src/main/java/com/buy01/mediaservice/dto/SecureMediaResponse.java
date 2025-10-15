package com.buy01.mediaservice.dto;

public class SecureMediaResponse {

    private String mediaId;
    private String secureUrl;

    public SecureMediaResponse(String mediaId, String secureUrl) {
        this.mediaId = mediaId;
        this.secureUrl = secureUrl;
    }

    public String getMediaId() {
        return mediaId;
    }

    public void setMediaId(String mediaId) {
        this.mediaId = mediaId;
    }

    public String getSecureUrl() {
        return secureUrl;
    }

    public void setSecureUrl(String secureUrl) {
        this.secureUrl = secureUrl;
    }
}
