// A local tag can mutate a passed container but a tag without that argument cannot.
// Native slot reads and instance dispatch retain the value actually written by the call.
function tagShape(strings, value) { if (value) value.k = Map; return ''; }
const tagBox = { k: Object };
void tagShape`x${ tagBox }`;
const { k: { values } } = tagBox;
// the STRINGS array is no user container, so a tag with no interpolation leaves resolution alone
const cleanBox = { k: Object };
void tagShape`plain`;
const { k: { keys } } = cleanBox;
export { values, keys };
