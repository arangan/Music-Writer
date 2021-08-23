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
      setFontFamily: (fontFamily: Record<string, string>) => ReturnType;
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
              console.log('rendering HTMl');
              if (!attributes.fontFamily) {
                return {};
              }
              console.log(attributes);
              return {
                style: `font-family: ${attributes.fontFamily.fontName}; font-size: ${attributes.fontFamily.fontSize}${attributes.fontFamily.fontUnit}`
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
          console.log(fontFamily);
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
