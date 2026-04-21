// `globalThis.Map ||= X` — MemberExpression LHS form of the logical-assign pattern.
// checkLogicalAssignLhsGlobal now catches both bare Identifier (`Map ||= X`) and the
// proxy-global member form, surfacing a distinct warning each time. runtime engine must
// still provide Map — plugin rewrites reads, not writes
globalThis.Map ||= {};
