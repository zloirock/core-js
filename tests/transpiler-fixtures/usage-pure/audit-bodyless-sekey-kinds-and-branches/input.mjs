// Bodyless var hosts retain each key effect and extraction inside the conditional body.
// Constructor, single-instance and multiple-instance forms preserve source evaluation order.

// global-ctor kind (vs static / instance): the extracted constructor binding registers a global alias and,
// in a bodyless if, joins the one `var` with the residual
if (c) var { [(log(), 'Promise')]: P } = globalThis;

// A preceding initializer and the computed instance extraction share one var body.
while (c) var first = init, { [(log(), 'flatMap')]: fm } = rows;

// Two instance keys retain their alternating key-effect and read order in one var body.
do var { [(log(), 'findLast')]: fl, [(log(), 'findLastIndex')]: fli } = rows; while (c);
