import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// UNCONDITIONAL nested-block writes fold on both emitters: a labeled block, a finally
// and a for-init always execute; the estree side resolves them through the synthetic
// var-hoist binding (labeled / finally) and past the loop-reinit self record (for-init)
labeled: {
  var viaLabel = _Symbol$iterator;
}
export const viaLabeledBlock = _getIteratorMethod([]);