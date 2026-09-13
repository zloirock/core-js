import _Array$from from "@core-js/pure/actual/array/from";
// A named parameter consumes a receiver inside an array and an object wrapper. The supplied
// static gets a polyfill at that source slot; a custom slot is never replaced by the first caller.
// The wrappers do not expose Array itself or require its other statics.
function read({
  slot: [{
    from
  }]
}) {
  return from;
}
read({
  slot: [{
    from: _Array$from
  }]
})([1, 2]);
read({
  slot: [{
    from: value => value
  }]
})(3);
read({
  slot: [{}]
});