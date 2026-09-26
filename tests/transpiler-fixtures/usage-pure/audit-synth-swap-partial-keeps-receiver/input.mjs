// destructured IIFE with one polyfillable key (`resolve`) and one non-polyfillable
// (`custom` - user extension on Promise with no pure variant). the rewritten shape must
// still reference the receiver's native property (`R.custom`) for the non-polyfillable
// entry, so the receiver's pure import (`_Promise`) stays injected
(({ resolve, custom }) => [resolve, custom])(Promise);
