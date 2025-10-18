package com.skillsynth;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String skillName;
    private String description;

    // Constructors
    public Skill() {}

    public Skill(String skillName, String description) {
        this.skillName = skillName;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public String getSkillName() {return skillName;}
    public void setSkillName(String skillName) {this.skillName = skillName;}

    public String getDescription() {return description;}
    public void setDescription(String description) {this.description = description;}
}
