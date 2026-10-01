// pure-version of nested IIFE: `(() => (() => cond ? Array : Iterator)())()`. exercises
// the loop-to-stable peel design through both wrapper layers. same fallback emission
// semantics as the single-IIFE arrow-conditional case -- runtime branch is unknown,
// destructure stays inline, downstream call falls to generic dispatch.
const { from } = (() => (() => cond ? Array : Iterator)())();
from([1, 2]).at(0);
