// inline-call binding alias with observable side-effect prefix: replacement of the
// static method must preserve the call (k() runs) by wrapping the polyfill binding in
// a SequenceExpression. distinct static methods per line: Promise.resolve / Array.from
let calls = 0;
const k = () => { calls++; return Promise; };
const m = () => { calls++; return Array; };
const a = k().resolve(3);
const b = m().from('hi');
