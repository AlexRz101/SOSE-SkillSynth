package com.skillsynth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface SkillSynthUserRepository extends JpaRepository<User, Long> { //Handles CRUD between back and dbs

    // Optional: Custom query method examples
    Optional<User> findByUserName(String username);

    List<User> findByLevelGreaterThan(int level);

    // Custom query methods for Skills
    Optional<Skill> findBySkillName(String skillName);

    List<Skill> findBySkillNameContaining(String keyword);

}
