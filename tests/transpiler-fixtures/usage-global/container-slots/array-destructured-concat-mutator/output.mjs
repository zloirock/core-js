import "core-js/modules/es.object.prevent-extensions";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A folded computed pattern key detaches the repositioning method from its array receiver.
const patternConcatDetaches = function () {
  const patternConcatBox = [Object, Map];
  // eslint-disable-next-line no-useless-concat -- the folded spelling is the shape under test
  const {
    ['rev' + 'erse']: pm
  } = patternConcatBox;
  pm.call(patternConcatBox);
  const {
    0: {
      preventExtensions
    }
  } = patternConcatBox;
  return preventExtensions;
}();
export { patternConcatDetaches };