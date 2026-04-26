// `var X = X` self-ref TDZ-style pattern with a known global name: the bare-identifier
// rewrite is skipped to avoid breaking initialisation order.
var Map = Map;
Map.groupBy([1], x => x);
