package com.skillsynth;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class User { //Java's interpretation of databases

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;   // Replaces skillName
    private int level;         // User's overall level

    // Constructors
    public User() {}

    public User(String username, int level) {
        this.username = username;
        this.level = level;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
}
