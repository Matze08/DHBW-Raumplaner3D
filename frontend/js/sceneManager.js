import * as THREE from 'three';
import {FpvScene} from './fpvScene.js';
import {TopViewScene} from './topViewScene.js';

var scenes; //store scenes in array
var activeScene; //stores active scene

var renderer; //stores active renderer

var floorNr = 6; //stores current floor number

//function which is closing old scene and opening new Scene (i --> SceneID of new Scene) 
//export --> so scene Objects can call this function
export function loadScene(i){ //function to switch between scenes
    if(activeScene) activeScene.exit(); //exit old scene
    activeScene = scenes[i];
    activeScene.start(); //open new scene

    //update Renderer to render new scene on every frame
    renderer.setAnimationLoop(() => {
        activeScene.updateRender();
        renderer.render(activeScene.getScene(), activeScene.getCamera());
    });
}

//function returns current scene
function getActiveScene(){
    return activeScene;
}

//function to init Renderer
function initRenderer(){
    renderer = new THREE.WebGLRenderer( {antialias : true});
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight);

    //add renderer to html document
    renderer.domElement.style.position = 'absolute';
    document.body.appendChild(renderer.domElement);
}

//function to initScenes (create scenes and add them to array)
function initScenes(){
    //init scenes
    const scene1 = new TopViewScene(renderer);
    const scene2 = new FpvScene(renderer);
    scenes = [scene1, scene2];
}

/*=================*/
//on page load:

initRenderer();
initScenes();
loadScene(0); //load topViewScene

window.loadScene = loadScene;
window.getActiveScene = getActiveScene;

//add event listener to buttons
document.getElementById('submit-form').addEventListener('submit', function(event) {
    event.preventDefault(); // prevents page reload
    document.getElementById('error-message').textContent = ""; // clear previous error message
    const regex = /^[ABC][0-5]\.\d{2}$/; // regex to match room numbers like C3.05, A1.02, B2.04, etc.
    const form = event.target;
    const roomNr = form.roomNr.value;

    if (!regex.test(roomNr)){
        document.getElementById('error-message').textContent = "Error: Room Number <" + roomNr + "> is not valid (example: C3.05)";
        document.getElementById('error-message').style.display = "block";
        console.log("Error: Room Number <" + roomNr + "> is not valid (example: C3.05");
        return;
    }
    floorNr = roomNr[1];
    activeScene.showFloor(floorNr);
    activeScene.setWaypoint(roomNr);
    activeScene.findNextStaircase();
    activeScene.drawLine();

});

document.getElementById('selectEntry').addEventListener('input', function(event) {
    activeScene.setEntry(event.target.value);
});

//add Resize-EventListener -> so renderer is responsive
window.addEventListener('resize', () => {
    //get window size
    let width = window.innerWidth;
    let height = window.innerHeight;

    //update renderer size
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //update camera aspect
    scenes.forEach((scene) => {
        scene.getCamera().aspect = width / height;
        scene.getCamera().updateProjectionMatrix();
    });
});