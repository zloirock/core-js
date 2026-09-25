// a CALL spelled inside a container-literal default (`= { B: f() }`, `= [f()]`) runs only where the
// default fires, and the static read through its value is mirrored beside it; the census keeps the
// constructor family for the value the call returns, so it is not narrowed to an entry that lacks it
function f() { log(); return Map; }
function g() { log(); return Promise; }
function h(o) {
  const { A: { B: { groupBy: s } } = { B: f() } } = o;
  const { P: [{ try: t }] = [g()] } = o;
  return [s, t];
}
use(h);
