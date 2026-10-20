// Claims inside a sealed nav's computed key are polyfilled in the probe the destructure re-emits: a static read, an
// instance call, a nested destructure and the destructures of both loop heads each land once, where the key runs.
const log = [];
const { of: o1 } = (globalThis.window?.[(log.push(typeof Object.keys), 'self')]).Array;
const { of: o2 } = (globalThis.window?.[(log.push([1, 2].findLast(x => x)), 'self')]).Array;
const { of: o3 } = (globalThis.window?.[((() => { const { sign } = Math; log.push(typeof sign); })(), 'self')]).Array;
const { of: o4 } = (globalThis.window?.[((() => { for (const { from } of [Array]) log.push(typeof from); })(), 'self')]).Array;
const { of: o5 } = (globalThis.window?.[((() => { for (const { at } in { x: 1 }) log.push(typeof at); })(), 'self')]).Array;
export { log, o1, o2, o3, o4, o5 };
