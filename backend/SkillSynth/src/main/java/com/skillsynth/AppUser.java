package com.skillsynth;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class AppUser { //Java's interpretation of databases

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;   // Replaces skillName
    private int level; // User's overall level

    @ManyToMany
    @JoinTable(
            name = "user_skills",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private List<Skill>  skills; // List of skills associated with the user

    // Constructors
    public AppUser() {}

    public AppUser(String username, int level, List<Skill> skills) {
        this.username = username;
        this.level = level;
        this.skills = skills;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public List<Skill> getAllSkills() { return skills; }

    public Skill getSpecificSkill(int index) {
        if(index < skills.size()){
            return skills.get(index);
        } else {
            return null;
        }
    }

    public void setSpecificSkill(int index, Skill skill) {
        if(index < skills.size()){
            skills.set(index, skill);
        }
    }

    public void addSkill(Skill skill) {
        skills.add(skill);
    }




}
