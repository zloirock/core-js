// A receiver literal contains a function whose body itself needs a polyfill.
// The literal is evaluated once, its computed key effect precedes extraction,
// and the nested function body keeps its polyfilled instance call.
let log = 0;
const { [(log++, 'includes')]: n } = [() => [3, 4].flat()];
export const out = [n, log];
