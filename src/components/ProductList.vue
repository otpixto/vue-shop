<template>

  <h1 class="align-self-center">Интернет магазин</h1>

  <div class="row">
    <div class="col-md-6" v-for="category in store.getters.categoriesWithGoods" :key="category">
      <div class="category-block">
        <div class="category-block-header">
          <a class="category-block-button">
            <font-awesome-icon icon="angle-down" />
          </a>
          {{ category.categoryName }}
        </div>
      </div>
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
import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

library.add(faAngleDown);
library.add(faAngleUp);

// Create a new store instance.
const store = createStore({
  state () {
    return {
      data: [],
      names: {},
      categoriesWithGoods: [],
    }
  },
  getters: {
    categoriesWithGoods: state => {
      let returnData = [];
      let namesValue = state.names;

      for(let categoryId in namesValue) {

        let numericCategoryId = Number(categoryId);

        returnData.push({
          categoryId: Number(categoryId),
          categoryName: namesValue[categoryId]['G'],
        })

        let categoryGoods = [];

        state.data.value.filter((item) => {
          if (numericCategoryId === item["G"]) {

            let numericGoodId = Number(item['T']);

            let goodsNamesList = namesValue[categoryId]['B'];

            for(let nameIndex in goodsNamesList) {

              let nameItem = goodsNamesList[nameIndex];

              if (numericCategoryId === nameItem["G"]) {

                categoryGoods.push({
                  id: numericGoodId,
                  price: item['C'],
                  name: nameItem['N'],
                  leftover: item['P'],
                });

              }
            })

          }
        });

        console.log( categoryGoods );
      }

      // for(let index in dataValue) {
      //   console.log( dataValue[index] );
      // }

      return returnData;
    },
    // data: state => {
    //   return state.data;
    // },
    // names: state => {
    //   let returnData = [];
    //   let namesValue = state.names;
    //
    //   for(let index in namesValue) {
    //
    //     let goodsList = namesValue[index]['B'];
    //
    //     let goodsArray = []
    //     for(let goodId in goodsList) {
    //       let numericGoodId = Number(goodId);
    //       let price = 0;
    //
    //       state.products.value.filter((item) => {
    //         if (numericGoodId === item["T"]) {
    //           price = item['C'];
    //         }
    //       });
    //
    //       goodsArray.push({
    //         id: goodId,
    //         name: goodsList[goodId]['N'],
    //         price: price
    //       });
    //     }
    //
    //     returnData.push({
    //       categoryName: namesValue[index]['G'],
    //       goods: goodsArray,
    //     })
    //   }
    //   return returnData;
    // },
  },
  mutations: {
    setData(state, data) {
      state.data.value = data;
    },
    setNames(state, data) {
      state.names = data;
    }
  },
  actions: {
    getData: async (context) => {
      let {data} = await Axios.get("/json/data.json");
      context.commit('setData', data['Value']['Goods']);
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

store.dispatch('getData');
store.dispatch('getNames');

</script>

<style scoped>

.category-block {
  margin: 5px;
  border: 1px solid gray;
  border-radius: 5px 5px 0 0;
}

h1 {
  text-align:center;
}

.category-block-header {
  background-color: lightblue;
  border-bottom: 1px solid gray;
}
.category-block-button {
  margin: 8px 3px;
}
</style>
