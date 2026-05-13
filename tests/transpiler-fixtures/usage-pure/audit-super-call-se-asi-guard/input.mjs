// `super[(SE, 'method')](args)` rewrite emits `(SE, binding.call(this, args))` - leading
// `(` after an unterminated predecessor (`var x = 1`) fuses into a call expression on the
// prior numeric literal. asiGuardLeadingParen injects `;` so the rewrite remains its own
// ExpressionStatement.
class C extends Array {
  static run() {
    var x = 1
    super[(console.log('SE'), 'from')]([1, 2]);
    return x;
  }
}
export { C };
