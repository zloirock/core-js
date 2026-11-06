// Calls inside literal-container defaults run only when those defaults fire.
// Native static reads require full Map and Promise entries for the returned constructors.
function f() { log(); return Map; }
function g() { log(); return Promise; }
function h(o) {
  const { A: { B: { groupBy: s } } = { B: f() } } = o;
  const { P: [{ try: t }] = [g()] } = o;
  return [s, t];
}
use(h);
