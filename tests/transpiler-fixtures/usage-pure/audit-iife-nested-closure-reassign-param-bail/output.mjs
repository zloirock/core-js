// an immediately-invoked nested closure reassigns the outer param before `return arg`
// (`(() => { arg = 1; })()` runs at once - unlike a stored closure that may never run), so
// the IIFE-identity peel must NOT lift the call arg: runtime returns the reassigned value,
// not `Array`, and substituting `_Array$from` would over-resolve a native TypeError
const Result = (arg => {
  (() => {
    arg = 1;
  })();
  return arg;
})(Array);
const {
  from
} = Result;
from([1, 2]);