<script lang="ts">
import { defineComponent } from 'vue';
import RichEditor from './components/RichEditor.vue';
//import fs from "fs";
import './assets/App.scss';

export default defineComponent({
  components: { RichEditor },
  name: 'App',
  mounted() {
    // console.log(process.cwd());
    this.richEditor = this.$refs.rchEditor as typeof RichEditor;
    this.docData = 'Hello World';
  },
  data() {
    return {
      richEditor: {} as typeof RichEditor,
      docData: '',
      dotBelow: '\u0323', //&#x0323;
      dotAbove: '\u0307',
      lineBelow: '\u0332',
      lineAbove: '\u0305'
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
    },
    addUnderDot() {
      this.richEditor.addUnderDot();
    },
    addLineBelow() {
      this.richEditor.addLineBelow();
    },
    addCharacter(characterToAdd: string) {
      this.richEditor.addCharacter(characterToAdd);
    },
    showHideMenu(elem: string) {
      //console.log(evt.target);
      document.getElementById(elem)?.classList.toggle('show');
      document.getElementById(elem)?.focus();

      // const nextDiv: HTMLDivElement | null = elem.nextSibling as HTMLDivElement;
      // nextDiv?.classList.toggle('show');
    }
  }
});
</script>

<template>
  <div class="toolBar">
    <!-- <div class="toolBarGroup">
      <button @click="loadData">
        <img src="./assets/icons/file-2-line.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/folder-open-line.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/save-3-fill.svg" draggable="false" />
      </button>
    </div> -->
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
        <img src="./assets/icons/grid-line.svg" draggable="false" />
      </button>
      <button @click="underBracket" title="Draw Underbracket">
        <img src="./assets/icons/under-bracket.svg" draggable="false" />
      </button>
      <button @click="doubleUnderLine" title="Double Underline">
        <img src="./assets/icons/double-underline.svg" draggable="false" />
      </button>
      <button @click="addCharacter(dotBelow)" title="Dot Below">
        <img src="./assets/icons/dot-under.svg" draggable="false" />
      </button>
      <button @click="addCharacter(lineBelow)" title="Line Below">
        <img src="./assets/icons/line-under.svg" draggable="false" />
      </button>
      <button @click="addCharacter(dotAbove)" title="Dot Above">
        <img src="./assets/icons/dot-above.svg" draggable="false" />
      </button>
      <button @click="addCharacter(lineAbove)" title="Line Above">
        <img src="./assets/icons/line-above.svg" draggable="false" />
      </button>
    </div>
    <div class="toolBarGroup">
      <div class="dropdown">
        <button title="Font sizes" @click="showHideMenu('myDropdown')">
          <span>12pt</span>
          <!-- <div>
            <img src="./assets/icons/down-arrow.svg" draggable="false" />
          </div> -->
        </button>
        <div
          id="myDropdown"
          class="dropdown-content"
          onblur="alert('focusout')"
        >
          <a href="#">Link 1</a>
          <a href="#">Link 2</a>
          <a href="#">Link 3</a>
        </div>
      </div>
    </div>
  </div>
  <br />
  <rich-editor ref="rchEditor" :data="docData" id="printSection" />
</template>
