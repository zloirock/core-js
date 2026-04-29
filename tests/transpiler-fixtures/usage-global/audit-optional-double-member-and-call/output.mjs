import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// doubled optional-chain `obj?.a?.b()`: every step must be tracked so both the member
// access and the call site fire the right polyfill rewrites.
arr?.includes?.(1);