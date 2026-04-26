import _Map from "@core-js/pure/actual/map/constructor";
// 3-level nesting: function -> nested-block -> enum. ancestor-walk via TS_RUNTIME_SCOPE_ANCHOR
// types must reach the BlockStatement anchor through both function body and inner block.
// outer scope (no shadow) - polyfill must fire there as the global rule
export function outer() {
  if (Math.random() < 0.5) {
    enum Map { A = 1 }
    return new Map();
  }
  return null;
}

export const fromOuter = new _Map();