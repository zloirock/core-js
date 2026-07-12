import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$entries from "@core-js/pure/actual/object/entries";
// an IIFE call-arg shadowed by a same-named inner param still synths: the argument
// evaluates at the CALL SITE, so its statics resolve in the outer scope - the synth
// literal replaces the arg exactly like the unshadowed form
!function ({
  from
}, Array) {
  use(from);
}({
  from: _Array$from
});
!function ({
  of
} = _Map, Array) {
  use(of);
}({
  of: _Array$of
});
// an SE-wrapped arg: the synth literal replaces only the sequence TAIL, the effect stays
!function ({
  entries
}, Object) {
  use(entries);
}((eff(), {
  entries: _Object$entries
}));