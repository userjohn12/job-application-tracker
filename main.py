
from storage import load_applications
from tracker import (
    add_application,
    view_applications,
    update_application,
    delete_application
)

applications = load_applications()

while True:
    print("\n--- JOB APPLICATION TRACKER ---")
    print("1. Add application")
    print("2. View applications")
    print("3. Update application")
    print("4. Delete application")
    print("5. Exit")

    choice = input("Enter your choice: ")

    if choice == "1":
        add_application(applications)

    elif choice == "2":
        view_applications(applications)

    elif choice == "3":
        update_application(applications)

    elif choice == "4":
        delete_application(applications)

    elif choice == "5":
        print("Goodbye!")
        break

    else:
        print("Invalid choice. Try again.")
