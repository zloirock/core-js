import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
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