require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.iterator");
require("core-js/modules/es.map.constructor");
require("core-js/modules/es.map.species");
require("core-js/modules/es.map.get-or-insert");
require("core-js/modules/es.map.get-or-insert-computed");
require("core-js/modules/es.string.iterator");
require("core-js/modules/web.dom-collections.iterator");
// `importStyle` is EMISSION configuration: asking for `require` output must not turn this ES
// module into a sloppy script. It is one, so the block-scoped `function Map` shadows nothing and
// `new Map()` reads the global - which is exactly what the polyfill is owed for.
import { x } from "./x.js";
{
  function Map() {}
}
export const m = new Map();
export const y = x;