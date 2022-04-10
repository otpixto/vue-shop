<template>
  <div>

    <div>
      <h1>Интернет магазин</h1>

      <button v-on:click="getData">Get Data</button>
      <div>{{ dataList }}</div>
    </div>

  </div>
</template>

<script setup>

import {ref} from "vue";
import createStore from "vuex/dist/vuex.mjs";

const namesList = ref([])
const dataList = ref([])

getData();

function getData() {
  fetch("/json/names.json")
      .then(response => response.json())
      .then(data => {
        namesList.value = data
        fetch("/json/data.json")
            .then(response => response.json())
            .then(data => {
              dataList.value = data['Value']
            });
      });
}

const store = createStore({
  data: {
    names: namesList.value,
    map: dataList.value,
  },
  getters: {
    getTodoById: (state) => (id) => {
      return state.data.map.find(todo => todo.id === id)
    },
    doneTodos (state) {
      return state.data.map.filter(item => {
        console.log( item );
      })
    }
  }
})

store.commit()


</script>

<style scoped>

</style>