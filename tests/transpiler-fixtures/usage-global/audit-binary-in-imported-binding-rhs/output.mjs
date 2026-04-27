// `'k' in target` where target is an imported binding. plugin doesn't statically resolve
// the imported binding to a known polyfill receiver - it could be ANY value at runtime.
// no inject. covers the import-binding-as-RHS case where static analysis bails to no-op
import target from './m';
'k' in target;