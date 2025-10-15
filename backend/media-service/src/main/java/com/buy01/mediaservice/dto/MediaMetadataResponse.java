package com.buy01.mediaservice.dto;

public class MediaMetadataResponse {

    private String mediaId;
    private String contentType;
    private long size;

    public MediaMetadataResponse(String mediaId, String contentType, long size) {
        this.mediaId = mediaId;
        this.contentType = contentType;
        this.size = size;
    }

    public String getMediaId() {
        return mediaId;
    }

    public void setMediaId(String mediaId) {
        this.mediaId = mediaId;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }
}
