import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Arrow body with a `'use strict'` directive AND a side-effecting `calls++` before
// `return Promise`: `factory().resolve(1)` keeps the directive, runs the increment, and
// the static `.resolve` is replaced through a SequenceExpression so all side effects fire.
let calls = 0;
const factory = () => { 'use strict'; calls++; return _Promise; };
const out = (factory(), _Promise$resolve)(1);
export { calls, out };