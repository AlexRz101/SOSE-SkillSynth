package com.skillsynth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface SkillSynthSkillRepository extends JpaRepository<Skill,Long> {

    // Custom query methods for Skills
    Optional<Skill> findBySkillName(String skillName);

    List<Skill> findBySkillNameContaining(String keyword);

    Optional<Skill> findByDescription(String description);

}
