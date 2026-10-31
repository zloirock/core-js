// Retained shorthand defaults keep their key, right-side and nested body comments.
// A supplied undefined method still executes the original default.
function read({
  at /* method key */ = /* source default */ (() => {
    /* default body */ return () => 7;
  })(),
} = [1]) {
  return at.call([9], 0);
}

export const r = [read(), read({ at: undefined })];
