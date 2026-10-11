require("core-js/modules/es.object.to-string");
require("core-js/modules/es.promise.constructor");
require("core-js/modules/es.promise.catch");
require("core-js/modules/es.promise.finally");
require("core-js/modules/es.array.iterator");
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
require("core-js/modules/es.map.constructor");
require("core-js/modules/es.map.species");
require("core-js/modules/es.map.get-or-insert");
require("core-js/modules/es.map.get-or-insert-computed");
require("core-js/modules/es.string.iterator");
require("core-js/modules/web.dom-collections.iterator");
require("core-js/modules/web.self");
// the same top level in a file spelling CommonJS is the body of the wrapper its loader puts around it: a `var` or a
// function there is the wrapper's own, so the constructors it holds stay home and load no static family
var Promise = self.Promise;
var M;
M = Map;
function iteratorCtor() {
  return Iterator;
}
module.exports = 0;