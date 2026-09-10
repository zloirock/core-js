// TS mapped + conditional type evaluation. mapped expansion (`{ [K in keyof T]: ... }`)
// and conditional resolution (`T extends U ? A : B`) are intertwined: conditional renames
// inside mapped `as` clauses route back through `matchesConditionalPattern`, infer-pattern
// matching feeds into conditional eval, and both share the `dropMapKeys` / alpha-rename
// machinery. extracted as a unit because separating them would require crossing the cluster
// boundary on nearly every internal call.
//
// Public surface:
//   mapped:      mappedTypeKeyName, mappedTypeConstraint, unwrapMappedTypePassthrough,
//                expandMappedTypeMembers
//   conditional: evaluateConditionalType, pickConditionalBranchVia, isUnconstrainedTypeShape
//   shared:     typeRefSegmentsEqual, dropMapKeys, trueBranchSubst
//
// Service object carries the cross-cluster helpers used by both groups. Several deps
// (`getTypeMembers`, `substituteTypeParams`, `applyAliasSubstDeep`, `resolveInnerType`)
// reference factory functions that are declared later in the factory body but are
// captured by closure via function-declaration hoisting at call time.
import {
  INTRINSIC_STRING_TRANSFORMERS,
  MAX_DEPTH,
  NUMERIC_KEY_SHAPE_RE,
  PLACEHOLDER_VALIDATORS,
  RENAME_SKIP,
  STRUCTURAL_SUPERTYPES,
  TOP_ARGUMENT,
  UNKNOWN_ARGUMENT,
  firstTypeParamIsInner,
  STRUCTURAL_WALK_SKIP_KEYS,
  isTopObjectShape,
  literalMembers,
  literalNodeValue,
  primitiveTypeOf,
  quasiText,
  typeIdentityElided,
} from './base.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';
import {
  isPrivateMemberNode, isTopKeywordAnnotation, isTypeReferenceNode, mappedModifierDelta, mutableCollectionName,
  readonlyCollectionBase, unionAnnotationOf,
} from './ast-shapes.js';

// `resolveInferElementPattern` sentinel: the extends clause is a recognised `Container<infer U>`
// pattern AND the check side is a disjoint primitive, so the conditional definitively takes the
// FALSE branch (`string extends Iterator<infer U>` is false - the `infer` means pickConditionalBranch
// can't decide it structurally). distinct from a plain null (pattern not applicable, or check / inner
// type unresolvable) which folds both branches
const INFER_PATTERN_FALSE = Symbol('infer-pattern-false');

// `domainCovers` verdict for a target key domain that names nothing the check side could hold - an
// empty domain, or one of a key family the check has no member of. The entries after the domain
// describe members that do not exist, so the whole relation holds however far apart they read
const DOMAIN_DESCRIBES_NOTHING = Symbol('domain-describes-nothing');

