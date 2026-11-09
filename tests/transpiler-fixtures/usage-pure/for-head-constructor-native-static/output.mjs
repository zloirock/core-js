import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A pattern assignment in a loop head keeps the constructor used by its body.
let P;
for ({
  Promise: P
} of [{
  Promise: _Promise
}]) (P === _Promise ? _Promise$allSettled : P.allSettled.bind(P))([]);