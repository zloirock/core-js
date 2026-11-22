import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The this-slot selects Array.at. The provider test checks that the omitted signature is callable.
declare function withThis(this: string[], y: number): string;
declare const tp: ThisParameterType<typeof withThis>;
declare const omitted: OmitThisParameter<typeof withThis>;
tp.toString();
_atMaybeArray(tp).call(tp, 0);
omitted.bind(null, 1).toString();