<template>
  <div class="flex gap-2 py-1">
    <span class="text-sm text-gray-500">{{ date }}</span>
    <span class="text-base">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  date: string;
  message: string;
}>();
</script>
