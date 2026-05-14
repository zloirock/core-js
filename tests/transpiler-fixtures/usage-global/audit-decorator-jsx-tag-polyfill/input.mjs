// JSX inside decorator expressions (`@(<Map/>) class C {}`). unplugin's decorator
// walker previously had no JSXIdentifier visitor, so embedded JSX tag-names did not
// trigger global polyfill emission. fix shares `jsxIdentifierVisitor` between the
// top-level visitor map and `decoratorVisitors` so both shapes find the same global
// runtime references. distinct decorator targets per class (simple JSXIdentifier
// `<Map/>` vs JSXMemberExpression root `<Set.X/>`) pin emission to each global.
@(<Map />)
class WithMap {}
@(<Set.X />)
class WithSetRoot {}
