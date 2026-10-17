import _at from "@core-js/pure/actual/instance/at";
// The discarded array element still runs before the nested property read.
function liftedHusk(eff, eff2) {
  const [_ref] = [{
    w: eff()
  }, eff2()];
  const liftedAt = _at(_ref.w);
  return liftedAt;
}
export default [liftedHusk(() => [1], () => 2)];