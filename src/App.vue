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
    this.docData = 'Hello World';
  },
  data() {
    return {
      richEditor: {} as typeof RichEditor,
      docData: ''
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
    },
    underBracket(): void {
      this.richEditor.toggleUnderBracket();
    }
  }
});
</script>

<template>
  <div class="toolBar">Tool</div>
  <button @click="printDoc">Print</button>
  <button @click="loadData">Load Data</button>
  <button @click="underBracket">Under Bracket</button>
  <rich-editor ref="rchEditor" :data="docData" id="printSection" />
</template>
