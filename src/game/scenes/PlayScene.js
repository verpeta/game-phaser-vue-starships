import {Scene} from 'phaser'
import {io} from "socket.io-client";
import LaserGroup from "@/game/components/LaserGroup"
import store from "@/store/index"
import domains from "@/config/domains";

export default class PlayScene extends Scene {
    scoreText;
    score = 0;
    otherPlayers;
    laserGroup;
    #bangAudio;
    #mainSound;

    constructor() {
        super({key: 'PlayScene'})
    }

    create() {
        // store.subscribe((mutation, state) => {
        //     console.log(mutation)
        //     console.log(mutation.payload)
        // })
        //store.dispatch('createTeam',{name:"great"});

        this.initWS();
        this.#bangAudio = this.sound.add('bang', {volume: 0.2})
        this.#mainSound = this.sound.add('mainSong', {volume: 1})
        this.otherPlayers = this.physics.add.group();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.laserGroup = new LaserGroup(this);


        this.addEvents();
        this.addBug();
        this.addBug2();
        this.createBackground();

        this.#mainSound.play();
    }


    update() {
        if(this.spceBack) {
            this.spceBack.tilePositionY -= 1;
        }
        if (this.ship) {
            if (this.cursors.left.isDown) {
                this.ship.setAngularVelocity(-300);
                this.ship.setAcceleration(0);
            } else if (this.cursors.right.isDown) {
                this.ship.setAngularVelocity(300);
                this.ship.setAcceleration(0);
            } else {
                this.ship.setAngularVelocity(0);
                this.ship.setAcceleration(0);
            }

            if (this.cursors.up.isDown) {
                this.physics.velocityFromRotation(this.ship.rotation + 1.5, 500, this.ship.body.acceleration);
            } else {
                this.ship.setAcceleration(0);
            }


            this.physics.world.wrap(this.ship, 5);
            this.physics.world.wrap(this.bug, 5);
            this.physics.world.wrap(this.bug2, 5);

            var x = this.ship.x;
            var y = this.ship.y;
            var r = this.ship.rotation;
            if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
                this.ship.alias.x = x;
                this.ship.alias.y = y+25;
                this.socket.emit('playerMovement', {x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation});
            }

            this.ship.oldPosition = {
                x: this.ship.x,
                y: this.ship.y,
                rotation: this.ship.rotation
            };

            this.inputKeys.forEach(key => {
                if (Phaser.Input.Keyboard.JustDown(key)) {
                    this.shootLaser();
                }
            });
        }

    }

    addBug() {
        this.bug = this.physics.add.image(0, this.#getRndInteger(0,600), 'bug1').setOrigin(0.5, 0.5).setDisplaySize(70, 70);
        this.bug.setVelocityX(100);
        this.physics.world.wrap(this.bug, 5);
    }

    addBug2() {
        this.bug2 = this.physics.add.image(0, this.#getRndInteger(0,600), 'bug2').setOrigin(0.5, 0.5).setDisplaySize(80, 60);
        this.bug2.setVelocityX(200);
        this.physics.world.wrap(this.bug2, 5);
    }

    initWS() {
        let self = this;

        if(!store.getters.stateCurrentPlayer.nickname){
            throw new Error("Nickname - required!!!");
        }

        const socket = io(domains.server, {
            auth: {
                user: store.getters.stateCurrentPlayer.nickname,
            }
        });
        socket.on('currentPlayers', function (players) {
            Object.keys(players).forEach(function (id) {
                if(!players[id]){
                    return;
                }
                if (players[id].playerId === socket.id) {
                    self.addPlayer(self, players[id]);
                } else {
                    self.addOtherPlayers(self, players[id]);
                }
            });
        });
        socket.on('newPlayer', function (playerInfo) {
            console.log(playerInfo)

            self.addOtherPlayers(self, playerInfo);
        });
        socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                    otherPlayer.alias.x = playerInfo.x;
                    otherPlayer.alias.y = playerInfo.y+20;
                }
            });
        });

        socket.on('disconnect', function (reason) {
            console.log(reason, "disconnected")
            alert("Connection with server - Lost! \nExiting...");
            window.location.reload();
        });

        socket.on('player-gone', function (id) {
            console.log(id, "player-gone");
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (id === otherPlayer.playerId) {
                    otherPlayer.alias.destroy();
                    otherPlayer.destroy();
                }
            });
        });
        socket.on('starLocation', function (starLocation) {
            if (self.star) self.star.destroy();
            self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
            self.physics.add.overlap(self.ship, self.star, function () {
                self.star.destroy();
                socket.emit('starCollected');
            }, null, self);
        });

        this.blueScoreText = this.add.text(16, 16, '', {fontSize: '32px', fill: '#0000FF'});
        this.redScoreText = this.add.text(584, 16, '', {fontSize: '32px', fill: '#FF0000'});

        this.blueKillsText = this.add.text(18, 45, '', {fontSize: '20px', fill: 'orange'});
        this.redKillsText = this.add.text(586, 45, '', {fontSize: '20px', fill: 'orange'});

        socket.on('scoreUpdate', function (scores) {
            self.blueScoreText.setText('Blue: ' + scores.blue);
            self.redScoreText.setText('Red: ' + scores.red);
        });

        socket.on('killCountUpdate', function (killed) {
            self.blueKillsText.setText('Killed: ' + killed.blue);
            self.redKillsText.setText('Killed: ' + killed.red);
        });

        this.socket = socket;
    }

    addPlayer(self, playerInfo) {

        self.ship =
            self.physics.add.sprite(playerInfo.x, playerInfo.y, 'ship')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(55, 80);

        self.anims.create({
            key: "ship_ani",
            frames: self.anims.generateFrameNumbers("ship", ),
            frameRate: 10,
            repeat: -1
        })
        self.ship.play("ship_ani");
        if (playerInfo.team === 'blue') {
         //   self.ship.setTint(0x0000ff);
        } else {
           // self.ship.setTint(0xff0000);
        }

        self.ship.setDrag(300);
        self.ship.setAngularDrag(100);
        self.ship.setMaxVelocity(300);

        self.ship.player = playerInfo;
        self.ship.alias = this.add.text(self.ship.x, self.ship.y+25, playerInfo.nickname, {font: '18px Arial', fill: 'green'});
    }

    addOtherPlayers(self, playerInfo) {
        const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        if (playerInfo.team === 'blue') {
            otherPlayer.setTint(0x0000ff);
        } else {
            otherPlayer.setTint(0xff0000);
        }
        otherPlayer.playerId = playerInfo.playerId;
        otherPlayer.alias = this.add.text(playerInfo.x, playerInfo.y+20, playerInfo.nickname, {font: '18px Arial', fill: '#ffdd32'});
        self.otherPlayers.add(otherPlayer);
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
                this.#bangAudio.play();
                this.socket.emit('bugKilled', {playerId: this.ship.player.playerId});
                this.bug.setActive(false);
                this.bug.setVisible(false);
                laser.setActive(false);
                laser.setVisible(false);
                self.addBug();
            }
        }.bind(this), null, this);
        this.physics.add.overlap(laser, this.bug2, function (laser, bug) {
            if (laser.active && bug.active) {
                this.#bangAudio.play();
                this.socket.emit('bugKilled', {playerId: this.ship.player.playerId});
                this.bug2.setActive(false);
                this.bug2.setVisible(false);
                laser.setActive(false);
                laser.setVisible(false);
                self.addBug2();
            }
        }.bind(this), null, this);
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
    }

    #getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }
}
