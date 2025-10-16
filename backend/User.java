import java.util.ArrayList;

public class User{

    private String name;

    private String id;

    private String availability;

    private ArrayList<Skill> skills;

    private int totalXP;

    public User(){

    }

    public User(String name, String id, String availability, ArrayList<Skill> skills, int xp){
        this.name = name;
        this.id = id;
        this.availability = availability;
        this.skills = skills;
        this.totalXP = xp;
    }

    public void addSkill(Skill skill)
    {

    }

    public void removeSkill(Skill skill)
    {

    }

    public void addXP(int xp, Skill skill)
    {

    }

    public int getSkillXP(Skill skill)
    {
        return -1;
    }

    public int matchSkills(ArrayList<Skill> requiredSkills)
    {
        return -1;
    }
}