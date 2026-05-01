import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Tagged template on a typed receiver: callPath threading via TaggedTemplateExpression.
// resolveCallReturnType(path.get('tag')) hands callPath = TaggedTemplateExpression
// to resolveMemberCallType -> resolveTypedMember -> resolveClassMember -> resolveReturnType
// -> buildTypeParamMap which then probes callPath.get('arguments') (no such field on TTE).
const arr: string[] = ['a', 'b'];
const r = arr.concat`x`;
_atMaybeArray(r).call(r, 0);