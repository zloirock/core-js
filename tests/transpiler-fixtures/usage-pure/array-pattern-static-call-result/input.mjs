// Array patterns preserve a selected static method's known result type.
// The source prefix runs before binding, and repeated loop elements select the same static.
const [{ from: make }] = (effect(), [Array]);
export const first = make([1]).at(0);
let keys;
([{ keys }] = [Object]);
export const second = keys({ a: 1 }).includes('a');
for (const [{ of: wrap }] of [[Array], [Array]]) consume(wrap(2).map(value => value + 1));
