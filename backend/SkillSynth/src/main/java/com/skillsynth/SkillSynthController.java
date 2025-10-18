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

    @GetMapping("/level/less-than/{level}")
    public List<User> getUserWithLevelLessThan(@PathVariable int level){
        return skillSynthService.getUsersWithLevelLessThan(level);
    }

    @GetMapping("/level/equal-to/{level}")
    public List<User> getUserWithLevelEqualTo(@PathVariable int level){
        return skillSynthService.getUsersWithLevelEqualTo(level);
    }





    @GetMapping
    public List<Skill> getAllSkills(){
        return skillSynthService.getAllSkills();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Skill> getSkillById(@PathVariable Long id) {
        Optional<Skill> skill = skillSynthService.getSkillById(id);
        return skill.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Skill> getSkillByName(@PathVariable String name) {
        Optional<Skill> skill = skillSynthService.getSkillByName(name);
        return skill.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<Skill> getSkillByDescription(@RequestParam String description) {
        Optional<Skill> skill = skillSynthService.getSkillByDescription(description);
        return skill.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Skill> searchSkillsByKeyword(@RequestParam String keyword) {
        return skillSynthService.getSkillsByKeyword(keyword);
    }





    @GetMapping
    public  List<Project> getAllProjects(){
        return skillSynthService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id){
        Optional<Project> project = skillSynthService.getProjectById(id);
        return project.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Project> getProjectByName(@PathVariable String name){
        Optional<Project> project = skillSynthService.getProjectByName(name);
        return project.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/level/greater-than/{level}")
    public List<Project> getProjectsLevelGreaterThan(@PathVariable int level) {
        return skillSynthService.getProjectsXPGreaterThan(level);
    }

    @GetMapping("/level/less-than/{level}")
    public List<Project> getProjectsLevelLessThan(@PathVariable int level) {
        return skillSynthService.getProjectsXPLessThan(level);
    }

    @GetMapping("/level/equal-to/{level}")
    public List<Project> getProjectsLevelEqualTo(@PathVariable int level) {
        return skillSynthService.getProjectsXPEqualTo(level);
    }



    /*
        POST HTTP REQUESTS || This code block contains all POST requests for the Web-App. Including Users, Skills, and Projects, etc
     */


    @PostMapping
    public User createUser(@RequestBody User user){
        return skillSynthService.createUser(user.getUsername(), user.getLevel(), user.getAllSkills());
    }

    @PostMapping
    public Skill createSkill(@RequestBody Skill skill) {
        return skillSynthService.createSkill(skill.getSkillName(), skill.getDescription());
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return skillSynthService.createProject(project.getName(), project.getRecommendedSkills(), project.getDateRange(), project.getProjectDescription(), project.getExperienceLevel());
    }


    /*
        PUT HTTP REQUESTS || This code block contains all PUT requests for the Web-App. Including Users, Skills, and Projects, etc
     */

    @PutMapping
    public User updateUser(@RequestBody User user){
        return skillSynthService.updateUser(user);
    }

    @PutMapping
    public Skill updateSkill(@RequestBody Skill skill) {
        return skillSynthService.updateSkill(skill);
    }

    @PutMapping
    public Project updateProject(@RequestBody Project project) {
        return skillSynthService.updateProject(project);
    }

    /*
        DELETE HTTP REQUESTS || This code block contains all DELETE requests for the Web-App. Including Users, Skills, and Projects, etc
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        boolean deleted = skillSynthService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        boolean deleted = skillSynthService.deleteSkill(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        boolean deleted = skillSynthService.deleteProject(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /*
        Patch HTTP REQUESTS || This code block contains all PATCH requests for the Web-App. Including Users, Skills, and Projects, etc
     */

    @PatchMapping("/{id}/level")
    public ResponseEntity<User> updateUserLevel(@PathVariable Long id, @RequestBody int newLevel) {
        Optional<User> updatedUser = skillSynthService.updateUserLevel(id, newLevel);
        return updatedUser.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }



}
