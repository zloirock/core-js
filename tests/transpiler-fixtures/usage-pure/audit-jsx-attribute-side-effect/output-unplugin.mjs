import _Array$from from "@core-js/pure/actual/array/from";
// `mayHaveSideEffects` covers JSX evaluation: attribute values, expression containers
// in children, spread attributes / spread children may all carry side effects (spreads
// invoke iteration / Proxy traps unconditionally). A leading `<X y={fn()} />` in a
// destructure init is SE-bearing and stays in the lifted statement so `fn()` is
// preserved at the call site
(<X y={fn()} />, Array);
var from = _Array$from;
from([1]);