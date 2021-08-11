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
      lineAbove: '\u0305',
      openMenus: new Set<HTMLDivElement>()
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
    showHideMenu(evt: MouseEvent, elem: string, itm: string) {
      let drpDownMenu: HTMLDivElement = this.$refs[itm] as HTMLDivElement;

      // document.getElementById(elem)?.classList.toggle('show');
      // document.getElementById(elem)?.focus();
      this.openMenus.add(drpDownMenu);
      drpDownMenu.classList.toggle('show');
      drpDownMenu.focus();

      evt.stopPropagation();
    },
    OnPageClick() {
      this.openMenus.forEach(e => e.classList.remove('show'));
    }
  }
});
</script>

<template>
  <div @click="OnPageClick">
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
          <button title="Font sizes" @click="showHideMenu($event, 'myDropdown', 'myDropdown')">
            <span>24px</span>
            <!-- <div>
            <img src="./assets/icons/down-arrow.svg" draggable="false" />
          </div> -->
          </button>
          <div id="myDropdown" class="dropdown-content" onblur="alert('focusout')" ref="myDropdown">
            <a href="#">24px</a>
            <a href="#">26px</a>
            <a href="#">28px</a>
          </div>
        </div>
      </div>
    </div>
    <br />
    <rich-editor ref="rchEditor" :data="docData" id="printSection" />
  </div>
</template>
