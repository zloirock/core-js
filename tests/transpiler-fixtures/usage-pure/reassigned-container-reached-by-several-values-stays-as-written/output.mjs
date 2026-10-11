import _entries from "@core-js/pure/actual/instance/entries";
import _Promise from "@core-js/pure/actual/promise";
// a reassigned container read that more than one value may reach - a conditional, a branching, an ambiguous
// pattern, a logical or a for-in write, one in a closure - names no value in pure: a static stays as
// written and a key an instance carries too takes the generic instance dispatch; a `||=` over a `null`
// init bails too, since only a binding still unset proves the store
let rw3 = {
  c: Object
};
if (flag) rw3 = {
  c: _Promise
};
const _ref = rw3.c,
  {
    try: viaConditionalWrite
  } = _ref,
  viaLiveInit = _entries(_ref);
let wBr = {
  b: Object
};
wBr = flag ? {
  b: Number
} : {
  b: Object
};
const {
  b: {
    isSafeInteger: viaBranchingWrite
  }
} = wBr;
let wAd = {
  d: Object
};
({
  0: wAd = {
    d: Number
  }
} = [{
  d: Object
}]);
const {
  d: {
    parseFloat: viaAmbiguousDefault
  }
} = wAd;
let wLg = null;
wLg ||= {
  l: Object
};
const {
  l: {
    hasOwn: viaLogicalBinding
  }
} = wLg;
let wAn = {
  i: Object
};
wAn &&= {
  i: Number
};
const {
  i: {
    parseInt: viaAndBinding,
    isExtensible: viaAndInit
  }
} = wAn;
let wFi = {
  f: Object
};
for (wFi in {
  a: 1
}) void 0;
const {
  f: {
    getOwnPropertyDescriptors: viaForInLiteralOnly
  }
} = wFi;
let wCl = {
  c: Object
};
export const setIt = () => {
  wCl = {
    c: Number
  };
};
const {
  c: {
    isNaN: viaClosureWrite
  }
} = wCl;
export { viaConditionalWrite, viaLiveInit, viaBranchingWrite, viaAmbiguousDefault, viaLogicalBinding, viaAndBinding, viaAndInit, viaForInLiteralOnly, viaClosureWrite };