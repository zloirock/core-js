// A static-member access on a known global (Error.captureStackTrace) injects the base constructor so
// the global exists at runtime. That base-constructor pass must not apply the constructor's own
// call-shape filters to the static-method call's arguments - otherwise the injection flips on the
// static method's arg count. A single-argument call must inject the same base constructor module.
declare const o: object;
Error.captureStackTrace(o);
