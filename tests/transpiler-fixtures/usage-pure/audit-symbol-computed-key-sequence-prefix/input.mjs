// Symbol[(fn(), 'iterator')] computed-key SE prefix - polyfill rewrite was dropping the
// fn() side effect because computed-symbol-key resolve resolved the key statically but
// never surfaced peeled SE prefixes through meta.sideEffects
let calls = 0;
const it = [1, 2, 3][Symbol[(calls++, 'iterator')]]();
it.next();
