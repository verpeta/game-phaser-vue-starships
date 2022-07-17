<template>
  <div class="App">
    <div>
      <router-link to="/">home</router-link>
      <router-link to="/game">Game</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>

export default {}
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
