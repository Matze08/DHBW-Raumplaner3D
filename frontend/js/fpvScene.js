import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const move = { forward: false, backward: false, left: false, right: false , sprint: false };


//fpvScene class is instantiating a scene
export class FpvScene {
    constructor() {//called once at the beginning
        //init main objecs
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();
        //init clock
        this._clock.start();

        this.keydownListener = this.handleKeyDown.bind(this);
        this.keyupListener = this.handleKeyUp.bind(this);
        this.pointerlockchangeListener = this.handlePointerLockChange.bind(this);
        this.clickListener = this.handleClick.bind(this);
    }

    //function called everytime the scene is loaded
    start(){
        document.getElementById("wasd-instruction").style.display = "flex"; //show instruction
        this.controls = new PointerLockControls(this._camera, document.body);
        this._scene.add(this.controls.getObject());

        //init enviroment
        this.initEnv();

        // Add event listeners
        document.addEventListener('keydown', this.keydownListener);
        document.addEventListener('keyup', this.keyupListener);
        document.addEventListener('pointerlockchange', this.pointerlockchangeListener);
        document.getElementById("close-instruction").addEventListener('click', this.clickListener);
    }

    //function called by sceneManager to update renderer (called every frame)
    updateRender() {
        const delta = this._clock.getDelta();
        velocity.set(0, 0, 0);

        if (this.controls.isLocked === true) {
            direction.z = Number(move.forward) - Number(move.backward);
            direction.x = Number(move.right) - Number(move.left);
            direction.normalize();

            const baseSpeed = 5;
            const sprintMultiplier = move.sprint ? 2 : 1; // Double speed when sprinting
            const speed = baseSpeed * sprintMultiplier;

            if (move.forward || move.backward) velocity.z -= direction.z * speed * delta;
            if (move.left || move.right) velocity.x -= direction.x * speed * delta;

            this.controls.moveRight(-velocity.x);
            this.controls.moveForward(-velocity.z);
        }
    }

    //function to init sky texture in scene
    initSkybox() {
        const loader = new RGBELoader();
    
        loader.load('/frontend/media/textures/skybox.hdr', (texture) => {
            // Set the mapping to equirectangular
            texture.mapping = THREE.EquirectangularReflectionMapping;
            
            // Set background and environment map for the scene
            this._scene.background = texture;
            this._scene.environment = texture;

            texture.dispose();
        });
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
        this.initSkybox();
        this.initLight();

        //add building to scene
        this.initModel('/frontend/media/models/dhbw_building.glb', (dhbw_building) => {
            dhbw_building.rotation.y = Math.PI; //rotate obj
            this._scene.add(dhbw_building);
        });
        this._camera.position.set(40, 8, 30); //set camera position
        this._camera.rotation.set(0, 50*(Math.PI/180), 0);
    }

    getScene() {
        return this._scene;
    }

    getCamera() {
        return this._camera;
    }

    handleKeyDown(event) {
        event.preventDefault(); // Prevent default browser behavior
        switch (event.code) {
            case 'KeyW': move.forward = true; break;
            case 'KeyS': move.backward = true; break;
            case 'KeyA': move.left = true; break;
            case 'KeyD': move.right = true; break;
            case 'ShiftLeft': move.sprint = true; break;
        }
    }

    handleKeyUp(event) {
        switch (event.code) {
            case 'KeyW': move.forward = false; break;
            case 'KeyS': move.backward = false; break;
            case 'KeyA': move.left = false; break;
            case 'KeyD': move.right = false; break;
            case 'ShiftLeft': move.sprint = false; break;
        }
    }

    handlePointerLockChange() {
        if (document.pointerLockElement) {
            document.getElementById("wasd-instruction").style.display = "none";
        } else {
            loadScene(0); // Load topViewScene if pointer lock is lost
        }
    }

    handleClick() {
        document.body.requestPointerLock(); // Lock the pointer on first click
    }

    //remove EventListeners
    removeListeners(){
        document.removeEventListener('keydown', this.keydownListener);
        document.removeEventListener('keyup', this.keyupListener);
        document.removeEventListener('pointerlockchange', this.pointerlockchangeListener);
        document.getElementById("close-instruction").removeEventListener('click', this.clickListener);
        
    }

    //exit Scene
    exit(){
        this.removeListeners();
    }
}
