import _at from "@core-js/pure/actual/instance/at";
// A member target keeps its setter after the instance read and a live default.
// The opaque receiver permits a claim; an own literal method is the refusal control.
export function read(receiver, target, fallback) {
  var _ref;
  target.method = (_ref = _at(receiver)) === void 0 ? fallback() : _ref;
}