import { createStore } from 'vuex';
import { devices } from './devices.ts';

export default createStore({
  modules: { devices }
});
