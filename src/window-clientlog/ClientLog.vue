<template>
  <h1>Client Log</h1>
  <div class="p-4 overflow-y-auto h-full">
    <ClientLogLine
      v-for="(line, index) in logLines"
      :key="index"
      :date="line.date"
      :message="line.message"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ClientLogLine from './ClientLogLine.vue';

type LogLine = {
  date: string;
  message: string;
};

const logLines = ref<LogLine[]>([]);

onMounted(() => {
  // Abonnement au flux IPC pour chaque nouvelle ligne
  window.clientlog?.onNewLine?.((logLine: string) => {
    const [date, ...rest] = logLine.split(' ');
    const message = rest.join(' ');
    logLines.value.push({ date, message });
  });
});
</script>
