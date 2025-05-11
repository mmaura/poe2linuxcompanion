<script setup lang="ts">
function ShowWindow() {
  window.ipcRenderer?.invoke('configuration-show-window');
  //window.configuration.ShowWindow();
}
</script>

<template>
  <img src="/logo.svg" alt="Logo" />
  <button @click="ShowWindow">configuration</button>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: transparent;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
