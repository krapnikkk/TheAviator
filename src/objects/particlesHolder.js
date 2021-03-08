import * as THREE from "three";
import {Particle} from "./particle.js";
import {particlesPool} from "../constant.js";
export class ParticlesHolder {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.particlesInUse = [];
    }

    spawnParticles(pos, density, color, scale) {
        var nPArticles = density;
        for (var i = 0; i < nPArticles; i++) {
            var particle;
            if (particlesPool.length) {
                particle = particlesPool.pop();
            } else {
                particle = new Particle();
            }
            this.mesh.add(particle.mesh);
            particle.mesh.visible = true;
            particle.mesh.position.y = pos.y;
            particle.mesh.position.x = pos.x;
            particle.explode(pos, color, scale);
        }
    }
}