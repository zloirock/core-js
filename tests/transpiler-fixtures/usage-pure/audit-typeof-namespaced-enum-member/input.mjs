// `typeof NS.E.A` - namespaced enum member. resolveTypeofQualifiedMember only checked
// findEnumDeclaration when memberPath.length === 1, so member access through one or more
// namespace segments lost the enum-kind narrow ($Primitive('string')). added the
// segments-aware path via findDeclPathBySegments so any nesting depth resolves
namespace NS {
  export enum E { A = 'alpha', B = 'beta' }
}
declare const v: typeof NS.E.A;
v.at(0);
