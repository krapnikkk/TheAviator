import * as THREE from "three";
import * as fgui from "fairygui-three";
import { AirPlane, CoinsHolder, Sea, Sky, Particle, ParticlesHolder, Enemy, EnemiesHolder } from "./objects/index.js"
import { particlesPool, enemiesPool, Game } from "./constant"
import { normalize } from "./utlis.js";
import UIPanel from "./ui/UIPanel.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
export default class Main {
    oldTime = new Date().getTime();
    mousePos = { x: 0, y: 0 };
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    constructor() {
        this.init();
    }

    init() {
        this.createRender();
        this.createScene();
        this.createCamera();
        this.createLights();


        this.createSea();
        this.createSky();
        this.createPlane();

        this.createEnemies();
        this.createCoins();
        this.createParticles();

        document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('mouseup', this.handleMouseUp.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        window.addEventListener('resize', () => {
            this.HEIGHT = window.innerHeight;
            this.WIDTH = window.innerWidth;
            this.renderer.setSize(this.WIDTH, this.HEIGHT);
            this.camera.aspect = this.WIDTH / this.HEIGHT;
            this.camera.updateProjectionMatrix();
        }, false);

        // this.controls = new OrbitControls(this.UICamera, this.renderer.domElement);
        // let helper = new THREE.GridHelper(2000, 10);
        // this.UIScene.add(helper);

        // let helper2 = new THREE.AxesHelper(2000);
        // this.UIScene.add(helper2);
        // this.animate(); // onUILoaded
    }


    handleMouseMove(event) {
        var tx = -1 + (event.clientX / this.WIDTH) * 2;
        var ty = 1 - (event.clientY / this.HEIGHT) * 2;
        this.mousePos = { x: tx, y: ty };
    }

    handleTouchMove(event) {
        event.preventDefault();
        var tx = -1 + (event.touches[0].pageX / this.WIDTH) * 2;
        var ty = 1 - (event.touches[0].pageY / this.HEIGHT) * 2;
        this.mousePos = { x: tx, y: ty };
    }

    handleMouseUp(event) {
        if (Game.status == "waitingPlay") {
            this.resetGame();
            this.UIPanel.hidePlay();
        }
    }


    handleTouchEnd(event) {
        if (Game.status == "waitingPlay") {
            this.resetGame();
            this.UIPanel.hidePlay();
        }
    }

    resetGame() {
        Game.distance = 0;
        Game.energy = 100;
        Game.distance = 0;
        Game.level = 1;
        Game.levelLastUpdate = 0;

        Game.planeFallSpeed = .001;
        Game.planeSpeed = 0;
        Game.planeCollisionDisplacementX = 0;
        Game.planeCollisionSpeedX = 0;
        Game.planeCollisionDisplacementY = 0;
        Game.planeCollisionSpeedY = 0;

        Game.baseSpeed = .00035;
        Game.targetBaseSpeed = .00035;
        Game.speedLastUpdate = 0;

        Game.coinDistanceTolerance = 15;
        Game.coinValue = 3;
        Game.coinsSpeed = .5;
        Game.coinLastSpawn = 0;
        Game.distanceForCoinsSpawn = 100;

        Game.enemyDistanceTolerance = 10;
        Game.enemyValue = 10;
        Game.enemiesSpeed = .6;
        Game.enemyLastSpawn = 0;
        Game.distanceForEnemiesSpawn = 50;

        Game.status = "playing";
        
        this.UIPanel.updateRound(Game.level);
    }

    createRender() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0xf7d9aa);
        this.renderer.sortObjects = false;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.renderer.localClippingEnabled = true;
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;

