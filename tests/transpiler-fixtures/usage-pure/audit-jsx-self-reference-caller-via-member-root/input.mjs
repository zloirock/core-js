// A JSX tag name REFERENCES the function it names: the element hands the component to a renderer that calls it with props, so such
// a function has callers the file cannot see.
var cond = true;
// The root of a member-expression tag name is the reference; the tail is a prop on it.
export const viaMemberRoot = (function G({ ['of']: of } = Array) {
  return cond ? (cond = false, <G.Sub x={1} />) : of;
})();
