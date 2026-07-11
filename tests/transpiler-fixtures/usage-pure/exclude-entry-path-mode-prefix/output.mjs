import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
[].at(0);
_includesMaybeArray(_ref = []).call(_ref, 1);
// an EXCLUDED entry behind an SE-computed key degrades whole: no extraction, no orphaned
// trailing pair - the destructure (and its key effect) stays native
let k = 0;
var {
    [(k++, 'at')]: viaKey
  } = [7],
  reader = viaKey;
console.log(typeof reader, k);