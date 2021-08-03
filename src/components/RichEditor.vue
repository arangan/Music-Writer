<script lang="ts">
import { defineComponent } from 'vue';
//useEditor
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
import { mergeAttributes } from '@tiptap/core';

/* ------------ custom components ------------ */
import DoubleUnderLine from './DoubleUnderLine.vue';
import UnderBracket from './UnderBracket.vue';
import '../assets/RichEditor.scss';

export default defineComponent({
  components: { EditorContent },
  props: { data: String },
  setup() {
    const editor = new Editor({
      injectCSS: false,
      autofocus: true,
      extensions: [
        StarterKit,
        Paragraph.extend({
          parseHTML() {
            return [{ tag: 'div' }];
          },
          renderHTML({ HTMLAttributes }) {
            return [
              'div',
              mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
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
        UnderBracket
      ]
    });
    return { editor };
  },
  mounted() {
    let dat: string = this.data?.toString() ?? '';
    console.log(`[${dat}]`);
    this.editor.chain().setContent(dat).focus();
  },
  beforeUnmount() {
    this.editor.destroy();
  },

  methods: {
    setData(dat: string) {
      this.editor.commands.setContent(dat);
    },
    toggleUnderBracket() {
      // this.editor.chain().toggleUnderBracket().focus();
      this.editor.commands.toggleUnderBracket();
    },
    toggleDoubleUnderLine() {
      // this.editor.chain().toggleDoubleUnderLine().focus();
      this.editor.commands.toggleDoubleUnderLine();
    }
  }
});
</script>

<template>
  <editor-content :editor="editor" />
</template>
