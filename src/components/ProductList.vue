<template>

  <h1 class="align-self-center">Интернет магазин</h1>

  <div class="row">
    <div class="col-md-6" v-for="(category, categoryIndex) in store.getters.categoriesWithGoods" :key="category">
      <table class="table table-bordered table-hover">
        <tr class="category-block-header">
          <th colspan="2">
            {{ category.categoryName }}
          </th>
        </tr>
        <tr v-for="(i, index) in Math.ceil(category.categoryGoods.length/2)" :key="index">
          <td class="good-cell">
            <table class="good-table">
              <tr>
                <td>{{ category.categoryGoods[index * 2].name }} ({{ category.categoryGoods[index * 2].leftover }})</td>
                <td class="price-block">
                  {{ (category.categoryGoods[index * 2].price * store.getters.exchangeRate).toFixed(2) }}
                  <button @click="addToCart(categoryIndex, index * 2);" class="btn btn-sm btn-info">
                    <span class="cart-text">В корзину</span>
                  </button>
                </td>
              </tr>
            </table>
          </td>
          <td class="good-cell" v-if="index * 2 + 1 < category.categoryGoods.length">
            <table class="good-table">
              <tr>
                <td>{{ category.categoryGoods[index * 2 + 1].name }} ({{ category.categoryGoods[index * 2 + 1].leftover }})</td>
                <td class="price-block">
                  {{ (category.categoryGoods[index * 2 + 1].price * store.getters.exchangeRate).toFixed(2) }}
                  <button @click="addToCart(categoryIndex, index * 2 + 1);" class="btn btn-sm btn-info">
                    <span class="cart-text">В корзину</span>
                  </button>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <hr>

  <table class="table table-bordered table-hover" :class="[{tableSuccess: store.getters.exchangeRate >= store.getters.previousExchangeRate}]">
    <tr>
      <th>Наименование товара и описание</th>
      <th>Количество</th>
      <th>Цена</th>
    </tr>
    <tr v-for="cartItem in store.getters.cartItems" :key="cartItem">
      <td>
        {{ cartItem.name }}
      </td>
      <td>
        {{ cartItem.count }}
      </td>
      <td>
        {{ (cartItem.price * store.getters.exchangeRate).toFixed(2) }}
      </td>
    </tr>
  </table>

</template>

<script setup>
import {createStore} from 'vuex';
import Axios from 'axios';

const minExchangeRate = 20;
const maxExchangeRate = 80;

// Create a new store instance.
const store = createStore({
  state() {
    return {
      data: [],
      names: {},
      categoriesWithGoods: [],
      exchangeRate: 0,
      previousExchangeRate: 0,
      cartItems: [],
    }
  },
  getters: {
    exchangeRate: state => {
      return state.exchangeRate;
    },
    previousExchangeRate: state => {
      return state.previousExchangeRate;
    },
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
                  price: (item['C'] * state.exchangeRate).toFixed(2),
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
    cartItems: state => {
      return state.cartItems
    }
  },
  mutations: {
    setData(state, data) {
      state.data.value = data;
    },
    setNames(state, data) {
      state.names = data;
    },
    setExchangeRate(state, data) {
      state.exchangeRate = data;
    },
    setPreviousExchangeRate(state, data) {
      state.previousExchangeRate = data;
    },
    addToCart(state, data) {
      let cart = state.cartItems.find((item) => {
        return item.id === data.id;
      });

      let cartItem = {
        id: data.id,
        price: data.price,
        name: data.name,
        count: 1
      }

      if (typeof cart === 'undefined') {
        state.cartItems.push(cartItem);
      } else {
        state.cartItems.forEach((item, i) => {
          if(item.id === data.id) {
            state.cartItems[i].count++;
          }
        })
      }
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
    getExchangeRate: (context) => {
      context.commit('setPreviousExchangeRate', context.getters.exchangeRate);

      let r = Math.random()*(maxExchangeRate-minExchangeRate) + minExchangeRate;
      let data = Math.floor(r);

      context.commit('setExchangeRate', data);
    },
  },
})

store.dispatch('getExchangeRate');
store.dispatch('getData');
store.dispatch('getNames');

function addToCart(categoryIndex, goodIndex) {
  store.commit('addToCart', store.getters.categoriesWithGoods[categoryIndex].categoryGoods[goodIndex]);
}
</script>

<style scoped>

h1 {
  text-align: center;
}

.category-block-header {
  background-color: lightblue;
}

.price-block {
  background-color: antiquewhite;
  width: 100px;
}

.good-cell {
  padding: 0;
  font-size: 12px;
}

.good-table {
  width: 100%;
  height: 100px;
}

.cart-text {
  font-size: 10px;
}
</style>
