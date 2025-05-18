<template>
  <div ref="content" class="p-4 overflow-y-auto h-full buyer-container">
    <template v-for="(buyer, index) in buyers" :key="buyer.id">
      <Sell class="fadein" :buyer="buyer" @destroy="removeBuyer(buyer.id)" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from 'vue';
import { BUYER, Message } from '../../shared/types'; // Importez les deux types
import Sell from './Sell.vue';

const buyers = reactive<BUYER[]>([]);
const content = ref<HTMLElement | null>(null);

onMounted(() => {
  adjustWindowHeight();

  window.commerce.onNewBuyer((buyer: BUYER) => {
    const index = buyers.findIndex((b) => b.id === buyer.id);
    if (index === -1) {
      buyers.push(buyer);
    } else {
      Object.assign(buyers[index], buyer); // mise à jour partielle
    }
    nextTick(() => {
      adjustWindowHeight();
    });
  });

  window.commerce.onUpdateBuyer(
    (playername: string, updates: Partial<BUYER>) => {
      console.log(`update: ${playername}`, updates);
      updateBuyer(playername, updates);
      nextTick(() => {
        adjustWindowHeight();
      });
    }
  );

  window.commerce.onUpdateBuyerId((id: string, updates: Partial<BUYER>) => {
    console.log(`update: ${id}`, updates);
    updateBuyerId(id, updates);
    nextTick(() => {
      adjustWindowHeight();
    });
  });
});

function updateBuyer(playername: string, updates: Partial<BUYER>) {
  const buyerIndex = buyers.findIndex((b) => b.playername === playername);
  if (buyerIndex !== -1) {
    Object.assign(buyers[buyerIndex], updates);
    if (updates.messages) {
      addMessagesToBuyer(buyers[buyerIndex], updates.messages);
    }
  } else {
    console.log('buyer inexistant.');
  }
}

function updateBuyerId(id: string, updates: Partial<BUYER>) {
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

function addMessagesToBuyer(buyer: BUYER, newMessages: Message[]) {
  buyer.messages = buyer.messages || [];
  buyer.messages.push(...newMessages);
}

function removeBuyer(id: string) {
  const index = buyers.findIndex((buyer) => buyer.id === id);

  window.ipcRenderer.send('commerce-remove-buyer', buyers[index].id);

  if (index !== -1) {
    buyers.splice(index, 1); // Supprime l'acheteur de la liste
    nextTick(() => {
      adjustWindowHeight();
    });
  }
}

function adjustWindowHeight() {
  if (content.value && window.ipcRenderer) {
    const height = content.value.offsetHeight + 1;
    window.ipcRenderer.send('set-window-height', height);
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
