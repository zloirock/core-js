// Literal receiver keys identify the same written slot in either parser.
// Body reads must retain the functions assigned by the loop, including through a dispatcher.
// The mutation census conservatively treats these non-string computed keys as unknown slots.
const o = { true: [], null: [] };
for (o[true].at of functions) consume(o[true].at(0));
for (o[null].includes of functions) consume(o[null].includes(0));
