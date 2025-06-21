# DHBW 3D Raumplaner
This digital 3D room planner lets you create bookings for your university to your heart's content! The main feature of this project is the ability to guide students to their respective rooms visualized by a 3D-Model of the DHBW Stuttgart in Lerchenstr. 1, Stuttgart.

This is a university project for the module "Einsatz von Web-Technologien" by Matthias F. and Michael B.   

## Inhaltsverzeichnis
- [Installation](#installation)
  - [Requirements](#requirements)
  - [Instructions](#instructions)
- [Usage](#usage)
  - [Administration](#administration)
  - [Timetable](#timetable)
  - [3D-Model](#3d-model)

## Installation
A complete demo version of this project is hosted at `http://167.99.245.119:3000/frontend/html/root.html`    
If you still want to build the project yourself, follow these instructions:

### Requirements
* Node.js >= ver. 20.17.0
* Current web browser (please note that this project is not intended for mobile devices because of the 3D-animations)

### Instructions
1. Go into the project's root folder
2. Run `npm i` and `npx gulp install-all` to install all packages via npm. (You might be asked to install `gulp`)
2. Run the command `npx gulp build` to build without testing. Run `npx gulp build-with-tests` to build with testing. 
3. Gulp will now execute the building process (and testing) for frontend and backend and compile the source files into deployable ones.
4. The compiled files can be found in the `dist` directory.s

Please note that a seperate MongoDB server is needed. For the purposes of this university project, one is hosted at `167.99.245.119:27017`, which is connected to by default (see `backend/src/model/db.ts`).

Please also note that running the website locally by just opening the .html files is NOT possible because of CORS issues as the javascript files are imported as ES6 modules.

## Usage
This application allows you to manage bookings and link them to specific rooms in the DHBW building, so that new students can navigate to their rooms by clicking on the `navigate` button in their timetable and then getting a 3D-visualization of the way to the room through the building.   

### Administration
Bookings can only be managed by administrators. The demo website is prefilled with test data and uses the following default admin credentials:    
User: def@ghi   
Password: ghi   

The page for managing bookings is accessible via the `Verwaltung` button of the starting page. You will be asked to log in if you haven't done so already. There, you can add new bookings, courses, lectures and lecturers.    
It is also possible to add new rooms. Please note that the linking of rooms to their 3D position in the model is done with the room's name. So if you enter a nonexistent room in the DHBW, the navigation will not work.    

Admins are also able to add new admin accounts by clicking on `Neuen Benutzer registrieren`.

### Timetable
This is the relevant page for student users. Here, they can see their upcoming bookings/lectures and navigate to them by clicking on the `navigate` button after clicking on a specific booking in the timetable.

### 3D-Model
The main aspect of this project is the main page's 3D model of the DHBW Stuttgart.   
It is possible to zoom in and out, select a room to navigate to and walk around the building in first person by clicking on the lower left building icon.