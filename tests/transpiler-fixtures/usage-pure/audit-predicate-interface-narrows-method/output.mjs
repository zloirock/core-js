import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// a method member of the target resolves its call return
interface M {
  make(): string;
}
function isM(o: unknown): o is M {
  return true;
}
function gm(v: unknown) {
  if (isM(v)) {
    var _ref, _ref2;
    _atMaybeString(_ref = v.make()).call(_ref, 0);
    _padStartMaybeString(_ref2 = v.make()).call(_ref2, 2);
  }
}