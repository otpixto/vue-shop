<template v-if="store.getters.categoriesWithGoods">

  <h1 class="align-self-center">Интернет магазин</h1>

  <!--  Вывод списка товаров-->
  <div class="row">
    <div class="col-md-6" v-for="(category, categoryIndex) in store.getters.categoriesWithGoods" :key="category">
      <table class="table table-bordered table-hover">
        <tr class="category-block-header">
          <th colspan="2">
            <!--  Вывод названия категории-->
            {{ category.categoryName }}
          </th>
        </tr>
        <!--  Используем Math.ceil(category.categoryGoods.length/2) для расчета количества tr-->
        <tr v-for="(i, index) in Math.ceil(category.categoryGoods.length/2)" :key="index">
          <td class="good-cell">
            <table class="good-table">
              <tr>
                <td>{{ category.categoryGoods[index * 2].name }} ({{ category.categoryGoods[index * 2].leftover }})</td>
                <td class="price-block">
                  {{ (category.categoryGoods[index * 2].price * store.getters.exchangeRate).toFixed(2) }}
                  <button v-if="category.categoryGoods[index * 2].leftover > 0"
                          @click="addToCart(categoryIndex, index * 2);" class="btn btn-sm btn-info">
                    <span class="cart-text">В корзину</span>
                  </button>
                </td>
              </tr>
            </table>
          </td>
          <td class="good-cell" v-if="index * 2 + 1 < category.categoryGoods.length">
            <table class="good-table">
              <tr>
                <td>{{ category.categoryGoods[index * 2 + 1].name }} ({{
                    category.categoryGoods[index * 2 + 1].leftover
                  }})
                </td>
                <td class="price-block">
                  {{ (category.categoryGoods[index * 2 + 1].price * store.getters.exchangeRate).toFixed(2) }}
                  <button v-if="category.categoryGoods[index * 2 + 1].leftover > 0"
                          @click="addToCart(categoryIndex, index * 2 + 1);" class="btn btn-sm btn-info">
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

  <!--  Таблица со списком товаров в корзине. Если курс увеличился, то фон красный, если уменьшился - зеленый-->
  <table class="table table-bordered table-hover"
         :class="{
          'table-success': store.getters.isExchangeRateDecreased,
          'table-danger': store.getters.isExchangeRateIncreased
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
      Общая стоимость: <span
        class="orange-text">{{ (store.getters.totalCartAmount * store.getters.exchangeRate).toFixed(2) }} руб.</span>
    </div>
  </div>

</template>

<script setup>
import {createStore} from 'vuex';
import Axios from 'axios';

//Константы минимального и максимального значения курса валют
const minExchangeRate = 20;
const maxExchangeRate = 80;

