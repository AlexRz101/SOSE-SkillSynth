package com.skillsynth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/users")
public class SkillSynthController { //Handles requests

    @Autowired
    private SkillSynthService skillSynthService;

    /*
        GET HTTP REQUESTS || This code block contains all GET requests for the Web-App. Including Users, Skills, and Projects, etc
     */

    @GetMapping
    public List<User> getAllUsers(){
        return skillSynthService.getAllUsers();
    }


    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id){
        Optional<User> user = skillSynthService.getUserById(id);

    return user.map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username){
        Optional<User> user = skillSynthService.getUserByUsername(username);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/level/greater-than/{level}")
    public List<User> getUserWithLevelGreaterThan(@PathVariable int level){
        return skillSynthService.getUsersWithLevelGreaterThan(level);
    }

    /*
        POST HTTP REQUESTS || This code block contains all POST requests for the Web-App. Including Users, Skills, and Projects, etc
     */





















}
