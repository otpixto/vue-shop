<template>

  <h1 class="align-self-center">Интернет магазин</h1>

  <div class="row">
    <div class="col-md-6" v-for="category in store.getters.categoriesWithGoods" :key="category">
      <div class="category-block">
        <div class="category-block-header">
          <a class="category-block-button">
            <font-awesome-icon icon="angle-down"/>
          </a>
          {{ category.categoryName }}
        </div>

        <div class="row">
          <table>
            <tr>
              <td v-for="(good, index) in category.categoryGoods" :key="good">
                {{ good.name }} {{ index }}

              </td>

            </tr>
          </table>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import {createStore} from 'vuex';
import Axios from 'axios';
import {library} from "@fortawesome/fontawesome-svg-core";
import {faAngleDown, faAngleUp} from "@fortawesome/free-solid-svg-icons";

library.add(faAngleDown);
library.add(faAngleUp);

// Create a new store instance.
const store = createStore({
  state() {
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

      for (let categoryId in namesValue) {

        let numericCategoryId = Number(categoryId);

        let categoryGoods = [];

        state.data.value.filter((item) => {

          if (numericCategoryId === item["G"]) {

            let numericGoodId = Number(item['T']);

            let goodsNamesList = namesValue[categoryId]['B'];

            for (let nameIndex in goodsNamesList) {

              let nameItem = goodsNamesList[nameIndex];
              let numericNameIndex = Number(nameIndex);

              if (numericGoodId === numericNameIndex) {

                categoryGoods.push({
                  id: numericGoodId,
                  price: item['C'],
                  name: nameItem['N'],
                  leftover: item['P'],
                });

              }
            }
          }

        });

        if (categoryGoods.length) {
          returnData.push({
            categoryId: Number(categoryId),
            categoryName: namesValue[categoryId]['G'],
            categoryGoods: categoryGoods
          });
        }
      }

      return returnData;
    },
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
  text-align: center;
}

.category-block-header {
  background-color: lightblue;
  border-bottom: 1px solid gray;
}

.category-block-button {
  margin: 8px 3px;
}

.good-wrapper {
  margin: 0;
  padding: 0;
  border-right: 1px solid gray;
  border-bottom: 1px solid gray;
}
</style>
