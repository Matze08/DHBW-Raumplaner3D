import * as THREE from 'three';
import {FpvScene} from './fpvScene.js';
import {TopViewScene} from './topViewScene.js';

var scenes; //store scenes in array
var activeScene; //stores active scene

var renderer; //stores active renderer

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
loadScene(0); //load topViewScene as default

window.loadScene = loadScene;
window.getActiveScene = getActiveScene;

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