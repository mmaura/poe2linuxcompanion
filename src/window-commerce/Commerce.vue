<template>
  <div ref="content" class="p-4 overflow-y-auto h-full buyer-container">
    <template v-for="(buyer, index) in buyers" :key="buyer.id">
      <Sell class="fadein" :buyer="buyer" @destroy="removeBuyer(buyer.id)" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from 'vue';
import { Buyer, Message } from '../../shared/types'; // Importez les deux types
import Sell from './Sell.vue';
import { Commerce } from '../../shared/ipc-events';

const buyers = reactive<Buyer[]>([]);
const content = ref<HTMLElement | null>(null);

onMounted(() => {
  adjustWindowHeight();

  window.commerce.onPushBuyer((buyer: Buyer) => {
    buyers.push(buyer);

    nextTick(() => {
      adjustWindowHeight();
    });
  });

  window.commerce.onUpdateBuyer((id: number, updates: Partial<Buyer>) => {
    updateBuyer(id, updates);
    nextTick(() => {
      adjustWindowHeight();
    });
  });
});

function updateBuyer(id: number, updates: Partial<Buyer>) {
  const buyerIndex = buyers.findIndex((b) => b.id === id);
  if (buyerIndex !== -1) {
    Object.assign(buyers[buyerIndex], updates);
    if (updates.messages) {
      addMessagesToBuyer(buyers[buyerIndex], updates.messages);
    }
  } else {
    console.log('buyer inexistant.');
  }
}

function addMessagesToBuyer(buyer: Buyer, newMessages: Message[]) {
  buyer.messages = buyer.messages || [];
  buyer.messages.push(...newMessages);
}

function removeBuyer(id: number = -1) {
  const buyerIndex = buyers.findIndex((b) => b.id === id);

  if (buyerIndex !== -1) {
    const buyerToRemove = buyers[buyerIndex];

    window.ipcRenderer.send(Commerce.SPLICE_BUYER, buyerToRemove.id);
    buyers.splice(buyerIndex, 1);

    nextTick(() => {
      adjustWindowHeight();
    });
  } else {
    console.warn(`Acheteur avec l'ID ${id} non trouvé.`);
  }
}

function adjustWindowHeight() {
  if (content.value && window.ipcRenderer) {
    const height = content.value.offsetHeight + 1;
    window.ipcRenderer.send(Commerce.SET_WINDOW_HEIGHT, height);
  }
}
</script>

<style>
body {
  padding: 0px;
  margin: 0px;
}

.buyer-container {
  width: 100%;
}

.fadein {
  opacity: 0;
  animation: fadeIn 2s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
