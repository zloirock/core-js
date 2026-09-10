// an async IIFE suspends at its first `await`: the read after it runs once the array write below
// has happened, so the string init proves nothing and both families inject
let O = 'str';
export const p = (async () => { await 0; return O.at(0); })();
O = [1, 2];
