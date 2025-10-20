package com.skillsynth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface SkillSynthAppUserRepository extends JpaRepository<AppUser, Long> { //Handles CRUD between back and dbs

    // Optional: Custom query method examples
    Optional<AppUser> findByUsername(String username);

    List<AppUser> findByLevelGreaterThan(int level);

}
