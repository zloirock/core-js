import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a `var name = X` re-declaration writes X exactly as `name = X` would, so the value channels read
// it: the last declaration reaches the use and its init decides the static - the computed key and
// the receiver alike. a re-declaration inside a NESTED block reaches the use through the positional
// redeclaration walk, which reads its init in the declarator's own scope. one global per row, so a
// row that stops flowing its init loses its own module. the receiver row binds the ponyfill outright:
// the last declaration is the ONE value the read observes, so no runtime ctor guard is owed
export function keyed() {
  var K = 'from';
  var K = 'of';
  return _Array$of(1, 2);
}
export function receiver(list, fn) {
  var C = Object;
  var C = _Map;
  return _Map$groupBy(list, fn);
}
export function nested(list) {
  var N = 'entries';
  {
    var N = 'fromEntries';
  }
  return _Object$fromEntries(list);
}