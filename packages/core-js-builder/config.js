import { readFileSync } from 'node:fs';
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
  // The temporary entry is outside the installation. Resolve from the package Node selected,
  // using its self-reference for exports or its own directory for a package without exports.
  const manifest = fileURLToPath(import.meta.resolve('core-js/package.json'));
  // eslint-disable-next-line node/no-sync -- the public options factory is synchronous
  const { name = 'core-js', exports } = JSON.parse(readFileSync(manifest, 'utf8').replace(/^\uFEFF/, ''));
  const prefix = exports === undefined ? '.' : name;

  return {
    input,
    platform: 'neutral',
    treeshake: false,
    plugins: [{
      name: 'resolve-core-js',
      resolveId: {
        filter: { id: /^core-js(?:\/|$)/ },
        async handler(id, importer, options) {
          const resolved = await this.resolve(prefix + id.slice('core-js'.length), manifest, options);
          if (!resolved) this.error(`Cannot resolve '${ id }' from @core-js/builder`);
          return resolved;
        },
      },
    }],
    // an unresolved specifier is not an error for the bundler - it turns the module into an external import
    // and drops it from the output, so a misresolved `core-js` would quietly produce an empty bundle
    onLog(level, log, defaultHandler) {
      if (log.code === 'UNRESOLVED_IMPORT') throw new Error(log.message);
      defaultHandler(level, log);
    },
    output: {
      charset: 'ascii',
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
