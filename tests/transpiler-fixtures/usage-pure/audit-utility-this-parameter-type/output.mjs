// `ThisParameterType<F>` and `OmitThisParameter<F>` were missing from the utility-type
// switch and resolved to null - downstream member access on results then dispatched to
// generic polyfill. with the switch entries, ThisParameterType collapses to Object
// (its result IS the `this` receiver type, structurally an object) and OmitThisParameter
// collapses to Function (its result IS a callable with `this` stripped). regression
// lock: lookup must NOT fall through to resolveUserDefinedType (no in-scope decl exists)
declare function withThis(this: {
  x: number;
}, y: number): string;
declare const tp: ThisParameterType<typeof withThis>;
declare const omitted: OmitThisParameter<typeof withThis>;
tp.toString();
omitted.bind(null, 1).toString();