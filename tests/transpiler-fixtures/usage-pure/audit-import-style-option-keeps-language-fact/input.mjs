// `importStyle` is EMISSION configuration: asking for `require` output must not turn this ES
// module into a sloppy script. It is one, so the block-scoped `function Map` shadows nothing and
// `new Map()` reads the global - which is exactly what the polyfill is owed for.
import { x } from "./x.js";
{ function Map() {} }
export const m = new Map();
export const y = x;
