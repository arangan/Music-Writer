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
    },
    doubleUnderLine(): void {
      this.richEditor.toggleDoubleUnderLine();
    }
  }
});
</script>

<template>
  <div class="toolBar">
    <div class="toolBarGroup">
      <button @click="loadData">
        <img src="./assets/icons/file-2-line.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/folder-open-line.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/save-3-fill.svg" draggable="false" />
      </button>
    </div>
    <div class="toolBarGroup">
      <button @click="printDoc">
        <img src="./assets/icons/printer-fill.svg" draggable="false" />
      </button>
    </div>
    <div class="toolBarGroup">
      <button>
        <img src="./assets/icons/arrow-go-back-line.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/arrow-go-forward-line.svg" draggable="false" />
      </button>
    </div>
    <div class="toolBarGroup">
      <button>
        <img src="./assets/icons/align-left.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/align-center.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/align-right.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/align-justify.svg" draggable="false" />
      </button>
    </div>
    <div class="toolBarGroup">
      <button aria-disabled="false" aria-pressed="false">
        <img src="./assets/icons/bold.svg" draggable="false" />
      </button>
      <button aria-disabled="false" aria-pressed="false">
        <img src="./assets/icons/italic.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/underline.svg" draggable="false" />
      </button>
    </div>
    <div class="toolBarGroup">
      <button title="Insert Table">
        <img src="./assets/icons/grid-line.svg" />
      </button>
      <button @click="underBracket" title="Draw Underbracket">
        <img src="./assets/icons/under-bracket.svg" draggable="false" />
      </button>
      <button @click="doubleUnderLine" title="Double Underline">
        <img src="./assets/icons/double-underline.svg" draggable="false" />
      </button>
      <button title="Dot Below">&#x0323;</button>
      <button title="Line Below">&#x0332;</button>
    </div>
  </div>
  <rich-editor ref="rchEditor" :data="docData" id="printSection" />
</template>
