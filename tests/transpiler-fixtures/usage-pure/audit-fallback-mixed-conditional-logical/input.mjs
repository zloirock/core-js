// nested logical inside a conditional fallback: outer ConditionalExpression with one
// branch carrying a LogicalExpression. flattenFallbackBranches recurses through both
// shapes uniformly, classifying each leaf identifier independently for per-branch deps
export const { from } = cond ? (Array || Iterator) : (Set ?? Map);
