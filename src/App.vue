<script lang="ts">
import { defineComponent } from 'vue';
import RichEditor from './components/RichEditor.vue';
//import fs from "fs";
import './assets/App.scss';

export default defineComponent({
  components: { RichEditor },
  name: 'App',
  mounted() {
    console.log(process.cwd());
    this.richEditor = this.$refs.rchEditor as typeof RichEditor;
  },
  data() {
    return {
      richEditor: {} as typeof RichEditor
    };
  },
  methods: {
    loadData(): void {
      this.richEditor.setData('set from parent');
    },
    printDoc(): void {
      // let ele = document.getElementsByClassName('ProseMirror');
      // let dv = ele[0] as HTMLDivElement;
      // let oldStyle = dv.style.boxShadow;
      // dv.style.boxShadow = 'none';
      window.print();
      // dv.style.boxShadow = oldStyle;
    }
  }
});
</script>

<template>
  <button @click="printDoc">Print</button>
  <button @click="loadData">Load Data</button>
  <rich-editor ref="rchEditor" data="hello world" id="printSection" />
</template>
