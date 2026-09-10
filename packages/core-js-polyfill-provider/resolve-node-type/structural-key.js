// Structural IDENTITY: the canonical key a fully-resolvable type shape reduces to, and the member-set
// reading of the relation between two shapes. It exists because every shape this layer never modelled
// - each interface, class, object literal and call signature alike - collapses into ONE box, so two
// of them are known only to be alike and never to be the same type. The question is answered off the
// AST instead, and answered CONSERVATIVELY: one leaf the walk cannot name refuses the whole reading,
// because a partial one collapses two different shapes onto a single string and fires the TRUE branch
// of a conditional tsc answers FALSE.
//
// Public surface: `structuralKey` (a canonical string, or null) and `compareMemberShapes` (tri-state
// assignability of two member sets). Both are consumed by the conditional branch picker in
// `type-expansion.js` and by nothing else.
import { MAX_DEPTH, MEMBER_ANNOTATION_SLOTS, literalNodeValue } from './base.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';
import {
  isInterfaceDeclaration,
  isMethodShapeMember,
  isObjectTypeLiteral,
  isPrivateMemberNode,
  isTypeAlias,
  isTypeReferenceNode,
  typeAliasBody,
} from './ast-shapes.js';

// the keyword types a structural key may name. Every other keyword refuses it: the two tops and
// `never` DISTRIBUTE in the check position, where a conditional over them takes both branches, and
// `this` names a type that depends on where it was written
const STRUCTURAL_KEY_KEYWORDS = new Map([
  ['TSStringKeyword', 'string'],
  ['TSNumberKeyword', 'number'],
  ['TSBooleanKeyword', 'boolean'],
  ['TSBigIntKeyword', 'bigint'],
  ['TSSymbolKeyword', 'symbol'],
  ['TSVoidKeyword', 'void'],
  ['TSNullKeyword', 'null'],
  ['TSUndefinedKeyword', 'undefined'],
  ['TSObjectKeyword', 'object'],
]);

