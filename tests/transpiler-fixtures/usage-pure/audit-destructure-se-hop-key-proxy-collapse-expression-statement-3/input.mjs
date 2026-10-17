let f = 0;
const { assign } = globalThis.self[(f++, 'window')].Object;
assign({}, { a: 1 });
