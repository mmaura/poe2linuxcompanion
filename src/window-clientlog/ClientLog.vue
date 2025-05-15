<template>
  <div class="p-4 overflow-y-auto h-full">
    <Buyer v-for="(buyer, index) in buyers" :key="index" :buyer="buyer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BUYER } from '../../shared/types';
import Buyer from './Buyer.vue';

const buyers = ref<BUYER[]>([]);

onMounted(() => {
  // Abonnement au flux IPC pour chaque nouvelle ligne
  window.clientlog.onNewBuyer((buyer: BUYER) => {
    console.log(buyer);
    buyers.value.push(buyer);
  });
});
</script>
