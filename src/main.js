import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from "axios";

import { defineCustomElements as defineIonPhaser } from '@ion-phaser/core/loader'
import domains from "@/config/domains";


defineIonPhaser(window);

axios.defaults.baseURL = domains.server;


createApp(App)
  .use(router)
  .use(store)
  .mount('#app')