// Создание хранилища
const store = createStore({
  //Переменные в хранилище
  state() {
    return {
      //Данные, полученные из файла data.json
      goodsData: [],
      //Данные, полученные из файла names.json
      names: {},
      //Сформированный массив категорий и товаров
      categoriesWithGoods: [],
      //Курс доллара
      exchangeRate: 0,
      //Старый курс доллара
      previousExchangeRate: 0,
      //Товары в корзине
      cartItems: [],
      //Общая сумма по всем товарам в корзине
      totalCartAmount: 0
    }
  },
  //Геттеры
  getters: {
    //Курс доллара
    exchangeRate: state => {
      return state.exchangeRate;
    },
    //Старый курс доллара
    previousExchangeRate: state => {
      return state.previousExchangeRate;
    },
    //bool: увеличился ли курс валюты
    isExchangeRateIncreased: state => {
      return state.exchangeRate >= store.getters.previousExchangeRate && state.previousExchangeRate > 0;
    },
    //bool: уменьшился ли курс валюты
    isExchangeRateDecreased: state => {
      return state.exchangeRate < state.previousExchangeRate;
    },
    //Общая сумма по всем товарам в корзине
    totalCartAmount: state => {
      return state.totalCartAmount;
    },
    //Сформированный массив категорий и товаров
    categoriesWithGoods: state => {
      let returnData = [];
      let namesValue = state.names;

      //Перебираются данные, полученные из файла names.json
      for (let categoryId in namesValue) {

        //Приводим categoryId к числу
        let numericCategoryId = Number(categoryId);

        //Массив товаров в категории
        let categoryGoods = [];

        if (state.goodsData.value) {
          //Перебираются данные, полученные из файла data.json
          state.goodsData.value.filter((item) => {

            //Проверка совпадения categoryId из файлов data.json и names.json
            if (numericCategoryId === item["G"]) {

              //Приводим goodId к числу
              let numericGoodId = Number(item['T']);

              //Список имен товаров в данной категории из names.json
              let goodsNamesList = namesValue[categoryId]['B'];

              for (let nameIndex in goodsNamesList) {

                //Получение объекта товара из names.json
                let nameItem = goodsNamesList[nameIndex];

                //Приводим индекс товара из names.json к числу
                let numericNameIndex = Number(nameIndex);

                //Проверка совпадения индексов товара из файлов data.json и names.json
                if (numericGoodId === numericNameIndex) {

                  //Добавление объекта товара, собранного из файлов data.json и names.json, в массив товаров текущей категории
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
        }

        //Если количество товаров в категории > 0, добавляем объект категории с товарами в конечный массив
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
    //Товары в корзине
    cartItems: state => {
      return state.cartItems
    }
  },
  //Мутации
  mutations: {
    //Данные, полученные из файла data.json
    setData(state, data) {
      state.goodsData.value = data;
    },
    //Данные, полученные из файла names.json
    setNames(state, data) {
      state.names = data;
    },
    //Установка курса валют
    setExchangeRate(state, data) {
      state.exchangeRate = data;
    },
    //Установка старого курса валют
    setPreviousExchangeRate(state, data) {
      state.previousExchangeRate = data;
    },
    //Добавление товара в корзину
    addToCart(state, data) {

      let good = data.good;

      //Проверяем, есть ли в корзине уже товар с таким id
      let cart = state.cartItems.find((item) => {
        return item.id === good.id;
      });

      //Формируем объект для записи в массив корзины
      let cartItem = {
        id: good.id,
        price: good.price,
        name: good.name,
        count: 1,
        categoryIndex: data.categoryIndex,
        goodIndex: data.goodIndex,
      }

      if (typeof cart === 'undefined') {
        //Если товара еще нет в корзине, то добавляем его
        state.cartItems.push(cartItem);
        //Увеличиваем общую сумму товаров в корзине на цену товара
        state.totalCartAmount += Number(cartItem.price);
      } else {
        //Перебор элементов в массиве корзины
        state.cartItems.forEach((item, i) => {
          //Находим товар в корзине
          if (item.id === good.id) {
            //Добавляем количество товара если он уже есть в корзине
            state.cartItems[i].count++;
            //Увеличиваем общую сумму товаров в корзине на цену товара
            state.totalCartAmount += Number(state.cartItems[i].price);
          }
        })
      }
    },
    //Удаление товара из корзины
    removeFromCart(state, data) {

      //Перебор элементов в массиве корзины
      state.cartItems.forEach((item, i) => {
        //Находим товар в корзине
        if (item.id === data.id) {
          //Уменьшаем общую сумму товаров в корзине на цену товара * количество
          state.totalCartAmount -= Number(state.cartItems[i].price) * state.cartItems[i].count;
          //Удаляем товар из корзины
          state.cartItems.splice(i, 1);
        }
      })
    }
  },
  //Экшены
  actions: {
    //Данные, полученные из файла data.json
    getData: async (context) => {
      let {data} = await Axios.get("/json/data.json");
      context.commit('setData', data['Value']['Goods']);
    },
    //Данные, полученные из файла names.json
    getNames: async (context) => {
      let {data} = await Axios.get("/json/names.json");
      context.commit('setNames', data);
    },
    //Генерация курса валют(рандомно от 20 до 80)
    getExchangeRate: (context) => {
      //Записываем текущий курс валют как предыдущий
      context.commit('setPreviousExchangeRate', context.getters.exchangeRate);

      //Генерация курса валют
      let data = (Math.random() * (maxExchangeRate - minExchangeRate) + minExchangeRate).toFixed(2);

      context.commit('setExchangeRate', data);
    },
  },
});

//Запуск экшенов
intervalCallback();
//Установка интервала 15 секунд для перезапуска экшенов
setInterval(intervalCallback, 15000);

function intervalCallback() {
  store.dispatch('getExchangeRate');
  store.dispatch('getData');
  store.dispatch('getNames');
}

//Добавление в корзину
function addToCart(categoryIndex, goodIndex) {
  store.commit('addToCart', {
    good: store.getters.categoriesWithGoods[categoryIndex].categoryGoods[goodIndex],
    categoryIndex: categoryIndex,
    goodIndex: goodIndex
  });
}

//Удаление из корзины
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
  color: orangered;
}
</style>
