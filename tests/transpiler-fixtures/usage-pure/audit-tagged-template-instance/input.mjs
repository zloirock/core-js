// Tagged template on a typed receiver: callPath threading via TaggedTemplateExpression.
// resolveCallReturnType(path.get('tag')) hands callPath = TaggedTemplateExpression
// to resolveMemberCallType -> resolveTypedMember -> resolveClassMember -> resolveReturnType
// -> buildTypeParamMap which then probes callPath.get('arguments') (no such field on TTE).
const arr: string[] = ['a', 'b'];
const r = arr.concat`x`;
r.at(0);
