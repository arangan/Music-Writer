<script lang="ts">
import { defineComponent } from 'vue';
import { EditorContent, Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { mergeAttributes } from '@tiptap/core';

/* ------------ custom components ------------ */
import DoubleUnderLine from './DoubleUnderLine.vue';
import UnderBracket from './UnderBracket.vue';
import FontFamily from './SetFont.vue';
import '../assets/RichEditor.scss';

export default defineComponent({
  components: { EditorContent },
  props: {
    docData: { default: '', type: String },
    Font: { default: 'Noto', type: String },
    FontSize: { default: '18', type: String },
    FontUnit: { default: 'pt', type: String },
    availableFonts: Array,
    availableFontSizes: Array
  },
  setup() {
    const editor = new Editor({
      // content: 'Hello World',
      injectCSS: false,
      autofocus: true,
      //enablePasteRules: true,
      editorProps: { attributes: { spellcheck: 'false' } },
      extensions: [
        StarterKit,
        Paragraph.extend({
          parseHTML() {
            return [{ tag: 'div' }];
          },
          renderHTML({ HTMLAttributes }) {
            return [
              'div',
              mergeAttributes(
                this.options.HTMLAttributes,
                HTMLAttributes
                // {style: `font-family:${props.defaultFont}; font-size:${props.defaultFontSize}${props.defaultFontUnit}`}
              ),
              0
            ];
          }
        }),
        Heading.configure({
          HTMLAttributes: {
            class: 'h11'
          }
        }),
        TextAlign.configure({
          types: ['paragraph', 'heading', 'div']
        }),
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        Underline,
        DoubleUnderLine,
        UnderBracket,
        TextStyle,
        FontFamily
      ]
      // ,onSelectionUpdate({ editor }) {
      //   console.log('selection was changed');
      //   // this.currentFont = editor.getAttributes('textStyle').fontFamily;
      // }
    });

    return { editor };
  },

  data() {
    return {
      dotBelow: '\u0323', //&#x0323;
      dotAbove: '\u0307',
      lineBelow: '\u0332',
      lineAbove: '\u0305',
      checkMark: '\u10004', //&#10004;
      currentFont: this.$props.Font,
      currentFontSize: this.$props.FontSize,
      defaultFont: this.$props.Font,
      defaultFontSize: this.$props.FontSize,
      defaultFontUnit: this.$props.FontUnit,
      documentData: this.docData,
      openMenus: new Set<HTMLDivElement>()
    };
  },

  mounted() {
    let dat: string = this.docData?.toString() ?? '';
    this.editor.chain().focus().setContent(dat).run();
    this.setGlobalFont(this.defaultFont, this.defaultFontSize);
    // console.log(`className - [${this.editor.options.element.firstElementChild?.className}]`);
    document.addEventListener('click', this.OnPageClick);
    this.editor.on('selectionUpdate', this.OnSelectionUpdate);
  },

  beforeUnmount() {
    this.editor.destroy();
  },

  methods: {
    setData(dat: string) {
      this.editor.commands.setContent(dat);
    },
    closeAllMenus() {
      this.openMenus.forEach(e => (e.style.display = ''));
      this.openMenus.clear();
    },
    toolbarButtonClick(evt: Event) {
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
          this.closeAllMenus();
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
    printDoc(): void {
      // let ele = document.getElementsByClassName('ProseMirror');
      // let dv = ele[0] as HTMLDivElement;
      // let oldStyle = dv.style.boxShadow;
      // dv.style.boxShadow = 'none';
      window.print();
      // dv.style.boxShadow = oldStyle;
    },
    toggleUnderBracket() {
      this.editor.chain().focus().toggleUnderBracket().run();
    },
    toggleDoubleUnderLine() {
      this.editor.chain().focus().toggleDoubleUnderLine().run();
    },
    addCharacter(characterToAdd: string) {
      if (this.editor.state.selection.empty) {
        const { from, to } = this.editor.view.state.selection;
        if (from > 1) {
          const prevText = this.editor.view.state.doc.textBetween(from - 2, to);
          if (!prevText.includes(characterToAdd)) {
            // this.editor.chain().focus().insertContent(characterToAdd).run();
            let trans = this.editor.state.tr.insertText(characterToAdd);
            this.editor.view.dispatch(trans);
            // console.log(this.editor.view.state.selection.ranges);
            // this.editor
            //   .chain()
            //   .focus()
            //   .insertContent([{ type: 'text', content: [{ type: 'text', text: characterToAdd }] }])
            //   .run();
            return;
          }
        }
      }
      this.editor.commands.focus(this.editor.state.selection.anchor);
    },
    setGlobalFont(fontName: string, fontSize: string) {
      this.defaultFont = fontName;
      this.defaultFontSize = fontSize;
      let attr = document.createAttribute('style');
      attr.value = `font-family: ${this.defaultFont}; font-size: ${this.defaultFontSize}${this.defaultFontUnit}`;
      this.editor.options.element.firstElementChild?.attributes.setNamedItem(attr);
    },
    setFont(fontName: string, fontSize: string) {
      // if (this.editor.isActive('textStyle', { fontFamily: fontName })) {
      //   this.editor.chain().focus().unsetFontFamily().run();
      // } else {
      // }
      //if (this.editor.state.selection.empty) {

      this.currentFont = fontName;
      this.currentFontSize = fontSize;
      let userFont = {
        fontName: this.currentFont,
        fontSize: this.currentFontSize,
        fontUnit: this.defaultFontUnit
      };
      this.editor.chain().focus().setFontFamily(userFont).run();

      //this.editor.chain().focus().removeEmptyTextStyle();
      //this.editor.chain().setMark('textStyle', { style: 'font-family:consolas; font-size:18' }).run();
    },
    OnSelectionUpdate() {
      let fontInfo = this.editor.getAttributes('textStyle');
      if (Object.keys(fontInfo).length == 0) {
        this.currentFont = this.defaultFont;
        this.currentFontSize = this.defaultFontSize;
      } else {
        //fontInfo.fontFamily.fontSize = fontInfo.fontFamily.fontSize.replace(this.defaultFontUnit, '');
        this.currentFont = fontInfo.fontFamily.fontName;
        this.currentFontSize = fontInfo.fontFamily.fontSize;
      }
    },
    createTable(rows: number, cols: number) {
      this.editor.chain().focus().insertTable({ rows: rows, cols: cols, withHeaderRow: true }).run();
    },
    deleteTable() {
      this.editor.chain().focus().deleteTable().run();
    }
  },
  watch: {
    currentFont: function () {
      // this.editor.getAttributes('textStyle').fontFamily
    }
  }
});
</script>

<template>
  <nav>
    <div class="toolbarGroup">
      <button @click="loadData">
        <img src="../assets/icons/file-2-line.svg" draggable="false" />
      </button>
      <button>
        <img src="../assets/icons/folder-open-line.svg" draggable="false" />
      </button>
      <button>
        <img src="../assets/icons/save-3-fill.svg" draggable="false" />
      </button>
      <button @click="printDoc">
        <img src="../assets/icons/printer-fill.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button>
        <img src="../assets/icons/arrow-go-back-line.svg" draggable="false" />
      </button>
      <button>
        <img src="../assets/icons/arrow-go-forward-line.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button>
        <img src="../assets/icons/align-left.svg" draggable="false" />
      </button>
      <button>
        <img src="../assets/icons/align-center.svg" draggable="false" />
      </button>
      <button>
        <img src="../assets/icons/align-right.svg" draggable="false" />
      </button>
      <button>
        <img src="../assets/icons/align-justify.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button aria-disabled="false" aria-pressed="false">
        <img src="../assets/icons/bold.svg" draggable="false" />
      </button>
      <button aria-disabled="false" aria-pressed="false">
        <img src="../assets/icons/italic.svg" draggable="false" />
      </button>
      <button>
        <img src="../assets/icons/underline.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button title="Table" class="textWithIconButton" @click="toolbarButtonClick($event)">
        <img src="../assets/icons/table.svg" draggable="false" />
        <img src="../assets/icons/down-arrow.svg" draggable="false" />
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
        <img src="../assets/icons/under-bracket.svg" draggable="false" />
      </button>
      <button @click="doubleUnderLine" title="Double Underline">
        <img src="../assets/icons/double-underline.svg" draggable="false" />
      </button>
      <button @click="addCharacter(dotBelow)" title="Dot Below">
        <img src="../assets/icons/dot-under.svg" draggable="false" />
      </button>
      <button @click="addCharacter(lineBelow)" title="Line Below">
        <img src="../assets/icons/line-under.svg" draggable="false" />
      </button>
      <button @click="addCharacter(dotAbove)" title="Dot Above">
        <img src="../assets/icons/dot-above.svg" draggable="false" />
      </button>
      <button @click="addCharacter(lineAbove)" title="Line Above">
        <img src="../assets/icons/line-above.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <div class="menuPad">
        <button class="textWithIconButton" @click="toolbarButtonClick($event)">
          <span class="txt">{{ currentFont }}</span>
          <img src="../assets/icons/down-arrow.svg" draggable="false" />
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
          <img src="../assets/icons/down-arrow.svg" draggable="false" />
        </button>
        <div class="dropdownMenu">
          <template v-for="size in availableFontSizes" :key="size">
            <div @click="setFont(currentFont, size)">{{ size }}</div>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <editor-content :editor="editor" id="printSection" class="scroll" />
  <div class="statusBar">Status Bar</div>
</template>
