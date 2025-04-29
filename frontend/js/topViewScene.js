import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//topViewScene class is instantiating a scene
export class TopViewScene {
    constructor(renderer) {//called once at the beginning
        //init main objecs
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();
        this._renderer = renderer;

        //init clock
        this._clock.start();
    }

    //function called everytime the scene is loaded
    start(){
        //init enviroment
        this.initEnv();
    }

    //function called by sceneManager to update renderer (called every frame)
    updateRender() {
        const delta = this._clock.getDelta();
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
        this.initModel('frontend/media/models/dhbw_building.glb', (dhbw_building) => {
            this.dhbw_building = dhbw_building;
            this.dhbw_building.rotation.y = Math.PI; //rotate obj
            this._scene.add(this.dhbw_building);
        });
        this._camera.position.set(30, 70, 40); //set camera position
        this._camera.lookAt(new THREE.Vector3(0,30,0));
    }

    showFloor(floor){
        console.log(floor)
        this._scene.getObjectByName("Roof").visible = false;
        for (let i = 5; i > 0; i--){
            this._scene.getObjectByName("OG" + i).visible = true;
        }

        for (let i = 5; i > floor; i--){
            this._scene.getObjectByName("OG" + i).visible = false;
        }
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
