<script lang="ts">
//#region ---- Imports ----
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
import '../assets/table.scss';
//#endregion

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
    const tabPressEvent = new Event('tabPressedEvent');
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
          },
          addKeyboardShortcuts() {
            return {
              Tab: () => {
                dispatchEvent(tabPressEvent);
                return true;
              }
            };
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
      hat: '\u0302',
      graveAccent: '\u0301',
      tabSize: 4,
      currentFont: this.$props.Font,
      currentFontSize: this.$props.FontSize,
      defaultFont: this.$props.Font,
      defaultFontSize: this.$props.FontSize,
      defaultFontUnit: this.$props.FontUnit,
      documentData: this.docData,
      printSection: {} as HTMLDivElement,
      openMenus: new Set<HTMLDivElement>(),
      openSubMenus: new Set<HTMLDivElement>(),
      tableGridSize: 10,
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
    addEventListener('tabPressedEvent', this.OnTabKeyPressed);
  },

  beforeUnmount() {
    this.editor.destroy();
  },

  methods: {
    //#region *** Menu and Sub-Menu Handling ***
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
    //#endregion

    //#region *** Create Table Grid ***
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
      this.editor
        .chain()
        .focus()
        .insertTable({ rows: x + 1, cols: y + 1, withHeaderRow: false })
        .run();
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
    //#endregion

    //#region *** Global Events ***
    OnWindowChange(contentHeight: number) {
      this.printSection.style.height = `${contentHeight}px`;
    },
    OnTabKeyPressed() {
      let trans = this.editor.state.tr.insertText(this.whiteSpace.repeat(this.tabSize));
      this.editor.view.dispatch(trans);
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
    OnPageClick() {
      this.closeAllMenus();
    },
    //#endregion

    //#region **** Document Load / Save ****
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
    },
    //#endregion

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

    AddPageBreak() {
      if (this.editor.state.selection.empty) {
        this.editor.chain().focus().setPageBreak().run();
      }
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

    printDoc(): void {
      window.print();
      this.editor.chain().focus().run();
    },

    setData(dat: string) {
      this.editor.commands.setContent(dat);
    },

    loadData() {
      // console.log(`className - [${this.editor.options.element.firstElementChild?.className}]`);
      // const { from, to } = this.editor.view.state.selection;
      // let obj = this.editor.view.state.domAtPos(from);
      // console.log(`${typeof obj}`);
    }
  }
});
</script>

