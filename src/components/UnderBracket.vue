<script lang="ts">
import {
  Mark,
  markInputRule,
  // markPasteRule,
  mergeAttributes
} from '@tiptap/core';

interface UnderBracketOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    UnderBracket: {
      /**
       * Set a UnderBracket mark
       */
      setUnderBracket: () => ReturnType;
      /**
       * Toggle a UnderBracket mark
       */
      toggleUnderBracket: () => ReturnType;
      /**
       * Unset a UnderBracket mark
       */
      unsetUnderBracket: () => ReturnType;
    };
  }
}

export const starInputRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/gm;
// export const starPasteRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/gm;
// export const underscoreInputRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))$/gm;
// export const underscorePasteRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))/gm;

const UnderBracket = Mark.create<UnderBracketOptions>({
  name: 'UnderBracket',

  defaultOptions: {
    HTMLAttributes: {
      class: 'underBracket'
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: node =>
          (node as HTMLSpanElement).className !== 'underBracket' && null
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
      setUnderBracket:
        () =>
        ({ commands }) =>
          commands.setMark('UnderBracket'),
      toggleUnderBracket:
        () =>
        ({ commands, editor }) => {
          if (editor.view.state.selection.empty) {
            return false;
          }
          return commands.toggleMark('UnderBracket');
        },
      unsetUnderBracket:
        () =>
        ({ commands }) =>
          commands.unsetMark('UnderBracket')
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-g': () => this.editor.commands.toggleUnderBracket()
    };
  },

  addInputRules() {
    return [
      markInputRule(starInputRegex, this.type)
      //markInputRule(underscoreInputRegex, this.type),
    ];
  }

  // addPasteRules() {
  //   return [
  //     markPasteRule(starPasteRegex, this.type),
  //     markPasteRule(underscorePasteRegex, this.type),
  //   ];
  // },
});

export default UnderBracket;
</script>
