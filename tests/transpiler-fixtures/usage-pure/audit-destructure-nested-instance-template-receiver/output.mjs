import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// a nested instance method off a CONSTANT (no-interpolation) template-literal receiver. `m` is the only
// binding and the init is pure, so the dead residual is dropped: the template is emitted ONCE inside
// `_padStartMaybeString(`ab`)` rather than duplicated into a discarded destructure. a constant template is a
// string constant - re-referencing it yields the same string. an INTERPOLATED `` `${x}` `` would bail
// (re-evaluating re-runs x's string coercion, a possible side effect)
const m = _padStartMaybeString(`ab`);