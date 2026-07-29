require("core-js/modules/es.symbol.iterator");
require("core-js/modules/es.object.group-by");
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.promise.constructor");
require("core-js/modules/es.promise.catch");
require("core-js/modules/es.promise.finally");
require("core-js/modules/es.promise.resolve");
require("core-js/modules/es.array.iterator");
require("core-js/modules/es.array.from-async");
require("core-js/modules/es.iterator.constructor");
require("core-js/modules/es.iterator.dispose");
require("core-js/modules/es.iterator.drop");
require("core-js/modules/es.iterator.every");
require("core-js/modules/es.iterator.filter");
require("core-js/modules/es.iterator.find");
require("core-js/modules/es.iterator.flat-map");
require("core-js/modules/es.iterator.for-each");
require("core-js/modules/es.iterator.from");
require("core-js/modules/es.iterator.map");
require("core-js/modules/es.iterator.reduce");
require("core-js/modules/es.iterator.some");
require("core-js/modules/es.iterator.take");
require("core-js/modules/es.iterator.to-array");
require("core-js/modules/es.map.constructor");
require("core-js/modules/es.map.species");
require("core-js/modules/es.map.group-by");
require("core-js/modules/es.map.get-or-insert");
require("core-js/modules/es.map.get-or-insert-computed");
require("core-js/modules/es.string.iterator");
require("core-js/modules/esnext.iterator.chunks");
require("core-js/modules/esnext.iterator.includes");
require("core-js/modules/esnext.iterator.join");
require("core-js/modules/esnext.iterator.windows");
require("core-js/modules/web.dom-collections.iterator");
// Annex-B block-function hoisting exists only in sloppy code, and only when nothing between the
// function and its var-scope owner lexically rebinds the name. a plain block rebinds nothing, so
// the hoist wins and the name is LOCAL - no polyfill. every other construct here binds the name
// lexically around the block, which blocks the hoist and leaves the reference GLOBAL - so the
// polyfill is required. an identifier catch param is the one exemption: B.3.5 keeps the hoist
{
  function Promise() {}
}
Promise.withResolvers();
try {
  null.x;
} catch (Set) {
  {
    function Set() {}
  }
}
new Set().union(new Set());
for (let Map of []) {
  function Map() {}
}
Map.groupBy([], v => v);
switch (1) {
  case 1:
    let Object;
    {
      function Object() {}
    }
}
Object.groupBy([], v => v);
try {
  null.x;
} catch ({
  Array
}) {
  {
    function Array() {}
  }
}
Array.fromAsync([]);
for (const Iterator in {}) {
  function Iterator() {}
}
Iterator.from([]);
module.exports = 1;