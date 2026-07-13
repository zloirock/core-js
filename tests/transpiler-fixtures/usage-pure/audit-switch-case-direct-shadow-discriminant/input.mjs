// a case-DIRECT lexical (`case 1: let globalThis = ...`, no block braces) is scoped by
// estree onto the whole switch INCLUDING the discriminant - a region the CaseBlock never
// covers at runtime (per spec the discriminant evaluates in the OUTER environment). the
// emitters' shadow guards must judge the DISCRIMINANT use position-aware: the substitution
// proceeds there (a raw hop read would throw off-engine), and only real in-cases uses shadow
let y1 = {};
switch (globalThis.self.Array.prototype.flat.call([1, [2]]).length) {
  case 1:
    let globalThis = y1;
    break;
}
export { y1 };

// the optional-call twin drives the guarded-combine emission through the same guard
let y2 = {};
switch ((globalThis).findLast?.([1, 2], v => v > 1)) {
  case 1:
    let globalThis = y2;
    break;
}
export { y2 };

// the TYPE channel reads the OUTER binding for the discriminant too: the case-local array
// must not narrow the outer string (a wrong type-specific dispatcher), nor drop to generic -
// the outer binding's own narrow survives
let s = "abc";
switch (s.includes("a")) {
  case true:
    let s = [1, 2, 3];
    break;
}
export { s };

// NESTED switches: the outer discriminant still reads the OUTER binding, while the inner
// discriminant sits INSIDE the outer case region and legitimately sees its case-direct
// lexical - the position-aware walk distinguishes the two regions
let n = "abc";
switch (n.at(0)) {
  case "a":
    let n = [9];
    switch (n.at(0)) {
      case 9:
        let n2 = 0;
        break;
    }
    break;
}
export { n };

// an ALIAS of the proxy-global buried in a sequence tail: the case-direct shadow of the
// alias name must not stop the alias-follow at the discriminant - the redundant proxy hop
// still collapses (a kept `.self` hop reads undefined off-engine). the emitters agree on
// dropping the hop; the alias root itself keeps its own name on the text emitter (its
// declaration is already rewritten), while babel folds the whole receiver - cosmetic
const g = globalThis;
let ya = {};
switch ((0, g.self).Array.prototype.findLastIndex) {
  case 1:
    let g = ya;
    break;
}
export { ya };
