// User declares many `_ref` slots covering bare and the skip-1 numbered range.
// Plugin allocator must seed `#nextSuffixByPrefix['_ref']` past the highest
// user-occupied slot to avoid collision. ORPHAN_REF_PATTERN must accept
// `_ref10`, `_ref11` etc. so the plugin recognises them as plugin-emitted
// shape (which seeded into the cache) -- but here they belong to user code,
// so the allocator has to consult scope binding regardless of the regex
let _ref = 0;
let _ref2 = 1;
let _ref3 = 2;
let _ref10 = 3;
let _ref11 = 4;
let _ref12 = 5;
const arr = [_ref, _ref2, _ref3, _ref10, _ref11, _ref12];
arr.at(0);
arr.findLast(x => x > 0);
