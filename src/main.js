import 'bootstrap/dist/css/bootstrap.min.css'
import { createApp } from 'vue'
import App from './components/App.vue'
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";


createApp(App).
component("font-awesome-icon", FontAwesomeIcon)
    .mount('#app')
