import _Array$from from "@core-js/pure/actual/array/from";
// A nested computed static key in a loop initializer follows its receiver capture.
// The key runs once before the method binding initializes; all declarations stay
// in the loop header, without lifting work across the surrounding loop.
for (const {
  x: {
    [(effectful(), 'from')]: f
  }
} = {
  x: {
    from: _Array$from
  }
}; cond;) use(f);