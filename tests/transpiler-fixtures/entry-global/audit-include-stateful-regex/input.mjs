// a user-supplied regex with global/sticky flags must still match consistently against
// every polyfill name (no lastIndex carry-over between checks).
import 'core-js/actual/array/at';
