// minifier-collapsed destructure-in-sequence nested THREE levels deep: each
// `(prefix, ({pat} = R))` lives inside the one above it. a single rewrite pass can only split
// the outermost statement (splitting an inner one would re-edit text the outer split already
// touched), so the pre-pass must split outermost, re-parse, then repeat until every level is
// flattened. distinct statics per level prove each nested destructure RHS was reached
(function () { (function () { (eff(), ({ x } = Object.fromEntries(e))); }, ({ y } = Array.from(z))); }, ({ z } = Object.entries(w)));
