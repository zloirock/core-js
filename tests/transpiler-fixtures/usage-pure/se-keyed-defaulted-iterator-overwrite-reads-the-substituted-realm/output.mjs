import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref, _ref2;
// An SE-keyed defaulted iterator claim off a realm root keeps the destructure whole and re-binds the
// helper's result after it: that overwrite reads the receiver again, spelled as the rest of the output
// spells it - the substituted realm binding, never the raw global a target may lack.
let it, values;
({
  [(eff(), _Symbol$iterator)]: it = 1
} = _globalThis);
it = (_ref = _getIteratorMethod(_globalThis)) === void 0 ? it : _ref;
({
  [(eff(), _Symbol$iterator)]: values = 2
} = _self);
values = (_ref2 = _getIteratorMethod(_self)) === void 0 ? values : _ref2;