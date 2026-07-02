// positive control: inside the block where `let Map = ...` declares the shadow, the
// polyfill MUST NOT fire (`Map.from` reads the local). Verifies the position-aware
// lookup correctly returns the binding for use-sites inside its block.
@(function () {
  if (Math.random() > 0.5) {
    let Map = { from: () => [] };
    return Map.from([1]);
  }
  return null;
})
class C {}
[C];
