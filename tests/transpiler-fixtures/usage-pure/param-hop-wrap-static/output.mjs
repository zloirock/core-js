import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a STATIC leaf under a parameter pattern mirrors into the slot its hops pair with, an ARRAY level
// anywhere on the way included (the pattern under an array level is the element's own): the IIFE
// argument or the parameter's default, under an object hop, shifted, doubled, a hop below the level.
// every hop branch of one host mirrors its own slot, and a symbol leaf takes the same route on both
// legs. one static per row
const viaIifeHopWrap = (({
  w: [{
    hasOwn: h1
  }]
}) => h1)({
  w: [Object]
});
function viaDefaultHopWrap({
  w: [{
    is: i1
  }]
} = {
  w: [Object]
}) {
  return i1;
}
const viaShifted = (({
  w: [, {
    keys: k1
  }]
}) => k1)({
  w: [0, Object]
});
const viaDouble = (({
  w: [[{
    values: v1
  }]]
}) => v1)({
  w: [[Object]]
});
const viaHopBelow = (({
  w: [{
    x: {
      entries: e1
    }
  }]
}) => e1)({
  w: [{
    x: Object
  }]
});
const viaTwoBranches = (({
  a: {
    fromEntries: f1
  },
  b: {
    groupBy: g1
  }
}) => [f1, g1])({
  a: Object,
  b: Object
});
const viaTwoSlots = (({
  w: [{
    assign: a1
  }, {
    freeze: z1
  }]
}) => [a1, z1])({
  w: [Object, Object]
});
const viaTwoWraps = (({
  a: [{
    seal: s1
  }],
  b: [{
    isFrozen: r1
  }]
}) => [s1, r1])({
  a: [Object],
  b: [Object]
});
const viaSymbolWrap = (([{
  [_Symbol$iterator]: it1
}]) => it1)([{
  [_Symbol$iterator]: _getIteratorMethod([1])
}]);
const viaSymbolHop = (({
  w: {
    [_Symbol$iterator]: it2
  }
}) => it2)({
  w: {
    [_Symbol$iterator]: _getIteratorMethod([1])
  }
});
function viaSymbolDefault([{
  [_Symbol$iterator]: it3
}] = [{
  [_Symbol$iterator]: _getIteratorMethod([1])
}]) {
  return it3;
}
// ... and a for-x HEAD, whose element the mirror swaps in place, climbs the same levels to its host
for (const {
  w: [{
    getOwnPropertyNames: g2
  }]
} of [{
  w: [Object]
}]) g2;
export { viaIifeHopWrap, viaDefaultHopWrap, viaShifted, viaDouble, viaHopBelow, viaTwoBranches, viaTwoSlots, viaTwoWraps, viaSymbolWrap, viaSymbolHop, viaSymbolDefault };

// NEGATIVES: a branch whose slot holds a user value stays raw beside a mirrored sibling; a receiver
// nothing pairs positionally (a member read) mirrors nothing
const viaUserSibling = (({
  a: {
    getPrototypeOf: p1
  },
  b: {
    create: c1
  }
}) => [p1, c1])({
  a: Object,
  b: userObj
});
const viaMemberReceiver = (({
  a: {
    defineProperty: d1
  }
}) => d1)(_globalThis.x);
export { viaUserSibling, viaMemberReceiver };