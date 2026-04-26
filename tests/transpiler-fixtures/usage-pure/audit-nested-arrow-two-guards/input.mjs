// nested arrow functions each requiring their own polyfill guard: the inner guard
// must be independent of the outer one.
const f = x => fn()?.at(0);
const g = y => fn2()?.at(1);
