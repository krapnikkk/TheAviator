import * as THREE from "three";
import { Colors } from "../constant";
export class Cloud {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.mesh.name = "cloud";
        this.init();
    }

    init() {
        var geom = new THREE.CubeGeometry(20, 20, 20);
        var mat = new THREE.MeshPhongMaterial({
            color: Colors.white,

        });

        //*
        var nBlocs = 3 + Math.floor(Math.random() * 3);
        for (var i = 0; i < nBlocs; i++) {
            var m = new THREE.Mesh(geom.clone(), mat);
            m.position.x = i * 15;
            m.position.y = Math.random() * 10;
            m.position.z = Math.random() * 10;
            m.rotation.z = Math.random() * Math.PI * 2;
            m.rotation.y = Math.random() * Math.PI * 2;
            var s = .1 + Math.random() * .9;
            m.scale.set(s, s, s);
            this.mesh.add(m);
            m.castShadow = true;
            m.receiveShadow = true;

        }
    }

    rotate() {
        var l = this.mesh.children.length;
        for (var i = 0; i < l; i++) {
            var m = this.mesh.children[i];
            m.rotation.z += Math.random() * .005 * (i + 1);
            m.rotation.y += Math.random() * .002 * (i + 1);
        }
    }
}