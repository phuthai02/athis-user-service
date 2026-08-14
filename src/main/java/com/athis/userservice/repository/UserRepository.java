package com.athis.userservice.repository;

import com.athis.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByAccountId(Long accountId);
    boolean existsByAccountId(Long accountId);
}
