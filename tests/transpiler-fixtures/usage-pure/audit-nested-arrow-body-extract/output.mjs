// Nested arrow with no IIFE: outer arrow takes `{from}` but is never called inline.
// Body-extract should hit the outer arrow's body block (innermost owner of the param);
// the inner arrow body is unrelated and shouldn't receive the prepend
const make = ({
  from
}) => () => from([1, 2]);
make(Array)();