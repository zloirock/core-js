// a user-patched static is not a polyfillable static: the file-level patch taints the key,
// so the inherited-static remap bails on BOTH funnel legs - the declarator read and the
// param-default synth stay raw and keep reading the patched value through `this`
Array.from = function patched() { return null; };

class ViaDeclarator extends Array {
  static m() { const { from } = this; return from; }
}
export const viaDeclarator = ViaDeclarator.m();

class ViaParamDefault extends Array {
  static m({ from: pf } = this) { return pf; }
}
export const viaParamDefault = ViaParamDefault.m();
