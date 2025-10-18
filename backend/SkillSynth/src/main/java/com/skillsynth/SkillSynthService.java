package com.skillsynth;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Optional;

@Service
public class SkillSynthService {

    @Autowired
    private SkillSynthRepository skillSynthRepository; // Injecting the repository

    // Creates a new User
    public User createUser(String username, int level) {
        User user = new User(username, level);
        return skillSynthRepository.save(user);
    }

    // Retrieves a User by ID
    public Optional<User> getUserById(Long id){
        return skillSynthRepository.findById(id);
    }

    // Retrieves a User by username
    public Optional<User> getUserByUsername(String username) {
        return skillSynthRepository.findBySkillName(username);
    }

    // Retrieves All Users
    public List<User> getAllUsers() {
        return skillSynthRepository.findAll();
    }

    public List<User> getUsersWithLevelGreaterThan(int level) {
        return skillSynthRepository.findByLevelGreaterThan(level);
    }

    // Update user
    public User updateUser(User user) {
        return skillSynthRepository.save(user); // Save will update if ID exists
    }

    // Update user level specifically
    public Optional<User> updateUserLevel(Long id, int newLevel) {
        Optional<User> userOptional = skillSynthRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setLevel(newLevel);
            return Optional.of(skillSynthRepository.save(user));
        }
        return Optional.empty();
    }

    // Delete user
    public boolean deleteUser(Long id) {
        if (skillSynthRepository.existsById(id)) {
            skillSynthRepository.deleteById(id);
            return true;
        }
        return false;
    }

}