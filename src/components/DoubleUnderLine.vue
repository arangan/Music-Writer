<script lang="ts">
import { Mark, mergeAttributes } from '@tiptap/core';

interface DoubleUnderLineOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    DoubleUnderLine: {
      setDoubleUnderLine: () => ReturnType;
      toggleDoubleUnderLine: () => ReturnType;
      unsetDoubleUnderLine: () => ReturnType;
    };
  }
}

const DoubleUnderLine = Mark.create<DoubleUnderLineOptions>({
  name: 'DoubleUnderLine',

  defaultOptions: {
    HTMLAttributes: {
      class: 'doubleUnderLine'
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: node =>
          (node as HTMLSpanElement).className !== 'doubleUnderLine' && null
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ];
  },

  addCommands() {
    return {
      setDoubleUnderLine:
        () =>
        ({ commands }) =>
          commands.setMark('DoubleUnderLine'),
      toggleDoubleUnderLine:
        () =>
        ({ commands, editor }) => {
          if (editor.view.state.selection.empty) {
            return false;
          }
          return commands.toggleMark('DoubleUnderLine');
        },
      unsetDoubleUnderLine:
        () =>
        ({ commands }) =>
          commands.unsetMark('DoubleUnderLine')
    };
  }

  //   addKeyboardShortcuts() {
  //     return {
  //       'Mod-f': () => this.editor.commands.toggleDoubleUnderLine(),
  //     };
  //   },
});

export default DoubleUnderLine;
</script>
