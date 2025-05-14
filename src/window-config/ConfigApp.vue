<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import debounce from 'lodash.debounce';
import HotKeyInput from './hotKeyInput.vue';

const poe2LogFile = ref('');
const sidekickURL = ref('');
const pricecheckShortcut = ref('');
const poe2RunAtStart = ref(false);

onMounted(async () => {
  poe2LogFile.value = await window.configuration.getPoe2LogFile();
  pricecheckShortcut.value = await window.configuration.getPricecheckShortcut();
  sidekickURL.value = await window.configuration.getSidekickURL();
  poe2RunAtStart.value = await window.configuration.getPoe2RunAtStart();
});

async function poe2logFileClick() {
  poe2LogFile.value = await window.configuration.ShowPoe2logFileDialog(
    poe2LogFile.value
  );
}

const sendPoe2LogFilePath = debounce((newValue: string) => {
  window.configuration?.sendPoe2LogFilePath(newValue);
}, 1500);

watch(poe2LogFile, (newValue) => {
  sendPoe2LogFilePath(newValue);
});

const sendSidekickURL = debounce((newValue: string) => {
  window.configuration.sendSidekickURL(newValue);
}, 1500);

watch(sidekickURL, (newValue) => {
  sendSidekickURL(newValue);
});

watch(poe2RunAtStart, (newValue) => {
  window.configuration.sendPoe2RunAtStart(newValue);
});
</script>

<template>
  <div>
    <h1>Configuration</h1>
    <h2>Général</h2>
    <input type="checkbox" v-model="poe2RunAtStart" />
    <label>Lancer Path of Exile 2 au démarage.</label>
    <h2>Client Log</h2>
    <label>Choisissez le fichier de log de POE2</label>
    <input v-model="poe2LogFile" />
    <button @click="poe2logFileClick">...</button>
    <h2>Vérificateur de prix</h2>
    <h3>SideKick</h3>
    <p>
      POE2LinuxCompanion utilise le serveur
      <a href="https://github.com/Sidekick-Poe/Sidekick">SideKick</a> pour
      vérifier les prix.<br />
      Vous pouvez installer le docker et renseigner l'url ci-dessous.
    </p>
    <label>Url du serveur SideKick</label>
    <input v-model="sidekickURL" /><br />
    <label>{{ pricecheckShortcut }}</label>
    <h3>Raccourcis</h3>
    <label>Chosissez les touches raccourcis pour vérifier le prix</label
    ><HotKeyInput
      feature_name="pricecheck"
      v-model:feature_shortcut="pricecheckShortcut"
    ></HotKeyInput>
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
