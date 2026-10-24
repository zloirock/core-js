// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
function f() { log(); return Map; }
function g() { log(); return Promise; }
function h(o) {
  const { A: { B: { groupBy: s } } = { B: f() } } = o;
  const { P: [{ try: t }] = [g()] } = o;
  return [s, t];
}
use(h);
