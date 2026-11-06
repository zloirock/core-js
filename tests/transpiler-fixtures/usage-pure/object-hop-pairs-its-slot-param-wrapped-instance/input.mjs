// ... and an ARRAY wrapper on the way is one more hop of the same descent
function paramWrappedInstance([{ w: { at: viaWrappedInstance } }] = [{ w: [1, 2] }]) {
  return viaWrappedInstance;
}
export default [paramWrappedInstance()];
