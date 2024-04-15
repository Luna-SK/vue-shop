import { createApp } from 'vue'
import App from './App.vue'

// import vue-router
import router from './router'

// import element-plus icons
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// import global css
import '@/assets/css/global.css'

import 'element-plus/dist/index.css'

import axios from 'axios'
axios.defaults.baseURL = 'http://trial:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
});

const app = createApp(App)

app.use(router)

// register element-plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
