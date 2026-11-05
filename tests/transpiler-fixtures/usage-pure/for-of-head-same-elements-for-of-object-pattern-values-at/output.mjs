import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A literal-object loop element keeps its native Object.values read.
// Its nested array at leaf still dispatches on the captured array receiver.
for (const _ref of [{
  w: Object,
  y: [1]
}]) {
  const {
    w: {
      values: viaDualBesideInstance
    }
  } = _ref;
  const viaInstanceBeside = _atMaybeArray(_ref.y);
  [viaDualBesideInstance, viaInstanceBeside];
}