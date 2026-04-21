// shorthand destructure with default: `{ Map = fallback } = globalThis`. shorthand ObjectProperty
// has key=Identifier(Map), value=AssignmentPattern(Identifier(Map), fallback). patternBindingName
// peels AssignmentPattern to 'Map', matches name, returns resolveKey(key) = 'Map' - correct proxy
const { Map = MyFallback } = globalThis;
new Map();
