import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const version = '4.0.0-alpha.1';

/* eslint-disable prefer-template -- for better formatting */
export const banner = '/**\n' +
                      ' * core-js ' + version + '\n' +
                      ' * © 2013–2025 Denis Pushkarev (zloirock.ru), 2025–2026 CoreJS Company (core-js.io). All rights reserved.\n' +
                      ' * license: https://github.com/zloirock/core-js/blob/v' + version + '/LICENSE\n' +
                      ' * source: https://github.com/zloirock/core-js\n' +
                      ' */';
/* eslint-enable prefer-template -- for better formatting */

export function getRolldownOptions(input, output) {
  // the entry template is generated in a temporary directory, from which walking up to `core-js` finds nothing,
  // so the lookup starts where this package itself resolves it - lazily, since only the `bundle` format needs it
  const coreJSRoot = dirname(fileURLToPath(import.meta.resolve('core-js/package.json')));

  return {
    input,
    platform: 'neutral',
    treeshake: false,
    resolve: {
      modules: [dirname(coreJSRoot), 'node_modules'],
    },
    // an unresolved specifier is not an error for the bundler - it turns the module into an external import
    // and drops it from the output, so a misresolved `core-js` would quietly produce an empty bundle
    onLog(level, log, defaultHandler) {
      if (log.code === 'UNRESOLVED_IMPORT') throw new Error(log.message);
      defaultHandler(level, log);
    },
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
