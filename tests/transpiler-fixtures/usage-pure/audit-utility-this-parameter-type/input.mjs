// `ThisParameterType<F>` and `OmitThisParameter<F>` were missing from the utility-type
// handling and resolved to null, so member access on the result dispatched to generic
// polyfill. ThisParameterType must collapse to Object (its result IS the `this` receiver,
// structurally an object) and OmitThisParameter to Function (a callable with `this`
// stripped); lookup must NOT fall through to user-defined-type resolution (no in-scope decl)
declare function withThis(this: { x: number }, y: number): string;
declare const tp: ThisParameterType<typeof withThis>;
declare const omitted: OmitThisParameter<typeof withThis>;
tp.toString();
omitted.bind(null, 1).toString();
