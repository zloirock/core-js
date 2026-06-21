// param destructure-default with two removed props (`from`, `of`) separated by a RETAINED
// string-key sibling (`"z": z`). the retained prop breaks the run, so each removal takes its own
// clean trailing-comma range and the two never overlap (unlike the contiguous-run cases). IIFE
// form: caller-lossy emission is sound only with every call site visible (declared fn stays verbatim)
(function f({ from, "z": z, of } = Array) { return [from, of, z]; })();
