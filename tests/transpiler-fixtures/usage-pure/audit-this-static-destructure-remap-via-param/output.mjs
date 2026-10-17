import _Array$from from "@core-js/pure/actual/array/from";
// a `this` PARAM-DEFAULT in a static method synths the default itself (caller-correct:
// the synth only evaluates when the arg is omitted); an unpolyfilled sibling re-reads
// through `this` - still the constructor in the default position
class ParamDefault extends Array {
  static m({
    from,
    custom
  } = {
    from: _Array$from,
    custom: this.custom
  }) {
    return [from, custom];
  }
}
export const viaParam = ParamDefault.m();