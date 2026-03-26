import { createUnplugin } from 'unplugin';
import createPlugin from './internals/plugin.js';

const JS_RE = /\.(?:[cm]?[jt]sx?|flow)$/;

const unplugin = createUnplugin((options, meta) => {
  const plugin = createPlugin({ ...options, bundler: meta?.framework });
  return {
    name: plugin.name,
    transformInclude(id) {
      return JS_RE.test(id);
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
