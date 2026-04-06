import { createUnplugin } from 'unplugin';
import createPlugin from './internals/plugin.js';

// match JS/TS/Flow extensions; strip bundler query/hash suffix (Vite: foo.js?import)
// exclude .d.ts declaration files — they contain only types, no runtime code
const JS_RE = /\.(?:[cm]?[jt]sx?|flow)(?:[#?][^#?]*)?$/;
const DTS_RE = /\.d\.[cm]?ts(?:[#?][^#?]*)?$/;

const unplugin = createUnplugin((options, meta) => {
  const plugin = createPlugin({ ...options, bundler: meta?.framework });
  return {
    name: plugin.name,
    enforce: 'pre',
    transformInclude(id) {
      return JS_RE.test(id) && !DTS_RE.test(id);
    },
    transform(code, id) {
      return plugin.transform(code, id);
    },
  };
});

export default unplugin;
export const { vite } = unplugin;
export const { webpack } = unplugin;
export const { rollup } = unplugin;
export const { esbuild } = unplugin;
export const { rspack } = unplugin;
export const { rolldown } = unplugin;
export const { farm } = unplugin;
export const { unloader } = unplugin;
export const { bun } = unplugin;
