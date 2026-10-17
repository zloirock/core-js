import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A discriminant narrow on the root object (`if (b.tag === "arr")`) is invalidated by two write channels
// the write-collection scan must catch: a direct write to the discriminant field between guard and use
// (`b.tag = "str"` flips the variant - the single-segment-root scan now covers it), and a write inside a
// captured function that may run before the use (`run(() => { b.tag = "str"; })` - the write-host path is
// threaded so the captured-function check can walk it). Either drops the narrow to generic; with no write
// the narrow stands (`_atMaybeArray`)
interface BoxArr {
  tag: "arr";
  val: string[];
}
interface BoxStr {
  tag: "str";
  val: string;
}
type Box = BoxArr | BoxStr;
declare function run(f: () => void): void;
function a(b: Box) {
  if (b.tag === "arr") {
    var _ref;
    return _atMaybeArray(_ref = b.val).call(_ref, 0);
  }
}
function c(b: Box) {
  if (b.tag === "arr") {
    var _ref2;
    b.tag = "str";
    return _includes(_ref2 = b.val).call(_ref2, "x");
  }
}
function d(b: Box) {
  if (b.tag === "arr") {
    var _ref3;
    run(() => {
      b.tag = "str";
    });
    return _at(_ref3 = b.val).call(_ref3, 0);
  }
}
export { a, c, d };