// UNCONDITIONAL nested-block writes fold on both emitters: a labeled block, a finally
// and a for-init always execute; the estree side resolves them through the synthetic
// var-hoist binding (labeled / finally) and past the loop-reinit self record (for-init)
labeled: { var { iterator: viaLabel } = Symbol; }
export const viaLabeledBlock = [][viaLabel];
