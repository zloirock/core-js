// a `this` PARAM-DEFAULT in a static method synths the default itself (caller-correct:
// the synth only evaluates when the arg is omitted); an unpolyfilled sibling re-reads
// through `this` - still the constructor in the default position
class ParamDefault extends Array {
  static m({ from, custom } = this) { return [from, custom]; }
}
export const viaParam = ParamDefault.m();
