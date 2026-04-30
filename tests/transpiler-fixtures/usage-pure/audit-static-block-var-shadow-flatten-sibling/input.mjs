// flatten-sibling case: first declarator is a fully-flattened proxy-global destructure
// (`{ Array: { from } } = globalThis`); sibling declarator is an IIFE returning a value
// computed inside a static block where `var globalThis` shadows the global. asserts the
// destructure-emitter's `polyfillSiblingReceiverRefs` walker treats StaticBlock as a
// var-scope owner so the inner `globalThis` reference resolves to the local var, not
// the polyfill binding (`pushBlockScope`'s StaticBlock branch collects `var` declarations)
const { Array: { from } } = globalThis, K = (() => {
  let acc = '';
  class Inner {
    static {
      var globalThis = 'static';
      var self = 'static-self';
      acc = globalThis + self;
    }
  }
  Inner;
  return acc;
})();
export { from, K };
