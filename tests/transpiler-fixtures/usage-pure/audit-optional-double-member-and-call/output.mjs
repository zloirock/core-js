import _includes from "@core-js/pure/actual/instance/includes";
// doubled optional-chain `obj?.a?.b()`: every step is tracked so both the member
// access and the call site fire the right polyfill rewrites.
arr == null ? void 0 : _includes(arr)?.call(arr, 1);