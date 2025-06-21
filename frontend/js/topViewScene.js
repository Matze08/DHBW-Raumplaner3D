import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Global variables
//Add variables to track mouse events for rotation
let isMousePressed = false;
let lastMouseX = null;

let autoRotation = true; // Flag to control auto-rotation
let view2d = false; // Flag to control 2D/3D view

//topViewScene class is instantiating a scene
export class TopViewScene {
    constructor(renderer) {//called once at the beginning
        //init main objecs
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();
        this._renderer = renderer;

        this._rotationSpeed = 0.2; // Auto-rotation speed
        this._mouseSensitivity = 0.005; // Sensitivity for mouse rotation

        //init clock
        this._clock.start();

        // Add event listeners
        window.addEventListener('mousedown', (event) => {
            isMousePressed = true;
            lastMouseX = event.clientX;
        });

        window.addEventListener('mouseup', () => {
            isMousePressed = false;
            lastMouseX = null;
        });

        window.addEventListener('mousemove', (event) => {
            if (isMousePressed && lastMouseX !== null) {
                const deltaX = event.clientX - lastMouseX;
                this.rotateCamera(deltaX * this._mouseSensitivity);
                lastMouseX = event.clientX;
            }
        });

        window.addEventListener('wheel', (event) => {
            const zoomSpeed = 1; // Adjust zoom speed
            const delta = event.deltaY > 0 ? zoomSpeed : -zoomSpeed; // Determine zoom direction
            console.log(`Zoom delta: ${delta}`); // Log zoom delta for debugging
        
            if (view2d) {
                // In 2D view, adjust the camera's Y position for zooming
                this._camera.position.y += delta * 10; // Scale zoom for 2D view
                this._camera.position.y = Math.max(50, Math.min(200, this._camera.position.y)); // Clamp zoom range
            } else {
                // In 3D view, adjust the camera's position based on the zoom delta
                const direction = new THREE.Vector3();
                this._camera.getWorldDirection(direction);
                //get distance from camera to center of scene
                const distance = this._camera.position.distanceTo(new THREE.Vector3(0, 10, 0));
                console.log(`Camera distance to center: ${distance}`); // Log distance for debugging
                // Prevent zooming in too close
                if (distance < 10 && delta < 0 || distance > 200 && delta > 0) {
                    return; // Prevent zooming in too close or too far
                }
                this._camera.position.addScaledVector(direction, -delta * 10); // Scale zoom for 3D view
                this._camera.lookAt(new THREE.Vector3(0, 10, 0)); // Ensure camera looks at the center
            }
        });

        const toggleRotationButton = document.getElementById('toggle-rotation');
        const toggleViewButton = document.getElementById('toggle-3d');

        // Toggle Rotation Button
        toggleRotationButton.addEventListener('click', () => {
            autoRotation = !autoRotation; // Toggle auto-rotation
        });

        // Toggle 2D/3D View Button
        toggleViewButton.addEventListener('click', () => {
            view2d = !view2d; // Toggle 2D/3D view
            if (view2d) {
                this._camera.position.set(0, 100, 0); // Set camera for 2D view
                this._camera.lookAt(new THREE.Vector3(0, 0, 0));
            } else {
                this._camera.position.set(0, 60, 80); // Reset camera for 3D view
                this._camera.lookAt(new THREE.Vector3(0, 10, 0));
            }
        });
    }

    //function called everytime the scene is loaded
    start(){
        //init enviroment
        this.initEnv();
    }

