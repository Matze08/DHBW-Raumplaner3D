# DHBW 3D Raumplaner
This digital 3D room planner lets you create bookings for your university to your heart's content! The main feature of this project is the ability to guide students to their respective rooms visualized by a 3D-Model of the DHBW Stuttgart in Lerchenstr. 1, Stuttgart.

This is a university project for the module "Einsatz von Web-Technologien" by Matthias F. and Michael B.   

## Installation
Note that a complete demo version of this project is alreadyd hosted at `scheiternistgeil.de`.   
If you still want to build the project yourself, follow these instructions:

### Requirements
* Node.js >= ver. 20.17.0
* Current web browser (please note that this project is not intended for mobile devices because of the 3D-animations)

### Instructions
1. Go into the project's root folder
2. Run `npm i` and `npx gulp install-all` to install all packages via npm. (You might be asked to install `gulp`)
2. Run the command `npx gulp build` to build without testing. Run `npx gulp build-with-tests` to build with testing. 
3. Gulp will now execute the building process (and testing) for frontend and backend and compile the source files into deployable ones.
4. The compiled files can be found in the `dist` directory.
s
Please note that a seperate MongoDB server is needed. For the purposes of this university project, one is hosted at `scheiternistgeil.de`, which is connected to by default (see `backend/src/model/db.ts`).

Please also note that running the website locally by just opening the .html files is NOT possible because of CORS issues as the javascript files are imported as ES6 modules.