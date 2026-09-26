// React fragment `<>...</>` and `<Symbol>` element name - not polyfillable since Symbol
// in JSX position is parsed as JSXOpeningElement (component). only `.iterator` access
// outside JSX should polyfill `Symbol.iterator`.
const fragment = <>{x}</>;
const elem = <Symbol>{y}</Symbol>;
const iter = obj[Symbol.iterator];