<template>
  <nav>
    <div class="toolbarGroup">
      <button @click="loadData" class="toolbarButton" title="New ">
        <img src="../assets/icons/file-2-line.svg" draggable="false" />
      </button>
      <button @click="loadDocument" class="toolbarButton" title="Open...">
        <img src="../assets/icons/folder-open-line.svg" draggable="false" />
      </button>
      <button @click="saveDocument" class="toolbarButton" title="Save">
        <img src="../assets/icons/save-3-fill.svg" draggable="false" />
      </button>
      <button @click="printDoc" class="toolbarButton" title="Print">
        <img src="../assets/icons/printer-fill.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        class="toolbarButton"
        title="Undo"
      >
        <img src="../assets/icons/arrow-go-back-line.svg" draggable="false" />
      </button>
      <button
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        class="toolbarButton"
        title="Redo"
      >
        <img src="../assets/icons/arrow-go-forward-line.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button
        title="Align Left"
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }), toolbarButton: true }"
      >
        <img src="../assets/icons/align-left.svg" draggable="false" />
      </button>
      <button
        title="Align Center"
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }), toolbarButton: true }"
      >
        <img src="../assets/icons/align-center.svg" draggable="false" />
      </button>
      <button
        title="Align Right"
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }), toolbarButton: true }"
      >
        <img src="../assets/icons/align-right.svg" draggable="false" />
      </button>
      <button
        title="Justify "
        @click="editor.chain().focus().setTextAlign('justify').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }), toolbarButton: true }"
      >
        <img src="../assets/icons/align-justify.svg" draggable="false" />
      </button>
    </div>
    <div class="toolbarGroup">
      <button
        title="Bold"
        :class="{ 'is-active': editor.isActive('bold'), toolbarButton: true }"
        @click="editor.chain().toggleBold().focus().run()"
      >
        <img src="../assets/icons/bold.svg" draggable="false" />
      </button>
      <button
        title="Italics"
        aria-disabled="false"
        aria-pressed="false"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic'), toolbarButton: true }"
      >
        <img src="../assets/icons/italic.svg" draggable="false" />
      </button>
      <button
        title="Underline"
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
        <div @mouseenter="ShowSubMenu($event)" @click="$event.stopImmediatePropagation()">
          <div class="menuItemWithIcon" @mouseenter="ResetGrid()">
            <span>Insert Table</span><img src="../assets/icons/right-arrow.svg" draggable="false" />
          </div>
          <div class="subMenu"></div>
        </div>
        <div @mouseenter="ShowSubMenu($event)" @click="$event.stopImmediatePropagation()">
          <div class="menuItemWithIcon">
            <span>Column</span><img src="../assets/icons/right-arrow.svg" draggable="false" />
          </div>
          <div class="subMenu">
            <div>
              <button
                @click="
                  editor.chain().focus().addColumnBefore().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().addColumnBefore()"
                class="subMenuItemButton"
              >
                Insert Column Before
              </button>
            </div>
            <div>
              <button
                @click="
                  editor.chain().focus().addColumnAfter().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().addColumnAfter()"
                class="subMenuItemButton"
              >
                Insert Column After
              </button>
            </div>
            <div>
              <button
                @click="
                  editor.chain().focus().deleteColumn().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().deleteColumn()"
                class="subMenuItemButton"
              >
                Delete Column
              </button>
            </div>
            <div>
              <button
                @click="
                  editor.chain().focus().toggleHeaderColumn().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().toggleHeaderColumn()"
                class="subMenuItemButton"
              >
                Toggle Header Column
              </button>
            </div>
          </div>
        </div>
        <div @mouseenter="ShowSubMenu($event)" @click="$event.stopImmediatePropagation()">
          <div class="menuItemWithIcon">
            <span>Row</span><img src="../assets/icons/right-arrow.svg" draggable="false" />
          </div>
          <div class="subMenu">
            <div>
              <button
                @click="
                  editor.chain().focus().addRowBefore().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().addRowBefore()"
                class="subMenuItemButton"
              >
                Insert Row Above
              </button>
            </div>
            <div>
              <button
                @click="
                  editor.chain().focus().addRowAfter().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().addRowAfter()"
                class="subMenuItemButton"
              >
                Insert Row Below
              </button>
            </div>
            <div>
              <button
                @click="
                  editor.chain().focus().deleteRow().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().deleteRow()"
                class="subMenuItemButton"
              >
                Delete Row
              </button>
            </div>
            <div>
              <button
                @click="
                  editor.chain().focus().toggleHeaderRow().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().toggleHeaderRow()"
                class="subMenuItemButton"
              >
                Toggle Header Row
              </button>
            </div>
          </div>
        </div>
        <div @mouseenter="ShowSubMenu($event)" @click="$event.stopImmediatePropagation()">
          <div class="menuItemWithIcon">
            <span>Cell</span><img src="../assets/icons/right-arrow.svg" draggable="false" />
          </div>
          <div class="subMenu">
            <div>
              <button
                @click="
                  editor.chain().focus().mergeCells().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().mergeCells()"
                class="subMenuItemButton"
              >
                Merge Cells
              </button>
            </div>
            <div>
              <button
                @click="
                  editor.chain().focus().splitCell().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().splitCell()"
                class="subMenuItemButton"
              >
                Split Cell
              </button>
            </div>
            <div>
              <button
                @click="
                  editor.chain().focus().toggleHeaderCell().run();
                  closeAllMenus();
                "
                :disabled="!editor.can().toggleHeaderCell()"
                class="subMenuItemButton"
              >
                Toggle Header Cell
              </button>
            </div>
          </div>
        </div>
        <div @mouseenter="closeAllSubMenus()">
          <button
            class="subMenuItemButton"
            @click="
              editor.chain().focus().deleteTable().run();
              closeAllMenus();
            "
            :disabled="!editor.can().deleteTable()"
          >
            Delete Table
          </button>
        </div>
      </div>
      <button
        title="Draw Underbracket"
        @click="editor.chain().focus().toggleUnderBracket().run()"
        :class="{ 'is-active': editor.isActive('UnderBracket'), toolbarButton: true }"
      >
        <img src="../assets/icons/under-bracket.svg" draggable="false" />
      </button>
      <button
        title="Double Underline"
        @click="this.editor.chain().focus().toggleDoubleUnderLine().run()"
        :class="{ 'is-active': editor.isActive('DoubleUnderLine'), toolbarButton: true }"
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
