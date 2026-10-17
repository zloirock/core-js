// nested object-pattern destructure inside an array pattern: each inner binding must
// track its own indexed receiver for instance polyfill rewrites.
const [{ a }, { b }] = [{ a: "x" }, { b: [1] }];
a.at(0);
b.includes(1);
