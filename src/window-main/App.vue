<script setup lang="ts">
async function Hide() {
  window.ipcRenderer.send('hide-mainwindow');
}
</script>

<template>
  <div class="overlay-container" @click="Hide">
    <h1>Chargement ...</h1>
  </div>
</template>

<style scoped>
.overlay-container {
  display: block;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  /* background-color: transparent; */
  background-image: url('/logo.png');
  backdrop-filter: blur(6px);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.logo {
  width: auto;
  height: 100%;
  margin-bottom: 20px;
}
</style>
