import _at from "@core-js/pure/actual/instance/at";
// An optional member read evaluates its receiver before a folded effectful key.
// Its generic instance lookup must stay polyfilled without calling the method here.
export function read(input, replacement) {
  var _ref;
  let arr = input;
  const method = null == (_ref = arr) ? void 0 : ((() => (arr = replacement, 'at'))(), _at(_ref));
  return method?.call(input, 0);
}