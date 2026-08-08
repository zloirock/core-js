// usage-pure: K is reassigned BEFORE the use, so at the call K is 'of' (the reaching definition;
// the declarator init 'from' is dead). pure resolves the computed key from that value -> `Array[K]`
// is Array.of -> `_Array$of`. the key resolver follows the reaching definition (the unambiguous
// straight-line dominating write), not just the declarator init.
let K = "from";
K = "of";
Array[K]([1, 2, 3]);
