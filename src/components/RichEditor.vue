<script lang="ts">
import { defineComponent } from 'vue';
//useEditor
import { EditorContent, Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import { mergeAttributes } from '@tiptap/core';
import '../assets/RichEditor.scss';

export default defineComponent({
  components: { EditorContent },
  props: { data: String },
  setup() {
    const editor = new Editor({
      content: 'Hello World',
      injectCSS: false,
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
        })
      ]
    });
    return { editor };
  },
  mounted() {
    let dat: string = this.data?.toString() ?? '';

    this.editor.chain().setContent(dat).focus();
  },
  beforeUnmount() {
    this.editor.destroy();
  },

  methods: {
    setData(dat: string) {
      this.editor.commands.setContent(dat);
    }
  }
});
</script>

<template>
  <editor-content :editor="editor" />
</template>
