import "core-js/modules/es.object.is-frozen";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A folded concatenated method key names a mutator that can reposition array elements.
const repositionedByConcatKey = function () {
  const concatBox = [Object, Map];
  // eslint-disable-next-line no-useless-concat -- the folded spelling is the shape under test
  concatBox['rev' + 'erse']();
  const {
    0: {
      isFrozen
    }
  } = concatBox;
  return isFrozen;
}();
export { repositionedByConcatKey };