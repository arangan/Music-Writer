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
    this.currentFont = this.defaultFont;
    this.currentFontSize = this.defaultFontSize;
    // this.setFont(this.defaultFont, this.refFontName);
    // this.setFontSize(this.defaultFontSize, this.refFontSize);
    document.addEventListener('click', this.OnPageClick);
  },
  data() {
    return {
      richEditor: {} as typeof RichEditor,
      docData: 'Hello World',
      dotBelow: '\u0323', //&#x0323;
      dotAbove: '\u0307',
      lineBelow: '\u0332',
      lineAbove: '\u0305',
      checkMark: '\u10004', //&#10004;
      defaultFontSize: '18',
      defaultFont: 'Noto',
      defaultFontUnit: 'pt',
      currentFont: '',
      currentFontSize: '',
      availableFontSizes: [16, 18, 20, 22, 24, 26, 28, 30],
      availableFonts: ['Noto', 'Siddhanta', 'NotoMono'],
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
    addCharacter(characterToAdd: string) {
      this.richEditor.addCharacter(characterToAdd);
    },
    closeAllMenus() {
      this.openMenus.forEach(e => (e.style.display = ''));
      this.openMenus.clear();
    },
    toolbarButtonClick(evt: Event) {
      this.closeAllMenus();
      let btn: HTMLElement | null = evt.target as HTMLElement;

      switch (btn.tagName) {
        case 'SPAN':
          btn = btn.parentElement;
          break;
        case 'IMG':
          btn = btn.parentElement;
          break;
      }
      if (btn != null) {
        let nxt = btn?.nextSibling as HTMLDivElement;
        if (!nxt.style.display) {
          nxt.style.display = 'block';
          this.openMenus.add(nxt);
        } else {
          nxt.style.display = '';
          this.openMenus.delete(nxt);
        }
      }

      evt.stopImmediatePropagation();
    },
    OnPageClick() {
      this.closeAllMenus();
    },
    setFont(fontName: string, fontSize: string) {
      //console.log(fontName + ' ' + fontSize);
      this.currentFont = fontName;
      this.currentFontSize = fontSize;
      this.richEditor.setFont(this.currentFont, this.currentFontSize);
    },
    async FontChanged(args: any) {
      console.log(args);
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

  <nav>
    <div class="toolbarGroup">
      <button @click="loadData">
        <img src="./assets/icons/file-2-line.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/folder-open-line.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/save-3-fill.svg" draggable="false" />
      </button>
      <button @click="printDoc">
        <img src="./assets/icons/printer-fill.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button>
        <img src="./assets/icons/arrow-go-back-line.svg" draggable="false" />
      </button>
      <button>
        <img src="./assets/icons/arrow-go-forward-line.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
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
    <div class="toolbarGroup">
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
    <div class="toolbarGroup">
      <button title="Table" class="textWithIconButton" @click="toolbarButtonClick($event)">
        <img src="./assets/icons/table.svg" draggable="false" />
        <img src="./assets/icons/down-arrow.svg" draggable="false" />
      </button>
      <div class="dropdownMenu">
        <div @click="this.richEditor.createTable(3, 3)">Insert Table</div>
        <div>Column</div>
        <!-- <div id="colSubMenu" class="subMenu-content" ref="colSubMenu">
          <div>Add Column After</div>
          <div>Add Column Before</div>
          <div>Delete Column</div>
        </div> -->
        <div>Row</div>
        <div>Cell</div>
        <div @click="this.richEditor.deleteTable()">Delete Table</div>
      </div>
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
    <div class="toolbarGroup">
      <div class="menuPad">
        <button class="textWithIconButton" @click="toolbarButtonClick($event)">
          <span class="txt">{{ currentFont }}</span>
          <img src="./assets/icons/down-arrow.svg" draggable="false" />
        </button>
        <div class="dropdownMenu">
          <template v-for="font in availableFonts" :key="font">
            <div @click="setFont(font, currentFontSize)">{{ font }}</div>
          </template>
        </div>
      </div>

      <div class="menuPad">
        <button class="textWithIconButton" @click="toolbarButtonClick($event)">
          <span>{{ currentFontSize }}</span>
          <img src="./assets/icons/down-arrow.svg" draggable="false" />
        </button>
        <div class="dropdownMenu">
          <template v-for="size in availableFontSizes" :key="size">
            <div @click="setFont(currentFont, size)">{{ size }}</div>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <br />

  <rich-editor
    ref="rchEditor"
    :defaultFont="defaultFont"
    :defaultFontSize="defaultFontSize"
    :defaultFontUnit="defaultFontUnit"
    :docData="docData"
    id="printSection"
    @fontChanged="FontChanged(eventArgs)"
  />
  <!-- </div> -->
</template>
