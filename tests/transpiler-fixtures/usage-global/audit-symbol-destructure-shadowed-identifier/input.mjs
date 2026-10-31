// usage-global twin: the outer genuine Symbol destructure injects its module, the SHADOWED
// inner one contributes nothing extra and the source stays untouched
const { iterator } = Symbol;
export const outer = [][iterator];
function pickShadowed() {
  const Symbol = { iterator: 3 };
  const { iterator } = Symbol;
  return [4][iterator];
}
export const inner = pickShadowed();
