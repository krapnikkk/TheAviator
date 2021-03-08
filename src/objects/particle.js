import * as THREE from "three";
import { TweenMax,Power2 } from "gsap";
import {particlesPool} from "../constant.js";
export class Particle {
    constructor() {
        var geom = new THREE.TetrahedronGeometry(3, 0);
        var mat = new THREE.MeshPhongMaterial({
            color: 0x009999,
            shininess: 0,
            specular: 0xffffff,
            flatShading: THREE.FlatShading
        });
        this.mesh = new THREE.Mesh(geom, mat);
    }

    explode(pos, color, scale) {
        var _p = this.mesh.parent;
        this.mesh.material.color = new THREE.Color(color);
        this.mesh.material.needsUpdate = true;
        this.mesh.scale.set(scale, scale, scale);
        var targetX = pos.x + (-1 + Math.random() * 2) * 50;
        var targetY = pos.y + (-1 + Math.random() * 2) * 50;
        var speed = .6 + Math.random() * .2;
        TweenMax.to(this.mesh.rotation, speed, { x: Math.random() * 12, y: Math.random() * 12 });
        TweenMax.to(this.mesh.scale, speed, { x: .1, y: .1, z: .1 });
        TweenMax.to(this.mesh.position, speed, {
            x: targetX, y: targetY, delay: Math.random() * .1, ease: Power2.easeOut, onComplete:  ()=> {
                if (_p) _p.remove(this.mesh);
                this.mesh.scale.set(1, 1, 1);
                particlesPool.unshift(this);
            }
        });
    }
}