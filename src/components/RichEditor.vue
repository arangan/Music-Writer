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
  emits: ['fontChanged'],
  props: { docData: String, defaultFont: String, defaultFontSize: String, defaultFontUnit: String },
  setup(props) {
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
              mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                style: `font-family:${props.defaultFont}; font-size:${props.defaultFontSize}${props.defaultFontUnit}`
              }),
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
      currentFont: this.$props.defaultFont,
      currentFontSize: this.$props.defaultFontSize,
      documentData: this.docData
    };
  },

  mounted() {
    let dat: string = this.docData?.toString() ?? '';
    // console.log(`[${this.docData}]`);
    this.editor.chain().focus().setContent(dat).run();

    // console.log(`className - [${this.editor.options.element.firstElementChild?.className}]`);

    this.editor.on('selectionUpdate', this.OnSelectionUpdate);
  },

  beforeUnmount() {
    this.editor.destroy();
  },

  methods: {
    setData(dat: string) {
      this.editor.commands.setContent(dat);
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
    setFont(fontName: string, fontSize: string) {
      // if (this.editor.isActive('textStyle', { fontFamily: fontName })) {
      //   this.editor.chain().focus().unsetFontFamily().run();
      // } else {
      // }
      //console.log(this.editor.isActive('textStyle', { fontFamily: fontName }));

      this.currentFont = fontName;
      this.currentFontSize = fontSize;

      if (this.editor.state.selection.empty) {
        // let attr = document.createAttribute('style');
        // attr.value = `font-family: ${this.currentFont}; font-size: ${this.currentFontSize}${this.$props.defaultFontUnit}`;
        // this.editor.options.element.firstElementChild?.attributes.setNamedItem(attr);
      } else {
        console.log('ping');
        this.editor.chain().focus().setFontFamily(this.currentFont).run();
        this.editor.chain().focus().setFontSize(`${this.currentFontSize}${this.defaultFontUnit}`).run();
      }
      // this.editor.chain().focus().removeEmptyTextStyle();
      //this.editor.chain().setMark('textStyle', { style: 'font-family:consolas' }).run();
    },
    createTable(rows: number, cols: number) {
      this.editor.chain().focus().insertTable({ rows: rows, cols: cols, withHeaderRow: true }).run();
    },
    deleteTable() {
      this.editor.chain().focus().deleteTable().run();
    },
    OnSelectionUpdate() {
      let fontInfo = this.editor.getAttributes('textStyle');
      console.log(fontInfo);
      console.log('curentFont = ' + this.currentFont);
      if (fontInfo.fontFamily != this.currentFont || fontInfo.fontSize != this.currentFontSize) {
        //this.$emit('fontChanged', fontInfo);
        this.currentFont = fontInfo.family; // !this.currentFont ? this.$props.defaultFont : fontInfo.family;
        this.currentFontSize = fontInfo.fontSize; //!this.currentFontSize ? this.$props.defaultFontSize : fontInfo.fontSize;
      }

      console.log('curentFont set = ' + this.currentFont);

      //console.log('para => ' + JSON.stringify(this.editor.getAttributes('paragraph')));
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
  <editor-content :editor="editor" />
</template>
