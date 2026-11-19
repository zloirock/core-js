// The discarded array element still runs before the nested property read.
function liftedHusk(eff, eff2) {
  const [{ w: { at: liftedAt } }] = [{ w: eff() }, eff2()];
  return liftedAt;
}
export default [liftedHusk(() => [1], () => 2)];
