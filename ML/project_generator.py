import requests
import json

class skill_generator:
    def __init__ (self):
        self.embeddings_matrix = None
        self.generate_url = "http://localhost:11434/api/generate"
        self.embed_url = "http://localhost:11434/api/embed"

    def process_skills(self, skills):
        get_description = {
            "model": "mistral:latest",
            "stream": False
        }

        check_applicability = {
            "model": "mistral:latest",
            "stream": False
        }

        get_embed = {
        "model": "mxbai-embed-large"
        }


        #we'll gather a default amount of skills
        descriptions = {}
        errors = {}
        embeddings = {}

        for skill in skills:
            # get description for the skill
            get_description["prompt"] = f"Summarize {skill} in two concise sentences."
            res = requests.post(self.generate_url, json=get_description)

            # check if description request succeeded
            if res.status_code == 200:
                data = res.json()
                description = data.get("response", "")
            
                #after gathering description check the skill is part of CS
                check_applicability["prompt"] = (
                    f"Verify if this concept belongs to the field of Computer Science:\n\n"
                    f"{description}\n\n"
                    "If you are unsure responde with false"
                    "Respond only with lowercase true or false."
                )
                res2 = requests.post(self.generate_url, json=check_applicability)
                
                #check if applicability request succeeded
                if res2.status_code == 200:
                    data2 = res2.json()
                    boolean_response = data2.get("response", "").strip().lower()
                    if not boolean_response or boolean_response == "false":
                        continue
                    else:
                        #if valid skill add the description and embed
                        descriptions[skill] = description
                        
                        #embed
                        get_embed["input"] = [f"{skill}: {description}"]
                        res3 = requests.post(self.embed_url, json=get_embed)
                        
                        #if embed worked
                        if res3.status_code == 200:

                            data3 = res3.json()
                            embedding = data3.get("embeddings", [[]])[0]

                            embeddings[skill] = embedding
                            print(f"{skill}\n{description}\nEmbedding length: {len(embedding)}")
                    
                        #save errors
                        else: 
                            print(f"Issue with embedding: {skill}, {res3.status_code}")
                            errors[skill] = f"embed: {res3.status_code}"
            
                else: 
                    print(f"Issue with applicability: {skill}, {res2.status_code}")
                    errors[skill] =  f"applicability: {res2.status_code}"

            else:
                print(f"Error getting description for {skill}: {res.status_code}")
                errors[skill] =f"description: {res.status_code}"

        print(f"Length of errors: {len(errors)}")
        return skills, descriptions, embeddings


def main():
    new_skill_generator = skill_generator()
    test_skills = ["Python", "Machine Learning", "Data Science", "hahdujfn", "under water basket weaving"]
    new_skill_generator.process_skills(test_skills)

if __name__ == "__main__":
    main()
