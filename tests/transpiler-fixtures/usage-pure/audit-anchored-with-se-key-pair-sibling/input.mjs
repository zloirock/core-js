// An anchored sibling may split the declaration while a computed-key extraction captures
// its receiver before the key effect. The target remains in TDZ until its binding completes.
const { Map: { custom } } = globalThis, { [(eff(), 'at')]: a } = arr;
console.log(custom, a);
