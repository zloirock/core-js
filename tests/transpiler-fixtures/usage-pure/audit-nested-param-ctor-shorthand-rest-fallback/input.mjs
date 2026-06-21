// a top-level REST makes the nested mirror BAIL structurally (the rest collects the receiver's OTHER keys,
// which a synth literal cannot enumerate). a mixed nested + flat-ctor + rest pattern therefore falls back
// to the established inline-default / body-extract path on BOTH emitters - the unplugin must NOT defer the
// flat key to the (bailed) mirror here, or it would strand the key native where babel body-extracts it
function withRest({ Array: { from }, Set, ...rest } = globalThis) {
  return [from, Set, rest];
}
withRest();
