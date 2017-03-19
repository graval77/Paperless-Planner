Paperless Planner

Motivation:
The web application will help the user to manage their job applications. Students, job seekers have Excel sheets to keep track of application status. At career fair events, students make notes about recruiters, company’s requirements and follow-up dates. To keep track of all the details is a cumbersome task. Hence, we have created a web application to simplify the entire process of managing the job applications.
Proposal:
The application helps user to manage the job applications.
Features of the product:
There are two kinds of users:
 User
 Admin
User’s Core Features:
1. Login/ Signup.
2. Dashboard- Summary of the user’s activities.
3. Manage profile (Profile Builder) – upload photo and fill a form.
4. Add new job application – add form with job description, company details, follow up date, skillset required and notes.
5. My List – View previous job applications, edit the form and change form status.
6. Follow up reminder mail – user will get an email reminder to follow on requested date.
Admin’s Core Features:
1. Special access - To block user.
2. To make user1 as admin (data dump user1 is admin pwd: 1111)
db.user_collection.updateOne({ username: "user1" }, { $set: { "admin": "yes"} }
3. Admin will have an admin panel:
1. Block or reactivate user.
How to Set Up:
 Run npm install.
 Run node server.js
 Go to http://localhost:3000
Flow of navigation:
1. Normal User –
 Login or signup page – user can signup or login.
 Dashboard page – displays the summary of applications.
 Profile page – fill/update profile details and image in the user profile.
 Forms – Create new application.
2. Admin User-
 Admin Panel- Block or Activate the user.
Mail Alert: User will receive emails from paperless.cs546@gmail.com if the reminders for follow up is set to “yes”
