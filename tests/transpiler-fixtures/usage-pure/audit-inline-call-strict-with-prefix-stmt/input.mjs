// directive + non-directive prefix: `'use strict'; calls++; return Promise;`. directive
// filtered out before counting, leaves `calls++; return Promise;` (length 2, NOT single
// return) - SE-wrap fires correctly because `calls++` IS observable. emit:
// `(factory(), _Promise$resolve)(1)` preserves the increment runtime
let calls = 0;
const factory = () => { 'use strict'; calls++; return Promise; };
const out = factory().resolve(1);
export { calls, out };
