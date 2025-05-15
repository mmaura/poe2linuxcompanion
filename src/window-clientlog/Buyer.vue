<template>
  <div class="flex gap-2 py-1">
    <span class="text-sm text-gray-500">{{ buyer }}</span>
  </div>
</template>

<script setup lang="ts">
import { BUYER } from '../../shared/types';

defineProps<{
  buyer: BUYER;
}>();
</script>
