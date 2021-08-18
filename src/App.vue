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
    // this.setFont(this.defaultFont, this.refFontName);
    // this.setFontSize(this.defaultFontSize, this.refFontSize);
    document.addEventListener('click', this.OnPageClick);
    console.clear();
  },
  data() {
    return {
      richEditor: {} as typeof RichEditor,
      docData: '',
      dotBelow: '\u0323', //&#x0323;
      dotAbove: '\u0307',
      lineBelow: '\u0332',
      lineAbove: '\u0305',
      checkMark: '\u10004', //&#10004;
      defaultFontSize: '18',
      defaultFont: 'Noto',
      availableFontSizes: [16, 18, 20, 22, 24, 26, 28, 30],
      availableFonts: ['Noto', 'Siddhanta', 'NotoMono'],
      refFontName: 'refFontName',
      refFontSize: 'refFontSize',
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
    toolbarButtonClick(evt: Event) {
      let btn = evt.target as HTMLElement;
      switch (btn.tagName) {
        case 'SPAN':
          btn = btn.parentElement ?? btn;
          break;
        case 'IMG':
          btn = btn.parentElement?.parentElement ?? btn;
          break;
      }
      let nxt = btn.nextSibling as HTMLDivElement;

      if (!nxt.style.display) {
        nxt.style.display = 'block';
        this.openMenus.add(nxt);
      } else {
        nxt.style.display = '';
        this.openMenus.delete(nxt);
      }

      evt.stopImmediatePropagation();
    },
    showHideMenu(evt: MouseEvent, elem: string, itm: string) {
      this.openMenus.forEach(e => e.classList.remove('show'));
      let drpDownMenu: HTMLDivElement = this.$refs[itm] as HTMLDivElement;

      // document.getElementById(elem)?.classList.toggle('show');
      // document.getElementById(elem)?.focus();
      // this.openMenus.add(drpDownMenu);
      drpDownMenu.classList.toggle('show');
      drpDownMenu.focus();

      evt.stopPropagation();
    },
    OnPageClick() {
      this.openMenus.forEach(e => (e.style.display = ''));
    },
    setFontSize(fontSize: string, spanRef: string) {
      let spn = this.$refs[spanRef] as HTMLSpanElement;
      spn.dataset.value = fontSize + 'pt';
      this.richEditor.setFontSize(fontSize);
    },
    setFont(fontName: string, spanRef: string) {
      let spn = this.$refs[spanRef] as HTMLSpanElement;
      spn.dataset.value = fontName;
      this.richEditor.setFont(fontName);
    },
    showClipboard() {
      // let dat = await navigator.clipboard.readText();
      // console.log(dat);
      this.richEditor.hasFontChanged();
    }
  }
});
</script>

<template>
  <!-- <div @click="OnPageClick"> -->
  <!-- <div class="toolBar">
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
        <div class="dropdown">
          <button title="Table" @click="showHideMenu($event, 'tblDropdown', 'tblDropdown')">
            <img src="./assets/icons/grid-line.svg" draggable="false" />
          </button>
          <div id="tblDropdown" class="dropdown-content" ref="tblDropdown">
            <div @click="this.richEditor.createTable(3, 3)">Insert Table</div>
            <div>Column</div>
            <div id="colSubMenu" class="subMenu-content" ref="colSubMenu">
              <div>Add Column After</div>
              <div>Add Column Before</div>
              <div>Delete Column</div>
            </div>
            <div>Row</div>
            <div>Cell</div>
            <div @click="this.richEditor.deleteTable()">Delete Table</div>
          </div>
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
      <div class="toolBarGroup">
        <div class="dropdown">
          <button title="Font sizes" @click="showHideMenu($event, 'myDropdown', 'myDropdown')">
            <span :ref="refFontSize" class="fontSpan"></span>
            <div>
              <img src="./assets/icons/down-arrow.svg" draggable="false" />
            </div>
          </button>
          <div id="myDropdown" class="dropdown-content" ref="myDropdown">
            <template v-for="fontSize in availableFontSizes" :key="fontSize">
              <div @click="setFontSize(fontSize, refFontSize)">{{ fontSize }}</div>
            </template>
          </div>
        </div>

        <div class="dropdown">
          <button title="Fonts" @click="showHideMenu($event, 'fontDropdown', 'fontDropdown')">
            <span :ref="refFontName" class="fontSpan"></span>
            <div>
              <img src="./assets/icons/down-arrow.svg" draggable="false" />
            </div>
          </button>
          <div id="fontDropdown" class="dropdown-content" ref="fontDropdown">
            <template v-for="fontName in availableFonts" :key="fontName">
              <div @click="setFont(fontName, refFontName)">{{ fontName }}</div>
            </template>
          </div>
        </div>
        <button @click="showClipboard">Clipboard</button>
      </div>
    </div> -->

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
      <button>
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
      <button class="textWithIconButton" @click="toolbarButtonClick($event)">
        <span class="txt">File</span>
        <span class="icon">
          <img src="./assets/icons/down-arrow.svg" draggable="false" />
        </span>
      </button>
      <div class="dropdownMenu">
        <div>Noto</div>
        <div>Siddhanta</div>
        <div>NotoMono</div>
      </div>
    </div>
  </nav>

  <br />

  <rich-editor ref="rchEditor" :data="docData" id="printSection" />
  <!-- </div> -->
</template>
