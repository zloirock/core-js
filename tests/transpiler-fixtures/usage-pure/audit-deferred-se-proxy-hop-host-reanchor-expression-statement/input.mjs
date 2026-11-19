// a LATER `var _ref;` hoist (minted by the guarded default below) must not displace the
// lifted statements queued ABOVE - the drain re-anchors, keeping each lift under its `let`
const plainRecv = getObj();
const { [Symbol.iterator]: guarded = null } = plainRecv;
guarded;