export function createStructuralKey({
  getTypeMembers,
  getKeyName,
  unwrapTypeAnnotation,
  peelTSParenthesized,
  typeRefSegments,
  findAllTypeDeclarations,
}) {
  // the intern table behind the key below, and the guard against re-walking one shape once per path
  // that reaches it: a member set naming the same shape twice makes the walk branch, and two nested
  // levels of that is four walks. Keyed the way `getTypeMembers` keys its own memo - node first, then
  // the scope the names in it resolve against - because a key IS a pure function of that pair. The
  // one path-dependent answer is the cycle bail below, and caching THAT can only lose a key, never
  // invent one
  const structuralKeyCache = new WeakMap();

  // the member list a shape hands back is the WHOLE list only where nothing behind it was skipped: the
  // collector drops a heritage parent it could not resolve and returns what it HAS, which is right for
  // member DISPATCH - an over-emitted helper costs bytes - and wrong for a RELATION, where a name
  // missing from a partial list decides FALSE for a shape that may well carry it and an empty list
  // decides TRUE against every check. The shapes with nothing to lose are the ones with no heritage at
  // all. Asked here and not off the declaration WALK, which answers a different question: it hands back
  // a box as soon as ONE parent of an `extends A, B` resolved, and the members of the other are gone.
  // A naked type PARAMETER falls out here too, and must: its constraint is an UPPER bound, so an
  // instantiation may carry members the bound never named
  function shapeCarriesAllItsMembers(node, scope) {
    if (isObjectTypeLiteral(node)) return true;
    const segments = isTypeReferenceNode(node) ? typeRefSegments(node) : null;
    const declarations = segments ? findAllTypeDeclarations(segments, scope) : [];
    return declarations.length > 0 && declarations.every(declarationCarriesAllItsMembers);
  }

  // one declaration of the merge-set. An alias is only its own members where it was WRITTEN as a shape:
  // an alias for a reference inherits that reference's question, and answering it here would mean
  // walking the chain the member collector already walks
  function declarationCarriesAllItsMembers(declaration) {
    if (isTypeAlias(declaration)) return isObjectTypeLiteral(peelTSParenthesized(typeAliasBody(declaration)));
    return isInterfaceDeclaration(declaration) && !declaration.extends?.length;
  }

  // the members of a shape, keyed by name, or null. ONE member this layer cannot name or whose type
  // it cannot key refuses the WHOLE set - a partial one collapses two different shapes onto the same
  // reading and answers TRUE for a relation tsc answers FALSE. An index or call signature carries no
  // name at all, and a method's PARAMETERS sit in a slot the annotation read never reaches, so two
  // methods differing only there would look alike
  function structuralMembers(node, walk, depth) {
    if (!shapeCarriesAllItsMembers(node, walk.scope)) return null;
    const members = getTypeMembers({ objectType: node, scope: walk.scope, depth });
    if (!members) return null;
    const keyed = new Map();
    for (const member of members) {
      if (member.computed || isPrivateMemberNode(member) || isMethodShapeMember(member.type)) return null;
      const name = getKeyName(member.key);
      if (typeof name !== 'string') return null;
      const slot = MEMBER_ANNOTATION_SLOTS.find(candidate => member[candidate]);
      const key = slot && keyOf(unwrapTypeAnnotation(member[slot]), walk, depth + 1);
      if (!key) return null;
      // `readonly` is deliberately absent from the entry: it freezes the SLOT and leaves assignability
      // alone, so `{ readonly a: T }` and `{ a: T }` accept each other in both directions
      keyed.set(name, { optional: !!member.optional, key });
    }
    return keyed;
  }

  // the member map serialized. Sorted, because a member set is unordered and two spellings of one
  // shape have to produce one string
  function memberSetKey(members) {
    const entries = [];
    for (const [name, entry] of members) entries.push(`${ name }${ entry.optional ? '?' : '' }:${ entry.key }`);
    return `{${ entries.sort().join(';') }}`;
  }

  // a canonical STRING for a fully-resolvable type shape, or null. Two nodes that key alike denote
  // ONE type, which is what makes `check extends extend` true for a pair of them - and a leaf this
  // layer cannot name refuses the whole key for the reason a member set refuses on one member. A
  // shape that contains ITSELF is refused too: the string would have to name its own tail
  function structuralKey(node, scope) {
    return scope ? keyOf(node, { scope, seen: new Set() }, 0) : null;
  }

  function keyOf(node, walk, depth) {
    const target = peelTSParenthesized(node);
    if (!target || depth > MAX_DEPTH || walk.seen.has(target)) return null;
    let perNode = structuralKeyCache.get(target);
    if (!perNode) structuralKeyCache.set(target, perNode = new WeakMap());
    if (perNode.has(walk.scope)) return perNode.get(walk.scope);
    walk.seen.add(target);
    const members = structuralMembers(target, walk, depth);
    const key = members ? memberSetKey(members) : syntacticKey(target, walk, depth);
    walk.seen.delete(target);
    perNode.set(walk.scope, key);
    return key;
  }

  // the shapes with no member list of their own: keywords, literals, the containers written as a
  // reference, and the callable types. Everything absent from the dispatch refuses, the computed
  // shapes (`keyof`, indexed access, conditional, mapped, `typeof`, a template literal) among them -
  // two different ones are spelled alike as often as one shape is spelled two ways
  function syntacticKey(target, walk, depth) {
    const keyword = STRUCTURAL_KEY_KEYWORDS.get(target.type);
    if (keyword) return keyword;
    switch (target.type) {
      case 'TSLiteralType': {
        const value = literalNodeValue(target.literal);
        return value === undefined ? null : `${ typeof value }!${ String(value) }`;
      }
      case 'TSArrayType': return listKey({ head: 'Array', nodes: [target.elementType], walk, depth });
      case 'TSTupleType':
        return listKey({ head: 'tuple', nodes: target.elementTypes ?? target.types ?? [], walk, depth });
      case 'TSUnionType': return listKey({ head: 'union', nodes: target.types, walk, depth, sorted: true });
      case 'TSIntersectionType': return listKey({ head: 'and', nodes: target.types, walk, depth, sorted: true });
      case 'TSFunctionType':
      case 'TSConstructorType': return signatureKey(target, walk, depth);
      case 'TSTypeReference': {
        // a reference reaching here named a container, a name this layer never resolved, or a shape
        // whose member list the walk above refused. Its ARGUMENTS are then the only thing telling one
        // instantiation from another - two references written with the same name and the same
        // arguments name the same type - and a reference that wrote NONE says nothing a key could
        // hold: the bare `Array` means `Array<any>`, and a naked type parameter names a type nobody
        // has written yet, one whose every instantiation the conditional would take both branches for
        const nodes = getTypeArgs(target)?.params;
        const segments = nodes?.length ? typeRefSegments(target) : null;
        return segments ? listKey({ head: `ref:${ segments.join('.') }`, nodes, walk, depth }) : null;
      }
      default: return null;
    }
  }

  // a keyed list under a head, refusing whole when any element does. `sorted` is for the lists whose
  // ORDER carries no meaning - the arms of a union or an intersection, where two spellings are one type
  function listKey({ head, nodes, walk, depth, sorted = false }) {
    const keys = [];
    for (const node of nodes) {
      const key = node && keyOf(node, walk, depth + 1);
      if (!key) return null;
      keys.push(key);
    }
    return `${ head }<${ (sorted ? keys.sort() : keys).join(',') }>`;
  }

  // a call signature: the parameter TYPES in order, and the return type. Parameter NAMES are left out
  // - they name nothing about the type - and a parameter with no written type refuses the signature,
  // since an implicit `any` says exactly what every other top says
  function signatureKey(target, walk, depth) {
    const keys = [];
    for (const param of target.params ?? []) {
      const annotation = param?.typeAnnotation && unwrapTypeAnnotation(param.typeAnnotation);
      const key = annotation && keyOf(annotation, walk, depth + 1);
      if (!key) return null;
      keys.push(`${ param.type === 'RestElement' ? '...' : '' }${ param.optional ? '?' : '' }${ key }`);
    }
    const returned = target.returnType && unwrapTypeAnnotation(target.returnType);
    const returnKey = returned && keyOf(returned, walk, depth + 1);
    return returnKey ? `${ target.type === 'TSConstructorType' ? 'new' : 'fn' }(${ keys.join(',') })=>${ returnKey }` : null;
  }

  // tri-state assignability of two shapes read as MEMBER SETS. Every member the extends side REQUIRES
  // has to be on the check side saying the same thing; an extra member there is width the relation
  // allows, and a required name the check side does not carry AT ALL makes the two disjoint whatever
  // the rest says - the one FALSE a member set answers outright. An OPTIONAL check member against a
  // required one is the second: the property may be missing where the target needs it. A pair that
  // merely differs in TYPE is not disjoint - the two may still be assignable one way round - so it
  // leaves the whole relation open
  function compareMemberShapes(check, extend, scope) {
    if (!scope) return null;
    const checkMembers = structuralMembers(check, { scope, seen: new Set() }, 0);
    const extendMembers = checkMembers && structuralMembers(extend, { scope, seen: new Set() }, 0);
    if (!checkMembers || !extendMembers) return null;
    let verdict = true;
    for (const [name, wanted] of extendMembers) {
      const held = checkMembers.get(name);
      if (!held) {
        if (wanted.optional) continue;
        return false;
      }
      if (held.optional && !wanted.optional) return false;
      if (held.key !== wanted.key) verdict = null;
    }
    return verdict;
  }

  return {
    structuralKey,
    compareMemberShapes,
  };
}