        document.body.appendChild(this.renderer.domElement);
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);


        this.UIScene = new THREE.Scene();
        fgui.Stage.scene = this.UIScene;
        fgui.Stage.init(this.renderer);

        fgui.UIPackage.loadPackage("dist/ui/TheAviator").then(this.createUIPanel.bind(this));

    }

    createCamera() {
        var aspect = this.WIDTH / this.HEIGHT;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 10000);
        this.camera.position.set(0, 200, 180);


        this.UICamera = new THREE.OrthographicCamera(0, this.WIDTH, this.HEIGHT, 0, -100, 100);
        fgui.Stage.camera = this.UICamera;
    }

    createLights() {

        let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)
        this.ambientLight = new THREE.AmbientLight(0xdc8874, .5);
        let shadowLight = new THREE.DirectionalLight(0xffffff, .9);
        shadowLight.position.set(150, 350, 350);
        shadowLight.castShadow = true;
        shadowLight.shadow.camera.left = -400;
        shadowLight.shadow.camera.right = 400;
        shadowLight.shadow.camera.top = 400;
        shadowLight.shadow.camera.bottom = -400;
        shadowLight.shadow.camera.near = 1;
        shadowLight.shadow.camera.far = 1000;
        shadowLight.shadow.mapSize.width = 4096;
        shadowLight.shadow.mapSize.height = 4096;

        // var ch = new THREE.CameraHelper(shadowLight.shadow.camera);
        // this.scene.add(ch);
        this.scene.add(hemisphereLight);
        this.scene.add(shadowLight);
        this.scene.add(this.ambientLight);

    }

    createUIPanel() {
        fgui.UIObjectFactory.setExtension("ui://TheAviator/Main", UIPanel);
        this.UIPanel = fgui.UIPackage.createObject("TheAviator", "Main").asCom;;
        fgui.GRoot.inst.addChild(this.UIPanel);
        this.UIPanel.displayObject.setLayer(0);
        this.UIPanel.displayObject.camera = this.UICamera;

        let container = new THREE.Group();
        let ratio = this.HEIGHT / this.UIPanel.height;
        // ratio = ratio > 1 ? 1 : ratio;
        this.UIPanel.setScale(ratio, ratio);
        container.rotateX(this.UICamera.rotation.x);
        container.add(this.UIPanel.obj3D);
        container.position.set((this.WIDTH - this.UIPanel.width * ratio) / 2, this.HEIGHT, 0);
        fgui.Stage.scene.add(container);

        this.animate();
    }


    render() {
        fgui.Stage.update();

        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        this.renderer.render(fgui.Stage.scene, fgui.Stage.camera);
    }

    createPlane() {
        this.airplane = new AirPlane();
        this.airplane.mesh.scale.set(.25, .25, .25);
        this.airplane.mesh.position.y = Game.planeDefaultHeight;
        this.scene.add(this.airplane.mesh);
    }

    createSea() {
        this.sea = new Sea();
        this.sea.mesh.position.y = -Game.seaRadius;
        this.scene.add(this.sea.mesh);
    }

    createSky() {
        this.sky = new Sky();
        this.sky.mesh.position.y = -Game.seaRadius;
        this.scene.add(this.sky.mesh);
    }

    updatePlane() {

        Game.planeSpeed = normalize(this.mousePos.x, -.5, .5, Game.planeMinSpeed, Game.planeMaxSpeed);
        var targetY = normalize(this.mousePos.y, -.75, .75, Game.planeDefaultHeight - Game.planeAmpHeight, Game.planeDefaultHeight + Game.planeAmpHeight);
        var targetX = normalize(this.mousePos.x, -1, 1, -Game.planeAmpWidth * .7, -Game.planeAmpWidth);

        Game.planeCollisionDisplacementX += Game.planeCollisionSpeedX;
        targetX += Game.planeCollisionDisplacementX;


        Game.planeCollisionDisplacementY += Game.planeCollisionSpeedY;
        targetY += Game.planeCollisionDisplacementY;

        this.airplane.mesh.position.y += (targetY - this.airplane.mesh.position.y) * this.deltaTime * Game.planeMoveSensivity;
        this.airplane.mesh.position.x += (targetX - this.airplane.mesh.position.x) * this.deltaTime * Game.planeMoveSensivity;

        this.airplane.mesh.rotation.z = (targetY - this.airplane.mesh.position.y) * this.deltaTime * Game.planeRotXSensivity;
        this.airplane.mesh.rotation.x = (this.airplane.mesh.position.y - targetY) * this.deltaTime * Game.planeRotZSensivity;
        // var targetCameraZ = normalize(Game.planeSpeed, Game.planeMinSpeed, Game.planeMaxSpeed, Game.cameraNearPos, Game.cameraFarPos);
        this.camera.fov = normalize(this.mousePos.x, -1, 1, 40, 80);
        this.camera.updateProjectionMatrix()
        this.camera.position.y += (this.airplane.mesh.position.y - this.camera.position.y) * this.deltaTime * Game.cameraSensivity;

        Game.planeCollisionSpeedX += (0 - Game.planeCollisionSpeedX) * this.deltaTime * 0.03;
        Game.planeCollisionDisplacementX += (0 - Game.planeCollisionDisplacementX) * this.deltaTime * 0.01;
        Game.planeCollisionSpeedY += (0 - Game.planeCollisionSpeedY) * this.deltaTime * 0.03;
        Game.planeCollisionDisplacementY += (0 - Game.planeCollisionDisplacementY) * this.deltaTime * 0.01;

        this.airplane.pilot.updateHairs(this.deltaTime);
    }

    createCoins() {
        this.coinsHolder = new CoinsHolder(20);
        this.scene.add(this.coinsHolder.mesh)
    }

    createParticles() {
        for (var i = 0; i < 10; i++) {
            var particle = new Particle();
            particlesPool.push(particle);
        }
        this.particlesHolder = new ParticlesHolder();
        this.scene.add(this.particlesHolder.mesh)
    }

    createEnemies() {
        for (var i = 0; i < 10; i++) {
            var enemy = new Enemy();
            enemiesPool.push(enemy);
        }
        this.enemiesHolder = new EnemiesHolder();
        this.scene.add(this.enemiesHolder.mesh)
    }

    updateDistance() {
        Game.distance += Game.speed * this.deltaTime * Game.ratioSpeedDistance;
        if(Game.status == "playing"){
            this.UIPanel.updateDistance(Math.floor(Game.distance));
            var d = (1 - (Game.distance % Game.distanceForLevelUpdate) / Game.distanceForLevelUpdate);
            this.UIPanel.updateLevel(d);
        }

    }

    updateEnergy() {
        Game.energy -= Game.speed * this.deltaTime * Game.ratioSpeedEnergy;
        Game.energy = Math.max(0, Game.energy);
        this.UIPanel.updateEnergy(Math.trunc(Game.energy));

        if (Game.energy < 1) {
            this.UIPanel.updateEnergy(0);
            Game.status = "gameover";
        }
    }


    animate = () => {
        this.newTime = new Date().getTime();
        this.deltaTime = this.newTime - this.oldTime;
        this.oldTime = this.newTime;
        if (Game.status == "playing") {

            // Add energy coins every 100m;
            if (Math.floor(Game.distance) % Game.distanceForCoinsSpawn == 0 && Math.floor(Game.distance) > Game.coinLastSpawn) {
                Game.coinLastSpawn = Math.floor(Game.distance);
                this.coinsHolder.spawnCoins();
            }

            if (Math.floor(Game.distance) % Game.distanceForSpeedUpdate == 0 && Math.floor(Game.distance) > Game.speedLastUpdate) {
                Game.speedLastUpdate = Math.floor(Game.distance);
                Game.targetBaseSpeed += Game.incrementSpeedByTime * this.deltaTime;
            }

            if (Math.floor(Game.distance) % Game.distanceForenemiesSpawn == 0 && Math.floor(Game.distance) > Game.enemyLastSpawn) {
                Game.enemyLastSpawn = Math.floor(Game.distance);
                this.enemiesHolder.spawnenemies();
            }

            if (Math.floor(Game.distance) % Game.distanceForLevelUpdate == 0 && Math.floor(Game.distance) > Game.levelLastUpdate) {
                Game.levelLastUpdate = Math.floor(Game.distance);
                Game.level++;

                this.UIPanel.updateRound(Math.floor(Game.level));

                Game.targetBaseSpeed = Game.initSpeed + Game.incrementSpeedByLevel * Game.level
            }


            this.updatePlane();
            this.updateDistance();
            this.updateEnergy();
            Game.baseSpeed += (Game.targetBaseSpeed - Game.baseSpeed) * this.deltaTime * 0.02;
            Game.speed = Game.baseSpeed * Game.planeSpeed;

        } else if (Game.status == "gameover") {
            Game.speed *= .99;
            this.airplane.mesh.rotation.z += (-Math.PI / 2 - this.airplane.mesh.rotation.z) * .0002 * this.deltaTime;
            this.airplane.mesh.rotation.x += 0.0003 * this.deltaTime;
            Game.planeFallSpeed *= 1.05;
            this.airplane.mesh.position.y -= Game.planeFallSpeed * this.deltaTime;

            if (this.airplane.mesh.position.y < -200) {
                this.UIPanel.showPlay();
                Game.status = "waitingPlay";

            }
        } else if (Game.status == "waitingPlay") {
            Game.targetBaseSpeed = Game.initSpeed + Game.incrementSpeedByLevel * Game.level
            this.updateDistance();
            Game.baseSpeed += (Game.targetBaseSpeed - Game.baseSpeed) * this.deltaTime * 0.02;
            Game.speed = Game.baseSpeed * Game.planeSpeed;
            
        }


        this.airplane.propeller.rotation.x += .2 + Game.planeSpeed * this.deltaTime * .005;
        this.sea.mesh.rotation.z += Game.speed * this.deltaTime;//*Game.seaRotationSpeed;

        if (this.sea.mesh.rotation.z > 2 * Math.PI) this.sea.mesh.rotation.z -= 2 * Math.PI;

        this.ambientLight.intensity += (.5 - this.ambientLight.intensity) * this.deltaTime * 0.005;

        this.coinsHolder.rotateCoins(this.particlesHolder, this.airplane.mesh.position, this.deltaTime, this.addEnergy, this);
        this.enemiesHolder.rotateEnemies(this.deltaTime, this.airplane.mesh.position, this.ambientLight, this.particlesHolder, this.removeEnergy, this);

        this.sky.moveClouds(this.deltaTime);
        this.sea.moveWaves(this.deltaTime);
        this.render();

        requestAnimationFrame(this.animate.bind(this));
    }

    addEnergy() {
        Game.energy += Game.coinValue;
        Game.energy = Math.min(Game.energy, 100);
    }

    removeEnergy() {
        Game.energy -= Game.enemyValue;
        Game.energy = Math.max(0, Game.energy);
    }

}