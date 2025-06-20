# DHBW 3D Raumplaner
This digital 3D room planner lets you create bookings for your university to your heart's content! The main feature of this project is the ability to guide students to their respective rooms visualized by a 3D-Model of the DHBW Stuttgart in Lerchenstr. 1, Stuttgart.

This is a university project for the module "Einsatz von Web-Technologien" by Matthias F. and Michael B.
## Installation
### Requirements
* Node.js >= ver. 20.17.0

### Instructions
1. Go into the project's root folder
2. Run the command `npx gulp build`. 
3. Gulp will now execute the installation via `npm` for frontend and backend and compile the source files into deployable scripts.
4. The compiled files can be found in the `dist` directory.

Please note that a seperate MongoDB server is needed. For the purposes of this university project, one is hosted at `scheiternistgeil.de`, which is connected to by default (see `backend/src/model/db.ts`).