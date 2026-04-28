// `mayHaveSideEffects` covers JSX evaluation: attribute values, expression containers
// in children, spread attributes / spread children may all carry side effects (spreads
// invoke iteration / Proxy traps unconditionally). A leading `<X y={fn()} />` in a
// destructure init is SE-bearing and stays in the lifted statement so `fn()` is
// preserved at the call site
var { from } = (<X y={fn()} />, Array);
from([1]);
