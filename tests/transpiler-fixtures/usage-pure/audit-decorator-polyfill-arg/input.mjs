// decorator argument is a polyfilled built-in call: the expression inside the
// decorator parens is scanned and rewritten in pure-mode.
@inject(new Map()) class C {}
