package com.buy01.userservice.repository;

import com.buy01.userservice.model.RefreshToken;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUserId(String userId);

    long deleteByExpiresAtBefore(Instant deadline);
}
