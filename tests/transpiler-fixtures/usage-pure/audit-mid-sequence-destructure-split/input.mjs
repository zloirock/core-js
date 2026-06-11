// a destructure assignment in ANY slot of a statement-position SequenceExpression is
// split into per-expression statements by the shared minifier-shape pre-pass (statement
// context discards every slot's value, so the split is sound at any position) - the
// emitter then polyfills the standalone statement. the TAIL-only rule once left the
// mid-sequence form native (`from` undefined on engines missing the static)
let from;
(({ from } = Array), use());
export const r1 = from([3]).at(0);
let of2;
(pre(), ({ of: of2 } = Array), post());
export const r2 = of2(4).at(0);
// rest sibling: the consumed key renames to the sentinel, rest exclusion preserved
let keys, rest;
(({ keys, ...rest } = Object), use(rest));
// a destructure buried in a NESTED sequence slot splits too (fixpoint over the products)
let entries2;
((x(), ({ entries: entries2 } = Object)), use());
export const r3 = entries2({ b: 2 }).at(0);
// every statement-list host splits, including a switch-case consequent
let groupBy2;
switch (cond) {
  case 1:
    (({ groupBy: groupBy2 } = Map), use());
    break;
}
export const r4 = groupBy2;
// class static blocks are statement-list hosts too
class K {
  static {
    let try2;
    (({ try: try2 } = Promise), use());
    K.r = try2;
  }
}
export { K };
// a VALUE-position sequence is NOT split - its result is consumed, both stay native
export const v = (({ from } = Array), from([5]));
