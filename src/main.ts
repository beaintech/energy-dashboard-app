import { createApp } from 'vue';
import App from './App.vue';
import './styles/main.scss';

import store from './store/index.ts';
import router from './router/index.ts';

createApp(App).use(store).use(router).mount('#app');
