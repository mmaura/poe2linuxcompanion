import { createApp } from 'vue';
import Commerce from './Commerce.vue';

createApp(Commerce)
  .mount('#Commerce')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
