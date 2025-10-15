package com.buy01.userservice.repository;

import com.buy01.userservice.model.Role;
import com.buy01.userservice.model.User;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByRole(Role role);
}
