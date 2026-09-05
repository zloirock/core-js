import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// a top-level REST makes the nested mirror BAIL structurally (the rest collects the receiver's OTHER keys,
// which a synth literal cannot enumerate). a mixed nested + flat-ctor + rest pattern therefore falls back
// to the established inline-default / body-extract path on BOTH emitters - the unplugin must NOT defer the
// flat key to the (bailed) mirror here, or it would strand the key native where babel body-extracts it
function withRest({
  Array: {
    from = _Array$from
  },
  Set: _unused,
  ...rest
} = _globalThis) {
  let Set = _Set;
  return [from, Set, rest];
}
withRest();