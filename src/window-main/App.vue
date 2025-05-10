<script setup lang="ts">
function ShowConfig(){
  console.log('showconfig');
  window.ipcRenderer?.invoke('open-config-window', 'conffff');
} 
</script>

<template>
    <img src="/logo.svg" alt="Logo">
    <button @click="ShowConfig">configuration</button>
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
