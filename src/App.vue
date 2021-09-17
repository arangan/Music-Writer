<script lang="ts">
import { defineComponent } from 'vue';
import RichEditor from './components/RichEditor.vue';

import './assets/App.scss';

export default defineComponent({
  components: { RichEditor },
  name: 'App',
  props: {
    IsDesktopApp: Boolean
  },
  setup(props) {
    let electron = null;
    if (props.IsDesktopApp) {
      electron = require('electron');
    }

    return { electron };
  },
  mounted() {
    // console.log(process.cwd());
    this.richEditor = this.$refs.rchEditor as typeof RichEditor;
    this.currentFont = this.defaultFont;
    this.currentFontSize = this.defaultFontSize;
    // this.setFont(this.defaultFont, this.refFontName);
    // this.setFontSize(this.defaultFontSize, this.refFontSize);
    //document.addEventListener('click', this.OnPageClick);

    if (this.IsDesktopApp) {
      try {
        this.electron?.ipcRenderer.on('setDocumentData', async (event, data: string) => {
          this.richEditor.SetDocument(data);
        });

        this.electron?.ipcRenderer.on('getDocumentData', async (event, callBack: string) => {
          this.electron?.ipcRenderer.invoke(callBack, this.richEditor.GetDocument(false));
        });

        this.electron?.ipcRenderer.on('printDocument', async (event, args: string) => {
          console.log(args);
          this.richEditor.printDoc();
          this.electron?.ipcRenderer.send('printDocumentCompleted', 'DocumentWasPrinted');
        });
      } catch {
        //pass
      }
    }

    this.navBar = document.getElementsByTagName('nav')[0];
    this.navBar2 = document.getElementsByTagName('nav')[1];
    this.statusBar = document.getElementsByClassName('statusBar')[0] as HTMLElement;
    window.addEventListener('load', () => {
      this.OnWindowLoad(null);
    });
    window.addEventListener('resize', () => {
      this.OnWindowLoad(null);
    });
    // window.addEventListener('nav2toggled', this.OnWindowLoad);
  },
  data() {
    return {
      richEditor: {} as typeof RichEditor,
      defaultFontSize: '18',
      defaultFont: 'Noto',
      defaultFontUnit: 'pt',
      currentFont: '',
      currentFontSize: '',
      availableFontSizes: [16, 18, 20, 22, 24, 26, 28, 30],
      availableFonts: ['Noto', 'Siddhanta', 'NotoMono'],
      navBar: {} as HTMLElement,
      navBar2: {} as HTMLElement,
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
    OnWindowLoad(nav22: HTMLElement | null) {
      // let navBar2Height = this.navBar2.style.display === 'block' ? this.navBar2.clientHeight : 0;
      let navBar2Height = nav22 !== null ? nav22.clientHeight : 0;
      let contentHeight = window.innerHeight - (this.navBar.clientHeight + navBar2Height + this.statusBar.clientHeight);
      this.richEditor.OnWindowChange(contentHeight - 3);
    },
    NavBar2Toggled(nav22: HTMLElement) {
      let navBar2Height = nav22 ? nav22.clientHeight : 0;
      let contentHeight = window.innerHeight - (this.navBar.clientHeight + navBar2Height + this.statusBar.clientHeight);
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
    :IsDesktopApp="IsDesktopApp"
    @nav2toggled="OnWindowLoad"
  />
  <!-- </div> -->
</template>
