import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// extractions of a multi-declarator host stay AT THEIR SOURCE SLOT relative to sibling
// declarators (pre-sibling effects run first, post-sibling after), for full and partial
// consume alike; the surviving declaration splits statement-per-declarator
const a = effA();
const groupBy = _Map$groupBy;
const b = effB();
const c = effC();
const tryFn = _Promise$try;
const {
  customP
} = _Promise;
console.log(a, groupBy, b, c, tryFn, customP);