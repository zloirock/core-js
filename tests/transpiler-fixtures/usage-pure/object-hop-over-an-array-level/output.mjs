import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const log = [];
const mk = () => {
  _pushMaybeArray(log).call(log, 'mk');
  return Array;
};
function tag() {
  _pushMaybeArray(log).call(log, 'tag');
  return Array;
}
const {
  c: [{
    of: viaCall,
    from: alsoViaCall
  }]
} = {
  c: [mk()]
};
const {
  c: [{
    of: viaTag
  }]
} = {
  c: [tag`x`]
};
const {
  c: [{
    from: viaBare
  }]
} = {
  c: [Array]
};
const {
  a: {
    c: [{
      of: twoHops
    }]
  }
} = {
  a: {
    c: [mk()]
  }
};
export { viaCall, alsoViaCall, viaTag, viaBare, twoHops, log };