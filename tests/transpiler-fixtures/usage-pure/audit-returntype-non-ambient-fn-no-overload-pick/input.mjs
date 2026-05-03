// pickLastAmbientOverload bails when binding is not ambient (FunctionDeclaration,
// not TSDeclareFunction). non-ambient functions can't have overload heads at the
// runtime layer (only one body), so retargeting would do nothing useful. helper
// returns the resolved binding unchanged. Receiver type is number[] from the body.
function build(): number[] {
  return [1, 2, 3];
}
const r: ReturnType<typeof build> = build();
r.at(0);
