// the entry-global final pass must canonical-sort the whole import region across all
// flushes so sibling-plugin imports injected between entry detection and the final flush
// land in compat-data order, not registration order. a single `core-js/actual/array/at`
// entry expands into multiple `core-js/modules/*` imports that MUST come out in registry order
import 'core-js/actual/array/at';
