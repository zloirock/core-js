// An immediate nested closure replaces the parameter before the returned value is read.
// The result is not the original Array argument, and that discarded argument needs no statics.
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