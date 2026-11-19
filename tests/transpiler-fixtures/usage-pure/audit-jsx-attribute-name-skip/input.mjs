// JSX attribute name `Map` looks like a global identifier but lives in a non-reference
// position. JSXIdentifier visitor must reject attribute-name slot (only opening element
// name root accepted). attribute VALUE expression (`x.at(0)`) still polyfills normally.
const el = <div Map={x.at(0)} />;
