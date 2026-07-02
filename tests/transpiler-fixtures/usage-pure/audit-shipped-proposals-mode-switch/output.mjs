import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref;
// `shippedProposals: true` with mode `es` auto-promotes to `actual` so stage 3+ proposals
// (like Iterator helpers) are picked up
_mapMaybeArray(_ref = [1, 2]).call(_ref, x => x + 1);