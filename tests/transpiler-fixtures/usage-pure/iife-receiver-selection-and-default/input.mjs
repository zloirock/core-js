// An observed branching argument keeps its identity and native parameter reads.
export const effects = [];
export const r = (() => {
const pick = Math.random() < 2;
return (function ({ from } = Object) { void from; return arguments[0] === Array; })(pick && Array);
})();
