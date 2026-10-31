import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A const-bound method key can name a repositioning method before the nested slot read.
const repositionedByBoundKey = function () {
  const boundKeyBox = [Object, Map];
  const methodName = 'reverse';
  boundKeyBox[methodName]();
  const {
    0: {
      groupBy
    }
  } = boundKeyBox;
  return groupBy;
}();
export { repositionedByBoundKey };