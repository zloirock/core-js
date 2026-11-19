// A retained native default keeps its binding name and owned comment before lowering.
let method;
({ slot: { at: method = /* default body */ () => Array.from([4, 9]).at(-1) } } = { slot: {} });
