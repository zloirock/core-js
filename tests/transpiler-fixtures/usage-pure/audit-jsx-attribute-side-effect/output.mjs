import _Array$from from "@core-js/pure/actual/array/from";
<X y={fn()} />;
// `mayHaveSideEffects` extension for JSX: attribute values, expression containers in
// children, spread attributes / spread children all may carry side effects (the latter
// invoke iteration / Proxy traps unconditionally). pre-fix the SE walker returned
// `false` for all JSX nodes, so a leading `<X y={fn()} />` in a destructure init
// folded away during the SE-prefix lift, dropping `fn()` evaluation silently. post-fix
// the JSX is preserved in the lifted statement
var from = _Array$from;
from([1]);