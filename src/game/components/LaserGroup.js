export default class LaserGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        // Call the super constructor, passing in a world and a scene
        super(scene.physics.world, scene);

        // Initialize the group
        this.createMultiple({
            classType: Laser, // This is the class we create just below
            frameQuantity: 10, // Create 30 instances in the pool
            active: false,
            visible: false,
            key: 'laser',
        });
    }

    fireLaser(x, y, ship) {
        // Get the first available sprite in the group
        const laser = this.getFirstDead(false);

        if (laser) {
            laser.fire(x, y, ship);
            return laser;
        }
    }

}

class Laser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'laser');

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.active) {
            if (!this.scene.cameras.main.worldView.contains(this.x, this.y)) {
                this.setActive(false);
                this.setVisible(false);
            }
        }
    }


    fire(x, y, ship) {


        // this.scene.physics.add.overlap(this, this.scene.bug, function (laser, bug) {
        //     if (laser.active) {
        //         bug.setActive(false);
        //         bug.setVisible(false);
        //     }
        // }, null, this);




        const vec = this.scene.physics.velocityFromAngle(ship.angle + 90, 10);

        this.body.reset(x + vec.x, y + vec.y);
        this.setAngle(ship.angle);
        this.setOrigin(0.5, 0.5);
        const vx = Math.sin(ship.rotation) * 150
        const vy = Math.cos(ship.rotation) * 150
        this.body.setVelocity(-vx * 5, vy * 5);
        this.setActive(true);
        this.setVisible(true);
    }
}
