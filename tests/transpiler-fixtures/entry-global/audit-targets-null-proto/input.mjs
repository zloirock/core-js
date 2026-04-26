// `targets` with a null prototype must still be processed correctly: plugin must use
// own-key checks rather than prototype-walking lookups.
import 'core-js/actual/array/at';
