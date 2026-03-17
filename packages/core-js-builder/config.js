const version = '4.0.0-alpha.0';

/* eslint-disable prefer-template -- for better formatting */
export const banner = '/**\n' +
                      ' * core-js ' + version + '\n' +
                      ' * © 2013–2025 Denis Pushkarev (zloirock.ru), 2025–2026 CoreJS Company (core-js.io). All rights reserved.\n' +
                      ' * license: https://github.com/zloirock/core-js/blob/v' + version + '/LICENSE\n' +
                      ' * source: https://github.com/zloirock/core-js\n' +
                      ' */';
/* eslint-enable prefer-template -- for better formatting */

export function getRolldownOptions(input, output) {
  return {
    input,
    platform: 'neutral',
    treeshake: false,
    output: {
      externalLiveBindings: false,
      format: 'iife',
      file: output,
      keepNames: true,
      minifyInternalExports: true,
    },
  };
}

export const ModernSyntax = [
  'arrow-functions',
  'shorthand-properties',
];

export const MinifyOptions = {
  minify: true,
  jsc: {
    minify: {
      compress: {
        arrows: false,
        ecma: 5,
        hoist_funs: true,
        keep_fnames: true,
        pure_getters: true,
        reduce_funcs: true,
        // document.all detection case
        typeofs: false,
        unsafe_proto: true,
        unsafe_undefined: true,
      },
      mangle: {
        keep_fnames: true,
        safari10: true,
        toplevel: true,
      },
      format: {
        comments: false,
        ecma: 5,
      },
    },
  },
};
