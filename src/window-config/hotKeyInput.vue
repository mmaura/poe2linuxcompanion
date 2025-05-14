<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  feature_name: string,
  feature_shortcut: string,
}>();


const keys = ref<string[]>([]);
const recording = ref(false);
const display = ref('');

watch(() => props.feature_shortcut, (newVal) => {
  if (!recording.value) {
    display.value = newVal;
  }
});


const emit = defineEmits<{
  (e: 'update:feature_shortcut', value: string): void
}>();

const startRecording = () => {
  keys.value = [];
  recording.value = true;
};

const onKeyUp = (e: KeyboardEvent) => {
  recording.value = false;
  display.value = keys.value.join('+');
  console.log(`saving: ${display.value}, ${props.feature_name}` )
  window.configuration.saveHotkey(display.value, props.feature_name); // Sauvegarde via IPC
  emit('update:feature_shortcut', display.value);
};

const onKeyDown = (e: KeyboardEvent) => {
  if (!recording.value) return;

  e.preventDefault();
  const key = e.key;

if (key.length === 1 || ['Shift', 'Control', 'Alt', 'Meta'].includes(key)) {
  keys.value.push(key);
}

  display.value = keys.value.join('+');
};

onMounted(() => {
  display.value = props.feature_shortcut;

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
});

</script>

<template>
  <div>
    <button @click="startRecording">🎙️ Enregistrer un raccourci</button>
    <span v-if="recording">Appuyez sur une combinaison de touches…</span>
    <div class="border p-2 mt-2 bg-gray-100 rounded">
      {{ display }}
    </div>
  </div>
</template>
