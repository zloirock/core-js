import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A user conditional is evaluated once even when its live name looks global.
export function read(self, test) {
  const _ref = test() ? void 0 : self;
  const at = _at(_ref);
  const includes = _includes(_ref);
  return [at, includes];
}