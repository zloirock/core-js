// `core-js-disable-next-line` before a bare `{`-block whose body opens on the next line disables
// polyfills for the WHOLE block body; the sibling `flatMap` outside the block still polyfills
// core-js-disable-next-line
{
  [].flat();
}
[].flatMap(x => x);
