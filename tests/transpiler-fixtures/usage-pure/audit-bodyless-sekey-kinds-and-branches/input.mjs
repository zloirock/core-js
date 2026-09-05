// additional bodyless-host coverage for the SE-key destructure `var` join: distinct polyfill KINDS and emit
// branches that the if/for-of/do-while base cases do not exercise

// global-ctor kind (vs static / instance): the extracted constructor binding registers a global alias and,
// in a bodyless if, joins the one `var` with the residual
if (c) var { [(log(), 'Promise')]: P } = globalThis;

// siblingDeclarator branch: a multi-declarator instance method appends a TRAILING declarator (no preceding
// statement), so the bodyless body stays a single statement
while (c) var first = init, { [(log(), 'flatMap')]: fm } = rows;

// multi-element: two SE-key extracts precede one residual in a single `var` (distinct methods per leaf)
do var { [(log(), 'findLast')]: fl, [(log(), 'findLastIndex')]: fli } = rows; while (c);
