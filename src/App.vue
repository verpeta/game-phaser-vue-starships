<template>
  <div class="App">
    <header class="App-header">
      <template v-if="!initialize">
        <div @click="initializeGame" class="flex">
          <a href="#1" class="bttn">Initialize</a>
        </div>
      </template>
      <ion-phaser
          v-bind:game.prop="game"
          v-bind:initialize.prop="initialize"
      />
    </header>
  </div>
</template>

<script>
import Phaser from "phaser";
import BootScene from "@/game/scenes/BootScene";
import PlayScene from "@/game/scenes/PlayScene";

export default {
  data() {
    return {
      initialize: true,
      sc: PlayScene,
      game: {
        kek: "kek",
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
      this.initialize = true
    }
  },
}
</script>

<style lang="scss">
body {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
}
</style>
