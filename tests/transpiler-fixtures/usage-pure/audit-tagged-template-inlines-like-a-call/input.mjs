// The tag and its substitutions run before each static read on the returned constructor.
const effects = [];
const tag = () => { effects.push("first"); return Map; };
const a = tag`x`.groupBy([1], x => x).get(1);
const tag2 = (() => Array);
const b = tag2`y`.from([2]);
function pick(strings, value) { effects.push("pick"); return value; }
export const viaStatic = pick`${ (effects.push("argument"), Map) }`.groupBy([1], x => x);
export { a, b, effects };
