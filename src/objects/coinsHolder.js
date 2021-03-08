
import {Game} from "../constant.js";
import { Coin } from "./coin.js";
export class CoinsHolder {
    constructor(nCoins) {
        this.mesh = new THREE.Object3D();
        this.coinsInUse = [];
        this.coinsPool = [];
        this.nCoins = nCoins;
        this.init();
    }

    init() {
        for (var i = 0; i < this.nCoins; i++) {
            var coin = new Coin();
            this.coinsPool.push(coin);
        }
    }

    spawnCoins() {
        var nCoins = 1 + Math.floor(Math.random() * 10);
        var d = Game.seaRadius + Game.planeDefaultHeight + (-1 + Math.random() * 2) * (Game.planeAmpHeight - 20);
        var amplitude = 10 + Math.round(Math.random() * 10);
        for (var i = 0; i < nCoins; i++) {
            var coin;
            if (this.coinsPool.length) {
                coin = this.coinsPool.pop();
            } else {
                coin = new Coin();
            }
            this.mesh.add(coin.mesh);
            this.coinsInUse.push(coin);
            coin.angle = - (i * 0.02);
            coin.distance = d + Math.cos(i * .5) * amplitude;
            coin.mesh.position.y = -Game.seaRadius + Math.sin(coin.angle) * coin.distance;
            coin.mesh.position.x = Math.cos(coin.angle) * coin.distance;
        }
    }

    rotateCoins(particlesHolder,position,deltaTime,cb,ctx) {
        for (var i = 0; i < this.coinsInUse.length; i++) {
            var coin = this.coinsInUse[i];
            if (coin.exploding) continue;
            coin.angle += Game.speed * deltaTime * Game.coinsSpeed;
            if (coin.angle > Math.PI * 2) coin.angle -= Math.PI * 2;
            coin.mesh.position.y = -Game.seaRadius + Math.sin(coin.angle) * coin.distance;
            coin.mesh.position.x = Math.cos(coin.angle) * coin.distance;
            coin.mesh.rotation.z += Math.random() * .1;
            coin.mesh.rotation.y += Math.random() * .1;

            //var globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
            var diffPos = position.clone().sub(coin.mesh.position.clone());
            var d = diffPos.length();
            if (d < Game.coinDistanceTolerance) {
                this.coinsPool.unshift(this.coinsInUse.splice(i, 1)[0]);
                this.mesh.remove(coin.mesh);
                particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, 0x009999, .8);
                cb.call(ctx);
                i--;
            } else if (coin.angle > Math.PI) {
                this.coinsPool.unshift(this.coinsInUse.splice(i, 1)[0]);
                this.mesh.remove(coin.mesh);
                i--;
            }
        }
    }
}