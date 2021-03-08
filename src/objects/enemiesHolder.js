import * as THREE from "three";
import { Enemy } from "./enemy";
import { Game, enemiesPool,Colors } from "../constant.js";
export class EnemiesHolder {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.enemiesInUse = [];
    }

    spawnenemies() {
        var enemies = Game.level;

        for (var i = 0; i < enemies; i++) {
            var enemy;
            if (enemiesPool.length) {
                enemy = enemiesPool.pop();
            } else {
                enemy = new Enemy();
            }

            enemy.angle = - (i * 0.1);
            enemy.distance = Game.seaRadius + Game.planeDefaultHeight + (-1 + Math.random() * 2) * (Game.planeAmpHeight - 20);
            enemy.mesh.position.y = -Game.seaRadius + Math.sin(enemy.angle) * enemy.distance;
            enemy.mesh.position.x = Math.cos(enemy.angle) * enemy.distance;

            this.mesh.add(enemy.mesh);
            this.enemiesInUse.push(enemy);
        }
    }

    rotateEnemies(deltaTime,position,ambientLight,particlesHolder,cb,ctx) {
        for (var i = 0; i < this.enemiesInUse.length; i++) {
            var enemy = this.enemiesInUse[i];
            enemy.angle += Game.speed * deltaTime * Game.enemiesSpeed;

            if (enemy.angle > Math.PI * 2) enemy.angle -= Math.PI * 2;

            enemy.mesh.position.y = -Game.seaRadius + Math.sin(enemy.angle) * enemy.distance;
            enemy.mesh.position.x = Math.cos(enemy.angle) * enemy.distance;
            enemy.mesh.rotation.z += Math.random() * .1;
            enemy.mesh.rotation.y += Math.random() * .1;

            //var globalenemyPosition =  enemy.mesh.localToWorld(new THREE.Vector3());
            var diffPos = position.clone().sub(enemy.mesh.position.clone());
            var d = diffPos.length();
            if (d < Game.enemyDistanceTolerance) {
                particlesHolder.spawnParticles(enemy.mesh.position.clone(), 15, Colors.red, 3);

                enemiesPool.unshift(this.enemiesInUse.splice(i, 1)[0]);
                this.mesh.remove(enemy.mesh);
                Game.planeCollisionSpeedX = 100 * diffPos.x / d;
                Game.planeCollisionSpeedY = 100 * diffPos.y / d;
                ambientLight.intensity = 2;
                cb.call(ctx);
                i--;
            } else if (enemy.angle > Math.PI) {
                enemiesPool.unshift(this.enemiesInUse.splice(i, 1)[0]);
                this.mesh.remove(enemy.mesh);
                i--;
            }
        }
    }

    


}