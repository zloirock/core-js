// an optional call on an inherited static whose result nothing navigates: the substituted
// binding is always defined, so the `?.()` erases with it and the call binds `this` (the
// subclass) exactly like the plain twin. the NAVIGATED shape lives beside it in
// `audit-optional-super-static-call`, where the dispatch above owns the split
export class C extends Array {
  static a() {
    return super.from?.([1]);
  }

  static b() {
    return super.of?.(2, 3);
  }
}
