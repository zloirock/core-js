// A fresh realm with core-js's own implementations loaded into it. A static deleted in the realm first makes
// core-js install its version there instead of keeping the engine's; core-js's modules require only each
// other, by relative path, which is all this loader resolves
import { createContext, runInContext } from 'node:vm';

export function loadCoreJS(context, file, cache = new Map()) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  // eslint-disable-next-line node/no-sync -- a `require` is synchronous, and so is the loader standing in for it
  const wrapper = runInContext(`(function (exports, require, module) {${ fs.readFileSync(file, 'utf8') }\n})`, context, { filename: file });
  wrapper(module.exports, id => {
    const base = path.resolve(path.dirname(file), id);
    // eslint-disable-next-line node/no-sync -- resolved inside the same synchronous `require`
    return loadCoreJS(context, fs.existsSync(`${ base }.js`) ? `${ base }.js` : `${ base }/index.js`, cache);
  }, module);
  return module.exports;
}

// a realm with every core-js polyfill installed over the engine's built-ins; core-js's shared store on the
// realm's global proves the load reached it
export function polyfilledRealm() {
  const context = createContext();
  loadCoreJS(context, path.resolve('packages/core-js/full/index.js'));
  if (runInContext("typeof globalThis['__core-js_shared__']", context) !== 'object') throw new Error('core-js did not load into the realm');
  return context;
}

export { createContext, runInContext };
