// object-pattern at the top of an array-pattern destructure: the inner pattern keys
// still produce their own pure-mode polyfill rewrites.
const [{ a }] = [{ a: "hello" }];
a.at(-1);