export function createTypeExpansion({
  literalKeyValue,
  applyAliasSubstDeep,
  unwrapTypeAnnotation,
  getTypeMembers,
  getKeyName,
  peelTSParenthesized,
  substituteTypeParams,
  resolveInnerType,
  resolveTypeAnnotation,
  typeParamName,
  foldUnionTypes,
  isNullableOrNever,
  typesEqual,
  typeRefName,
  typeRefSegments,
  isPromiseRefName,
  resolveStructuralContainerType,
  structuralKey,
  compareMemberShapes,
}) {
  // --- Mapped types ---

  // string-shaped numeric keys (`'0'`, `'42'`) are produced by `getKeyName` when iterating member
  // lists of a `keyof T` source whose underlying T uses numeric indexers. the key reaching here is
  // ALWAYS a string - both producers stringify (`String(...)` on the literal-union lane, `getKeyName`
  // on the `keyof` lane, whose numeric arm converts) - so the question is whether this text COULD be
  // the stringification of a number, and only its canonical form can be. `'01'`, `'1.0'` and `'1e10'`
  // pass the shape but no number prints that way, so they are string keys and answer `K extends
  // number` with false and `K extends string` with true, exactly as TS does. `'1e999'` falls out the
  // same way - a number prints `Infinity`. the sibling `${number}` validator keeps its looser rule on
  // purpose: TS admits `7e1` in a template placeholder, where canonicalizing would UNDER-resolve
  function isNumericKeyShape(keyValue) {
    return typeof keyValue === 'string' && NUMERIC_KEY_SHAPE_RE.test(keyValue)
      && String(Number(keyValue)) === keyValue;
  }

  // shared cross-parser key resolution for TSMappedType. babel: `node.typeParameter.name`
  // is an Identifier (`name.name` carries the string). oxc/TS-ESTree: `node.key` is the
  // Identifier directly OR a string. callers without constraint check use this helper raw
  function mappedTypeKeyName(node) {
    const keyNameNode = node?.typeParameter?.name ?? node?.key;
    if (!keyNameNode) return null;
    return typeof keyNameNode === 'string' ? keyNameNode : keyNameNode.name ?? null;
  }

  // similar for constraint slot - both parser shapes. peeled: oxc keeps `[K in (keyof T)]`
  // / `[K in ('a' | 'b')]` as TSParenthesizedType where babel strips it at parse - the
  // dispatch on `constraint.type` below must see the inner shape on both parsers
  function mappedTypeConstraint(node) {
    return peelTSParenthesized(node?.typeParameter?.constraint ?? node?.constraint);
  }

  function parseMappedTypeShape(node) {
    const constraint = mappedTypeConstraint(node);
    const paramName = mappedTypeKeyName(node);
    if (!paramName || !constraint) return null;
    // `[K in keyof T]` - source is T, iterated via getTypeMembers
    if (constraint.type === 'TSTypeOperator' && constraint.operator === 'keyof') {
      // peeled: a parenthesized `keyof (T)` source otherwise defeats the passthrough
      // capture-guard downstream (`typeRefSegments` reads a Paren head as no-segments,
      // wrongly ADMITTING a cross-param passthrough babel rejects)
      return { paramName, source: peelTSParenthesized(constraint.typeAnnotation), kind: 'keyof' };
    }
    // `[K in 'a' | 'b']` / `[K in 'a']` - literal union (or single literal) constraint;
    // each literal value drives one synthesized key. supports string + number literals.
    // TSLiteralType wraps the actual literal under `.literal`; literalKeyValue checks the
    // wrapped node directly (StringLiteral / NumericLiteral)
    if (constraint.type === 'TSLiteralType' && literalKeyValue(constraint.literal) !== null) {
      return { paramName, source: constraint, kind: 'literal-union' };
    }
    if (constraint.type === 'TSUnionType' && constraint.types.length
        // per-member peel: oxc keeps `[K in ('a') | 'b']` member parens
        && constraint.types.every(m => {
          const member = peelTSParenthesized(m);
          return member.type === 'TSLiteralType' && literalKeyValue(member.literal) !== null;
        })) {
      return { paramName, source: constraint, kind: 'literal-union' };
    }
    return null;
  }

  // peel the parser-specific template-literal-type shape into a uniform { quasis, exprs } pair.
  // babel emits `TSLiteralType { literal: TemplateLiteral { quasis, expressions } }`;
  // oxc/TS-ESTree emits `TSTemplateLiteralType { quasis, types }` directly. quasis carry
  // `value.cooked` text; exprs are TS types interleaved with quasis (n+1 quasis for n exprs)
  function templateLiteralTypeParts(node) {
    if (node?.type === 'TSTemplateLiteralType') return { quasis: node.quasis, exprs: node.types };
    if (node?.type === 'TSLiteralType' && node.literal?.type === 'TemplateLiteral') {
      return { quasis: node.literal.quasis, exprs: node.literal.expressions };
    }
    return null;
  }

  // segment-by-segment equality for two TSTypeReference / GenericTypeAnnotation chains.
  // both-non-ref returns true (both shapes "match" by being not-a-ref); ref-vs-non-ref
  // and segment mismatch return false. avoids the typeRefSignature string-join allocation
  // and short-circuits on length mismatch
  function typeRefSegmentsEqual(a, b) {
    const segA = typeRefSegments(a);
    const segB = typeRefSegments(b);
    if (!segA?.length) return !segB?.length;
    if (!segB?.length || segA.length !== segB.length) return false;
    for (let i = 0; i < segA.length; i++) if (segA[i] !== segB[i]) return false;
    return true;
  }

  // detect the trivial passthrough mapped type `{ [K in keyof T]: T[K] }` and return T.
  // `readonly` / `optional` / `-readonly` / `-?` modifiers don't change the member set, only
  // descriptor flags, so we let them through; `nameType` (key remap via `as`) does rename and
  // blocks. CRITICAL: when source is a TSTypeReference, verify body.objectType is the SAME
  // ref by signature - without this, `{ [K in keyof T]: U[K] }` (with U a sibling type-param
  // distinct from T) is mis-classified as passthrough to U; downstream member walk uses U's
  // keys instead of synthesizing T-keyed members with U[K] values. for non-Ref source shapes
  // (TSTypeLiteral / nested mapped / etc.) no structural-mismatch class exists in the same
  // way - the `U[K]` capture relies on both sides being TYPE-PARAMETER refs that LOOK
  // identical at the AST level but bind to different scopes. only `keyof` source needs this
  // check; literal-union sources don't apply since the body shape would be `Source[K]` for
  // a different K-source pair
  function unwrapMappedTypePassthrough(node) {
    if (!node || node.type !== 'TSMappedType') return null;
    if (node.nameType || !node.typeAnnotation) return null;
    const shape = parseMappedTypeShape(node);
    if (!shape || shape.kind !== 'keyof') return null;
    // oxc preserves `(T[K])` body shape as TSParenthesizedType; babel parser drops parens
    // at parse time. peel so the passthrough recognition fires on both parsers - without
    // the peel, oxc-parsed `{[K in keyof T]: (T[K])}` falls past the IndexedAccess check
    // and emits the slow per-key expansion instead of the cheap passthrough delegation
    const body = peelTSParenthesized(node.typeAnnotation);
    if (body.type !== 'TSIndexedAccessType') return null;
    const indexParam = peelTSParenthesized(body.indexType);
    if (indexParam?.type !== 'TSTypeReference' || indexParam.typeName?.type !== 'Identifier'
      || indexParam.typeName.name !== shape.paramName) return null;
    // the body must index the very type the keys are taken from - otherwise this is a cross-type
    // projection (`{ [K in keyof A]: B[K] }`), whose members are A's keys carrying B's value types,
    // and handing B back would walk B's keys instead. two type-REFS match by name; anything
    // structural has to be the SAME node, because a caller may already have substituted a concrete
    // type into the body: `{ x, y }` and `{ x, y, extra }` are then both non-refs yet different
    // types. a structural source paired with a distinct structural body loses only the fast path -
    // the per-key expansion below builds the same members from the source's own keys
    const sourceIsRef = Boolean(typeRefSegments(shape.source)?.length);
    if (sourceIsRef
      ? !typeRefSegmentsEqual(shape.source, body.objectType)
      : shape.source !== body.objectType) return null;
    return body.objectType ?? null;
  }

  // statically evaluate a mapped-type rename template against a single source key.
  // returns the renamed key string, RENAME_SKIP for `as never` / un-matched conditional
  // branches, or null when the template can't be resolved to a literal string
  function evalRenameTemplate(template, paramName, keyValue) {
    while (true) {
      if (!template) return null;
      // entry peel: oxc keeps `as (Uppercase<K & string>)` (and parenthesized recursion
      // slots - intrinsic args, intersection members, conditional branches, which re-enter
      // here) as TSParenthesizedType where babel strips it
      template = peelTSParenthesized(template);
      if (template.type === 'TSNeverKeyword') return RENAME_SKIP;
      if (template.type === 'TSStringKeyword') return keyValue;
      // `\`prefix\${...}suffix\`` - cross-parser via templateLiteralTypeParts; concatenate
      // quasis interleaved with the per-expression evaluation results
      const parts = templateLiteralTypeParts(template);
      if (parts) {
        let out = quasiText(parts.quasis[0]);
        for (let i = 0; i < parts.exprs.length; i++) {
          const sub = evalRenameTemplate(parts.exprs[i], paramName, keyValue);
          if (typeof sub !== 'string') return sub;
          out += sub + quasiText(parts.quasis[i + 1]);
        }
        return out;
      }
      // `as 'fixed'` - direct string / numeric literal type
      if (template.type === 'TSLiteralType') return literalKeyValue(template.literal);
      if (template.type === 'TSTypeReference' && template.typeName?.type === 'Identifier') {
        const { name } = template.typeName;
        if (name === paramName) return keyValue;
        const xform = INTRINSIC_STRING_TRANSFORMERS[name];
        if (!xform) return null;
        const arg = getTypeArgs(template)?.params?.[0];
        if (!arg) return null;
        const inner = evalRenameTemplate(arg, paramName, keyValue);
        return typeof inner === 'string' ? xform(inner) : inner;
      }
      // `string & K` - drop the string-keyword half, evaluate the remaining type-level part
      if (template.type === 'TSIntersectionType') {
        let result = null;
        for (const part of template.types) {
          if (part?.type === 'TSStringKeyword') continue;
          const sub = evalRenameTemplate(part, paramName, keyValue);
          if (typeof sub !== 'string') return sub;
          if (result !== null && result !== sub) return null;
          result = sub;
        }
        return result;
      }
      // distributive conditional rename: `as K extends Pat ? New : never` filters/renames members.
      // only handles `K extends ...` checks; the extends-side must be a literal or a string
      // template that we can pattern-match against the concrete key
      if (template.type === 'TSConditionalType') {
        const matched = matchesConditionalPattern({
          checkType: template.checkType, extendsType: template.extendsType, paramName, keyValue,
        });
        if (matched === true) {
          template = template.trueType;
          continue;
        }
        if (matched === false) {
          template = template.falseType;
          continue;
        }
        return null;
      }
      return null;
    }
  }

  // `K extends 'a' ? ... : ...` - true when keyValue equals the extendsType literal.
  // `K extends string ? ... : ...` - true ONLY when keyValue is a string. numeric-literal
  // keys (`{ [K in 0 | 1]: ... }`) yield `0 extends string` = false per TS spec.
  // `K extends number ? ... : ...` - mirror: true ONLY for numeric keyValue.
  // `K extends any | unknown ? ... : ...` - always true (top types match any literal).
  // `K extends `${...}` ? ... : ...` - pattern-match keyValue against the template literal.
  // `K extends 'a' | 'b' ? ... : ...` - any-branch match.
  // returns null when the pattern can't be statically decided (caller bails).
  // peel TSParenthesizedType on both sides - oxc preserves `(K) extends ('a') ? ...`
  // and the leading typeReference check would otherwise drop the wrapped form
  function matchesConditionalPattern({ checkType, extendsType, paramName, keyValue }) {
    checkType = peelTSParenthesized(checkType);
    extendsType = peelTSParenthesized(extendsType);
    if (checkType?.type !== 'TSTypeReference' || checkType.typeName?.name !== paramName) return null;
    if (isTopKeywordAnnotation(extendsType)) return true;
    if (extendsType?.type === 'TSStringKeyword') {
      if (typeof keyValue !== 'string') return false;
      // upstream coerces numeric-literal mapped sources (`[K in 0 | 1]`) to string repr
      // before reaching here, so a stringified numeric `'0'` is indistinguishable from a
      // real string key. per TS spec `0 extends string` is false; signal undecidable so
      // the caller folds both branches rather than over-returning true
      return isNumericKeyShape(keyValue) ? null : true;
    }
    // TS keeps the two spellings apart - `{ 0: T }` has a NUMBER key, `{ '0': T }` a string one -
    // but the pipeline stringifies both before this sees them. the canonical text keeps answering
    // TRUE: bare numeric keys are what these renames are written for, and the `'0' | 1` conflation
    // is the accepted over-emit. a NON-canonical text is not conflated with anything - no number
    // prints as `'01'` / `'1.0'` / `'1e10'` - so those are string keys and answer false
    if (extendsType?.type === 'TSNumberKeyword') return isNumericKeyShape(keyValue);
    if (templateLiteralTypeParts(extendsType)) return matchTemplatePattern(extendsType, keyValue);
    if (extendsType?.type === 'TSLiteralType') {
      const expected = literalKeyValue(extendsType.literal);
      return expected === null ? null : keyValue === expected;
    }
    if (extendsType?.type === 'TSUnionType') {
      let result = false;
      for (const branch of extendsType.types) {
        const m = matchesConditionalPattern({ checkType, extendsType: branch, paramName, keyValue });
        if (m === true) return true;
        if (m === null) result = null;
      }
      return result;
    }
    return null;
  }

  // template-literal pattern match: `\`prefix\${string}suffix\`` admits any key with that
  // prefix/suffix; `${number}` accepts only number-literal-shaped segments. multi-placeholder
  // matches use lazy left-to-right segmentation (each non-last quasi captures up to its
  // first occurrence after the previous quasi) - precision-limited but safe miss when
  // alternative segmentations would also match
  function matchTemplatePattern(template, keyValue) {
    const parts = templateLiteralTypeParts(template);
    if (!parts) return null;
    const { quasis, exprs } = parts;
    // resolve validators upfront: any unrecognised placeholder type bails the whole match
    const validators = exprs.map(e => PLACEHOLDER_VALIDATORS[e?.type]);
    if (validators.some(v => !v)) return null;
    const head = quasiText(quasis[0]);
    // no-placeholder template (`as 'fixed'` / `` `fixed` ``) is semantically a literal
    // string match. without exact equality, `startsWith(head)` would admit any keyValue
    // with that prefix as a match (`'abc'` vs `'abcdef'`)
    if (exprs.length === 0) return keyValue === head;
    if (!keyValue.startsWith(head)) return false;
    let pos = head.length;
    // each subsequent quasi must appear (in order) somewhere in the remaining keyValue;
    // the segment between previous quasi-end and current quasi-start must satisfy the
    // corresponding placeholder validator. last quasi must terminate the value (no trail)
    for (let i = 1; i < quasis.length; i++) {
      const q = quasiText(quasis[i]);
      const isLast = i === quasis.length - 1;
      const idx = isLast
        ? (keyValue.endsWith(q) ? keyValue.length - q.length : -1)
        : keyValue.indexOf(q, pos);
      if (idx < 0 || idx < pos) return false;
      if (!validators[i - 1](keyValue.slice(pos, idx))) return false;
      pos = idx + q.length;
    }
    return true;
  }

  // synth an AST literal type node wrapping a string key - used as the substitution value
  // for paramName when expanding `[K in source]` mapped types. mirrors the shape of an
  // explicit `'key'` literal-type so subsequent applyAliasSubstDeep into body / nameType
  // sees the same structure regardless of whether the source was `keyof T` or `'a' | 'b'`
  function literalTypeFromKeyName(keyName) {
    return { type: 'TSLiteralType', literal: { type: 'StringLiteral', value: keyName } };
  }

  // synth a property signature for one expanded mapped key. shared between literal-union
  // and keyof source paths - only the keyof lane can pass `sourceMember`, since a literal-union
  // source names keys rather than carrying members to inherit flags from.
  // nameType present but unevaluable splits into two outcomes:
  //   RENAME_SKIP        - explicit `as never` / mismatched conditional, drop key
  //   non-string (null)  - rename undecidable for THIS key (e.g. union with a partially-
  //                        unresolvable TypeReference branch). drop key from the partial
  //                        expansion: decidable keys still narrow, undecidable fall through
  //                        to generic dispatch. safe upper bound - never includes a key that
  //                        user-rename would exclude
  function buildMappedMember({ node, paramName, keyName, substValue, body, sourceMember = null }) {
    const renamed = node.nameType ? evalRenameTemplate(node.nameType, paramName, keyName) : keyName;
    if (renamed === RENAME_SKIP || typeof renamed !== 'string') return null;
    const subst = new Map([[paramName, substValue]]);
    return {
      type: 'TSPropertySignature',
      key: { type: 'Identifier', name: renamed },
      computed: false,
      // the synthesized member inherits the SOURCE member's optionality unless the mapped type's
      // own `?` / `-?` modifier overrides it - dropping both is how a hand-written `Partial`
      // (`{ [K in keyof T]?: T[K] }`) resolved to a required member
      optional: mappedModifierDelta(node).optional ?? Boolean(sourceMember?.optional),
      typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: applyAliasSubstDeep(body, subst) },
    };
  }

  // expand a mapped type to a flat member list. two shapes:
  //   `{ [K in keyof T as RENAME(K)]: BODY }` - rename clause renames each source key
  //   `{ [K in keyof T]: BODY }`              - no rename, source key passes through;
  //     covers non-passthrough bodies (`number[]`, `T[K][]`, `Promise<T[K]>`) that
  //     `unwrapMappedTypePassthrough` rejects (it requires body === `T[K]` exactly)
  // for each literal key k of T, synthesize `{ key: renamed(k), typeAnnotation: BODY[K -> k] }`.
  // bails (returns null) for any non-statically-evaluable shape so the caller falls back
  // to the previous behaviour (no narrow). callers must apply outer T-subst BEFORE invoking
  // (the substituted source type's keys must be statically enumerable)
  // append a synthesized member, MERGING a same-name collision into a union: two source keys can
  // rename onto one target (`as 'k'`, `Uppercase<K>` over `a` / `A`), and TS gives that key the
  // union of every colliding arm. appending both instead lets the member walk answer with whichever
  // came first - an over-resolve on a key that really is present
  function pushMappedMember(out, member) {
    const existing = out.find(m => m.key.name === member.key.name);
    if (!existing) {
      out.push(member);
      return;
    }
    const own = existing.typeAnnotation.typeAnnotation;
    const next = member.typeAnnotation.typeAnnotation;
    existing.typeAnnotation = { type: 'TSTypeAnnotation', typeAnnotation: unionAnnotationOf([own, next]) };
  }

  // a rename target that widens to bare `string` (`as string`, or a template that is nothing but a
  // `${string}` placeholder) does NOT mint per-key members in TS - the result is an INDEX SIGNATURE
  // whose value is `T[keyof T]`. minting concrete keys with per-key value types is narrower than the
  // real type, so a read off one of them over-resolves; fold them into one signature over the union
  function foldRenameToIndexSignature(members) {
    const types = members.map(m => m.typeAnnotation.typeAnnotation);
    if (!types.length) return [];
    return [{
      type: 'TSIndexSignature',
      parameters: [{
        type: 'Identifier',
        typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: { type: 'TSStringKeyword' } },
      }],
      typeAnnotation: {
        type: 'TSTypeAnnotation',
        typeAnnotation: unionAnnotationOf(types),
      },
    }];
  }

  // is the rename clause a bare `string` widening? peeled because oxc keeps the parens
  function renameWidensToString(nameType) {
    return peelTSParenthesized(nameType)?.type === 'TSStringKeyword';
  }

  function expandMappedTypeMembers({ node, scope, depth, visited }) {
    if (!node.typeAnnotation) return null;
    const shape = parseMappedTypeShape(node);
    if (!shape) return null;
    const body = unwrapTypeAnnotation(node.typeAnnotation);
    if (!body) return null;
    const out = [];
    // literal-union constraint: each literal value drives one synthesized member; the
    // substitution value is the literal node itself (already in the right shape)
    if (shape.kind === 'literal-union') {
      const sourceType = unwrapTypeAnnotation(shape.source);
      // a wrapper chain bottoming out on an absent annotation unwraps to nothing - the same
      // bail the `keyof` lane below takes, rather than dereferencing it and aborting the file
      if (!sourceType) return null;
      // members re-peeled to mirror the shape gate above (paren members otherwise leak
      // into `literalKeyValue` / the substitution value)
      const literals = (sourceType.type === 'TSLiteralType' ? [sourceType] : sourceType.types)
        .map(m => peelTSParenthesized(m));
      for (const lit of literals) {
        const keyName = String(literalKeyValue(lit.literal));
        const member = buildMappedMember({ node, paramName: shape.paramName, keyName, substValue: lit, body });
        if (member) pushMappedMember(out, member);
      }
      return node.nameType && renameWidensToString(node.nameType) ? foldRenameToIndexSignature(out) : out;
    }
    // `keyof T` constraint: enumerate T's members, synth literal-type for each key name
    const sourceType = unwrapTypeAnnotation(shape.source);
    if (!sourceType) return null;
    const sourceMembers = getTypeMembers({ objectType: sourceType, scope, depth: depth + 1, visited });
    if (!sourceMembers) return null;
    for (const m of sourceMembers) {
      // computed (Symbol-keyed / dynamic-key) members are EXCLUDED from `keyof T` per TS
      // spec - skip-but-continue so they don't sink the rest of the expansion. only null
      // statically-named keys (`getKeyName` returned null) signal indeterminate, bail
      if (m.computed) continue;
      // private (`#priv`) members are EXCLUDED from `keyof T` per TS spec, so skip-but-continue:
      // they don't leak through mapped expansion and shouldn't sink the rest of the result.
      // privacy keys on the AST discriminator - a PUBLIC member SPELLED `'#foo'` (string-literal
      // key) is a normal key and must survive, though `getKeyName` returns the same string
      if (isPrivateMemberNode(m)) continue;
      const keyName = getKeyName(m.key);
      // null key signals "not statically evaluable" - bail entire expansion (a member we
      // can't name leaves the mapped result indeterminate)
      if (keyName === null) return null;
      const member = buildMappedMember({
        node, paramName: shape.paramName, keyName, substValue: literalTypeFromKeyName(keyName), body, sourceMember: m,
      });
      if (member) pushMappedMember(out, member);
    }
    return node.nameType && renameWidensToString(node.nameType) ? foldRenameToIndexSignature(out) : out;
  }

  // --- Conditional types ---

  // local binding. walks structurally without entering nested TSConditionalType bodies -
  // those nest their own infer scope and shouldn't leak into the outer collector.
  // TSInferType records its OWN name then recurses into its constraint so nested
  // `infer U extends Array<infer V>` (TS 4.7+ infer-with-constraint) registers both
  // `U` and `V` in the same scope - the constraint sits BESIDE the binding, sharing
  // the conditional's binding scope rather than introducing a new one
  function collectInferredNames(node, into = new Set(), depth = 0) {
    if (!node || typeof node !== 'object' || depth > MAX_DEPTH) return into;
    if (node.type === 'TSInferType') {
      // through the injected cross-parser extractor, which this factory already uses ten lines away
      const name = typeParamName(node.typeParameter);
      if (typeof name === 'string') into.add(name);
      if (node.typeParameter?.constraint) collectInferredNames(node.typeParameter.constraint, into, depth + 1);
      return into;
    }
    // nested conditional binds its own infer scope - stop the walk so its trueType-only
    // names don't bleed into the outer extendsType's collector
    if (node.type === 'TSConditionalType') return into;
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      if (STRUCTURAL_WALK_SKIP_KEYS.has(key)) continue;
      const value = node[key];
      if (Array.isArray(value)) {
        for (const item of value) collectInferredNames(item, into, depth + 1);
      } else if (value && typeof value === 'object' && typeof value.type === 'string') {
        collectInferredNames(value, into, depth + 1);
      }
    }
    return into;
  }

  // a readonly collection (`readonly T[]` / `ReadonlyArray` / `ReadonlySet` / `ReadonlyMap`) is NOT
  // assignable to the MUTABLE form of the SAME base - a conditional whose check is the readonly view
  // of the extends clause's mutable container takes the FALSE branch. single rule, applied both in the
  // single-element infer fast-path (resolveInferElementPattern) and the general branch decider below
  // (which handles the multi-param `Map<infer K, infer V>` the fast-path never matches)
  function readonlyCheckVsMutablePattern(checkAST, extendsAST) {
    const roBase = readonlyCollectionBase(checkAST);
    return roBase !== null && roBase === mutableCollectionName(extendsAST);
  }

  // AST-level conditional branch picker for findTypeMember (which works on AST nodes,
  // not resolved $Primitive / $Object types). complementary to `pickConditionalBranch` -
  // operates on AST shape after subst applied, so literal-type precision (`'narrow'`
  // vs primitive `string`) is preserved. returns true / false / null (undecidable)
  function pickConditionalBranchByAST(check, extend, scope) {
    if (!check || !extend) return null;
    check = peelTSParenthesized(check);
    extend = peelTSParenthesized(extend);
    // two shapes read as member sets, and - for the shapes that have no member list of their own -
    // one canonical string apiece. Asked BEFORE the resolved-type rules because the layer below
    // holds no member information at all: every declared shape and every inline literal collapses
    // into the one box that says only that it was not modelled
    const structural = compareMemberShapes(check, extend, scope);
    if (structural !== null) return structural;
    const checkKey = structuralKey(check, scope);
    if (checkKey !== null && checkKey === structuralKey(extend, scope)) return true;
    // readonly check is not assignable to its mutable-form pattern -> FALSE branch (covers containers
    // the single-element fast-path doesn't, e.g. two-param `Map<infer K, infer V>`)
    if (readonlyCheckVsMutablePattern(check, extend)) return false;
    // template-literal extends (`prefix_${string}`): can't statically decide without a
    // concrete check side. resolveTypeAnnotation maps both check and extend to $Primitive
    // ('string'), so the Type-Object equality below would over-return true. signal
    // undecidable so the caller falls back to union-fold of both branches
    if (extend?.type === 'TSTemplateLiteralType' || check?.type === 'TSTemplateLiteralType') return null;
    // both literal types: compare values (the precision case `'narrow' extends 'narrow'`).
    // negative numeric literals (`-1`, `-0`) are parsed as UnaryExpression { operator: '-',
    // argument: NumericLiteral { value: 1 }} - `literal.value` is undefined, so the naive
    // comparison would skip every conditional involving negative numbers
    if (check?.type === 'TSLiteralType' && extend?.type === 'TSLiteralType') {
      const cv = literalNodeValue(check.literal);
      const ev = literalNodeValue(extend.literal);
      if (cv !== undefined && ev !== undefined) return cv === ev;
    }
    return null;
  }

  // detect AST-level concrete-empty shapes (`[]`, `{}`) that signal a syntactically definite
  // disjoint check vs a non-empty inner. peeled-from-Paren so `([])` matches too. post-resolve
  // inner-less artefacts (e.g. `[infer X, X]` where infer doesn't bind) DON'T match this
  // predicate - they look like type-refs / non-empty tuples to the AST walker
  function isConcreteEmptyShape(node) {
    if (!node) return false;
    const peeled = peelTSParenthesized(node);
    if (peeled?.type === 'TSTupleType' || peeled?.type === 'TupleTypeAnnotation') {
      return !(peeled.elementTypes ?? peeled.types ?? []).length;
    }
    if (peeled?.type === 'TSTypeLiteral') return !(peeled.members ?? []).length;
    return false;
  }

  function compareArgLists(a, b, keyDomain) {
    // only one side wrote its parameters. A bare container means all-`any` and matches whatever the
    // other carries, but that reading is the caller's `extendIsUnconstrained` to make from the AST -
    // reached here, the bare side is one this layer merely failed to fill in
    if (!a || !b || a.length !== b.length) return null;
    let verdict = true;
    for (const [index, arg] of a.entries()) {
      // a mapped container's first argument is a key DOMAIN, and the entries after it describe that
      // domain's members. Two domains this layer cannot see to be ONE type therefore sink the whole
      // relation rather than merely leaving their own position open: the empty-domain
      // `Record<never, string>` is extended by `Record<string, number>` however far apart the values
      if (keyDomain && index === 0) {
        const covers = domainCovers(arg, b[0]);
        if (covers === null) return null;
        if (covers === DOMAIN_DESCRIBES_NOTHING) return true;
        if (covers === false) return false;
        continue;
      }
      const pick = compareArgSlot(arg, b[index]);
      if (pick === false) return false;
      if (pick === null) verdict = null;
    }
    return verdict;
  }

  // one position of two written argument lists. A top argument constrains nothing, so an extends
  // side that wrote one accepts whatever the check holds. The mirror question this layer does not
  // answer: `any` is assignable in both directions and `unknown` in only one, and the list keeps
  // no note of which keyword was written
  function compareArgSlot(check, extend) {
    // either top constrains nothing, so an extends side that wrote one accepts whatever is held
    if (extend === TOP_ARGUMENT || extend === UNKNOWN_ARGUMENT) return true;
    // in the CHECK slot the two tops part. `any` is assignable to every type but the BOTTOM one -
    // the HOLE an unrepresentable argument leaves included, since `never` is a type this layer does
    // resolve and so never leaves one. `unknown` is assignable only to another top, and the arm
    // above already took every extends side that is one
    if (check === TOP_ARGUMENT) return extend?.type !== 'never';
    if (check === UNKNOWN_ARGUMENT) return false;
    return pickConditionalBranch({ check, extend });
  }

  // the KEY FAMILY a mapped container's domain names: the shape of the members it has, not their
  // count. `literals` is the one that holds actual keys; the three keyword families are index
  // SIGNATURES, which hold a key of that family without naming any; `empty` holds none at all. A
  // domain this layer did not resolve, a top, and a literal union whose members the fold could not
  // keep are all unclassifiable - the last for the reason the union rule declines it, that its
  // members are exactly what the question is about
  function keyDomainKind(entry) {
    if (!entry || entry === TOP_ARGUMENT || entry === UNKNOWN_ARGUMENT) return null;
    if (entry.type === 'never') return 'empty';
    if (!entry.primitive || entry.literalUnion && !entry.literals) return null;
    if (literalMembers(entry)) return 'literals';
    return entry.type === 'string' || entry.type === 'number' || entry.type === 'symbol' ? entry.type : null;
  }

  // a mapped container's members are its domain's keys, so a WIDER domain is a container with MORE
  // members - and assignability runs the other way from a covariant position: `Record<'a' | 'b', V>`
  // extends `Record<'a', V>` and not the reverse. This answers whether the check's domain holds
  // every key the extends side's names, in the four shapes a domain comes in:
  //   true  - it does, and the entries AFTER the domain decide the rest
  //   false - it does not: the target names a key the check has no member for
  //   DOMAIN_DESCRIBES_NOTHING - the target names no key this check could hold, so its entries
  //           describe nothing and the relation holds whatever they say
  //   null  - a domain this layer cannot classify
  // an index signature is not a set of keys: a STRING one covers every string-named key and no
  // numeric-named one (`Record<string, X>` extends `Record<'a', X>` and not `Record<1, X>`), a
  // NUMERIC one the mirror, and a SYMBOL one nothing either of the other two can hold
  function domainCovers(wide, narrow) {
    const narrowKind = keyDomainKind(narrow);
    const wideKind = keyDomainKind(wide);
    // a domain this layer cannot classify decides nothing. Every spelling it CAN read is either a
    // key FAMILY or a set of keys, and what is left is a hole, a top, or a spelling whose members
    // are not recoverable - and a mutual assignability probe cannot separate those either, since
    // the pair that needs separating (an enum against the keyword it resolves into) reads as one
    // type from both sides
    if (!narrowKind || !wideKind) return null;
    if (narrowKind === 'empty') return DOMAIN_DESCRIBES_NOTHING;
    if (narrowKind === 'literals') {
      const members = literalMembers(narrow);
      if (wideKind === 'literals') {
        const held = literalMembers(wide);
        return [...members].every(member => held.has(member));
      }
      if (wideKind === 'string' || wideKind === 'number') {
        return [...members].every(member => typeof member === wideKind);
      }
      return false;
    }
    // a domain holding no key of the target's family leaves the target's entries describing nothing
    if (wideKind === 'empty' || wideKind === 'symbol' && narrowKind !== 'symbol') return DOMAIN_DESCRIBES_NOTHING;
    if (narrowKind === 'symbol') return wideKind === 'symbol' ? true : DOMAIN_DESCRIBES_NOTHING;
    if (narrowKind === 'number' && wideKind === 'literals') {
      return [...literalMembers(wide)].some(member => typeof member === 'number') ? true : DOMAIN_DESCRIBES_NOTHING;
    }
    return true;
  }

  // tri-state assignability of two parents' `.inner` slots:
  //   true  - the check's inner is assignable to the extends side's
  //   false - it is not, at a level where BOTH sides say what they carry
  //   null  - a level whose inner is ELIDED, or a relation this layer does not model
  // `innersEqual` answers two-state, and its `a === b` arm takes two absent inners for agreement.
  // An absence is only agreement when it means `any` - which the elision marker is there to deny:
  // two chains the shared depth budget cut at the same level both end absent and compared EQUAL,
  // firing the TRUE branch of `Array<..<string | null>..> extends Array<..<string>..>` that tsc
  // answers FALSE. The same absence comes from an argument with no Type form (`Array<{ a: 1 }>`)
  // assignability of two written argument LISTS, position by position through the same decider.
  // One definite mismatch sinks the whole relation whatever the other positions say; anything the
  // decider leaves open leaves the list open too
  function compareInnerChains(a, b) {
    if (a.innerElided || b.innerElided) return null;
    // an identity-less box: the level says only that the shape was not modelled, and reading the
    // family it collapsed into as agreement fires the TRUE branch of `Array<A> extends Array<B>`
    // that tsc answers FALSE for two unrelated interfaces - the same box holding two disjoint call
    // signatures declines by the same rule. One side answers for both: the pair reaching here is
    // the one the caller already found family-equal, so both carry the same family. What a box CAN
    // say is that it stands for the same declaration as the other, which makes the two one type -
    // the reverse never holds, two declarations being structurally assignable all the same
    if (typeIdentityElided(a)) return a.identity && a.identity === b.identity ? true : null;
    // a top WRITTEN in the check's element slot parts the two tops the way the argument LIST already
    // parts them: `any` is assignable to every element but the bottom one, `unknown` only to another
    // top - and an extends side that is one was answered TRUE before this level was reached
    if (a.innerUnconstrained) return a.innerUnknown ? false : innerOf(b)?.type !== 'never';
    // the element the `.inner` slot refused is still what the level carries, and assignability is the
    // reader it was kept for: `Array<never>` extends every array and `Array<null>` almost none, where
    // the bare slot they share says `Array<any>` and matches whatever it is weighed against
    const checkInner = innerOf(a);
    const extendInner = innerOf(b);
    // both absent: the chains ended together and nothing is left that can disagree. Two PRESENT
    // inners go to the decider below however alike they are spelled, one shared BOX included - an
    // inferred type is memoized on the declaration it came from, so two reads that landed on one
    // object say only that this layer asked them the same question, which is what an identity-less
    // box already admits it cannot answer: `ReturnType<typeof A.mk<string>>` and its `<number>`
    // twin share the one inferred return type between them
    if (!checkInner || !extendInner) return !checkInner && !extendInner;
    // one side a string hint (`'string'`), the other a Type object: no common ground to walk
    if (typeof checkInner === 'string' || typeof extendInner === 'string') return checkInner === extendInner;
    // a container's parameter is one more assignability question, so it goes to the decider that
    // holds every rule rather than to a second, family-equality-only copy of it. Walking the chain
    // by `typesEqual` answered `Array<string> extends Array<String>` FALSE (a primitive IS
    // assignable to the wrapper it boxes into), `Array<string> extends Array<'a'>` TRUE (the
    // wide-vs-narrow rule never ran), and `Array<ReadonlyArray<T>> extends Array<Array<T>>` TRUE
    // (so did the readonly rule). The recursion terminates on the same finite chain the loop walked
    const pick = pickConditionalBranch({ check: checkInner, extend: extendInner });
    if (pick !== null) return pick;
    // the residual is the relations that decider leaves open across DIFFERENT families (`Array` vs
    // `Iterable`): family inequality is what this level answered before, and keeping it there costs
    // no precision while a bare fold would give up the decided FALSE of `Map<..>` vs `Set<..>`. A
    // SURVIVOR of a dropped nullish arm is no family to weigh that way - it stands for the union the
    // arm was in, and the check may be exactly that arm: `Array<null>` extends `Array<string | null>`
    return extendInner.mayBeNullish || typesEqual(checkInner, extendInner) ? null : false;
  }

  // the family name the supertype table knows a resolved type by: a container's constructor, or - for
  // the one primitive family with structural supertypes - the primitive itself, which the shared
  // unboxer names for the `String` WRAPPER too rather than spelling that pairing a second time. A
  // type whose family the table does not carry answers null, leaving its relations to the other rules
  function structuralFamily(type) {
    const name = primitiveTypeOf(type) === 'string' ? 'string' : type.constructor;
    return name && STRUCTURAL_SUPERTYPES.has(name) ? name : null;
  }

  // what a level carries in its element slot, the resolution the slot itself refused included. Every
  // reader that asks whether a level said anything asks through this pair, or the two spellings of
  // one absence drift apart - `Array<never>` looks inner-less to a raw `.inner` read
  function innerOf(type) {
    return type.inner ?? type.droppedInner;
  }

  // did this level say ANYTHING about its element? An unwritten argument leaves nothing, and that
  // absence is the bare container's, which means `Array<any>`; a written top says so through its
  // marker, and a refused resolution through the slot beside the empty one
  function innerKnown(type) {
    return !!(innerOf(type) || type.innerUnconstrained);
  }

  // the union rule above, over the members two narrow sides carry: subset -> true, disjoint -> false,
  // anything else (an overlap, or a side whose members the fold did not keep) -> undecidable
  function compareLiteralMembers(check, extend) {
    const checkMembers = literalMembers(check);
    const extendMembers = literalMembers(extend);
    if (!checkMembers || !extendMembers) return null;
    let shared = 0;
    for (const member of checkMembers) if (extendMembers.has(member)) shared++;
    if (shared === checkMembers.size) return true;
    return shared === 0 ? false : null;
  }

  // pre-fold structural evaluation of `T extends U ? trueType : falseType`. returns:
  //   true  - the conditional fires unambiguously to its true-branch
  //   false - fires unambiguously to its false-branch (concrete-disjoint check sides)
  //   null  - cannot decide statically (sub-type relations across different outer
  //           constructors, a concrete-shape extends like the empty tuple `[]`, or a check
  //           side unconstrained against a concrete extend). the caller folds both branches
  //           so we never silently mis-pick one
  // the extends side is asked about through the two AST-derived flags below rather than through
  // its resolved type, because the shapes that must be told apart collapse onto the same one: a
  // bare `Array` (a TSTypeReference with no typeArguments, so `Array<any>`, which matches any
  // concrete inner) and a concrete shape like the empty tuple `[]` (which a non-empty tuple does
  // NOT extend) both post-subst as `$Object('Array', null)`
  // `extendIsUnconstrained` reflects POST-SUBST AST shape: caller computes via
  // `isUnconstrainedTypeShape(node, typeParamMap?)` (map omitted when AST is already
  // substituted; passed when reasoning from raw AST + Type-Object map for
  // evaluateConditionalType / pickAwaitedConditionalBranch). passing raw AST directly
  // without subst awareness mis-classifies a typeparam ref `U` (no typeArguments in alias
  // body) as unconstrained even when subst maps U to a concrete shape
  // `extendIsConcreteEmpty` reflects whether the extends-side AST is structurally empty
  // (`[]`, `{}`). caller computes via `isConcreteEmptyShape(extendsAST)`. used to
  // distinguish syntactic empty (deterministic falseBranch) from post-resolve inner-less
  // artefacts (undecidable, fall back to fold)
  function pickConditionalBranch({ check, extend, extendIsUnconstrained, extendIsConcreteEmpty }) {
    if (!check || !extend) return null;
    // never is the bottom type: assignable to any T, so `never extends T` is always true.
    // without this short-circuit, the primitive-vs-X tail rules below see never as just
    // another primitive and return false (wrong branch). symmetric to `extends never`
    // handled by the "object check vs primitive extend" rule already returning false
    if (check.type === 'never') return true;
    // the union fold DROPS a nullish arm and marks the SURVIVOR, without recording which arm went:
    // `string | null` and `string | undefined` both read as `string` plus the mark. A nullish check
    // may be exactly the arm that was dropped - `null extends string | null` is TRUE - so a marked
    // extends side leaves the relation open instead of taking the FALSE the primitive-family rules
    // below answer off the survivor alone
    if (extend.mayBeNullish && isNullableOrNever(check)) return null;
    // a folded literal union (`'a' | 'b'`, from commonType merging distinct literal branches) is OPAQUE -
    // its members are not retained. `checkNarrow` / `extendNarrow` flag the narrow (single literal OR such
    // a union) sides; a bare keyword (`string`) is NOT narrow
    const checkNarrow = check.literalUnion || check.literal !== undefined;
    const extendNarrow = extend.literalUnion || extend.literal !== undefined;
    // both sides narrow with at least one union -> the members decide it, where the fold kept them:
    // every member of the check inside the extends side makes the relation hold for each of them and
    // so for their union, and a pair sharing no member fails for each of them alike. A PARTIAL overlap
    // is the undecidable one, and for two readings at once - the type-level answer is FALSE, while the
    // same union reached through a naked type parameter DISTRIBUTES and takes both branches. An opaque
    // union (members over the cap, or a fold that saw a wide arm) leaves all three open. guard before
    // the literal rules so a union is never read as a single literal or, below, as a bare keyword
    if ((check.literalUnion || extend.literalUnion) && checkNarrow && extendNarrow) {
      return compareLiteralMembers(check, extend);
    }
    // literal precision: `2 extends 1` is false even though both widen to `number`. resolveLiteralType
    // stamps each side's source literal; two single literals are disjoint unless strictly equal (cross-
    // family `2` vs `'2'` too). a union side is excluded above; a bare-keyword side has no stamp and folds
    // through the family rules below. mirrors pickConditionalBranchByAST's literal comparison
    if (check.literal !== undefined && extend.literal !== undefined) return check.literal === extend.literal;
    // wide-vs-narrow: a bare-keyword (or otherwise non-narrow) check is NOT assignable to a NARROWER target
    // - a single literal (`string extends "a"`) OR a literal union (`string extends 'a' | 'b'`) - so it
    // takes the FALSE branch. the reverse (`"a" extends string`) is true and folds through the family rules
    if (extendNarrow && !checkNarrow) return false;
    // a readonly collection check (`.readonly` marker, set on resolution) is NOT assignable to the
    // MUTABLE form of the same constructor - FALSE. covers the multi-param `Map<infer K, infer V>` the
    // single-element fast-path never matches, and readonly collections reached through indirection. a
    // readonly extend (a `ReadonlyX` pattern) is also tagged, so readonly-to-readonly still binds
    if (check.readonly && !extend.readonly && check.constructor === extend.constructor) return false;
    if (typesEqual(check, extend)) {
      // the `Function` KEYWORD is the top of the callable types: reaching here means the check is of
      // that family too, and every function value extends it whatever signature it was written with.
      // Asked off the marker rather than the AST for the reason its object-family twins are - the
      // box it shares with every unmodelled call signature says nothing else about which it is
      if (extend.functionKeyword) return true;
      // two tuples that disagree on LENGTH are disjoint whatever their elements say, and a check
      // side that is no tuple cannot be weighed against one at all - an array extends no tuple, but
      // a parameter this layer resolved to a bare container may still be one. Only the recorded
      // length can say: the collapse to `Array<commonElement>` left both sides looking alike, and
      // the inner comparison below then read `string[]` and `[string, string]` as one type. The
      // EMPTY tuple keeps the concrete-shape rule further down, which decides the same FALSE
      if (extend.tupleArity && check.tupleArity !== extend.tupleArity) {
        return check.tupleArity === null ? null : false;
      }
      // asked BEFORE the inner comparison: an extends side that constrains no inner (the
      // unparameterised `Array`, or an all-top spelling like `Array<any>`) matches whatever the
      // check carries - an ELIDED check inner included, so the comparison below never sees it.
      // an identity-less box is not such a side: a bare `B` writes no type argument either, but
      // it names one interface out of the many that box holds rather than leaving them all in.
      // a top keyword WRITTEN as the argument says exactly what a missing one does, and reaches the
      // rule through the marker - the AST flag covers the outermost extends clause alone
      if (!extend.inner && (extendIsUnconstrained || extend.innerUnconstrained) && !typeIdentityElided(extend)) return true;
      // a container whose parameters have no element slot carries them as a LIST, and that list is
      // the whole relation - the inner-slot sub-cases below read an emptiness these two never fill
      if (check.args || extend.args) {
        return compareArgLists(check.args, extend.args, check.keyDomainArgs && extend.keyDomainArgs);
      }
      const innerPick = compareInnerChains(check, extend);
      if (innerPick === true) return true;
      // a level whose inner was elided is unknowable in BOTH directions - fold both branches
      if (innerPick === null) return null;
      // extends has no inner constraint. two sub-cases distinguished by caller-supplied flags
      // (the unparameterised-reference one is answered above):
      //   - concrete-empty AST (`[]` empty tuple): structurally distinct from non-empty
      //     check, picks falseBranch per TS spec
      //   - post-resolve inner-less (e.g., `[infer X, X]` where infer doesn't resolve to
      //     a concrete inner): undecidable - infer pattern may still match, fall back to
      //     fold-both-branches via null return
      if (!innerKnown(extend)) {
        if (innerKnown(check) && extendIsConcreteEmpty) return false;
        return null;
      }
      // check side unconstrained against a concrete extend - can't statically decide
      if (!innerKnown(check)) return null;
      // both concrete, differing inners (Array<number> vs Array<string>): disjoint
      return false;
    }
    // two families the supertype table names: the relation is decided THERE and by no rule below. A
    // check whose family REACHES the extends side's is assignable to it wherever their elements
    // agree, and one that reaches it in neither direction holds none of the other's surface and is
    // disjoint whatever the elements say. A pair the table does not carry BOTH halves of is left to
    // the rules below - the constructor registry holds hierarchies of its own, and a FALSE off a
    // bare name difference is the wrong answer for every one of them
    const checkFamily = structuralFamily(check);
    const extendFamily = structuralFamily(extend);
    if (checkFamily && extendFamily && checkFamily !== extendFamily) {
      if (!STRUCTURAL_SUPERTYPES.get(checkFamily).has(extendFamily)) return false;
      // an extends element that constrains nothing matches whatever the check carries, exactly as it
      // does between two levels of ONE family - asked here too, or the comparison below reads the
      // empty slot a written top leaves as a disagreement
      if (!extend.inner && (extendIsUnconstrained || extend.innerUnconstrained)) return true;
      // reachable, and a structural supertype is covariant in its element - so the elements decide,
      // where BOTH sides wrote one. A PRIMITIVE check carries its element as a hint STRING, which
      // the chain comparison has no Type object to weigh against the container's
      if (check.primitive || !innerKnown(check) || !innerKnown(extend)) return null;
      return compareInnerChains(check, extend);
    }
    // capital `Object` is the boxed top: every non-nullish check extends it, primitives included
    // (`string extends Object` is true per TS). it resolves constructor-null like the lowercase
    // keyword, so only this marker separates the two - and the bare `$Object(null)` an unresolved
    // shape produces must NOT take this arm, which is why the rule keys on the marker and not on
    // a null constructor. `never` is decided above
    if (extend.topObject) return !isNullableOrNever(check);
    // its lowercase twin is the top of the NON-primitive types instead: `number[] extends object`
    // holds, `string extends object` does not. Read off the resolved type and not the AST, so a
    // container's parameter is decided by the same rule as the outermost pair
    if (extend.objectKeyword) return !check.primitive;
    // the same two tops read on the CHECK side, where they say the opposite: a top stands ABOVE
    // every object type, and nothing above a shape is assignable to it - `object extends Array<X>`
    // is FALSE, and so is every other pair whose extends side NAMES a family. Only a named one
    // decides: an identity-elided box holds the empty interface too, which every object does extend
    if (isTopObjectShape(check) && extend.constructor && !typeIdentityElided(extend)) return false;
    // non-primitive check (Array / Map / Promise / ...) vs primitive extend (string / number /
    // never / null / ...): disjoint per TS structural subtyping. object types can't extend
    // primitives. subsumes the `extends never` case (never is primitive) - generic rule with
    // narrower never special-case both yield falseBranch for non-never object check
    if (!check.primitive && extend.primitive) return false;
    // primitive check (string / number / ...) vs concrete-Object extend (Array<X> / Map / ...):
    // disjoint. EXCEPT wide-Object extend (`Object` keyword resolves to $Object(null)), where
    // boxing makes `string extends Object` true per TS spec - that shape is excluded by the
    // `extend.constructor` guard and falls through to `null` below (fold both branches), an
    // under-resolve rather than a decided true.
    // the extend may also be the check's OWN boxed wrapper (`string extends String`), which TS
    // decides TRUE - a primitive is assignable to the wrapper it boxes into. running both sides
    // through the shared unboxer names that pairing without spelling the five wrappers out again;
    // every other wrapper (`string extends Number`) and every container unboxes to something else
    if (check.primitive && !extend.primitive && extend.constructor !== null) {
      return primitiveTypeOf(extend) === primitiveTypeOf(check);
    }
    // different primitive types (number vs string): truly disjoint
    if (check.primitive && extend.primitive) return false;
    // anything else (Array vs Iterable etc) - subtype relations exist, can't decide
    return null;
  }

  // shared 2-step conditional-branch picker: AST-equality shortcut, then resolved-type
  // structural pick. callers vary only in (a) which resolver maps an AST node to a Type
  // object and (b) whether the extendsAST is already post-AST-subst or raw + a Type-object
  // substitution map. all 3 conditional-branch sites (`findConditionalTypeMember`,
  // `evaluateConditionalType`, `pickAwaitedConditionalBranch`) flow through this helper
  function pickConditionalBranchVia({ checkAST, extendsAST, resolveOne, isUnconstrained, scope }) {
    // resolveOne collapses TSTemplateLiteralType to $Primitive('string') - downstream
    // pickConditionalBranch then sees string-vs-string and returns true. short-circuit
    // to undecidable on either side so the caller folds both branches instead of
    // over-picking through a stripped template
    if (isTemplateLiteralExtend(checkAST) || isTemplateLiteralExtend(extendsAST)) return null;
    const astPick = pickConditionalBranchByAST(checkAST, extendsAST, scope);
    if (astPick !== null) return astPick;
    // a TS-only structural container resolves to nothing, which member dispatch depends on - the
    // relation between families is the reader that borrows a box for it, and only here, where the
    // pair is weighed and then dropped
    function resolveSide(node) {
      return resolveOne(node) ?? resolveStructuralContainerType(node, resolveOne);
    }
    const check = resolveSide(checkAST);
    // a check the union fold marked `mayBeNullish` is the SURVIVOR of a dropped nullish arm, not a
    // certainty: the value may take the arm that was stripped, so a branch picked on the survivor
    // commits the whole conditional to a shape the runtime need not have. the mark can sit on an
    // INNER type - `Array<string | null>` folds the arm inside the container and the container's own
    // flag stays clear - so the whole chain is asked, not just the top
    if (carriesStrippedNullish(check)) return null;
    return pickConditionalBranch({
      check,
      extend: resolveSide(extendsAST),
      extendIsUnconstrained: isUnconstrained,
      extendIsConcreteEmpty: isConcreteEmptyShape(extendsAST),
    });
  }

  // does this resolved type, or anything it contains, survive a dropped nullish arm? the fold marks
  // the survivor where the arm was dropped, which may be several containers down. the bound is the
  // SHARED recursion budget and not a smaller number of its own: the `.inner` chain is built under
  // that same budget, so any shorter ceiling stops before a mark resolution DID produce and hands
  // the picker a survivor it then reads as a certainty - `Array` nested past the ceiling around
  // `string | null` picked the true branch of `extends Array<...<string>>`, which tsc calls false
  function carriesStrippedNullish(type, depth = 0) {
    for (let cur = type, level = depth; cur && typeof cur === 'object' && level <= MAX_DEPTH; cur = cur.inner, level++) {
      if (cur.mayBeNullish) return true;
      // the `.inner` chain the loop walks is one place a survivor sits and the written argument LIST
      // is the other - a key-first or mapped container has no element slot at all, so
      // `Map<string, string | null>` carries its dropped arm there and nowhere else. Each entry is
      // its own chain, and a TOP entry is a symbol that stops on the loop guard
      if (cur.args?.some(arg => carriesStrippedNullish(arg, level + 1))) return true;
    }
    return false;
  }

  function isTemplateLiteralExtend(node) {
    // cross-parser: oxc emits TSTemplateLiteralType; babel-parser wraps TemplateLiteral
    // inside TSLiteralType. delegate to the shared `templateLiteralTypeParts` parser
    // which recognises both shapes - mirrors `matchesConditionalPattern`
    return templateLiteralTypeParts(peelTSParenthesized(node)) !== null;
  }

  // raw AST shape predicate: `Array` / `Promise` / `Set` ... without `<...>` typeArguments
  // is TS shorthand for `Array<any>` / `Promise<any>` / etc, which structurally match any
  // concrete inner. concrete-shape sites (`[]` empty tuple, `{}` object literal type, etc)
  // resolve to the same inner-less Type object but should NOT match arbitrary inners.
  //
  // two callsite modes per the three `pickConditionalBranch` consumers:
  //   - POST-SUBST AST (no map): `findConditionalTypeMember` passes `withSubst(extendsType)`
  //     which is already substituted; map omitted because residual TypeReferences (failed
  //     sub-resolution) ARE genuinely unconstrained at this point
  //   - RAW AST + map: `evaluateConditionalType` / `pickAwaitedConditionalBranch` pass
  //     `node.extendsType` raw because they substitute via `typeParamMap` rather than
  //     pre-applying. typeparam refs whose name is in the map substitute to a concrete
  //     shape and are NOT unconstrained even though their raw AST has no typeArguments
  // `any[]` / `Array<unknown>` / `readonly any[]` / `Map<any, any>`: every WRITTEN argument is a top
  // keyword, so the shape constrains no inner - the same answer the bare `Array` shorthand gives. a
  // partly-top spelling (`Map<string, any>`) is not this shape and keeps its concrete comparison
  function hasOnlyTopTypeArguments(node) {
    let target = peelTSParenthesized(node);
    if (target?.type === 'TSTypeOperator' && target.operator === 'readonly') target = peelTSParenthesized(target.typeAnnotation);
    if (target?.type === 'TSArrayType') return isTopKeywordAnnotation(target.elementType);
    if (!isTypeReferenceNode(target)) return false;
    const params = getTypeArgs(target)?.params;
    return !!params?.length && params.every(isTopKeywordAnnotation);
  }

  // the mirror of the predicate below: a BARE reference whose name the map BINDS. it is what makes
  // a conditional distributive, so a caller may only apply a distribution rule once this answers
  // yes - `[T] extends [string]` wraps the same parameter and distributes over nothing
  function isBoundNakedTypeParam(node, typeParamMap) {
    if (!typeParamMap) return false;
    const target = peelTSParenthesized(node);
    if (!isTypeReferenceNode(target) || getTypeArgs(target)?.params?.length) return false;
    const name = typeRefName(target);
    return !!name && typeParamMap.has(name);
  }

  function isUnconstrainedTypeShape(node, typeParamMap = null) {
    if (!node) return false;
    const target = peelTSParenthesized(node);
    // an explicitly written top argument says exactly what a missing one says. without this the
    // `!extend.inner` branch below reads `Extract<T, any[]>` as undecidable and sinks the result
    if (hasOnlyTopTypeArguments(node)) return true;
    if (!isTypeReferenceNode(target)) return false;
    if (getTypeArgs(target)?.params?.length) return false;
    if (!typeParamMap) return true;
    const name = typeRefName(target);
    return !name || !typeParamMap.has(name);
  }

  // resolve `T extends U ? trueType : falseType` post-subst:
  //   1) narrow `(infer U)[]` / `Array<infer U>` short-circuit (resolveInferElementPattern)
  //   2) structural eval via pickConditionalBranch - lazy: substitute only the chosen branch
  //   3) fall through to the canonical union fold over both branches
  // shared between substituteTypeParams's TSConditionalType case and any future caller
  // that needs the same evaluation contract for a TSConditionalType node
  function evaluateConditionalType(node, typeParamMap, scope, depth, seen) {
    const inferred = resolveInferElementPattern({ node, typeParamMap, scope, depth, seen });
    // disjoint-primitive check side: the infer-container true branch can't fire and the result is
    // exactly the false branch - resolve it (a `string` keeps `_atMaybeString`). without this we'd
    // fold both branches with an unbound U, collapsing the type to a generic-instance bail
    if (inferred === INFER_PATTERN_FALSE) return substituteTypeParams(node.falseType, typeParamMap, scope, depth + 1, seen);
    if (inferred) return inferred;
    // alpha-rename guard: extendsType's `infer X` declarations scope to trueType ONLY (per
    // TS spec). drop colliding outer entries from a clone passed to trueType subst so the
    // inferred binding isn't captured by the outer same-named param. mirrors applyAliasSubstDeep
    // TSConditionalType handling. falseType doesn't see infer bindings - keeps outer map.
    // built where it is USED: a picked FALSE branch never reads it, and building it walks the
    // whole extends clause for the infer names
    function trueMap() {
      return trueBranchSubst(node.extendsType, typeParamMap);
    }
    function recurse(branchNode, map) {
      return substituteTypeParams(branchNode, map, scope, depth + 1, seen);
    }
    // RAW AST + Type-object map path: substituteTypeParams resolves through typeParamMap.
    // pass raw AST + map to isUnconstrainedTypeShape so typeparam refs that bind via the
    // map are NOT misclassified as unconstrained
    // distributing over `never` yields `never`: NO branch runs. picking one hands a branch-typed
    // narrow to a binding that can hold no value - in usage-pure a type-specific helper on an
    // uninhabited receiver. only the naked spelling distributes, hence the predicate
    if (isBoundNakedTypeParam(node.checkType, typeParamMap)) {
      const bound = recurse(node.checkType, typeParamMap);
      if (bound?.primitive && bound.type === 'never') return bound;
    }
    const branch = pickConditionalBranchVia({
      checkAST: node.checkType,
      extendsAST: node.extendsType,
      resolveOne: ast => recurse(ast, typeParamMap),
      isUnconstrained: isUnconstrainedTypeShape(node.extendsType, typeParamMap),
      scope,
    });
    if (branch !== null) return branch ? recurse(node.trueType, trueMap()) : recurse(node.falseType, typeParamMap);
    // undecided: the value may take EITHER branch, so the two fold like the arms of a union, through
    // the canonical fold and its one arm policy - a branch nothing can resolve SINKS the answer (it may
    // be any shape, another polyfill family included; a stripped-looking `null` there is not a
    // stripped branch), a nullish branch drops out marking the survivor `mayBeNullish` (TS strips it in
    // value position, and `T extends X ? A : null` under `??` must not fold to A's shape), a `never`
    // branch carries no value, and two live branches must converge. two nullish branches leave no
    // shape to dispatch on
    const folded = foldUnionTypes([node.trueType, node.falseType],
      branchNode => recurse(branchNode, branchNode === node.trueType ? trueMap() : typeParamMap));
    return folded && !isNullableOrNever(folded) ? folded : null;
  }

  // drop entries whose names appear in `shadowingNames` from a substitution Map. agnostic
  // to value-type: works on both AST-valued substitution maps (built by `buildSubstMap`,
  // consumed by `applyAliasSubstDeep`) AND Type-object-valued binding maps (built by
  // `resolveTypeArgs`, consumed by `substituteTypeParams`). used by alpha-rename guards
  // (TSConditionalType infer scope, TSMappedType inner K binding) to prevent outer entries
  // from being captured by inner bindings of the same name. returns the original map
  // identity when no collision so downstream memoize keys remain stable
  function dropMapKeys(map, shadowingNames) {
    if (!map || !map.size || !shadowingNames?.size) return map;
    let clone = null;
    for (const name of shadowingNames) {
      if (!map.has(name)) continue;
      clone ??= new Map(map);
      clone.delete(name);
    }
    return clone ?? map;
  }

  // alpha-rename clone for TSConditionalType trueType: extendsType's `infer X` declarations
  // scope to trueType per TS spec, so colliding outer entries must not propagate. value-
  // type-agnostic - caller passes either AST-subst or Type-bindings depending on path
  function trueBranchSubst(extendsType, substOrBindings) {
    // `dropMapKeys` short-circuits on an empty map, but only AFTER this argument is evaluated -
    // and the argument is a full structural walk of the extends clause. ask its guard first
    if (!substOrBindings?.size) return substOrBindings;
    return dropMapKeys(substOrBindings, collectInferredNames(extendsType));
  }

  // narrow infer pattern: `T extends (infer U)[] ? <body> : X` / `T extends Array<infer U>
  // ? <body> : X` and structural synonyms. when checkType's substituted type is array-like,
  // bind U -> element type and substitute trueType through. covers bare U short-circuit
  // (`? U :`), wider compositions (`? U[] :`, `? Promise<U> :`, `? {x: U} :`), and any
  // shape `substituteTypeParams` knows how to walk. tuple head-infer (`[infer H, ...any[]]`)
  // is not handled - typeParamMap values are post-resolveTypeArgs, where tuple AST is
  // already collapsed via `tupleAsArrayType` to `$Object('Array', commonInner)`, losing
  // positional info needed to extract the head. unresolvable shape -> null, caller falls
  // back to plain branch.
  // `infer U extends C` constraint (TS 4.7+): the inferred slot is bound to the constraint
  // when the element type is unresolvable / unknown - matches the TypeScript rule "constraint
  // narrows the inference candidate". precise candidate-vs-constraint intersection is out of
  // scope; the conservative "use inner if present, else fall back to constraint" recovers
  // narrowing for `Array<infer U extends string>` on opaque arrays without false-narrowing
  // when the inner type is already concrete

  // does the resolved CHECK type plausibly extend the matched infer container (`check extends
  // Container<infer U>`, i.e. is the check side assignable TO the container)? full structural
  // assignability is out of scope, so only the cheaply-decidable PRIMITIVE-vs-container
  // disjointedness is enforced (the unsound direction the finding targets). a `string` is assignable
  // ONLY to `Iterable<string>` - the minimal interface needing just `[Symbol.iterator]` - so only
  // the sync `Iterable` family admits a string check side; it is not assignable to Array / Set /
  // Promise nor to the stricter iterator/generator interfaces (see `containerInferFamily`). object
  // check types are admitted for the permissive `Iterable` family or an unresolved container, but
  // otherwise must match the pattern's base container family (`Set` against `Array<infer U>` stays
  // disjoint); see the branch below
  // 'match'  - the check side provably belongs to the pattern's container family
  // 'unknown' - cannot be decided (structural object, unresolved container): assignability is
  //             possible, so the TRUE branch is not ruled out, but it is not established either
  // false     - provably disjoint -> the conditional is FALSE
  function checkTypeMatchesContainerFamily(checkType, family, container) {
    if (!checkType?.primitive) {
      // a TOP of the object types is the one constructor-null check side that is not an unmodelled
      // shape: it stands ABOVE every container, so it is assignable to none of them and the
      // conditional is decided FALSE here, before the permissive reading below admits it
      if (isTopObjectShape(checkType)) return false;
      // a non-primitive check side must be assignable to `container<U>` for `infer U` to bind. an
      // `Iterable<infer U>` admits the families the supertype table walks TO it, and a `Promise`,
      // which the table carries reaching nothing, is the loud one it does not (`Promise<X>` must take
      // the FALSE branch, not bind U from a non-iterable); otherwise the check side's container must MATCH
      // the pattern's (`Set<string>` against `Array<infer U>` is disjoint -> conditional FALSE, so the false
      // branch resolves precisely instead of binding U=string -> wrong helper variant). Array and
      // ReadonlyArray share element semantics (interchangeable); an unrecognised structural object or an
      // unknown pattern container stays permissive (could be assignable; over-emit-safe)
      if (family === 'iterable') {
        if (isPromiseRefName(checkType.constructor)) return false;
        // WHICH families reach `Iterable` is the supertype table's question, and the general branch
        // decider already asks it there. A constructor merely being SET says only that some box was
        // resolved, and reading that as membership bound U from the constraint for every `Date`,
        // class instance and plain interface - the wrong-receiver narrow this guard exists to stop.
        // A family the table does not carry stays permissive, exactly as it does there
        const reaches = checkType.constructor ? STRUCTURAL_SUPERTYPES.get(checkType.constructor) : null;
        if (!reaches) return 'unknown';
        return reaches.has('Iterable') ? 'match' : false;
      }
      if (!checkType.constructor || !container) return 'unknown';
      // compare BASE container family - strip a `Readonly` prefix so `ReadonlyArray` / `ReadonlySet`
      // share their mutable form's element semantics (a `Set` IS-A `ReadonlySet`, an `Array` IS-A
      // `ReadonlyArray`, and either direction binds the same element) AND fold the Promise synonyms
      // (`PromiseLike` / `Thenable`) to `Promise`, matching the check-side resolver which always
      // normalizes them: the check Type's constructor is `'Promise'` even for a `PromiseLike<infer U>`
      // pattern, so without this fold the two sides never compare equal and the synonym pattern wrongly
      // takes the FALSE branch (a wrong-receiver polyfill). a same-family match binds U precisely; a
      // cross-family one (`Set` vs `Array<infer U>`) stays disjoint -> FALSE
      function base(name) {
        return isPromiseRefName(name) ? 'Promise' : name.startsWith('Readonly') ? name.slice(8) : name;
      }
      return base(checkType.constructor) === base(container) ? 'match' : false;
    }
    return family === 'iterable' && checkType.type === 'string' ? 'match' : false;
  }

  function resolveInferElementPattern({ node, typeParamMap, scope, depth, seen }) {
    const match = matchArrayInferPattern(node.extendsType);
    if (!match) return null;
    const checkType = substituteTypeParams(node.checkType, typeParamMap, scope, depth + 1, seen);
    if (!checkType) return null;
    // `matchArrayInferPattern` matched the extends-clause SHAPE only; the true branch fires only
    // when the CHECK type belongs to that container family. a disjoint primitive check side (a
    // non-string primitive, or a string against a non-`Iterable` family) makes the conditional
    // definitively FALSE - signal that so the caller resolves the false branch precisely, instead
    // of binding U (the wrong-receiver polyfill the finding targets) or folding both branches
    const familyVerdict = checkTypeMatchesContainerFamily(checkType, match.family, match.container);
    if (!familyVerdict) return INFER_PATTERN_FALSE;
    // a readonly collection check is NOT assignable to its mutable-form infer pattern (`ReadonlyArray`
    // / `readonly T[]` -> `Array<infer U>`, `ReadonlySet` -> `Set<infer U>`) - TS picks the FALSE
    // branch. readonly-to-readonly, mutable-to-either, and a readonly array against a non-mutable-array
    // family (`Iterable<U>` binds U; disjoint `Set<U>` rejected above by the family check) still pass.
    // the AST form catches the direct spelling; the resolved `checkType.readonly` marker catches a
    // readonly collection reached through an alias / type-param indirection (`match.container` is the
    // mutable base name, so a `ReadonlyX<infer U>` pattern - container `ReadonlyX` - never matches)
    if (readonlyCheckVsMutablePattern(node.checkType, node.extendsType)
      || (checkType.readonly && !match.readonlyPattern && checkType.constructor === match.container)) return INFER_PATTERN_FALSE;
    // constraint AST (TSStringKeyword / TSNumberKeyword / ...) must pass through
    // resolveTypeAnnotation first; `substituteTypeParams` inserts the value as-is, and
    // downstream consumers expect the internal `$Primitive` / `$Object` shape rather than
    // a raw AST keyword node
    // constraint may reference outer typeparam names bound in `typeParamMap` (caller's
    // generic context) - `substituteTypeParams` carries the map through so `infer U
    // extends V` resolves V via the outer binding instead of seeing it as an unresolved
    // user type. fall back to bare `resolveTypeAnnotation` when no map (recursive entry)
    const fromConstraint = match.constraint
      ? (typeParamMap
        ? substituteTypeParams(match.constraint, typeParamMap, scope, depth + 1, seen)
        : resolveTypeAnnotation(match.constraint, scope))
      : null;
    const concreteInner = resolveInnerType(checkType);
    // `infer U extends C`: when the matched element is concrete, TS evaluates the candidate
    // against the constraint - a candidate definitively NOT assignable to C makes the conditional
    // FALSE. without this, a constraint-violating concrete element (`Array<number>` against
    // `Array<infer U extends string>`) wrongly fires the true branch and binds the disqualified
    // element, keying a polyfill to a foreign receiver. only the cheaply-decidable disjoint case
    // bails; an undecidable (null) relation stays permissive / over-emit-safe
    if (concreteInner && fromConstraint
      && pickConditionalBranch({ check: concreteInner, extend: fromConstraint }) === false) return INFER_PATTERN_FALSE;
    // the CONSTRAINT may stand in for an unresolved element only when the conditional is
    // established: a check side merely POSSIBLY assignable (structural object / unknown
    // container) has not taken the true branch, and binding `U` from its constraint keys a
    // narrow to a receiver family the value may never have - the throwing direction. an
    // undecided conditional degrades to no narrow instead
    const inner = concreteInner ?? (familyVerdict === 'match' ? fromConstraint : null);
    if (!inner) return null;
    const inferMap = typeParamMap ? new Map(typeParamMap) : new Map();
    inferMap.set(match.name, inner);
    return substituteTypeParams(node.trueType, inferMap, scope, depth + 1, seen);
  }

  // family tag consumed by `checkTypeMatchesContainerFamily`. the conditional tests `check extends
  // Name<infer U>` - is the check side assignable TO the container. a `string` satisfies only
  // `Iterable`, whose interface needs just `[Symbol.iterator]` (which `String.prototype` has).
  // `Generator` / `IterableIterator` / `IteratorObject` ARE themselves sync iterables too, yet a
  // string is NOT assignable to them: they additionally require `.next()` (Generator also
  // `.return`/`.throw`). `Iterator` adds `.next()` without being iterable; the `Async*` names need
  // `[Symbol.asyncIterator]`. so `Iterable` is the one name a string check side may admit; every
  // other single-element generic (those + Array / Set / Promise) rejects a primitive check side
  function containerInferFamily(name) {
    return name === 'Iterable' ? 'iterable' : 'collection';
  }

  // `infer U extends C` parses as TSInferType wrapping a TSTypeParameter. shared
  // `typeParamName` handles the babel (Identifier-wrapped) / oxc (bare string) name shapes
  // identically with mapped-type's typeParameter binding lookup. constraint is the optional
  // `extends C` annotation (TS 4.7+); plain `infer U` returns `constraint: null`. `family`
  // tags the matched container so the check-type guard can reject disjoint primitive sides
  function extractInferTarget(inferNode, family, container) {
    if (inferNode?.type !== 'TSInferType') return null;
    const param = inferNode.typeParameter;
    const name = typeParamName(param);
    if (typeof name !== 'string') return null;
    return { name, constraint: param?.constraint ?? null, family, container };
  }

  // extracts `{ name, constraint, family }` from `(infer U)[]`, `readonly (infer U)[]`, or
  // `Container<infer U>` where Container is a known single-element generic. returns null
  // otherwise. constraint is the optional `extends C` annotation (TS 4.7+); plain
  // `infer U` returns `constraint: null`
  function matchArrayInferPattern(extendsType) {
    // oxc keeps a parenthesized extends-clause (`(Array<infer U>)`) as TSParenthesizedType where
    // babel strips it - peel so both parsers reach the inner pattern shape
    let node = peelTSParenthesized(unwrapTypeAnnotation(extendsType));
    // peel `readonly X` modifier (TSTypeOperator operator='readonly') but REMEMBER it: the
    // operator form `readonly (infer U)[]` is a readonly pattern like `ReadonlyArray<infer U>`,
    // and a readonly CHECK is assignable to it (TRUE branch) - peeling without the flag made
    // the readonly-vs-mutable rejection below fire on a readonly-to-readonly match
    let readonlyPattern = false;
    if (node?.type === 'TSTypeOperator' && node.operator === 'readonly') {
      readonlyPattern = true;
      node = peelTSParenthesized(node.typeAnnotation);
    }
    if (node?.type === 'TSArrayType') {
      // babel wraps `(infer U)` in TSParenthesizedType; oxc collapses to bare TSInferType.
      // peel the wrapper so both shapes reach the inner inference name. `(infer U)[]` is
      // sugar for `Array<infer U>` - the collection family, Array container
      const match = extractInferTarget(peelTSParenthesized(node.elementType), 'collection', 'Array');
      return match && readonlyPattern ? { ...match, readonlyPattern } : match;
    }
    if (node?.type === 'TSTypeReference') {
      const name = typeRefName(node);
      if (firstTypeParamIsInner(name)) {
        // peeled like the array-sugar entry above: oxc keeps `Array<(infer U)>` type-arg
        // as TSParenthesizedType where babel strips it
        return extractInferTarget(peelTSParenthesized(getTypeArgs(node)?.params?.[0]), containerInferFamily(name), name);
      }
    }
    return null;
  }

  // `isConcreteEmptyShape` stays cluster-private (only consumed by `pickConditionalBranchVia`
  // / `trueBranchSubst` internally). `collectInferredNames` exported for cross-cluster
  // alpha-rename guards (`findConditionalTypeMember` drops infer names from outer subst
  // before walking trueType / falseType branches)
  return {
    // mapped
    mappedTypeKeyName,
    mappedTypeConstraint,
    unwrapMappedTypePassthrough,
    expandMappedTypeMembers,
    // conditional
    evaluateConditionalType,
    pickConditionalBranchVia,
    isUnconstrainedTypeShape,
    collectInferredNames,
    matchTemplatePattern,
    // shared
    typeRefSegmentsEqual,
    dropMapKeys,
    trueBranchSubst,
  };
}
