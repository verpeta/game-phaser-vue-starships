<template>
  <div>
    <div>
      <h3>Welcome to the Magic Game!</h3>
      <div>
        <span>Players On-line:</span>
        <ul>
          <template v-for="player in onlinePlayers">
            <li v-if="player">
              {{ player.nickname }}
            </li>
          </template>

        </ul>
      </div>
      <input type="text" v-model="username" placeholder="Enter your nickname"/>
    </div>
    <button @click="initializeGame" v-if="!initialize">Launch Game</button>
  </div>
  <div class="game-container">
    <ion-phaser
        v-bind:game.prop="game"
        v-bind:initialize.prop="initialize"
    />
  </div>
</template>

<script>

import Phaser from "phaser";
import BootScene from "@/game/scenes/BootScene";
import PlayScene from "@/game/scenes/PlayScene";
import axios from "axios";

export default {
  name: "Game",
  data() {
    return {
      onlinePlayers: [],
      username: "Potter",
      initialize: false,
      sc: PlayScene,
      game: {
        type: Phaser.AUTO,
        width: 750,
        height: 600,
        physics: {
          default: 'arcade',
          arcade: {
            debug: false
          }
        },
        scene: [BootScene, PlayScene]
      }
    }
  },
  methods: {
    initializeGame: function () {
      axios.post("api/user/add", {nickname: this.username}).then(function (data) {
        console.log(data.data);
        if (data.data.errors) {
          alert(data.data.errors[0]);
        } else {
          this.$store.dispatch('setCurrentPlayer', {
            nickname: this.username
          });
          this.initialize = true
        }
      }.bind(this));
    }
  },
  created() {
    axios.get("api/user/all").then(function (response) {
      this.onlinePlayers = response.data.players;
    }.bind(this));
  },
  watch: {
    username: function (o, n) {
      console.log("updated username");
      console.log(n);
    }
  }
}
</script>
