import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the static call's receiver is a proxy-global produced by a SequenceExpression-prefixed IIFE
// (`(0, function(){return globalThis})()`); the wrapper must be peeled so `Map.groupBy` resolves
// and its dep is injected
(0, function () {
  return globalThis;
})().Map.groupBy([], x => x);