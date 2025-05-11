import { createApp } from 'vue';
import ClientLog from './ClientLog.vue';

createApp(ClientLog)
  .mount('#clientlog')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
