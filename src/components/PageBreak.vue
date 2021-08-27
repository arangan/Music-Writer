<script lang="ts">
import { Node, mergeAttributes } from '@tiptap/core';

export interface PageBreakOptions {
  HTMLAttributes: Record<string, string>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      /**
       * Add a page break
       */
      setPageBreak: () => ReturnType;
    };
  }
}

const PageBreak = Node.create<PageBreakOptions>({
  name: 'pageBreak',

  defaultOptions: {
    HTMLAttributes: {
      class: 'pageBreak'
    }
  },

  //inline: true,
  //content: 'inline',
  group: 'block',
  selectable: false,
  //defining: true,

  //selectable: true,

  parseHTML() {
    return [{ tag: 'footer' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['footer', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }) => {
          return commands.first([() => commands.exitCode(), () => commands.insertContent({ type: this.name })]);
        }
    };
  },

  addKeyboardShortcuts() {
    return {
      'Control-Mod-Enter': () => this.editor.commands.setHardBreak()
    };
  }
});

export default PageBreak;
</script>
