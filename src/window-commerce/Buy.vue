<template>
  <div class="flex gap-2 py-1">
    <span class="text-sm text-gray-500">{{ buyer.playername }}</span>
    <span class="text-sm text-gray-500"
      >{{ buyer.price.quantity }}x <img :src="img"
    /></span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BUYER } from '../../shared/types';
import alchIcon from '@/assets/currency/39px-Orb_of_Alchemy_inventory_icon.png';

const img = ref('');

const props = defineProps<{
  buyer: BUYER;
}>();

switch (props.buyer.price.currency) {
  case 'alch':
    img.value = alchIcon;
    break;
}
</script>
