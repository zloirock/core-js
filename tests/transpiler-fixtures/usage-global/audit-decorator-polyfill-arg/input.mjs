// decorator argument is a polyfilled built-in call: the expression inside the
// decorator parens is scanned and rewritten like any other call site.
@inject(new Map()) class C {}
