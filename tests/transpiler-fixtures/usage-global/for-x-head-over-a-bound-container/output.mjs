import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A head whose LEFT is a pattern unpacks the element it binds, and unpacking is a read: it re-homes
// what its own leaves bind, exactly as the declarator twin does. Filing it as an escape instead
// marked every container slot the element NAMES as written, and the pure receiver walk then declined
// the very literal the twin resolves through - so a container reached by BINDING lost the polyfill
// in the head while the same container written in place kept it.
const out = [];
const W = {
  w: Array
};
const WA = [Array];
const WN = {
  a: {
    b: Array
  }
};
for (const {
  from
} of [W.w]) out.push(typeof from);
for (const {
  from
} of [WA[0]]) out.push(typeof from);
for (const {
  from
} of [WN.a.b]) out.push(typeof from);
for (const {
  w: {
    from
  }
} of [W]) out.push(typeof from);
// NEGATIVE: a slot the source WRITES holds whatever was written, so the walk owes the live read
const written = {
  w: Array
};
written.w = Map;
for (const {
  from
} of [written.w]) out.push(typeof from);
// a write through the head's own binding lands AFTER the iterable was read: a head reads its source
// once per ENTRY, so the literal the element spells is what every pass of that entry binds
const throughHead = {
  w: Array
};
for (const {
  from
} of [throughHead.w]) {
  throughHead.w = Map;
  out.push(typeof from);
}
// NEGATIVE: ... and that same write does reach the read once an OUTER loop RE-ENTERS the head,
// which evaluates the iterable again, against the slot the previous entry replaced
const reentered = {
  w: Array
};
for (let round = 0; round < 2; round += 1) {
  for (const {
    from
  } of [reentered.w]) {
    reentered.w = Map;
    out.push(typeof from);
  }
}
// NEGATIVE: the container's slot is read by a GETTER, so the read is the effect and no literal
// stands in for it; an effectful key is the same refusal spelled on the other side
const observed = {
  get w() {
    out.push('got');
    return Array;
  }
};
for (const {
  from
} of [observed.w]) out.push(typeof from);
export { out };