import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// A cast on a static write target preserves the unread-body gate.
// Dynamic writes intentionally exceed the initializer types; the wrappers erase at runtime.
function change(value) {
  value.data = '1020';
}
class Box {
  static data = [10, 20];
  static change() {}
}
(Box.change as any) = function () {
  change(this);
};
Box.change();
export const result = Box.data.includes('02');