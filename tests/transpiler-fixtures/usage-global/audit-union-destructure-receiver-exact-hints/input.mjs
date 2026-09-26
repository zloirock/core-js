// a destructured instance method off a cross-family union receiver shares the member
// path's exact hint-set derivation: only the union's variants inject
// (es.array.includes + es.string.includes), not the Iterator group
declare const r: number[] | string;
const { includes } = r;
includes.call(r, 'x');
