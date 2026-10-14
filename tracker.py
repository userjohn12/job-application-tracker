
from storage import save_applications

def add_application(applications):
    company = input("Enter company name: ")
    role = input("Enter job role: ")
    status = input("Enter application status: ")
    location = input("Enter location: ")

    application = {
        "company": company,
        "role": role,
        "status": status,
        "location": location
    }

    applications.append(application)
    save_applications(applications)

    print("Application added successfully!")


def view_applications(applications):
    if not applications:
        print("No applications found.")
    else:
        for application in applications:
            print("Company:", application["company"])
            print("Role:", application["role"])
            print("Status:", application["status"])
            print("Location:", application["location"])
            print("-------------------------")


def update_application(applications):
    company_name = input("Enter company to update: ")

    for application in applications:
        if application["company"] == company_name:
            new_status = input("Enter new status: ")
            application["status"] = new_status

            save_applications(applications)
            print("Application updated successfully!")
            return

    print("Application not found.")


def delete_application(applications):
    company_name = input("Enter company to delete: ")

    for application in applications:
        if application["company"] == company_name:
            applications.remove(application)

            save_applications(applications)
            print("Application deleted successfully!")
            return

    print("Application not found.")
