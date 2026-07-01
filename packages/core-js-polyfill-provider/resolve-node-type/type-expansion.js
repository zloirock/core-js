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
//   conditional: evaluateConditionalType, pickConditionalBranchVia, resolveInferElementPattern,
//                resolveConditionalBranches, isUnconstrainedTypeReference
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
  SINGLE_ELEMENT_COLLECTIONS,
  STRUCTURAL_WALK_SKIP_KEYS,
  literalNodeValue,
  quasiText,
} from './base.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';

// `resolveInferElementPattern` sentinel: the extends clause is a recognised `Container<infer U>`
// pattern AND the check side is a disjoint primitive, so the conditional definitively takes the
// FALSE branch (`string extends Iterator<infer U>` is false - the `infer` means pickConditionalBranch
// can't decide it structurally). distinct from a plain null (pattern not applicable, or check / inner
// type unresolvable) which folds both branches
export const INFER_PATTERN_FALSE = Symbol('infer-pattern-false');

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
  commonType,
  isNullableOrNever,
  typesEqual,
  innersEqual,
  typeRefName,
  typeRefSegments,
  isPromiseRefName,
}) {
  // --- Mapped types ---

  // string-shaped numeric keys (`'0'`, `'42'`) are produced by `getKeyName` when iterating
  // member lists of a `keyof T` source whose underlying T uses numeric indexers. detection
  // matches numeric-literal SHAPE statically; it intentionally over-matches Infinity-shaped keys
  // (`1e999`) rather than a runtime `Number.isFinite` guard (accepted over-emit direction).
  // `constraint` on the mapped type itself. key name is a bare string in babel-parser
  // ASTs and an Identifier in oxc/ESTree. returns null for non-`keyof T` shapes
  function isNumericKeyShape(keyValue) {
    if (typeof keyValue === 'number') return true;
    return typeof keyValue === 'string' && NUMERIC_KEY_SHAPE_RE.test(keyValue);
  }

  // shared cross-parser key resolution for TSMappedType. babel: `node.typeParameter.name`
  // is an Identifier (`name.name` carries the string). oxc/TS-ESTree: `node.key` is the
  // Identifier directly OR a string. callers without constraint check use this helper raw
  function mappedTypeKeyName(node) {
    const keyNameNode = node?.typeParameter?.name ?? node?.key;
    if (!keyNameNode) return null;
    return typeof keyNameNode === 'string' ? keyNameNode : keyNameNode.name ?? null;
  }

  // similar for constraint slot - both parser shapes
  function mappedTypeConstraint(node) {
    return node?.typeParameter?.constraint ?? node?.constraint;
  }

  function parseMappedTypeShape(node) {
    const constraint = mappedTypeConstraint(node);
    const paramName = mappedTypeKeyName(node);
    if (!paramName || !constraint) return null;
    // `[K in keyof T]` - source is T, iterated via getTypeMembers
    if (constraint.type === 'TSTypeOperator' && constraint.operator === 'keyof') {
      return { paramName, source: constraint.typeAnnotation, kind: 'keyof' };
    }
    // `[K in 'a' | 'b']` / `[K in 'a']` - literal union (or single literal) constraint;
    // each literal value drives one synthesized key. supports string + number literals.
    // TSLiteralType wraps the actual literal under `.literal`; literalKeyValue checks the
    // wrapped node directly (StringLiteral / NumericLiteral)
    if (constraint.type === 'TSLiteralType' && literalKeyValue(constraint.literal) !== null) {
      return { paramName, source: constraint, kind: 'literal-union' };
    }
    if (constraint.type === 'TSUnionType' && constraint.types.length
        && constraint.types.every(m => m.type === 'TSLiteralType' && literalKeyValue(m.literal) !== null)) {
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
    // when source IS a type-ref, require body.objectType to be the SAME ref by name. the
    // type-ref-vs-type-ref capture is the bug class - both look like single-segment refs
    // and silently substitute past their lexical scope. non-Ref source (literal, etc.) has
    // a syntactically distinct shape - downstream callers walk it as a structural type, no
    // capture risk. for non-ref source, accept body.objectType as-is (legacy behavior)
    if (typeRefSegments(shape.source)?.length
        && !typeRefSegmentsEqual(shape.source, body.objectType)) return null;
    return body.objectType ?? null;
  }

  // statically evaluate a mapped-type rename template against a single source key.
  // returns the renamed key string, RENAME_SKIP for `as never` / un-matched conditional
  // branches, or null when the template can't be resolved to a literal string
  function evalRenameTemplate(template, paramName, keyValue) {
    if (!template) return null;
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
      if (matched === true) return evalRenameTemplate(template.trueType, paramName, keyValue);
      if (matched === false) return evalRenameTemplate(template.falseType, paramName, keyValue);
      return null;
    }
    return null;
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
    if (extendsType?.type === 'TSAnyKeyword' || extendsType?.type === 'TSUnknownKeyword') return true;
    if (extendsType?.type === 'TSStringKeyword') {
      if (typeof keyValue !== 'string') return false;
      // upstream coerces numeric-literal mapped sources (`[K in 0 | 1]`) to string repr
      // before reaching here, so a stringified numeric `'0'` is indistinguishable from a
      // real string key. per TS spec `0 extends string` is false; signal undecidable so
      // the caller folds both branches rather than over-returning true
      return isNumericKeyShape(keyValue) ? null : true;
    }
    // expand-mapped pipeline coerces numeric-literal sources to string keys before reaching
    // here; `isNumericKeyShape` matches numeric-string keys as well as actual numbers,
    // preserving `K extends number` precision. edge `'0' | 1` conflated to number - over-emit
    // direction safe for polyfill detection
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
  // and keyof source paths. nameType present but unevaluable splits into two outcomes:
  //   RENAME_SKIP        - explicit `as never` / mismatched conditional, drop key
  //   non-string (null)  - rename undecidable for THIS key (e.g. union with a partially-
  //                        unresolvable TypeReference branch). drop key from the partial
  //                        expansion: decidable keys still narrow, undecidable fall through
  //                        to generic dispatch. safe upper bound - never includes a key that
  //                        user-rename would exclude
  function buildMappedMember({ node, paramName, keyName, substValue, body }) {
    const renamed = node.nameType ? evalRenameTemplate(node.nameType, paramName, keyName) : keyName;
    if (renamed === RENAME_SKIP || typeof renamed !== 'string') return null;
    const subst = new Map([[paramName, substValue]]);
    return {
      type: 'TSPropertySignature',
      key: { type: 'Identifier', name: renamed },
      computed: false,
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
      const literals = sourceType.type === 'TSLiteralType' ? [sourceType] : sourceType.types;
      for (const lit of literals) {
        const keyName = String(literalKeyValue(lit.literal));
        const member = buildMappedMember({ node, paramName: shape.paramName, keyName, substValue: lit, body });
        if (member) out.push(member);
      }
      return out;
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
      const keyName = getKeyName(m.key);
      // null key signals "not statically evaluable" - bail entire expansion (a member we
      // can't name leaves the mapped result indeterminate). private (`#priv`) members are
      // EXCLUDED from `keyof T` per TS spec, so skip-but-continue: they don't leak through
      // mapped expansion and shouldn't sink the rest of the result with them
      if (keyName === null) return null;
      if (keyName.startsWith('#')) continue;
      const member = buildMappedMember({
        node, paramName: shape.paramName, keyName, substValue: literalTypeFromKeyName(keyName), body,
      });
      if (member) out.push(member);
    }
    return out;
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
      const name = node.typeParameter?.name?.name ?? node.typeParameter?.name;
      if (typeof name === 'string') into.add(name);
      if (node.typeParameter?.constraint) collectInferredNames(node.typeParameter.constraint, into, depth + 1);
      return into;
    }
    // nested conditional binds its own infer scope - stop the walk so its trueType-only
    // names don't bleed into the outer extendsType's collector
    if (node.type === 'TSConditionalType') return into;
    for (const key of Object.keys(node)) {
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

  // to Foo for member-dispatch (TS narrowing strips null/undefined from value-position
  // unions; conditional type fold does the same for member-lookup purposes). when both
  // branches strip out, return null (caller falls through to generic dispatch)
  function resolveConditionalBranches(trueBranch, falseBranch) {
    const trueViable = trueBranch && !isNullableOrNever(trueBranch) ? trueBranch : null;
    const falseViable = falseBranch && !isNullableOrNever(falseBranch) ? falseBranch : null;
    if (trueViable && falseViable) return commonType(trueViable, falseViable);
    return trueViable ?? falseViable;
  }

  // pre-fold structural evaluation of `T extends U ? trueType : falseType`. returns:
  //   true  - the conditional fires unambiguously to its true-branch
  //   false - fires unambiguously to its false-branch (concrete-disjoint check sides)
  //   null  - cannot decide statically (sub-type relations across different outer
  //           constructors, concrete-shape extends like empty tuple `[]`, or check
  //           side unconstrained against a concrete extend). caller falls back to
  //           widened branch folding so we never silently mis-pick a branch.
  // `extendNode` is the raw AST extends-side: lets us distinguish `Array` (TSTypeReference
  // without typeArguments == Array<any>, matches any concrete inner) from concrete-shape
  // forms that ALSO post-subst as `$Object('Array', null)` (`[]` empty tuple - non-empty
  // tuples do NOT extend `[]`)
  // AST-level conditional branch picker for findTypeMember (which works on AST nodes,
  // not resolved $Primitive / $Object types). complementary to `pickConditionalBranch` -
  // operates on AST shape after subst applied, so literal-type precision (`'narrow'`
  // vs primitive `string`) is preserved. returns true / false / null (undecidable)
  function pickConditionalBranchByAST(check, extend) {
    if (!check || !extend) return null;
    check = peelTSParenthesized(check);
    extend = peelTSParenthesized(extend);
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

  // `extendIsUnconstrained` reflects POST-SUBST AST shape: caller computes via
  // `isUnconstrainedTypeReference(node, typeParamMap?)` (map omitted when AST is already
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
    // a folded literal union (`'a' | 'b'`, from commonType merging distinct literal branches) is OPAQUE -
    // its members are not retained. `checkNarrow` / `extendNarrow` flag the narrow (single literal OR such
    // a union) sides; a bare keyword (`string`) is NOT narrow
    const checkNarrow = check.literalUnion || check.literal !== undefined;
    const extendNarrow = extend.literalUnion || extend.literal !== undefined;
    // both sides narrow with at least one OPAQUE union -> undecidable (some members may extend the other,
    // others not, and the members are unrecoverable) -> fold both branches via null. guard before the
    // literal rules so a union is never read as a single literal or, below, as a bare keyword
    if ((check.literalUnion || extend.literalUnion) && checkNarrow && extendNarrow) return null;
    // literal precision: `2 extends 1` is false even though both widen to `number`. resolveLiteralType
    // stamps each side's source literal; two single literals are disjoint unless strictly equal (cross-
    // family `2` vs `'2'` too). a union side is excluded above; a bare-keyword side has no stamp and folds
    // through the family rules below. mirrors pickConditionalBranchByAST's literal comparison
    if (check.literal !== undefined && extend.literal !== undefined) return check.literal === extend.literal;
    // wide-vs-narrow: a bare-keyword (or otherwise non-narrow) check is NOT assignable to a NARROWER target
    // - a single literal (`string extends "a"`) OR a literal union (`string extends 'a' | 'b'`) - so it
    // takes the FALSE branch. the reverse (`"a" extends string`) is true and folds through the family rules
    if (extendNarrow && !checkNarrow) return false;
    if (typesEqual(check, extend)) {
      if (innersEqual(check.inner, extend.inner)) return true;
      // extends has no inner constraint. three sub-cases distinguished by caller-supplied flags:
      //   - unparameterised TSTypeReference (`Array` -> `Array<any>`): matches any inner
      //   - concrete-empty AST (`[]` empty tuple): structurally distinct from non-empty
      //     check, picks falseBranch per TS spec
      //   - post-resolve inner-less (e.g., `[infer X, X]` where infer doesn't resolve to
      //     a concrete inner): undecidable - infer pattern may still match, fall back to
      //     fold-both-branches via null return
      if (!extend.inner) {
        if (extendIsUnconstrained) return true;
        if (check.inner && extendIsConcreteEmpty) return false;
        return null;
      }
      // check side unconstrained against a concrete extend - can't statically decide
      if (!check.inner) return null;
      // both concrete, differing inners (Array<number> vs Array<string>): disjoint
      return false;
    }
    // non-primitive check (Array / Map / Promise / ...) vs primitive extend (string / number /
    // never / null / ...): disjoint per TS structural subtyping. object types can't extend
    // primitives. subsumes the `extends never` case (never is primitive) - generic rule with
    // narrower never special-case both yield falseBranch for non-never object check
    if (!check.primitive && extend.primitive) return false;
    // primitive check (string / number / ...) vs concrete-Object extend (Array<X> / Map / ...):
    // disjoint. EXCEPT wide-Object extend (`Object` keyword resolves to $Object(null)) where
    // boxing makes `string extends Object` TRUE per TS spec - guarded by extend.constructor
    if (check.primitive && !extend.primitive && extend.constructor !== null) return false;
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
  function pickConditionalBranchVia({ checkAST, extendsAST, resolveOne, isUnconstrained }) {
    // resolveOne collapses TSTemplateLiteralType to $Primitive('string') - downstream
    // pickConditionalBranch then sees string-vs-string and returns true. short-circuit
    // to undecidable on either side so the caller folds both branches instead of
    // over-picking through a stripped template
    if (isTemplateLiteralExtend(checkAST) || isTemplateLiteralExtend(extendsAST)) return null;
    const astPick = pickConditionalBranchByAST(checkAST, extendsAST);
    if (astPick !== null) return astPick;
    return pickConditionalBranch({
      check: resolveOne(checkAST),
      extend: resolveOne(extendsAST),
      extendIsUnconstrained: isUnconstrained,
      extendIsConcreteEmpty: isConcreteEmptyShape(extendsAST),
    });
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
  function isUnconstrainedTypeReference(node, typeParamMap = null) {
    if (!node) return false;
    const target = peelTSParenthesized(node);
    if (target?.type !== 'TSTypeReference' && target?.type !== 'GenericTypeAnnotation') return false;
    if (getTypeArgs(target)?.params?.length) return false;
    if (!typeParamMap) return true;
    const name = typeRefName(target);
    return !name || !typeParamMap.has(name);
  }

  // resolve `T extends U ? trueType : falseType` post-subst:
  //   1) narrow `(infer U)[]` / `Array<infer U>` short-circuit (resolveInferElementPattern)
  //   2) structural eval via pickConditionalBranch - lazy: substitute only the chosen branch
  //   3) fall through to resolveConditionalBranches's commonType / never-strip fold
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
    // TSConditionalType handling. falseType doesn't see infer bindings - keeps outer map
    const trueMap = trueBranchSubst(node.extendsType, typeParamMap);
    function recurse(branchNode, map) {
      return substituteTypeParams(branchNode, map, scope, depth + 1, seen);
    }
    // RAW AST + Type-object map path: substituteTypeParams resolves through typeParamMap.
    // pass raw AST + map to isUnconstrainedTypeReference so typeparam refs that bind via the
    // map are NOT misclassified as unconstrained
    const branch = pickConditionalBranchVia({
      checkAST: node.checkType,
      extendsAST: node.extendsType,
      resolveOne: ast => recurse(ast, typeParamMap),
      isUnconstrained: isUnconstrainedTypeReference(node.extendsType, typeParamMap),
    });
    if (branch !== null) return recurse(branch ? node.trueType : node.falseType, branch ? trueMap : typeParamMap);
    return resolveConditionalBranches(
      recurse(node.trueType, trueMap),
      recurse(node.falseType, typeParamMap));
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
  // disjointness is enforced (the unsound direction the finding targets). a `string` is assignable
  // ONLY to `Iterable<string>` - the minimal interface needing just `[Symbol.iterator]` - so only
  // the sync `Iterable` family admits a string check side; it is not assignable to Array / Set /
  // Promise nor to the stricter iterator/generator interfaces (see `containerInferFamily`). object
  // check types are admitted for the permissive `Iterable` family or an unresolved container, but
  // otherwise must match the pattern's base container family (`Set` against `Array<infer U>` stays
  // disjoint); see the branch below
  function checkTypeMatchesContainerFamily(checkType, family, container) {
    if (!checkType?.primitive) {
      // a non-primitive check side must be assignable to `container<U>` for `infer U` to bind. an
      // `Iterable<infer U>` admits any iterable; otherwise the check side's container must MATCH the
      // pattern's (`Set<string>` against `Array<infer U>` is disjoint -> conditional FALSE, so the
      // false branch resolves precisely instead of binding U=string -> wrong helper variant). Array
      // and ReadonlyArray share element semantics (interchangeable); an unrecognised structural object
      // or an unknown pattern container stays permissive (could be assignable; over-emit-safe)
      if (family === 'iterable' || !checkType.constructor || !container) return true;
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
      return base(checkType.constructor) === base(container);
    }
    return family === 'iterable' && checkType.type === 'string';
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
    if (!checkTypeMatchesContainerFamily(checkType, match.family, match.container)) return INFER_PATTERN_FALSE;
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
    const inner = concreteInner ?? fromConstraint;
    if (!inner) return null;
    const inferMap = typeParamMap ? new Map(typeParamMap) : new Map();
    inferMap.set(match.name, inner);
    return substituteTypeParams(node.trueType, inferMap, scope, depth + 1, seen);
  }

  // `Container<infer U>` is a recognised narrow pattern when the container's `.inner`
  // slot semantically stores its type parameter - exactly the set of `SINGLE_ELEMENT_COLLECTIONS`
  // plus Promise (and its structural synonyms, which alias to Promise via `resolveNamedType`)
  function isInferContainerName(name) {
    return SINGLE_ELEMENT_COLLECTIONS.has(name) || isPromiseRefName(name);
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
    let node = unwrapTypeAnnotation(extendsType);
    // peel `readonly X` modifier (TSTypeOperator operator='readonly')
    if (node?.type === 'TSTypeOperator' && node.operator === 'readonly') node = node.typeAnnotation;
    if (node?.type === 'TSArrayType') {
      // babel wraps `(infer U)` in TSParenthesizedType; oxc collapses to bare TSInferType.
      // peel the wrapper so both shapes reach the inner inference name. `(infer U)[]` is
      // sugar for `Array<infer U>` - the collection family, Array container
      return extractInferTarget(peelTSParenthesized(node.elementType), 'collection', 'Array');
    }
    if (node?.type === 'TSTypeReference') {
      const name = typeRefName(node);
      if (isInferContainerName(name)) {
        return extractInferTarget(getTypeArgs(node)?.params?.[0], containerInferFamily(name), name);
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
    resolveInferElementPattern,
    resolveConditionalBranches,
    isUnconstrainedTypeReference,
    collectInferredNames,
    // shared
    typeRefSegmentsEqual,
    dropMapKeys,
    trueBranchSubst,
  };
}