    //function called by sceneManager to update renderer (called every frame)
    updateRender() {
        const delta = this._clock.getDelta();


        //rotate camera around the building, if mouse is not pressed
        if (!isMousePressed && autoRotation) {
            if (view2d) {
                // In 2D view, rotate around the center of the scene
                this._camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), delta * this._rotationSpeed);

            } else {
                this._camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), delta * this._rotationSpeed);
                this._camera.lookAt(new THREE.Vector3(0, 10, 0)); //look at the center of the scene
            }
        }
        
    }

    // Rotate the camera based on mouse movement
    rotateCamera(angle) { 
        if (view2d) {
            const currentRotation = this._camera.rotation.z; // Get current rotation around Z-axis
            const newRotation = currentRotation - angle; // Calculate new rotation
            // In 2D view, keep the camera above the scene and rotate around the center
            this._camera.rotation.z = newRotation;
        } else {
            // In 3D view
            // Rotate the camera based on mouse movement
            const radius = Math.sqrt(
                Math.pow(this._camera.position.x, 2) +
                Math.pow(this._camera.position.z, 2)
            );
            const currentAngle = Math.atan2(this._camera.position.z, this._camera.position.x);
            const newAngle = currentAngle + angle;
            this._camera.position.x = radius * Math.cos(newAngle);
            this._camera.position.z = radius * Math.sin(newAngle);
            this._camera.lookAt(new THREE.Vector3(0, 10, 0)); // Look at the center of the scene
        }
    }

    //function to init light in scene
    initLight() {
        const dirlight = new THREE.DirectionalLight(0xFFFF9D, 2); //soft sun light
        dirlight.position.set(0, 100, 0);
        dirlight.castShadow = true;
        this._scene.add(dirlight);

        //Set up shadow properties for the light
        dirlight.shadow.mapSize.width = 2048;
        dirlight.shadow.mapSize.height = 2048;

        dirlight.shadow.bias = -0.001; //remove noice
        //camera render settings for shadow
        dirlight.shadow.camera.left = -50;
        dirlight.shadow.camera.right = 50;
        dirlight.shadow.camera.top = 50;
        dirlight.shadow.camera.bottom = -50;
    }

    //function to load and return 3d model
    initModel(path, onLoadCallback) {
        const loader = new GLTFLoader();
        //load model
        loader.load(path, (gltf) => {
            //cast shadow --> every mesh in model
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            const model = gltf.scene;
            onLoadCallback(model, gltf.animations); //return model and animations
        }, undefined, (error) => {
            console.error(error);
        });
    }

    //function to init enviroment of scene
    initEnv() {
        this.initLight();

        // Use PMREMGenerator to create the environment map
        
        const pmremGenerator = new THREE.PMREMGenerator(this._renderer);
        pmremGenerator.compileEquirectangularShader();

        // Create the RoomEnvironment
        const environment = new RoomEnvironment();
        const envMap = pmremGenerator.fromScene(environment).texture;

        // Apply environment map to the scene
        this._scene.environment = envMap;
        this._scene.background = new THREE.Color('#3188d4');

        //add building to scene
        this.initModel('/frontend/media/models/dhbw_building.glb', (dhbw_building) => {
            this.dhbw_building = dhbw_building;
            this._scene.add(this.dhbw_building);
        });

        //init waypoint
        this.initModel('/frontend/media/models/waypoint.glb', (waypoint) => {
            this.waypoint = waypoint;

            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            this.waypoint.children[0].material = material;
        });

        //init startpoint
        this.initModel('/frontend/media/models/waypoint.glb', (startpoint) => {
            this.startpoint = startpoint;

            const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
            this.startpoint.children[0].material = material;
        });
        
        this._camera.position.y = 60;
        this.updateCameraPos(0);
    }

    updateCameraPos(angle){
        //update camera position based on slider value
        //angle = 0 -> camera is in front of the building
        const radius = 80;
        this._camera.position.x = radius * Math.cos(angle) + 10;
        this._camera.position.z = radius * Math.sin(angle);
        this._camera.lookAt(new THREE.Vector3(0,10,0));
    }

    showFloor(floor){
        //show all floors (reset)
        this._scene.getObjectByName("Roof").visible = true;
        for (let i = 5; i > 0; i--){
            this._scene.getObjectByName("OG" + i).visible = true;
        }

        //remove all floors above the selected floor
        for (let i = 5; i > floor; i--){
            this._scene.getObjectByName("OG" + i).visible = false;
        }
        //remove roof
        if (floor < 6){
            this._scene.getObjectByName("Roof").visible = false;
        }
    }

    setWaypoint(roomNr){
        // roomNr is a string like "C305", "A102", "B204"
        this._scene.remove(this.waypoint);
        const floorNr = roomNr[1];
        //get the name of the waypoint holder
        const waypointHolder = this._scene.getObjectByName("OG"+floorNr+"Level");
        //search for the correct room (waypoint)
        waypointHolder.children.forEach(element => {
            if (element.name == roomNr){
                this.waypoint.position.copy(element.position);
                this.waypoint.position.y;
                this.waypoint.name = element.name;
                this._scene.add(this.waypoint);
            }
        });
    }

    findNextStaircase(){
        //gets the name of the startpoint
        let startPointName = this.startpoint.name;
        let OGX = 0;
        let nearestStairway = null;
        if (startPointName == "EingangOben"){
            OGX = 1;
        }
        const stairways = this._scene.getObjectByName("OG"+OGX+"Staircase").children;
        //finds the nearest stairway
        stairways.forEach(stairway => {
            let distance = this.startpoint.position.distanceTo(stairway.position);
            if (nearestStairway == null || distance < nearestStairway.distance){
                nearestStairway = {
                    name: stairway.name,
                    position: stairway.position,
                    distance: distance
                };
            }
        });
        this.nearestStairway = nearestStairway;
    }

    setEntry(entry){
        this._scene.remove(this.startpoint);
        const waypointHolder = this._scene.getObjectByName(entry);
        //set startpoint obj to the entry
        if (waypointHolder){
            this.startpoint.name = entry;
            this.startpoint.position.copy(waypointHolder.position);
            this.startpoint.position.y += 2;
            this._scene.add(this.startpoint);
        }
    }

    drawLine(){
        const geometry = new THREE.BufferGeometry().setFromPoints([this.startpoint.position, this.nearestStairway.position]);
        const material = new THREE.LineBasicMaterial({ color: 0xff0500 });
        this.line = new THREE.Line(geometry, material);

        //get name of nearest stairway and replace the number with the number of the waypoint
        let stairwaytop = this.nearestStairway.name;
        stairwaytop = stairwaytop.split('');
        stairwaytop[2] = this.waypoint.name[1];
        stairwaytop = stairwaytop.join('');

        const geometry1 = new THREE.BufferGeometry().setFromPoints([this.nearestStairway.position, this._scene.getObjectByName(stairwaytop).position]);
        const material1 = new THREE.LineBasicMaterial({ color: 0xff0500 });
        this.line1 = new THREE.Line(geometry1, material1);


        const geometry2 = new THREE.BufferGeometry().setFromPoints([this._scene.getObjectByName(stairwaytop).position, this.waypoint.position]);
        const material2 = new THREE.LineBasicMaterial({ color: 0xff0500 });
        this.line2 = new THREE.Line(geometry2, material2);

        //add lines to scene
        this._scene.add(this.line);
        this._scene.add(this.line1);
        this._scene.add(this.line2);
    }


    getScene() {
        return this._scene;
    }

    getCamera() {
        return this._camera;
    }

    removeListeners(){

    }

    //exit Scene
    exit(){
        this.removeListeners();
    }
}
