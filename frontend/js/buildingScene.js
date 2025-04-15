import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

var mouseX = 0, mouseY = 0; //store value of mouse position on screen

//HallwayScene class is instantiating a scene
export class BuildingScene {
    constructor() {//called once at the beginning
        //init main objecs
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();
        
        //init enviroment
        this.initEnv();

        //init clock
        this._clock.start();
    }

    //function called everytime the scene is loaded
    start(){
    }

    //function called by sceneManager to update renderer (called every frame)
    updateRender() {
    }

    //function to init light in scene
    initLight() {
        const amlight = new THREE.AmbientLight(0x404040, 30); // soft white background light
        this._scene.add(amlight);

        const dirlight = new THREE.DirectionalLight(0xFFFF9D, 5); //soft sun light
        dirlight.position.set(-100, 100, 70);
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

        //add building to scene
        this.initModel('frontend/media/models/dhbw_building.glb', (artGallery) => {
            artGallery.rotation.y = Math.PI; //rotate obj
            this._scene.add(artGallery);
        });
        this._camera.position.set(0, 10, 50); //set camera position
        this._camera.rotation.set(0, 0, 0);
    }

    getScene() {
        return this._scene;
    }

    getCamera() {
        return this._camera;
    }
}
