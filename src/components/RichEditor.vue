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
import fs from 'fs';

/* ------------ custom components ------------ */
import DoubleUnderLine from './DoubleUnderLine.vue';
import UnderBracket from './UnderBracket.vue';
import FontFamily from './SetFont.vue';
import PageBreak from './PageBreak.vue';
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
        FontFamily,
        PageBreak
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
      whiteSpace: '\u00A0',
      currentFont: this.$props.Font,
      currentFontSize: this.$props.FontSize,
      defaultFont: this.$props.Font,
      defaultFontSize: this.$props.FontSize,
      defaultFontUnit: this.$props.FontUnit,
      documentData: this.docData,
      printSection: {} as HTMLDivElement,
      openMenus: new Set<HTMLDivElement>(),
      openSubMenus: new Set<HTMLDivElement>(),
      tableGridSize: 4,
      tableGrid: new Array<Array<HTMLSpanElement>>(),
      tableGridSummary: {} as HTMLSpanElement
    };
  },

  mounted() {
    let dat: string = this.docData?.toString() ?? '';
    this.editor.chain().focus().setContent(dat).run();
    this.setGlobalFont(this.defaultFont, this.defaultFontSize);
    // console.log(`className - [${this.editor.options.element.firstElementChild?.className}]`);
    this.printSection = document.getElementById('printSection') as HTMLDivElement;
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
    closeAllSubMenus() {
      this.ResetGrid();
      this.openSubMenus.forEach(e => (e.style.display = ''));
      this.openSubMenus.clear();
    },
    closeAllMenus() {
      this.closeAllSubMenus();
      this.openMenus.forEach(e => (e.style.display = ''));
      this.openMenus.clear();
    },
    toolbarButtonClick(evt: Event) {
      let btn: HTMLButtonElement | null = evt.currentTarget as HTMLButtonElement;

      let nxt = btn?.nextSibling as HTMLDivElement;
      if (nxt) {
        if (!nxt.style.display) {
          this.closeAllMenus();
          nxt.style.display = 'block';
          this.openMenus.add(nxt);
        } else {
          nxt.style.display = '';
          this.openMenus.delete(nxt);
          this.editor.chain().focus().run();
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

      let tmpHeight = this.printSection.style.height;
      this.printSection.style.height = '';
      window.print();
      this.printSection.style.height = tmpHeight;

      //window.print();

      this.editor.chain().focus().run();

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
            //return;
          }
        }
      }
      this.editor.chain().focus().run();
      //this.editor.commands.focus(this.editor.state.selection.anchor);
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
    ResetGrid() {
      this.tableGrid.forEach(row => {
        row.forEach(col => {
          col.className = 'deselectedCell';
        });
      });
      this.tableGridSummary.innerText = '0 x 0';
    },
    HighLightGrid(curRow: number, curCol: number) {
      this.ResetGrid();
      for (let row = 0; row <= curRow; row++) {
        for (let col = 0; col <= curCol; col++) {
          this.tableGrid[row][col].className = 'selectedCell';
        }
      }
      this.tableGridSummary.innerText = `${curRow + 1} x ${curCol + 1}`;
    },
    GridClick(x: number, y: number) {
      this.ResetGrid();
      this.closeAllSubMenus();
      this.closeAllMenus();
      this.createTable(x + 1, y + 1);
    },
    createTableGrid(parentElement: HTMLDivElement) {
      if (this.tableGrid.length == 0) {
        let innerParent = document.createElement('div');
        innerParent.className = 'grid';
        innerParent.style.gridTemplateColumns = `repeat(${this.tableGridSize},1fr)`; //'auto '.repeat(this.tableGridSize).trimEnd();
        parentElement.appendChild(innerParent);
        for (let row = 0; row < this.tableGridSize; row++) {
          this.tableGrid[row] = new Array<HTMLSpanElement>(this.tableGridSize);
          for (let col = 0; col < this.tableGridSize; col++) {
            let spanElement = document.createElement('span');
            spanElement.className = 'deselectedCell';
            spanElement.innerText = this.whiteSpace;
            spanElement.onmouseenter = () => this.HighLightGrid(row, col);
            spanElement.onclick = () => this.GridClick(row, col);
            this.tableGrid[row][col] = spanElement;
            innerParent.appendChild(spanElement);
          }
        }
        let summarySpanElement = document.createElement('span');
        summarySpanElement.className = 'gridSummary';
        summarySpanElement.style.gridColumnEnd = `${this.tableGridSize + 1}`;
        innerParent.appendChild(summarySpanElement);
        this.tableGridSummary = summarySpanElement;
        this.tableGridSummary.innerText = '0 x 0';
      }
    },
    ShowSubMenu(evt: Event) {
      let clickedMenuItem = evt.currentTarget as HTMLDivElement;
      let subMenu = clickedMenuItem.lastChild as HTMLDivElement;
      this.closeAllSubMenus();
      if (subMenu.childNodes.length == 0) {
        this.createTableGrid(subMenu);
      }
      this.openSubMenus.add(subMenu);
      if (subMenu) {
        subMenu.style.display = 'inline-block';
      }
    },
    createTable(rows: number, cols: number) {
      this.editor.chain().focus().insertTable({ rows: rows, cols: cols, withHeaderRow: true }).run();
    },
    deleteTable() {
      this.editor.chain().focus().deleteTable().run();
    },
    AddPageBreak() {
      if (this.editor.state.selection.empty) {
        this.editor.chain().focus().setPageBreak().run();
        //insertContent({ type: 'paragraph', attributes: 'style:' }).run();
        // this.editor.commands.insertContent('<div style="pageBreak"></div>');
        // let trans = this.editor.state.tr.insertText();
        // this.editor.view.dispatch(trans);
      }
    },
    OnWindowChange(contentHeight: number) {
      this.printSection.style.height = `${contentHeight}px`;
    },
    async loadDocument() {
      if (window) {
        fs.readFile('./export.dat', 'utf8', (e, d) => {
          this.editor.commands.setContent(d);
        });
      }
    },
    saveDocument() {
      if (window) {
        //const fs1 = window.require('fs');
        fs.writeFile('./export.dat', this.editor.getHTML(), 'utf8', err => {
          if (err) {
            console.log(err);
          } else {
            console.log('File written successfully\n');
          }
        });
      }
    }
  }
});
</script>

