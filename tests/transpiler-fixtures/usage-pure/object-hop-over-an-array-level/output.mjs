import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An array level under an object key retains native iteration and static reads.
// Call and tag effects run where their source elements are constructed.
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