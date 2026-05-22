// Static method called on the result of a side-effecting arrow (`k().resolve(3)`,
// `m().from('hi')`): the polyfill replacement wraps each binding in a SequenceExpression
// so the arrow still runs (`calls++` observed). Distinct statics per line.
let calls = 0;
const k = () => { calls++; return Promise; };
const m = () => { calls++; return Array; };
const a = k().resolve(3);
const b = m().from('hi');
