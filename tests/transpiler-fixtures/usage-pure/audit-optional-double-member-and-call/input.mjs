// doubled optional-chain `obj?.a?.b()`: every step is tracked so both the member
// access and the call site fire the right polyfill rewrites.
arr?.includes?.(1);
