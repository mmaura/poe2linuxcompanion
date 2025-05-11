<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import debounce from 'lodash.debounce';

const poe2LogFile = ref('');

onMounted(async () => {
  poe2LogFile.value = await window.configuration.getPoe2LogFile();
  console.log(`get poe2 log file path : ${poe2LogFile.value}`);
});

async function poe2logFileClick() {
  poe2LogFile.value = await window.configuration.ShowPoe2logFileDialog(
    poe2LogFile.value
  );
}

const sendToElectron = debounce((newValue: string) => {
  window.configuration?.sendPoe2LogFilePath(newValue);
}, 500);

watch(poe2LogFile, (newValue) => {
  sendToElectron(newValue);
});
</script>

<template>
  <div>
    <h1>Configuration</h1>
    <label>Choisissez le fichier de log de POE2</label>
    <input v-model="poe2LogFile" />
    <button @click="poe2logFileClick">...</button>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
