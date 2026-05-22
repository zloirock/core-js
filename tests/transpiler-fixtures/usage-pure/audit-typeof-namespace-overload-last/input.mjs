// namespaced overloaded ambient function accessed through typeof. resolution
// of ReturnType<typeof NS.fn> must follow TypeScript's overload resolution
// rule and pick the LAST overload signature, mirroring the bare-identifier
// counterpart. without that the receiver narrow stays on the first overload's
// return type and the polyfill dispatch routes incorrectly.
declare namespace NS {
  function fn(x: string): string;
  function fn(x: number): number[];
}
type R = ReturnType<typeof NS.fn>;
declare const r: R;
r.at(0);
