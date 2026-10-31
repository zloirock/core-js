import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Each key is read independently from one receiver, even if a getter rebinds its source.
export function read(make) {
  let receiver = make(() => {
    receiver = replacement();
  });
  const _ref = receiver;
  const at = _at(_ref);
  const includes = _includes(_ref);
  return [at, includes];
}