// usage-global counterpart: K reassigned BEFORE the use, value at the call is the reaching definition
// 'of', so usage-global injects es.array.of. the computed-key resolver follows the reaching definition
// (the dominating straight-line write), not just the declarator init.
let K = "from";
K = "of";
Array[K]([1, 2, 3]);
