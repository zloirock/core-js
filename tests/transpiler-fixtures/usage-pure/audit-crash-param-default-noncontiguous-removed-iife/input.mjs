// param destructure-default with two removed props (`from`, `of`) separated by a RETAINED
// string-key sibling (`"z": z`). the retained prop breaks the run, so each removal takes its own
// clean trailing-comma range and the two never overlap (unlike the contiguous-run cases). IIFE
// form: caller-lossy emission is sound only with every call site visible (declared fn stays verbatim)
// the pattern SYNTHS its default instead: a caller-correct literal beats the lossy removal, and it
// does so whatever the call sites look like. what this shape locks is therefore that the geometry no
// longer reaches the removal path - the ranges themselves are exercised where a dynamic computed key
// makes the literal impossible
(function f({ from, "z": z, of } = Array) { return [from, of, z]; })();
