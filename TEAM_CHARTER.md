Enoch Mwambua (220883) - Backend Dev(s) (endpoints and database logic)

Nancy Kiuna (177898) - Integration/QA Lead (testing, including partner teams' APIs later)

Jabez Ooma (220529) - Docs/DevOps Lead (README, environment setup, deployment)

Berinette Neidoh (204357) - API Lead (endpoint/contract decisions)


GymBuddy is a proprietary web application designed for Evolve Fitness Langata. It serves as a digital companion for premium facility members, allowing them to track their daily workout splits, manage specific exercises, and calculate precise barbell loads on the fly. It is built to replace physical notebooks for serious lifters.  It is also a hub where members of the gym can access and edit their account information and membership details. Members can also view available classes and apply for them or set up one on ones with instructors.


• List of exercises per day
-> Add new exercise (and remove)
-> Remember completed excercise

• Calculator
-> POST inserted target weight and
RETURN barbell plate distribution.

• Signup page and login page (to be added)
-> Register new user with names, email, phone no., password
-> login user using email and pass by retrieving stored data and API keys
-> Use saved data to signup for classes on designated class page (to be added).
-> Allow editing of said data on account settings page. (to be created)


• Memberships
-> View available memberships and their information e.g. pricing, discounts, benefits.
-> Select and associate specific membership to user during registration.
-> Allow changing of membership from account settings.


• Coaches
-> Store list of coaches and their specialization and timetable for availability
-> Allow setting of appointments of personal training with error detection to avoid double booking


RING POSITION
-> Upstream Team:
-> Downstream Team: