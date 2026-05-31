import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A minifier-collapsed sequence folds a `require('core-js/...')` entry into the head of a
// SequenceExpression with a trailing destructure. The split pre-pass must carry source position
// onto the surfaced statements so entry detection expands the require as a genuine entry; a
// loc-less split wrapper would read as sibling-plugin synthesis and skip it, leaving a raw
// require (the standalone, non-collapsed form expanded - a collapse-dependent inconsistency).
const obj = {
  a: 1
};
({
  a
} = obj);