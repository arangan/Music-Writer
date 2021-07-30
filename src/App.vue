<template>
  <h1>Hello World</h1>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import fs from "fs";
//
export default defineComponent({
  name: "App",
  components: {},
  mounted() {
    console.log(process.cwd());
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
