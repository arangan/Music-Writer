<script lang="ts">
import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

type FontFamilyOptions = {
  types: string[];
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontFamily: {
      /**
       * Set the font family
       */
      // eslint-disable-next-line no-unused-vars
      setFontFamily: (fontFamily: string) => ReturnType;
      /**
       * Unset the font family
       */
      unsetFontFamily: () => ReturnType;

      // eslint-disable-next-line no-unused-vars
      setFontSize: (fontSize: string) => ReturnType;
    };
  }
}

const FontFamily = Extension.create<FontFamilyOptions>({
  name: 'fontFamily',

  defaultOptions: {
    types: ['textStyle']
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {};
              }
              return {
                style: `font-family: ${attributes.fontFamily}`
              };
            },
            parseHTML: element => ({
              fontFamily: element.style.fontFamily.replace(/['"]+/g, '')
            })
          },
          fontSize: {
            default: null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size:${attributes.fontSize}`
              };
            },
            parseHTML: element => ({
              fontFamily: element.style.fontFamily.replace(/['"]+/g, '')
            })
          }
        }
      }
    ];
  },

  addCommands() {
    return {
      setFontFamily:
        fontFamily =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontFamily }).run();
        },
      unsetFontFamily:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run();
        },
      setFontSize:
        fontSize =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        }
    };
  }
});

export default FontFamily;
</script>
