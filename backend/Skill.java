public class Skill {

    private String name;

    private int level;

    private int xp;

    public Skill()
    {
        this.name = "undefined";
        level = 0;
        xp = 0;
    }

    public Skill(String name, int initLevel)
    {
        this.name = name;
        this.level = initLevel;
        xp = 0;
    }

    public void addXP(int xp)
    {

    }

    private void updateLevel()
    {

    }

    public int xpToNextLevel()
    {
        return -1;
    }

    public float getProgressPercentage()
    {
        return -1.0f;
    }
}
