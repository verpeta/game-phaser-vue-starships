import {Scene} from 'phaser'
import ship from '@/game/assets/spaceShips_001.png'
import enemy from '@/game/assets/enemy.png'
import laser from '@/game/assets/laser.png'
import space from '@/game/assets/image8.jpeg'
import star from '@/game/assets/star_gold.png'
import bug1 from '@/game/assets/bug1.webp'
import bug2 from '@/game/assets/bug2.png'


import bang from '@/game/assets/bang.wav'

export default class BootScene extends Scene {
    constructor() {
        super({key: 'BootScene'});
    }


    preload() {
        this.load.image('space', space)
        this.load.image('laser', laser)
        this.load.image('enemy', enemy)
        this.load.image('star', star)
        this.load.image('ship', ship)
        this.load.image('bug1', bug1)
        this.load.image('bug2', bug2)
        this.load.audio('bang', [bang])
    }

    create() {
         this.scene.start('PlayScene')

    }
}
