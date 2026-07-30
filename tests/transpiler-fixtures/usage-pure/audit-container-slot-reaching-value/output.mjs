import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _String$raw from "@core-js/pure/actual/string/raw";
// the pure flavor must stay UNTOUCHED by the container-slot reaching union: it is a
// usage-global-only over-inject axis, while pure keeps its bail (a write anywhere in the file
// may reach the read, so no slot read off a written container resolves). every destructure and
// member read below stays verbatim - only bare constructor NAMES resolve to pure imports
const cw = {
  k: Object
};
cw.k = _Map;
const {
  k: {
    groupBy: viaSlotWrite
  }
} = cw;

// the member-read spelling bails the same way
const cm = {
  s: Object
};
cm.s = Array;
export const viaMemberRead = cm.s.from([1]);

// a dynamic-key write may land on ANY slot - every slot read of the container bails
const cd = {
  d: Object
};
const dyn = 'd';
cd[dyn] = _Promise;
const {
  d: {
    withResolvers: viaDynamicKey
  }
} = cd;

// a logical assign is a write like any other for the bail
const cl = {
  q: Object
};
cl.q ||= _Promise;
const {
  q: {
    try: viaLogicalAssign
  }
} = cl;

// a repositioned array container bails every slot read via the wildcard
const rd = [{
  n: 1
}, Object];
rd.reverse();
const {
  0: {
    values: viaReposition
  }
} = rd;

// an arithmetic compound is still a write - the bail does not care about the value
const cc = {
  c: Object
};
cc.c += 1;
const {
  c: {
    keys: literalOnly
  }
} = cc;

// an escaped container bails via the wildcard too
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

// a write to a NESTED container bails the deep read as well
const inner = {
  g: Object
};
const host = {
  k: inner
};
inner.g = _Promise;
const {
  k: {
    g: {
      allSettled: viaNestedWrite
    }
  }
} = host;

// the FLAT destructure spelling over the written container member bails like the nested one
const cf = {
  k: Object
};
cf.k = _Promise;
const {
  any: viaFlatDestructure
} = cf.k;

// an OPTIONAL host spelling bails the same way once the slot is written
const cO = {
  k: Object
};
cO.k = _Promise;
const {
  race: viaOptionalHost
} = cO?.k;

// a written slot bails whatever the value resolves to
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

// an aliased written value changes nothing for the bail
const AliasA = Array;
const ca = {
  k: Object
};
ca.k = AliasA;
const {
  fromAsync: viaAliasValue
} = ca.k;

// a CLEAN container behind an SE prefix still extracts - the effect stays put
let seCount = 0;
const seFx = () => seCount++;
const cse = {
  k: String
};
seFx();
const viaSeInit = _String$raw;
export { viaSlotWrite, viaDynamicKey, viaLogicalAssign, viaReposition, literalOnly, escapedLiteralOnly, viaNestedWrite, viaFlatDestructure, viaOptionalHost, literalOnlyValue, viaAliasValue, viaSeInit };