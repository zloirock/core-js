// combined shape: IIFE arrow with destructured param where the receiver is `Array`
// (call argument substituted with the polyfilled binding), body uses `from([...])`
// from the destructure, outer optional chain on the call result guards the inner `.at(0)`
(({from}) => from([1, 2])?.at(0))(Array);
