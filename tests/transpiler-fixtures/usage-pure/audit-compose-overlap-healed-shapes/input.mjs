// historical compose-overlap crash shapes, locked at their healed emissions: a non-poly
// call hop between a non-poly optional inner and a poly outer; a `?.` inside a computed-key
// string literal (the needle deopt is position-aware); an optional MEMBER read over a
// static through `super`
export const r1 = a?.b.c().at(0);
export const r2 = obj?.['a?.b'].includes(z);
class C extends Array {
  m() { return super.of?.name; }
}
export const c = new C();
