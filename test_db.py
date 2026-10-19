import getpass
import psycopg

password = getpass.getpass("PostgreSQL password: ")

with psycopg.connect(
    host="localhost",
    port=5432,
    dbname="job_tracker",
    user="postgres",
    password=password
) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM applications;")
        applications = cur.fetchall()

        print("Applications from PostgreSQL:")
        for application in applications:
            print(application)