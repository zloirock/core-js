// guarded `module?.exports` read with subsequent CJS write - the OptionalMember chain
// covers tooling that emits `module?.exports` for environments without a guaranteed
// `module` global (UMD bundles). CJS detection walks both MemberExpression and
// OptionalMemberExpression rooted at module/exports so the file is correctly classified
const guard = module?.exports;
module.exports.bar = [1, 2, 3].flat();
module.exports.baz = ['a', 'b'].at(0);
console.log(guard);
