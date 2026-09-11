// A flatten declarator (`{ Array: { from } } = globalThis`) shares its declaration with a sibling
// extracting an instance method off a polyfillable-global member chain. the retained receiver gets
// its proxy-global root substituted so it can't leak bare on engines without globalThis
const { values } = globalThis.navigator, { Array: { from } } = globalThis;
from([1]);
console.log(values);
