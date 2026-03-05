package com.debate.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndProvider(String email, User.AuthProvider provider);

    boolean existsByEmail(String email);
}
