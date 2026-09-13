// The local tag receives this own container as its second argument and replaces k with Map.
// The object is truthy, so the old Object candidate and its guard are unreachable after the call.
// Pure keeps the actual slot read and instance dispatch; the clean container still resolves Object.keys.
function tagShape(strings, value) { if (value) value.k = Map; return ''; }
const tagBox = { k: Object };
void tagShape`x${ tagBox }`;
const { k: { values } } = tagBox;
// the STRINGS array is no user container, so a tag with no interpolation leaves resolution alone
const cleanBox = { k: Object };
void tagShape`plain`;
const { k: { keys } } = cleanBox;
export { values, keys };
