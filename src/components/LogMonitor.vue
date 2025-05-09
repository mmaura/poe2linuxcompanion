<script setup lang="ts">
import { ref, onMounted } from 'vue';

const POE2logPath = ref('');
const lastLine = ref('');

function setPath() {
  window.electronAPI.setLogPath(POE2logPath.value);
}

onMounted(() => {
  window.electronAPI.onLogUpdate((line) => {
    lastLine.value = line;
  });
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">Poe2LinuxCompanion</h1>
    <input v-model="POE2logPath" placeholder="Chemin du log" class="border px-2 py-1 mr-2" />
    <button @click="setPath" class="bg-blue-600 text-white px-4 py-1 rounded">Valider</button>
    <p class="mt-4">Dernière ligne : <code>{{ lastLine }}</code></p>
  </div>
</template>