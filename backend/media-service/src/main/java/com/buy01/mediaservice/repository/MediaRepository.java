package com.buy01.mediaservice.repository;

import com.buy01.mediaservice.model.MediaDocument;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MediaRepository extends MongoRepository<MediaDocument, String> {

    Optional<MediaDocument> findByIdAndOwnerId(String id, String ownerId);

    List<MediaDocument> findByIdInAndOwnerId(Collection<String> ids, String ownerId);
}
