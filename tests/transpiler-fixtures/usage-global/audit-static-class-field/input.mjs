// static class field initialised with a polyfilled built-in: the initializer is
// scanned and rewritten like any other top-level expression.
class C { static items = Array.from([1, 2, 3]); }
