
import json

def load_applications():
    try:
        with open("applications.json", "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return []

def save_applications(applications):
    with open("applications.json", "w") as file:
        json.dump(applications, file, indent=4)
