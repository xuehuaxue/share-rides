# Share Rides

Here is my personal project: share rides, an app that allows registered users to share cars. Once users registered, they can either create new trips, or join an existing group trip. Either way they can share total expense with other people, which potentially could save them hundreds per year. More than that, less car fuel means better environment!

Build with Express.js, Bootstrap, jQuery and MongoDB. The app follows MVC structure and it is my practice of web development.

## main features
1) it allows users to register, login and connect to other users

2) it allows users to initialize a new trip with details including start, end, date, total space, price, etc.

3) it uses google map api to calculate the route for each trip created by users and store them for future search.

4) If users want to join an trip instead of creating one, they can go to the search page, type in the start and end addresses, and the app will search through the system to see any close/similar routes. If there are trips with similar routes, users can join them if there is space available. Users can also view host's information including username, phone number and email contact.

see [my wix blog](https://chenyphg.wixsite.com/website/single-post/2016/08/22/Shake-up-your-life-how-to-change-your-own-perspective)for detail screenshots and walkthrough.

![snapshot](https://static.wixstatic.com/media/754948_ed9be2587c374ebfa54f1cc5c9006140~mv2.jpg/v1/fill/w_930,h_479,al_c,q_85,usm_0.66_1.00_0.01/754948_ed9be2587c374ebfa54f1cc5c9006140~mv2.webp)

![snapshot](https://static.wixstatic.com/media/754948_52c16673b1774619aec7736d1a26ac3f~mv2.jpg/v1/fill/w_930,h_455,al_c,q_85,usm_0.66_1.00_0.01/754948_52c16673b1774619aec7736d1a26ac3f~mv2.webp)
![snapshot](https://static.wixstatic.com/media/754948_0e8becc0420a48aca22d44ec14bb2feb~mv2.jpg/v1/fill/w_930,h_449,al_c,q_85,usm_0.66_1.00_0.01/754948_0e8becc0420a48aca22d44ec14bb2feb~mv2.webp)

## installation
just download the folder, run `npm install` to install all independences. Make sure mongoose is correctly installed and set up. After that, simply `cd` into the folder and run `npm start`to run the application!
