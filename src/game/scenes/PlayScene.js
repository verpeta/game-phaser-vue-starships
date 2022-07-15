import {Scene} from 'phaser'
import {io} from "socket.io-client";
import LaserGroup from "@/game/components/LaserGroup"

export default class PlayScene extends Scene {
    scoreText;
    score = 0;
    otherPlayers;
    laserGroup;

    constructor() {
        super({key: 'PlayScene'})
    }

    create() {
        this.initWS();
        this.sound.add('bang')
        this.otherPlayers = this.physics.add.group();

        this.scoreText = this.add.text(5, 5, 'Points: ' + this.score, {font: '18px Arial', fill: '#ffdd32'});
        this.cursors = this.input.keyboard.createCursorKeys();
        this.laserGroup = new LaserGroup(this);


        this.addEvents();
        this.addBug();
        this.createBackground();
    }


    update() {
        // this.physics.add.collider(this.ball, this.paddle, this.ballHitPaddle, null, this);
        if(this.spceBack) {
            this.spceBack.tilePositionY -= 1;
        }
        if (this.ship) {
            if (this.cursors.left.isDown) {
                this.ship.setAngularVelocity(-150);
            } else if (this.cursors.right.isDown) {
                this.ship.setAngularVelocity(150);
            } else {
                this.ship.setAngularVelocity(0);
            }

            if (this.cursors.up.isDown) {
                this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
            } else {
                this.ship.setAcceleration(0);
            }


            this.physics.world.wrap(this.ship, 5);
            this.physics.world.wrap(this.bug, 5);

            var x = this.ship.x;
            var y = this.ship.y;
            var r = this.ship.rotation;
            if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
                this.socket.emit('playerMovement', {x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation});
            }
// save old position data
            this.ship.oldPosition = {
                x: this.ship.x,
                y: this.ship.y,
                rotation: this.ship.rotation
            };

            this.inputKeys.forEach(key => {
                // If key was just pressed down, shoot the laser. We use JustDown to make sure this only fires once.
                if (Phaser.Input.Keyboard.JustDown(key)) {
                    this.shootLaser();
                }
            });
        }

    }

    addBug() {
        this.bug = this.physics.add.image(-100, 120, 'bug1').setOrigin(0.5, 0.5).setDisplaySize(70, 70);
        this.bug.setVelocityX(100);
        this.physics.world.wrap(this.bug, 5);
        console.log(this.bug);
    }

    initWS() {
        let self = this;
        this.socket = io("http://localhost:3005");
        this.socket.on('currentPlayers', function (players) {
            Object.keys(players).forEach(function (id) {
                if (players[id].playerId === self.socket.id) {
                    self.addPlayer(self, players[id]);
                } else {
                    self.addOtherPlayers(self, players[id]);
                }
            });
        });
        this.socket.on('newPlayer', function (playerInfo) {
            console.log(playerInfo)

            self.addOtherPlayers(self, playerInfo);
        });
        this.socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });
        this.socket.on('disconnected', function (playerId) {
            console.log(playerId)
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });
        this.socket.on('starLocation', function (starLocation) {
            if (self.star) self.star.destroy();
            self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
            self.physics.add.overlap(self.ship, self.star, function () {
                this.socket.emit('starCollected');
            }, null, self);
        });

        this.blueScoreText = this.add.text(16, 16, '', {fontSize: '32px', fill: '#0000FF'});
        this.redScoreText = this.add.text(584, 16, '', {fontSize: '32px', fill: '#FF0000'});

        this.socket.on('scoreUpdate', function (scores) {
            self.blueScoreText.setText('Blue: ' + scores.blue);
            self.redScoreText.setText('Red: ' + scores.red);
        });
    }

    addPlayer(self, playerInfo) {
        self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(53, 40);

        if (playerInfo.team === 'blue') {
            self.ship.setTint(0x0000ff);
        } else {
            self.ship.setTint(0xff0000);
        }

        self.ship.setDrag(100);
        self.ship.setAngularDrag(100);
        self.ship.setMaxVelocity(300);
    }

    addOtherPlayers(self, playerInfo) {
        const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        if (playerInfo.team === 'blue') {
            otherPlayer.setTint(0x0000ff);
        } else {
            otherPlayer.setTint(0xff0000);
        }
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
    }


    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();
        // this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();

        //  this.platforms.create(600, 400, 'platform');
        // this.platforms.create(50, 250, 'platform');
        //  this.platforms.create(750, 220, 'platform');
    }

    addEvents() {


        this.input.on('pointerdown', pointer => {
            this.shootLaser();
        });

        this.inputKeys = [
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
        ];
    }

    shootLaser() {
        let self = this;
        let laser = this.laserGroup.fireLaser(this.ship.x, this.ship.y, this.ship);

        this.physics.add.overlap(laser, this.bug, function (laser, bug) {
            if (laser.active && bug.active) {
                this.bug.setActive(false);
                this.bug.setVisible(false);
                laser.setActive(false);
                laser.setVisible(false);
                self.addBug();
            }
        }, null, this);
    }

    createBackground() {
        this.spceBack = this.add.tileSprite(this.cameras.main.width / 2, this.cameras.main.height / 2,
            750,
            600,
            'space'
        );
        let scaleX = this.cameras.main.width / this.spceBack.width
        let scaleY = this.cameras.main.height / this.spceBack.height
        let scale = Math.max(scaleX, scaleY)
        this.spceBack.setScale(scale).setScrollFactor(1).setDepth(-1);
            // .setScale(3,3);
    }
}
