import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Math$log10 from "@core-js/pure/actual/math/log10";
import _Math$log2 from "@core-js/pure/actual/math/log2";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// an ARRAY PATTERN under an object KEY: the wrapper indexes the level the key reached, so the hops
// descend in the order the runtime reads them, under every host - a declarator, one beside a sibling
// element, an assignment, a for-of head and its assignment form, a parameter default. one static per row
const held = {
  k: [Math]
};
const {
  k: [{
    trunc: viaAlias
  }]
} = {
  k: [{
    trunc: _Math$trunc
  }]
};
use(viaAlias(1.5));
const viaSibling = _Math$sign;
const {
  k: [{
    sign: _unused
  }, beside]
} = held;
use(viaSibling(-1), beside);
let viaAssign;
({
  k: [{
    cbrt: viaAssign
  }]
} = {
  k: [{
    cbrt: _Math$cbrt
  }]
});
use(viaAssign(8));
for (const {
  k: [{
    log10: viaHead
  }]
} of [{
  k: [{
    log10: _Math$log10
  }]
}]) use(viaHead(100));
let viaHeadAssign;
for ({
  k: [{
    log2: viaHeadAssign
  }]
} of [{
  k: [{
    log2: _Math$log2
  }]
}]) use(viaHeadAssign(8));
function viaDefault({
  k: [{
    hypot
  }]
} = {
  k: [{
    hypot: _Math$hypot
  }]
}) {
  return hypot(3, 4);
}
use(viaDefault());