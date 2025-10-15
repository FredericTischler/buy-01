package com.buy01.mediaservice.model;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "media")
public class MediaDocument {

    @Id
    private String id;

    @Indexed
    private String ownerId;

    private String originalFilename;
    private String storageFilename;
    private String contentType;
    private long size;
    private String checksum;

    private Set<String> linkedProductIds = new HashSet<>();

    @CreatedDate
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getStorageFilename() {
        return storageFilename;
    }

    public void setStorageFilename(String storageFilename) {
        this.storageFilename = storageFilename;
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

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public Set<String> getLinkedProductIds() {
        return linkedProductIds;
    }

    public void setLinkedProductIds(Set<String> linkedProductIds) {
        this.linkedProductIds = linkedProductIds;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
