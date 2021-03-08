
import {Game,Colors} from "../constant.js";
export class Sea {
    constructor() {
        this.init();
    }

    init() {
        var geom = new THREE.CylinderGeometry(Game.seaRadius, Game.seaRadius, Game.seaLength, 40, 10);
        geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        geom.mergeVertices();
        var l = geom.vertices.length;

        this.waves = [];

        for (var i = 0; i < l; i++) {
            var v = geom.vertices[i];
            //v.y = Math.random()*30;
            this.waves.push({
                y: v.y,
                x: v.x,
                z: v.z,
                ang: Math.random() * Math.PI * 2,
                amp: Game.wavesMinAmp + Math.random() * (Game.wavesMaxAmp - Game.wavesMinAmp),
                speed: Game.wavesMinSpeed + Math.random() * (Game.wavesMaxSpeed - Game.wavesMinSpeed)
            });
        };
        var mat = new THREE.MeshPhongMaterial({
            color: Colors.blue,
            transparent: true,
            opacity: .8,
            flatShading: THREE.FlatShading,
        });

        this.mesh = new THREE.Mesh(geom, mat);
        this.mesh.name = "waves";
        this.mesh.receiveShadow = true;
    }

    moveWaves(deltaTime) {
        var verts = this.mesh.geometry.vertices;
        var l = verts.length;
        for (var i = 0; i < l; i++) {
            var v = verts[i];
            var vprops = this.waves[i];
            v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
            v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;
            vprops.ang += vprops.speed * deltaTime;
            this.mesh.geometry.verticesNeedUpdate = true;
        }
    }
}