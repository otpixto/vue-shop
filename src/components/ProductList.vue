<template>
  <div v-for="product in store.getters.products" :key="product">
{{product}}
  </div>
</template>

<script setup>
import { createStore } from 'vuex';
import Axios from 'axios';

// Create a new store instance.
const store = createStore({
  state () {
    return {
      names: [],
      products: {}
    }
  },
  getters: {
    products: state => {
      return state.products;
    },
    names: state => {
      return state.names;
    },
  },
  mutations: {
    setProducts(state, data) {
      state.products.value = data;
    },
    setNames(state, data) {
      state.names = data;
    }
  },
  actions: {
    getProducts: async (context) => {
      let {data} = await Axios.get("/json/data.json");
      context.commit('setProducts', data['Value']['Goods']);
    },
    getNames: async (context) => {
      let {data} = await Axios.get("/json/names.json");
      context.commit('setNames', data);
    },
  },
})

// const app = createApp({ 'App': App })

// Install the store instance as a plugin
// app.use(store)

store.dispatch('getProducts');
store.dispatch('getNames');

console.log( store.getters.products );

</script>

<style scoped>

</style>
