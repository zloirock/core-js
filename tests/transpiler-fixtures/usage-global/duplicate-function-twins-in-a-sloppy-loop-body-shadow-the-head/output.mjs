require("core-js/modules/es.symbol.constructor");
require("core-js/modules/es.symbol.description");
require("core-js/modules/es.symbol.iterator");
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.iterator");
require("core-js/modules/es.array.from");
require("core-js/modules/es.iterator.constructor");
require("core-js/modules/es.iterator.chunks");
require("core-js/modules/es.iterator.dispose");
require("core-js/modules/es.iterator.drop");
require("core-js/modules/es.iterator.every");
require("core-js/modules/es.iterator.filter");
require("core-js/modules/es.iterator.find");
require("core-js/modules/es.iterator.flat-map");
require("core-js/modules/es.iterator.for-each");
require("core-js/modules/es.iterator.includes");
require("core-js/modules/es.iterator.join");
require("core-js/modules/es.iterator.map");
require("core-js/modules/es.iterator.reduce");
require("core-js/modules/es.iterator.some");
require("core-js/modules/es.iterator.take");
require("core-js/modules/es.iterator.to-array");
require("core-js/modules/es.iterator.windows");
require("core-js/modules/es.string.iterator");
require("core-js/modules/web.dom-collections.iterator");
// sloppy code may declare one function name twice in a block: in a loop body redeclaring the head's name
// the last declaration shadows the head there, so the read is the user's function and no static of the
// constructor the head iterates. the loop brings the iteration modules and its element its family
for (const I of [Iterator]) {
  function I() {}
  function I() {}
  use(I.from);
}