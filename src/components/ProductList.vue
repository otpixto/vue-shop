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
                  <button v-if="category.categoryGoods[index * 2].leftover > 0" @click="addToCart(categoryIndex, index * 2);" class="btn btn-sm btn-info">
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
                  <button v-if="category.categoryGoods[index * 2 + 1].leftover > 0" @click="addToCart(categoryIndex, index * 2 + 1);" class="btn btn-sm btn-info">
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

  Курс доллара: {{ store.getters.exchangeRate }}

  <table class="table table-bordered table-hover"
         :class="{
          'table-success': store.getters.isExchangeRateIncreased,
          'table-danger': store.getters.isExchangeRateDecreased
         }">
    <tr>
      <th>Наименование товара и описание</th>
      <th>Количество</th>
      <th>Цена</th>
      <th></th>
    </tr>
    <tr v-for="cartItem in store.getters.cartItems" :key="cartItem">
      <td>
        {{ cartItem.name }}
      </td>
      <td>
        <b>{{ cartItem.count }}</b> шт.
      </td>
      <td>
        <b>{{ (cartItem.price * store.getters.exchangeRate).toFixed(2) }} руб.</b> / шт.
      </td>
      <td>
        <button @click="removeFromCart(cartItem.categoryIndex, cartItem.goodIndex);" class="btn btn-danger">
          Удалить
        </button>
      </td>
    </tr>
  </table>

  <div class="row" v-if="store.getters.totalCartAmount">
    <div class="col-md-12 offset-md-8">
      Общая стоимость: <span class="orange-text">{{ (store.getters.totalCartAmount * store.getters.exchangeRate).toFixed(2) }} руб.</span>
    </div>
  </div>


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
      totalCartAmount: 0
    }
  },
  getters: {
    exchangeRate: state => {
      return state.exchangeRate;
    },
    previousExchangeRate: state => {
      return state.previousExchangeRate;
    },
    isExchangeRateIncreased: state => {
      return state.exchangeRate >= store.getters.previousExchangeRate && state.previousExchangeRate > 0;
    },
    isExchangeRateDecreased: state => {
      return state.exchangeRate < state.previousExchangeRate;
    },
    totalCartAmount: state => {
      return state.totalCartAmount;
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

      let good = data.good;

      let cart = state.cartItems.find((item) => {
        return item.id === good.id;
      });

      let cartItem = {
        id: good.id,
        price: good.price,
        name: good.name,
        count: 1,
        categoryIndex: data.categoryIndex,
        goodIndex: data.goodIndex,
      }

      if (typeof cart === 'undefined') {
        state.cartItems.push(cartItem);
        state.totalCartAmount += Number(cartItem.price);
      } else {
        state.cartItems.forEach((item, i) => {
          if(item.id === good.id) {
            state.cartItems[i].count++;
            state.totalCartAmount += Number(state.cartItems[i].price);
          }
        })
      }
    },
    removeFromCart(state, data) {

        state.cartItems.forEach((item, i) => {
          if(item.id === data.id) {
            state.totalCartAmount -= Number(state.cartItems[i].price) * state.cartItems[i].count;
            state.cartItems.splice(i, 1);
          }
        })
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
});

intervalCallback();
setInterval(intervalCallback, 15000);

function intervalCallback()
{
  store.dispatch('getExchangeRate');
  store.dispatch('getData');
  store.dispatch('getNames');
}

function addToCart(categoryIndex, goodIndex) {
  store.commit('addToCart', {
    good: store.getters.categoriesWithGoods[categoryIndex].categoryGoods[goodIndex],
    categoryIndex: categoryIndex,
    goodIndex: goodIndex
  });
}

function removeFromCart(categoryIndex, goodIndex) {
  store.commit('removeFromCart', store.getters.categoriesWithGoods[categoryIndex].categoryGoods[goodIndex]);
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

.orange-text {
  font-size: 16px;
  color: orange;
}
</style>
