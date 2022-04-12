<template>
  <div id="app">
    <h1>Интернет магазин</h1>
    <ProductList/>
    <hr>

  </div>
</template>

<script>
import ProductList from './ProductList.vue'

export default {
  components: { ProductList }
}
</script>
