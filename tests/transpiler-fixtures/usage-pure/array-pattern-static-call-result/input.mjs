// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const [{ from: make }] = (effect(), [Array]);
export const first = make([1]).at(0);
let keys;
([{ keys }] = [Object]);
export const second = keys({ a: 1 }).includes('a');
for (const [{ of: wrap }] of [[Array], [Array]]) consume(wrap(2).map(value => value + 1));
