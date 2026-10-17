// A JSX tag name REFERENCES the function it names: the element hands the component to a renderer that calls it with props, so such
// a function has callers the file cannot see.
var cond = true;

// The tag name references the function itself - an extra caller the synth still covers.
export const viaTagName = (function F({ ['from']: from } = Array) {
  return cond ? (cond = false, <F x={1} />) : from;
})();
