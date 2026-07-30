import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// the REACHING VALUE of a written container slot injects its own statics in the global flavor:
// the census records what each write installs, and the receiver walk unions those candidates
// beside the literal's (over-inject-safe - all imports are side-effect-only). every cell here
// picks a method its literal candidate does NOT have, so each import can only come from the
// reaching union - a file-level duplicate would make the cell vacuous
const cw = {
  k: Object
};
cw.k = Map;
const {
  k: {
    groupBy: viaSlotWrite
  }
} = cw;

// the member-read spelling reaches the same written value
const cm = {
  s: Object
};
cm.s = Array;
export const viaMemberRead = cm.s.from([1]);

// a dynamic-key write may land on ANY slot, so its value reaches every slot read
const cd = {
  d: Object
};
const dyn = 'd';
cd[dyn] = Promise;
const {
  d: {
    withResolvers: viaDynamicKey
  }
} = cd;

// a logical assign installs its right operand only sometimes - still reachable
const cl = {
  q: Object
};
cl.q ||= Promise;
const {
  q: {
    try: viaLogicalAssign
  }
} = cl;

// a repositioned array container may hold any literal element at any slot - the destructure
// read unions the elements exactly like the member spelling does
const rd = [{
  n: 1
}, Object];
rd.reverse();
const {
  0: {
    values: viaReposition
  }
} = rd;

// NEGATIVE: an arithmetic compound derives its value - no reaching candidate beside the literal's
const cc = {
  c: Object
};
cc.c += 1;
const {
  c: {
    keys: literalOnly
  }
} = cc;

// NEGATIVE: an escaped container records no written values - only the literal candidate injects
const ce = {
  e: Object
};
export function sink(x) {
  return x;
}
sink(ce);
const {
  e: {
    entries: escapedLiteralOnly
  }
} = ce;

// a written value reached through a NESTED container descends the remaining path too
const inner = {
  g: Object
};
const host = {
  k: inner
};
inner.g = Promise;
const {
  k: {
    g: {
      allSettled: viaNestedWrite
    }
  }
} = host;

// the FLAT destructure spelling over the container member reaches the written value the same way
const cf = {
  k: Object
};
cf.k = Promise;
const {
  any: viaFlatDestructure
} = cf.k;

// an OPTIONAL host spelling reads the same slot - the walk sees through the `?.`
const cO = {
  k: Object
};
cO.k = Promise;
const {
  race: viaOptionalHost
} = cO?.k;

// NEGATIVE: a written value that resolves to no constructor contributes nothing beside the literal
const localX = {
  assign: 1
};
const cnc = {
  k: Object
};
cnc.k = localX;
const {
  assign: literalOnlyValue
} = cnc.k;

// a written value reached through a const ALIAS dereferences like any walk hop
const AliasA = Array;
const ca = {
  k: Object
};
ca.k = AliasA;
const {
  fromAsync: viaAliasValue
} = ca.k;

// an SE-prefixed init reaches the container member behind the sequence - the effect stays put
let seCount = 0;
const seFx = () => seCount++;
const cse = {
  k: String
};
const {
  raw: viaSeInit
} = (seFx(), cse.k);
export { viaSlotWrite, viaDynamicKey, viaLogicalAssign, viaReposition, literalOnly, escapedLiteralOnly, viaNestedWrite, viaFlatDestructure, viaOptionalHost, literalOnlyValue, viaAliasValue, viaSeInit };