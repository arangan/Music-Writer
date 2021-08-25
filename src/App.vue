<script lang="ts">
import { defineComponent } from 'vue';
import RichEditor from './components/RichEditor.vue';
//import fs from "fs";
import './assets/App.scss';
// import './assets/RichEditor.scss';

export default defineComponent({
  components: { RichEditor },
  name: 'App',
  mounted() {
    // console.log(process.cwd());
    this.richEditor = this.$refs.rchEditor as typeof RichEditor;
    this.currentFont = this.defaultFont;
    this.currentFontSize = this.defaultFontSize;
    // this.setFont(this.defaultFont, this.refFontName);
    // this.setFontSize(this.defaultFontSize, this.refFontSize);
    //document.addEventListener('click', this.OnPageClick);

    this.navBar = document.getElementsByTagName('nav')[0];
    this.statusBar = document.getElementsByClassName('statusBar')[0] as HTMLElement;
    window.addEventListener('load', this.OnWindowLoad);
    window.addEventListener('resize', this.OnWindowLoad);
  },
  data() {
    return {
      richEditor: {} as typeof RichEditor,
      docData: 'Hello World',
      defaultFontSize: '18',
      defaultFont: 'Noto',
      defaultFontUnit: 'pt',
      currentFont: '',
      currentFontSize: '',
      availableFontSizes: [16, 18, 20, 22, 24, 26, 28, 30],
      availableFonts: ['Noto', 'Siddhanta', 'NotoMono'],
      navBar: {} as HTMLElement,
      statusBar: {} as HTMLElement
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
    OnWindowLoad() {
      let contentHeight = window.innerHeight - (this.navBar.clientHeight + this.statusBar.clientHeight);
      this.richEditor.OnWindowChange(contentHeight - 3);
    }
  }
});
</script>

<template>
  <!-- <div @click="OnPageClick"> -->

  <!-- <nav class="toolbar">
    <ul>
      <li class="toolbarGroup">
        <ul>
          <li>
            <button class="toolbarButton" @click="toolbarButtonClick($event)">
              <span class="toolbarLabel">File</span>
              <span class="toolbarImg">
                <img src="./assets/icons/down-arrow.svg" draggable="false" />
              </span>
            </button>
            <ul class="dropdownMenu">
              <li>New</li>
              <li>Open...</li>
              <li>Exit</li>
            </ul>
          </li>
          <li><button class="toolbarButton">Edit</button></li>
        </ul>
      </li>
    </ul>
  </nav> -->

  <rich-editor
    ref="rchEditor"
    :Font="defaultFont"
    :FontSize="defaultFontSize"
    :FontUnit="defaultFontUnit"
    :availableFonts="availableFonts"
    :availableFontSizes="availableFontSizes"
    :docData="docData"
  />
  <!-- </div> -->
</template>