<template>
  <nav>
    <div class="toolbarGroup">
      <button @click="loadData" class="toolbarButton">
        <img src="../assets/icons/file-2-line.svg" draggable="false" />
      </button>
      <button @click="loadDocument" class="toolbarButton">
        <img src="../assets/icons/folder-open-line.svg" draggable="false" />
      </button>
      <button @click="saveDocument" class="toolbarButton">
        <img src="../assets/icons/save-3-fill.svg" draggable="false" />
      </button>
      <button @click="printDoc" class="toolbarButton">
        <img src="../assets/icons/printer-fill.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" class="toolbarButton">
        <img src="../assets/icons/arrow-go-back-line.svg" draggable="false" />
      </button>
      <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" class="toolbarButton">
        <img src="../assets/icons/arrow-go-forward-line.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }), toolbarButton: true }"
      >
        <img src="../assets/icons/align-left.svg" draggable="false" />
      </button>
      <button
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }), toolbarButton: true }"
      >
        <img src="../assets/icons/align-center.svg" draggable="false" />
      </button>
      <button
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }), toolbarButton: true }"
      >
        <img src="../assets/icons/align-right.svg" draggable="false" />
      </button>
      <button
        @click="editor.chain().focus().setTextAlign('justify').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }), toolbarButton: true }"
      >
        <img src="../assets/icons/align-justify.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button
        :class="{ 'is-active': editor.isActive('bold'), toolbarButton: true }"
        @click="editor.chain().toggleBold().focus().run()"
      >
        <img src="../assets/icons/bold.svg" draggable="false" />
      </button>
      <button
        aria-disabled="false"
        aria-pressed="false"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic'), toolbarButton: true }"
      >
        <img src="../assets/icons/italic.svg" draggable="false" />
      </button>
      <button
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor.isActive('underline'), toolbarButton: true }"
      >
        <img src="../assets/icons/underline.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button title="Table" class="toolbarButtonWithTextAndIcon" @click="toolbarButtonClick($event)">
        <img src="../assets/icons/table.svg" draggable="false" />
        <img src="../assets/icons/down-arrow.svg" draggable="false" />
      </button>
      <div class="dropdownMenu">
        <div @mouseenter="ShowSubMenu($event)">
          <div class="menuItemWithIcon" @mouseenter="ResetGrid()">
            <span>Insert Table</span><img src="../assets/icons/right-arrow.svg" draggable="false" />
          </div>
          <div class="subMenu"></div>
        </div>
        <div @mouseenter="ShowSubMenu($event)">
          <div class="menuItemWithIcon">
            <span>Column</span><img src="../assets/icons/right-arrow.svg" draggable="false" />
          </div>
          <div class="subMenu">
            <div>
              <button
                @click="editor.chain().focus().addColumnBefore().run()"
                :disabled="!editor.can().addColumnBefore()"
                class="subMenuItemButton"
              >
                Insert Column Before
              </button>
            </div>
            <div>
              <button
                @click="editor.chain().focus().addColumnAfter().run()"
                :disabled="!editor.can().addColumnAfter()"
                class="subMenuItemButton"
              >
                Insert Column After
              </button>
            </div>
            <div>
              <button
                @click="editor.chain().focus().deleteColumn().run()"
                :disabled="!editor.can().deleteColumn()"
                class="subMenuItemButton"
              >
                Delete Column
              </button>
            </div>
          </div>
        </div>
        <div>
          <div class="menuItem">Row</div>
        </div>
        <div>
          <div class="menuItem">Cell</div>
        </div>
        <div>
          <div class="menuItem" @click="deleteTable()">Delete Table</div>
        </div>
      </div>
      <button
        title="Draw Underbracket"
        @click="editor.chain().focus().toggleUnderBracket().run()"
        class="toolbarButton"
      >
        <img src="../assets/icons/under-bracket.svg" draggable="false" />
      </button>
      <button
        title="Double Underline"
        @click="this.editor.chain().focus().toggleDoubleUnderLine().run()"
        class="toolbarButton"
      >
        <img src="../assets/icons/double-underline.svg" draggable="false" />
      </button>
      <button @click="addCharacter(dotBelow)" title="Dot Below" class="toolbarButton">
        <img src="../assets/icons/dot-under.svg" draggable="false" />
      </button>
      <button @click="addCharacter(lineBelow)" title="Line Below" class="toolbarButton">
        <img src="../assets/icons/line-under.svg" draggable="false" />
      </button>
      <button @click="addCharacter(dotAbove)" title="Dot Above" class="toolbarButton">
        <img src="../assets/icons/dot-above.svg" draggable="false" />
      </button>
      <button @click="addCharacter(lineAbove)" title="Line Above" class="toolbarButton">
        <img src="../assets/icons/line-above.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <div class="menuPad">
        <button class="toolbarButtonWithTextAndIcon" @click="toolbarButtonClick($event)">
          <span class="txt">{{ currentFont }}</span>
          <img src="../assets/icons/down-arrow.svg" draggable="false" />
        </button>
        <div class="dropdownMenu">
          <template v-for="font in availableFonts" :key="font">
            <div>
              <div class="menuItem" @click="setFont(font, currentFontSize)">{{ font }}</div>
            </div>
          </template>
        </div>
      </div>

      <div class="menuPad">
        <button class="toolbarButtonWithTextAndIcon" @click="toolbarButtonClick($event)">
          <span>{{ currentFontSize }}</span>
          <img src="../assets/icons/down-arrow.svg" draggable="false" />
        </button>
        <div class="dropdownMenu">
          <template v-for="size in availableFontSizes" :key="size">
            <div>
              <div class="menuItem" @click="setFont(currentFont, size)">{{ size }}</div>
            </div>
          </template>
        </div>
      </div>
      <button @click="AddPageBreak" title="Page Break" class="toolbarButton">
        <img src="../assets/icons/page-break.svg" draggable="false" />
      </button>
    </div>
  </nav>

  <editor-content :editor="editor" id="printSection" class="scrollView" />

  <footer class="statusBar">
    <div>Status Bar</div>
  </footer>
</template>
