// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
function siblingKeepsResidual(hit) {
  const { w: { Array: { prototype: { at: deepBeside } } }, z: sibZ } = { w: globalThis, z: (hit(), 1) };
  const { w: { Array: { prototype: { at: deepAlone } } } } = { w: globalThis, z: (hit(), 2) };
  const { w: { [Symbol.iterator]: symBeside }, y: sibY } = { w: globalThis, y: (hit(), 3) };
  return [deepBeside, sibZ, deepAlone, symBeside, sibY];
}
export default [siblingKeepsResidual(() => 0)];
