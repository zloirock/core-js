import _at from "@core-js/pure/actual/instance/at";
// JSX attribute name `Map` looks like a global identifier but lives in a non-reference
// position. JSXIdentifier visitor must reject attribute-name slot (only opening element
// name root accepted). attribute VALUE expression (`x.at(0)`) still polyfills normally.
const el = <div Map={_at(x).call(x, 0)} />;