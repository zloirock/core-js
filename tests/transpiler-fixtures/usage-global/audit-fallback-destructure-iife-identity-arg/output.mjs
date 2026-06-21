import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// identity IIFE: `(arg => arg)(Array)` is a pass-through wrapper that returns its argument
// verbatim. the identity pattern (body is an Identifier matching a param) must lift the
// corresponding arg as the inline value, so `Result` resolves to `Array`, `from` becomes
// `Array.from`, and `es.array.from` emits. complements the zero-arg IIFE case by handling
// factory wrappers that thread their argument through.
const Result = (arg => arg)(Array);
const {
  from
} = Result;
from([1, 2]);