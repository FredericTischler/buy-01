package com.buy01.mediaservice.dto;

public class MediaUploadResponse {

    private String mediaId;
    private String secureUrl;
    private String originalFilename;
    private long size;
    private String contentType;

    public MediaUploadResponse(String mediaId, String secureUrl, String originalFilename, long size, String contentType) {
        this.mediaId = mediaId;
        this.secureUrl = secureUrl;
        this.originalFilename = originalFilename;
        this.size = size;
        this.contentType = contentType;
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

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
}
