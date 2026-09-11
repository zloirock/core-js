// a nested closure writes the outer param (`arg = X`) but is only CREATED here, never invoked, so
// at runtime `Result === Array` - the peel must RESOLVE (substitute the pure import), not bail.
// bailing would leave native `Array.from`, absent off-engine. the scan descends into every nested
// scope that could RUN (IIFE / `.call` / callback / iteration), but a discarded function statement
// like this one provably does not run, so its write is not a rebind
const Result = (arg => {
  () => arg = 'never-runs';
  return arg;
})(Array);
const { from } = Result;
from([1, 2]);
