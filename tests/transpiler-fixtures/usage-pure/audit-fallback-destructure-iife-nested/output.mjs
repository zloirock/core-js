import _at from "@core-js/pure/actual/instance/at";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
var _ref;
// pure-version of nested IIFE: `(() => (() => cond ? Array : Iterator)())()`. exercises
// the loop-to-stable peel design through both wrapper layers. same fallback emission
// semantics as the single-IIFE arrow-conditional case -- runtime branch is unknown,
// destructure stays inline, downstream call falls to generic dispatch.
const {
  from
} = (() => (() => cond ? Array : _Iterator)())();
_at(_ref = from([1, 2])).call(_ref, 0);