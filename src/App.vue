<template>
  <h1>Hello World</h1>
</template>

<script lang="ts">
import { defineComponent } from "vue";
//import fs from "fs";
import "./assets/App.scss";

export default defineComponent({
  name: "App",
  components: {},
  mounted() {
    console.log(process.cwd());
  },
});
</script>
