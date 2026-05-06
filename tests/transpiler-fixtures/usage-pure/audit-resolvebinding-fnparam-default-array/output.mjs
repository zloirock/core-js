import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// resolveBindingType: function param with default ([]) - AssignmentPattern wraps the
// Identifier param. findBindingAnnotation peels through `node.left?.typeAnnotation` for
// the AssignmentPattern shape. typeof guards on the binding never apply (binding is
// declared with explicit annotation `string[]`), so direct type-annotation branch wins.
// distinct methods so each line maps to its instance call
function step(items: string[] = []) {
  _findLastMaybeArray(items).call(items, s => s);
  _atMaybeArray(items).call(items, 0);
  _includesMaybeArray(items).call(items, 'z');
}
step(['a', 'b']);