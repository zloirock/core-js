// Reading a constructor through a container preserves its global claim.
// Escaping a nested value does not replace its parent slot.
// A fresh replacement removes the old realm candidate; its URL stays null.
const ns = { g: globalThis };
hand(ns.g.Map);
const nested = { a: { g: globalThis } };
hand(nested.a.g.Set);
const boxes = [{ g: globalThis }];
hand(boxes[0].g.WeakMap);
export function taken() {
  return ns.g.WeakSet;
}
// the escaped slot ITSELF: `handed.a.b` was passed out, so a static read through it stays raw
const handed = { a: { b: Object } };
hand(handed.a.b);
use(handed.a.b.groupBy([], item => item));
// the replaced slot: the literal no longer says what `rep.g` holds
const rep = { g: globalThis };
rep.g = { URL: null };
hand(rep.g.URL);
