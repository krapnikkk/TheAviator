import { deltaTime, Game } from "../constant";
import * as THREE from "three";
import { Cloud } from "./cloud.js";
export class Sky {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.nClouds = 20;
        this.clouds = [];
        this.init();
    }

    init() {
        var stepAngle = Math.PI * 2 / this.nClouds;
        for (var i = 0; i < this.nClouds; i++) {
            var c = new Cloud();
            this.clouds.push(c);
            var a = stepAngle * i;
            var h = Game.seaRadius + 150 + Math.random() * 200;
            c.mesh.position.y = Math.sin(a) * h;
            c.mesh.position.x = Math.cos(a) * h;
            c.mesh.position.z = -300 - Math.random() * 500;
            c.mesh.rotation.z = a + Math.PI / 2;
            var s = 1 + Math.random() * 2;
            c.mesh.scale.set(s, s, s);
            this.mesh.add(c.mesh);
        }
    }

    moveClouds(deltaTime) {
        for (var i = 0; i < this.nClouds; i++) {
            var c = this.clouds[i];
            c.rotate();
        }
        this.mesh.rotation.z += Game.speed * deltaTime;
    }
}