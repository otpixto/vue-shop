<template>

  <h1 class="align-self-center">Интернет магазин</h1>

  <div class="row">
    <div class="col-md-6 category-block" v-for="category in store.getters.categories" :key="category">
      {{ category.categoryName }}
    </div>
  </div>


<!--  <hr>-->

<!--  <div v-for="name in store.getters.names" :key="name">-->
<!--    {{ name }}-->
<!--    <div v-for="item in name" :key="item">-->
<!--      {{ item }}-->
<!--    </div>-->
<!--  </div>-->
</template>

<script setup>
import { createStore } from 'vuex';
import Axios from 'axios';

// Create a new store instance.
const store = createStore({
  state () {
    return {
      names: [],
      products: {},
      categories: [],
      goods: []
    }
  },
  getters: {
    categories: state => {
      let returnData = [];
      let namesValue = state.names;

      for(let categoryId in namesValue) {
        returnData.push({
          categoryId: Number(categoryId),
          categoryName: namesValue[categoryId]['G'],
        })
      }
      console.log(returnData);

      return returnData;
    },
    products: state => {
      //let returnData = [];
      let productsValue = state.products.value;
      for(let index in productsValue) {
        console.log(productsValue[index]['G']);
      }

      return state.products;
    },
    names: state => {
      let returnData = [];
      let namesValue = state.names;

      for(let index in namesValue) {

        let goodsList = namesValue[index]['B'];

        let goodsArray = []
        for(let goodId in goodsList) {
          let numericGoodId = Number(goodId);
          let price = 0;

          state.products.value.filter((item) => {
            if (numericGoodId === item["T"]) {
              price = item['C'];
            }
          });

          goodsArray.push({
            id: goodId,
            name: goodsList[goodId]['N'],
            price: price
          });
        }

        returnData.push({
          categoryName: namesValue[index]['G'],
          goods: goodsArray,
        })
      }
      return returnData;
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

</script>

<style scoped>

.category-block {
  padding: 5px;
  border: 1px solid gray;
  border-radius: 5px 5px 0 5px;
}

h1 {
  text-align:center;
}
</style>
