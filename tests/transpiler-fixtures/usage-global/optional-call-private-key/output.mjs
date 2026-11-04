import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// A private method called through an optional receiver retains its brand and this-value.
export class Box {
  #at() {
    return [2];
  }
  read(box) {
    return box?.#at?.().includes(2);
  }
  first(list) {
    return list[0].#at?.()?.[effect(), 'includes'](2);
  }
}