import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { entryToGlobalHint } from './index.js';
import { walkStaticReceiverChain } from './detect-usage/destructure.js';
import { POSSIBLE_GLOBAL_OBJECTS, globalProxyMemberName } from './helpers/class-walk.js';
import {
  getSuperTypeArgs,
  getTypeArgs,
  peelFallbackWrappers,
  singleQuasiString,
  TS_EXPR_WRAPPERS,
  unwrapExportedDeclaration,
  unwrapExpressionChain,
  unwrapParens,
  unwrapRuntimeExpr,
} from './helpers/ast-patterns.js';
import {
  $Object,
  $Primitive,
  MAX_DEPTH,
  PATTERN_WRAPPERS,
  PRIMITIVE_WRAPPERS,
  PRIMITIVES,
  SINGLE_ELEMENT_COLLECTIONS,
  TYPE_HINTS,
  TYPEOF_HINT_GROUPS,
  UNBOXED_PRIMITIVES,
} from './resolve-node-type-base.js';

const {
  constructors: KNOWN_CONSTRUCTORS,
  globalMethods: KNOWN_GLOBAL_METHOD_RETURN_TYPES,
  globalProperties: KNOWN_GLOBAL_PROPERTY_RETURN_TYPES,
  staticMethods: KNOWN_STATIC_METHOD_RETURN_TYPES,
  staticProperties: KNOWN_STATIC_PROPERTY_RETURN_TYPES,
  instanceMethods: KNOWN_INSTANCE_METHOD_RETURN_TYPES,
  instanceProperties: KNOWN_INSTANCE_PROPERTY_RETURN_TYPES,
  staticTypeGuards: KNOWN_STATIC_TYPE_GUARDS,
} = knownBuiltInReturnTypes;

const { assign, create, hasOwn } = Object;

// thin binding adapter for `walkStaticReceiverChain` (detect-usage/destructure.js) so the
// resolver layer can reuse the shared walker. babel scopes expose getBinding directly;
// `binding.path.node` carries the VariableDeclarator. matches the babel-plugin adapter's
// shape minus the polyfillHint / TS-runtime extras the resolver doesn't need
const BABEL_BINDING_ADAPTER = {
  hasBinding: (scope, name) => !!scope?.getBinding(name),
  getBindingNodeType: (scope, name) => scope?.getBinding(name)?.path?.node?.type,
  getBinding: (scope, name) => scope?.getBinding(name),
};

// side-channel cycle flag: Set instances that hit a declaration-cycle during a walk.
// per-walk, keyed on the decl-set's identity so parent frames can detect cycles without
// a monkey-patched `.hadCycle` property (which would be lost on any defensive clone)
const cycleSeenSets = new WeakSet();

// get-or-init nested Map inside a WeakMap/Map container. used by two-level caches where
// outer key is an AST node / scope / matchType and inner key is a string / secondary id
function getOrInitMap(container, key) {
  let inner = container.get(key);
  if (!inner) {
    inner = new Map();
    container.set(key, inner);
  }
  return inner;
}

// snapshot the pre-call cycle state; returned predicate reports whether the flag flipped
// during the caller's work. used by interface/class `extends` walks to distinguish "no
// parent matched" (safe fallback to $Object) from "cyclic extends poisoned the result"
// (must NOT fall back - returns null so the generic polyfill plugin stays emitted)
function cycleFlipDetector(visited) {
  const preCycle = cycleSeenSets.has(visited);
  return () => !preCycle && cycleSeenSets.has(visited);
}

// eslint-disable-next-line max-statements -- factory of type inference engine
function createResolveNodeType(babelNodeType, t, { getPolyfillBindingEntry = () => null } = {}) {
  // --- AST walkers & predicates ---
  // get the primitive type name, unboxing wrapper objects: $Object('String') -> 'string', $Primitive('number') -> 'number'
  function primitiveTypeOf(type) {
    return type?.primitive ? type.type : UNBOXED_PRIMITIVES[type?.constructor] ?? null;
  }

  // value-typed literal predicate. `kind` matches the Babel-shaped name (`String`/`Numeric`/...).
  // both ESTree (oxc) and Babel route through `babelNodeType` which normalises ESTree's `Literal`
  // discriminator + value-type sniffing into the Babel name. callers stay parser-agnostic
  function isLiteralOf(node, kind) {
    return babelNodeType(node) === `${ kind }Literal`;
  }

  function literalKeyValue(node) {
    if (isLiteralOf(node, 'String')) return node.value;
    if (isLiteralOf(node, 'Numeric')) return String(node.value);
    return null;
  }

  // statically-known property name from a Member/OptionalMemberExpression. accepts:
  //   - non-computed Identifier (`obj.x`)
  //   - computed string/numeric literal (`obj['x']` / `obj[0]`) - cross-parser via
  //     `literalKeyValue` (babel: StringLiteral/NumericLiteral, ESTree/oxc: Literal+typeof)
  //   - computed single-quasi TemplateLiteral (`obj[`x`]`) via `singleQuasiString`
  // returns null for dynamic shapes (Identifier alias, BinaryExpression concat, MemberExpression
  // chain, computed expressions). callers wanting alias-chain / enum / Symbol resolution should
  // route through `resolveComputedKeyName` (scope-aware) or `indexedAccessKey` (TS-position)
  function getMemberProperty(node) {
    if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
    const { property, computed } = node;
    if (!computed) return property?.type === 'Identifier' ? property.name : null;
    return literalKeyValue(property) ?? singleQuasiString(property);
  }

  function getKeyName(key) {
    if (key?.type === 'Identifier') return key.name;
    // `#` prefix keeps private keys disjoint from same-named public members at match time
    if (key?.type === 'PrivateIdentifier') return `#${ key.name }`;
    if (key?.type === 'PrivateName') return `#${ key.id.name }`;
    return literalKeyValue(key);
  }

  // T["key"] / T[0] / T[`key`] index literal - unwrap TSLiteralType; fall through template-literal
  // for parity with computed-member resolution. null for non-literal / keyof / union indexes
  function indexedAccessKey(indexType) {
    const literal = indexType?.type === 'TSLiteralType' ? indexType.literal : indexType;
    return literalKeyValue(literal) ?? singleQuasiString(literal);
  }

  // ObjectExpression { key: value, ... } -> value's type for the literal key.
  // Spread bails (unknown key coverage); method shorthand resolves to Function
  function resolveObjectLiteralProperty(argPath, key) {
    // peel ParenthesizedExpression / TS expression wrappers (`as const`, `satisfies T`,
    // `<T>x` casts). oxc preserves parens around call-args (`fn(({k: [1]} as const))`)
    // while babel strips them - without this peel, oxc-parsed sources fall to constraint
    // fallback and lose precision (parser-divergence asymmetry between plugins)
    if (argPath?.node) argPath = resolveRuntimeExpression(argPath);
    // `T[N]` where T is bound to a concrete tuple/array LITERAL at the call-site:
    // `first<T extends [unknown, unknown]>(t: T): T[0]` called with `[['x'], 1]` as arg -
    // element 0 is a known ArrayExpression, resolve it to that type. without this branch
    // the generic substitution path falls back to T's constraint (`[unknown, unknown]`)
    // and element 0 resolves to `unknown`
    if (argPath?.node?.type === 'ArrayExpression') {
      const index = typeof key === 'number' ? key : Number(key);
      if (!Number.isInteger(index) || index < 0) return null;
      const elements = argPath.get('elements');
      const elementPath = elements[index];
      if (!elementPath?.node || elementPath.node.type === 'SpreadElement') return null;
      return resolveNodeType(elementPath);
    }
    if (argPath?.node?.type !== 'ObjectExpression') return null;
    for (const prop of argPath.get('properties')) {
      const { node } = prop;
      if (node.type === 'SpreadElement') return null;
      if (node.computed || getKeyName(node.key) !== key) continue;
      // babel-only `ObjectMethod` shorthand: `{ foo() {...} }`. oxc emits `Property { value: FunctionExpression }`
      // and falls through to `resolveNodeType(prop.get('value'))` which returns Function via FunctionExpression
      if (babelNodeType(node) === 'ObjectMethod') return new $Object('Function');
      return resolveNodeType(prop.get('value'));
    }
    return null;
  }

  // [key] where key is a string/number literal, a const binding (chain) to one, or an
  // enum member access (`obj[Enum.A]` - enum members carry static literals at known slots)
  function resolveComputedKeyName(key, scope, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    const literal = literalKeyValue(key);
    if (literal !== null) return literal;
    if (!scope) return null;
    if (key?.type === 'Identifier') {
      const binding = scope.getBinding?.(key.name);
      if (!binding || binding.constantViolations?.length) return null;
      const decl = binding.path;
      if (!t.isVariableDeclarator(decl.node) || !decl.node.init) return null;
      return resolveComputedKeyName(decl.node.init, decl.scope ?? scope, depth + 1);
    }
    // `Enum.A` - TSEnumDeclaration lookup via findTypeDeclaration (scope-chain walk),
    // not scope.getBinding - estree-toolkit adapter doesn't register enum bindings the
    // same way babel does; type-declaration walker works uniformly for both
    const memberName = getMemberProperty(key);
    if (memberName !== null && key.object?.type === 'Identifier') {
      const enumDecl = findEnumDeclaration(key.object.name, scope);
      if (enumDecl) {
        const member = findEnumMember(enumDecl, memberName);
        const initValue = member?.initializer ? literalKeyValue(member.initializer) : null;
        if (initValue !== null) return initValue;
      }
    }
    return null;
  }

  function keyMatchesName(key, name) {
    return getKeyName(key) === name;
  }

  function isMemberLike(path) {
    return t.isMemberExpression(path.node) || t.isOptionalMemberExpression(path.node);
  }

  // ambient TS / Flow declarations alongside runtime functions/classes - they all carry
  // `returnType` / `typeParameters`, so the same code paths work for both
  // splitting into sets keeps the predicates terse and lets us reuse the membership checks
  const AMBIENT_FUNCTION_TYPES = new Set([
    'TSDeclareFunction',
    'TSDeclareMethod',
    'DeclareFunction',
    'DeclareMethod',
  ]);

  const AMBIENT_FN_OR_CLASS_DECLARATION_TYPES = new Set([
    'TSDeclareFunction',
    'DeclareFunction',
    'DeclareClass',
  ]);

  function isFunctionLike(node) {
    return !!node && (t.isFunction(node) || AMBIENT_FUNCTION_TYPES.has(node.type));
  }

  function isFunctionOrClassDeclaration(node) {
    return !!node && (t.isFunctionDeclaration(node) || t.isClassDeclaration(node)
      || AMBIENT_FN_OR_CLASS_DECLARATION_TYPES.has(node.type));
  }

  // walk enclosing statement lists collecting ambient declaration paths matching `name`.
  // `firstMatch=true` short-circuits at the first hit (legacy single-result path);
  // `firstMatch=false` collects ALL matches across the scope chain (used for multi-overload
  // disambiguation - e.g. `isStr(x: number): boolean; isStr(x): asserts x is string;` where
  // only one sibling carries the predicate of interest)
  function walkAmbientDeclarationPath(name, scope, matchType, firstMatch = true) {
    const out = firstMatch ? null : [];
    for (let cur = scope; cur; cur = cur.parent) {
      // Program / BlockStatement / TSModuleBlock - `path.get('body')` already returns the
      // statement array. Function / method scopes wrap statements in a BlockStatement, so
      // `path.get('body')` returns the BlockStatement path; drill once more to reach the
      // array. Without this, ambient declarations inside function bodies
      // (`function f() { declare function g(): T }`) aren't discovered, falling through to
      // generic resolution. Mirrors `walkScopesForDecl`'s `block.body.body` for non-Program.
      // estree-toolkit may emit a bodyless scope owner (e.g. SwitchCase `consequent` array,
      // for-statement init slots) whose drill-once `.get('body')` lands on a null NodePath -
      // skip such scopes rather than crash on `.get` over null
      let bodyPaths = cur.path?.get('body');
      if (bodyPaths && !Array.isArray(bodyPaths)) {
        bodyPaths = bodyPaths.node ? bodyPaths.get('body') : null;
      }
      if (!Array.isArray(bodyPaths)) continue;
      for (const stmtPath of bodyPaths) {
        const { type } = stmtPath.node ?? {};
        const declPath = type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration'
          ? stmtPath.get('declaration') : stmtPath;
        const { node } = declPath;
        if (node?.id?.name !== name || !matchType(node)) continue;
        if (firstMatch) return declPath;
        out.push(declPath);
      }
    }
    return firstMatch ? null : out;
  }

  // Babel doesn't register ambient `declare function/class` in `scope.bindings`; scan
  // enclosing statement lists instead. `matchType` picks the ambient kind we want.
  // keyed by (scope, matchType, name) - matchType references are module-level constants,
  // safe Map keys; inner Map uses string name
  let ambientDeclCache = new WeakMap();
  function findAmbientDeclarationPath(name, scope, matchType) {
    if (!scope) return null;
    const byName = getOrInitMap(getOrInitMap(ambientDeclCache, scope), matchType);
    if (byName.has(name)) return byName.get(name);
    const result = walkAmbientDeclarationPath(name, scope, matchType);
    byName.set(name, result);
    return result;
  }

  // collect all ambient function decls by name. used for multi-overload predicate
  // resolution where the FIRST ambient match may carry a non-predicate signature, but a
  // later sibling carries the asserts/predicate of interest. shape mirrors
  // `findAmbientDeclarationPath` but returns an array (uncached - rare path)
  function findAmbientFunctionPaths(name, scope) {
    return walkAmbientDeclarationPath(name, scope, isAmbientFunctionNode, false) ?? [];
  }

  // TS `declare class X` is parsed as ClassDeclaration { declare: true }, not DeclareClass
  const isAmbientFunctionNode = node => node?.type === 'TSDeclareFunction' || node?.type === 'DeclareFunction';
  const isAmbientClassNode = node => node?.type === 'DeclareClass'
    || (node?.type === 'ClassDeclaration' && node.declare === true);
  const isAmbientFunctionOrClassNode = node => isAmbientFunctionNode(node) || isAmbientClassNode(node);
  const findAmbientFunctionPath = (name, scope) => findAmbientDeclarationPath(name, scope, isAmbientFunctionNode);
  // `declare class X { ... }` - babel doesn't bind the name as a value (unlike runtime
  // `class X`), so `resolveRuntimeExpression(X)` returns the bare Identifier. without an
  // ambient lookup, `X.staticMethod()` skips the class-member resolution path entirely
  // and falls through to `findTypeMember`'s synthetic TSFunctionType stub (return-type-less).
  // estree-toolkit registers the binding regardless of `declare`, hence the cross-pipeline
  // asymmetry seen in `audit-declare-static-generic-call` / `audit-extends-renamed-typeparam-static`
  const findAmbientClassPath = (name, scope) => findAmbientDeclarationPath(name, scope, isAmbientClassNode);

  // resolve variable references and unwrap transparent TS expression wrappers to reach the actual runtime value
  // iterates: after unwrapping a TS wrapper, the underlying expression may be another variable reference
  // `x as Type`, `x!`, `x satisfies Type`
  function resolveRuntimeExpression(path) {
    let depth = MAX_DEPTH;
    while (depth-- && path.node) {
      path = resolvePath(path);
      if (!path.node) break;
      const { type } = path.node;
      if (type === 'TSAsExpression'
        || type === 'TSTypeAssertion'
        || type === 'TSSatisfiesExpression'
        || type === 'TSNonNullExpression'
        || type === 'TSInstantiationExpression'
        || type === 'TypeCastExpression'
        || type === 'ParenthesizedExpression'
        || type === 'ChainExpression') {
        path = path.get('expression');
      } else break;
    }
    return path;
  }

  function isRestBinding(elements, varName) {
    for (const element of elements) {
      if (element?.type === 'RestElement' && element.argument?.type === 'Identifier' && element.argument.name === varName) return true;
    }
    return false;
  }

  function unwrapTypeAnnotation(node) {
    if (!node) return null;
    if (node.type === 'TSTypeAnnotation' || node.type === 'TypeAnnotation') return unwrapTypeAnnotation(node.typeAnnotation);
    return node;
  }

  // peel transparent paren wrappers from a TYPE annotation. oxc preserves `(T)` shape as
  // `TSParenthesizedType` AST node (babel strips it during parsing). callers that pattern-
  // match on the inner type's discriminator (`TSUnionType` / `TSIntersectionType` / etc.)
  // must peel first or paren-wrapped shapes leak past the dispatch
  function peelTSParenthesized(node) {
    while (node?.type === 'TSParenthesizedType') node = node.typeAnnotation;
    return node;
  }

  // `function fn(x = 'a')` - default wraps param in AssignmentPattern; type is on `.left`.
  // `function fn(...xs: T[])` - RestElement carries `T[]` annotation; caller must unwrap one level
  function effectiveParam(param) {
    if (!param) return { param: null, isRest: false };
    if (param.type === 'AssignmentPattern') return { param: param.left, isRest: false };
    if (param.type === 'RestElement') return { param, isRest: true };
    return { param, isRest: false };
  }

  // sentinel for `as never` / unmatched conditional (TS filters the member out of the result).
  // distinct from `null` (which means the template is statically un-evaluable -> bail expansion)
  const RENAME_SKIP = Symbol('rename-skip');

  // intrinsic TS string transformers (`Uppercase<S>` / `Capitalize<S>` / ...)
  const INTRINSIC_STRING_TRANSFORMERS = {
    Uppercase: s => s.toUpperCase(),
    Lowercase: s => s.toLowerCase(),
    Capitalize: s => s.charAt(0).toUpperCase() + s.slice(1),
    Uncapitalize: s => s.charAt(0).toLowerCase() + s.slice(1),
  };

  // cooked text of a TemplateElement quasi; raw fallback covers post-ES2018 invalid escapes
  // where cooked is null (rare in type-level templates but cheap to handle)
  const quasiText = q => q?.value?.cooked ?? q?.value?.raw ?? '';

  // shared shape extraction for `{ [K in keyof T] ... }`. Babel nests `typeParameter:
  // TSTypeParameter { name, constraint }`; oxc/TS-ESTree flattens to `key: Identifier` +
  // `constraint` on the mapped type itself. key name is a bare string in babel-parser
  // ASTs and an Identifier in oxc/ESTree. returns null for non-`keyof T` shapes
  function parseMappedTypeShape(node) {
    const constraint = node.typeParameter?.constraint ?? node.constraint;
    const keyNameNode = node.typeParameter?.name ?? node.key;
    const paramName = typeof keyNameNode === 'string' ? keyNameNode : keyNameNode?.name;
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

  // detect the trivial passthrough mapped type `{ [K in keyof T]: T[K] }` and return T.
  // `readonly` / `optional` / `-readonly` / `-?` modifiers don't change the member set, only
  // descriptor flags, so we let them through; `nameType` (key remap via `as`) does rename and blocks
  function unwrapMappedTypePassthrough(node) {
    if (!node || node.type !== 'TSMappedType') return null;
    if (node.nameType || !node.typeAnnotation) return null;
    const shape = parseMappedTypeShape(node);
    if (!shape) return null;
    const body = node.typeAnnotation;
    if (body.type !== 'TSIndexedAccessType') return null;
    const indexParam = body.indexType;
    if (indexParam?.type !== 'TSTypeReference' || indexParam.typeName?.type !== 'Identifier'
      || indexParam.typeName.name !== shape.paramName) return null;
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
      const matched = matchesConditionalPattern(template.checkType, template.extendsType, paramName, keyValue);
      if (matched === true) return evalRenameTemplate(template.trueType, paramName, keyValue);
      if (matched === false) return evalRenameTemplate(template.falseType, paramName, keyValue);
      return null;
    }
    return null;
  }

  // `K extends 'a' ? ... : ...` - true when keyValue equals the extendsType literal.
  // `K extends string ? ... : ...` - always true (keyof yields string-assignable keys).
  // `K extends `${...}` ? ... : ...` - pattern-match keyValue against the template literal.
  // `K extends 'a' | 'b' ? ... : ...` - any-branch match.
  // returns null when the pattern can't be statically decided (caller bails)
  function matchesConditionalPattern(checkType, extendsType, paramName, keyValue) {
    if (checkType?.type !== 'TSTypeReference' || checkType.typeName?.name !== paramName) return null;
    if (extendsType?.type === 'TSStringKeyword' || extendsType?.type === 'TSAnyKeyword'
      || extendsType?.type === 'TSUnknownKeyword') return true;
    if (templateLiteralTypeParts(extendsType)) return matchTemplatePattern(extendsType, keyValue);
    if (extendsType?.type === 'TSLiteralType') {
      const expected = literalKeyValue(extendsType.literal);
      return expected === null ? null : keyValue === expected;
    }
    if (extendsType?.type === 'TSUnionType') {
      let result = false;
      for (const branch of extendsType.types) {
        const m = matchesConditionalPattern(checkType, branch, paramName, keyValue);
        if (m === true) return true;
        if (m === null) result = null;
      }
      return result;
    }
    return null;
  }

  // per-placeholder segment validators. table is the single source of truth for which
  // `${T}` placeholder types are statically decidable. extending support to `${bigint}` /
  // `${boolean}` is one entry each. unsupported types (booleans, type references, etc.)
  // are absent from the table - caller bails on lookup miss to keep rename undecidable.
  // `${number}`: regex enforces TS number-literal syntax, `Number.isFinite` guards Infinity
  // / NaN edge cases the regex alone would mis-classify
  const NUMBER_LITERAL_RE = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  const PLACEHOLDER_VALIDATORS = {
    TSStringKeyword: () => true,
    TSNumberKeyword: segment => NUMBER_LITERAL_RE.test(segment) && Number.isFinite(Number(segment)),
  };

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

  // expand a mapped type to a flat member list. two shapes:
  //   `{ [K in keyof T as RENAME(K)]: BODY }` - rename clause renames each source key
  //   `{ [K in keyof T]: BODY }`              - no rename, source key passes through;
  //     covers non-passthrough bodies (`number[]`, `T[K][]`, `Promise<T[K]>`) that
  //     `unwrapMappedTypePassthrough` rejects (it requires body === `T[K]` exactly)
  // for each literal key k of T, synthesize `{ key: renamed(k), typeAnnotation: BODY[K -> k] }`.
  // bails (returns null) for any non-statically-evaluable shape so the caller falls back
  // to the previous behaviour (no narrow). callers must apply outer T-subst BEFORE invoking
  // (the substituted source type's keys must be statically enumerable)
  // synth an AST literal type node wrapping a string key — used as the substitution value
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
  function buildMappedMember(node, paramName, keyName, substValue, body) {
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

  function expandMappedTypeMembers(node, scope, depth, visited) {
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
        const member = buildMappedMember(node, shape.paramName, keyName, lit, body);
        if (member) out.push(member);
      }
      return out;
    }
    // `keyof T` constraint: enumerate T's members, synth literal-type for each key name
    const sourceType = unwrapTypeAnnotation(shape.source);
    if (!sourceType) return null;
    const sourceMembers = getTypeMembers(sourceType, scope, depth + 1, visited);
    if (!sourceMembers) return null;
    for (const m of sourceMembers) {
      if (m.computed) return null;
      const keyName = getKeyName(m.key);
      if (keyName === null || keyName.startsWith('#')) return null;
      const member = buildMappedMember(node, shape.paramName, keyName, literalTypeFromKeyName(keyName), body);
      if (member) out.push(member);
    }
    return out;
  }

  // decompose a type reference into its dotted segments. `Foo` -> ['Foo'],
  // `NS.Data` -> ['NS', 'Data'], `A.B.T` -> ['A', 'B', 'T']. Returns null when the
  // reference uses a non-identifier head (e.g. an `import("...").Type` form)
  function typeRefSegments(node) {
    if (!node) return null;
    const head = node.type === 'TSTypeReference' ? node.typeName
      : node.type === 'GenericTypeAnnotation' ? node.id : null;
    return collectQualifiedSegments(head);
  }

  // walk a possibly-qualified name node into a [first, ..., last] segment list
  // returns null on any non-identifier link in the chain
  function collectQualifiedSegments(node) {
    if (node?.type === 'Identifier') return [node.name];
    if (node?.type !== 'TSQualifiedName' && node?.type !== 'QualifiedTypeIdentifier') return null;
    const left = collectQualifiedSegments(node.left ?? node.qualification);
    const right = node.right ?? node.id;
    if (!left || right?.type !== 'Identifier') return null;
    left.push(right.name);
    return left;
  }

  function typeRefName(node) {
    const segments = typeRefSegments(node);
    return segments?.length === 1 ? segments[0] : null;
  }

  function isTypeAlias(decl) {
    return decl?.type === 'TSTypeAliasDeclaration' || decl?.type === 'TypeAlias' || decl?.type === 'OpaqueType';
  }

  function isInterfaceDeclaration(decl) {
    return decl?.type === 'TSInterfaceDeclaration' || decl?.type === 'InterfaceDeclaration';
  }

  function typeAliasBody(decl) {
    if (decl.type === 'TSTypeAliasDeclaration') return decl.typeAnnotation;
    if (decl.type === 'OpaqueType') return decl.impltype;
    return decl.right;
  }

  // TS extends: TSExpressionWithTypeArguments has .expression; Flow extends: InterfaceExtends has .id
  function extendsId(parent) {
    return parent.expression ?? parent.id ?? parent;
  }

  // --- Alias chain & substitution ---
  // follow type alias chain: type A = type B = ... until non-alias or non-reference found
  // returns { node, subst } where subst is a Map<string, ASTNode> of accumulated type parameter
  // substitutions through the chain, or null if no generic aliases were traversed
  function followTypeAliasChain(node, scope) {
    let depth = MAX_DEPTH;
    let subst = null;
    // bail on cycle (`type A = B; type B = A;`) before depth exhausts and subst balloons
    const visited = new Set();
    node = unwrapTypeAnnotation(node);
    while (depth-- && (node?.type === 'TSTypeReference' || node?.type === 'GenericTypeAnnotation')) {
      const refName = typeRefName(node);
      if (!refName) break;
      const decl = findTypeDeclaration(refName, scope);
      if (!isTypeAlias(decl)) break;
      if (visited.has(decl)) break;
      visited.add(decl);
      // accumulate type parameter substitutions for generic aliases
      const declParams = decl.typeParameters?.params;
      const usageArgs = getTypeArgs(node)?.params;
      if (declParams?.length) {
        const newSubst = new Map(subst);
        for (let i = 0; i < declParams.length; i++) {
          let arg = usageArgs?.[i] ?? declParams[i].default;
          if (!arg) continue;
          // resolve through existing substitutions for chained generic aliases:
          // type A<T> = B<T>; type B<U> = [U, U]; -> A<string> needs U -> T -> string
          if (subst) {
            const argName = typeRefName(arg);
            if (argName && subst.has(argName)) arg = subst.get(argName);
          }
          newSubst.set(typeParamName(declParams[i]), arg);
        }
        subst = newSubst;
      }
      node = unwrapTypeAnnotation(typeAliasBody(decl));
    }
    // unwrap a final-step trivial mapped passthrough so `Copy<T> = { [K in keyof T]: T[K] }`
    // resolves through to T (substituted) instead of stopping at the mapped type. for
    // `as`-rename mapped types we can't passthrough, but downstream `expandMappedTypeMembers`
    // needs the source type concrete (`keyof T` enumeration requires T's literal members);
    // fold accumulated subst into the whole node so the rename expansion runs on the
    // post-substitution mapped type
    if (node?.type === 'TSMappedType') {
      const passthrough = unwrapMappedTypePassthrough(node);
      if (passthrough) node = unwrapTypeAnnotation(applySubst(passthrough, subst));
      else if (subst) node = applyAliasSubstDeep(node, subst);
    }
    return { node, subst };
  }

  // substitute type-param references through `followTypeAliasChain`'s subst map.
  // recurses into refs/args/arrays/tuples/unions so interface-extends args reach
  // inherited members after getTypeMembers flattens them
  function substSlot(node, slot, subst, depth) {
    const next = applyAliasSubstDeep(node[slot], subst, depth + 1);
    return next === node[slot] ? node : { ...node, [slot]: next };
  }
  function substList(node, slot, subst, depth) {
    const list = node[slot];
    if (!list?.length) return node;
    const next = list.map(el => applyAliasSubstDeep(el, subst, depth + 1));
    return next.every((el, i) => el === list[i]) ? node : { ...node, [slot]: next };
  }
  // rebuild a reference-shape node with substituted typeArguments. `base` is the spread base;
  // when `base === node` (no substitute swap happened), preserves identity if all args
  // resolve to themselves so caller sees `===` against the input
  function withSubstitutedTypeArgs(node, base, subst, depth) {
    const args = getTypeArgs(node);
    if (!args?.params?.length) return base;
    const next = args.params.map(p => applyAliasSubstDeep(p, subst, depth + 1));
    if (base === node && next.every((p, i) => p === args.params[i])) return node;
    const argsKey = node.typeParameters ? 'typeParameters' : 'typeArguments';
    return { ...base, [argsKey]: { ...args, params: next } };
  }
  // memoize `(node, subst)` -> result. without cache, deep-nested generic mapped passthroughs
  // (`type Step1<T> = { [K in keyof T]: T[K] }; type Step2<T> = Step1<{...}>; ...`) cause
  // exponential redundant walks because each recursion branches into the substitution value
  // (which contains TypeReferences that re-enter the walk). cycle guard `seen` Set is local
  // to TypeReference walks - doesn't dedup work across cousin branches. WeakMap on node
  // GC-clears with the AST; inner WeakMap on subst Map identity scopes per-walk. visited-aware
  // calls bypass cache (the visited Set restricts result vs unvisited)
  let applySubstCache = new WeakMap();
  function applyAliasSubstDeep(node, subst, depth = 0, visited = null) {
    if (depth > MAX_DEPTH || !subst || !node || typeof node !== 'object') return node;
    // cache miss: compute via inner switch, store result keyed by (node, subst). visited
    // walks (cycle guard active) skip cache - their result depends on caller's `seen` state
    if (visited) return applyAliasSubstDeepInner(node, subst, depth, visited);
    let perNode = applySubstCache.get(node);
    if (perNode) {
      const cached = perNode.get(subst);
      if (cached !== undefined) return cached;
    }
    const result = applyAliasSubstDeepInner(node, subst, depth, visited);
    if (!perNode) {
      perNode = new WeakMap();
      applySubstCache.set(node, perNode);
    }
    perNode.set(subst, result);
    return result;
  }
  function applyAliasSubstDeepInner(node, subst, depth, visited) {
    switch (node.type) {
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        // chained generic aliases can stash a compound arg under a param key - e.g.
        // `type A<T> = B<T[]>; type B<U> = U[]` leaves subst {T: string, U: T[]}, and
        // naive `subst.get(U)` leaks T. re-run the replacement through the same subst
        // to finish resolving references inside the compound AST. cycle guard via
        // `visited` Set on param names prevents `T -> U; U -> T` from looping forever
        // (depth bound alone catches it eventually but allocates O(MAX_DEPTH) frames)
        if (name && subst.has(name)) {
          const seen = visited ?? new Set();
          if (seen.has(name)) return node;
          seen.add(name);
          const replaced = applyAliasSubstDeep(subst.get(name), subst, depth + 1, seen);
          // higher-kinded `Wrap<F, U> = F<U>` with F->Box: travel ownArgs onto the replacement
          // when it's a parameterisable shape without its own args. otherwise (primitive
          // keyword, array, already-parameterised) ownArgs stay dropped - attaching would
          // corrupt the shape
          if (replaced?.type !== 'TSTypeReference' && replaced?.type !== 'GenericTypeAnnotation') return replaced;
          if (getTypeArgs(replaced)?.params?.length) return replaced;
          return withSubstitutedTypeArgs(node, replaced, subst, depth);
        }
        return withSubstitutedTypeArgs(node, node, subst, depth);
      }
      case 'TSTypeAnnotation':
      case 'TypeAnnotation':
      case 'TSParenthesizedType':
      case 'TSOptionalType':
      case 'NullableTypeAnnotation': return substSlot(node, 'typeAnnotation', subst, depth);
      case 'TSArrayType':
      case 'ArrayTypeAnnotation': return substSlot(node, 'elementType', subst, depth);
      case 'TSTupleType': return substList(node, 'elementTypes', subst, depth);
      case 'TupleTypeAnnotation':
      case 'TSUnionType':
      case 'UnionTypeAnnotation':
      case 'TSIntersectionType':
      case 'IntersectionTypeAnnotation': return substList(node, 'types', subst, depth);
      case 'TSTypeLiteral': {
        let changed = false;
        const members = node.members?.map(m => {
          const ta = m.typeAnnotation ? applyAliasSubstDeep(m.typeAnnotation, subst, depth + 1) : m.typeAnnotation;
          const rt = m.returnType ? applyAliasSubstDeep(m.returnType, subst, depth + 1) : m.returnType;
          if (ta === m.typeAnnotation && rt === m.returnType) return m;
          changed = true;
          return { ...m, typeAnnotation: ta, returnType: rt };
        });
        return changed ? { ...node, members } : node;
      }
      case 'TSConditionalType': {
        const ck = applyAliasSubstDeep(node.checkType, subst, depth + 1);
        const ex = applyAliasSubstDeep(node.extendsType, subst, depth + 1);
        const tr = applyAliasSubstDeep(node.trueType, subst, depth + 1);
        const fl = applyAliasSubstDeep(node.falseType, subst, depth + 1);
        return ck === node.checkType && ex === node.extendsType && tr === node.trueType && fl === node.falseType
          ? node : { ...node, checkType: ck, extendsType: ex, trueType: tr, falseType: fl };
      }
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'FunctionTypeAnnotation': {
        const returnSlot = node.returnType ? 'returnType' : 'typeAnnotation';
        const rt = node[returnSlot] ? applyAliasSubstDeep(node[returnSlot], subst, depth + 1) : node[returnSlot];
        // subst params too: `type F<T> = (x: T) => void; F<number[]>.params[0].type` needs
        // T -> number[]. rare (params type inference doesn't drive polyfill dispatch for most
        // callsites), but preserves invariant that subst walks the full type shape
        const params = node.params?.map(p => {
          const pTA = p.typeAnnotation ? applyAliasSubstDeep(p.typeAnnotation, subst, depth + 1) : p.typeAnnotation;
          return pTA === p.typeAnnotation ? p : { ...p, typeAnnotation: pTA };
        });
        const paramsChanged = params && params.some((p, i) => p !== node.params[i]);
        if (rt === node[returnSlot] && !paramsChanged) return node;
        return { ...node, [returnSlot]: rt, ...paramsChanged && { params } };
      }
      case 'TSIndexedAccessType': {
        const obj = applyAliasSubstDeep(node.objectType, subst, depth + 1);
        const idx = applyAliasSubstDeep(node.indexType, subst, depth + 1);
        return obj === node.objectType && idx === node.indexType
          ? node : { ...node, objectType: obj, indexType: idx };
      }
      case 'TSTypeOperator':
        return substSlot(node, 'typeAnnotation', subst, depth);
      // mapped type: `{ [K in T]: T[K] }` - substitute the constraint, `typeAnnotation`,
      // and `nameType` (TS `as` remapping). without this, `type Box<T> = { [K in keyof T]: T[K] }`
      // passed `Box<{a: string[]}>` wouldn't substitute T in the mapped body. babel nests
      // the constraint under `typeParameter.constraint`; oxc/TS-ESTree flattens to
      // `node.constraint` directly - both shapes need a substitution slot here
      case 'TSMappedType': {
        const tp = node.typeParameter;
        // alpha-rename guard: the mapped type binds its own K, so outer subst entries
        // for the same key MUST NOT propagate into body / nameType (variable capture).
        // constraint references outer types (`keyof T`) and uses the unmodified subst.
        // body / nameType see the inner K as a fresh variable - drop the outer shadowing
        // entry from the subst clone passed in
        const innerName = tp?.name?.name;
        const innerSubst = innerName && subst.has(innerName)
          ? new Map([...subst].filter(([k]) => k !== innerName))
          : subst;
        const tpConstraint = tp?.constraint ? applyAliasSubstDeep(tp.constraint, subst, depth + 1) : tp?.constraint;
        const flatConstraint = node.constraint ? applyAliasSubstDeep(node.constraint, subst, depth + 1) : node.constraint;
        const ann = node.typeAnnotation ? applyAliasSubstDeep(node.typeAnnotation, innerSubst, depth + 1) : node.typeAnnotation;
        const nameType = node.nameType ? applyAliasSubstDeep(node.nameType, innerSubst, depth + 1) : node.nameType;
        if (tpConstraint === tp?.constraint && flatConstraint === node.constraint
          && ann === node.typeAnnotation && nameType === node.nameType) return node;
        return {
          ...node,
          typeParameter: tp ? { ...tp, constraint: tpConstraint } : tp,
          ...node.constraint !== undefined && { constraint: flatConstraint },
          typeAnnotation: ann,
          nameType,
        };
      }
      // rest type inside tuples: `[...T[]]` / `[first, ...Rest]` - substitute inner
      case 'TSRestType': return substSlot(node, 'typeAnnotation', subst, depth);
      // named tuple member: `[x: string, ...rest: number[]]` - inner elementType
      case 'TSNamedTupleMember': return substSlot(node, 'elementType', subst, depth);
      // `typeof X` - substitute if X maps through the alias (rare but keeps invariant)
      case 'TSTypeQuery':
        return node.exprName?.type === 'Identifier' && subst.has(node.exprName.name)
          ? subst.get(node.exprName.name) : node;
      // template literal type `\`${A}_${B}\``: substitute each interpolated expression so
      // mapped-type rename templates (`as \`${InnerKey}_${K}\``) reach evalRenameTemplate
      // with type-param refs replaced. oxc emits `TSTemplateLiteralType { types: [...] }`,
      // babel emits `TSLiteralType { literal: TemplateLiteral { expressions: [...] } }`.
      // quasis are pure text and don't carry substitutable refs
      case 'TSTemplateLiteralType': return substList(node, 'types', subst, depth);
      case 'TSLiteralType': {
        if (node.literal?.type !== 'TemplateLiteral') return node;
        const inner = substList(node.literal, 'expressions', subst, depth);
        return inner === node.literal ? node : { ...node, literal: inner };
      }
      default: return node;
    }
  }

  // small predicate-style helper for the `subst ? applyAliasSubstDeep(node, subst) : node`
  // idiom that appears across alias-chain consumers. extracting keeps the conditional out
  // of expression-tail position where it nests awkwardly inside `?:`, `??`, and ternary
  // arguments. no behavioural change - identical to the inlined branch
  function applySubst(node, subst) {
    return subst ? applyAliasSubstDeep(node, subst) : node;
  }

  // --- Scope lookup & declarations ---
  function constantBindingPath(name, scope) {
    if (!scope) return null;
    const binding = scope.getBinding(name);
    return binding?.constant ? binding.path : null;
  }

  // resolve `typeof variable` to a type - shared by TS TSTypeQuery and Flow TypeofTypeAnnotation
  function resolveTypeofBinding(name, scope) {
    // `typeof Enum` (alone in annotation) - enum's runtime value is the enum object itself.
    // TSEnumDeclaration has no typeAnnotation slot so the bindingPath walk below returns null;
    // treat it as $Object('Object') so downstream member inference uses the enum as a receiver
    if (findEnumDeclaration(name, scope)) return new $Object('Object');
    const bindingPath = constantBindingPath(name, scope);
    if (!bindingPath) return null;
    if (t.isVariableDeclarator(bindingPath.node)) {
      const annotation = bindingPath.node.id?.typeAnnotation;
      if (annotation) return resolveTypeAnnotation(annotation, scope);
      const init = bindingPath.get('init');
      if (init.node) return resolveNodeType(init);
    } else {
      const annotation = findBindingAnnotation(bindingPath);
      if (annotation) return resolveTypeAnnotation(annotation, scope);
    }
    if (isFunctionOrClassDeclaration(bindingPath.node)) return new $Object('Function');
    return null;
  }

  // `typeof obj.prop[.prop...]` - resolve a qualified member chain from a binding. walks
  // the chain through nested ObjectExpression / ArrayExpression init via the shared
  // `resolveObjectMemberPath` helper (also used for destructure-key walks); class
  // declarations dispatch to `resolveClassMember` for the (single-step) static member case;
  // other shapes fall through to the binding's type annotation
  function resolveTypeofQualifiedMember(objectName, memberPath, scope) {
    // `typeof Enum.Member` - TSEnumDeclaration has no typeAnnotation and its bindingPath
    // fallthrough returns null. look it up via findEnumDeclaration and map the member to
    // the enum's value kind ($Primitive('string'|'number'))
    if (memberPath.length === 1) {
      const enumDecl = findEnumDeclaration(objectName, scope);
      if (enumDecl) {
        const type = resolveEnumMemberType(enumDecl, memberPath[0]);
        if (type) return type;
      }
    }
    const bindingPath = constantBindingPath(objectName, scope);
    if (!bindingPath || !memberPath.length) return null;
    const initPath = t.isVariableDeclarator(bindingPath.node) ? bindingPath.get('init')
      : t.isClassDeclaration(bindingPath.node) ? bindingPath : null;
    if (initPath?.node) {
      const resolved = t.isVariableDeclarator(bindingPath.node)
        ? resolveRuntimeExpression(initPath) : initPath;
      // class static: `class K {static x...}; typeof K.x` or aliased `const C = K; typeof C.x` -
      // class members aren't ObjectProperties, dispatch through the class-aware resolver.
      // single-level only (`typeof K.x.y` would need recursive class-member-init descent)
      if (t.isClass(resolved.node) && memberPath.length === 1) {
        const result = resolveClassMember(resolved, memberPath[0], true);
        if (result) return result;
      }
      // ObjectExpression / ArrayExpression chain - shared `resolveObjectMemberPath`
      // walks N-deep through nested literals (also used for destructure-key resolution)
      const result = resolveObjectMemberPath(resolved, memberPath);
      if (result) return result;
    }
    const annotation = findBindingAnnotation(bindingPath);
    return annotation ? resolveAnnotatedMemberPath(annotation, memberPath, scope) : null;
  }

  // shared dispatch for `typeof X` and `typeof X.Y[.Z...]` - segments is what
  // collectQualifiedSegments returns for TS `TSQualifiedName` or Flow `QualifiedTypeIdentifier`
  function resolveTypeofFromSegments(segments, scope) {
    if (!segments?.length) return null;
    const [rootName, ...chain] = segments;
    return chain.length ? resolveTypeofQualifiedMember(rootName, chain, scope) : resolveTypeofBinding(rootName, scope);
  }

  function resolveTypeQuery(node, scope) {
    return resolveTypeofFromSegments(collectQualifiedSegments(node.exprName), scope);
  }

  // computed enum initializers: TS evaluates `1 + 2` / `'a' + 'b'` at compile time;
  // we can't but operand-shape inference covers the common cases. TemplateLiteral always
  // yields string; BinaryExpression preserves the kind if both operands match.
  // ESTree preserves ParenthesizedExpression wrappers (babel strips them); unwrap so
  // `enum E { A = (1 + 2) }` resolves through BinaryExpression's operand-shape check
  function resolveEnumMemberKind(initializer) {
    const init = unwrapParens(initializer);
    if (!init) return 'number'; // implicit numeric
    const nodeType = babelNodeType(init);
    if (nodeType === 'StringLiteral') return 'string';
    // numeric UnaryExpression: `+`/`-`/`~` yield number; `!` yields boolean (invalid as
    // enum initializer but TS would reject at compile time); `typeof`/`void`/`delete`
    // yield non-number. limit to arithmetic operators to stay precise
    if (init.type === 'UnaryExpression') {
      return init.operator === '+' || init.operator === '-' || init.operator === '~' ? 'number' : null;
    }
    if (nodeType === 'NumericLiteral') return 'number';
    if (init.type === 'TemplateLiteral') return 'string';
    if (init.type === 'BinaryExpression') {
      const left = resolveEnumMemberKind(init.left);
      return left && left === resolveEnumMemberKind(init.right) ? left : null;
    }
    return null;
  }

  // ESTree (oxc-parser): members under body.members; Babel: directly on declaration
  function enumMembers(declaration) {
    return declaration.members ?? declaration.body?.members;
  }

  // member's id may be Identifier (babel) or StringLiteral (oxc) - handle both shapes
  function findEnumMember(declaration, name) {
    return enumMembers(declaration)?.find(m => (m.id?.name ?? m.id?.value) === name) ?? null;
  }

  function resolveEnumMemberType(declaration, name) {
    const member = findEnumMember(declaration, name);
    if (!member) return null;
    const kind = resolveEnumMemberKind(member.initializer);
    return kind ? new $Primitive(kind) : null;
  }

  function resolveEnumType(declaration) {
    const members = enumMembers(declaration);
    if (!members?.length) return null;
    let kind = null;
    for (const member of members) {
      const memberKind = resolveEnumMemberKind(member.initializer);
      if (!memberKind) return null;
      if (!kind) kind = memberKind;
      else if (kind !== memberKind) return null;
    }
    return kind ? new $Primitive(kind) : null;
  }

  function isClassLikeDeclaration(decl) {
    return decl?.type === 'ClassDeclaration' || decl?.type === 'DeclareClass';
  }

  function isTypeBearingDeclaration(decl) {
    return isTypeAlias(decl) || isInterfaceDeclaration(decl) || isClassLikeDeclaration(decl)
      || decl?.type === 'TSEnumDeclaration';
  }

  // statement list directly inside a TSModuleDeclaration. for Babel's nested form
  // (`namespace A.B {}` -> A.body = TSModuleDeclaration B) expose B as a single-element list
  // so the next recursion can match its name. for oxc's flat form (id = TSQualifiedName)
  // the body is a TSModuleBlock and we return its statements directly.
  function moduleStatements(decl) {
    const body = decl?.body;
    if (body?.type === 'TSModuleDeclaration') return [body];
    return Array.isArray(body?.body) ? body.body : null;
  }

  // segment names of a TSModuleDeclaration id: Babel uses Identifier (single segment),
  // oxc uses TSQualifiedName for `namespace A.B {}` (multi-segment)
  function moduleNameSegments(id) {
    if (!id) return null;
    if (id.type === 'Identifier') return [id.name];
    if (id.type === 'TSQualifiedName') {
      const left = moduleNameSegments(id.left);
      return left && [...left, id.right.name];
    }
    return null;
  }

  // does `segments` start with the same names as `prefix`?
  function startsWithSegments(segments, prefix) {
    if (prefix.length > segments.length) return false;
    for (let i = 0; i < prefix.length; i++) if (segments[i] !== prefix[i]) return false;
    return true;
  }

  // resolve `NS.Inner.Decl` segments inside a statement list. `collect=null` short-circuits
  // on the first hit; `collect=[]` keeps walking to enable TS interface merging.
  // `leafMatch` is the predicate the LEAF declaration must satisfy - defaults to type-bearing
  // (alias / interface / class / enum) for findTypeDeclaration; typeof-name resolution swaps
  // in `isFunctionOrClassDeclaration` to also surface `declare function fn` inside a namespace
  function walkStatementsForDecl(segments, statements, collect, leafMatch = isTypeBearingDeclaration) {
    if (!Array.isArray(statements) || !segments.length) return null;
    const [head, ...rest] = segments;
    for (const statement of statements) {
      const decl = unwrapExportedDeclaration(statement);
      if (!decl) continue;
      if (rest.length === 0 && decl.id?.name === head && leafMatch(decl)) {
        if (!collect) return decl;
        collect.push(decl);
        continue;
      }
      if (decl.type !== 'TSModuleDeclaration') continue;
      const moduleSegs = moduleNameSegments(decl.id);
      if (!moduleSegs) continue;
      // bare name: descend into every namespace; dotted: namespace must prefix segments
      if (rest.length === 0) {
        const inner = walkStatementsForDecl(segments, moduleStatements(decl), collect, leafMatch);
        if (inner && !collect) return inner;
        continue;
      }
      if (!startsWithSegments(segments, moduleSegs)) continue;
      const inner = walkStatementsForDecl(segments.slice(moduleSegs.length), moduleStatements(decl), collect, leafMatch);
      if (inner && !collect) return inner;
    }
    return null;
  }

  // walk scope chain; `collect=null` returns first hit, `collect=[]` collects siblings
  // at the first containing scope (interface merging only - others don't merge).
  // `leafMatch` threads through to `walkStatementsForDecl`; see there for the contract
  function walkScopesForDecl(name, scope, collect, leafMatch = isTypeBearingDeclaration) {
    if (!scope) return null;
    const segments = typeof name === 'string' ? name.split('.') : name;
    for (let cur = scope; cur; cur = cur.parent) {
      const block = cur.block ?? cur.path?.node;
      if (!block) continue;
      const body = block.type === 'Program' ? block.body : block.body?.body;
      const before = collect?.length;
      const result = walkStatementsForDecl(segments, body, collect, leafMatch);
      if (!collect && result) return result;
      if (collect && collect.length > before) return null;
    }
    return null;
  }

  // resolve `typeof NS.Inner.fn` namespaced lookups: babel doesn't bind TS `namespace`
  // declarations as scope values, so `constantBindingPath` returns null. delegate to
  // `walkScopesForDecl` with the function/class leaf-match, and surface the result as a
  // {node, scope}-shape - resolveReturnType only consumes those two properties (not full
  // NodePath methods). passes the input scope as the result scope: babel doesn't create
  // separate scopes for TSModuleDeclaration anyway, so type names referenced in the
  // function's signature resolve through the same outer scope chain
  function findNamespacedFunctionPath(segments, scope) {
    const node = scope && walkScopesForDecl(segments, scope, null, isFunctionOrClassDeclaration);
    return node ? { node, scope } : null;
  }

  // per-scope cache. serialize multi-segment / array inputs to a dotted string so qualified
  // references (`NS.Type`) and array-form callsites share the cache slot with their string form
  let typeDeclCache = new WeakMap();
  function findTypeDeclaration(name, scope) {
    if (!scope) return null;
    const key = typeof name === 'string' ? name : Array.isArray(name) ? name.join('.') : null;
    if (key === null) return walkScopesForDecl(name, scope, null);
    const byName = getOrInitMap(typeDeclCache, scope);
    if (byName.has(key)) return byName.get(key);
    const decl = walkScopesForDecl(name, scope, null);
    byName.set(key, decl);
    return decl;
  }

  // narrow `findTypeDeclaration` to TSEnumDeclaration. callers care about the enum-decl
  // shape specifically (member-type lookup, value-kind probe, reverse-mapping check), so
  // collapse the find + type-check pattern into one call to keep predicate and lookup at
  // the same level of abstraction
  function findEnumDeclaration(name, scope) {
    const decl = findTypeDeclaration(name, scope);
    return decl?.type === 'TSEnumDeclaration' ? decl : null;
  }

  // all `interface X {}` siblings at the first scope level that contains one
  function findAllTypeDeclarations(name, scope) {
    const collected = [];
    walkScopesForDecl(name, scope, collected);
    return collected;
  }

  // ESTree (oxc-parser): TSTypeParameter.name is Identifier node; Babel: it's a string
  function typeParamName(param) {
    return typeof param.name === 'string' ? param.name : param.name?.name;
  }

  function findTypeParameter(name, scope) {
    let currentScope = scope;
    while (currentScope) {
      const params = (currentScope.block ?? currentScope.path?.node)?.typeParameters?.params;
      if (params) for (const param of params) {
        if (typeParamName(param) === name) return {
          constraint: param.constraint ?? param.bound,
          default: param.default,
          scope: currentScope,
        };
      }
      currentScope = currentScope.parent;
    }
    return null;
  }

  function resolveKnownConstructor(name) {
    return hasOwn(KNOWN_CONSTRUCTORS, name) ? typeFromHint(KNOWN_CONSTRUCTORS[name].new) : null;
  }

  // --- Type annotation resolver ---
  function resolveTypeArgs(decl, node, typeParamMap, scope, depth, seen) {
    const declParams = decl.typeParameters?.params;
    if (!declParams?.length) return typeParamMap;
    const callArgs = getTypeArgs(node)?.params;
    const base = typeParamMap || new Map();
    const localMap = new Map(base);
    let extended = false;
    // `<T, U = T[]>`: each default sees earlier params via `localMap` accumulated so far
    for (let i = 0; i < declParams.length; i++) {
      const arg = callArgs?.[i] ?? declParams[i].default;
      if (!arg) continue;
      const resolved = localMap.size > 0
        ? substituteTypeParams(arg, localMap, scope, depth + 1, seen)
        : resolveTypeAnnotation(arg, scope, depth + 1);
      if (resolved) {
        localMap.set(typeParamName(declParams[i]), resolved);
        extended = true;
      }
    }
    return extended ? localMap : typeParamMap;
  }

  // `Container<string>` -> { T: string }; `Container` with `<T = number[]>` -> { T: Array }
  function buildDefaultTypeParamMap(annotation, scope) {
    const segments = typeRefSegments(annotation);
    if (!segments) return null;
    const declaration = findTypeDeclaration(segments, scope);
    if (!declaration) return null;
    const declParams = declaration.typeParameters?.params;
    if (!declParams?.length) return null;
    const callArgs = getTypeArgs(annotation)?.params;
    // `<T, U = T[]>`: U sees already-resolved T from earlier iterations
    let map = null;
    for (let i = 0; i < declParams.length; i++) {
      const arg = callArgs?.[i] ?? declParams[i].default;
      if (!arg) continue;
      const resolved = map
        ? substituteTypeParams(arg, map, scope, 0)
        : resolveTypeAnnotation(arg, scope);
      if (resolved) {
        if (!map) map = new Map();
        map.set(typeParamName(declParams[i]), resolved);
      }
    }
    return map;
  }

  function resolveUserDefinedType(name, node, scope, depth, typeParamMap, seen) {
    if (depth > MAX_DEPTH) return null;
    // type parameters shadow type declarations with the same name.
    // fall back to `default` FIRST (what TS binds without inference arguments), then
    // `constraint` (upper bound, typically over-broad - `object` / `unknown`)
    const typeParam = findTypeParameter(name, scope);
    if (typeParam) {
      const annotation = typeParam.default ?? typeParam.constraint;
      if (!annotation) return null;
      // pass `seen` through to substitution to inherit caller's decl-cycle guard. without
      // it, a cyclic default `type R<T = R<T>>` walks the substitution recursion fresh and
      // only MAX_DEPTH=64 catches the loop (O(64) overhead per resolution); with `seen`,
      // the second visit short-circuits via the side-channel WeakSet flag
      return typeParamMap
        ? substituteTypeParams(annotation, typeParamMap, typeParam.scope, depth + 1, seen)
        : resolveTypeAnnotation(annotation, typeParam.scope, depth + 1);
    }
    const declaration = findTypeDeclaration(name, scope);
    if (!declaration) return null;
    // `interface A extends B; interface B extends A` - MAX_DEPTH catches the loop, but a
    // per-walk decl-set short-circuits it at the second visit. cycle-detection uses a
    // side-channel WeakSet keyed on the decl-set identity instead of a monkey-patched
    // property - that way `new Set(visited)` (should a caller ever clone) doesn't silently
    // forget the cycle flag; the cloned Set is simply a different identity with no flag.
    // unknowable cyclic type must NOT masquerade as `Object` (it suppresses generic polyfill)
    if (seen?.has(declaration)) {
      cycleSeenSets.add(seen);
      return null;
    }
    const visited = seen ?? new Set();
    visited.add(declaration);
    typeParamMap = resolveTypeArgs(declaration, node, typeParamMap, scope, depth, visited);
    // thread `visited` into the body-resolution closure so self-recursive aliases
    // (`type Rec<T> = Rec<T[]>`) hit the decl-set guard on re-entry instead of
    // growing `typeParamMap` unboundedly until MAX_DEPTH bottom-outs via CPU-burn
    const resolve = typeParamMap
      ? p => substituteTypeParams(p, typeParamMap, scope, depth + 1, visited)
      : p => resolveTypeAnnotation(p, scope, depth + 1);
    if (isTypeAlias(declaration)) return resolve(typeAliasBody(declaration));
    if (declaration.type === 'TSEnumDeclaration') return resolveEnumType(declaration);
    if (isInterfaceDeclaration(declaration)) {
      const parents = declaration.extends;
      if (parents?.length) {
        const cycleFlipped = cycleFlipDetector(visited);
        for (const parent of parents) {
          const base = extendsId(parent);
          if (base.type !== 'Identifier') continue;
          const constructor = resolveKnownConstructor(base.name);
          const result = resolveKnownContainerType(base.name, constructor, parent, resolve)
            || resolveUserDefinedType(base.name, parent, scope, depth + 1, typeParamMap, visited);
          if (result) return result;
        }
        if (cycleFlipped()) return null;
      }
      return new $Object('Object');
    }
    // class as a type: walk `extends` for known container (`Array<T>`) or user parent.
    // cyclic class extends should NOT fall back to `$Object('Object')` - that masquerades
    // as a concrete type and suppresses the generic polyfill plugin emits for unknowable
    // receivers. mirrors the interface-branch cycle handling above
    if (isClassLikeDeclaration(declaration)) {
      const superClass = declaration.superClass ?? declaration.extends?.[0]?.id;
      if (superClass?.type !== 'Identifier') return new $Object('Object');
      const parentRef = {
        type: 'TSTypeReference',
        typeName: superClass,
        typeParameters: getSuperTypeArgs(declaration),
      };
      const ctor = resolveKnownConstructor(superClass.name);
      if (ctor) return resolveKnownContainerType(superClass.name, ctor, parentRef, resolve) || ctor;
      const cycleFlipped = cycleFlipDetector(visited);
      const result = resolveUserDefinedType(superClass.name, parentRef, scope, depth + 1, typeParamMap, visited);
      if (result) return result;
      if (cycleFlipped()) return null;
      return new $Object('Object');
    }
    return null;
  }

  // build {paramName -> argNode} from explicit usage args, falling back to decl param defaults
  function buildSubstMap(declParams, usageArgs) {
    if (!declParams?.length) return null;
    const subst = new Map();
    for (let i = 0; i < declParams.length; i++) {
      const arg = usageArgs?.[i] ?? declParams[i].default;
      if (arg) subst.set(typeParamName(declParams[i]), arg);
    }
    return subst.size ? subst : null;
  }

  // parent interface ref (`Container<string>`) -> Map<declParam, argNode>
  function buildParentSubst(parentRef, scope) {
    const segments = typeRefSegments(parentRef);
    const decl = segments ? findTypeDeclaration(segments, scope) : null;
    if (!isInterfaceDeclaration(decl) && !isTypeAlias(decl)) return null;
    return buildSubstMap(decl.typeParameters?.params, getTypeArgs(parentRef)?.params);
  }

  // clone member with deep-substituted annotation slots; `key`/`computed` stay as-is.
  // covers TS `TSPropertySignature`/`TSIndexSignature`/`TSMethodSignature` and Flow `ObjectTypeProperty`
  const MEMBER_ANNOTATION_SLOTS = ['typeAnnotation', 'returnType', 'value'];
  function substMemberAnnotations(member, subst) {
    if (!member || typeof member !== 'object') return member;
    let cloned = null;
    for (const slot of MEMBER_ANNOTATION_SLOTS) {
      if (!member[slot]) continue;
      const next = applyAliasSubstDeep(member[slot], subst);
      if (next === member[slot]) continue;
      cloned ??= { ...member };
      cloned[slot] = next;
    }
    return cloned ?? member;
  }

  // batch-apply subst to every member; passes through unchanged when subst is empty / null
  // or members list is null. shared between every collector / resolver that needs per-source
  // substitution (class chain, interface merging, parent extends, type alias body)
  function substMembers(members, subst) {
    return members && subst ? members.map(m => substMemberAnnotations(m, subst)) : members;
  }

  // TS utility types whose member set is the same as their first type parameter's
  const STRUCTURE_PRESERVING_WRAPPERS = new Set([
    'Omit',
    'Partial',
    'Pick',
    'Readonly',
    'Required',
    '$ReadOnly',
  ]);

  // TS `PromiseLike<T>` / Flow `Thenable<T>` are structural supertypes of Promise that
  // `await` / `Awaited<>` unwrap identically; alias them to Promise for type resolution
  const PROMISE_SYNONYMS = new Set(['PromiseLike', 'Thenable']);

  // follow superClass for declared parent members. `Identifier` covers both real and ambient
  // (`declare class P {}` + `class C extends P {}`), which behave the same in type position
  function findParentClassDecl(classDecl, scope) {
    const parentId = classDecl.superClass ?? classDecl.extends?.[0]?.id;
    if (parentId?.type !== 'Identifier') return null;
    const parent = findTypeDeclaration(parentId.name, scope);
    return isClassLikeDeclaration(parent) ? parent : null;
  }

  // `Cfg['items']` / chained `Cfg['items']['data']` - resolve the indexed access to its
  // annotation, then get members of that. without this, `findTypeMember` on a binding
  // annotated `Cfg['items']` returns null and downstream dispatches to generic polyfill
  function resolveIndexedAccessMembers(node, scope, depth) {
    const key = indexedAccessKey(node.indexType);
    if (key === null) return null;
    const member = findTypeMember(node.objectType, key, scope);
    if (member) {
      const annotation = unwrapTypeAnnotation(member.typeAnnotation ?? member);
      return annotation ? getTypeMembers(annotation, scope, depth + 1) : null;
    }
    // numeric-key tuple fallback: `Parameters<typeof fn>[0].x` - findTypeMember can't see
    // the tuple shape (Parameters is not in STRUCTURE_PRESERVING_WRAPPERS and getTypeMembers
    // returns null for the special built-in), but findTupleElement resolves it via
    // resolveParametersParams. parity with `resolveIndexedAccessType`'s numeric branch
    const numIndex = typeof key === 'number' ? key : Number(key);
    if (!Number.isInteger(numIndex) || numIndex < 0) return null;
    const element = findTupleElement(node.objectType, numIndex, scope);
    return element ? getTypeMembers(unwrapTypeAnnotation(element), scope, depth + 1) : null;
  }

  // collect members of an interface declaration (including merged sibling interfaces and
  // every `extends`'d parent's members). `interface A extends B; interface B extends A` cycle:
  // MAX_DEPTH bottoms out via 64-frame CPU-burn. visited Set short-circuits at the second
  // visit - mirrors `resolveTypeAnnotation`'s decl-set guard (type aliases) and
  // `collectClassLikeMembers`'s `seen` Set (class-extends chains)
  function collectInterfaceMembers(declaration, segments, scope, depth, visited) {
    const seen = visited ?? new Set();
    if (seen.has(declaration)) return null;
    seen.add(declaration);
    const interfaces = findAllTypeDeclarations(segments, scope).filter(isInterfaceDeclaration);
    const all = [];
    for (const decl of interfaces) {
      // TS: decl.body.body, Flow: decl.body.properties
      const own = decl.body?.body ?? decl.body?.properties;
      if (own) for (const m of own) all.push(m);
      for (const parent of decl.extends ?? []) {
        const expr = extendsId(parent);
        const parentRef = expr.type === 'Identifier'
          ? { type: 'TSTypeReference', typeName: expr, typeParameters: getTypeArgs(parent) }
          : expr;
        const parentMembers = getTypeMembers(parentRef, scope, depth + 1, seen);
        if (!parentMembers) continue;
        all.push(...substMembers(parentMembers, buildParentSubst(parentRef, scope)));
      }
    }
    return all.length ? all : null;
  }

  function getTypeMembers(objectType, scope, depth = 0, visited = undefined) {
    if (depth > MAX_DEPTH) return null;
    if (objectType.type === 'TSTypeLiteral') return objectType.members;
    if (objectType.type === 'ObjectTypeAnnotation') return objectType.properties;
    if (objectType.type === 'TSIndexedAccessType') return resolveIndexedAccessMembers(objectType, scope, depth);
    // mapped type: trivial passthrough delegates to the source's members; `as`-rename
    // expands per-key with statically-evaluated rename templates so `r._a` on
    // `{ [K in keyof T as `_${K}`]: T[K] }` resolves through to the source field type
    if (objectType.type === 'TSMappedType') {
      const passthrough = unwrapMappedTypePassthrough(objectType);
      if (passthrough) return getTypeMembers(unwrapTypeAnnotation(passthrough), scope, depth + 1, visited);
      return expandMappedTypeMembers(objectType, scope, depth, visited);
    }
    // intersection: collect members from all parts
    if (objectType.type === 'TSIntersectionType' || objectType.type === 'IntersectionTypeAnnotation') {
      const all = [];
      for (const member of objectType.types) {
        const members = getTypeMembers(unwrapTypeAnnotation(member), scope, depth + 1, visited);
        if (members) for (const m of members) all.push(m);
      }
      return all.length ? all : null;
    }
    // handle dotted refs (`NS.Data`) by passing the segment path through
    const segments = typeRefSegments(objectType);
    if (!segments) return null;
    // structure-preserving wrappers: `Readonly<{...}>.x`, `Pick<T,K>.x` look up on T directly
    if (segments.length === 1 && STRUCTURE_PRESERVING_WRAPPERS.has(segments[0])) {
      const arg = getTypeArgs(objectType)?.params[0];
      return arg ? getTypeMembers(unwrapTypeAnnotation(arg), scope, depth + 1, visited) : null;
    }
    // `Record<K, V>` - every member access returns V. emit a synthetic index signature so
    // findTypeMember's TSIndexSignature fallback picks it up for any key
    if (segments.length === 1 && segments[0] === 'Record') {
      const params = getTypeArgs(objectType)?.params;
      if (params?.[1]) return [{
        type: 'TSIndexSignature',
        typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: params[1] },
      }];
    }
    // `InstanceType<typeof Cls>.x` / `ReturnType<typeof fn>.x` -> members of the pointed-to decl
    if (segments.length === 1 && (segments[0] === 'InstanceType' || segments[0] === 'ReturnType')) {
      const arg = getTypeArgs(objectType)?.params[0];
      if (!arg) return null;
      // `ReturnType<Fn>.x` where `Fn = () => T` (alias to function type, no typeof) -
      // follow the alias chain, extract return annotation, fold accumulated subst.
      // mirrors `resolveNamedType`'s ReturnType branch. `InstanceType<>` always needs
      // a class binding so the typeof-only path stays
      if (segments[0] === 'ReturnType' && arg.type !== 'TSTypeQuery') {
        const { node: aliased, subst } = followTypeAliasChain(unwrapTypeAnnotation(arg), scope);
        const ret = functionTypeReturnAnnotation(unwrapTypeAnnotation(aliased));
        if (!ret) return null;
        const target = applySubst(ret, subst);
        return getTypeMembers(unwrapTypeAnnotation(target), scope, depth + 1, visited);
      }
      if (arg.type !== 'TSTypeQuery') return null;
      const resolved = resolveTypeQueryBinding(arg, scope);
      if (!resolved?.node) return null;
      const target = unwrapTypeAnnotation(segments[0] === 'InstanceType'
        ? resolved.node.id && { type: 'TSTypeReference', typeName: resolved.node.id }
        : resolved.node.returnType ?? resolved.node.typeAnnotation);
      if (!target) return null;
      // `typeof fn<Args>` instantiation expression: type-args ride on the inner TSTypeQuery.
      // fold them into the resolved target so a generic `returnType: InstanceType<T>` sees
      // the concrete `typeof Cls` (otherwise raw T fails the typeof-only gate on the
      // recursive InstanceType branch). InstanceType's synthesized class reference has no
      // type-param to substitute - subst is a no-op there
      const subst = buildCallSiteSubst(resolved.node, arg);
      return getTypeMembers(applySubst(target, subst), scope, depth + 1, visited);
    }
    // fast path first; only re-walk for the rare interface-merging case
    const declaration = findTypeDeclaration(segments, scope);
    if (!declaration) return null;
    // class / interface declarations: substitute receiver's type-args into member annotations
    // so `class C<T> { f(): T[] } interface C<T> { g: T }; declare const x: C<string>; x.f()[0]`
    // and `x.g` see concrete `string` instead of raw type-param. parent-extends chain (class
    // superClass / interface extends) carries its own subst per-hop in collectors. for the
    // class-like branch `collectClassLikeMembers` does per-source subst internally (each iface
    // gets its own remapped subst for renamed type-params); for the interface-only branch the
    // outer subst is correct because all merged-iface decls share the same param names per TS
    const receiverArgs = getTypeArgs(objectType)?.params;
    if (isInterfaceDeclaration(declaration)) {
      const subst = buildSubstMap(declaration.typeParameters?.params, receiverArgs);
      return substMembers(collectInterfaceMembers(declaration, segments, scope, depth, visited), subst);
    }
    if (isClassLikeDeclaration(declaration)) {
      return collectClassLikeMembers(declaration, segments, scope, depth, receiverArgs);
    }
    if (isTypeAlias(declaration)) {
      // substitute the alias's type params into member annotations so
      // `type Dict<V> = { [k: string]: V }` + `Dict<number[]>[string]` resolves V to number[]
      const subst = buildSubstMap(declaration.typeParameters?.params, receiverArgs);
      return substMembers(
        getTypeMembers(unwrapTypeAnnotation(typeAliasBody(declaration)), scope, depth + 1, visited),
        subst,
      );
    }
    return null;
  }

  // class-as-type with TS declaration merging: non-static body entries up the superClass chain
  // (real and ambient parents) plus every sibling `interface <name>` body + its extends chain.
  // `receiverArgs` are the receiver's type-args (e.g. `[string[]]` for `C<string[]>`); each
  // source declaration (class chain / each iface) gets its own subst built from its own
  // type-param names against the same args - lets renamed params on the interface side
  // (`class C<T>` + `interface C<U>`) substitute correctly. members are returned already
  // substituted so callers must NOT apply an outer subst on top
  function collectClassLikeMembers(declaration, segments, scope, depth, receiverArgs) {
    // walk superClass chain with per-class subst derivation: each parent's typeParameters
    // get bound from the current class's `extends Parent<...>` type-args (with the current
    // subst already applied). mirrors `appendInterfaceExtendsMembers` for class chains, so
    // `class Child<Y> extends Parent<Y[]>` correctly maps Parent's `<X> -> Y[]` then Y -> string
    const merged = [];
    const seen = new Set();
    let cur = declaration;
    let curSubst = buildSubstMap(declaration.typeParameters?.params, receiverArgs);
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      const ownBody = (cur.body?.body ?? []).filter(m => !m?.static);
      merged.push(...substMembers(ownBody, curSubst));
      const parent = findParentClassDecl(cur, scope);
      if (!parent) break;
      // derive parent subst via the same primitive path-based `buildParentClassSubst` uses;
      // when either side is missing (no `<U>` extends, or parent has no `<X>`), the helper
      // returns null and parent's own type-params (if any) remain unbound - same precision-
      // edge as before. seen-set prevents inheritance cycles
      curSubst = buildParentClassSubstFromNodes(cur, parent, curSubst);
      cur = parent;
    }
    // each iface gets its own subst built against ITS type-param names so renamed params
    // on the interface side of class+interface merging substitute correctly
    for (const iface of findAllTypeDeclarations(segments, scope).filter(isInterfaceDeclaration)) {
      const ifaceSubst = buildSubstMap(iface.typeParameters?.params, receiverArgs);
      const ifaceBody = iface.body?.body ?? iface.body?.properties ?? [];
      merged.push(...substMembers(ifaceBody, ifaceSubst));
      appendInterfaceExtendsMembers(iface, scope, depth, merged, ifaceSubst);
    }
    return merged.length ? merged : null;
  }

  // walk `interface X extends A, B` parents. each parent's members carry through the
  // `buildParentSubst` mapping so `A<T>.m: T` becomes `m: <instantiated>`. `ifaceSubst`
  // (when present) is applied to parentRef's args first, so `extends Base<U>` with
  // iface `U -> string` becomes `Base<string>` before descending - parent subst then
  // sees the substituted slot
  function appendInterfaceExtendsMembers(iface, scope, depth, out, ifaceSubst) {
    for (const parent of iface.extends ?? []) {
      const expr = extendsId(parent);
      if (!expr) continue;
      const parentRef = expr.type === 'Identifier'
        ? { type: 'TSTypeReference', typeName: expr, typeParameters: getTypeArgs(parent) }
        : expr;
      const expanded = ifaceSubst ? applySubstToTypeRefArgs(parentRef, ifaceSubst) : parentRef;
      const parentMembers = getTypeMembers(expanded, scope, depth + 1);
      if (!parentMembers) continue;
      out.push(...substMembers(parentMembers, buildParentSubst(expanded, scope)));
    }
  }

  // `Readonly<[T, U]>[0]` / `Partial<[T,U]>[0]` - structure-preserving wrappers around tuples
  // keep the element types intact. `findTypeMember`'s tuple case expects raw TSTupleType,
  // `getTypeMembers`'s wrapper case returns null for tuples (they have no property members).
  // recurse through the wrapper so the tuple index path below can pick up the element
  // extract the single typeArg of a type-reference whose head is one of the wrapper names
  // accepted by `namePredicate`. shared between `peelStructurePreservingWrapper` (Pick / Omit
  // / Readonly / ...) and `peelAwaitedWrapper` (Awaited<X>) — both unwrap a single-segment
  // TypeReference to its first generic arg, differ only in name predicate and post-extract
  // transform of the arg
  function getSingleTypeRefArg(node, namePredicate) {
    if (node?.type !== 'TSTypeReference' && node?.type !== 'GenericTypeAnnotation') return null;
    const segments = typeRefSegments(node);
    if (segments?.length !== 1 || !namePredicate(segments[0])) return null;
    return getTypeArgs(node)?.params?.[0] ?? null;
  }

  function peelStructurePreservingWrapper(objectType) {
    const arg = getSingleTypeRefArg(objectType, n => STRUCTURE_PRESERVING_WRAPPERS.has(n));
    return arg ? unwrapTypeAnnotation(arg) : null;
  }

  // apply Awaited semantics at AST level: recursively peel Promise / PromiseLike wrappers,
  // distribute over union / intersection, follow type-alias hops. resolveAwaitedAnnotation
  // returns a Type object (not AST), but callers like findTypeMember need a substituted AST
  // to recurse into - so this helper runs the same peel structurally and returns AST.
  // depth bound matches `followTypeAliasChain`'s budget; cycle prevention via the depth cap
  function peelAwaitedArgument(arg, scope, depth = 0) {
    if (!arg || depth > MAX_DEPTH) return arg;
    const peeled = peelTSParenthesized(unwrapTypeAnnotation(arg));
    // distribute Awaited over union / intersection (AST rebuild with peeled members).
    // both shapes carry their members under `.types` and differ only in the discriminator
    if (peeled.type === 'TSUnionType' || peeled.type === 'UnionTypeAnnotation'
        || peeled.type === 'TSIntersectionType' || peeled.type === 'IntersectionTypeAnnotation') {
      return { ...peeled, types: peeled.types.map(member => peelAwaitedArgument(member, scope, depth + 1)) };
    }
    // distribute Awaited over tuple elements per TS spec `Awaited<[A, B, C]>` =
    // `[Awaited<A>, Awaited<B>, Awaited<C>]`. peel inside TSNamedTupleMember /
    // TSRestType wrappers without dropping their structure so downstream findTupleElement
    // still sees the tuple shape with the awaited inner types
    if (peeled.type === 'TSTupleType' || peeled.type === 'TupleTypeAnnotation') {
      return rebuildTupleElements(peeled, el => peelAwaitedTupleElement(el, scope, depth));
    }
    const promiseInner = getPromiseInnerAnnotation(peeled);
    if (promiseInner) return peelAwaitedArgument(promiseInner, scope, depth + 1);
    // conditional reached via post-subst alias body: pick firing branch (AST-level for
    // literal precision, then resolved-type for primitive disjoint check sides) and recurse
    // on the chosen branch's AST so member-lookup callers see the picked shape directly.
    // undecidable -> return AST as-is so findTypeMember's TSConditionalType branch can try
    // its own AST-only pick downstream
    if (peeled.type === 'TSConditionalType') {
      const branch = pickAwaitedConditionalBranch(peeled, scope, depth);
      if (branch !== null) return peelAwaitedArgument(branch ? peeled.trueType : peeled.falseType, scope, depth + 1);
      return peeled;
    }
    const aliased = followTypeAliasChain(peeled, scope);
    if (aliased?.node && aliased.node !== peeled) {
      return peelAwaitedArgument(applySubst(aliased.node, aliased.subst), scope, depth + 1);
    }
    return peeled;
  }

  // peel Awaited inside a tuple element preserving TSNamedTupleMember / TSRestType
  // wrappers (`[name: Promise<X>]`, `[...Promise<X>[]]`) - we want the inner type peeled
  // but the labelled / rest structure kept so findTupleElement still recognises the shape
  function peelAwaitedTupleElement(element, scope, depth) {
    if (element.type === 'TSNamedTupleMember') {
      return { ...element, elementType: peelAwaitedTupleElement(element.elementType, scope, depth + 1) };
    }
    if (element.type === 'TSRestType') {
      return { ...element, typeAnnotation: peelAwaitedArgument(element.typeAnnotation, scope, depth + 1) };
    }
    return peelAwaitedArgument(element, scope, depth + 1);
  }

  // `Awaited<X>` wrapper: returns the peeled inner X (with Promise / union / intersection
  // distribution applied per Awaited semantics) when `node` is a TSTypeReference to Awaited;
  // null for any other shape. used by findTypeMember so member access through `Awaited<T>`
  // walks T's members directly (TS spec: Awaited<T> = T when T is not Promise-like)
  function peelAwaitedWrapper(node, scope) {
    const arg = getSingleTypeRefArg(node, n => n === 'Awaited');
    return arg ? peelAwaitedArgument(arg, scope) : null;
  }

  // unified passthrough detection: structure-preserving wrapper (`Readonly<T>`, `Partial<T>`,
  // ...), `Awaited<T>` (Promise peel + distribute), OR trivial mapped-type passthrough
  // (`{ [K in keyof T]: T[K] }`). all are structurally identical to their inner type for
  // property-lookup purposes; callers recurse findTypeMember on the unwrapped inner with
  // accumulated subst applied
  function unwrapPassthroughWrapper(node, scope) {
    return peelStructurePreservingWrapper(node)
      ?? peelAwaitedWrapper(node, scope)
      ?? (node?.type === 'TSMappedType' ? unwrapMappedTypePassthrough(node) : null);
  }

  // mixed `{[k:number]:A; [k:string]:B}` index signatures resolve per-lookup: numeric keys ->
  // number sig, string keys -> string sig (permissive fallback when only one sig is declared)
  function pickIndexSignature(members, key) {
    let numberSig = null;
    let stringSig = null;
    let symbolSig = null;
    for (const member of members) {
      if (member.type !== 'TSIndexSignature' || !member.typeAnnotation) continue;
      const keyType = member.parameters?.[0]?.typeAnnotation?.typeAnnotation?.type;
      if (keyType === 'TSNumberKeyword') numberSig ??= member.typeAnnotation;
      else if (keyType === 'TSSymbolKeyword') symbolSig ??= member.typeAnnotation;
      else stringSig ??= member.typeAnnotation;
    }
    const isNumericKey = typeof key === 'number' || /^-?\d+$/.test(String(key));
    return isNumericKey ? (numberSig ?? stringSig) : (stringSig ?? numberSig ?? symbolSig);
  }

  function findTypeMember(objectType, key, scope, depth = 0) {
    if (!objectType || depth > MAX_DEPTH) return null;
    // unions: recurse per branch (with subst applied), fold matches into a synthetic union.
    // union member may itself be a wrapped generic (`Inner<T>` / `T[]`); deep subst
    // descends into the inner type-param
    const { node: aliased, subst } = followTypeAliasChain(objectType, scope);
    // `Readonly<[T, U]>[0]` - after chain-follow the alias may still land on a structure-
    // preserving wrapper. peel it here so the tuple branch below gets the raw TSTupleType
    // (getTypeMembers fallback returns null for tuples - they carry element types, not members)
    // structure-preserving wrapper (`Readonly<T>`) OR trivial mapped-type passthrough
    // (`{ [K in keyof T]: T[K] }`) - both unwrap to T for property-lookup purposes. subst
    // from `followTypeAliasChain` already maps the alias's type-params to the receiver's
    // concrete args; apply to the unwrapped inner before recursing
    const passthrough = unwrapPassthroughWrapper(aliased ?? objectType, scope);
    if (passthrough) {
      const substituted = applySubst(passthrough, subst);
      return findTypeMember(substituted, key, scope, depth + 1);
    }
    const withSubst = node => {
      if (!node) return node;
      const unwrapped = unwrapTypeAnnotation(node);
      return applySubst(unwrapped, subst);
    };
    // conditional `T extends U ? trueType : falseType`: pick branch via AST equality on
    // substituted check / extends shapes, then recurse into the chosen branch's members.
    // without this, member-lookup на `ShadowedRenameProbe<'narrow'>` (where body is
    // `K extends 'narrow' ? {...} : never`) bottoms out на null because getTypeMembers
    // doesn't have a TSConditionalType branch
    if (aliased?.type === 'TSConditionalType') {
      const checkSubst = withSubst(aliased.checkType);
      const extendSubst = withSubst(aliased.extendsType);
      const branch = pickConditionalBranchByAST(checkSubst, extendSubst);
      if (branch !== null) {
        return findTypeMember(withSubst(branch ? aliased.trueType : aliased.falseType), key, scope, depth + 1);
      }
      return null;
    }
    const resolveBranch = member => findTypeMember(withSubst(unwrapTypeAnnotation(member)), key, scope, depth + 1);
    if (aliased?.type === 'TSUnionType' || aliased?.type === 'UnionTypeAnnotation') {
      const found = aliased.types.map(resolveBranch).filter(Boolean);
      if (!found.length) return null;
      if (found.length === 1) return found[0];
      return { type: aliased.type, types: found };
    }
    // intersection: first match wins - parts contribute disjoint keys (duplicate-key
    // intersections are ill-formed at the TS level anyway)
    if (aliased?.type === 'TSIntersectionType' || aliased?.type === 'IntersectionTypeAnnotation') {
      for (const member of aliased.types) {
        const resolved = resolveBranch(member);
        if (resolved) return resolved;
      }
      return null;
    }
    // tuple numeric index: `type Pair<T> = [T[], string]` / `Pair<number>[0]` -> `number[]`.
    // `length` resolves to the tuple's static arity (`number` literal); handle separately
    // so `Number('length') = NaN` doesn't silently drop the lookup
    if (aliased?.type === 'TSTupleType' || aliased?.type === 'TupleTypeAnnotation') {
      if (key === 'length') return { type: 'TSNumberKeyword' };
      const index = typeof key === 'number' ? key : Number(key);
      if (!Number.isInteger(index) || index < 0) return null;
      const element = findTupleElement(aliased, index, scope);
      return element ? applySubst(element, subst) : null;
    }
    // walk through trivial mapped passthroughs / aliases when looking up members
    const members = getTypeMembers(aliased ?? objectType, scope, depth);
    if (!members) return null;
    for (const member of members) {
      switch (member.type) {
        case 'TSPropertySignature':
        case 'TSMethodSignature':
          if (keyMatchesName(member.key, key)) {
            if (member.type !== 'TSMethodSignature') return withSubst(member.typeAnnotation);
            // getters are TSMethodSignature kind:'get' but semantically read the return
            // value, not a function. plain methods -> function type
            return member.kind === 'get'
              ? withSubst(member.typeAnnotation ?? member.returnType)
              : { type: 'TSFunctionType' };
          }
          break;
        case 'ObjectTypeProperty':
          if (keyMatchesName(member.key, key)) return withSubst(member.value);
          break;
        case 'ClassProperty':
        case 'PropertyDefinition':
        case 'ClassAccessorProperty':
          // class body property: typeAnnotation if present, otherwise we can't infer the type
          if (!member.computed && keyMatchesName(member.key, key)) return withSubst(member.typeAnnotation ?? null);
          break;
        // getter: property access yields the return type (ESTree nests it on `.value.returnType`,
        // babel carries it directly). setter: `break` so iteration continues to a paired getter
        case 'ClassMethod':
        case 'ClassPrivateMethod':
        case 'TSDeclareMethod':
        case 'MethodDefinition':
          if (member.computed || !keyMatchesName(member.key, key)) break;
          if (member.kind === 'get') return withSubst(member.returnType ?? member.value?.returnType);
          if (member.kind === 'set') break;
          return { type: 'TSFunctionType' };
      }
    }
    const indexSig = pickIndexSignature(members, key);
    if (indexSig) return withSubst(indexSig);
    // Flow: ObjectTypeIndexer stored separately in the type node, not in properties
    // resolve through type aliases since getTypeMembers follows aliases but returns only properties
    let resolvedType = objectType;
    let flowSubst = null;
    if (resolvedType.type !== 'ObjectTypeAnnotation') {
      const followed = followTypeAliasChain(resolvedType, scope);
      if (followed.node) {
        resolvedType = followed.node;
        flowSubst = followed.subst;
      }
    }
    if (resolvedType.type === 'ObjectTypeAnnotation' && resolvedType.indexers?.length) {
      const indexerValue = resolvedType.indexers[0].value;
      // deep subst - Flow indexer value can be a wrapped generic (`{[K]: T[]}`)
      return flowSubst ? applyAliasSubstDeep(indexerValue, flowSubst) : indexerValue;
    }
    return null;
  }

  function unwrapTupleMember(element) {
    let node = element;
    // peel TSNamedTupleMember and TSRestType wrappers in any order:
    // [name: string] -> TSNamedTupleMember -> elementType
    // [...number[]] -> TSRestType -> typeAnnotation
    // [...rest: string[]] -> TSRestType -> TSNamedTupleMember -> elementType
    for (let i = 0; i < 2; i++) {
      if (node.type === 'TSNamedTupleMember') node = node.elementType;
      else if (node.type === 'TSRestType') node = node.typeAnnotation;
      else break;
    }
    return node;
  }

  function isTupleRestElement(element) {
    const unwrapped = element.type === 'TSNamedTupleMember' ? element.elementType : element;
    return unwrapped.type === 'TSRestType';
  }

  // get tuple element list: TS uses elementTypes, Flow uses types
  function tupleElements(node) {
    return node.elementTypes || node.types;
  }

  // rebuild tuple AST with elements mapped through `mapper`. preserves the dialect's element
  // slot name (TS: elementTypes, Flow: types) so downstream consumers see the same shape
  function rebuildTupleElements(node, mapper) {
    const slot = node.elementTypes ? 'elementTypes' : 'types';
    return { ...node, [slot]: node[slot].map(mapper) };
  }

  // collapse TSTupleType / TupleTypeAnnotation to Array<commonInner> via resolveTupleInner.
  // empty tuple -> Array<null> (no inner). shared by resolveTypeAnnotation,
  // substituteTypeParams, resolveAwaitedAnnotation - same shape, different per-element resolver
  function tupleAsArrayType(node, resolver) {
    const elements = tupleElements(node);
    return new $Object('Array', elements?.length ? resolveTupleInner(elements, resolver) : null);
  }

  // params list of the function/class referenced by `Parameters<typeof fn>` /
  // `ConstructorParameters<typeof Cls>`. classes without an own constructor inherit - walk
  // `extends` chain until own params (plain function) or a `constructor` method surface
  function resolveParametersParams(typeRef, scope) {
    const name = typeRefName(typeRef);
    if (name !== 'Parameters' && name !== 'ConstructorParameters') return null;
    const arg = getTypeArgs(typeRef)?.params[0];
    if (arg?.type !== 'TSTypeQuery') return null;
    let current = resolveTypeQueryBinding(arg, scope);
    let depth = MAX_DEPTH;
    while (depth-- && current?.node) {
      if (current.node.params) return current.node.params;
      const ctor = current.node.body?.body?.find(m => m?.kind === 'constructor');
      // babel: ClassMethod.params; oxc: MethodDefinition.value.params (FunctionExpression)
      if (ctor) return ctor.params ?? ctor.value?.params ?? null;
      if (!t.isClass(current.node) || !current.node.superClass) return null;
      current = resolveRuntimeExpression(current.get('superClass'));
    }
    return null;
  }

  function findTupleElement(objectType, index, scope) {
    if (index < 0) return null;
    // peel BEFORE alias chain catches direct `Readonly<[T, U]>` indexing. mirrors
    // `findTypeMember`'s peel-then-follow-then-peel pattern
    const peeledBefore = peelStructurePreservingWrapper(objectType);
    if (peeledBefore) return findTupleElement(peeledBefore, index, scope);
    // follow alias chain BEFORE the Parameters check so `type P = Parameters<typeof fn>;
    // P[0]` reaches the Parameters branch - `resolveParametersParams` matches by typeRefName
    // and would see "P" instead of "Parameters" without the alias walk
    const { node: aliased, subst } = followTypeAliasChain(objectType, scope);
    const target = aliased ?? objectType;
    // `Parameters<typeof fn>[N]` / `ConstructorParameters<typeof Cls>[N]` - N-th param's
    // annotation; rest param unwraps `T[]` -> T and covers every index >= its position.
    // alias subst applies if the resolved annotation references type-params of the alias.
    // `applyAliasSubstDeep` is a no-op when `subst` is null, so direct call covers both
    // alias-walked and direct-Parameters cases without a guard
    const params = resolveParametersParams(target, scope);
    if (params) {
      for (let i = 0; i < params.length; i++) {
        const { param, isRest } = effectiveParam(params[i]);
        const annotation = param?.typeAnnotation?.typeAnnotation;
        if (!isRest && i === index) return applyAliasSubstDeep(annotation, subst) ?? null;
        if (isRest) {
          return i <= index
            ? applyAliasSubstDeep(extractElementAnnotation(annotation, scope, 0), subst) ?? null
            : null;
        }
      }
      return null;
    }
    // peel AFTER follow handles `type X = Readonly<[T, U]>; X[0]` (wrapper hidden one
    // level deeper through the alias). without the second peel numeric indexing falls
    // through to generic `_at`
    const peeledAfter = peelStructurePreservingWrapper(target);
    if (peeledAfter) {
      const substituted = applySubst(peeledAfter, subst);
      return findTupleElement(substituted, index, scope);
    }
    if (target.type !== 'TSTupleType' && target.type !== 'TupleTypeAnnotation') return null;
    const elements = tupleElements(target);
    if (!elements?.length) return null;
    // direct hit: [string, ...number[]][0] -> string, [string, ...number[]][1] -> number.
    // rest element NOT at the last position (`[...string[], number][1]` leading;
    // `[string, ...number[], boolean][2]` middle) makes positional indexing semantically
    // ambiguous - the rest's runtime length is unknown, so any index at or past the rest
    // position could be either the rest's element type or a later fixed element. bail to
    // the generic path so dispatch widens. trailing rest stays positional: indices before
    // the rest hit fixed slots, indices at-or-past extend the rest's element type
    const restIndex = elements.findIndex(isTupleRestElement);
    if (restIndex !== -1 && restIndex !== elements.length - 1 && index >= restIndex) return null;
    const element = index < elements.length ? elements[index]
      // beyond tuple length: fall back to rest element if present - [string, ...number[]][5] -> number
      : isTupleRestElement(elements.at(-1)) ? elements.at(-1) : null;
    if (!element) return null;
    const memberNode = isTupleRestElement(element)
      ? extractElementAnnotation(unwrapTupleMember(element), scope, 0) : unwrapTupleMember(element);
    if (!memberNode) return null;
    // deep subst so generic args reach nested shapes: `Pair<T> = [T[], string]` / `Pair<number>[0]` -> `number[]`
    return applyAliasSubstDeep(memberNode, subst);
  }

  function isAssignableTo(candidate, target) {
    if (typesEqual(candidate, target)) {
      // matching outer type (e.g. both Array) - require inner distinction for container types
      // so `Extract<Array<number>|Array<string>, Array<string>>` narrows correctly. target with
      // no inner (bare `Array`) accepts any inner (covariant); mismatched inners reject
      if (!target.inner) return true;
      return innersEqual(candidate.inner, target.inner);
    }
    // any non-primitive is assignable to object / Object
    return !candidate.primitive && !target.primitive && (!target.constructor || target.constructor === 'Object');
  }

  // resolve a type-arg annotation honoring the caller's generic-substitution map when present,
  // so utility-type params (`Awaited<T>`, `Extract<T,U>`, etc.) and deep union members bind
  // against the caller's T/U instead of collapsing to null on raw parameter refs
  function resolveAnnotationInContext(node, scope, depth, typeParamMap, seen) {
    return typeParamMap
      ? substituteTypeParams(node, typeParamMap, scope, depth + 1, seen)
      : resolveTypeAnnotation(node, scope, depth + 1);
  }

  function resolveExtractExclude(first, second, scope, depth, keep, typeParamMap, seen) {
    const resolve = node => resolveAnnotationInContext(node, scope, depth, typeParamMap, seen);
    const target = resolve(second);
    if (!target) return null;
    let unwrapped = unwrapTypeAnnotation(first);
    if (!unwrapped) return null;
    // capture subst so generic union members (`type Foo<T> = T | string`) keep their bindings
    const { node: aliasTarget, subst } = followTypeAliasChain(unwrapped, scope);
    if (aliasTarget) unwrapped = aliasTarget;
    const types = unwrapped.type === 'TSUnionType' || unwrapped.type === 'UnionTypeAnnotation' ? unwrapped.types : [unwrapped];
    let result = null;
    let anyKept = false;
    for (const member of types) {
      const substituted = applySubst(member, subst);
      const resolved = resolve(substituted);
      if (!resolved) return null;
      if (isAssignableTo(resolved, target) !== keep) continue;
      anyKept = true;
      result = commonType(result, resolved);
      if (!result) return null;
    }
    // all members excluded -> never (not null/unknown)
    if (!anyKept) return new $Primitive('never');
    return result;
  }

  // resolve a member of an object/class binding to its runtime value path
  function resolveMemberValuePath(bindingPath, name) {
    let containerPath;
    if (t.isVariableDeclarator(bindingPath.node)) {
      containerPath = resolveRuntimeExpression(bindingPath.get('init'));
    } else if (t.isClassDeclaration(bindingPath.node)) {
      containerPath = bindingPath;
    }
    if (!containerPath?.node) return null;
    if (t.isObjectExpression(containerPath.node)) {
      const property = findObjectMember(containerPath, name);
      if (!property) return null;
      if (t.isObjectProperty(property.node)) return resolveRuntimeExpression(property.get('value'));
      if (t.isObjectMethod(property.node)) return methodFnPath(property);
    }
    if (t.isClass(containerPath.node)) {
      const found = findClassMember(containerPath, name, true);
      if (!found) return null;
      const { member } = found;
      if (t.isClassMethod(member.node)) return methodFnPath(member);
      if (t.isClassProperty(member.node) || t.isClassAccessorProperty(member.node)) {
        const value = member.get('value');
        return value.node ? resolveRuntimeExpression(value) : null;
      }
    }
    return null;
  }

  // resolve TSTypeQuery (typeof x or typeof x.y) to the runtime path of the target.
  // falls back to ambient `declare function/class` when the name isn't in scope.bindings
  // resolve a bare `typeof X` (no member chain) to its declaring path: const-bound value
  // (function/class decl, var declarator with init), runtime-init expression, or ambient
  // (`declare function` / `declare class` not in scope.bindings)
  function resolveBareTypeQueryBinding(name, scope) {
    const bindingPath = constantBindingPath(name, scope);
    if (!bindingPath) return findAmbientDeclarationPath(name, scope, isAmbientFunctionOrClassNode);
    if (t.isFunctionDeclaration(bindingPath.node) || t.isClassDeclaration(bindingPath.node)) return bindingPath;
    if (t.isVariableDeclarator(bindingPath.node)) {
      const init = bindingPath.get('init');
      return init.node ? resolveRuntimeExpression(init) : null;
    }
    return null;
  }

  function resolveTypeQueryBinding(param, scope) {
    if (param.type !== 'TSTypeQuery') return null;
    const segments = collectQualifiedSegments(param.exprName);
    if (!segments?.length) return null;
    const [rootName, ...path] = segments;
    if (path.length === 0) return resolveBareTypeQueryBinding(rootName, scope);
    // 2-segment runtime member access: `const obj = {fn:...}; typeof obj.fn`. deeper paths
    // through nested ObjectExpression initializers fall through to the namespace branch -
    // runtime-init descent isn't wired here. const+namespace declaration merging also
    // falls through when the value side has no matching member
    if (path.length === 1) {
      const bindingPath = constantBindingPath(rootName, scope);
      if (bindingPath) {
        const memberValue = resolveMemberValuePath(bindingPath, path[0]);
        if (memberValue) return memberValue;
      }
    }
    // namespace path: `namespace NS { declare function fn() }` - babel doesn't bind NS as
    // a value (or has a separate value binding via decl merging). arbitrary-depth qualified
    // names handled here via TSModuleDeclaration scope walk
    return findNamespacedFunctionPath(segments, scope);
  }

  // locate the function-like TYPE that a `typeof X` / `typeof X.Y[.Z...]` annotation points
  // at. `declare const` bindings have no runtime init to resolve - the type lives on the
  // binding's annotation instead. arbitrary-depth qualified names walk the root binding's
  // annotation segment-by-segment via `findTypeMember` (which already handles substitution,
  // union/intersection branches, and returns the member type unwrapped from TSTypeAnnotation).
  // returns {type, scope} or null
  function findTypeQueryFunctionType(exprName, scope) {
    const segments = collectQualifiedSegments(exprName);
    if (!segments?.length) return null;
    const [rootName, ...path] = segments;
    const binding = constantBindingPath(rootName, scope);
    if (!binding) return null;
    let annotation = unwrapTypeAnnotation(findBindingAnnotation(binding));
    if (!annotation) return null;
    for (const name of path) {
      const member = findTypeMember(annotation, name, binding.scope);
      if (!member) return null;
      annotation = unwrapTypeAnnotation(member);
      if (!annotation) return null;
    }
    return { type: annotation, scope: binding.scope };
  }

  // TS resolves `ReturnType<typeof fn>` against the LAST overload signature when `fn` is an
  // ambient with multiple `declare function` headers; earlier headers are specialized cases,
  // the last is canonical (mirrors `infer R` over an intersection-of-call-signatures, which
  // picks the rightmost). retarget the binding here. runtime `FunctionDeclaration` can't
  // overload, so non-ambient bindings stay as-is
  function pickLastAmbientOverload(resolved, param, scope) {
    if (!resolved || !isAmbientFunctionNode(resolved.node)) return resolved;
    if (param.type !== 'TSTypeQuery' || param.exprName?.type !== 'Identifier') return resolved;
    const ambients = findAmbientFunctionPaths(param.exprName.name, scope);
    return ambients.length > 1 ? ambients.at(-1) : resolved;
  }

  function resolveReturnTypeFromTypeQuery(param, scope) {
    const resolved = pickLastAmbientOverload(resolveTypeQueryBinding(param, scope), param, scope);
    if (isFunctionLike(resolved?.node)) return resolveReturnType(resolved);
    if (param?.type !== 'TSTypeQuery') return null;
    // `resolveTypeQueryBinding` returns null for no-init `declare const` shapes; fall back to
    // the annotation-only path which also handles qualified names (`typeof NS.fn`)
    const fnType = findTypeQueryFunctionType(param.exprName, scope);
    const ret = fnType && functionTypeReturnAnnotation(fnType.type);
    return ret ? resolveTypeAnnotation(ret, fnType.scope) : null;
  }

  function resolveKnownContainerType(name, base, node, innerResolver) {
    if (!base) return null;
    if (!SINGLE_ELEMENT_COLLECTIONS.has(name) && name !== 'Promise') return base;
    const params = getTypeArgs(node)?.params;
    if (params?.[0]) {
      const inner = innerResolver(params[0]);
      if (inner && !isNullableOrNever(inner)) return new $Object(base.constructor, inner);
    }
    return base;
  }

  function resolveConstructorType(name, path) {
    return resolveKnownContainerType(name, resolveKnownConstructor(name), path.node, p => resolveTypeAnnotation(p, path.scope));
  }

  function resolveConstructorCallType(name, path) {
    if (!hasOwn(KNOWN_CONSTRUCTORS, name)) return null;
    const callResult = typeFromHint(KNOWN_CONSTRUCTORS[name].call);
    if (callResult.primitive) return callResult;
    return resolveKnownContainerType(name, callResult, path.node, p => resolveTypeAnnotation(p, path.scope));
  }

  // TS 5.6+ stdlib base-classes share method tables with their concrete pairs
  const CONSTRUCTOR_ALIASES = assign(create(null), {
    IteratorObject: 'Iterator',
    AsyncIteratorObject: 'AsyncIterator',
  });

  function resolveNamedType(name, node, scope, depth, typeParamMap, seen) {
    // PromiseLike / Thenable are structural Promise supertypes for await / Awaited<>;
    // aliasing upfront lets the Promise branch of resolveKnownContainerType handle both
    if (PROMISE_SYNONYMS.has(name)) name = 'Promise';
    if (hasOwn(CONSTRUCTOR_ALIASES, name)) name = CONSTRUCTOR_ALIASES[name];
    const resolveArgInner = arg => resolveAnnotationInContext(arg, scope, depth, typeParamMap, seen);
    const known = resolveKnownContainerType(name, resolveKnownConstructor(name), node, resolveArgInner);
    if (known) return known;
    const firstArg = () => getTypeArgs(node)?.params[0];
    const resolveArg = (arg, fallback) => arg
      ? resolveArgInner(arg) ?? fallback
      : null;
    // structure-preserving wrappers (T[] stays array, {..} stays object). null fallback
    // to $Object('Object') keeps arg-type=object filters firing for TSTypeLiteral inners
    if (STRUCTURE_PRESERVING_WRAPPERS.has(name)) return resolveArg(firstArg(), new $Object('Object'));
    switch (name) {
      // structurally new shape from their type parameter - collapse to Object
      case 'Record':
      case '$Shape':
      case '$Diff':
      case '$Rest':
      case '$ObjMap':
      case '$ObjMapi':
      case '$ObjMapConst':
        return new $Object('Object');
      case 'Parameters':
      case 'ConstructorParameters': {
        // tuple approximated as Array<first-param-type> so chained `.at(0)` / `.forEach`
        // resolve; indexed access `T[N]` picks the N-th via `findTupleElement`
        const { param, isRest } = effectiveParam(resolveParametersParams(node, scope)?.[0]);
        const resolved = param?.typeAnnotation ? resolveArgInner(param.typeAnnotation) : null;
        // `...xs: T[]` - annotation is `T[]`, the tuple element is T
        const inner = isRest ? resolveInnerType(resolved) : resolved;
        return inner && !isNullableOrNever(inner) ? new $Object('Array', inner) : new $Object('Array');
      }
      // Flow: $Keys
      case 'Uppercase':
      case 'Lowercase':
      case 'Capitalize':
      case 'Uncapitalize':
      case '$Keys':
        return new $Primitive('string');
      // TS lib alias for `string | number | symbol`; no shared polyfill API, null lets
      // downstream fall back to generic-instance emission
      case 'PropertyKey':
        return null;
      // transparent wrappers resolving type parameter. Flow: $Exact
      case 'NoInfer':
      case '$Exact':
        return resolveArg(firstArg(), null);
      // resolve type parameter, strip nullable/never. Flow: $NonMaybeType
      case 'NonNullable':
      case '$NonMaybeType': {
        const arg = firstArg();
        return arg ? resolveNonNullableAnnotation(arg, scope, depth, typeParamMap, seen) : null;
      }
      case 'Awaited': {
        const arg = firstArg();
        return arg ? resolveAwaitedAnnotation(arg, scope, depth, typeParamMap, seen) : null;
      }
      case 'ReturnType': {
        const arg = firstArg();
        if (!arg) return null;
        // TSTypeQuery (`ReturnType<typeof fn>`) routes through runtime-binding lookup.
        // direct function type alias (`type Fn = () => T; ReturnType<Fn>`) has no typeof -
        // follow the alias chain, extract return annotation, fold accumulated subst into it
        // (mirrors Awaited / Extract / findTupleElement)
        if (arg.type === 'TSTypeQuery') return resolveReturnTypeFromTypeQuery(arg, scope);
        const { node: aliased, subst } = followTypeAliasChain(unwrapTypeAnnotation(arg), scope);
        const ret = functionTypeReturnAnnotation(unwrapTypeAnnotation(aliased));
        return ret ? resolveTypeAnnotation(applySubst(ret, subst), scope) : null;
      }
      case 'InstanceType': {
        const arg = firstArg();
        const resolved = arg ? resolveTypeQueryBinding(arg, scope) : null;
        if (!(t.isClass(resolved?.node) || isAmbientClassNode(resolved?.node))) return null;
        return resolveClassInheritance(resolved) || new $Object('Object');
      }
      case 'Extract':
      case 'Exclude': {
        const params = getTypeArgs(node)?.params;
        return params?.length >= 2
          ? resolveExtractExclude(params[0], params[1], scope, depth, name === 'Extract', typeParamMap, seen) : null;
      }
      // Flow $ReadOnlyArray<T> -> Array with inner type (equivalent to ReadonlyArray<T>)
      case '$ReadOnlyArray': {
        const arg = firstArg();
        return new $Object('Array', arg ? resolveNonNullableAnnotation(arg, scope, depth, typeParamMap, seen) : null);
      }
      // conservative: unknown for Flow variants we don't model structurally
      case '$Values':
      case '$ElementType':
      case '$PropertyType':
      case '$Call':
        return null;
    }
    return resolveUserDefinedType(name, node, scope, depth, undefined, seen);
  }

  // TS literal types: 'hello', 42, true, etc.
  function resolveLiteralType(node) {
    if (!node.literal) return null;
    switch (babelNodeType(node.literal)) {
      case 'StringLiteral':
      case 'TemplateLiteral':
        return new $Primitive('string');
      case 'NumericLiteral':
        return new $Primitive('number');
      case 'BooleanLiteral':
        return new $Primitive('boolean');
      case 'BigIntLiteral':
        return new $Primitive('bigint');
      // signed-numeric literal types: `-1` / `-1n` wrap UnaryExpression around the magnitude
      case 'UnaryExpression':
        return new $Primitive(isLiteralOf(node.literal.argument, 'BigInt') ? 'bigint' : 'number');
    }
    return null;
  }

  // TS conditional type: T extends U ? X : Y - resolve if both branches have the same
  // type, or one is `never`. `T extends (infer U)[] ? U : never` with T already substituted
  // (via alias-chain) is the canonical element-extraction shape: trueType references the
  // inferred name, falseType is never-like. match first so `First<string[]>` resolves to
  // `string` instead of collapsing through the generic branches (which can't resolve the
  // naked `U` reference)
  function resolveConditionalType(node, scope, depth) {
    const inferred = resolveInferElementPattern(node, null, scope, depth, null);
    if (inferred) return inferred;
    return resolveConditionalBranches(
      resolveTypeAnnotation(node.trueType, scope, depth + 1),
      resolveTypeAnnotation(node.falseType, scope, depth + 1));
  }

  // TS indexed access type: Config["items"], [string, number[]][1], Items[number], or Dict[string]
  function resolveIndexedAccessType(node, scope, depth) {
    // T[number] - element type of array/tuple
    if (node.indexType?.type === 'TSNumberKeyword') return resolveElementType(node.objectType, scope, depth + 1);
    // T[string] - string index signature type
    if (node.indexType?.type === 'TSStringKeyword') {
      const members = getTypeMembers(node.objectType, scope);
      if (members) for (const member of members) {
        if (member.type === 'TSIndexSignature' && member.typeAnnotation
          && member.parameters?.[0]?.typeAnnotation?.typeAnnotation?.type === 'TSStringKeyword') {
          return resolveTypeAnnotation(member.typeAnnotation, scope, depth + 1);
        }
      }
      return null;
    }
    // `T['a' | 'b']` - union of literal indices. fold each branch back through this same
    // resolver (each with one TSLiteralType indexType); `foldUnionTypes` aggregates to the
    // widest common type, handing us precise inference when all branches agree
    if (node.indexType?.type === 'TSUnionType') {
      return foldUnionTypes(node.indexType.types, branch => resolveTypeAnnotation(
        { type: 'TSIndexedAccessType', objectType: node.objectType, indexType: branch },
        scope,
        depth + 1,
      ));
    }
    // template-literal type index `T[\`foo\`]` without interpolations is equivalent to
    // `T['foo']` - TS-level evaluation of the template yields a plain string literal.
    // interpolations (`T[\`_${K}\`]`) would require compile-time type-string computation
    // (mapped-type renamers like `as \`_${K & string}\``); conservative bail for now.
    // TS wraps template literals in TSLiteralType { literal: TemplateLiteral }; unwrap first
    const literalIndex = node.indexType?.type === 'TSLiteralType' ? node.indexType.literal : node.indexType;
    const quasi = singleQuasiString(literalIndex);
    if (quasi !== null) {
      const member = findTypeMember(node.objectType, quasi, scope);
      return member ? resolveTypeAnnotation(member, scope, depth + 1) : null;
    }
    if (node.indexType?.type !== 'TSLiteralType') return null;
    const { literal } = node.indexType;
    let member;
    if (isLiteralOf(literal, 'String')) member = findTypeMember(node.objectType, literal.value, scope);
    else if (isLiteralOf(literal, 'Numeric')) member = findTupleElement(node.objectType, literal.value, scope);
    return member ? resolveTypeAnnotation(member, scope, depth + 1) : null;
  }

  function resolveTypeAnnotation(node, scope, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    switch (babelNodeType(node)) {
      // TS / Flow primitive keywords + literal-typeof + TSTemplateLiteralType (`prefix_${string}`)
      case 'TSStringKeyword':
      case 'StringTypeAnnotation':
      case 'StringLiteralTypeAnnotation':
      case 'TSTemplateLiteralType':
        return new $Primitive('string');
      case 'TSNumberKeyword':
      case 'NumberTypeAnnotation':
      case 'NumberLiteralTypeAnnotation':
        return new $Primitive('number');
      // boolean keywords + TSTypePredicate (`x is string` -> boolean)
      case 'TSBooleanKeyword':
      case 'BooleanTypeAnnotation':
      case 'BooleanLiteralTypeAnnotation':
      case 'TSTypePredicate':
        return new $Primitive('boolean');
      case 'TSBigIntKeyword':
      case 'BigIntTypeAnnotation':
        return new $Primitive('bigint');
      case 'TSSymbolKeyword':
      case 'SymbolTypeAnnotation':
        return new $Primitive('symbol');
      case 'TSVoidKeyword':
      case 'TSUndefinedKeyword':
      case 'VoidTypeAnnotation':
        return new $Primitive('undefined');
      case 'TSNullKeyword':
      case 'NullLiteralTypeAnnotation':
        return new $Primitive('null');
      case 'TSNeverKeyword':
      case 'EmptyTypeAnnotation':
        return new $Primitive('never');
      // TS `object` keyword = any non-primitive, too broad to narrow polyfills
      case 'TSObjectKeyword':
        return new $Object(null);
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'FunctionTypeAnnotation':
        return new $Object('Function');
      // TS `{}` without members matches ANY non-nullish runtime value - primitives (string,
      // number, bigint, boolean, symbol), functions, all constructor objects (Array, Map,
      // Promise, Date, ...), user classes. returning `$Object('Object')` would narrow to
      // Object-methods only and misroute `.at()` / `.includes()` etc; null routes through
      // `resolveHint` common/rest fallback which is the correct conservative choice.
      // `TSImportType` (`typeof import('x')`) explicit so future extension doesn't need to
      // untangle a silent fall-through through `TSTypeReference`.
      // `TSAnyKeyword` / `TSUnknownKeyword` / `AnyTypeAnnotation` / `MixedTypeAnnotation`
      // are wide-open: type-guard narrowing (`classifyGuardAnnotation:'open'`) refines them
      // contextually; bare resolution stays null so the hint dispatcher takes the same
      // conservative path as for `{}`
      case 'TSTypeLiteral':
      case 'ObjectTypeAnnotation':
      case 'TSImportType':
      case 'TSAnyKeyword':
      case 'TSUnknownKeyword':
      case 'AnyTypeAnnotation':
      case 'MixedTypeAnnotation':
        return null;
      // TS mapped type: detect the trivial passthrough `{ [K in keyof T]: T[K] }` and resolve
      // through to T directly; everything else is structurally opaque
      case 'TSMappedType': {
        const passthrough = unwrapMappedTypePassthrough(node);
        return passthrough ? resolveTypeAnnotation(passthrough, scope, depth + 1) : null;
      }
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return new $Object('Array', resolveNonNullableAnnotation(node.elementType, scope, depth));
      case 'TSTupleType':
      case 'TupleTypeAnnotation':
        return tupleAsArrayType(node, e => resolveTypeAnnotation(e, scope, depth + 1));
      // TS / Flow named types - only well-known built-ins and utility types.
      // handle dotted refs (`NS.Data`) by joining segments so resolveNamedType /
      // findTypeDeclaration can split them back into a path-walk
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const segments = typeRefSegments(node);
        if (!segments) return null;
        return resolveNamedType(segments.join('.'), node, scope, depth);
      }
      // transparent wrappers - unwrap and resolve the inner type
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1);
      // TS type operator: `readonly T[]`, `unique symbol` - but NOT `keyof T`
      case 'TSTypeOperator':
        return node.operator === 'keyof' ? null : resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1);
      // TS typeof in type position: `typeof variable`
      case 'TSTypeQuery':
        return resolveTypeQuery(node, scope);
      // Flow typeof in type position: `typeof variable`
      case 'TypeofTypeAnnotation': {
        const arg = node.argument;
        return arg?.type === 'GenericTypeAnnotation'
          ? resolveTypeofFromSegments(collectQualifiedSegments(arg.id), scope) : null;
      }
      case 'TSConditionalType':
        return resolveConditionalType(node, scope, depth);
      // TS / Flow union and intersection - resolve if all (non-nullable for unions) members have the same type
      case 'TSUnionType':
      case 'UnionTypeAnnotation': {
        const { types } = node;
        if (!types || !types.length) return null;
        return foldUnionTypes(types, member => resolveTypeAnnotation(member, scope, depth + 1));
      }
      case 'TSIntersectionType':
      case 'IntersectionTypeAnnotation': {
        const { types } = node;
        if (!types || !types.length) return null;
        return foldIntersectionTypes(types, member => resolveTypeAnnotation(member, scope, depth + 1));
      }
      case 'TSLiteralType':
        return resolveLiteralType(node);
      case 'TSIndexedAccessType':
        return resolveIndexedAccessType(node, scope, depth);
    }
    return null;
  }

  // dispatcher over the two pattern-key walkers (ArrayPattern numeric index / ObjectPattern
  // string key). returns null for anything else (Identifier handled by caller, RestElement
  // / nested patterns covered inside the underlying walkers). shared by `assignmentBindsTarget`
  // (predicate) and resolvePath's destructure branch (key-path consumer)
  function findPatternKeyPath(pattern, name, scope) {
    if (pattern?.type === 'ArrayPattern') return findArrayPatternKeyPath(pattern, name, scope);
    if (pattern?.type === 'ObjectPattern') return findDestructuredKeyPath(pattern, name, scope);
    return null;
  }

  // walk an RHS path (`right` of an AssignmentExpression with destructure LHS) along the
  // key-path produced by `findPatternKeyPath`, returning the path bound to that slot - or
  // null when the RHS shape doesn't match (annotation fallback handled by callers). path-
  // returning companion to `resolveObjectMemberPath` which produces a Type; used in
  // resolvePath where downstream needs the live Path
  function followKeyPathInRhs(rhsPath, keyPath) {
    if (!keyPath?.length) return null;
    let cur = resolveRuntimeExpression(rhsPath);
    for (const step of keyPath) {
      if (typeof step === 'number') {
        // -1 marks rest-element ("whole tail" slice) - no single Path to surface
        if (step < 0) return null;
        if (!t.isArrayExpression(cur.node) || cur.node.elements.length <= step) return null;
        const next = cur.get('elements')[step];
        if (!next?.node) return null;
        cur = resolveRuntimeExpression(next);
      } else {
        if (!t.isObjectExpression(cur.node)) return null;
        const prop = findObjectMember(cur, step);
        if (!prop?.node || !t.isObjectProperty(prop.node)) return null;
        cur = resolveRuntimeExpression(prop.get('value'));
      }
    }
    return cur;
  }

  // --- Type utilities & runtime expression resolver ---
  function resolvePath(path) {
    let depth = MAX_DEPTH;
    while (depth-- && t.isIdentifier(path.node)) {
      if (!path.scope) break;
      const binding = path.scope?.getBinding(path.node.name);
      if (!binding) break;
      // mutable binding with reassignments: follow the last preceding-block `=` assignment
      // before `path` so `let f: Foo = init; f = { kind:'b', data:'str' }; f.data.at(0)`
      // (and `if (...) { f = {...}; f.data.at(0); }`) narrows `f` to the RHS shape, not the
      // declared union. uses `findPrecedingBlockAssignment` (relative to use site) rather
      // than `findLastStraightLineAssignment` (relative to var-scope) so assignments nested
      // in conditional blocks still apply when the use site shares the same block
      if (binding.constantViolations?.length) {
        const lastAssign = findPrecedingBlockAssignment(binding, path);
        if (lastAssign?.node?.type === 'AssignmentExpression' && lastAssign.node.operator === '=') {
          const { left } = lastAssign.node;
          // simple `f = X` reassignment - follow RHS directly
          if (left?.type === 'Identifier' && left.name === path.node.name) {
            path = lastAssign.get(assignRightKey(lastAssign.node));
            continue;
          }
          // destructure-assignment `[f] = [X]` / `({f} = {f: X})` - resolveBindingType handles
          // these via key-path walks, but resolvePath is invoked from `resolveRuntimeExpression`
          // (member-chain resolution) which never reaches that fallback. extract the matching
          // RHS slot here so `f.data.at(0)` after `[f] = [{data: ['x']}]` narrows correctly
          const keyPath = findPatternKeyPath(left, path.node.name, lastAssign.scope);
          if (keyPath) {
            const elem = followKeyPathInRhs(lastAssign.get('right'), keyPath);
            if (elem?.node) {
              path = elem;
              continue;
            }
          }
          break;
        }
        break;
      }
      const { path: bindingPath } = binding;
      const initPath = followableVarInit(bindingPath);
      if (initPath) {
        path = initPath;
        continue;
      }
      if (isFunctionOrClassDeclaration(bindingPath.node)) return bindingPath;
      break;
    }
    return path;
  }

  // returns the init path to follow for `const X = init` style bindings, or null when:
  //  - not a VariableDeclarator (function / class / param / catch / import...)
  //  - destructured binding (init is the collection, not the element value)
  //  - explicit annotation + nullish placeholder init (`const x: T | null = null`) -
  //    annotation declares the intended runtime type; init is a placeholder, so
  //    `resolveBindingType` will pick the annotation up downstream
  // broader annotations (`object`, `any`) fall through to init so `const x: object =
  // [1, 2, 3]` narrows to Array via the init expression
  function followableVarInit(bindingPath) {
    if (!t.isVariableDeclarator(bindingPath.node)) return null;
    const { id } = bindingPath.node;
    if (id?.type === 'ObjectPattern' || id?.type === 'ArrayPattern') return null;
    const initPath = bindingPath.get('init');
    if (!initPath?.node) return null;
    if (id?.typeAnnotation && isNullishInit(initPath.node)) return null;
    return initPath;
  }

  // `null` / `undefined` literal or `void <expr>` - placeholders that don't reflect runtime
  // type. covers babel `NullLiteral` + ESTree `Literal { value: null }` (oxc); the `regex`
  // guard excludes `/foo/` literals which also reuse the `Literal` node in ESTree.
  // shared `peelFallbackWrappers` strips ParenthesizedExpression / TS expression wrappers
  // (`null as any`, `(null)`) so the nullish-tail is recognized through user-applied wrappers
  function isNullishInit(node) {
    const inner = peelFallbackWrappers(node);
    if (!inner) return false;
    if (inner.type === 'NullLiteral') return true;
    if (inner.type === 'Literal' && inner.value === null && !inner.regex) return true;
    if (inner.type === 'Identifier' && inner.name === 'undefined') return true;
    return inner.type === 'UnaryExpression' && inner.operator === 'void';
  }

  function resolveNumericType(path) {
    // `resolveNodeType` on a bare Identifier stops at the identifier itself without
    // descending to its binding init - `resolvePath` walks `const x = BigInt(1)` so
    // `x++` sees the BigInt-typed init. `number` fallback kept for unresolvable paths
    const resolved = resolveNodeType(resolvePath(path));
    return new $Primitive(primitiveTypeOf(resolved) === 'bigint' ? 'bigint' : 'number');
  }

  // resolve property name from a MemberExpression, handling both
  // non-computed (obj.prop), string/numeric literal (obj['prop'], obj[0]),
  // constant binding (const key = 'prop'; obj[key]) and enum member access (`obj[Enum.A]`)
  function resolveMemberPropertyName(path) {
    const { property, computed } = path.node;
    if (!computed) return getKeyName(property);
    return literalKeyValue(property)
      ?? literalKeyValue(resolveRuntimeExpression(path.get('property')).node)
      ?? resolveComputedKeyName(property, path.scope);
  }

  // intentionally compares only outer type identity (type + constructor), ignoring `inner`
  function typesEqual(a, b) {
    return a.type === b.type && a.constructor === b.constructor;
  }

  // deep equality of inner type hints (string hints or type objects)
  function innersEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (typeof a === 'string' || typeof b === 'string') return a === b;
    return typesEqual(a, b) && innersEqual(a.inner, b.inner);
  }

  // merge two types into a common type: returns null if outer types differ,
  // strips inner if outer types match but inner types disagree
  function commonType(existing, incoming) {
    if (!existing) return incoming;
    if (!typesEqual(existing, incoming)) return null;
    if (existing.primitive || innersEqual(existing.inner, incoming.inner)) return existing;
    return new $Object(existing.constructor);
  }

  function isNullableOrNever(resolved) {
    return resolved.type === 'null' || resolved.type === 'undefined' || resolved.type === 'never';
  }

  // unified fold: resolve each member, classify via `classify(resolved)`:
  //   FOLD (2) - contribute to commonType
  //   SKIP (1) - skip member, track as fallback for all-skipped case
  //   BAIL (0) - abort, return null
  function foldTypes(members, resolve, classify) {
    let result = null;
    let skipped = null;
    for (const member of members) {
      const resolved = resolve(member);
      const action = classify(resolved);
      if (action === 0) return null; // BAIL
      if (action === 1) { // SKIP
        if (resolved) skipped ??= resolved;
        continue;
      }
      result = commonType(result, resolved);
      if (!result) return null;
    }
    return result ?? skipped;
  }

  // fold union members: unresolvable -> bail, nullable/never -> skip, rest -> fold
  function foldUnionTypes(types, resolve) {
    return foldTypes(types, resolve, r => !r ? 0 : isNullableOrNever(r) ? 1 : 2);
  }

  // fold intersection members: unresolvable or plain Object -> skip, rest -> fold
  function foldIntersectionTypes(types, resolve) {
    return foldTypes(types, resolve, r => !r || (!r.primitive && (!r.constructor || r.constructor === 'Object')) ? 1 : 2);
  }

  // compute common inner type from tuple elements using a parameterized resolver
  // returns the common type if all non-nullable elements agree, null otherwise
  function resolveTupleInner(elements, resolver) {
    const result = foldTypes(elements, elem => {
      // rest element: ...string[] or ...Array<string> - resolve the collection type, use its inner
      if (isTupleRestElement(elem)) return resolveInnerType(resolver(unwrapTupleMember(elem)));
      return resolver(unwrapTupleMember(elem));
    }, r => !r ? 0 : isNullableOrNever(r) ? 1 : 2);
    // all-nullable tuples: return null (unknown inner), not the nullable fallback
    return result && isNullableOrNever(result) ? null : result;
  }

  // resolve a type annotation, returning null for nullable/never types (not useful as inner types)
  function resolveNonNullableAnnotation(node, scope, depth, typeParamMap, seen) {
    if (!node) return null;
    const resolved = resolveAnnotationInContext(node, scope, depth, typeParamMap, seen);
    return resolved && !isNullableOrNever(resolved) ? resolved : null;
  }

  // resolve conditional type branches: if both match return that type, if one is `never` return the other
  function resolveConditionalBranches(trueBranch, falseBranch) {
    if (trueBranch && falseBranch) {
      const merged = commonType(trueBranch, falseBranch);
      if (merged) return merged;
    }
    if (trueBranch?.type === 'never') return falseBranch;
    if (falseBranch?.type === 'never') return trueBranch;
    return null;
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
  // not resolved $Primitive / $Object types). complementary к `pickConditionalBranch` —
  // operates on AST shape after subst applied, so literal-type precision (`'narrow'`
  // vs primitive `string`) is preserved. returns true / false / null (undecidable)
  function pickConditionalBranchByAST(check, extend) {
    if (!check || !extend) return null;
    check = peelTSParenthesized(check);
    extend = peelTSParenthesized(extend);
    // both literal types: compare values (the precision case `'narrow' extends 'narrow'`)
    if (check?.type === 'TSLiteralType' && extend?.type === 'TSLiteralType') {
      const cv = check.literal?.value;
      const ev = extend.literal?.value;
      if (cv !== undefined && ev !== undefined) return cv === ev;
    }
    return null;
  }

  function pickConditionalBranch(check, extend, extendNode) {
    if (!check || !extend) return null;
    if (typesEqual(check, extend)) {
      if (innersEqual(check.inner, extend.inner)) return true;
      // extends has no inner constraint: matches anything ONLY when the raw shape is
      // an unparameterised type reference (`Array` -> `Array<any>`). concrete-shape
      // extends (`[]` empty tuple, etc) post-subst as inner-less but do NOT match
      // arbitrary inners
      if (!extend.inner) return isUnconstrainedTypeReference(extendNode) ? true : null;
      // check side unconstrained against a concrete extend - can't statically decide
      if (!check.inner) return null;
      // both concrete, differing inners (Array<number> vs Array<string>): disjoint
      return false;
    }
    // different primitive types (number vs string): truly disjoint
    if (check.primitive && extend.primitive) return false;
    // anything else (Array vs Iterable etc) - subtype relations exist, can't decide
    return null;
  }

  // raw AST shape predicate: `Array` / `Promise` / `Set` ... without `<...>` typeArguments
  // is TS shorthand for `Array<any>` / `Promise<any>` / etc, which structurally match any
  // concrete inner. concrete-shape sites (`[]` empty tuple, `{}` object literal type, etc)
  // resolve to the same inner-less Type object but should NOT match arbitrary inners
  function isUnconstrainedTypeReference(node) {
    if (!node) return false;
    const target = peelTSParenthesized(node);
    if (target?.type !== 'TSTypeReference' && target?.type !== 'GenericTypeAnnotation') return false;
    return !getTypeArgs(target)?.params?.length;
  }

  // resolve `T extends U ? trueType : falseType` post-subst:
  //   1) narrow `(infer U)[]` / `Array<infer U>` short-circuit (resolveInferElementPattern)
  //   2) structural eval via pickConditionalBranch - lazy: substitute only the chosen branch
  //   3) fall through to resolveConditionalBranches's commonType / never-strip fold
  // shared between substituteTypeParams's TSConditionalType case and any future caller
  // that needs the same evaluation contract for a TSConditionalType node
  function evaluateConditionalType(node, typeParamMap, scope, depth, seen) {
    const inferred = resolveInferElementPattern(node, typeParamMap, scope, depth, seen);
    if (inferred) return inferred;
    const checkResolved = substituteTypeParams(node.checkType, typeParamMap, scope, depth + 1, seen);
    const extendsResolved = substituteTypeParams(node.extendsType, typeParamMap, scope, depth + 1, seen);
    const branch = pickConditionalBranch(checkResolved, extendsResolved, node.extendsType);
    if (branch !== null) {
      return substituteTypeParams(branch ? node.trueType : node.falseType,
        typeParamMap, scope, depth + 1, seen);
    }
    return resolveConditionalBranches(
      substituteTypeParams(node.trueType, typeParamMap, scope, depth + 1, seen),
      substituteTypeParams(node.falseType, typeParamMap, scope, depth + 1, seen));
  }

  // narrow infer pattern: `T extends (infer U)[] ? U : X` / `T extends Array<infer U> ? U : X`.
  // when the pattern matches AND checkType's substituted type is an array-like, returns the
  // element type. any other shape (nested infers, non-array containers, trueType != U) -> null,
  // caller falls back to plain branch resolution
  function resolveInferElementPattern(node, typeParamMap, scope, depth, seen) {
    const inferName = matchArrayInferPattern(node.extendsType);
    if (!inferName) return null;
    if (typeRefName(node.trueType) !== inferName) return null;
    const checkType = substituteTypeParams(node.checkType, typeParamMap, scope, depth + 1, seen);
    return checkType ? resolveInnerType(checkType) : null;
  }

  // `Container<infer U>` is a recognised narrow pattern when the container's `.inner`
  // slot semantically stores its type parameter - exactly the set of `SINGLE_ELEMENT_COLLECTIONS`
  // plus Promise (and its structural synonyms, which alias to Promise via `resolveNamedType`)
  function isInferContainerName(name) {
    return SINGLE_ELEMENT_COLLECTIONS.has(name) || name === 'Promise' || PROMISE_SYNONYMS.has(name);
  }

  // extracts `U` from `(infer U)[]`, `readonly (infer U)[]`, or `Container<infer U>`
  // where Container is a known single-element generic. returns null otherwise
  function matchArrayInferPattern(extendsType) {
    let node = unwrapTypeAnnotation(extendsType);
    // peel `readonly X` modifier (TSTypeOperator operator='readonly')
    if (node?.type === 'TSTypeOperator' && node.operator === 'readonly') node = node.typeAnnotation;
    if (node?.type === 'TSArrayType') {
      // babel wraps `(infer U)` in TSParenthesizedType; oxc collapses to bare TSInferType.
      // peel the wrapper so both shapes reach the inner inference name
      const element = peelTSParenthesized(node.elementType);
      if (element?.type === 'TSInferType') {
        return element.typeParameter?.name?.name ?? element.typeParameter?.name;
      }
    }
    if (node?.type === 'TSTypeReference' && isInferContainerName(typeRefName(node))) {
      const arg = getTypeArgs(node)?.params?.[0];
      if (arg?.type === 'TSInferType') return arg.typeParameter?.name?.name ?? arg.typeParameter?.name;
    }
    return null;
  }

  // `op === '??'` ('??' / '??='): left contributes only when non-nullish - if left is
  // statically null/undefined primitive, right is the only runtime value. similarly for
  // `||`/`||=`: literal-null/undefined left always falls through to right. without this
  // peel, `null ?? 'a'` yields commonType(null, string) = null, losing the string type
  function resolveUnionType(leftPath, rightPath, op) {
    const left = resolveNodeType(leftPath);
    const right = resolveNodeType(rightPath);
    if (left && right && (op === '??' || op === '??=' || op === '||' || op === '||=')
        && isNullableOrNever(left)) return right;
    return left && right ? commonType(left, right) : null;
  }

  // recognize Babel's destructuring default desugaring: _ref === void 0 ? DEFAULT : _ref
  // and resolve to the type of DEFAULT (the consequent branch)
  function resolveDesugarDefaultTernary(path) {
    const { test, alternate } = path.node;
    if (test.type !== 'BinaryExpression' || test.operator !== '===') return null;
    const { left, right } = test;
    const refName = checkSelfTernaryRefName(left, right);
    if (!refName) return null;
    if (alternate.type !== 'Identifier' || alternate.name !== refName) return null;
    return resolveNodeType(path.get('consequent'));
  }

  // identify the destructure-ref name from a default-ternary test. babel emits
  // `_ref === void 0`; swc / esbuild emit `typeof _ref === 'undefined'`. both desugar
  // the same `function({x = D})` pattern - missing the typeof form silently dropped
  // type inference for any swc / esbuild output passed through the plugin
  function checkSelfTernaryRefName(left, right) {
    if (left.type === 'Identifier' && isVoidZero(right)) return left.name;
    if (left.type === 'UnaryExpression' && left.operator === 'typeof'
      && left.argument?.type === 'Identifier' && isUndefinedString(right)) return left.argument.name;
    return null;
  }

  function isVoidZero(node) {
    return node.type === 'UnaryExpression' && node.operator === 'void'
      && isLiteralOf(node.argument, 'Numeric') && node.argument.value === 0;
  }

  function isUndefinedString(node) {
    if (isLiteralOf(node, 'String') && node.value === 'undefined') return true;
    return node?.type === 'Literal' && node.value === 'undefined';
  }

  function resolveBinaryOperatorType(operator, leftPath, rightPath) {
    switch (operator) {
      case '+': {
        const leftType = primitiveTypeOf(resolveNodeType(leftPath));
        const rightType = primitiveTypeOf(resolveNodeType(rightPath));
        if (leftType === 'string' || rightType === 'string') return new $Primitive('string');
        if (leftType === 'number' && rightType === 'number') return new $Primitive('number');
        if (leftType === 'bigint' && rightType === 'bigint') return new $Primitive('bigint');
        return new $Primitive('unknown');
      }
      // >>> (unsigned right shift) throws on BigInt, result is always Number
      case '>>>':
        return new $Primitive('number');
      // arithmetic and bitwise operators work on both Number and BigInt
      // mixing them throws, so knowing one operand's type determines the result
      case '-':
      case '*':
      case '/':
      case '%':
      case '**':
      case '|':
      case '&':
      case '^':
      case '<<':
      case '>>': {
        const leftType = primitiveTypeOf(resolveNodeType(leftPath));
        const rightType = primitiveTypeOf(resolveNodeType(rightPath));
        if (leftType === 'bigint' || rightType === 'bigint') return new $Primitive('bigint');
        // `number` if resolving is not possible - acceptable assumption within `core-js`
        return new $Primitive('number');
      }
    }
    return null;
  }

  function isGlobalThis(path) {
    let current = path;
    while (current = current.parentPath) {
      // non-arrow function rebinds `this` - not global
      if (t.isFunction(current.node) && !t.isArrowFunctionExpression(current.node)) return false;
      // class body rebinds `this` for property initializers and static blocks
      if (t.isClassBody(current.node)) return false;
      if (t.isProgram(current.node)) return true;
    }
    return false;
  }

  function isGlobalProxy(objectPath) {
    if (t.isIdentifier(objectPath.node)) {
      return POSSIBLE_GLOBAL_OBJECTS.has(objectPath.node.name) && !objectPath.scope?.getBinding(objectPath.node.name);
    }
    // top-level `this` (not inside any non-arrow function or class) is a global proxy
    return t.isThisExpression(objectPath.node) && isGlobalThis(objectPath);
  }

  function resolveGlobalName(path) {
    if (t.isIdentifier(path.node) && !path.scope?.getBinding(path.node.name)) return path.node.name;
    if (!isMemberLike(path) || path.node.computed) return null;
    const object = path.get('object');
    if (!isGlobalProxy(object)) return null;
    const property = path.get('property');
    return t.isIdentifier(property.node) ? property.node.name : null;
  }

  // known constructor at the runtime-resolved target of `path`, or null
  function knownConstructorAt(path) {
    return resolveKnownConstructor(resolveGlobalName(resolveRuntimeExpression(path)));
  }

  // `const { prototype: name } = ...` shape - `name` is bound to the init's `.prototype`.
  // peel AssignmentPattern wrapper on value: `const { prototype: P = Array.prototype } = Set`
  // still binds P to `.prototype` when the default is unreached at runtime
  function isDestructuredAsPrototype(bindingPath, name) {
    if (!t.isVariableDeclarator(bindingPath.node)) return false;
    const { id, init } = bindingPath.node;
    if (!t.isObjectPattern(id) || !init) return false;
    return id.properties.some(p => {
      if (!t.isObjectProperty(p) || p.computed || !keyMatchesName(p.key, 'prototype')) return false;
      const value = t.isAssignmentPattern(p.value) ? p.value.left : p.value;
      return t.isIdentifier(value) && value.name === name;
    });
  }

  // `.prototype` of a known constructor reads as an instance of it: we infer which
  // constructor's instance-methods are reachable here, and prototype objects host those.
  // direct `X.prototype` and member-init `const P = X.prototype` fall through resolvePath;
  // destructure `const { prototype: P } = X` doesn't (resolvePath skips patterns)
  function resolvePrototypeAsInstance(path) {
    if (isMemberLike(path)) {
      return resolveMemberPropertyName(path) === 'prototype'
        ? knownConstructorAt(path.get('object'))
        : null;
    }
    if (!t.isIdentifier(path.node)) return null;
    const binding = path.scope?.getBinding(path.node.name);
    if (!binding || binding.constantViolations?.length) return null;
    if (!isDestructuredAsPrototype(binding.path, path.node.name)) return null;
    return knownConstructorAt(binding.path.get('init'));
  }

  function resolveClassInheritance(classPath) {
    let current = classPath;
    let depth = MAX_DEPTH;
    while (depth--) {
      if (!current.node.superClass) return null;
      const superPath = current.get('superClass');
      const name = resolveGlobalName(superPath);
      if (name) {
        const base = resolveKnownConstructor(name);
        // `class MyArr extends Array<string>` - the super's type argument is the element type
        // of the instance. resolve through same helper as `new Array<string>()` so the inner
        // flows into polyfill dispatch (`_atMaybeArray` over generic)
        const args = getSuperTypeArgs(current.node);
        return args?.params
          ? resolveKnownContainerType(name, base, { typeParameters: args }, p => resolveTypeAnnotation(p, current.scope))
          : base;
      }
      current = resolveRuntimeExpression(superPath);
      if (!t.isClass(current.node)) return null;
    }
    return null;
  }

  // if annotation resolves to Generator/AsyncGenerator, return its type params; otherwise null
  // handles aliased types: type MyGen<T> = Generator<T> -> substitutes T with actual args
  // supports chained aliases with different param names: type A<T> = B<T>; type B<U> = Generator<U>
  function generatorTypeParams(annotation, scope) {
    const { node: ref, subst } = followTypeAliasChain(annotation, scope);
    const refName = typeRefName(ref);
    if (refName !== 'Generator' && refName !== 'AsyncGenerator') return null;
    const params = getTypeArgs(ref)?.params;
    if (!params?.length) return null;
    if (!subst) return params;
    // `Generator<T[]>` carries the type-param inside `TSArrayType` / `TSUnionType` -
    // deep subst descends into it
    return params.map(p => applyAliasSubstDeep(p, subst));
  }

  // resolve a specific Generator/AsyncGenerator type parameter from an expression
  // paramIndex: 0 = TYield, 1 = TReturn, 2 = TNext
  function resolveGeneratorTypeParam(exprPath, paramIndex) {
    // direct annotation: identifier with type, type cast, etc.
    const info = findExpressionAnnotation(exprPath);
    if (info) {
      const params = generatorTypeParams(info.annotation, info.scope);
      if (params?.[paramIndex]) return resolveTypeAnnotation(params[paramIndex], info.scope);
      return null;
    }
    // call expression: resolve callee function's return type annotation
    const resolved = resolveRuntimeExpression(exprPath);
    if (t.isCallExpression(resolved.node) || t.isNewExpression(resolved.node)) {
      const callee = resolveRuntimeExpression(resolved.get('callee'));
      if (t.isFunction(callee.node) && callee.node.returnType) {
        const params = generatorTypeParams(unwrapTypeAnnotation(callee.node.returnType), callee.scope);
        if (params?.[paramIndex]) return resolveTypeAnnotation(params[paramIndex], callee.scope);
      }
    }
    return null;
  }

  function resolveNewExpressionType(path) {
    const callee = path.get('callee');
    const name = resolveGlobalName(callee);
    if (name) return resolveConstructorType(name, path) || new $Object(name);
    const resolved = resolveRuntimeExpression(callee);
    if (t.isClass(resolved.node)) return resolveClassInheritance(resolved) || new $Object('Object');
    return new $Object(null);
  }

  function resolveCallExpressionType(path) {
    // resolvedTypeCache short-circuit handled at the top of resolveNodeTypeExpression
    const callee = path.get('callee');
    const name = resolveGlobalName(callee);
    if (name) {
      // known constructor called without `new`: String(), Array(), etc.
      const known = resolveConstructorCallType(name, path);
      if (known) return known;
      // known global function: parseInt(), parseFloat(), etc.
      if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name)) return typeFromHint(KNOWN_GLOBAL_METHOD_RETURN_TYPES[name]);
    }
    if (t.isImport(callee.node)) return new $Object('Promise');
    return resolveCallReturnType(callee);
  }

  // peel one Awaited layer from `await fn()` when `fn`'s body return is more precise than
  // its annotation. annotation widening via multi-hop alias chains landing on disjoint
  // unions / undecidable conditionals collapses to null, but the body's actual return
  // statement often pins a runtime-precise type. example: `async fn(): Promise<X | string>
  // { return [1,2,3]; }` - annotation gives null (Array vs primitive disjoint); body
  // return narrows to Array<number>. resolveBodyReturnType commonType-folds multi-return
  // disagreements so this never widens beyond what TS itself would infer
  function resolveAwaitedFromCallBody(argument) {
    const type = babelNodeType(argument.node);
    if (type !== 'CallExpression' && type !== 'OptionalCallExpression') return null;
    const fnPath = resolveRuntimeExpression(argument.get('callee'));
    if (!isFunctionLike(fnPath?.node)) return null;
    const bodyType = resolveBodyReturnType(fnPath, argument);
    if (!bodyType) return null;
    return bodyType.constructor === 'Promise' ? unwrapPromise(bodyType) : bodyType;
  }

  function resolveAwaitExpressionType(path) {
    const argument = path.get('argument');
    const type = resolveNodeType(argument);
    // await on non-Promise value returns the value type unchanged
    if (type && type.constructor !== 'Promise') return type;
    // recursively unwrap Promise<Promise<...T>> -> T
    const peeled = unwrapPromise(type);
    if (peeled) return peeled;
    // annotation fallback: route through `resolveAwaitedAnnotation` so multi-hop alias
    // chains (`type MyPromise<X> = Promise<X>`), conditional bodies, and union /
    // intersection distribution apply per `Awaited<T>` semantics. previously we only peeled
    // a direct `Promise<X>` ref via `resolveTypeAnnotation`, leaving aliased / conditional
    // / union shapes resolving as `$Object('Promise')` - misroutes downstream member
    // dispatch (Promise.<x> isn't in built-in definitions, so polyfill emission skipped)
    const annotationInfo = findExpressionAnnotation(argument);
    if (annotationInfo) {
      const annotation = unwrapTypeAnnotation(annotationInfo.annotation);
      const annotated = annotation && resolveAwaitedAnnotation(annotation, annotationInfo.scope, 0);
      if (annotated) return annotated;
    }
    return resolveAwaitedFromCallBody(argument);
  }

  function resolveYieldExpressionType(path) {
    const fnPath = path.getFunctionParent();
    if (!fnPath?.node.generator) return null;
    // yield* delegates to an iterable; result is the delegated iterator's TReturn (params[1])
    if (path.node.delegate) return resolveGeneratorTypeParam(path.get('argument'), 1);
    // yield evaluates to the value passed to generator.next(value) = TNext (params[2])
    const params = generatorTypeParams(unwrapTypeAnnotation(fnPath.node.returnType), fnPath.scope);
    if (params?.[2]) return resolveTypeAnnotation(params[2], fnPath.scope);
    return null;
  }

  function resolveNodeTypeExpression(path) {
    // polyfill-side transformations (memoized optional-chain refs, chained conditional
    // wrappers, destructure-extracted helpers) stash a pre-mutation Type object in the
    // `resolvedTypeCache` WeakMap so downstream type resolution can recover the original
    // receiver type even after the expression has been rewritten. check the cached type
    // BEFORE resolvePath - synthesized refs (`_ref` from babel-compat optional-chain
    // memoization) carry it via the cloned Identifier; if resolvePath ever found a
    // meaningful binding init, the type stashed on the cloned identifier itself would be
    // lost. storing the Type object directly (not a hint string) avoids round-trip info
    // loss: `toHint($Object('Array'))` -> 'array' -> `typeFromHint('array')` ->
    // `$Object('array')` (lowercase) breaks downstream KNOWN_*_RETURN_TYPES lookups which
    // key on capitalized constructor names. WeakMap (vs node-attached property) keeps the
    // side-channel opaque to sibling plugins / AST-cloning libraries
    const cached = resolvedTypeCache.get(path.node);
    if (cached) return cached;
    path = resolvePath(path);
    const cachedAfter = resolvedTypeCache.get(path.node);
    if (cachedAfter) return cachedAfter;

    switch (babelNodeType(path.node)) {
      // ESTree wraps optional chains in ChainExpression, preserves parentheses - unwrap
      case 'ChainExpression':
      case 'ParenthesizedExpression':
      case 'TSNonNullExpression':
      case 'TSInstantiationExpression':
        return resolveNodeType(path.get('expression'));
      case 'Identifier':
        return resolvePrototypeAsInstance(path) || resolveKnownGlobalReference(path);
      case 'NullLiteral':
        return new $Primitive('null');
      case 'StringLiteral':
      case 'TemplateLiteral':
        return new $Primitive('string');
      case 'NumericLiteral':
        return new $Primitive('number');
      case 'BigIntLiteral':
        return new $Primitive('bigint');
      case 'BooleanLiteral':
        return new $Primitive('boolean');
      case 'RegExpLiteral':
        return new $Object('RegExp');
      case 'ObjectExpression':
        return new $Object('Object');
      case 'ArrayExpression':
        return new $Object('Array', resolveArrayLiteralCommonType(path));
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'FunctionDeclaration':
      case 'ClassExpression':
      case 'ClassDeclaration':
        return new $Object('Function');
      case 'ThisExpression': {
        const context = resolveThisClass(path);
        return context ? resolveClassInheritance(context.classPath) || new $Object('Object') : null;
      }
      case 'NewExpression':
        return resolveNewExpressionType(path);
      case 'MemberExpression':
      case 'OptionalMemberExpression':
        return resolveFromMemberExpression(path)
          || resolveArrayIndexAccess(path)
          || resolveEnumMemberAccess(path)
          || resolveKnownPropertyReturnType(path)
          || resolveGlobalStaticReference(path)
          || resolvePrototypeAsInstance(path)
          || resolveKnownGlobalReference(path);
      case 'CallExpression':
      case 'OptionalCallExpression':
        return resolveCallExpressionType(path);
      // ESTree: import('foo') is ImportExpression (not CallExpression with Import callee)
      case 'ImportExpression':
        return new $Object('Promise');
      // tagged templates are semantically calls: String.raw`foo` ==== String.raw(...)
      case 'TaggedTemplateExpression':
        return resolveCallReturnType(path.get('tag'));
      case 'UnaryExpression':
        switch (path.node.operator) {
          case 'void':
            return new $Primitive('undefined');
          case 'typeof':
            return new $Primitive('string');
          case '!':
          case 'delete':
            return new $Primitive('boolean');
          // unary + throws on BigInt, result is always Number
          case '+':
            return new $Primitive('number');
          // unary - and ~ work on both Number and BigInt, preserving the type
          case '-':
          case '~':
            return resolveNumericType(path.get('argument'));
        }
        return null;
      case 'UpdateExpression':
        // ++ and -- work on both Number and BigInt, preserving the type
        return resolveNumericType(path.get('argument'));
      case 'BinaryExpression':
        switch (path.node.operator) {
          case '==':
          case '!=':
          case '===':
          case '!==':
          case '<':
          case '>':
          case '<=':
          case '>=':
          case 'instanceof':
          case 'in':
            return new $Primitive('boolean');
          default:
            return resolveBinaryOperatorType(path.node.operator, path.get('left'), path.get('right'));
        }
      case 'SequenceExpression': {
        const expressions = path.get('expressions');
        return expressions.length ? resolveNodeType(expressions.at(-1)) : null;
      }
      case 'AssignmentExpression':
        switch (path.node.operator) {
          case '=':
            return resolveNodeType(path.get('right'));
          case '||=':
          case '&&=':
          case '??=':
            return resolveUnionType(path.get('left'), path.get('right'), path.node.operator);
          default:
            return resolveBinaryOperatorType(path.node.operator.slice(0, -1), path.get('left'), path.get('right'));
        }
      case 'ConditionalExpression':
        // Babel desugars destructuring defaults as: _ref === void 0 ? DEFAULT : _ref
        // when one branch is a void-0 check and the other is the same identifier, resolve to the default branch
        return resolveDesugarDefaultTernary(path)
          || resolveUnionType(path.get('consequent'), path.get('alternate'), '?:');
      case 'LogicalExpression':
        return resolveUnionType(path.get('left'), path.get('right'), path.node.operator);
      case 'TSAsExpression':
      case 'TSTypeAssertion':
      case 'TypeCastExpression':
        return resolveTypeAnnotation(path.node.typeAnnotation, path.scope) || resolveNodeType(path.get('expression'));
      case 'TSSatisfiesExpression':
        return resolveNodeType(path.get('expression')) || resolveTypeAnnotation(path.node.typeAnnotation, path.scope);
      case 'AwaitExpression':
        return resolveAwaitExpressionType(path);
      case 'YieldExpression':
        return resolveYieldExpressionType(path);
    }
    return null;
  }

  // --- Function return types ---
  // resolve parameter type from call-site argument, default value, or rest-element shape
  function resolveParamType(binding, fnPath, callPath) {
    const { params } = fnPath.node;
    const args = callPath.get('arguments');
    for (let i = 0; i < params.length; i++) {
      if (params[i].type === 'RestElement') {
        if (params[i] === binding.path.node) return new $Object('Array');
        continue;
      }
      if (params[i] !== binding.path.node) continue;
      // argument provided at call site - resolve its type
      if (i < args.length) return resolveNodeType(args[i]);
      // no argument - resolve from the default value
      if (params[i].type === 'AssignmentPattern') return resolveNodeType(fnPath.get('params')[i].get('right'));
      return null;
    }
    return null;
  }

  // resolve expression type within a function body, with fallback to call-site parameter inference
  function resolveBodyExpr(path, fnPath, callPath) {
    const type = resolveNodeType(path);
    if (type) return type;
    if (!callPath) return null;
    const resolved = resolvePath(path);
    if (!t.isIdentifier(resolved.node)) return null;
    const binding = resolved.scope?.getBinding(resolved.node.name);
    if (!binding || binding.constantViolations?.length) return null;
    return resolveParamType(binding, fnPath, callPath);
  }

  // collect return statement paths from a block body, skipping nested functions
  // per JS spec, `return` in `finally` always overrides `return` in the try/catch
  // of the same TryStatement - this is handled per-TryStatement, not globally,
  // so returns outside a try-finally are unaffected
  function collectReturnPaths(blockPath) {
    const getChildren = (path, key) => Array.isArray(path.node[key]) ? path.get(key) : [path.get(key)];
    const collect = (path, depth = 0) => {
      if (depth > MAX_DEPTH || !path.node || t.isFunction(path.node)) return [];
      if (t.isReturnStatement(path.node)) return [path];
      const { node } = path;
      // TryStatement: if finally has returns, they override try/catch returns
      if (node.type === 'TryStatement') {
        const finalizerReturns = node.finalizer ? collect(path.get('finalizer'), depth + 1) : [];
        if (finalizerReturns.length) return finalizerReturns;
        const result = [];
        if (node.block) for (const r of collect(path.get('block'), depth + 1)) result.push(r);
        if (node.handler) for (const r of collect(path.get('handler'), depth + 1)) result.push(r);
        return result;
      }
      // recurse into block/control-flow children
      const result = [];
      if (node.body) for (const p of getChildren(path, 'body')) for (const r of collect(p, depth + 1)) result.push(r);
      if (node.consequent) for (const p of getChildren(path, 'consequent')) for (const r of collect(p, depth + 1)) result.push(r);
      if (node.alternate) for (const r of collect(path.get('alternate'), depth + 1)) result.push(r);
      if (node.cases) for (const p of path.get('cases')) for (const r of collect(p, depth + 1)) result.push(r);
      return result;
    };
    const result = [];
    for (const stmt of blockPath.get('body')) for (const r of collect(stmt)) result.push(r);
    return result;
  }

  function resolveBodyReturnType(fnPath, callPath) {
    const body = fnPath.get('body');
    // arrow with expression body: () => [1, 2, 3]
    if (!t.isBlockStatement(body.node)) return resolveBodyExpr(body, fnPath, callPath);
    // block body: collect return statements, skip nested functions
    let result = null;
    for (const returnPath of collectReturnPaths(body)) {
      const arg = returnPath.get('argument');
      const type = arg.node ? resolveBodyExpr(arg, fnPath, callPath) : new $Primitive('undefined');
      if (!type) return null;
      // skip nullable/never returns - common in catch bail-outs like `catch { return; }`
      // consistent with how resolveConditionalBranches handles `never` branches
      if (isNullableOrNever(type)) continue;
      const merged = commonType(result, type);
      if (result && !merged) return null;
      result = merged;
    }
    return result ?? new $Primitive('undefined');
  }

  // check whether a type annotation AST node references any type parameter from the given set
  function hasTypeParamReference(node, typeParamNames, depth) {
    if (depth > MAX_DEPTH) return false;
    node = unwrapTypeAnnotation(node);
    if (!node) return false;
    switch (babelNodeType(node)) {
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        if (name && typeParamNames.has(name)) return true;
        const params = getTypeArgs(node)?.params;
        if (params) for (const param of params) {
          if (hasTypeParamReference(param, typeParamNames, depth + 1)) return true;
        }
        return false;
      }
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return hasTypeParamReference(node.elementType, typeParamNames, depth + 1);
      case 'TSUnionType':
      case 'UnionTypeAnnotation':
      case 'TSIntersectionType':
      case 'IntersectionTypeAnnotation':
        for (const member of node.types) {
          if (hasTypeParamReference(member, typeParamNames, depth + 1)) return true;
        }
        return false;
      case 'TSTupleType':
      case 'TupleTypeAnnotation':
        for (const element of tupleElements(node) || []) {
          const actual = element.type === 'TSNamedTupleMember' ? element.elementType : element;
          if (hasTypeParamReference(actual, typeParamNames, depth + 1)) return true;
        }
        return false;
      case 'TSConditionalType':
        return hasTypeParamReference(node.checkType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.extendsType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.trueType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.falseType, typeParamNames, depth + 1);
      case 'TSNamedTupleMember':
        return hasTypeParamReference(node.elementType, typeParamNames, depth + 1);
      case 'TSIndexedAccessType':
        return hasTypeParamReference(node.objectType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.indexType, typeParamNames, depth + 1);
      case 'TSTypeOperator':
      case 'TSRestType':
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return hasTypeParamReference(node.typeAnnotation, typeParamNames, depth + 1);
      case 'TSTypeLiteral':
        for (const member of node.members) {
          if (hasTypeParamReference(member.typeAnnotation, typeParamNames, depth + 1)) return true;
          if (hasTypeParamReference(member.returnType, typeParamNames, depth + 1)) return true;
        }
        return false;
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'FunctionTypeAnnotation':
        return hasTypeParamReference(node.returnType ?? node.typeAnnotation, typeParamNames, depth + 1);
      // mapped type carries the constraint (`K in keyof T`) and body (`T[K]`); both can
      // reference type params. without this branch an outer function returning a raw
      // mapped type (not wrapped in TSTypeReference) skips substitution and loses inner
      case 'TSMappedType':
        return (node.typeParameter && hasTypeParamReference(node.typeParameter.constraint, typeParamNames, depth + 1))
          || hasTypeParamReference(node.typeAnnotation, typeParamNames, depth + 1);
      // `typeof x` references the type of a value binding; when x itself is typed by
      // a type param (rare: `declare const x: T; typeof x`), substitution is needed
      case 'TSTypeQuery':
        return typeof node.exprName?.name === 'string' && typeParamNames.has(node.exprName.name);
    }
    return false;
  }

  // extract inner type parameter name from a container annotation: T[] -> T, Array<T> -> T, Set<T> -> T, Promise<T> -> T, etc.
  function innerTypeParamName(annotation, refName) {
    // T[] syntax
    if (annotation.type === 'TSArrayType' || annotation.type === 'ArrayTypeAnnotation') {
      return typeRefName(annotation.elementType);
    }
    // Container<T>: Set<T>, Promise<T>, Iterator<T>, Array<T>, ReadonlyArray<T>, etc.
    if (refName && (SINGLE_ELEMENT_COLLECTIONS.has(refName) || refName === 'Promise')) {
      const typeArgs = getTypeArgs(annotation)?.params;
      if (typeArgs?.length >= 1) return typeRefName(typeArgs[0]);
    }
    return null;
  }

  // sidecar map (typeParamMap -> paramName -> arg NodePath) so indexed-access resolution
  // can inspect the actual call arg - the declared constraint is usually broader.
  // WeakMap auto-clears and avoids a banned custom property on `Map.prototype`
  let typeParamArgPaths = new WeakMap();

  // Map<string, Type> of type parameter bindings inferred from call-site arguments
  function buildTypeParamMap(typeParamNames, fnPath, callPath) {
    const typeParamMap = new Map();
    const argPaths = new Map();
    typeParamArgPaths.set(typeParamMap, argPaths);
    // phase 0: explicit type arguments at call site: foo<string>(...)
    const callTypeArgs = getTypeArgs(callPath.node)?.params;
    if (callTypeArgs) {
      const fnTypeParams = fnPath.node.typeParameters?.params;
      if (!fnTypeParams) return typeParamMap;
      for (let i = 0; i < fnTypeParams.length && i < callTypeArgs.length; i++) {
        const name = typeParamName(fnTypeParams[i]);
        if (!typeParamMap.has(name)) {
          const resolved = resolveTypeAnnotation(callTypeArgs[i], callPath.scope);
          if (resolved) typeParamMap.set(name, resolved);
        }
      }
    }
    const args = callPath.get('arguments');
    const { params } = fnPath.node;
    // phase 1: match param annotations against type parameter names
    for (let i = 0; i < params.length && i < args.length; i++) {
      const { param, isRest } = effectiveParam(params[i]);
      const paramAnnotation = unwrapTypeAnnotation(param.typeAnnotation);
      if (!paramAnnotation) continue;
      const name = typeRefName(paramAnnotation);
      // rest-only generic `function fn<T>(...xs: T[])` - annotation is T[] or Array<T>, bind T
      // to the element type of the first rest-arg. spread-call `fn(...arr)` passes `args[0]`
      // as a SpreadElement whose overall type IS the array - unwrap once to get the element.
      // no more params possible after rest, so break regardless
      if (isRest) {
        const elementParamName = innerTypeParamName(paramAnnotation, name);
        if (elementParamName && typeParamNames.has(elementParamName) && !typeParamMap.has(elementParamName)) {
          const arg = args[i];
          const isSpread = arg.node?.type === 'SpreadElement';
          const resolved = isSpread ? resolveInnerType(resolveNodeType(arg.get('argument'))) : resolveNodeType(arg);
          if (resolved) typeParamMap.set(elementParamName, resolved);
        }
        break;
      }
      // direct: param type is exactly T
      if (name && typeParamNames.has(name) && !typeParamMap.has(name)) {
        const resolved = resolveNodeType(args[i]);
        if (resolved) {
          typeParamMap.set(name, resolved);
          argPaths.set(name, args[i]);
        }
        continue;
      }
      // container wrapper: param type is T[], Array<T>, Set<T>, Promise<T>, etc.
      const elementParamName = innerTypeParamName(paramAnnotation, name);
      if (elementParamName && typeParamNames.has(elementParamName) && !typeParamMap.has(elementParamName)) {
        const elementType = resolveInnerType(resolveNodeType(args[i]));
        if (elementType) typeParamMap.set(elementParamName, elementType);
      }
    }
    // phase 2: default / constraint fallback for unresolved type params (TS binds to `default`
    // when call-site omits a type arg; constraint is only the upper bound, usually over-broad).
    // route through `substituteTypeParams` (not bare `resolveTypeAnnotation`) so a default that
    // references an earlier type param picks up the already-resolved binding, e.g.
    // `function f<T = string, U = T>(t: T): U` called as `f<number[]>(...)` resolves U to
    // number[] (T's user-supplied value) instead of T.default=string. order matters: phase 1
    // populates T from the explicit arg before phase 2 fills U
    for (const typeParam of fnPath.node.typeParameters.params) {
      const name = typeParamName(typeParam);
      if (typeParamMap.has(name)) continue;
      const annotation = typeParam.default ?? typeParam.constraint;
      if (annotation) {
        const resolved = substituteTypeParams(annotation, typeParamMap, fnPath.scope, 0);
        if (resolved) typeParamMap.set(name, resolved);
      }
    }
    return typeParamMap;
  }

  // resolve a type annotation substituting type parameters from the map.
  // `seen` is the decl-set guard threaded from `resolveUserDefinedType` so body
  // recursion into the same alias short-circuits instead of CPU-burning up to MAX_DEPTH.
  // `typeParamMap` defensive null-guard: callers pass Map, but some recursive entry
  // points (`resolveInferElementPattern` with null ctx) would crash on `.has()` otherwise
  // `typeParamMap` null degrades to plain type-annotation resolution (some recursive
  // entry points like `resolveInferElementPattern` with null ctx would crash on `.has()`)
  function substituteTypeParams(node, typeParamMap, scope, depth, seen) {
    if (depth > MAX_DEPTH) return null;
    if (!typeParamMap) return resolveTypeAnnotation(node, scope, depth);
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    // direct type parameter reference or known type with substituted inner
    if (node.type === 'TSTypeReference' || node.type === 'GenericTypeAnnotation') {
      const name = typeRefName(node);
      if (name && typeParamMap.has(name)) return typeParamMap.get(name);
      if (name) {
        // substitute type params in container inner types: Array<T>, Promise<T>, etc.
        const ctor = resolveKnownConstructor(name);
        const known = resolveKnownContainerType(name, ctor, node,
          p => substituteTypeParams(p, typeParamMap, scope, depth + 1, seen));
        if (known) return known;
        // user-defined type alias / interface: propagate type parameter substitutions.
        // resolveNamedType also sees the map so utility types (`Awaited<T>`, `NonNullable<T>`,
        // `Extract<T,U>`, etc.) resolve their args against the caller's T/U binding
        return resolveUserDefinedType(name, node, scope, depth, typeParamMap, seen)
          ?? resolveNamedType(name, node, scope, depth, typeParamMap, seen);
      }
      return null;
    }
    // union: T | null, T | undefined - strip nullable, substitute T
    if (node.type === 'TSUnionType' || node.type === 'UnionTypeAnnotation') {
      return foldUnionTypes(node.types, member => substituteTypeParams(member, typeParamMap, scope, depth + 1, seen));
    }
    // intersection: T & { extra: boolean } - skip plain $Object('Object') from type literals, rest must agree
    if (node.type === 'TSIntersectionType' || node.type === 'IntersectionTypeAnnotation') {
      return foldIntersectionTypes(node.types, member => substituteTypeParams(member, typeParamMap, scope, depth + 1, seen));
    }
    // transparent wrappers: (T), T?, readonly T[], etc.
    if (node.type === 'TSOptionalType' || node.type === 'TSParenthesizedType' || node.type === 'NullableTypeAnnotation'
      || (node.type === 'TSTypeOperator' && node.operator !== 'keyof')) {
      return substituteTypeParams(node.typeAnnotation, typeParamMap, scope, depth + 1, seen);
    }
    // conditional type `T extends U ? X : Y` - delegated to evaluateConditionalType which
    // dispatches across the `infer` short-circuit, structural pick (true/false branch),
    // and the widened branch fold. structural pick mirrors TS's non-`infer` evaluation:
    //   `string[] extends string[]` -> true-branch (`T extends U[] ? U : T`)
    //   `number[] extends string[]` -> false-branch (same outer, disjoint inners)
    //   `number extends string`     -> false-branch (different primitives)
    if (node.type === 'TSConditionalType') {
      return evaluateConditionalType(node, typeParamMap, scope, depth, seen);
    }
    // T[] -> Array with substituted element type
    if (node.type === 'TSArrayType' || node.type === 'ArrayTypeAnnotation') {
      const inner = substituteTypeParams(node.elementType, typeParamMap, scope, depth + 1, seen);
      return new $Object('Array', inner && !isNullableOrNever(inner) ? inner : null);
    }
    // [T, U] - resolve to Array, compute inner type if all elements agree
    if (node.type === 'TSTupleType' || node.type === 'TupleTypeAnnotation') {
      return tupleAsArrayType(node, e => substituteTypeParams(e, typeParamMap, scope, depth + 1, seen));
    }
    // T["key"] or T[number] - resolve indexed access, substituting type params in the object type
    if (node.type === 'TSIndexedAccessType') {
      const objParamName = typeRefName(node.objectType);
      if (objParamName && typeParamMap.has(objParamName)) {
        // T[number] - element type from the substituted container
        if (node.indexType?.type === 'TSNumberKeyword') {
          const inner = resolveInnerType(typeParamMap.get(objParamName));
          if (inner) return inner;
        }
        // T["key"] - try the concrete call arg before falling back to the declared constraint
        // (e.g. <T extends object>(o: T): T['k'] with arg `{ k: [1] }` narrows `k` to Array)
        const key = indexedAccessKey(node.indexType);
        if (key !== null) {
          const argPath = typeParamArgPaths.get(typeParamMap)?.get(objParamName);
          const propType = argPath && resolveObjectLiteralProperty(argPath, key);
          if (propType) return propType;
        }
        const paramInfo = findTypeParameter(objParamName, scope);
        if (paramInfo?.constraint) {
          const syntheticNode = { type: 'TSIndexedAccessType', objectType: paramInfo.constraint, indexType: node.indexType };
          return resolveTypeAnnotation(syntheticNode, paramInfo.scope, depth);
        }
      }
      return resolveTypeAnnotation(node, scope, depth);
    }
    // function type: (x: T) => R / new () => T - always Function regardless of type parameters
    if (node.type === 'TSFunctionType' || node.type === 'TSConstructorType'
      || node.type === 'FunctionTypeAnnotation') return new $Object('Function');
    // mapped type: { [K in keyof T]: V } - structural, can't derive concrete type
    if (node.type === 'TSMappedType') {
      const passthrough = unwrapMappedTypePassthrough(node);
      // passthrough body references the mapped-over type param by name; delegate back to
      // substituteTypeParams so `{T->string[]}` subst survives into `T`-ref inside the body.
      // using resolveTypeAnnotation here would drop the map and collapse precise Array
      // receiver types to generic `$Object(null)` via `Copy<string[]>.at(...)` chains
      if (passthrough) return substituteTypeParams(passthrough, typeParamMap, scope, depth + 1, seen);
      return new $Object(null);
    }
    // fallback to regular annotation resolution
    return resolveTypeAnnotation(node, scope, depth);
  }

  // resolve return type of a function, inferring generic type parameters from call-site arguments
  function resolveReturnType(fnPath, callPath, classSubst) {
    // generator functions return iterators, async generators return async iterators
    // yield type is extracted from Generator<TYield>/AsyncGenerator<TYield> annotation if present
    if (fnPath.node.generator) {
      const params = generatorTypeParams(unwrapTypeAnnotation(fnPath.node.returnType), fnPath.scope);
      // class type-arg subst applies upfront so method-level subst below sees substituted shape
      const yieldType = classSubstInner(params?.[0], classSubst);
      let inner = yieldType ? resolveTypeAnnotation(yieldType, fnPath.scope) : null;
      // substitute generic type parameters from call site into the yield type
      if (!inner && yieldType && callPath && fnPath.node.typeParameters?.params?.length) {
        const typeParamNames = new Set();
        for (const p of fnPath.node.typeParameters.params) typeParamNames.add(typeParamName(p));
        if (hasTypeParamReference(yieldType, typeParamNames, 0)) {
          const typeParamMap = buildTypeParamMap(typeParamNames, fnPath, callPath);
          if (typeParamMap.size > 0) inner = substituteTypeParams(yieldType, typeParamMap, fnPath.scope, 0);
        }
      }
      return new $Object(fnPath.node.async ? 'AsyncIterator' : 'Iterator', inner && !isNullableOrNever(inner) ? inner : null);
    }
    // peel TSTypeAnnotation + apply class subst upfront. `returnInner` is the peeled type
    // node (or null) used for both method-level subst and direct annotation resolution
    const returnInner = classSubstInner(fnPath.node.returnType, classSubst);
    const { typeParameters } = fnPath.node;
    // infer generic type parameters and substitute into return type
    if (returnInner && callPath && typeParameters?.params?.length) {
      const typeParamNames = new Set();
      for (const p of typeParameters.params) typeParamNames.add(typeParamName(p));
      if (hasTypeParamReference(returnInner, typeParamNames, 0)) {
        const typeParamMap = buildTypeParamMap(typeParamNames, fnPath, callPath);
        if (typeParamMap.size > 0) {
          const substituted = substituteTypeParams(returnInner, typeParamMap, fnPath.scope, 0);
          if (substituted) {
            if (fnPath.node.async && substituted.constructor !== 'Promise') return new $Object('Promise', substituted);
            return substituted;
          }
        }
      }
    }
    // try return type annotation
    if (returnInner) {
      const resolved = resolveTypeAnnotation(returnInner, fnPath.scope);
      if (resolved) {
        // Flow allows async functions with non-Promise return annotations (e.g. async function(): string)
        if (fnPath.node.async && resolved.constructor !== 'Promise') return new $Object('Promise', resolved);
        return resolved;
      }
    }
    // fallback: analyze return statements in the function body
    const bodyType = resolveBodyReturnType(fnPath, callPath);
    // async functions always return a Promise, even if body return type is unresolvable
    if (fnPath.node.async) {
      if (!bodyType) return new $Object('Promise');
      if (bodyType.constructor !== 'Promise') return new $Object('Promise', bodyType);
    }
    return bodyType;
  }

  // --- Class / object member resolvers ---
  // resolve `this` to its enclosing anchor: the class or object literal whose method
  // contains `path` (transparently passing through arrow functions, which inherit `this`).
  // returns one of:
  //   { kind: 'class', classPath, isStatic } - class member contains the use site
  //   { kind: 'object', objectPath } - object-literal method contains the use site
  //   null - non-arrow function rebound `this`, or top-level `this` reached
  // walk stops at the first non-arrow function; what kind of anchor depends on its parent
  // shape: ClassBody (class member), ObjectMethod / Property{value:FE} (object method),
  // MethodDefinition (ESTree class-method wrapper, continue to ClassBody), Property nested
  // in ClassBody (some adapters - continue), anything else (function rebinds `this`)
  function resolveThisAnchor(path) {
    let current = path;
    while (current = current.parentPath) {
      if (t.isClassBody(current.parentPath?.node)) {
        const classPath = current.parentPath.parentPath;
        if (!t.isClass(classPath?.node)) return null;
        return { kind: 'class', classPath, isStatic: !!current.node.static || current.node.type === 'StaticBlock' };
      }
      if (!t.isFunction(current.node) || t.isArrowFunctionExpression(current.node)) continue;
      const parent = current.parentPath?.node;
      // Babel ObjectMethod: `{ m() {} }` -> ObjectMethod direct child of ObjectExpression
      if (t.isObjectMethod?.(current.node) && t.isObjectExpression(parent)) {
        return { kind: 'object', objectPath: current.parentPath };
      }
      // ESTree Property / ObjectProperty wrapping a FunctionExpression: could be an object
      // method (parent ObjectExpression) or a class method (parent ClassBody) - dispatch
      // on grandparent shape; for class methods continue to the ClassBody check next iter
      if ((parent?.type === 'Property' || parent?.type === 'ObjectProperty') && parent.value === current.node) {
        const grand = current.parentPath?.parentPath?.node;
        if (t.isObjectExpression(grand)) return { kind: 'object', objectPath: current.parentPath.parentPath };
        continue;
      }
      // ESTree MethodDefinition wrapper for class methods (`class { m() {} }` -> MethodDefinition
      // whose .value is a FunctionExpression). step past so the next iter sees ClassBody
      if (parent?.type === 'MethodDefinition') continue;
      // standalone non-arrow function rebinds `this`
      return null;
    }
    return null;
  }

  function resolveThisClass(path) {
    const anchor = resolveThisAnchor(path);
    return anchor?.kind === 'class' ? { classPath: anchor.classPath, isStatic: anchor.isStatic } : null;
  }

  function resolveThisObject(path) {
    const anchor = resolveThisAnchor(path);
    return anchor?.kind === 'object' ? anchor.objectPath : null;
  }

  // resolve a class's superClass identifier to a declaration path, handling both real
  // (`class C extends Parent`) and ambient (`declare class Parent`) forms. returns null
  // for non-Identifier or unresolvable super heads
  function resolveSuperClassPath(classPath) {
    const superClass = classPath.get('superClass');
    if (!superClass.node) return null;
    const resolved = resolveRuntimeExpression(superClass);
    if (t.isClass(resolved.node)) return resolved;
    if (t.isIdentifier(superClass.node)) {
      // accept both TS `declare class` (ClassDeclaration{declare:true}) and Flow
      // `declare class X {...}` (DeclareClass node) - both describe the parent's surface
      // for type-flow analysis, even though only the TS form is currently common
      const ambient = findAmbientDeclarationPath(superClass.node.name, superClass.scope, isAmbientClassNode);
      if (ambient?.node.type === 'ClassDeclaration' || ambient?.node.type === 'DeclareClass') return ambient;
    }
    return null;
  }

  function resolveClassContext(objectPath) {
    // Foo.staticProp - object is the class itself
    if (t.isClass(objectPath.node)) return { classPath: objectPath, isStatic: true };
    // new Foo().prop - object is a class instance
    if (t.isNewExpression(objectPath.node)) {
      const classPath = resolveRuntimeExpression(objectPath.get('callee'));
      if (t.isClass(classPath.node)) return { classPath, isStatic: false };
    }
    // this.prop inside a class member
    if (t.isThisExpression(objectPath.node)) return resolveThisClass(objectPath);
    // super.prop inside a class member - resolve to parent class; isStatic inherits the
    // enclosing method's context (`static m() { super.x }` -> parent static; instance -> instance)
    if (objectPath.node?.type === 'Super') {
      const thisCtx = resolveThisClass(objectPath);
      const parentPath = thisCtx && resolveSuperClassPath(thisCtx.classPath);
      return parentPath ? { classPath: parentPath, isStatic: thisCtx.isStatic } : null;
    }
    return null;
  }

  // chain parent-class subst: apply current class's subst to its `extends ParentClass<...>`
  // type-arg slots, then map the resolved arg list to parent's declared type-params.
  // mirrors `appendInterfaceExtendsMembers` which performs the same step for interface chains.
  // node-based primitive shared by `findClassMember` (path-based) and `collectClassLikeMembers`
  // (raw-node walk-up); the path-based wrapper just unwraps `.node` slots
  function buildParentClassSubstFromNodes(childNode, parentNode, childSubst) {
    const superTypeArgs = getSuperTypeArgs(childNode)?.params;
    const parentDeclParams = parentNode.typeParameters?.params;
    if (!superTypeArgs?.length || !parentDeclParams?.length) return null;
    const args = childSubst ? superTypeArgs.map(a => applyAliasSubstDeep(a, childSubst)) : superTypeArgs;
    return buildSubstMap(parentDeclParams, args);
  }
  function buildParentClassSubst(childClassPath, parentClassPath, childSubst) {
    return buildParentClassSubstFromNodes(childClassPath.node, parentClassPath.node, childSubst);
  }

  // returns `{ member, subst }` where subst is the accumulated class type-param map at the
  // depth where the member was found. `subst` is null when no class type-args propagated
  // through the chain. callers that don't care about subst destructure `{ member }`
  function findClassMember(classPath, name, isStatic, classSubst, depth = 0, visited = undefined) {
    if (depth > MAX_DEPTH) return null;
    // walk in reverse: in JS, duplicate method names are legal and the runtime uses the last definition
    // `findObjectMember` does the same; both must agree.
    const members = classPath.get('body').get('body');
    for (let i = members.length - 1; i >= 0; i--) {
      const member = members[i];
      if (member.node.computed) continue;
      if (!keyMatchesName(member.node.key, name)) continue;
      if (!!member.node.static !== isStatic) continue;
      if (member.node.kind === 'set') continue;
      return { member, subst: classSubst ?? null };
    }
    // `class A extends B; class B extends A` cycle: MAX_DEPTH bottoms out via 64-frame
    // CPU-burn. visited Set on class nodes short-circuits at the second visit (parallels
    // `collectClassLikeMembers`'s `seen` and the type-alias decl-set guard)
    const seen = visited ?? new Set();
    if (seen.has(classPath.node)) return null;
    seen.add(classPath.node);
    const parentPath = resolveSuperClassPath(classPath);
    if (!parentPath) return null;
    const parentSubst = buildParentClassSubst(classPath, parentPath, classSubst);
    return findClassMember(parentPath, name, isStatic, parentSubst, depth + 1, seen);
  }

  // single returned expression as a path - used to resolve getters like properties
  function resolveBodyReturnValue(fnPath) {
    const body = fnPath.get('body');
    if (!t.isBlockStatement(body.node)) return resolveRuntimeExpression(body);
    let result = null;
    let resultType; // lazy: only resolved once, on first cross-node compare
    for (const returnPath of collectReturnPaths(body)) {
      const arg = returnPath.get('argument');
      if (!arg.node) return null;
      const value = resolveRuntimeExpression(arg);
      if (!value) return null;
      if (result === null || result.node === value.node) {
        result = value;
        continue;
      }
      // distinct nodes - accept only on matching resolved type (e.g. two `return [1,2,3]`)
      if (resultType === undefined) resultType = resolveNodeType(result);
      if (!resultType) return null;
      const valueType = resolveNodeType(value);
      if (!valueType || !typesEqual(resultType, valueType)) return null;
    }
    return result;
  }

  function resolveClassMember(classPath, name, isStatic, callPath, receiverArgs) {
    const classSubst = buildSubstMap(classPath.node.typeParameters?.params, receiverArgs);
    const found = findClassMember(classPath, name, isStatic, classSubst);
    if (found) return resolveClassMemberNode(found.member, callPath, found.subst);
    // TS declaration merging: sibling `interface X { ... }` contributes instance members
    // to the class type. runs only when the class body has no match, so real class methods
    // always win on collision (matches TS semantics). pass `receiverArgs` so each iface
    // builds its own subst against ITS type-param names - covers renamed params on the
    // interface side of class+interface merging
    if (!isStatic && classPath.node.id?.name) {
      return resolveMergedInterfaceMember(classPath.node.id.name, classPath.scope, name, callPath, receiverArgs);
    }
    return null;
  }

  // babel splits public/private/accessor into distinct types; ESTree uses MethodDefinition /
  // PropertyDefinition with a PrivateIdentifier key. collapse both shapes to one predicate per
  // category so resolveClassMemberNode doesn't miss private members
  const isMethodMember = n => t.isClassMethod(n) || t.isClassPrivateMethod?.(n);
  const isPropertyMember = n => t.isClassProperty(n) || t.isClassAccessorProperty(n) || t.isClassPrivateProperty?.(n);

  // ESTree MethodDefinition / ObjectMethod wrap the function in `.value`; babel ClassMethod /
  // ClassPrivateMethod carry body and params directly on the member. caller pre-filters to
  // method shapes; helper just picks the path that owns the function body
  function methodFnPath(memberPath) {
    const value = memberPath.get('value');
    return value?.node ? value : memberPath;
  }

  // peel TSTypeAnnotation wrapper if present, then apply class type-arg subst when set.
  // returns the inner type (or null) - downstream consumers either feed it back to
  // `resolveTypeAnnotation` (which itself peels, idempotent on inner) or use it directly
  function classSubstInner(annotation, subst) {
    const inner = unwrapTypeAnnotation(annotation);
    return inner ? applySubst(inner, subst) : inner;
  }

  // dispatch for "calling a method-shaped or getter member": for a regular method, resolve
  // its return type at the call site; for a getter, resolve the body's returned value
  // and (when callable) invoke. shared between class member resolution (with `classSubst`
  // for type-arg substitution) and object member resolution (no subst). returns null when
  // neither path produces a type, letting the caller fall through to other strategies
  function resolveMethodOrGetterCallReturn(methodFn, kind, callPath, classSubst) {
    if (kind !== 'get') return resolveReturnType(methodFn, callPath, classSubst);
    const value = resolveBodyReturnValue(methodFn);
    if (t.isFunction(value?.node)) return resolveReturnType(value, callPath, classSubst);
    return null;
  }

  function resolveClassMemberNode(member, callPath, classSubst) {
    const methodFn = isMethodMember(member.node) ? methodFnPath(member) : null;
    // TSDeclareMethod (ambient `declare class` body) has no body - only the return-type
    // annotation is available for resolution
    const declaredReturn = member.node.type === 'TSDeclareMethod' ? member.node.returnType : null;
    if (callPath) {
      if (methodFn) {
        const r = resolveMethodOrGetterCallReturn(methodFn, member.node.kind, callPath, classSubst);
        if (r) return r;
      } else if (declaredReturn) {
        // TSDeclareMethod (ambient method, no body) exposes `params` / `returnType` /
        // `typeParameters` directly on its node, the same shape `resolveReturnType` reads
        // from. routing through it picks up method-level type-args from `<T>(...)` plus
        // call-site `<string>` so `static make<T>(): T[]` with `Box.make<string>()`
        // resolves to `string[]` instead of leaking the bare type-param T (which loses
        // precision and degrades `_atMaybeArray` to generic `_at`)
        return resolveReturnType(member, callPath, classSubst);
      } else if (isPropertyMember(member.node)) {
        const value = resolveRuntimeExpression(member.get('value'));
        if (value.node && t.isFunction(value.node)) return resolveReturnType(value, callPath, classSubst);
      }
      return null;
    }
    // property access: foo.bar or foo.#bar
    if (isPropertyMember(member.node)) {
      if (member.node.typeAnnotation) {
        return resolveTypeAnnotation(classSubstInner(member.node.typeAnnotation, classSubst), member.scope);
      }
      return resolveClassFieldType(member);
    }
    // method: getter returns its return type, regular method returns Function
    if (methodFn) return member.node.kind === 'get' ? resolveReturnType(methodFn, undefined, classSubst) : new $Object('Function');
    if (declaredReturn) return new $Object('Function');
    return null;
  }

  // shared resolve-fold-cache shape for class-field and object-field flow scans. caches
  // by prop-node identity, seeds a `null` sentinel before invoking `candidatesFn` so
  // cross-referencing writes (`this.a = this.b; this.b = this.a`) bail to unknown instead
  // of recursing forever, then folds the candidate list to a single union type
  function resolveFieldFlow(propNode, cache, candidatesFn) {
    if (cache.has(propNode)) return cache.get(propNode);
    cache.set(propNode, null);
    const candidates = candidatesFn();
    const result = candidates ? foldNonNullableCommon(candidates) : null;
    cache.set(propNode, result);
    return result;
  }

  // mutable field - init alone is unsound (sentinel `#x = null` + later `this.#x = arr()`).
  // fold init + every assignment to the field; all-nullable collapses to unknown so the
  // nullable-receiver short-circuit in `resolveCallReturnType` doesn't skip polyfill emission.
  // private (`#x`) is scope-closed; public / auto-accessor are externally writable, so we also
  // fold subclass `this.<field>` writes and module-wide `<expr>.<field> = Y` whose receiver
  // looks like `new ClassName(...)`. anonymous class expressions bail to unknown
  let classFieldTypeCache = new WeakMap();
  function resolveClassFieldType(member) {
    const fieldName = getKeyName(member.node.key);
    if (!fieldName) return null;
    return resolveFieldFlow(member.node, classFieldTypeCache, () => collectClassFieldCandidates(member, fieldName));
  }

  // shared shape of class-field and object-field flow scans. phases:
  //   1. earlyBail (anonymous binding, exported binding) -> null candidates, no inference
  //   2. initPath value type -> seed candidate
  //   3. internalThisScan (own methods of class / object) -> `this.<field> = ...` writes
  //   4. private gate (class-private fields are scope-closed: external scan skipped)
  //   5. programGate (leak detection: instances escaping via fn-arg / return / spread) -> bail
  //   6. programWritesPush (subclass `this.X = ...` + module-wide `<expr>.X = Y` writes)
  // null result signals "writer set not enumerable" - caller treats as no inference
  function collectFieldCandidates(opts) {
    if (opts.earlyBail?.()) return null;
    const candidates = [];
    if (opts.initPath?.node) {
      const initType = resolveNodeType(opts.initPath);
      if (initType) candidates.push(initType);
    }
    opts.internalThisScan?.(candidates);
    if (opts.isPrivate) return candidates;
    const program = findProgramPath(opts.anchor);
    if (!program) return candidates;
    if (opts.programGate?.(program)) return null;
    opts.programWritesPush?.(program, candidates);
    return candidates;
  }

  // walk module-wide `<expr>.<fieldName> = Y` writes (already filtered to `fieldName` via
  // `getModuleFieldIndex`), drop those past the temporal `bound`, fold remaining receivers
  // matching `predicate` into `out`. shared between class and object external-write phases
  function foldExternalWrites(fieldName, predicate, bound, program, out) {
    const index = getModuleFieldIndex(program);
    for (const writePath of index.writesByField.get(fieldName) ?? []) {
      if ((writePath.node.start ?? Infinity) >= bound) continue;
      pushIfWriteMatches(writePath, predicate, out);
    }
  }

  // collect base class + every transitive subclass path. used by instance flow scan to
  // include subclass instances in the closure (since `class Sub extends C; const s = new
  // Sub(); s.x = Y` writes affect C's inherited field slot) and to scan subclass methods'
  // `this.<field>` writes recursively (not just direct subclasses). cached per class node:
  // the instance pipeline reads `.names` in programGate and `.paths` in programWritesPush;
  // `collectClassInstanceClosure` reads `.names` again - one walk amortized
  let classDescendantPathsCache = new WeakMap();
  function collectClassDescendantPaths(classPath, programPath) {
    return memoize(classDescendantPathsCache, classPath.node, () => {
      const className = classBindingName(classPath);
      if (!className) return null;
      const index = getModuleFieldIndex(programPath);
      const names = new Set([className]);
      const paths = [classPath];
      const queue = [className];
      while (queue.length) {
        const name = queue.shift();
        for (const sub of index.subclassesBySuper.get(name) ?? []) {
          const subName = classBindingName(sub);
          if (!subName || names.has(subName)) continue;
          names.add(subName);
          paths.push(sub);
          queue.push(subName);
        }
      }
      return { names, paths };
    });
  }

  // dispatch to static-vs-instance pipeline. static fields are mutated via the class
  // binding (`C.x = Y`); instance fields are mutated via instance bindings (`<inst>.x = Y`)
  // including subclass instances. private fields skip external scan entirely
  function collectClassFieldCandidates(member, fieldName) {
    const classPath = member.parentPath.parentPath;
    const isPrivate = t.isClassPrivateProperty?.(member.node);
    if (!isPrivate && !classBindingName(classPath)) return null;
    return member.node.static
      ? collectStaticFieldCandidates(member, fieldName, classPath, isPrivate)
      : collectInstanceFieldCandidates(member, fieldName, classPath, isPrivate);
  }

  // static field flow: writes via `<class-binding>.<field> = Y` from anywhere in the module,
  // plus `this.<field> = Y` writes inside static methods AND static blocks (`this` there is
  // the class itself). class-binding closure includes the class identifier and any
  // `const Alias = ClassName` aliases. without this split, static external writes through
  // class binding (`C.x = Y`) would fail the instance predicate and stay unsound, emitting
  // narrow polyfills that break at runtime when the field has been mutated to a different type
  function collectStaticFieldCandidates(member, fieldName, classPath, isPrivate) {
    let closure = null;
    return collectFieldCandidates({
      earlyBail: () => !isPrivate && isClassExported(classPath),
      initPath: member.get('value'),
      internalThisScan: candidates => appendThisWritesFor(getStaticMethodThisWrites(classPath), fieldName, candidates),
      isPrivate,
      anchor: classPath,
      programGate: program => {
        if (isPrivate) return false;
        closure = getClassBindingClosure(classPath, program);
        return closure === null;
      },
      programWritesPush: (program, candidates) => {
        // static-field temporal narrow not yet modeled (any `<C>.<X>` use could be a deferred
        // call observing static state). bound = Infinity keeps the existing fold-all behavior
        foldExternalWrites(fieldName, p => isReceiverInClosure(p, closure), Infinity, program, candidates);
      },
    });
  }

  // instance field flow: writes via `<inst-binding>.<field> = Y` from any instance binding
  // of the class OR any subclass (transitively), plus `this.<field> = Y` writes inside
  // non-static methods of base + subclasses. instance closure now includes subclass `new
  // Sub()` bindings to fix the case where `class Sub extends Base; const s = new Sub();
  // s.x = "string"` was missed by the base-only closure check
  function collectInstanceFieldCandidates(member, fieldName, classPath, isPrivate) {
    let closure = null;
    let descendant = null;
    return collectFieldCandidates({
      earlyBail: () => !isPrivate && isClassExported(classPath),
      initPath: member.get('value'),
      internalThisScan: candidates => appendThisWritesFor(getInstanceMethodThisWrites(classPath), fieldName, candidates),
      isPrivate,
      anchor: classPath,
      programGate: program => {
        if (isPrivate) return false;
        descendant = collectClassDescendantPaths(classPath, program);
        if (!descendant) return true;
        closure = getClassInstanceClosure(classPath, program);
        return closure === null;
      },
      programWritesPush: (program, candidates) => {
        const bound = getClassInstanceTemporalBound(closure, descendant.names, program);
        // every descendant's non-static methods - subclass `this.X = Y` writes affect the
        // inherited field slot. recursive via descendant set, not just direct subclasses;
        // skip the base classPath since `internalThisScan` already covered it
        for (const sub of descendant.paths) {
          if (sub === classPath) continue;
          appendThisWritesFor(getInstanceMethodThisWrites(sub), fieldName, candidates);
        }
        const predicate = p => isReceiverInClosure(p, closure) || isReceiverNewOfClass(p, descendant.names);
        foldExternalWrites(fieldName, predicate, bound, program, candidates);
      },
    });
  }

  // mirror of `resolveClassFieldType` for object-literal property reads through `this.<name>`.
  // returns the folded RHS-union type for a regular data property, threading flow scans
  // through both inside-method `this.<name> = ...` writes and module-wide
  // `<binding>.<name> = ...` external writes (when the literal has a stable binding name).
  // method/getter/function-valued properties defer to `resolveObjectMember` for their existing
  // call/return semantics. anonymous (no binding name) objects: still scan inside-method
  // writes - external write set is just empty, not unknown. exported objects bail entirely
  let objectFieldTypeCache = new WeakMap();
  function resolveObjectFieldFlow(objectPath, fieldName, callPath) {
    const prop = findObjectMember(objectPath, fieldName);
    if (!prop) return null;
    // method-shaped or function-valued -> existing semantics handle call/return correctly
    if (t.isObjectMethod?.(prop.node)) return resolveObjectMember(objectPath, fieldName, callPath);
    if (t.isObjectProperty?.(prop.node) && t.isFunction?.(prop.node.value)) {
      return resolveObjectMember(objectPath, fieldName, callPath);
    }
    return resolveFieldFlow(prop.node, objectFieldTypeCache, () => collectObjectFieldCandidates(objectPath, prop, fieldName));
  }

  // gather every type that could flow into `fieldName` on `objectPath` via the unified
  // candidate collector. null signals "unknown writer set" (exported binding, anonymous
  // literal with an unsupported leak shape, or aliasing through unenumerable channels) -
  // caller treats as no inference. unlike class-side, object-literal aliasing is enumerated
  // through scope references, so trace-through-alias writes are folded into the union too.
  // closure builder's post-build check also catches the export case, so a null closure
  // subsumes both the historical `isObjectExported` early-bail AND in-walk leak detection
  function collectObjectFieldCandidates(objectPath, prop, fieldName) {
    const closure = computeObjectAliasClosure(objectPath);
    if (!closure) return null;
    return collectFieldCandidates({
      initPath: t.isObjectProperty?.(prop.node) ? prop.get('value') : null,
      internalThisScan: candidates => appendThisWritesFor(getInstanceMethodThisWrites(objectPath), fieldName, candidates),
      isPrivate: false,
      anchor: objectPath,
      programWritesPush: (program, candidates) => {
        const bound = getClosureTemporalBound(closure, program);
        foldExternalWrites(fieldName, p => isReceiverInClosure(p, closure), bound, program, candidates);
      },
    });
  }

  // commonType-fold skipping nullable/never; collapse to null once union-incompatible so the
  // polyfill dispatch routes to the safe generic variant
  function foldNonNullableCommon(types) {
    let result = null;
    for (const cand of types) {
      if (isNullableOrNever(cand)) continue;
      result = result === null ? cand : commonType(result, cand);
      if (result === null) break;
    }
    return result;
  }

  // walk method bodies once and build a Map<fieldName, types[]> of every `this.<X> = Y`
  // / `++this.<X>` write contained within. lets per-field candidate scans become O(1)
  // lookups instead of O(N field) full method walks. caller passes the BODY container
  // path (not the method path) so the traversal root is the body and adapters that visit
  // roots don't fire the FunctionExpression / ClassMethod skip rule on the entry point.
  // StaticBlock has `body: Statement[]` directly on the node and is traversed in-place.
  // compound assignments and update expressions can change type beyond what RHS alone
  // reflects, so they push an `unknown` sentinel that collapses the fold to generic
  function buildThisWritesIndex(methodPaths) {
    const index = new Map();
    const handle = p => {
      const targetPath = t.isAssignmentExpression(p.node) ? p.get('left') : p.get('argument');
      const target = targetPath.node;
      if (!t.isMemberExpression(target) || target.computed) return;
      if (!t.isThisExpression(target.object)) return;
      const fieldName = getKeyName(target.property);
      if (!fieldName) return;
      let types = index.get(fieldName);
      if (!types) index.set(fieldName, types = []);
      if (t.isAssignmentExpression(p.node) && p.node.operator === '=') {
        const rhsType = resolveNodeType(p.get('right'));
        if (rhsType) types.push(rhsType);
      } else types.push(new $Primitive('unknown'));
    };
    const visitors = {
      'FunctionDeclaration|FunctionExpression|ObjectMethod|ClassDeclaration|ClassExpression'(p) {
        p.skip();
      },
      AssignmentExpression: handle,
      UpdateExpression: handle,
    };
    for (const path of methodPaths) {
      if (!path?.node) continue;
      const target = path.node.type === 'StaticBlock' ? path : path.get('body');
      if (!target?.node) continue;
      target.traverse(visitors);
    }
    return index;
  }

  // cached this-writes index for the owner's instance methods (non-static class methods +
  // object-literal methods). a class with N fields would otherwise re-walk all methods N
  // times via per-field scans; one-time index build + per-field Map.get is O(M*B) instead
  // of O(N*M*B). cache by owner node identity (class or object literal AST node)
  let instanceMethodThisWritesCache = new WeakMap();
  function getInstanceMethodThisWrites(ownerPath) {
    return memoize(instanceMethodThisWritesCache, ownerPath.node, () => buildThisWritesIndex(ownerMethodFns(ownerPath)));
  }

  // cached this-writes index for the class's static surface (static methods + StaticBlocks).
  // mirrors `getInstanceMethodThisWrites` shape; separate cache because static methods scan
  // a different method set than instance methods on the same class
  let staticMethodThisWritesCache = new WeakMap();
  function getStaticMethodThisWrites(classPath) {
    return memoize(staticMethodThisWritesCache, classPath.node, () => buildThisWritesIndex(staticOwnerMethodFns(classPath)));
  }

  // append cached this-writes types for `fieldName` from `index` to `out`. nullish entry
  // means "no this-write to this field name in the indexed method set" - no-op
  function appendThisWritesFor(index, fieldName, out) {
    const types = index.get(fieldName);
    if (!types) return;
    for (const type of types) out.push(type);
  }

  // class-static counterpart to `ownerMethodFns`: returns paths whose `this` binds to the
  // class itself - static methods + StaticBlock paths. used by static-field flow scan
  // (instance fields use `ownerMethodFns(classPath)` which excludes static)
  function staticOwnerMethodFns(classPath) {
    const paths = [];
    for (const bodyMember of classPath.get('body').get('body')) {
      // static initialization block - body is a Statement[] array directly on the node;
      // path.traverse() walks the descendants (statements + nested expressions) the same
      // way it walks a method's body; `this` here is the class itself
      if (bodyMember.node?.type === 'StaticBlock') {
        paths.push(bodyMember);
        continue;
      }
      if (!bodyMember.node?.static) continue;
      if (!isMethodMember(bodyMember.node)) continue;
      paths.push(methodFnPath(bodyMember));
    }
    return paths;
  }

  // collect every method-function path that owns a `this` binding within the given owner
  // (a Class or an ObjectExpression). class side: non-static class methods (static `this`
  // refers to the class object itself). object side: ObjectMethod (`{m(){}}`) and
  // FunctionExpression-valued properties (`{m: function(){}}`); arrow-valued properties
  // share outer `this` and are excluded. getter shorthand (`get x(){}`) is a property
  // accessor not a write surface for `this.x`, also excluded
  function ownerMethodFns(ownerPath) {
    const methodFns = [];
    if (t.isClass(ownerPath.node)) {
      for (const bodyMember of ownerPath.get('body').get('body')) {
        if (bodyMember.node.static || !isMethodMember(bodyMember.node)) continue;
        methodFns.push(methodFnPath(bodyMember));
      }
    } else if (t.isObjectExpression(ownerPath.node)) {
      for (const propPath of ownerPath.get('properties')) {
        const propNode = propPath.node;
        if (!propNode || t.isSpreadElement(propNode)) continue;
        if (t.isObjectMethod?.(propNode)) {
          if (propNode.kind === 'get') continue;
          methodFns.push(methodFnPath(propPath));
          continue;
        }
        if (t.isObjectProperty?.(propNode) && propNode.kind !== 'get'
          && t.isFunctionExpression?.(propNode.value)) {
          methodFns.push(propPath.get('value'));
        }
      }
    }
    return methodFns;
  }

  // oxc-wrapped paths don't implement `findParent`; walk the chain directly so unplugin
  // and babel share this helper
  function findProgramPath(path) {
    let current = path;
    while (current && !t.isProgram(current.node)) current = current.parentPath;
    return current;
  }

  // generic memoize over a `WeakMap` cache. uses `has` to distinguish "not yet computed"
  // from "computed as null/undefined" - some caches store null sentinels (closures bailed
  // on leak, descendants bailed on anonymous, etc.). centralizes the get/has/set boilerplate
  function memoize(cache, key, compute) {
    if (cache.has(key)) return cache.get(key);
    const value = compute();
    cache.set(key, value);
    return value;
  }

  // class binding name for identity matching in the external-write scan. `class C {}` exposes
  // `id`; `const C = class {}` reuses the declarator name. anonymous shapes -> null (caller bails)
  // declarator-init binding name extractor: `const X = <init>` / `let X = <init>` / etc.
  // returns `X` only when init === path.node and id is a plain Identifier. shared between
  // class-expression `const C = class{}` form and object-literal `const o = {...}` form.
  // destructured ids (`const {a} = ...`) bail to null - no stable single name to enumerate
  function getDeclaratorBindingName(path) {
    const parent = path.parentPath?.node;
    if (parent?.type === 'VariableDeclarator' && parent.init === path.node && t.isIdentifier(parent.id)) {
      return parent.id.name;
    }
    return null;
  }

  // every module-level export name as a Set: covers `export const X`, `export class X`,
  // `export function X`, `export default class X`, `export default function X`, and the
  // separate-specifier forms `export { X }` / `export { X as Y }`. cached per program node.
  // used by closure builders to bail on any closure binding whose name is exported - an
  // importer with `import { X }` then `X.field = Y` mutates state we can't enumerate
  let exportedNamesCache = new WeakMap();
  function getExportedNames(programPath) {
    if (!programPath) return null;
    return memoize(exportedNamesCache, programPath.node, () => {
      const names = new Set();
      for (const stmt of programPath.node.body) {
        if (stmt.type === 'ExportNamedDeclaration') {
          if (stmt.specifiers) {
            for (const spec of stmt.specifiers) if (spec.local?.name) names.add(spec.local.name);
          }
          const decl = stmt.declaration;
          if (decl?.type === 'VariableDeclaration') {
            for (const d of decl.declarations ?? []) if (d.id?.type === 'Identifier') names.add(d.id.name);
          } else if (decl?.id?.name) names.add(decl.id.name);  // ClassDeclaration / FunctionDeclaration
        } else if (stmt.type === 'ExportDefaultDeclaration' && stmt.declaration?.id?.name) {
          // `export default class X {}` / `export default function X() {}` - the named form
          // both exposes `default` to importers AND retains the local binding `X`. anonymous
          // default declarations (`export default {...}`) carry no in-module name, so caller
          // already had no enumerable name to track
          names.add(stmt.declaration.id.name);
        }
      }
      return names;
    });
  }

  function isBindingExportedByName(name, programPath) {
    return !!name && (getExportedNames(programPath)?.has(name) ?? false);
  }

  function classBindingName(classPath) {
    return classPath.node.id?.name ?? getDeclaratorBindingName(classPath);
  }

  // is this class reachable from outside the module? exported classes lose external-write
  // tracking - any importer can mutate public fields. all named-export forms are covered
  // by `getExportedNames` (decl-as-export `export class C {}` / `export const C = class {}`,
  // separate spec `export { C }`, default-named `export default class C {}`). anonymous
  // classes have no `classBindingName` so caller bails before reaching here.
  // CommonJS (`module.exports.C = C`) currently NOT detected - usage-pure flows assume ESM
  function isClassExported(classPath) {
    return isBindingExportedByName(classBindingName(classPath), findProgramPath(classPath));
  }

  // is the node `new <X>(...)` for any X in the accepted names Set? callee is unwrapped
  // from ParenthesizedExpression and TS expression wrappers so `new (C)()` / `new (C as any)()`
  // parser-preserved shapes still match. instance flow scan passes the inheritance-descendant
  // name set so `new Sub()` is recognized as instantiating a Base-derived class
  function isNewOfClass(node, classNames) {
    if (!t.isNewExpression(node)) return false;
    const callee = unwrapRuntimeExpr(node.callee);
    if (!callee || callee.type !== 'Identifier') return false;
    return classNames.has(callee.name);
  }

  // does `<expr>` look like a direct `new <X>(...)` write target (`(new C()).x = Y`)?
  // class closure tracks bound instances; this predicate covers the residual shape where
  // an unbound instance immediately receives a write via member access
  function isReceiverNewOfClass(objPath, classNames) {
    return isNewOfClass(objPath.node, classNames);
  }

  // object-literal binding name for identity matching in the external-write scan. only
  // declarator-init form (`const o = {...}` / `let o = {...}`) - other shapes (function
  // arg, return value, property value) carry no stable name through which external writes
  // can be enumerated. anonymous literals -> null (caller bails)
  function objectBindingName(objectPath) {
    return getDeclaratorBindingName(objectPath);
  }

  // is the parent of an Identifier reference a member-access where the identifier is the
  // receiver (object slot)? `o.x` / `o?.x` / `o.x = y` / `o[expr]` all qualify. used to
  // distinguish trivial member access from any other use (alias, call arg, return value,
  // computed-key on another receiver, ...) that constitutes an escape channel
  function isMemberRefReceiver(parent, refNode) {
    return (parent?.type === 'MemberExpression' || parent?.type === 'OptionalMemberExpression')
      && parent.object === refNode;
  }

  // collect every reference path of `binding` (excluding the declarator id slot). babel
  // exposes the canonical `binding.referencePaths`; estree-toolkit doesn't - fall back to
  // program walk gated on scope-identity equality (rejects same-name shadows in inner
  // scopes). null result signals "couldn't enumerate" (no program path)
  function collectBindingReferences(binding, name, anchorPath) {
    if (Array.isArray(binding.referencePaths)) return binding.referencePaths;
    const program = findProgramPath(anchorPath);
    if (!program) return null;
    const refs = [];
    program.traverse({
      Identifier(p) {
        if (p.node.name !== name) return;
        if (p.scope?.getBinding(name) !== binding) return;
        if (p.parent?.type === 'VariableDeclarator' && p.parent.id === p.node) return;
        refs.push(p);
      },
    });
    return refs;
  }

  // ref classifier used during alias-closure construction. categories:
  //   'trivial' - reference is a member-access receiver (`<name>.X` / `<name>?.X` / `<name>[expr]`)
  //               or any other shape that doesn't escape the binding's value
  //   'alias'   - `const <newName> = <ref>` declarator; closure absorbs `newName` and recurses
  //   'leak'    - everything else; opens an unmonitored mutation channel
  // default classifier is used by object-literal and class-instance closures (binding holds an
  // object-shape value). class-binding closure swaps in `classBindingRefClassifier` which also
  // accepts `new ClassName()`, `class Sub extends ClassName`, `x instanceof ClassName` -
  // those uses don't escape the binding's value (the class) for static-state mutation purposes
  function defaultAliasRefClassifier(parent, refNode) {
    if (isMemberRefReceiver(parent, refNode)) return 'trivial';
    if (parent?.type === 'VariableDeclarator' && parent.init === refNode && parent.id?.type === 'Identifier') {
      return 'alias';
    }
    // direct assignment to the binding (`o = newValue`) is rebinding the binding, not
    // mutating the anchored value via it. for root closure binding: anchor literal/instance
    // is unchanged regardless of where `o` later points. for alias binding: alias now points
    // elsewhere but the already-captured binding identity stays. writes through the binding
    // after rebinding apply to the new value (over-counted in original anchor's narrow but
    // sound - wider union collapses to generic at worst, no unsound polyfill emitted)
    if (parent?.type === 'AssignmentExpression' && parent.left === refNode && parent.operator === '=') return 'trivial';
    return 'leak';
  }

  function classBindingRefClassifier(parent, refNode) {
    const base = defaultAliasRefClassifier(parent, refNode);
    if (base !== 'leak') return base;
    if (parent?.type === 'NewExpression' && parent.callee === refNode) return 'trivial';
    if ((parent?.type === 'ClassDeclaration' || parent?.type === 'ClassExpression')
      && parent.superClass === refNode) return 'trivial';
    if (parent?.type === 'BinaryExpression' && parent.operator === 'instanceof' && parent.right === refNode) return 'trivial';
    // TS type-position references (`Config<T>`, `typeof Config.items`, `Config | string`, ...)
    // are erased at runtime - they don't mutate static state. parser node types prefixed with
    // "TS" cover type-only contexts (TSTypeReference, TSQualifiedName, TSTypeQuery, etc.);
    // exclude the runtime expression wrappers (TS_EXPR_WRAPPERS: TSAsExpression, etc.) which
    // wrap a runtime expression and could lead to a write
    if (parent?.type?.startsWith('TS') && !TS_EXPR_WRAPPERS.has(parent.type)) return 'trivial';
    return 'leak';
  }

  // build the alias closure starting from `(rootBinding, rootName)`: every name reachable
  // via `const alias = <existing-name-in-closure>` chains. returns Map<name, binding> on
  // success or null when a leak is detected (any reference of a closure name that isn't a
  // member-access AND isn't an alias-creation AND isn't a rebinding-to-the-binding-itself -
  // call args, returns, spread, `x[name]`, ... open mutation channels we can't enumerate)
  // OR when any closure name is module-exported (importer can mutate from outside).
  // `classifier` parametrizes what counts as trivial / alias / leak so class binding (relaxed
  // for `new C()` / `extends C` / `instanceof C` / TS types) and object-literal / instance
  // binding (strict) share the same walker
  function computeAliasClosureFromBinding(rootBinding, rootName, anchorPath, classifier = defaultAliasRefClassifier) {
    if (!rootBinding) return null;
    const closure = new Map([[rootName, rootBinding]]);
    const queue = [{ name: rootName, binding: rootBinding }];
    while (queue.length) {
      const { name, binding } = queue.shift();
      const refs = collectBindingReferences(binding, name, anchorPath);
      if (!refs) return null;
      for (const ref of refs) {
        const { parent } = ref;
        const kind = classifier(parent, ref.node);
        if (kind === 'trivial') continue;
        if (kind === 'alias') {
          const aliasName = parent.id.name;
          if (closure.has(aliasName)) continue;
          const aliasBinding = ref.scope?.getBinding(aliasName);
          if (!aliasBinding) return null;
          closure.set(aliasName, aliasBinding);
          queue.push({ name: aliasName, binding: aliasBinding });
          continue;
        }
        return null;
      }
    }
    // any closure binding declared via decl-as-export (`export const X = ...`) or named
    // `export default class X` exposes `X` to importers, who can mutate fields outside our
    // scan window. classifier-level leak detection only catches separate-spec exports
    // (`export { X }`) via the ExportSpecifier reference; declarator-id slots are excluded
    // from `binding.referencePaths`, so this post-build check covers the gap. soundness
    // contract: any export -> bail to no-narrow rather than emit unsound polyfill
    const exported = getExportedNames(findProgramPath(anchorPath));
    if (exported) {
      for (const name of closure.keys()) if (exported.has(name)) return null;
    }
    return closure;
  }

  // anonymous objects (no stable binding name) get an empty closure rather than null bail:
  // there's no name through which external writes can target them, so the empty closure's
  // write filter matches zero writes - safe partial scan from init + this-writes only.
  // named bindings delegate to the generic closure builder (which may itself return null
  // on leak / reassignment). cached per ObjectExpression node: a single literal can have
  // many distinct field reads (`this.a`, `this.b`, ...) but the closure is field-agnostic
  let objectAliasClosureCache = new WeakMap();
  const EMPTY_CLOSURE = new Map();
  function computeObjectAliasClosure(objectPath) {
    return memoize(objectAliasClosureCache, objectPath.node, () => {
      const rootName = objectBindingName(objectPath);
      return rootName
        ? computeAliasClosureFromBinding(objectPath.scope?.getBinding(rootName), rootName, objectPath)
        : EMPTY_CLOSURE;
    });
  }

  // does the write's receiver Identifier resolve (via scope-binding identity) to a name in
  // the alias closure? matches `o.x = ...`, `alias.x = ...` etc. for any `alias` in the
  // closure (`Map<name, binding>` from `computeObjectAliasClosure` / `collectClassInstanceClosure`).
  // shadowed same-name bindings in nested scopes are rejected by the scope-binding identity
  // check. shared between object-literal and class-instance write filters
  function isReceiverInClosure(objPath, closure) {
    if (!t.isIdentifier(objPath.node)) return false;
    const trackedBinding = closure.get(objPath.node.name);
    if (!trackedBinding) return false;
    return objPath.scope?.getBinding(objPath.node.name) === trackedBinding;
  }

  // classify a closure-binding-name reference's contribution to temporal-flow bounding:
  //   null         - declaration site or alias-creation (no temporal contribution)
  //   'call'       - direct method call `<name>.<X>(...)` - extends call bound to ctx.start
  //   'write'      - assignment / update on `<name>.<X>` - external write, fold separately
  //   'extraction' - any other use (`f(name)`, `name.X.Y`, `name.X.bind(...)`, ...) - the
  //                  binding's value escapes, deferred invocation can happen at any time
  // shared between object-literal closure and class-instance closure walkers
  function classifyClosureRef(p) {
    const { parent } = p;
    if (parent?.type === 'VariableDeclarator' && parent.id === p.node) return null;
    if (parent?.type === 'VariableDeclarator' && parent.init === p.node) return null;
    if ((parent?.type !== 'MemberExpression' && parent?.type !== 'OptionalMemberExpression')
      || parent.object !== p.node) return { kind: 'extraction' };
    const ctx = p.parentPath?.parent;
    if ((ctx?.type === 'CallExpression' || ctx?.type === 'OptionalCallExpression') && ctx.callee === parent) {
      return { kind: 'call', start: ctx.start };
    }
    if (ctx?.type === 'AssignmentExpression' && ctx.left === parent && ctx.operator === '=') return { kind: 'write' };
    if (ctx?.type === 'UpdateExpression' && ctx.argument === parent) return { kind: 'write' };
    return { kind: 'extraction' };
  }

  // latest source position where any closure binding could be invoked. used to bound the
  // external-write fold by temporal flow: writes whose start >= this bound happen after
  // every observable invocation, so they cannot be observed at any call site of any method
  // on the closure. returns:
  //   `Infinity` - method extraction detected; deferred invocation can happen any time, so
  //                no temporal benefit applies and all writes are folded as before
  //   numeric    - latest start of `<closure-name>.<X>(...)` direct call expression
  //   `-Infinity` - no calls AND no extractions: closure methods are never invoked, so all
  //                writes happen after their (non-existent) observable time and are excluded
  // shared between object-literal and class-instance closures. `extraVisitorsFactory`
  // optionally supplies additional traversal visitors (class case adds NewExpression to
  // catch direct `new C().method(...)` chain calls, which don't go through closure bindings)
  // cached by closure Map identity. closures are themselves cached upstream (per class /
  // object node), so the same Map instance is reused across multiple field queries on the
  // same anchor - one program walk per closure instead of one per field. for the class case
  // `extraVisitorsFactory` captures classNames derived from the same class as the closure,
  // so the bound is determined entirely by closure identity (class with N instance fields:
  // N walks -> 1 walk + N - 1 cache hits)
  let closureTemporalBoundCache = new WeakMap();
  function getClosureTemporalBound(closure, programPath, extraVisitorsFactory) {
    return memoize(closureTemporalBoundCache, closure, () => {
      let latestCallStart = -Infinity;
      let extracted = false;
      const noteCall = start => {
        if (start !== null && start !== undefined && start > latestCallStart) latestCallStart = start;
      };
      const visitors = {
        Identifier(p) {
          if (extracted || !closure.has(p.node.name)) return;
          const binding = closure.get(p.node.name);
          if (p.scope?.getBinding(p.node.name) !== binding) return;
          const cls = classifyClosureRef(p);
          if (cls === null || cls.kind === 'write') return;
          if (cls.kind === 'extraction') extracted = true;
          else noteCall(cls.start);
        },
      };
      if (extraVisitorsFactory) {
        Object.assign(visitors, extraVisitorsFactory({
          noteCall,
          markExtraction: () => { extracted = true; },
          isExtracted: () => extracted,
        }));
      }
      programPath.traverse(visitors);
      return extracted ? Infinity : latestCallStart;
    });
  }

  // class-side temporal bound: closure refs PLUS direct `new C().method(...)` chain calls
  // that aren't captured by any binding. `(new C()).x = Y` writes are similarly handled
  // separately by `isReceiverNewOfClass` in the write-filter predicate. `classNames` is the
  // descendant-names Set so subclass invocations also extend the bound
  function getClassInstanceTemporalBound(closure, classNames, programPath) {
    return getClosureTemporalBound(closure, programPath, ({ noteCall, isExtracted }) => ({
      NewExpression(p) {
        if (isExtracted()) return;
        if (!isNewOfClass(p.node, classNames)) return;
        const { parent } = p;
        if (parent?.type !== 'MemberExpression' || parent.object !== p.node) return;
        const ctx = p.parentPath?.parent;
        if ((ctx?.type === 'CallExpression' || ctx?.type === 'OptionalCallExpression')
          && ctx.callee === parent) noteCall(ctx.start);
      },
    }));
  }

  // build the union alias closure across every `new <ClassName>()`-bound instance in the
  // module, where ClassName is the base class OR any transitive subclass (subclass instance
  // writes affect base's inherited field slot). each bound declarator's chain (via
  // `computeAliasClosureFromBinding`) becomes part of the union; anonymous instance bindings
  // (destructured ids, etc.) and direct `new C()` in unsafe positions (function arg /
  // return / spread / ...) signal "unmonitored channel" and the entire closure bails to null.
  // anonymous classes (no `className`) bail unconditionally - external writes via instance
  // are unenumerable without a stable name. returned `Map<name, binding>` plugs into
  // `isReceiverInClosure` and `getClosureTemporalBound` the same way the object closure does
  function collectClassInstanceClosure(classPath, programPath) {
    const desc = collectClassDescendantPaths(classPath, programPath);
    if (!desc) return null;
    const closure = new Map();
    let leaked = false;
    programPath.traverse({
      VariableDeclarator(p) {
        if (leaked) return;
        if (!isNewOfClass(p.node.init, desc.names)) return;
        const { id } = p.node;
        if (id?.type !== 'Identifier') {
          leaked = true;
          return;
        }
        const binding = p.scope?.getBinding(id.name);
        const sub = computeAliasClosureFromBinding(binding, id.name, p);
        if (sub === null) {
          leaked = true;
          return;
        }
        for (const [name, b] of sub) closure.set(name, b);
      },
      NewExpression(p) {
        if (leaked) return;
        if (!isNewOfClass(p.node, desc.names)) return;
        const { parent } = p;
        // safe positions for direct `new C()`:
        //   - VariableDeclarator init (already handled by VariableDeclarator visitor above)
        //   - bare ExpressionStatement (`new C();`) - value discarded, no channel
        //   - MemberExpression where the new is the receiver (`new C().x`) - field accessed
        //     once, instance dies; no later mutation channel
        if (parent?.type === 'VariableDeclarator' && parent.init === p.node) return;
        if (parent?.type === 'ExpressionStatement') return;
        if (parent?.type === 'MemberExpression' && parent.object === p.node) return;
        leaked = true;
      },
    });
    return leaked ? null : closure;
  }

  // cached wrapper of `collectClassInstanceClosure`. mirrors `objectAliasClosureCache`:
  // a class with N fields would otherwise re-walk the program N times during candidate
  // collection. cache by class node identity. distinguish `null` (cached as "leaked") from
  // `undefined` (not yet computed) via `cache.has`. reset alongside other module-scoped
  // caches in the cache-reset hook
  let classInstanceClosureCache = new WeakMap();
  function getClassInstanceClosure(classPath, programPath) {
    return memoize(classInstanceClosureCache, classPath.node, () => collectClassInstanceClosure(classPath, programPath));
  }

  // class binding closure: the class identifier itself (`C`) and all `const A = C` aliases.
  // `C.x = Y` and `A.x = Y` writes match this closure for static-field external writes.
  // built via `computeAliasClosureFromBinding` with the relaxed `classBindingRefClassifier`
  // so `new C()` / `extends C` / `instanceof C` references don't trigger leak. cached per
  // class node identity. unlike instance closure (where any leak bails the entire scan),
  // static closure falls back to the minimal `{className: binding}` set on alias-walk leak -
  // direct `<className>.<field> = Y` writes are still captured even if alias enumeration
  // hit a shape we couldn't classify. preserves narrow on TS-heavy classes where the babel
  // scope tracker may include type-position refs we can't categorize precisely
  let classBindingClosureCache = new WeakMap();
  function getClassBindingClosure(classPath, anchorPath) {
    return memoize(classBindingClosureCache, classPath.node, () => {
      const className = classBindingName(classPath);
      const binding = className ? classPath.scope?.getBinding(className) : null;
      if (!binding) return null;
      const expanded = computeAliasClosureFromBinding(binding, className, anchorPath, classBindingRefClassifier);
      return expanded ?? new Map([[className, binding]]);
    });
  }

  // generic write-folder: `writePath` is a pre-filtered `<expr>.<fieldName> = Y` from the
  // module index (operator / member / field-name already satisfied). caller supplies a
  // `predicate(objPath)` that decides whether this write's receiver belongs to the field's
  // monitored set. `this.<fieldName> = ...` writes are scanned separately by the per-owner
  // this-writes index (`getInstanceMethodThisWrites` / `getStaticMethodThisWrites`), so
  // they're skipped here to avoid double-counting
  function pushIfWriteMatches(writePath, predicate, out) {
    const objPath = writePath.get('left').get('object');
    if (t.isThisExpression(objPath.node)) return;
    if (!predicate(objPath)) return;
    const rhsType = resolveNodeType(writePath.get('right'));
    if (rhsType) out.push(rhsType);
  }

  // precomputed per-module index for the module-wide flow scan. naive approach does two full
  // traversals per public field (subclasses + external writes), yielding O(fields x N). build
  // once, look up by name, turning the total into a single O(N) pass amortized across every
  // public field query in the module
  let moduleFieldIndexCache = new WeakMap();
  function getModuleFieldIndex(programPath) {
    return memoize(moduleFieldIndexCache, programPath.node, () => {
      const writesByField = new Map();
      const subclassesBySuper = new Map();
      const pushMultimap = (map, key, value) => {
        const list = map.get(key);
        if (list) list.push(value);
        else map.set(key, [value]);
      };
      programPath.traverse({
        'ClassDeclaration|ClassExpression'(p) {
          const sup = p.node.superClass;
          if (t.isIdentifier(sup)) pushMultimap(subclassesBySuper, sup.name, p);
        },
        AssignmentExpression(p) {
          // only pure `=` is type-precise here: RHS value becomes the new field type.
          // compound (`+=` / `||=` / `??=` / `*=` ...) is operator-coerced - the resulting
          // type depends on BOTH operands and the operator's coercion rules, which the
          // candidate-union model can't represent (pushing RHS as a candidate is wrong:
          // for `+= 'x'` the field becomes `string` regardless of init, not `init | string`)
          if (p.node.operator !== '=') return;
          const { left } = p.node;
          if (!t.isMemberExpression(left) || left.computed) return;
          const name = getKeyName(left.property);
          if (name) pushMultimap(writesByField, name, p);
        },
      });
      return { writesByField, subclassesBySuper };
    });
  }

  // clone a TSTypeReference with each typeParameters arg substituted via `subst`. used to
  // compose an outer subst into a `Base<T>` ref before passing to `buildParentSubst` -
  // otherwise the parent's decl-param map binds raw `T` instead of the substituted concrete
  function applySubstToTypeRefArgs(typeRef, subst) {
    if (!subst || !typeRef?.typeParameters?.params?.length) return typeRef;
    return {
      ...typeRef,
      typeParameters: {
        ...typeRef.typeParameters,
        params: typeRef.typeParameters.params.map(a => applyAliasSubstDeep(a, subst)),
      },
    };
  }

  // resolve `name` against a member array, substituting `subst` into each member's annotations
  // first. shared shortcut for both own-body and extends-parent paths
  function resolveSubstitutedMember(members, subst, name, scope, callPath) {
    return members?.length ? resolveMemberFromMembers(substMembers(members, subst), name, scope, callPath) : null;
  }

  // merged class+interface member lookup. interface body's own members first, then parents
  // via `extends` - `interface C extends A` lets `A.x` show up on `C` via declaration merging.
  // each iface builds its own subst against ITS type-param names from `receiverArgs`, so
  // class+interface merging with renamed type-params (`class C<T>` + `interface C<U>`) picks
  // up the correct slot positionally. resolveMemberFromMembers does the per-member
  // annotation -> type step
  function resolveMergedInterfaceMember(className, scope, name, callPath, receiverArgs) {
    const interfaces = findAllTypeDeclarations(className, scope).filter(isInterfaceDeclaration);
    for (const iface of interfaces) {
      const ifaceSubst = buildSubstMap(iface.typeParameters?.params, receiverArgs);
      // TS: iface.body.body; Flow: iface.body.properties
      const ownBody = iface.body?.body ?? iface.body?.properties;
      const ownHit = resolveSubstitutedMember(ownBody, ifaceSubst, name, scope, callPath);
      if (ownHit) return ownHit;
      for (const parent of iface.extends ?? []) {
        const expr = extendsId(parent);
        if (!expr) continue;
        const parentRef = expr.type === 'Identifier'
          ? { type: 'TSTypeReference', typeName: expr, typeParameters: getTypeArgs(parent) }
          : expr;
        const parentMembers = getTypeMembers(parentRef, scope);
        if (!parentMembers) continue;
        // compose ifaceSubst -> parentSubst: interface's `extends Base<U>` carries the
        // iface-param through the receiver-type-arg slot; without composition, Base<U>'s
        // decl-param map gets a raw `U` reference instead of the substituted type
        const ownSubst = buildParentSubst(applySubstToTypeRefArgs(parentRef, ifaceSubst), scope);
        const hit = resolveSubstitutedMember(parentMembers, ownSubst, name, scope, callPath);
        if (hit) return hit;
      }
    }
    return null;
  }

  function resolveMemberFromMembers(members, name, scope, callPath) {
    if (!members) return null;
    for (const member of members) {
      if (member.computed) continue;
      if (!keyMatchesName(member.key, name)) continue;
      if (member.type === 'TSMethodSignature') {
        if (callPath) {
          const returnType = member.returnType ?? member.typeAnnotation;
          return returnType ? resolveTypeAnnotation(returnType, scope) : null;
        }
        return new $Object('Function');
      }
      if (member.type === 'TSPropertySignature' || member.type === 'ObjectTypeProperty') {
        const annotation = member.typeAnnotation ?? member.value;
        return annotation ? resolveTypeAnnotation(annotation, scope) : null;
      }
    }
    return null;
  }

  function findObjectMember(objectPath, name) {
    const properties = objectPath.get('properties');
    for (let i = properties.length - 1; i >= 0; i--) {
      const prop = properties[i];
      if (t.isSpreadElement(prop.node)) return null;
      if (!prop.node.computed && prop.node.kind !== 'set' && keyMatchesName(prop.node.key, name)) return prop;
    }
    return null;
  }

  function resolveObjectMember(objectPath, name, callPath) {
    const prop = findObjectMember(objectPath, name);
    if (!prop) return null;
    // method call: obj.foo()
    const propFn = t.isObjectMethod(prop.node) ? methodFnPath(prop) : null;
    if (callPath) {
      if (propFn) {
        const r = resolveMethodOrGetterCallReturn(propFn, prop.node.kind, callPath);
        if (r) return r;
      } else if (t.isObjectProperty(prop.node)) {
        const value = resolveRuntimeExpression(prop.get('value'));
        if (value.node && t.isFunction(value.node)) return resolveReturnType(value, callPath);
      }
      return null;
    }
    // property access: obj.foo
    if (t.isObjectProperty(prop.node)) return resolveNodeType(prop.get('value'));
    // method: getter returns its return type, regular method returns Function
    if (propFn) return prop.node.kind === 'get' ? resolveReturnType(propFn) : new $Object('Function');
    return null;
  }

  // extract the return type annotation from a method/property call signature
  function memberCallReturnAnnotation(member) {
    switch (member.type) {
      // Babel: TSMethodSignature.typeAnnotation; ESTree: TSMethodSignature.returnType
      case 'TSMethodSignature':
        return member.typeAnnotation ?? member.returnType;
      // class methods and declared methods carry returnType directly
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'TSDeclareMethod':
        return member.returnType;
      // ESTree class method: function lives on `.value` (FunctionExpression)
      case 'MethodDefinition':
        return member.value?.returnType;
      // property with a function-type annotation: extract its return type
      case 'TSPropertySignature':
        return functionTypeReturnAnnotation(unwrapTypeAnnotation(member.typeAnnotation));
      // Flow: ObjectTypeProperty with FunctionTypeAnnotation value
      case 'ObjectTypeProperty':
        return functionTypeReturnAnnotation(unwrapTypeAnnotation(member.value));
    }
    return null;
  }

  // --- Member calls & runtime member resolution ---
  // resolve a method call's return type from a single (non-union) annotation by walking
  // its members and folding the return types of all matching overloads
  //   1. Skip overloads with unresolvable return types (don't bail the entire merge)
  //   2. Try lenient `foldUnionTypes` over the resolved set
  //   3. If that fails (divergent primitives etc.), fall back to the FIRST resolved overload.
  //      Interface signatures are tried in declaration order; TS picks the first matching one,
  //      so falling back to "first" is a reasonable approximation when we can't run full
  //      argument-type-based overload selection
  function resolveMemberCallReturnFromAnnotation(annotation, name, scope, resolve, depth, subst) {
    const members = getTypeMembers(annotation, scope, depth);
    if (!members) return null;
    const resolvedReturns = [];
    for (const member of members) {
      if (!keyMatchesName(member.key, name)) continue;
      const returnAnnotation = memberCallReturnAnnotation(member);
      if (!returnAnnotation) continue;
      // apply subst so generic alias method returns (`type Box<T> = { get(): T[] }`) bind T
      // through every nested shape (arrays/tuples/unions), not just top-level references
      const substituted = subst ? applyAliasSubstDeep(unwrapTypeAnnotation(returnAnnotation), subst) : returnAnnotation;
      const resolved = resolve(substituted);
      if (resolved) resolvedReturns.push(resolved);
    }
    if (!resolvedReturns.length) return null;
    if (resolvedReturns.length === 1) return resolvedReturns[0];
    return foldUnionTypes(resolvedReturns, r => r) ?? resolvedReturns[0];
  }

  // union/intersection method calls - for `x: A | B` or `x: A & B` calling `x.foo()`,
  // resolve in each branch. union folds per-branch return types; intersection picks the
  // first branch that resolves (intersection members are additive, so any match is valid).
  // mirrors findTypeMember's handling for properties
  function resolveMemberCallReturn(annotation, name, scope, resolve, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    const { node: aliased, subst } = followTypeAliasChain(annotation, scope);
    const peelBranch = branch => applySubst(unwrapTypeAnnotation(branch), subst);
    if (aliased?.type === 'TSUnionType' || aliased?.type === 'UnionTypeAnnotation') {
      let result = null;
      for (const branch of aliased.types) {
        const branchResult = resolveMemberCallReturn(peelBranch(branch), name, scope, resolve, depth + 1);
        if (!branchResult) return null;
        result = commonType(result, branchResult);
        if (!result) return null;
      }
      return result;
    }
    if (aliased?.type === 'TSIntersectionType' || aliased?.type === 'IntersectionTypeAnnotation') {
      for (const branch of aliased.types) {
        const branchResult = resolveMemberCallReturn(peelBranch(branch), name, scope, resolve, depth + 1);
        if (branchResult) return branchResult;
      }
      return null;
    }
    return resolveMemberCallReturnFromAnnotation(aliased ?? annotation, name, scope, resolve, depth, subst);
  }

  // serialize `x`, `this.data`, `obj.a.b` - null for computed / shapes we don't probe
  function pathKey(node) {
    if (node?.type === 'Identifier') return node.name;
    if (node?.type === 'ThisExpression') return 'this';
    const propName = getMemberProperty(node);
    if (propName !== null) {
      const parent = pathKey(node.object);
      return parent === null ? null : `${ parent }.${ propName }`;
    }
    return null;
  }

  // oxc wraps optional chains in ChainExpression (`s?.kind` -> `ChainExpression > Member{optional}`);
  // babel uses OptionalMemberExpression directly. peel both so downstream sees the member node
  function peelParensAndChain(node) {
    node = unwrapParens(node);
    if (node?.type === 'ChainExpression') node = node.expression;
    return node;
  }

  // strip outer parens + leading `!` so `if (!(x === 'a'))` narrows identically to `x !== 'a'`.
  // returns the peeled test plus a flag the caller XOR-s into its own polarity tracker.
  // peels ALL consecutive `!` operators (parity-tracked) so `!!X` -> X with negated=false,
  // `!!!X` -> X with negated=true. without this, double-bang coercion `!!(typeof x === 'a')`
  // (idiom for explicit boolean cast) leaves a leftover UnaryExpression that the binary /
  // call branches below don't pattern-match against
  function peelNegation(test) {
    // unwrapRuntimeExpr strips parens + ChainExpression + TS wrappers (`as` / `satisfies` / `!`)
    // so `((x as any) instanceof Array)` and `Array.isArray?.(x)` (ESTree wraps optional calls
    // in ChainExpression) reach the same `BinaryExpression` / `CallExpression` shape that the
    // typeof / instanceof / known-static branches below pattern-match against
    let negated = false;
    test = unwrapRuntimeExpr(test);
    while (test?.type === 'UnaryExpression' && test.operator === '!') {
      negated = !negated;
      test = unwrapRuntimeExpr(test.argument);
    }
    return { test, negated };
  }

  // `<path>.field OP 'value'` where OP is `===` / `==` / `!==` / `!=`; returns null for
  // other shapes. `conditionTrue` flips the sign when the guard sits in an else-branch.
  // `scope` (optional) enables value-side resolution beyond bare literals: `Kind.A` /
  // `Kind['A']` enum-member access, identifier alias to a literal, single-quasi template
  // literal - all routed through `resolveComputedKeyName` which already handles them
  function parseDiscriminantCheck(rawTest, targetKey, conditionTrue, scope) {
    const { test, negated } = peelNegation(rawTest);
    if (negated) conditionTrue = !conditionTrue;
    if (test?.type !== 'BinaryExpression') return null;
    const isEq = test.operator === '===' || test.operator === '==';
    const isNeq = test.operator === '!==' || test.operator === '!=';
    if (!isEq && !isNeq) return null;
    const left = peelParensAndChain(test.left);
    const right = peelParensAndChain(test.right);
    const pair = memberLiteralPair(left, right, targetKey, scope) ?? memberLiteralPair(right, left, targetKey, scope);
    return pair && { ...pair, positive: isEq === conditionTrue };
  }

  function memberLiteralPair(memberExpr, literalNode, targetKey, scope) {
    const field = getMemberProperty(memberExpr);
    if (field === null) return null;
    if (pathKey(memberExpr.object) !== targetKey) return null;
    // value side: bare literal first (cheap, no scope walk), then enum-member / alias-chain /
    // template-literal via `resolveComputedKeyName`. without the second branch,
    // `box.kind === Kind.A` (and `Kind['A']` / `Kind[`A`]`) stays unmatched and the
    // discriminant narrowing falls back to the unrefined union receiver
    const value = literalKeyValue(literalNode)
      ?? (scope ? resolveComputedKeyName(literalNode, scope) : null);
    return value === null ? null : { field, value };
  }

  // narrowing-context: snapshot of varPath's binding-identity + reassignment history that
  // each candidate guard must clear before contributing. extracted into a single record so
  // both walk-up and preceding-exit collectors share one signature
  function buildDiscriminantContext(varPath, targetKey) {
    const [rootName] = targetKey.split('.', 1);
    return {
      rootName,
      objectBinding: rootName === 'this' ? null : varPath.scope?.getBinding(rootName),
      violations: rootName === 'this' ? [] : varPath.scope?.getBinding(rootName)?.constantViolations ?? [],
      objectStart: varPath.node?.start,
    };
  }

  // a guard is valid for narrowing iff (a) `rootName` resolves to the same binding in the
  // guard's enclosing scope as at varPath (rejects inner-shadow leakage), and (b) no
  // reassignment of that binding sits between `testEnd` and the use site (`ctx.objectStart`)
  function discriminantGuardApplies(scope, testEnd, ctx) {
    const { rootName, objectBinding, violations, objectStart } = ctx;
    if (rootName !== 'this' && objectBinding && scope?.getBinding(rootName) !== objectBinding) return false;
    return testEnd === undefined || objectStart === undefined
      || !violations.some(v => v.node?.start > testEnd && v.node?.start < objectStart);
  }

  // flatten `&&` (truthy) / `||` (falsy) chains so a discriminant clause embedded alongside
  // other tests (`if (x && f.kind === 'a')` / `if (!ready || f.kind !== 'b') return;`) still
  // contributes its narrowing. each clause goes through `parseDiscriminantCheck` (which peels
  // its own `!`/parens), survivors append to `out`. `scope` threads through to enable
  // enum-member / alias-chain resolution on the literal side of the comparison
  function pushDiscriminantClauses(test, conditionTrue, targetKey, out, scope) {
    const parts = flattenCondition(test, conditionTrue ? '&&' : '||');
    for (const part of parts) {
      const guard = parseDiscriminantCheck(part, targetKey, conditionTrue, scope);
      if (guard) out.push(guard);
    }
  }

  // scan preceding-sibling statements of `current` at its block level; for each one that
  // unconditionally exits (`if (X) return;` / `... else throw ...`), collect the narrowed
  // discriminant form into `out`. mirrors `findPrecedingExitGuards` but for discriminant kinds
  function collectPrecedingExitDiscriminants(current, targetKey, out, ctx) {
    const siblings = getStatementSiblings(current);
    if (!siblings) return;
    for (let i = current.key - 1; i >= 0; i--) {
      const sibling = siblings[i];
      const exitCond = resolveExitCondition(sibling);
      if (exitCond === null) continue;
      if (!discriminantGuardApplies(sibling.scope, sibling.node.test?.end, ctx)) continue;
      pushDiscriminantClauses(sibling.node.test, exitCond, targetKey, out, sibling.scope);
    }
  }

  // walk up collecting `<path>.kind === 'a'` / `!==` guards from enclosing if / ternary / `&&`,
  // plus preceding early-exit siblings. `targetKey` covers arbitrary LHS shapes
  // (Identifier / `this.x` / `obj.a.b`). binding-identity + mutation checks (via `ctx`)
  // reject inner-shadow leakage and stale narrowing across reassignments
  function findDiscriminantGuards(varPath, targetKey) {
    const guards = [];
    const ctx = buildDiscriminantContext(varPath, targetKey);
    for (let current = varPath; current?.parentPath; current = current.parentPath) {
      const parent = current.parentPath;
      let test;
      let conditionTrue;
      if (t.isIfStatement(parent.node) || t.isConditionalExpression(parent.node)) {
        if (current.key !== 'consequent' && current.key !== 'alternate') continue;
        conditionTrue = current.key === 'consequent';
        test = parent.node.test;
      } else if (t.isLogicalExpression(parent.node) && parent.node.operator === '&&' && current.key === 'right') {
        conditionTrue = true;
        test = parent.node.left;
      } else {
        collectPrecedingExitDiscriminants(current, targetKey, guards, ctx);
        continue;
      }
      if (!discriminantGuardApplies(parent.scope, test?.end, ctx)) continue;
      pushDiscriminantClauses(test, conditionTrue, targetKey, guards, parent.scope);
    }
    return guards;
  }

  // resolve the binding's identifier name across both runtime path libs (babel exposes
  // `.identifier`, estree-toolkit exposes `.name` directly). fall back to varPath's name
  // when the binding object is shaped without either - covers shorthand/destructured
  function bindingTargetName(binding, varPath) {
    return binding.identifier?.name ?? binding.name ?? varPath.node?.name ?? null;
  }

  // a parent.scope-bearing block context: BlockStatement / Program / StaticBlock children
  // are evaluated in source order, so a preceding sibling assignment is guaranteed to run
  // before the use site. all other parent shapes (IfStatement, function decl headers,
  // expression positions) skip the block-local assignment scan
  function isBlockChildPath(parent, current) {
    return (t.isBlockStatement(parent.node) || t.isProgram(parent.node)
        || (t.isStaticBlock && t.isStaticBlock(parent.node)))
      && current.listKey === 'body' && typeof current.key === 'number';
  }

  // walk varPath's ancestors looking for an `=` assignment at a preceding-sibling statement
  // that's GUARANTEED to have run before varPath. unlike `findLastStraightLineAssignment`,
  // which insists on straight-line reachability all the way to the binding's var-scope, this
  // accepts assignments in any enclosing block of the use site - those are guaranteed because
  // the use site is in the same control-flow path. starts at the closest block-child ancestor
  // and walks outward until the binding's declaration scope
  // assignment shape that re-binds `targetName`: simple Identifier LHS OR destructure pattern
  // (ArrayPattern / ObjectPattern) whose key-path walker turns up `targetName`. resolvePath's
  // destructure branch then extracts the matching RHS slot
  function assignmentBindsTarget(expr, targetName, scope) {
    if (expr?.type !== 'AssignmentExpression' || expr.operator !== '=') return false;
    const { left } = expr;
    if (left?.type === 'Identifier') return left.name === targetName;
    return !!findPatternKeyPath(left, targetName, scope);
  }

  function findPrecedingBlockAssignment(binding, varPath) {
    if (!binding.constantViolations?.length) return null;
    const targetName = bindingTargetName(binding, varPath);
    if (!targetName) return null;
    const limit = scopeNode(binding.scope);
    for (let current = varPath; current?.parentPath; current = current.parentPath) {
      const parent = current.parentPath;
      if (isBlockChildPath(parent, current)) {
        const siblings = parent.get('body');
        for (let i = current.key - 1; i >= 0; i--) {
          const sib = siblings[i];
          if (sib?.node?.type !== 'ExpressionStatement') continue;
          // ObjectPattern destructure-assignment is only parseable as `({...} = R)` - the
          // parens become an AST node in oxc-parser (ESTree preserves ParenthesizedExpression),
          // unwrap so the AssignmentExpression is reachable. babel strips parens at parse,
          // so the unwrap is a no-op there
          let expr = sib.node.expression;
          let exprPath = sib.get('expression');
          while (expr?.type === 'ParenthesizedExpression') {
            expr = expr.expression;
            exprPath = exprPath.get('expression');
          }
          if (assignmentBindsTarget(expr, targetName, sib.scope)) return exprPath;
        }
      }
      if (parent.node === limit) return null;
    }
    return null;
  }

  // collect own non-computed Identifier/StringLiteral-keyed properties whose value is a
  // primitive literal (string / number) - the RHS projection used to discriminate which
  // union branch the assignment shape commits to
  function collectObjectLiteralProps(rhs) {
    const literals = new Map();
    for (const p of rhs.properties) {
      if (!p || p.computed || (p.type !== 'ObjectProperty' && p.type !== 'Property')) continue;
      const keyName = getKeyName(p.key);
      const literalValue = literalKeyValue(p.value);
      if (keyName !== null && literalValue !== null) literals.set(keyName, literalValue);
    }
    return literals;
  }

  // post-filter union assembly: drop on no-narrow / all-pass, unwrap when single branch,
  // otherwise rebuild the union. shared by both narrowing paths (discriminant-guard +
  // assignment-literal) so they emit identical-shape annotations
  function buildNarrowedUnion(filtered, aliased) {
    if (!filtered.length || filtered.length === aliased.types.length) return null;
    return filtered.length === 1 ? unwrapTypeAnnotation(filtered[0]) : { type: aliased.type, types: filtered };
  }

  // narrow a union annotation by inspecting the variable's last preceding `=` assignment:
  // when the RHS is an ObjectExpression whose literal-property values uniquely match one
  // branch's literal-typed members, narrow to that branch. mirrors TS's flow-sensitive
  // "narrowing by assignment" so post-mutation accesses see the new shape rather than the
  // declared union. permissive: branches with non-literal members or missing RHS keys pass
  // through, single-branch result wins
  function narrowUnionByAssignmentLiteral(varPath, annotation, scope) {
    const binding = varPath.scope?.getBinding(varPath.node?.name);
    if (!binding) return null;
    const lastAssign = findPrecedingBlockAssignment(binding, varPath);
    const rhs = lastAssign?.node?.right;
    if (rhs?.type !== 'ObjectExpression') return null;
    const { node: aliased } = followTypeAliasChain(unwrapTypeAnnotation(annotation), scope);
    if (aliased?.type !== 'TSUnionType' && aliased?.type !== 'UnionTypeAnnotation') return null;
    const rhsLiterals = collectObjectLiteralProps(rhs);
    if (rhsLiterals.size === 0) return null;
    const filtered = aliased.types.filter(branch => branchMatchesLiterals(branch, rhsLiterals, scope));
    return buildNarrowedUnion(filtered, aliased);
  }

  // a union branch survives if every literal-typed member with a key present in `rhsLiterals`
  // matches the projected RHS value. members with non-literal types / missing RHS keys /
  // unresolvable types pass through (permissive; same convention as discriminant narrow)
  function branchMatchesLiterals(branch, rhsLiterals, scope) {
    const members = getTypeMembers(unwrapTypeAnnotation(branch), scope);
    if (!members) return true;
    for (const m of members) {
      if (m.type !== 'TSPropertySignature' || m.computed) continue;
      const memberType = m.typeAnnotation && unwrapTypeAnnotation(m.typeAnnotation);
      if (memberType?.type !== 'TSLiteralType') continue;
      const expected = literalKeyValue(memberType.literal);
      const keyName = getKeyName(m.key);
      if (expected === null || keyName === null || !rhsLiterals.has(keyName)) continue;
      if (rhsLiterals.get(keyName) !== expected) return false;
    }
    return true;
  }

  function narrowDiscriminatedUnion(objectPath, annotation, scope) {
    // cheap early exit before `followTypeAliasChain` spins up the alias walker
    const targetKey = pathKey(objectPath.node);
    if (!targetKey) return null;
    const { node: aliased, subst } = followTypeAliasChain(annotation, scope);
    if (aliased?.type !== 'TSUnionType' && aliased?.type !== 'UnionTypeAnnotation') return null;
    const guards = findDiscriminantGuards(objectPath, targetKey);
    if (!guards.length) return null;
    // permissive: branches with unresolvable discriminant members pass through
    const filtered = aliased.types.filter(branch => branchMatchesGuards(branch, guards, scope));
    const narrowed = buildNarrowedUnion(filtered, aliased);
    if (!narrowed) return null;
    // preserve accumulated type-param substitutions through the narrowed result - without
    // applying subst, `T[]` inside a surviving branch of `type Foo<T> = { kind: 'a'; val: T[] } | ...`
    // would stay unresolved and downstream dispatch would see Array(null) instead of Array<string>
    return applySubst(narrowed, subst);
  }

  // a branch survives discriminant filtering when every guard's expected value agrees with
  // the branch's literal-typed member at the same key - non-literal members pass through
  // (permissive; matches the existing precedent for unresolvable members)
  function branchMatchesGuards(branch, guards, scope) {
    for (const { field, value, positive } of guards) {
      const memberType = findTypeMember(unwrapTypeAnnotation(branch), field, scope);
      if (!memberType) continue;
      const { node: resolvedNode } = followTypeAliasChain(unwrapTypeAnnotation(memberType), scope);
      const literal = resolvedNode?.type === 'TSLiteralType' ? literalKeyValue(resolvedNode.literal) : null;
      if (literal !== null && (literal === value) !== positive) return false;
    }
    return true;
  }

  function resolveTypedMember(objectPath, name, callPath) {
    let annotation, scope;
    if (t.isIdentifier(objectPath.node)) {
      const binding = objectPath.scope?.getBinding(objectPath.node.name);
      if (!binding) return null;
      annotation = unwrapTypeAnnotation(findBindingAnnotation(binding.path));
      scope = binding.path.scope;
    } else {
      // delegate to findExpressionAnnotation for non-identifier shapes so that
      // TS wrappers, call expressions with return annotations, and chain expressions
      // all route through the same annotation lookup (incl. call-site generic subst)
      const info = findExpressionAnnotation(objectPath);
      if (info) {
        annotation = unwrapTypeAnnotation(info.annotation);
        scope = info.scope;
      }
    }
    if (!annotation) return null;
    // discriminated union narrowing: `if (x.kind === 'a') { x.data }` - restrict Foo
    // to the `{ kind:'a'; data: T }` branch. works for any serialisable LHS path
    // (Identifier / `this.x` / `obj.a.b`); computed / call-expression paths bail
    annotation = narrowDiscriminatedUnion(objectPath, annotation, scope) ?? annotation;
    // `x: typeof obj` / `x: typeof fn` - follow TSTypeQuery to runtime binding, delegate there
    if (annotation.type === 'TSTypeQuery') {
      const resolved = resolveTypeQueryBinding(annotation, scope);
      if (resolved?.node) {
        if (t.isObjectExpression(resolved.node)) {
          const result = resolveObjectMember(resolved, name, callPath);
          if (result) return result;
        }
        const ctx = resolveClassContext(resolved);
        if (ctx) return resolveClassMember(ctx.classPath, name, ctx.isStatic, callPath);
        return null;
      }
      // TSEnumDeclaration has no runtime binding path in `resolveTypeQueryBinding`; route
      // through `resolveAnnotatedMember` so `typeof Enum` member access hits the enum branch
      return resolveAnnotatedMember(annotation, name, scope);
    }
    // `x: Cls` where `Cls` is a real `class` declaration in scope - route method calls through
    // `resolveClassMember` (path-based, body-inference-capable) instead of annotation-only lookup,
    // so unannotated methods like `test() { return this.getStr(); }` still resolve their return type.
    // class type-args from the annotation (`Cls<string>`) propagate as classSubst so method
    // return types referring to class type-params resolve concretely
    if (callPath) {
      const classPath = findClassPathForTypeReference(annotation, scope);
      if (classPath) {
        const result = resolveClassMember(classPath, name, false, callPath, getTypeArgs(annotation)?.params);
        if (result) return result;
      }
    }
    // lazily resolve default type parameter map for generic types used without explicit type arguments
    let defaultMap;
    const resolve = p => {
      if (defaultMap === undefined) defaultMap = buildDefaultTypeParamMap(annotation, scope);
      return defaultMap ? substituteTypeParams(p, defaultMap, scope, 0) : resolveTypeAnnotation(p, scope);
    };
    // property access (not a call): delegate to findTypeMember
    if (!callPath) {
      const memberType = findTypeMember(annotation, name, scope);
      return memberType ? resolve(memberType) : null;
    }
    // method call: merge return types across overloads, recursing into union branches
    return resolveMemberCallReturn(annotation, name, scope, resolve);
  }

  // resolve `TSTypeReference { typeName: X }` to a NodePath of `class X { ... }` in scope,
  // or null if the reference points at an ambient / interface / non-class
  function findClassPathForTypeReference(annotation, scope) {
    if (annotation?.type !== 'TSTypeReference' || annotation.typeName?.type !== 'Identifier') return null;
    const binding = scope?.getBinding(annotation.typeName.name);
    return binding && t.isClassDeclaration(binding.path.node) ? binding.path : null;
  }

  function resolveFromMemberExpression(path, callPath) {
    const name = resolveMemberPropertyName(path);
    if (!name) return null;
    const originalObjectPath = path.get('object');
    const objectPath = resolveRuntimeExpression(originalObjectPath);
    // `this.X` inside an object-method (possibly through arrow nesting): resolve `this`
    // to the parent ObjectExpression and route through the flow-aware field resolver.
    // mutually exclusive with the class-`this` path - `resolveThisObject` returns null when
    // a closer ClassBody wraps. without this branch, `(() => this.arr)().at(0)` inside an
    // ObjectMethod degrades to generic `_at` even when the literal owns `arr: [...]`
    if (t.isThisExpression(objectPath.node)) {
      const objAnchor = resolveThisObject(originalObjectPath);
      if (objAnchor) {
        const result = resolveObjectFieldFlow(objAnchor, name, callPath);
        if (result) return result;
      }
    }
    if (t.isObjectExpression(objectPath.node)) {
      const result = resolveObjectMember(objectPath, name, callPath);
      if (result) return result;
    }
    const ctx = resolveClassContext(objectPath);
    if (ctx) {
      const result = resolveClassMember(ctx.classPath, name, ctx.isStatic, callPath);
      if (result) return result;
    }
    // ambient `declare class X { static make() }` - X reference has no scope binding in babel
    // so `resolveClassContext(objectPath)` misses. fall back to ambient-decl lookup keyed by
    // identifier name; reuses the same class-member resolution path so method-level type-arg
    // substitution (`X.make<string>()`) works the same as for runtime `class X`
    if (objectPath.node?.type === 'Identifier') {
      const ambientClass = findAmbientClassPath(objectPath.node.name, objectPath.scope);
      if (ambientClass) {
        const result = resolveClassMember(ambientClass, name, true, callPath);
        if (result) return result;
      }
    }
    // try typed member on resolved path first, then on original path (in case resolvePath lost annotation)
    return resolveTypedMember(objectPath, name, callPath)
      || (objectPath !== originalObjectPath ? resolveTypedMember(originalObjectPath, name, callPath) : null);
  }

  // arr[0], arr[1] - numeric index access on array literals
  function resolveArrayIndexAccess(path) {
    if (!path.node.computed) return null;
    const resolvedProp = resolveRuntimeExpression(path.get('property'));
    if (!isLiteralOf(resolvedProp.node, 'Numeric')) return null;
    const index = resolvedProp.node.value;
    if (!Number.isInteger(index) || index < 0) return null;
    const objectPath = resolveRuntimeExpression(path.get('object'));
    if (!t.isArrayExpression(objectPath.node)) return null;
    return resolveArrayLiteralElement(objectPath, index);
  }

  // collect runtime member-expression segments: bare `E` -> ['E'], non-computed dotted chain
  // `N.E` -> ['N', 'E'], deeper `N.M.E` -> ['N', 'M', 'E']. computed / non-Identifier links
  // bail to null. parallel to type-level `collectQualifiedSegments` (which walks
  // TSQualifiedName) - this one walks runtime MemberExpression chains
  function collectMemberSegments(node) {
    if (node?.type === 'Identifier') return [node.name];
    if (node?.type !== 'MemberExpression' || node.computed) return null;
    const left = collectMemberSegments(node.object);
    if (!left || node.property?.type !== 'Identifier') return null;
    left.push(node.property.name);
    return left;
  }

  // numeric enum reverse mapping: TS auto-generates `E[<number>]` -> name (string) for
  // numeric enums. `enum E { A, B }; E[E.A]` is 'A' at runtime even though TS types `E.A`
  // as a numeric literal. without this, receiver-narrowing on `v = E[E.A]` falls back to
  // the value-kind primitive (number) - method dispatch on `v.includes('A')` then misses
  // the string narrowing. only fires when:
  //   - access is computed `E[<key>]`
  //   - receiver is an Identifier OR namespace-qualified chain resolving to TSEnumDeclaration
  //   - enum is uniformly numeric (resolveEnumType returns Number primitive)
  //   - key expression resolves to number type (forward `E['A']` -> string key stays
  //     number-typed at runtime, leave it to the caller's other resolvers)
  // member access on a TSEnumDeclaration receiver. covers two shapes:
  //   - non-computed `E.A` / `N.E.A` -> enum value-kind primitive (the member's resolved
  //     kind via `resolveEnumMemberKind`, defaulting to number for implicit auto-numbered)
  //   - computed `E[<number-key>]` / `N.E[N.E.A]` -> string (numeric enum reverse mapping).
  //     TS auto-generates `E[E.A] === 'A'` at runtime for numeric enums; without this branch
  //     `v` in `const v = E[E.A]; v.includes('A')` falls back to a generic `_includes`
  //     instead of the string-narrowed variant. computed access with non-numeric key
  //     (forward `E['A']` / index by user expr) bails - those resolve through other paths.
  // namespace-qualified receiver: `findEnumDeclaration` accepts segment-array form to walk
  // through TSModuleDeclaration anchors so `namespace N { export enum E {...} }` resolves
  function resolveEnumMemberAccess(path) {
    const segments = collectMemberSegments(path.node.object);
    if (!segments) return null;
    // findEnumDeclaration accepts both string and segment array - single-segment arrays
    // cache through the same key as their joined-string form (`['E'].join('.') === 'E'`)
    const enumDecl = findEnumDeclaration(segments, path.scope);
    if (!enumDecl) return null;
    if (!path.node.computed) {
      const memberName = path.node.property?.type === 'Identifier' ? path.node.property.name : null;
      return memberName ? resolveEnumMemberType(enumDecl, memberName) : null;
    }
    if (resolveEnumType(enumDecl)?.type !== 'number') return null;
    return resolveNodeType(path.get('property'))?.type === 'number' ? new $Primitive('string') : null;
  }

  // convert a normalized hint to a type object
  // objectType (optional) enables resolution of 'element'/'inherit' directives in instance method hints
  function typeFromHint(hint, objectType) {
    if (typeof hint === 'string') {
      if (hint === 'element' || hint === 'inherit') return resolveInnerType(objectType);
      if (PRIMITIVES.has(hint)) return new $Primitive(hint);
      return new $Object(hint);
    }
    if (PRIMITIVES.has(hint.type)) return new $Primitive(hint.type);
    const innerHint = hint.element ?? hint.resolved ?? null;
    const inner = innerHint ? typeFromHint(innerHint, objectType) : null;
    return new $Object(hint.type, inner);
  }

  // resolve the inner (element/resolved) type of a container
  // $Primitive stores inner as a hint string (lazy), $Object stores it as a type object (eager)
  function resolveInnerType(type) {
    if (!type?.inner) return null;
    const { inner } = type;
    return typeof inner === 'string' ? new $Primitive(inner) : inner;
  }

  // recursively unwrap Promise layers: Promise<Promise<T>> -> T
  // Promise without inner (Promise<any>) unwraps to null (unknown) since await resolves to any
  function unwrapPromise(type) {
    let result = type;
    while (result?.type === 'object' && result.constructor === 'Promise') {
      const inner = resolveInnerType(result);
      if (!inner) return null;
      result = inner;
    }
    return result;
  }

  // peel a Promise / PromiseLike / Thenable type-reference annotation, returning the
  // inner type-argument annotation (`Promise<X>` -> X) or null when the node isn't a
  // recognisable Promise reference. operates on the AST so callers can distribute over
  // syntactic shape (unions, type aliases) before resolved-type fold loses information
  function getPromiseInnerAnnotation(node) {
    const refName = typeRefName(node);
    if (!refName || (refName !== 'Promise' && !PROMISE_SYNONYMS.has(refName))) return null;
    return getTypeArgs(node)?.params?.[0] ?? null;
  }

  // `Awaited<T>` semantics mirror TS's distributive recursive conditional:
  //   - `Awaited<Promise<U>>` -> `Awaited<U>` (peel one layer, recurse)
  //   - `Awaited<A | B>`      -> `Awaited<A> | Awaited<B>` (distribute, fold members)
  //   - `Awaited<A & B>`      -> `Awaited<A> & Awaited<B>` (distribute, fold intersection).
  //     `Promise<X> & {tag: 'X'}` peels Promise via the recursion + foldIntersectionTypes
  //     drops the plain Object branch, leaving X. without this, `Awaited<Promise<X> & Y>`
  //     bottoms out via `resolveAnnotationInContext` which folds intersection AFTER both
  //     branches resolve - Promise<X> survives as a Promise object (not peeled to X)
  //   - `Awaited<C ? T : F>`  -> pick branch when statically decidable, recurse on picked
  //     so Awaited semantics applies post-pick. without this, multi-hop alias chains whose
  //     body is a conditional (`type A<X> = X extends string ? never : Promise<X[]>`) bottom
  //     out via `resolveAnnotationInContext` which evaluates the conditional but loses the
  //     outer Awaited wrapper - falseBranch resolves to `Promise<X[]>` instead of `X[]`
  //   - `Awaited<TypeAlias>`  -> follow the alias chain, retry
  //   - otherwise              -> resolve T as-is
  // distributing at the AST stage preserves union/intersection shape past `Promise<>`
  // wrappers - resolved-type fold collapses `Promise<T> | U` / `Promise<T> & U` because
  // Promise's `constructor` differs from U's; distributing first turns into `T | U` /
  // `T & U` which CAN fold (when T and U share a constructor for unions, or when
  // intersection's plain-Object branch is dropped). depth + cycle bounds match
  // `followTypeAliasChain`'s budget
  function resolveAwaitedAnnotation(node, scope, depth, typeParamMap, seen) {
    if (!node || depth > MAX_DEPTH) return null;
    // oxc preserves `(T)` as TSParenthesizedType (babel strips); must peel before the
    // union / intersection / Promise check or distribution misses the inner shape
    const peeled = peelTSParenthesized(unwrapTypeAnnotation(node));
    const recurse = next => resolveAwaitedAnnotation(next, scope, depth + 1, typeParamMap, seen);
    if (peeled.type === 'TSUnionType' || peeled.type === 'UnionTypeAnnotation') {
      return foldUnionTypes(peeled.types, recurse);
    }
    if (peeled.type === 'TSIntersectionType' || peeled.type === 'IntersectionTypeAnnotation') {
      return foldIntersectionTypes(peeled.types, recurse);
    }
    // TS spec: `Awaited<[A, B, C]>` = `[Awaited<A>, Awaited<B>, Awaited<C>]` -
    // element-wise mapping. Type representation is atomic (no tuple), so collapse to
    // Array<commonInner> after per-element Awaited peel. without this, tuples of Promises
    // bottom out via resolveAnnotationInContext as `Array<Promise>` (commonInner of unpeeled
    // promise elements), and indexed access (`p[0]`) yields Promise instead of the awaited
    // element type
    if (peeled.type === 'TSTupleType' || peeled.type === 'TupleTypeAnnotation') {
      return tupleAsArrayType(peeled, recurse);
    }
    const promiseInner = getPromiseInnerAnnotation(peeled);
    if (promiseInner) return recurse(promiseInner);
    // post-subst alias body landing on a conditional must be evaluated BEFORE the alias-chain
    // re-walk so Awaited<picked-branch> recurses with the chosen AST. undecidable -> fold both
    // branches under Awaited (mirrors TS's distributive widening). identical structure in
    // peelAwaitedArgument
    if (peeled.type === 'TSConditionalType') {
      const branch = pickAwaitedConditionalBranch(peeled, scope, depth, typeParamMap, seen);
      if (branch !== null) return recurse(branch ? peeled.trueType : peeled.falseType);
      return foldUnionTypes([peeled.trueType, peeled.falseType], recurse);
    }
    // type alias hop: `type Inner = Promise<...>; Awaited<Inner>` - chase to the underlying
    // shape so the outer Promise / union dispatch fires on the aliased form
    const aliased = followTypeAliasChain(peeled, scope);
    if (aliased?.node && aliased.node !== peeled) {
      return recurse(applySubst(aliased.node, aliased.subst));
    }
    return resolveAnnotationInContext(node, scope, depth + 1, typeParamMap, seen);
  }

  // pick a conditional-type branch in Awaited contexts: prefer AST-level literal precision
  // (`'a' extends 'a'`), then resolve check / extend with caller's typeParamMap so
  // post-applySubst free type-param refs see their substitutions, then dispatch to
  // pickConditionalBranch. returns true / false / null (undecidable - caller folds /
  // returns AS-IS). shared between resolveAwaitedAnnotation and peelAwaitedArgument
  function pickAwaitedConditionalBranch(node, scope, depth, typeParamMap, seen) {
    const astPick = pickConditionalBranchByAST(node.checkType, node.extendsType);
    if (astPick !== null) return astPick;
    const checkResolved = resolveAnnotationInContext(node.checkType, scope, depth + 1, typeParamMap, seen);
    const extendsResolved = resolveAnnotationInContext(node.extendsType, scope, depth + 1, typeParamMap, seen);
    return pickConditionalBranch(checkResolved, extendsResolved, node.extendsType);
  }

  // two-level table lookup: table[key1][key2]
  function lookupNested(table, key1, key2) {
    const group = hasOwn(table, key1) ? table[key1] : null;
    return group && hasOwn(group, key2) ? group[key2] : null;
  }

  // resolve the global object name and property name from a MemberExpression
  function resolveGlobalMember(path) {
    const memberName = resolveMemberPropertyName(path);
    if (!memberName) return null;
    const objectName = resolveGlobalName(path.get('object'));
    return objectName ? { objectName, memberName } : null;
  }

  // resolve return type of a known instance member (method or property) from a lookup table
  // for methods, objectType is passed through to typeFromHint to resolve 'element'/'inherit'
  function resolveKnownInstanceMember(path, table) {
    const name = resolveMemberPropertyName(path);
    if (!name) return null;
    const objectType = resolveNodeType(path.get('object'));
    if (!objectType) return null;
    const key = objectType.primitive ? (PRIMITIVE_WRAPPERS[objectType.type] || null) : objectType.constructor;
    if (!key) return null;
    const hint = lookupNested(table, key, name);
    if (!hint) return null;
    return typeFromHint(hint, objectType);
  }

  // `Promise.resolve(x)` -> `Promise<typeof x>`: arg-based inner inference. the static
  // hint table can't carry "infer inner from argN" cleanly (it'd require typeFromHint to
  // accept callPath everywhere), so handle this widely-used resolver-style static specially.
  // without this, `await Promise.resolve([1,2,3])` resolves to $Promise<null>, unwrapPromise
  // returns null, await gives unknown, downstream member dispatch goes generic.
  // `Promise.resolve(thenable)` flattens at runtime; treat outer Promise<Promise<X>> as
  // Promise<X> so unwrapPromise lands on a precise inner without two-layer peel
  function inferPromiseResolveReturnType(callPath) {
    const [argPath] = callPath.get('arguments');
    if (!argPath || babelNodeType(argPath.node) === 'SpreadElement') return null;
    const argType = resolveNodeType(argPath);
    if (!argType || isNullableOrNever(argType)) return null;
    return new $Object('Promise', argType.constructor === 'Promise' ? resolveInnerType(argType) : argType);
  }

  function resolveKnownStaticReturnType(callee, callPath) {
    if (!isMemberLike(callee)) return null;
    const info = resolveGlobalMember(callee);
    if (!info) return null;
    const hint = lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, info.objectName, info.memberName);
    if (!hint) return null;
    if (callPath && info.objectName === 'Promise' && info.memberName === 'resolve') {
      const inferred = inferPromiseResolveReturnType(callPath);
      if (inferred) return inferred;
    }
    return typeFromHint(hint);
  }

  function resolveKnownPropertyReturnType(path) {
    return resolveKnownInstanceMember(path, KNOWN_INSTANCE_PROPERTY_RETURN_TYPES);
  }

  // resolve type of a known global static member (e.g. Math.PI, Number.MAX_SAFE_INTEGER, Math.max)
  // static properties return their known type, static methods return Function
  function resolveGlobalStaticReference(path) {
    const info = resolveGlobalMember(path);
    if (!info) return null;
    const { objectName, memberName } = info;
    const propHint = lookupNested(KNOWN_STATIC_PROPERTY_RETURN_TYPES, objectName, memberName);
    if (propHint) return typeFromHint(propHint);
    return lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, objectName, memberName) ? new $Object('Function') : null;
  }

  // resolve type of a global property or method accessed through a global proxy
  // e.g. globalThis.NaN -> number, window.parseInt -> Function
  function resolveKnownGlobalReference(path) {
    const name = resolveGlobalName(path);
    if (!name) return null;
    if (hasOwn(KNOWN_GLOBAL_PROPERTY_RETURN_TYPES, name)) return typeFromHint(KNOWN_GLOBAL_PROPERTY_RETURN_TYPES[name]);
    if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name)) return new $Object('Function');
    return null;
  }

  function resolveMemberCallType(memberPath, callPath) {
    return resolveFromMemberExpression(memberPath, callPath)
      || resolveKnownStaticReturnType(memberPath, callPath)
      || resolveKnownInstanceMember(memberPath, KNOWN_INSTANCE_METHOD_RETURN_TYPES);
  }

  function resolveCallReturnType(callee) {
    // method call: obj.method() or obj?.method()
    if (isMemberLike(callee)) {
      // receiver is statically undefined/null/never -> chain is broken at runtime; propagate
      // the same to downstream so `fn(){}; fn().at(0).includes(1)` doesn't half-polyfill
      const receiverType = resolveNodeType(callee.get('object'));
      if (receiverType && isNullableOrNever(receiverType)) return receiverType;
      return resolveMemberCallType(callee, callee.parentPath);
    }
    // direct call: foo() / IIFE: (() => expr)() / ambient TSDeclareFunction follow-through
    const resolved = resolveRuntimeExpression(callee);
    if (isFunctionLike(resolved.node)) return resolveReturnType(resolved, callee.parentPath);
    // indirect call: const fn = obj.method; fn() - resolve through the stored member reference
    if (isMemberLike(resolved)) return resolveMemberCallType(resolved, callee.parentPath);
    // alias to a known static method through any shape:
    //   - direct: `const from = Array.from; from(x)` (babel mutates AST to
    //     `const from = _Array$from`, injector exposes entry='array/from' for `_Array$from`)
    //   - destructure: `const { from } = Array; from(x)` (unplugin keeps AST shape;
    //     `staticPairFromDestructure` walks pattern; babel post-rewrite alias map covers it)
    //   - default: `const { from = () => [] } = Array; from(x)` (babel post-rewrite emits
    //     `const from = _Array$from === void 0 ? () => [] : _Array$from;` - resolved
    //     node is ConditionalExpression, but the user-facing name `from` is registered
    //     in the body-extract alias map so polyfill-entry lookup succeeds)
    // probe via the callee's user-facing name first (matches ANY post-rewrite shape via
    // injector alias), then fall back to walked-resolved Identifier (covers cases where
    // alias map miss but resolved is itself a polyfill UID)
    if (t.isIdentifier(callee.node)) {
      const aliased = resolveAliasedStaticReturn(callee);
      if (aliased) return aliased;
    }
    if (resolved.node?.type === 'Identifier' && resolved.node !== callee.node) {
      const aliased = resolveAliasedStaticReturn(resolved);
      if (aliased) return aliased;
    }
    // identifier callees that didn't resolve to a function-like via the binding chain may still
    // be reachable through an ambient `declare function` not registered in scope.bindings,
    // or a binding whose annotation is a function-type (`declare const f: () => T`)
    if (!t.isIdentifier(callee.node)) return null;
    const ambient = findAmbientFunctionPath(callee.node.name, callee.scope);
    if (ambient) return resolveReturnType(ambient, callee.parentPath);
    return resolveCallReturnTypeFromAnnotation(callee);
  }

  // resolve a polyfilled static-method binding's return type. caller supplies the canonical
  // entry path (`array/from`, `iterator/from`, `symbol/iterator`) - the leading segment
  // identifies the constructor namespace (`array` -> `Array` via `entryToGlobalHint`'s
  // index + kebab-Pascal fallback), and the trailing segment is the method name. returns
  // null on decomposition failure or when the (constructor, method) pair isn't in the
  // return-type registry (instance entries like `array/instance/at` correctly fall through
  // since `KNOWN_STATIC_METHOD_RETURN_TYPES.Array.at` doesn't exist for the instance form).
  // entry path is the canonical form the registry already keys on - no UID-shape coupling
  // resolve aliased static-method call return type. tries each alias shape's extractor
  // until one yields a (constructor, method) pair, then runs the shared registry lookup.
  // both extractors return null for non-matching shapes so the caller order doesn't
  // matter for correctness - polyfilled-entry first only because it's the cheaper probe
  function resolveAliasedStaticReturn(callee) {
    const pair = staticPairFromPolyfillEntry(callee.scope, callee.node.name)
      ?? staticPairFromDestructure(callee.scope, callee.node.name);
    if (!pair) return null;
    const retHint = lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, pair.constructor, pair.method);
    return retHint ? typeFromHint(retHint) : null;
  }

  // post-rewrite alias `const from = _Array$from`: injector exposes the canonical entry
  // path (`array/from`) - leading segment maps to the constructor name via the same
  // resolver injector itself uses (`entryToGlobalHint`), trailing segment is the method
  function staticPairFromPolyfillEntry(scope, name) {
    const entry = getPolyfillBindingEntry(scope, name);
    if (!entry) return null;
    const segments = entry.split('/');
    if (segments.length < 2) return null;
    const constructor = entryToGlobalHint(segments[0]);
    return constructor ? { constructor, method: segments.at(-1) } : null;
  }

  // unrewriten destructure alias resolution: walks the destructure pattern through nested
  // ObjectPatterns (`const { from } = Array`, `const { a: { from } } = wrapper`,
  // `const { ns: { from } } = { ns: Array }`) to a (constructor, method) pair. shorthand
  // (`{ from }`), renamed (`{ from: f }`), and AssignmentPattern wrappers (`{ from = ... }`)
  // are peeled inside `findDestructuredKeyPath`. delegates the init-walk to the shared
  // `walkStaticReceiverChain` (detect-usage/destructure.js) via a thin babel-binding
  // adapter; constructor registry gate stays here so the resolver still distinguishes
  // "any global Identifier at the leaf" from "known-static constructor with return type"
  function staticPairFromDestructure(scope, name) {
    const binding = scope?.getBinding(name);
    if (!binding?.path) return null;
    let declarator = binding.path;
    while (declarator && !t.isVariableDeclarator(declarator.node)) declarator = declarator.parentPath;
    if (!declarator) return null;
    const { id, init } = declarator.node;
    if (id?.type !== 'ObjectPattern' || !init) return null;
    const keyPath = findDestructuredKeyPath(id, name, declarator.scope);
    if (!keyPath?.length) return null;
    const constructor = walkStaticReceiverChain(init, keyPath.slice(0, -1), declarator.scope, BABEL_BINDING_ADAPTER);
    if (!constructor || !hasOwn(KNOWN_STATIC_METHOD_RETURN_TYPES, constructor)) return null;
    return { constructor, method: keyPath.at(-1) };
  }

  // Babel TSFunctionType: `typeAnnotation` (TSTypeAnnotation wrapper)
  // oxc TSFunctionType / Flow FunctionTypeAnnotation: `returnType` (raw type)
  function functionTypeReturnAnnotation(node) {
    if (node?.type === 'TSFunctionType' || node?.type === 'TSConstructorType') {
      return node.typeAnnotation ?? node.returnType;
    }
    if (node?.type === 'FunctionTypeAnnotation') return node.returnType;
    return null;
  }

  // extract return type from a binding's function-type annotation:
  //   `declare const f: () => T` / `const f: (x: X) => T = ...` / Flow `(x: X) => T` /
  //   `const f: typeof other` (follow TSTypeQuery to referenced function's return)
  function resolveCallReturnTypeFromAnnotation(callee) {
    const info = findExpressionAnnotation(callee);
    if (!info) return null;
    const annotation = unwrapTypeAnnotation(info.annotation);
    if (annotation?.type === 'TSTypeQuery') return resolveReturnTypeFromTypeQuery(annotation, info.scope);
    const ret = functionTypeReturnAnnotation(annotation);
    return ret ? resolveTypeAnnotation(ret, info.scope) : null;
  }

  // --- Destructuring resolver ---
  // walk ArrayPattern elements for a target binding, returning index-prefixed key path.
  // sentinel conventions:
  //   - null         not found
  //   - [-1]         found in rest (-1 signals "whole tail" slice, not an index)
  //   - [i, ...sub]  found at index i (possibly nested)
  // `findPatternIndex` below uses `-1` with a DIFFERENT meaning ("not found" scalar); the
  // return shape (array vs scalar) disambiguates at call sites
  function findArrayPatternKeyPath(arrayPattern, name, scope) {
    for (let i = 0; i < (arrayPattern.elements?.length ?? 0); i++) {
      const el = arrayPattern.elements[i];
      if (!el) continue;
      // rest: [...x] is always Array - signal via negative index so callers know
      if (el.type === 'RestElement') {
        if (el.argument?.type === 'Identifier' && el.argument.name === name) return [-1];
        continue;
      }
      const unwrapped = el.type === 'AssignmentPattern' ? el.left : el;
      if (unwrapped?.type === 'Identifier' && unwrapped.name === name) return [i];
      if (unwrapped?.type === 'ObjectPattern') {
        const inner = findDestructuredKeyPath(unwrapped, name, scope);
        if (inner) return [i, ...inner];
      }
      if (unwrapped?.type === 'ArrayPattern') {
        const inner = findArrayPatternKeyPath(unwrapped, name, scope);
        if (inner) return [i, ...inner];
      }
    }
    return null;
  }

  // `{ a: { b: c } }`, target `c` -> `['a', 'b']`. nested ObjectPatterns walked recursively
  function findDestructuredKeyPath(objectPattern, name, scope) {
    for (const prop of objectPattern.properties) {
      if (babelNodeType(prop) !== 'ObjectProperty') continue;
      const key = prop.computed ? resolveComputedKeyName(prop.key, scope) : getKeyName(prop.key);
      if (key === null) continue;
      const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      if (value?.type === 'Identifier' && value.name === name) return [key];
      if (value?.type === 'ObjectPattern') {
        const inner = findDestructuredKeyPath(value, name, scope);
        if (inner) return [key, ...inner];
      }
      if (value?.type === 'ArrayPattern') {
        const arrResult = findArrayPatternKeyPath(value, name, scope);
        if (arrResult) return [key, ...arrResult];
      }
    }
    return null;
  }

  // resolve the type of a destructuring default: const { items = [] } = obj or const [a = []] = arr.
  // recurses into nested ObjectPatterns / ArrayPatterns - `const { a: { b = [] } } = obj`
  // resolving `b` finds the depth-2 default that one-level walk missed
  function resolveDestructuringDefault(pattern, varName, bindingPath) {
    const patternPath = bindingPath.node === pattern ? bindingPath
      : bindingPath.node.id === pattern ? bindingPath.get('id')
      : bindingPath.node.left === pattern ? bindingPath.get('left') : null;
    if (!patternPath) return null;
    return walkDestructuringForDefault(patternPath, pattern, varName);
  }

  function walkDestructuringForDefault(patternPath, pattern, varName) {
    const children = patternPath.get(pattern.properties ? 'properties' : 'elements');
    for (const child of children) {
      if (!child.node) continue;
      const valuePath = babelNodeType(child.node) === 'ObjectProperty' ? child.get('value') : child;
      if (t.isAssignmentPattern(valuePath.node)) {
        if (valuePath.node.left?.type === 'Identifier' && valuePath.node.left.name === varName) {
          return resolveNodeType(valuePath.get('right'));
        }
        // `{ a: { b = [] } = {} }` - the inner pattern is on `valuePath.left`, recurse there
        const innerLeft = valuePath.get('left');
        if (innerLeft.node?.type === 'ObjectPattern' || innerLeft.node?.type === 'ArrayPattern') {
          const found = walkDestructuringForDefault(innerLeft, innerLeft.node, varName);
          if (found) return found;
        }
      } else if (valuePath.node?.type === 'ObjectPattern' || valuePath.node?.type === 'ArrayPattern') {
        const found = walkDestructuringForDefault(valuePath, valuePath.node, varName);
        if (found) return found;
      }
    }
    return null;
  }

  function resolveDestructuredType(objectPattern, name, scope) {
    const keyPath = findDestructuredKeyPath(objectPattern, name, scope);
    if (!keyPath) return null;
    return resolveAnnotatedMemberPath(objectPattern.typeAnnotation, keyPath, scope);
  }

  // resolve the element type of a collection from its type annotation
  function resolveElementType(node, scope, depth) {
    if (depth > MAX_DEPTH) return null;
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    switch (babelNodeType(node)) {
      // string[] -> element type
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return resolveTypeAnnotation(node.elementType, scope, depth + 1);
      // [string, number] -> common element type if all same
      case 'TSTupleType':
      case 'TupleTypeAnnotation': {
        const elements = tupleElements(node);
        return elements?.length
          ? resolveTupleInner(elements, e => resolveTypeAnnotation(e, scope, depth + 1))
          : null;
      }
      // Array<T>, Set<T>, Map<K,V>, Iterable<T>, Generator<T>, user type aliases
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        if (!name) return null;
        const params = getTypeArgs(node)?.params;
        if (SINGLE_ELEMENT_COLLECTIONS.has(name)) return params?.[0] ? resolveTypeAnnotation(params[0], scope, depth + 1) : null;
        if (name === 'Map' || name === 'ReadonlyMap') return new $Object('Array');
        return resolveUserTypeElement(name, scope, depth, resolveElementType);
      }
      // iterating a string yields characters (strings)
      case 'TSStringKeyword':
      case 'StringTypeAnnotation':
        return new $Primitive('string');
      // union: strip null/undefined, check remaining
      case 'TSUnionType':
      case 'UnionTypeAnnotation': {
        const { types } = node;
        if (!types?.length) return null;
        let result = null;
        for (const member of types) {
          const resolved = resolveTypeAnnotation(member, scope, depth + 1);
          if (!resolved) return null;
          if (isNullableOrNever(resolved)) continue;
          const elemType = resolveElementType(member, scope, depth + 1);
          if (!elemType) return null;
          result = commonType(result, elemType);
          if (!result) return null;
        }
        return result;
      }
      // transparent wrappers: readonly T[], (T[])
      case 'TSTypeOperator':
        return node.operator !== 'keyof' ? resolveElementType(node.typeAnnotation, scope, depth + 1) : null;
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return resolveElementType(node.typeAnnotation, scope, depth + 1);
    }
    return null;
  }

  // follow user-defined type aliases and interface extends chain using a parameterized resolver
  function resolveUserTypeElement(name, scope, depth, resolver) {
    const decl = findTypeDeclaration(name, scope);
    if (isTypeAlias(decl)) return resolver(typeAliasBody(decl), scope, depth + 1);
    if (!isInterfaceDeclaration(decl) || !decl.extends?.length) return null;
    for (const parent of decl.extends) {
      const expr = extendsId(parent);
      if (expr.type !== 'Identifier') continue;
      const parentRef = { type: 'TSTypeReference', typeName: expr, typeParameters: getTypeArgs(parent) };
      const result = resolver(parentRef, scope, depth + 1);
      if (result) return result;
    }
    return null;
  }

  // extract the raw element annotation node (not resolved) from a collection type
  function extractElementAnnotation(node, scope, depth) {
    if (depth > MAX_DEPTH) return null;
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    switch (babelNodeType(node)) {
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return node.elementType;
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        if (!name) return null;
        if (SINGLE_ELEMENT_COLLECTIONS.has(name)) return getTypeArgs(node)?.params[0] ?? null;
        // Map/ReadonlyMap iterate as [K, V] - synthesize a TSTupleType so `findTupleElement`
        // can pick up K or V by index
        if (name === 'Map' || name === 'ReadonlyMap') {
          const params = getTypeArgs(node)?.params;
          return params?.length >= 2 ? { type: 'TSTupleType', elementTypes: [params[0], params[1]] } : null;
        }
        return resolveUserTypeElement(name, scope, depth, extractElementAnnotation);
      }
      case 'TSTypeOperator':
        return node.operator !== 'keyof' ? extractElementAnnotation(node.typeAnnotation, scope, depth + 1) : null;
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return extractElementAnnotation(node.typeAnnotation, scope, depth + 1);
      case 'TSUnionType':
      case 'UnionTypeAnnotation': {
        const { types } = node;
        if (!types?.length) return null;
        let result = null;
        for (const member of types) {
          const resolved = resolveTypeAnnotation(member, scope, depth + 1);
          if (!resolved) return null;
          if (isNullableOrNever(resolved)) continue;
          if (result) return null; // multiple non-null collection members -> ambiguous
          result = extractElementAnnotation(member, scope, depth + 1);
          if (!result) return null;
        }
        return result;
      }
    }
    return null;
  }

  // resolve the type of a variable destructured from an ArrayPattern
  function resolveArrayPatternBinding(arrayPattern, varName, annotation, scope) {
    const index = findPatternIndex(arrayPattern, varName);
    if (index < 0) return null;
    const unwrapped = unwrapTypeAnnotation(annotation);
    if (!unwrapped) return null;
    const tupleElem = findTupleElement(unwrapped, index, scope);
    if (tupleElem) return resolveTypeAnnotation(tupleElem, scope);
    return resolveElementType(unwrapped, scope, 0);
  }

  // resolve obj.prop annotation by chaining through the object's type, applying generic subst.
  // `obj['x']` / `obj[expr]` / non-Member nodes return null - dotted-static access only
  function resolveMemberAnnotation(path, depth) {
    const propName = getMemberProperty(path.node);
    if (propName === null) return null;
    const objInfo = findExpressionAnnotation(path.get('object'), depth + 1);
    if (!objInfo) return null;
    const unwrapped = unwrapTypeAnnotation(objInfo.annotation);
    if (!unwrapped) return null;
    const { node: aliased, subst } = followTypeAliasChain(unwrapped, objInfo.scope);
    const members = aliased ? getTypeMembers(aliased, objInfo.scope) : null;
    if (!members) return null;
    for (const m of members) {
      if (!keyMatchesName(m.key, propName)) continue;
      // getters are TSMethodSignature with kind:'get' but semantically read the return
      // type, not a function. regular methods fall through to the method-signature node
      // so downstream sees a function type for `const fn = obj.method`
      const isMethodProper = m.type === 'TSMethodSignature' && m.kind !== 'get';
      const raw = m.typeAnnotation ?? m.returnType ?? (isMethodProper ? m : null);
      if (!raw) continue;
      return { annotation: applySubst(raw, subst), scope: objInfo.scope };
    }
    return null;
  }

  // find the raw type annotation of an expression (follows bindings and const chains)
  function findExpressionAnnotation(path, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    // ESTree preserves ParenthesizedExpression - unwrap
    if (path.node.type === 'ParenthesizedExpression') return findExpressionAnnotation(path.get('expression'), depth + 1);
    // ESTree wraps optional chains in ChainExpression (babel inlines); peel so the
    // inner MemberExpression hits its own branch below and resolves through the object
    if (path.node.type === 'ChainExpression') return findExpressionAnnotation(path.get('expression'), depth + 1);
    if (path.node.type === 'TSAsExpression' || path.node.type === 'TSSatisfiesExpression'
      || path.node.type === 'TSTypeAssertion' || path.node.type === 'TypeCastExpression') {
      return { annotation: path.node.typeAnnotation, scope: path.scope };
    }
    if (path.node.type === 'TSNonNullExpression' || path.node.type === 'TSInstantiationExpression') {
      return findExpressionAnnotation(path.get('expression'), depth + 1);
    }
    if (t.isIdentifier(path.node)) {
      const binding = path.scope?.getBinding(path.node.name);
      if (!binding) return null;
      const annotation = findBindingAnnotation(binding.path);
      if (annotation) {
        // narrow declared union via the last straight-line assignment's literal-property
        // shape: TS treats `let f: Foo = init; f = { kind: 'b', ... }` as narrowing `f`
        // to FooB after the assignment. without this `f.data` after the assignment
        // resolves on the declared union and emits the generic polyfill
        const narrowed = narrowUnionByAssignmentLiteral(path, annotation, binding.path.scope);
        return { annotation: narrowed ?? annotation, scope: binding.path.scope };
      }
      if (!binding.constantViolations?.length && t.isVariableDeclarator(binding.path.node)) {
        const init = binding.path.get('init');
        if (init.node) return findExpressionAnnotation(init, depth + 1);
      }
    }
    // obj.prop / obj?.prop - resolve property type through the object's annotation chain,
    // carrying generic substitutions so `Wrapper<string>.inner.value()` resolves T -> string.
    // `resolveMemberAnnotation` self-guards on shape; null fall-through to the call branch below
    const memberResult = resolveMemberAnnotation(path, depth);
    if (memberResult) return memberResult;
    // direct `f()`: pull the callee's declared return type and substitute explicit call-site
    // type args (`makeBox<number>()`) so downstream member lookups see concrete types
    const callType = babelNodeType(path.node);
    if (callType === 'CallExpression' || callType === 'OptionalCallExpression') {
      let fnPath = resolveRuntimeExpression(path.get('callee'));
      // ambient `declare function f<T>(...): R` - babel doesn't bind the name, so
      // resolveRuntimeExpression returns the bare Identifier. fall back to ambient lookup
      // (mirrors `resolveCallReturnType`'s ambient branch) so call-return annotations on
      // ambient generic fns get the same call-site subst as runtime fns
      if (t.isIdentifier(fnPath.node) && !isFunctionLike(fnPath.node)) {
        const ambient = findAmbientFunctionPath(fnPath.node.name, fnPath.scope);
        if (ambient) fnPath = ambient;
      }
      if (isFunctionLike(fnPath.node) && fnPath.node.returnType) {
        // explicit `<...>` args first; fall through to argument inference when caller
        // omitted them (`makeBox(arr)` -> infer T from arr's annotation), then declared
        // defaults via `buildCallSiteSubst`. inferred path bridges the gap babel itself
        // covers via TS's structural inference - without it, `function makeBox<T>(t: T): {value: T}`
        // returned `{value: T}` unsubstituted, dropping array narrowing on `b.value.at(0)`
        const subst = inferCallSiteSubst(fnPath.node, path, depth) ?? buildCallSiteSubst(fnPath.node, path.node);
        const annotation = subst
          ? applyAliasSubstDeep(unwrapTypeAnnotation(fnPath.node.returnType), subst)
          : fnPath.node.returnType;
        return { annotation, scope: fnPath.scope };
      }
      // typed method call: w.inner.value() - resolve callee's annotation, extract return type
      const callee = path.get('callee');
      if (callee.node.type === 'MemberExpression' || callee.node.type === 'OptionalMemberExpression') {
        const memberInfo = findExpressionAnnotation(callee, depth + 1);
        if (memberInfo) {
          const unwrappedMember = unwrapTypeAnnotation(memberInfo.annotation);
          // TSFunctionType -> extract return type; TSMethodSignature's typeAnnotation
          // is already the return type (not a function wrapper), use it directly
          const ret = functionTypeReturnAnnotation(unwrappedMember) ?? unwrappedMember;
          if (ret) return { annotation: ret, scope: memberInfo.scope };
        }
      }
    }
    return null;
  }

  // call-site explicit type args (`makeBox<number>()`) -> {paramName -> argNode}
  function buildCallSiteSubst(fnNode, callNode) {
    return buildSubstMap(fnNode.typeParameters?.params, getTypeArgs(callNode)?.params);
  }

  // infer {paramName -> argAnnotation} from runtime argument annotations when caller
  // omitted explicit `<...>` (`makeBox(arr)` with `function makeBox<T>(t: T)`: lift arr's
  // annotation onto T). limited to direct `T` param shapes (not container wrappers like
  // `T[]` / `Array<T>` / `Promise<T>`) so this stays cheap and doesn't rebuild
  // `buildTypeParamMap`'s full container-aware inference. depth threading prevents
  // recursion blowup when the arg's annotation lookup recurses through chained calls
  function inferCallSiteSubst(fnNode, callPath, depth) {
    if (getTypeArgs(callPath.node)?.params?.length) return null;
    const fnTypeParams = fnNode.typeParameters?.params;
    if (!fnTypeParams?.length) return null;
    const paramNames = new Set(fnTypeParams.map(typeParamName).filter(Boolean));
    const args = callPath.get('arguments');
    const { params } = fnNode;
    const subst = new Map();
    const limit = Math.min(params.length, args.length);
    for (let i = 0; i < limit; i++) {
      if (!params[i] || !args[i]) continue;
      const { param } = effectiveParam(params[i]);
      const paramAnnotation = unwrapTypeAnnotation(param?.typeAnnotation);
      const name = paramAnnotation && typeRefName(paramAnnotation);
      if (!name || !paramNames.has(name) || subst.has(name)) continue;
      const argInfo = findExpressionAnnotation(args[i], depth + 1);
      const argAnnot = argInfo?.annotation && unwrapTypeAnnotation(argInfo.annotation);
      if (argAnnot) subst.set(name, argAnnot);
    }
    return subst.size ? subst : null;
  }

  // traverse from a binding to its enclosing for-in/for-of statement (if any)
  // binding must be a VariableDeclarator without init, declared in the loop header
  function findForLoopParent(bindingPath) {
    if (!t.isVariableDeclarator(bindingPath?.node) || bindingPath.node.init) return null;
    const declarationPath = bindingPath.parentPath;
    if (!t.isVariableDeclaration(declarationPath?.node)) return null;
    const forPath = declarationPath.parentPath;
    if (!forPath || forPath.node.left !== declarationPath.node) return null;
    return forPath;
  }

  // find the index of a variable in an ArrayPattern, accounting for holes and defaults.
  // sentinel: scalar `-1` means "not found" (contrast with `findArrayPatternKeyPath` whose
  // `[-1]` array signals "found in rest"); `RestElement` matches are skipped here because
  // callers use this fn only for positional-tuple lookups where rest is a distinct case
  function findPatternIndex(arrayPattern, varName) {
    const { elements } = arrayPattern;
    if (!elements) return -1;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (!element || element.type === 'RestElement') continue;
      const id = element.type === 'AssignmentPattern' ? element.left : element;
      if (id?.type === 'Identifier' && id.name === varName) return i;
    }
    return -1;
  }

  // resolve the type of a specific element in an ArrayExpression by index
  // arrayPath must already be a resolved ArrayExpression path
  function resolveArrayLiteralElement(arrayPath, index) {
    const { elements } = arrayPath.node;
    if (index < 0 || index >= elements.length) return null;
    // bail if any spread at or before target index - positions become unpredictable
    for (let i = 0; i <= index; i++) {
      if (elements[i]?.type === 'SpreadElement') return null;
    }
    if (!elements[index]) return null; // hole
    return resolveNodeType(arrayPath.get('elements')[index]);
  }

  // resolve common element type from an ArrayExpression if all elements share the same type
  // arrayPath must already be a resolved ArrayExpression path
  function resolveArrayLiteralCommonType(arrayPath) {
    const { elements } = arrayPath.node;
    if (elements.length === 0) return null;
    let common = null;
    for (let i = 0; i < elements.length; i++) {
      // bail on holes and spreads - can't determine element types
      if (!elements[i] || elements[i].type === 'SpreadElement') return null;
      const resolved = resolveNodeType(arrayPath.get('elements')[i]);
      if (!resolved) return null;
      common = commonType(common, resolved);
      if (!common) return null; // mixed types
    }
    return common;
  }

  // resolve element type from a runtime iterable (follows variables via resolvePath)
  // handles: string literals (chars) and homogeneous array literals (common element type)
  function resolveRuntimeIterableElement(path) {
    return resolveInnerType(resolveNodeType(resolveRuntimeExpression(path)));
  }

  function findBindingAnnotation(bindingPath) {
    const { node } = bindingPath;
    return node.typeAnnotation
      || node.id?.typeAnnotation
      || node.param?.typeAnnotation
      || (t.isAssignmentPattern(bindingPath.node) && node.left?.typeAnnotation);
  }

  // resolve array destructuring from any annotation source: pattern, init, or for-of iterable
  function resolveArrayBinding(arrayPattern, varName, bindingPath) {
    // array rest: const [a, ...rest] = items -> rest is always Array
    if (isRestBinding(arrayPattern.elements || [], varName)) return new $Object('Array');
    // annotation on the pattern itself: function foo([a]: string[]) or const [a]: string[] = ...
    if (arrayPattern.typeAnnotation) {
      const result = resolveArrayPatternBinding(arrayPattern, varName, arrayPattern.typeAnnotation, bindingPath.scope);
      if (result) return result;
    }
    // annotation on the init expression: const [a] = typedArr
    if (t.isVariableDeclarator(bindingPath.node) && bindingPath.node.init) {
      const initInfo = findExpressionAnnotation(bindingPath.get('init'));
      if (initInfo) {
        const initResult = resolveArrayPatternBinding(arrayPattern, varName, initInfo.annotation, initInfo.scope);
        if (initResult) return initResult;
      }
      // runtime init: resolve through variables to the actual value
      const initPath = resolveRuntimeExpression(bindingPath.get('init'));
      const index = findPatternIndex(arrayPattern, varName);
      if (index >= 0) {
        // direct element: const [a] = typedArr -> resolve inner type or literal element
        const initType = resolveNodeType(initPath);
        const inner = resolveInnerType(initType);
        if (inner) return inner;
        if (t.isArrayExpression(initPath.node)) {
          const elemType = resolveArrayLiteralElement(initPath, index);
          if (elemType) return elemType;
        }
      } else {
        // nested pattern: const [{ a }] = [{ a: 'x' }] or const [[b]] = [['x']]
        const arrPath = findArrayPatternKeyPath(arrayPattern, varName, bindingPath.scope);
        if (arrPath) {
          const result = resolveObjectMemberPath(initPath, arrPath);
          if (result) return result;
        }
      }
    }
    // for-of iterable: for (const [a] of typedArr)
    const elemInfo = resolveForOfElementAnnotation(bindingPath);
    if (elemInfo) {
      const elemResult = resolveArrayPatternBinding(arrayPattern, varName, elemInfo.annotation, elemInfo.scope);
      if (elemResult) return elemResult;
    }
    // runtime: for (const [a] of 'hello') or for (const [k, v] of urlParams.entries())
    const forOfPath = findForLoopParent(bindingPath);
    if (t.isForOfStatement(forOfPath?.node)) {
      // resolve for-of element, then unwrap one more level for array destructuring
      const inner = resolveInnerType(resolveForOfResolvedElement(forOfPath));
      if (inner) return inner;
    }
    // fallback: resolve from destructuring default value: const [a = []] = arr
    return resolveDestructuringDefault(arrayPattern, varName, bindingPath);
  }

  function resolveAnnotatedMember(annotation, keyName, scope) {
    const unwrapped = unwrapTypeAnnotation(annotation);
    if (!unwrapped) return null;
    // `typeof Enum` in annotation position - member access on the enum object yields the
    // enum value kind. findTypeMember doesn't walk TSTypeQuery bodies, so dispatch here
    if (unwrapped.type === 'TSTypeQuery') {
      const segments = collectQualifiedSegments(unwrapped.exprName);
      const rootName = segments?.[0];
      if (rootName && segments.length === 1) {
        const enumDecl = findEnumDeclaration(rootName, scope);
        if (enumDecl) {
          const type = resolveEnumMemberType(enumDecl, keyName);
          if (type) return type;
        }
      }
    }
    const memberType = findTypeMember(unwrapped, keyName, scope);
    if (!memberType) return null;
    const defaultMap = buildDefaultTypeParamMap(unwrapped, scope);
    return defaultMap
      ? substituteTypeParams(memberType, defaultMap, scope, 0)
      : resolveTypeAnnotation(memberType, scope);
  }

  // step through `['a', 'b']` against the annotation; final step goes through resolveAnnotatedMember
  function resolveAnnotatedMemberPath(annotation, keyPath, scope) {
    if (!keyPath?.length) return null;
    let current = annotation;
    for (let i = 0; i < keyPath.length - 1; i++) {
      const unwrapped = unwrapTypeAnnotation(current);
      if (!unwrapped) return null;
      const next = findTypeMember(unwrapped, keyPath[i], scope);
      if (!next) return null;
      current = next;
    }
    return resolveAnnotatedMember(current, keyPath.at(-1), scope);
  }

  // recursively unwrap Promise<T> annotation to T for for-await-of element types
  // mirrors runtime `await` semantics: Promise<Promise<T>> -> T
  function unwrapPromiseAnnotation(node) {
    let result = unwrapTypeAnnotation(node);
    while ((result?.type === 'TSTypeReference' || result?.type === 'GenericTypeAnnotation') && typeRefName(result) === 'Promise') {
      const inner = getTypeArgs(result)?.params[0];
      if (!inner) break;
      const unwrapped = unwrapTypeAnnotation(inner);
      if (!unwrapped) break;
      result = unwrapped;
    }
    return result ?? node;
  }

  // resolve the raw element annotation of a for-of iterable from its type annotation
  function resolveForOfElementAnnotation(path) {
    const forOfPath = findForLoopParent(path);
    if (!t.isForOfStatement(forOfPath?.node)) return null;
    const annotationInfo = findExpressionAnnotation(forOfPath.get('right'));
    if (!annotationInfo) return null;
    let elemAnnotation = extractElementAnnotation(annotationInfo.annotation, annotationInfo.scope, 0);
    // for-await-of unwraps Promise elements: Iterable<Promise<T>> -> T
    if (elemAnnotation && forOfPath.node.await) elemAnnotation = unwrapPromiseAnnotation(elemAnnotation);
    return elemAnnotation ? { annotation: elemAnnotation, scope: annotationInfo.scope } : null;
  }

  // resolve the element type of a for-of iterable, unwrapping Promise for for-await-of
  function resolveForOfResolvedElement(forOfPath) {
    const isAwait = forOfPath.node.await;
    const annotationInfo = findExpressionAnnotation(forOfPath.get('right'));
    if (annotationInfo) {
      const annotatedType = resolveElementType(annotationInfo.annotation, annotationInfo.scope, 0);
      if (annotatedType) return isAwait ? unwrapPromise(annotatedType) : annotatedType;
    }
    const runtimeType = resolveRuntimeIterableElement(forOfPath.get('right'));
    if (runtimeType) return isAwait ? unwrapPromise(runtimeType) : runtimeType;
    return null;
  }

  // { a: [{ b: 'x' }] } with path ['a', 0, 'b'] -> resolveObjectMember for 'x'
  // string keys resolve object properties, number keys resolve array elements
  function resolveObjectMemberPath(objPath, keyPath) {
    if (keyPath.length === 0) return resolveNodeType(objPath);
    const [step] = keyPath;
    const rest = keyPath.slice(1);
    if (typeof step === 'number') {
      // -1 = rest element, always Array
      if (step < 0) return new $Object('Array');
      if (!t.isArrayExpression(objPath.node) || objPath.node.elements.length <= step) return null;
      return resolveObjectMemberPath(resolveRuntimeExpression(objPath.get('elements')[step]), rest);
    }
    if (!t.isObjectExpression(objPath.node)) return null;
    if (!rest.length) return resolveObjectMember(objPath, step);
    const prop = findObjectMember(objPath, step);
    if (!prop || !t.isObjectProperty(prop.node)) return null;
    const next = resolveRuntimeExpression(prop.get('value'));
    return resolveObjectMemberPath(next, rest);
  }

  // try runtime object literal, then annotation-based resolution for a destructured member
  function resolveDestructuredMember(exprPath, keyPath) {
    const runtimeResult = resolveObjectMemberPath(resolveRuntimeExpression(exprPath), keyPath);
    if (runtimeResult) return runtimeResult;
    const info = findExpressionAnnotation(exprPath);
    if (info) return resolveAnnotatedMemberPath(info.annotation, keyPath, info.scope);
    return null;
  }

  // walk from a nested pattern up through parent wrappers, collecting the key path
  // { a: [{ b }] } -> from ObjectPattern({ b }) up to stop: ['a', 0]
  function collectPatternKeyPath(startPath, stop) {
    const result = [];
    let prev = startPath;
    let cur = startPath.parentPath;
    while (cur && cur !== stop && PATTERN_WRAPPERS.has(babelNodeType(cur.node))) {
      const type = babelNodeType(cur.node);
      if (type === 'ObjectProperty' || type === 'Property') {
        const key = cur.node.computed
          ? resolveComputedKeyName(cur.node.key, cur.scope ?? startPath.scope)
          : getKeyName(cur.node.key);
        if (key === null) return null;
        result.unshift(key);
      } else if (type === 'ArrayPattern') {
        const idx = cur.node.elements?.indexOf(prev.node);
        if (idx === undefined || idx < 0) return null;
        result.unshift(idx);
      }
      prev = cur;
      cur = cur.parentPath;
    }
    return result;
  }

  function resolveObjectBinding(objectPattern, varName, bindingPath) {
    // object rest: const { a, ...rest } = obj -> rest is always Object
    if (isRestBinding(objectPattern.properties, varName)) return new $Object('Object');
    // annotation on the pattern: const { items }: { items: number[] } = ...
    if (objectPattern.typeAnnotation) {
      const result = resolveDestructuredType(objectPattern, varName, bindingPath.scope);
      if (result) return result;
    }
    const keyPath = findDestructuredKeyPath(objectPattern, varName, bindingPath.scope);
    if (!keyPath) return null;
    if (t.isVariableDeclarator(bindingPath.node) && bindingPath.node.init) {
      // build full path through nested patterns: { a: [{ b }] } = init -> ['a', 0, 'b']
      const prefix = collectPatternKeyPath(objectPattern, bindingPath);
      const fullPath = prefix?.length ? [...prefix, ...keyPath] : keyPath;
      const result = resolveDestructuredMember(bindingPath.get('init'), fullPath);
      if (result) return result;
    }
    const elemInfo = resolveForOfElementAnnotation(bindingPath);
    if (elemInfo) return resolveAnnotatedMemberPath(elemInfo.annotation, keyPath, elemInfo.scope);
    // runtime: for (const { name } of [{ name: [1,2,3] }])
    const forOfPath = findForLoopParent(bindingPath);
    if (t.isForOfStatement(forOfPath?.node)) {
      const iterPath = resolveRuntimeExpression(forOfPath.get('right'));
      if (t.isArrayExpression(iterPath.node) && iterPath.node.elements.length) {
        const firstElem = resolveRuntimeExpression(iterPath.get('elements')[0]);
        const result = resolveObjectMemberPath(firstElem, keyPath);
        if (result) return result;
      }
    }
    return resolveDestructuringDefault(objectPattern, varName, bindingPath);
  }

  function findBindingPattern(node, type) {
    if (node.type === type) return node;
    if (node.id?.type === type) return node.id;
    if (node.left?.type === type) return node.left;
    return null;
  }

  function resolveBindingType(path) {
    if (!t.isIdentifier(path.node)) return null;
    const binding = path.scope?.getBinding(path.node.name);
    if (!binding) return null;
    const { path: bindingPath } = binding;
    const { name } = path.node;
    const { node } = bindingPath;
    // rest-param: `function f(...xs) { xs.at(0) }` - `xs` is always an Array at runtime
    // regardless of call-site. annotated form (`...xs: T[]`) flows through the annotation
    // branch below; unannotated falls here. without this, `.at(0)` on `xs` dispatches the
    // generic polyfill instead of the array-specific helper
    if (node?.type === 'RestElement') {
      const annotated = findBindingAnnotation(bindingPath);
      if (annotated) return resolveTypeAnnotation(annotated, bindingPath.scope);
      return new $Object('Array');
    }
    // destructured object: for (const { a } of ...) or const { a } = ...
    const objectPattern = findBindingPattern(node, 'ObjectPattern');
    if (objectPattern) return resolveObjectBinding(objectPattern, name, bindingPath);
    // destructured array: for (const [a] of ...) or const [a] = ...
    const arrayPattern = findBindingPattern(node, 'ArrayPattern');
    if (arrayPattern) return resolveArrayBinding(arrayPattern, name, bindingPath);
    // direct annotation: function foo(x: T) or const x: T = ... or (x: T = default)
    // must NOT be reached for destructured bindings - their pattern-level annotation
    // describes the container type, not the element type
    const typeAnnotation = findBindingAnnotation(bindingPath);
    if (typeAnnotation) return resolveTypeAnnotation(typeAnnotation, bindingPath.scope);
    // for-in / for-of (only for direct bindings - destructured bindings return early above)
    const forLoopParent = findForLoopParent(bindingPath);
    if (forLoopParent) {
      // for-in: iteration variable is always a string per ECMAScript spec
      if (t.isForInStatement(forLoopParent.node)) return new $Primitive('string');
      // for-of / for-await-of: infer element type from the iterable
      if (t.isForOfStatement(forLoopParent.node)) return resolveForOfResolvedElement(forLoopParent);
    }
    // mutable binding: resolve from the last straight-line assignment before usage
    const lastAssign = findLastStraightLineAssignment(binding, path);
    if (lastAssign) {
      // `+=` / `-=` / ... - the assignment node's own type captures the result
      if (lastAssign.node.type === 'AssignmentExpression' && lastAssign.node.operator !== '=') {
        return resolveNodeType(lastAssign);
      }
      const left = assignLeft(lastAssign.node);
      const rightKey = assignRightKey(lastAssign.node);
      // destructuring: `({ a: { b } } = ...)` or `var { a: { b } } = ...`
      if (left?.type === 'ObjectPattern') {
        const keyPath = findDestructuredKeyPath(left, name, lastAssign.scope);
        if (!keyPath) return null;
        return resolveDestructuredMember(lastAssign.get(rightKey), keyPath);
      }
      // array destructuring: `[x] = ['hello']`, `var [{ a }] = [{ a: 'x' }]`
      if (left?.type === 'ArrayPattern') {
        const arrPath = findArrayPatternKeyPath(left, name, lastAssign.scope);
        if (arrPath) {
          const initPath = resolveRuntimeExpression(lastAssign.get(rightKey));
          return resolveObjectMemberPath(initPath, arrPath);
        }
        return null;
      }
      return resolveNodeType(lastAssign.get(rightKey));
    }
    // no assignment found - resolve from init when either const or all mutations are after usage
    if (t.isVariableDeclarator(node) && node.init) {
      const violations = binding.constantViolations;
      if (!violations?.length) return resolveNodeType(bindingPath.get('init'));
      const usagePos = path.node.start;
      if (usagePos !== undefined && violations.every(v => (v.node.start ?? -1) >= usagePos)) {
        return resolveNodeType(bindingPath.get('init'));
      }
    }
    return null;
  }

  // normalize a constantViolation path to its "assignment-like" ancestor. covers:
  //   - `x = y` / `({x} = y)`                          -> AssignmentExpression
  //   - `var x = y` redeclaration (subsequent `var`)    -> VariableDeclarator
  // Babel: violation IS the AssignmentExpression or the redeclared VariableDeclarator.
  // estree-toolkit: violation is the LHS Identifier - walk up through Property/ObjectPattern.
  // depth scales with destructuring nesting
  function violationToAssignment(v) {
    let p = v;
    for (let i = 0; i < MAX_DEPTH && p; i++) {
      const type = babelNodeType(p.node);
      if (type === 'AssignmentExpression' || type === 'VariableDeclarator') return p;
      if (type === 'ExpressionStatement' || type === 'Program') return null;
      p = p.parentPath;
    }
    return null;
  }

  // node-shape adapters: AssignmentExpression has left/right/operator; VariableDeclarator has id/init
  const assignLeft = n => n.type === 'VariableDeclarator' ? n.id : n.left;
  const assignRightKey = n => n.type === 'VariableDeclarator' ? 'init' : 'right';

  // if `path` is inside a synchronous IIFE within `targetScope`, return the CallExpression
  // path. matches `(() => { x = 1 })()` but NOT `setTimeout(() => { x = 1 })`
  function findEnclosingIIFE(path, targetScope) {
    for (let cur = path; cur; cur = cur.parentPath) {
      if (cur.scope === targetScope) return null;
      if (!t.isFunction(cur.node)) continue;
      if (cur.node.async || cur.node.generator) return null;
      // walk past parens and `(0, fn)` sequence wrappers
      let callee = cur;
      while (callee.parentPath?.node.type === 'ParenthesizedExpression'
        || (callee.parentPath?.node.type === 'SequenceExpression'
          && callee.node === callee.parentPath.node.expressions.at(-1))) {
        callee = callee.parentPath;
      }
      const call = callee.parentPath;
      if (call && (call.node.type === 'CallExpression' || call.node.type === 'OptionalCallExpression')
        && call.node.callee === callee.node) return call;
      return null;
    }
    return null;
  }

  // the AST node a scope is anchored to; Babel exposes `.block`, estree-toolkit - `.path.node`
  const scopeNode = s => s.block ?? s.path?.node;

  // scope is inside bindingScope's var-scope - same object, or nested through plain blocks
  // without crossing a function/StaticBlock boundary. lets us treat `var` writes in inner
  // BlockStatements as writes to the hoisted function-scope binding
  function isInBindingVarScope(scope, bindingScope) {
    for (let s = scope; s; s = s.parent) {
      if (s === bindingScope) return true;
      const node = scopeNode(s);
      if (t.isFunction(node) || t.isStaticBlock?.(node)) return false;
    }
    return false;
  }

  // every wrapping statement up to varScopeBody is a plain BlockStatement / Program /
  // StaticBlock - reject if / switch / loop / try / etc. that make execution conditional
  function reachesVarScopeStraightLine(startPath, varScopeBody) {
    for (let p = startPath; p; p = p.parentPath) {
      if (p.node === varScopeBody) return true;
      const { type } = p.node;
      if (type !== 'BlockStatement' && type !== 'Program' && type !== 'StaticBlock') return false;
    }
    return false;
  }

  const ASSIGN_LEFT_TYPES = new Set(['Identifier', 'ObjectPattern', 'ArrayPattern']);

  // lazy per-binding cache: valid assignments pre-filtered, sorted by pos; binary-searched per query
  let sortedAssignmentCache = new WeakMap();

  function buildSortedAssignments(binding) {
    const { scope: bindingScope, constantViolations } = binding;
    const bindingScopeNode = scopeNode(bindingScope);
    const varScopeBody = bindingScopeNode.type === 'Program' ? bindingScopeNode : bindingScopeNode.body;
    const out = [];
    for (const v of constantViolations) {
      const ap = violationToAssignment(v);
      if (!ap) continue;
      const isVarDecl = ap.node.type === 'VariableDeclarator';
      // `var x;` without init is a no-op at runtime - binding keeps its previous value
      if (isVarDecl && !ap.node.init) continue;
      if (!ASSIGN_LEFT_TYPES.has(assignLeft(ap.node)?.type)) continue;
      // lift through nested synchronous IIFE wrappers until we land in binding's var-scope
      let effectiveAp = ap;
      while (effectiveAp && !isInBindingVarScope(effectiveAp.scope, bindingScope)) {
        effectiveAp = findEnclosingIIFE(effectiveAp, bindingScope);
      }
      if (!effectiveAp) continue;
      const pos = effectiveAp.node.start;
      if (pos === undefined || pos === null) continue;
      // walk to the directly-wrapping statement:
      //   AssignmentExpression -> ExpressionStatement
      //   VariableDeclarator -> VariableDeclaration (one step up)
      const stmtType = isVarDecl ? 'VariableDeclaration' : 'ExpressionStatement';
      let stmt = effectiveAp;
      while (stmt && stmt.node.type !== stmtType) stmt = stmt.parentPath;
      if (!stmt || !reachesVarScopeStraightLine(stmt.parentPath, varScopeBody)) continue;
      out.push({ ap, pos });
    }
    out.sort((a, b) => a.pos - b.pos);
    return out;
  }

  // find the last straight-line assignment before usagePath:
  // `x = value`, `x += value`, `({ x } = value)`, or a `var x = value` redeclaration -
  // same var-scope (possibly nested through plain blocks / synchronous IIFEs).
  // O(V) build per binding (cached), O(log V) per query
  function findLastStraightLineAssignment(binding, usagePath) {
    const beforePos = usagePath.node.start;
    if (beforePos === undefined || beforePos === null) return null;
    if (!binding.constantViolations?.length) return null;
    if (!isInBindingVarScope(usagePath.scope, binding.scope)) return null;

    let sortedAssigns = sortedAssignmentCache.get(binding);
    if (!sortedAssigns) {
      sortedAssigns = buildSortedAssignments(binding);
      sortedAssignmentCache.set(binding, sortedAssigns);
    }
    if (!sortedAssigns.length) return null;

    // largest entry with pos < beforePos
    let lo = 0;
    let hi = sortedAssigns.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sortedAssigns[mid].pos < beforePos) lo = mid + 1;
      else hi = mid;
    }
    return lo > 0 ? sortedAssigns[lo - 1].ap : null;
  }

  // --- Guard parsing & narrowing ---
  function matchesTypeofValue(resolved, value) {
    if (value === 'object') return (!resolved.primitive && resolved.constructor !== 'Function') || resolved.type === 'null';
    if (value === 'function') return resolved.constructor === 'Function';
    return resolved.primitive && resolved.type === value;
  }

  function matchesGuard(resolved, guard) {
    if (guard.kind === 'typeof') return matchesTypeofValue(resolved, guard.value);
    if (guard.kind === 'typeof-or') {
      for (const value of guard.values) if (matchesTypeofValue(resolved, value)) return true;
      return false;
    }
    return !resolved.primitive && resolved.constructor === guard.constructorName;
  }

  // peel parens / chain / TS expression wrappers (`as` / `satisfies` / `!`) inside the
  // typeof operand so `typeof (x as any) === 'string'` and `typeof x! === 'number'` narrow
  // the same as bare `typeof x`. asymmetric `unwrapParens` would only strip parens, leaving
  // the TS cast in place and failing the bare-Identifier check. mirrors `parseTypeGuard`'s
  // left/right peel
  function isTypeofVar(node, varName) {
    if (node?.type !== 'UnaryExpression' || node.operator !== 'typeof') return false;
    const arg = unwrapRuntimeExpr(node.argument);
    return arg?.type === 'Identifier' && arg.name === varName;
  }

  // guard shape builders - single point of truth for the guard descriptor literal
  const typeofGuard = (value, negated) => ({ kind: 'typeof', value, negated });
  const instanceofGuard = (constructorName, negated) => ({ kind: 'instanceof', constructorName, negated });

  // hint convention: lowercase -> typeof guard (primitive), capitalized -> instanceof guard (object)
  function guardFromHint(hint, negated) {
    return PRIMITIVES.has(hint.type) ? typeofGuard(hint.type, negated) : instanceofGuard(hint.type, negated);
  }

  // convert a resolved type back to a typeof / instanceof guard. types that can't be
  // coerced to a primitive or named constructor are dropped (the guard wouldn't help
  // polyfill hint inference anyway).
  function guardFromResolvedType(resolved, negated) {
    if (!resolved) return null;
    if (resolved.primitive && PRIMITIVES.has(resolved.type)) return typeofGuard(resolved.type, negated);
    if (resolved.constructor) return instanceofGuard(resolved.constructor, negated);
    return null;
  }

  // walk a (possibly nested) `obj.a.b.c` member-chain to its leaf member node. for each
  // intermediate hop we step into the carried annotation via `getTypeMembers` + match;
  // the leaf member is returned raw (not its typeAnnotation) so the caller can inspect
  // a method's full TSMethodSignature - `findTypeMember` would synth a stub there and
  // lose return-type info (e.g. TSTypePredicate). returns null on any non-Identifier link,
  // missing root binding, or unresolvable intermediate hop
  function resolveMemberCallChain(callee, scope) {
    const props = [];
    let node = callee;
    while (node?.type === 'MemberExpression' && !node.computed && node.property?.type === 'Identifier') {
      props.push(node.property.name);
      node = node.object;
    }
    if (node?.type !== 'Identifier' || !props.length) return null;
    const binding = scope.getBinding(node.name);
    if (!binding) return null;
    let annotation = unwrapTypeAnnotation(findBindingAnnotation(binding.path));
    const scopeRef = binding.path.scope;
    // props collected leaf-first; consume from the end to walk root-down. last entry stays
    // for the leaf-member lookup below (its raw signature is what callers need)
    for (let i = props.length - 1; i > 0; i--) {
      if (!annotation) return null;
      const members = getTypeMembers(annotation, scopeRef);
      const m = members?.find(mm => keyMatchesName(mm.key, props[i]));
      annotation = m ? unwrapTypeAnnotation(m.typeAnnotation ?? m.returnType) : null;
    }
    if (!annotation) return null;
    const members = getTypeMembers(annotation, scopeRef);
    const member = members?.find(m => keyMatchesName(m.key, props[0]));
    return member ? { member, scope: scopeRef } : null;
  }

  // resolve a callee identifier to its function-like decl: returns {fnNode, returnType}
  // where fnNode carries the param list (`params` for FunctionDeclaration / arrow / TSDeclare,
  // `parameters` on a TSFunctionType binding-annotation) and returnType is the unwrapped
  // declared return annotation. unifies the four shapes a function-like binding can take so
  // callers can map a `TSTypePredicate.parameterName` to a positional call-arg uniformly:
  //   function isStr(x): x is T { ... }      -> FunctionDeclaration / TSDeclareFunction
  //   const isStr = (x): x is T => ...       -> VariableDeclarator + init ArrowFunctionExpression
  //   const isStr: (x) => x is T = impl      -> VariableDeclarator + TSFunctionType annotation
  // babel quirk: TSFunctionType stores the return type under `.typeAnnotation`, not `.returnType`
  function resolveBindingReturnInfo(declNode) {
    if (t.isFunction(declNode) || isAmbientFunctionNode(declNode)) {
      return { fnNode: declNode, returnType: unwrapTypeAnnotation(declNode.returnType) };
    }
    if (!t.isVariableDeclarator(declNode)) return null;
    // inline annotation on init wins (`const f = (x): x is T => ...`); fall through to the
    // binding-annotation form (`const f: (x) => x is T = impl`) when init is annotation-less,
    // including the common `const f: T = otherFn` shape where the predicate lives on the
    // binding annotation
    if (declNode.init && t.isFunction(declNode.init)) {
      const inlineReturn = unwrapTypeAnnotation(declNode.init.returnType);
      if (inlineReturn) return { fnNode: declNode.init, returnType: inlineReturn };
    }
    const bindingAnnotation = unwrapTypeAnnotation(declNode.id?.typeAnnotation);
    if (bindingAnnotation?.type !== 'TSFunctionType') return null;
    return {
      fnNode: bindingAnnotation,
      returnType: unwrapTypeAnnotation(bindingAnnotation.typeAnnotation ?? bindingAnnotation.returnType),
    };
  }

  // verify a `TSTypePredicate` references the call-arg identified by varName: walk fnParams
  // for the slot named `parameterName`, then check `args[slot]` is `Identifier{varName}`.
  // without this, `function isStr(opts, x): x is string` paired with `isStr(o, input)` would
  // narrow the wrong arg. babel uses `params`, oxc/TS-ESTree uses `parameters` for method sigs;
  // probe both. peel TS expression wrappers (`as`, `!`, parens) on the call-arg so wrapped
  // forms (`isStr(o, input as any)`) still bind
  function matchPredicateArg(predicate, fnNode, args, varName) {
    if (predicate?.parameterName?.type !== 'Identifier') return false;
    const params = fnNode?.params ?? fnNode?.parameters;
    if (!params) return false;
    const targetName = predicate.parameterName.name;
    for (let i = 0; i < params.length; i++) {
      if (params[i]?.name !== targetName) continue;
      const arg = args?.[i];
      if (!arg) return false;
      const unwrapped = unwrapRuntimeExpr(arg);
      return unwrapped?.type === 'Identifier' && unwrapped.name === varName;
    }
    return false;
  }

  // enumerate the function-like declarations a callee may resolve to, paired with their
  // declared return annotation and the lexical scope to resolve type names against. method-
  // form yields a single leaf-member candidate from the dotted chain. identifier-form yields
  // the runtime binding plus all ambient overload siblings (TSDeclareFunction headers) so
  // multi-overload predicates - where only one header carries `x is T` - are still found.
  // ambient list is filtered against the runtime binding to avoid retesting the same node
  function predicateCandidates(callee, scope) {
    if (callee.type === 'MemberExpression' && !callee.computed
      && callee.property?.type === 'Identifier') {
      const result = resolveMemberCallChain(callee, scope);
      if (!result) return [];
      return [{
        fnNode: result.member,
        returnType: unwrapTypeAnnotation(memberCallReturnAnnotation(result.member)),
        scope: result.scope,
      }];
    }
    if (callee.type !== 'Identifier') return [];
    const out = [];
    const binding = scope.getBinding(callee.name);
    const seen = new Set();
    const push = path => {
      if (seen.has(path)) return;
      seen.add(path);
      const info = resolveBindingReturnInfo(path.node);
      if (info) out.push({ fnNode: info.fnNode, returnType: info.returnType, scope: path.scope });
    };
    if (binding) push(binding.path);
    for (const ambient of findAmbientFunctionPaths(callee.name, scope)) push(ambient);
    return out;
  }

  // resolve a callee to a guard descriptor when its return type is a `TSTypePredicate`.
  // `asserts` flag picks between the two predicate forms:
  //   `x is T`         - narrows only inside the truthy branch (asserts=false)
  //   `asserts x is T` - narrows after the call completes normally (asserts=true)
  // `args` + `varName` bind `parameterName` to a positional call-arg so non-first-arg
  // predicates (`function isStr(opts, x): x is T`) narrow the right binding
  function resolvePredicateGuard(callee, scope, negated, asserts, args, varName) {
    if (!scope) return null;
    for (const c of predicateCandidates(callee, scope)) {
      if (c.returnType?.type !== 'TSTypePredicate' || !!c.returnType.asserts !== asserts) continue;
      if (!matchPredicateArg(c.returnType, c.fnNode, args, varName)) continue;
      const resolved = resolveTypeAnnotation(c.returnType.typeAnnotation, c.scope);
      const guard = guardFromResolvedType(resolved, negated);
      if (guard) return guard;
    }
    return null;
  }

  // user-defined type predicate: `function isStr(x): x is string`, arrow form, or method
  // assigned to a const. assertion form (`asserts x is T`) goes through `resolvePredicateGuard`
  // with asserts=true via `parseAssertionStatementGuard`
  function parseUserPredicateGuard(callee, scope, negated, args, varName) {
    return resolvePredicateGuard(callee, scope, negated, false, args, varName);
  }

  // detect `?.` anywhere in a call-expression chain.
  // ESTree wraps any optional segment in `ChainExpression`; babel encodes optionality
  // via dedicated types (`OptionalCallExpression` / `OptionalMemberExpression`).
  // run this BEFORE `unwrapRuntimeExpr` strips ChainExpression - that strip would erase
  // the signal on the ESTree path
  function hasOptionalChainInCall(rawExpr) {
    let cur = rawExpr;
    while (cur) {
      // SE-extracted callee `(0, obj?.assertStr)(x)`: walk SE tail (runtime callee).
      // CallExpression / MemberExpression: descend into callee / object respectively.
      // ChainExpression / Optional* types: optional segment found, bail caller
      switch (cur.type) {
        case 'ChainExpression':
        case 'OptionalCallExpression':
        case 'OptionalMemberExpression': return true;
        case 'CallExpression': cur = cur.callee; break;
        case 'MemberExpression': cur = cur.object; break;
        case 'SequenceExpression': cur = cur.expressions.at(-1); break;
        default: return false;
      }
    }
    return false;
  }

  // `assertArray(x)` as a statement - `asserts x is T` narrows x from that point forward.
  // any-arg-position via predicate.parameterName matching, so `obj.assertStr(opts, input)`
  // with `(opts, x): asserts x is T` narrows `input` (not the first arg). peel callee
  // wrappers (`(0, isStr)`, `((isStr))`, `isStr as any`, `isStr!`) so non-Identifier shapes
  // still hit the binding-name check inside resolvePredicateGuard.
  // optional-chain forms (`obj?.assertStr(x)`, `obj.assertStr?.(x)`, `(asrt as any)?.(x)`)
  // do NOT narrow in TS - the assertion may be skipped at runtime when the receiver is
  // null/undefined, so post-statement code can't trust the assertion's signature
  function parseAssertionStatementGuard(sibling, varName) {
    if (sibling.node?.type !== 'ExpressionStatement') return null;
    if (hasOptionalChainInCall(sibling.node.expression)) return null;
    const call = unwrapRuntimeExpr(sibling.node.expression);
    if (call?.type !== 'CallExpression' || !call.arguments?.length) return null;
    const guard = resolvePredicateGuard(
      unwrapExpressionChain(call.callee), sibling.scope, false, true, call.arguments, varName,
    );
    if (guard) guard.positive = true;
    return guard;
  }

  function parseTypeGuard(testNode, varName, scope) {
    const peeled = peelNegation(testNode);
    const { test } = peeled;
    let { negated } = peeled;
    if (test.type === 'BinaryExpression') {
      const { operator } = test;
      // unwrap parens + ChainExpression + TS wrappers so `(x as any) instanceof Array`
      // and `x! instanceof Array` narrow the same as bare `x instanceof Array`
      const left = unwrapRuntimeExpr(test.left);
      const right = unwrapRuntimeExpr(test.right);
      const isNegatedOp = operator === '!==' || operator === '!=';
      if (isNegatedOp || operator === '===' || operator === '==') {
        if (isNegatedOp) negated = !negated;
        // pick the `typeof varName` side explicitly so `typeof a === typeof b` doesn't misfire
        const leftIsTypeof = isTypeofVar(left, varName);
        const rightIsTypeof = !leftIsTypeof && isTypeofVar(right, varName);
        if (leftIsTypeof || rightIsTypeof) {
          const literalSide = leftIsTypeof ? right : left;
          if (isLiteralOf(literalSide, 'String')) return typeofGuard(literalSide.value, negated);
          // template literal with no expressions: `object` === typeof x
          if (literalSide.type === 'TemplateLiteral' && literalSide.expressions.length === 0) {
            return typeofGuard(literalSide.quasis[0].value.cooked, negated);
          }
        }
        // `<typeguard> ==/=== false` / `<typeguard> !=/!== true` etc: strip the boolean
        // comparison and recurse on the non-literal side. derived flip: outer.truthy
        // <=> inner.truthy XOR (bool XOR negated). so flip the inner-guard polarity iff
        // `bool === negated` (negated already combines outer `!` prefix and `!=/!==` op)
        const litLeft = isLiteralOf(left, 'Boolean');
        const litRight = !litLeft && isLiteralOf(right, 'Boolean');
        if (litLeft || litRight) {
          const litSide = litLeft ? left : right;
          const innerExpr = litLeft ? right : left;
          const innerGuard = parseTypeGuard(innerExpr, varName, scope);
          if (innerGuard) {
            if (litSide.value === negated) innerGuard.negated = !innerGuard.negated;
            return innerGuard;
          }
        }
      }
      if (operator === 'instanceof'
        && left.type === 'Identifier' && left.name === varName) {
        const constructorName = right.type === 'Identifier' ? right.name : globalProxyMemberName(right);
        if (constructorName) return instanceofGuard(constructorName, negated);
      }
    }
    // KNOWN_STATIC_TYPE_GUARDS (`Array.isArray` / `Number.isFinite` / ...) narrow first-arg
    // only; extra trailing args are ignored at runtime, so accepting them matches user intent.
    // user predicates with positional arg-binding via `parameterName` route through
    // `parseUserPredicateGuard`, which inspects the call's full args list to find the slot
    // matching `varName` (so `function isFoo(opts, x): x is Foo` narrows the second arg).
    // OptionalCallExpression (`Array.isArray?.(x)`) is babel's optional-call shape; ESTree
    // wraps it in ChainExpression which `peelNegation`'s `unwrapRuntimeExpr` already strips
    if ((test.type === 'CallExpression' || test.type === 'OptionalCallExpression')
        && test.arguments?.length >= 1) {
      const { callee } = test;
      const propName = getMemberProperty(callee);
      if (propName !== null && callee.object?.type === 'Identifier') {
        const arg0 = unwrapParens(test.arguments[0]);
        if (arg0.type === 'Identifier' && arg0.name === varName) {
          const hint = lookupNested(KNOWN_STATIC_TYPE_GUARDS, callee.object.name, propName);
          if (hint) return guardFromHint(hint, negated);
        }
      }
      const userGuard = parseUserPredicateGuard(callee, scope, negated, test.arguments, varName);
      if (userGuard) return userGuard;
    }
    return null;
  }

  const EXIT_STATEMENTS = new Set([
    'BreakStatement',
    'ContinueStatement',
    'ReturnStatement',
    'ThrowStatement',
  ]);

  function nodeAlwaysExits(node, depth = 0) {
    if (depth > MAX_DEPTH) return false;
    if (EXIT_STATEMENTS.has(node.type)) return true;
    if (node.type === 'BlockStatement') {
      const { body } = node;
      for (let i = 0; i < body.length; i++) if (nodeAlwaysExits(body[i], depth + 1)) return true;
      return false;
    }
    if (node.type === 'IfStatement') {
      return node.alternate
        && nodeAlwaysExits(node.consequent, depth + 1)
        && nodeAlwaysExits(node.alternate, depth + 1);
    }
    // finally exit overrides; otherwise need both try and catch (if any) to exit
    if (node.type === 'TryStatement') {
      if (node.finalizer && nodeAlwaysExits(node.finalizer, depth + 1)) return true;
      if (!nodeAlwaysExits(node.block, depth + 1)) return false;
      return !node.handler || nodeAlwaysExits(node.handler.body, depth + 1);
    }
    return false;
  }

  function blockAlwaysExits(block, depth = 0) {
    return nodeAlwaysExits(block.node, depth);
  }

  function canFallThrough($case) {
    const { consequent } = $case;
    for (let i = 0; i < consequent.length; i++) if (nodeAlwaysExits(consequent[i])) return false;
    return true;
  }

  // flatten a && b && c when condition is true, or a || b || c when condition is false
  // only flattens the matching operator; mixed operators stay as opaque nodes
  function flattenCondition(node, operator) {
    const result = [];
    const stack = [unwrapParens(node)];
    while (stack.length) {
      const current = unwrapParens(stack.pop());
      if (current.type === 'LogicalExpression' && current.operator === operator) {
        stack.push(current.right, current.left);
      } else {
        result.push(current);
      }
    }
    return result;
  }

  // parse an OR group of typeof guards: typeof x === 'a' || typeof x === 'b' (conditionTrue=true)
  // or De Morgan form: typeof x !== 'a' && typeof x !== 'b' (conditionTrue=false)
  function parseTypeofOrGuard(node, varName, conditionTrue) {
    const operator = conditionTrue ? '||' : '&&';
    const expectNegated = !conditionTrue;
    node = unwrapParens(node);
    if (node.type !== 'LogicalExpression' || node.operator !== operator) return null;
    const parts = flattenCondition(node, operator);
    const values = new Set();
    for (const part of parts) {
      // user predicates are unrelated to typeof - pass null scope to keep this fast
      const guard = parseTypeGuard(part, varName, null);
      if (!guard || guard.kind !== 'typeof' || guard.negated !== expectNegated) return null;
      values.add(guard.value);
    }
    return values.size >= 2 ? { kind: 'typeof-or', values, negated: expectNegated } : null;
  }

  // extract guards for varName from a condition, applying && / || flattening.
  // scope is the lookup scope for resolving user-defined type predicate functions.
  function parseGuardsFromCondition(testNode, conditionTrue, varName, scope) {
    const parts = flattenCondition(testNode, conditionTrue ? '&&' : '||');
    const guards = [];
    for (const part of parts) {
      const guard = parseTypeGuard(part, varName, scope) || parseTypeofOrGuard(part, varName, conditionTrue);
      if (guard) {
        guard.positive = conditionTrue !== guard.negated;
        guards.push(guard);
      }
    }
    return guards;
  }

  // if / ternary / && / || - unified: parse guards from condition, determine polarity
  function findConditionalGuards(current, varName) {
    const parent = current.parentPath;
    if (!parent) return [];
    let conditionTrue, testNode;
    if (t.isIfStatement(parent.node) || t.isConditionalExpression(parent.node)) {
      const { key } = current;
      if (key !== 'consequent' && key !== 'alternate') return [];
      conditionTrue = key === 'consequent';
      testNode = parent.node.test;
    } else if (t.isLogicalExpression(parent.node) && current.key === 'right') {
      const { operator } = parent.node;
      if (operator !== '&&' && operator !== '||') return [];
      conditionTrue = operator === '&&';
      testNode = parent.node.left;
    } else return [];
    return parseGuardsFromCondition(testNode, conditionTrue, varName, current.scope);
  }

  // resolve a string value from a case test: StringLiteral directly or constant Identifier binding
  function caseTestStringValue(test, scope) {
    if (!test) return null;
    if (isLiteralOf(test, 'String')) return test.value;
    if (test.type === 'Identifier') {
      const bindingPath = constantBindingPath(test.name, scope);
      if (t.isVariableDeclarator(bindingPath?.node)) {
        const { init } = bindingPath.node;
        if (isLiteralOf(init, 'String')) return init.value;
      }
    }
    return null;
  }

  // switch (typeof x) { case 'string': ... ; default: ... }
  function findSwitchCaseGuards(current, varName) {
    if (!t.isSwitchCase(current.parentPath?.node)) return [];
    const switchCase = current.parentPath;
    const switchStmt = switchCase.parentPath;
    if (!t.isSwitchStatement(switchStmt?.node)) return [];
    if (!isTypeofVar(switchStmt.node.discriminant, varName)) return [];
    const { cases } = switchStmt.node;
    const { scope } = switchCase;
    const caseIndex = cases.indexOf(switchCase.node);
    const caseValue = caseTestStringValue(switchCase.node.test, scope);
    // specific case: typeof value is known
    if (caseValue !== null) {
      // collect fall-through predecessors into a typeof-or group
      const values = new Set([caseValue]);
      for (let i = caseIndex - 1; i >= 0; i--) {
        if (!canFallThrough(cases[i])) break;
        // bail if default or non-resolvable test in the fall-through chain
        const predValue = caseTestStringValue(cases[i].test, scope);
        if (predValue === null) return [];
        values.add(predValue);
      }
      if (values.size === 1) return [{ kind: 'typeof', value: caseValue, positive: true, negated: false }];
      return [{ kind: 'typeof-or', values, negated: false, positive: true }];
    }
    // default case: none of the explicit cases matched -> negative guards for each
    if (switchCase.node.test === null) {
      // bail if a preceding case can fall through to default - negative guards would be unsound
      if (caseIndex > 0 && canFallThrough(cases[caseIndex - 1])) return [];
      const guards = [];
      for (const $case of cases) {
        const value = caseTestStringValue($case.test, scope);
        if (value !== null) guards.push({ kind: 'typeof', value, positive: false, negated: false });
      }
      return guards;
    }
    return [];
  }

  // if (...) return; -> false (consequent exits, condition was true -> narrowed type is !condition)
  // if (...) {} else return; -> true (alternate exits, condition was true -> narrowed type is condition)
  function resolveExitCondition(sibling) {
    if (!t.isIfStatement(sibling.node)) return null;
    if (blockAlwaysExits(sibling.get('consequent'))) return false;
    if (sibling.node.alternate && blockAlwaysExits(sibling.get('alternate'))) return true;
    return null;
  }

  // shared sibling-to-guards parser. unifies both early-exit forms:
  //   - condition-bearing `if (typeof x === 'string') return;` -> guards from condition
  //   - assertion-statement `assertString(x);` -> single asserts guard
  // callers either count length (`siblingGuardsBinding` presence check) or accumulate
  // (`findPrecedingExitGuards` collection)
  function parseSiblingGuards(sibling, varName) {
    const conditionTrue = resolveExitCondition(sibling);
    if (conditionTrue !== null) {
      return parseGuardsFromCondition(sibling.node.test, conditionTrue, varName, sibling.scope);
    }
    const assertionGuard = parseAssertionStatementGuard(sibling, varName);
    return assertionGuard ? [assertionGuard] : [];
  }

  // does this single sibling apply a narrowing guard to `varName`?
  function siblingGuardsBinding(sibling, varName) {
    return parseSiblingGuards(sibling, varName).length > 0;
  }

  // if (typeof x === 'string') return; -> x is narrowed after the if
  // `assertArray(x)` -> x is narrowed after the call (asserts-predicate shape)
  // collects ALL preceding guards, including && / || flattening
  function findPrecedingExitGuards(siblings, index, varName) {
    const guards = [];
    for (let i = index - 1; i >= 0; i--) guards.push(...parseSiblingGuards(siblings[i], varName));
    return guards;
  }

  // get the statement list containing `current` if it's a numbered member of a block-like parent
  function getStatementSiblings(current) {
    if (typeof current.key !== 'number') return null;
    const parent = current.parentPath;
    if (current.listKey === 'body' && (t.isBlockStatement(parent.node) || t.isProgram(parent.node))) return parent.get('body');
    if (current.listKey === 'consequent' && t.isSwitchCase(parent.node)) return parent.get('consequent');
    return null;
  }

  // hot path: walked repeatedly from both findEnclosingTypeGuards and hasMutationAfterGuards
  // as they climb parent paths. same (pathNode, varName) pair is hit many times across
  // sibling identifier walks; WeakMap keyed on the path node avoids re-scanning siblings
  let earlyExitGuardsCache = new WeakMap();
  function findEarlyExitGuards(current, varName) {
    const node = current?.node;
    if (!node) return [];
    const byVar = getOrInitMap(earlyExitGuardsCache, node);
    if (byVar.has(varName)) return byVar.get(varName);
    const siblings = getStatementSiblings(current);
    const result = siblings ? findPrecedingExitGuards(siblings, current.key, varName) : [];
    byVar.set(varName, result);
    return result;
  }

  // shadow check: a guard's test lives in the enclosing scope (parent of `current` in the
  // walk, sibling-aware for early-exit). when that scope's `varName` resolves to a different
  // binding than the inner usage's, the guard refers to a shadowed identifier and must not
  // narrow our binding. shared by findEnclosingTypeGuards and hasMutationAfterGuards
  function guardAppliesToBinding(testScope, varName, binding) {
    return !binding || testScope?.getBinding(varName) === binding;
  }

  // collect ALL type guards along the AST path for cumulative narrowing.
  // const bindings can't be reassigned - function boundaries don't invalidate guards
  function findEnclosingTypeGuards(path, varName, isConst = false, binding = null) {
    const guards = [];
    for (let current = path.parentPath; current; current = current.parentPath) {
      if (t.isFunction(current.node) && !isConst) break;
      if (!guardAppliesToBinding(current.parentPath?.scope, varName, binding)) continue;
      guards.push(
        ...findConditionalGuards(current, varName),
        ...findSwitchCaseGuards(current, varName),
        ...findEarlyExitGuards(current, varName),
      );
    }
    return guards.length ? guards : null;
  }

  // resolve the type a guard implies: typeof 'string' -> $Primitive('string'), instanceof Array -> $Object('Array')
  function resolveGuardType(guard) {
    if (guard.kind === 'typeof') {
      if (PRIMITIVES.has(guard.value)) return new $Primitive(guard.value);
      if (guard.value === 'function') return new $Object('Function');
      // 'object' is too ambiguous - could be Array, Map, Set, Date, null, etc.
      return null;
    }
    if (guard.kind === 'instanceof') return resolveKnownConstructor(guard.constructorName);
    return null;
  }

  // filter candidate types by guards, return the unique surviving type or null
  function narrowByGuards(candidates, guards) {
    let result = null;
    for (const resolved of candidates) {
      if (!resolved) continue;
      if (isNullableOrNever(resolved)) continue;
      if (!guards.every(guard => matchesGuard(resolved, guard) === guard.positive)) continue;
      result = commonType(result, resolved);
      if (!result) return null;
    }
    return result;
  }

  // check whether any reassignment of binding could execute between a guard check and usagePath
  function hasMutationAfterGuards(binding, usagePath, varName) {
    const { constantViolations } = binding;
    const usageStart = usagePath.node.start;
    const isDescendantOf = (path, scope) => {
      for (let p = path; p; p = p.parentPath) if (p === scope) return true;
      return false;
    };
    // missing source positions (synthetic AST nodes) - conservatively assume mutation
    // is positionally before usage so narrowing drops rather than over-keeps
    const isBefore = v => v.node.start === null || v.node.start === undefined
      || usageStart === null || usageStart === undefined || v.node.start < usageStart;
    const violates = scope => constantViolations.some(v => isDescendantOf(v, scope));
    const violatesBefore = scope => constantViolations.some(v => isDescendantOf(v, scope) && isBefore(v));
    // early-exit-guard invalidation: only the NEAREST guard to usage matters - closer
    // guards re-narrow the binding independently of older guards' invalidation, and the
    // mutation window `(nearestIdx, current.key]` (incl. prefix of current sibling before
    // usage) is the only window that can invalidate runtime narrowing. older guards are
    // subsumed; their invalidation by mutations BEFORE the nearest guard is irrelevant
    const earlyExitInvalidates = (current, siblings) => {
      let nearestIdx = -1;
      for (let i = current.key - 1; i >= 0; i--) {
        if (siblingGuardsBinding(siblings[i], varName)) {
          nearestIdx = i;
          break;
        }
      }
      if (nearestIdx < 0) return false;
      for (let j = nearestIdx + 1; j < current.key; j++) if (violates(siblings[j])) return true;
      return violatesBefore(siblings[current.key]);
    };
    // a fresh inner conditional whose guard has no mutations between it and the usage
    // re-narrows at runtime regardless of outer-scope mutations - the inner guard's
    // condition re-evaluates after any outer-scope reassignment. once seen, outer-level
    // mutations don't invalidate narrowing
    let innerFreshConditional = false;
    for (let current = usagePath, parent; (parent = current.parentPath) && !t.isFunction(parent.node); current = parent) {
      if (!guardAppliesToBinding(parent.scope, varName, binding)) continue;
      if (findConditionalGuards(current, varName).length) {
        if (!violatesBefore(current)) innerFreshConditional = true;
        else if (!innerFreshConditional) return true;
      }
      if (findSwitchCaseGuards(current, varName).length && violatesBefore(parent) && !innerFreshConditional) return true;
      if (findEarlyExitGuards(current, varName).length && !innerFreshConditional
        && earlyExitInvalidates(current, getStatementSiblings(current))) return true;
    }
    return false;
  }

  // shared prologue: find guards for an identifier binding, cached per AST node
  let guardsCache = new WeakMap();

  function findGuardsForBinding(path) {
    if (!t.isIdentifier(path.node)) return null;
    const { node } = path;
    if (guardsCache.has(node)) return guardsCache.get(node);
    const { name } = node;
    const binding = path.scope?.getBinding(name);
    let result = null;
    if (binding) {
      // classify the annotation BEFORE collecting guards - a concrete (closed) annotation
      // can't be refined by typeof/instanceof, and neither caller uses guards in that case.
      // skipping the parent-path walk here is the main win (guard collection is O(depth))
      const classification = classifyGuardAnnotation(binding);
      if (classification.kind !== 'closed') {
        const isConst = !binding.constantViolations?.length;
        const guards = findEnclosingTypeGuards(path, name, isConst, binding);
        if (guards && (isConst
            || (!hasMutationAfterGuards(binding, path, name)
              && !hasMutationInCapturedFunction(binding)))) {
          // stash the classification on the result - callers reuse it instead of re-deriving
          result = { binding, guards, classification };
        }
      }
    }
    guardsCache.set(node, result);
    return result;
  }

  // bail narrowing if any reassignment lives inside a nested function - that function may
  // be invoked between the guard and the usage, breaking type narrowing
  function hasMutationInCapturedFunction({ constantViolations, scope }) {
    if (!constantViolations?.length) return false;
    return constantViolations.some(v => {
      for (let p = v.parentPath; p && p !== scope.path; p = p.parentPath) {
        if (t.isFunction(p.node)) return true;
      }
      return false;
    });
  }

  // classify a binding's annotation for the guard-based narrowing path:
  //   'none'   - no annotation; guards produce the type from scratch
  //   'union'  - union annotation; guards filter its branches (types/subst provided)
  //   'open'   - unknown/any/object/mixed; guards may refine it to a concrete type
  //   'closed' - any other annotation; guards can't meaningfully refine it
  function classifyGuardAnnotation(binding) {
    const annotation = findBindingAnnotation(binding.path);
    if (!annotation) return { kind: 'none' };
    const { scope } = binding.path;
    const { node: resolved, subst } = followTypeAliasChain(annotation, scope);
    if (resolved?.type === 'TSUnionType' || resolved?.type === 'UnionTypeAnnotation') {
      return { kind: 'union', types: resolved.types, subst, scope };
    }
    // TS `unknown`/`any`/`object`, Flow `mixed`/`any` are wide-open enough that
    // typeof / instanceof guards can refine them - `unknown` is the canonical place
    // users put guards and `object` still accepts Array.isArray() / instanceof
    if (resolved?.type === 'TSUnknownKeyword' || resolved?.type === 'TSAnyKeyword'
      || resolved?.type === 'TSObjectKeyword' || resolved?.type === 'AnyTypeAnnotation'
      || resolved?.type === 'MixedTypeAnnotation') return { kind: 'open' };
    return { kind: 'closed' };
  }

  function resolveTypeGuardNarrowing(path) {
    const info = findGuardsForBinding(path);
    if (!info) return null;
    const { guards, classification } = info;
    if (classification.kind === 'union') {
      const { types, subst, scope } = classification;
      if (!types?.length) return null;
      return narrowByGuards(types.map(member => resolveTypeAnnotation(applyAliasSubstDeep(member, subst), scope)), guards);
    }
    // 'closed' is already filtered by findGuardsForBinding - only 'none', 'open', 'union' reach here
    return narrowByGuards(guards.filter(g => g.positive).map(resolveGuardType), guards);
  }

  // --- Entry / public API ---
  let resolveCache = new WeakMap();
  // pre-mutation Type cache for plugin-side rewrites: babel mutates the AST in-place, so
  // when a sibling rewrite later re-resolves a node whose CallExpression callee was swapped
  // (`arr.concat(x)` -> `_concatMaybeArray(arr).call(arr, x)`), the new shape isn't recognized
  // by `resolveNodeTypeExpression`. emitters stash the resolved Type here BEFORE mutation;
  // resolveNodeTypeExpression hits this WeakMap first. WeakMap (vs node-attached property)
  // avoids polluting AST nodes - sibling plugins iterate `node` own-properties / clone via
  // `Object.assign`-style merges; an opaque side-channel won't leak into their pipelines
  let resolvedTypeCache = new WeakMap();

  // rebuild per-file to bound memory and drop retained entries from previous parses
  // (WeakMap is GC-safe, but rebuilding makes the memory footprint deterministic)
  function reset() {
    typeParamArgPaths = new WeakMap();
    sortedAssignmentCache = new WeakMap();
    guardsCache = new WeakMap();
    earlyExitGuardsCache = new WeakMap();
    ambientDeclCache = new WeakMap();
    resolveCache = new WeakMap();
    resolvedTypeCache = new WeakMap();
    typeDeclCache = new WeakMap();
    applySubstCache = new WeakMap();
    classFieldTypeCache = new WeakMap();
    moduleFieldIndexCache = new WeakMap();
    objectFieldTypeCache = new WeakMap();
    objectAliasClosureCache = new WeakMap();
    classInstanceClosureCache = new WeakMap();
    classBindingClosureCache = new WeakMap();
    classDescendantPathsCache = new WeakMap();
    exportedNamesCache = new WeakMap();
    closureTemporalBoundCache = new WeakMap();
    instanceMethodThisWritesCache = new WeakMap();
    staticMethodThisWritesCache = new WeakMap();
  }

  function resolveNodeType(path) {
    const { node } = path;
    if (!node) return null;
    if (resolveCache.has(node)) return resolveCache.get(node);
    // sentinel before recursion: circular references (e.g. `const a = b.x(); const b = a.x();`)
    // resolve to null (unknown type) instead of causing infinite recursion
    resolveCache.set(node, null);
    let result;
    try {
      result = resolveNodeTypeExpression(path);
      if (!result) {
        // guards win over the raw binding type: for open annotations and unannotated
        // bindings they yield the most specific type, otherwise we fall back.
        result = resolveTypeGuardNarrowing(path) || resolveBindingType(path);
      } else if (!result.inner && t.isIdentifier(path.node)) {
        // when runtime resolution determined the outer type but not the inner type (e.g. `new Set()` -> Set),
        // check if a type annotation provides a richer type with the same outer but known inner
        // (e.g. `const s: Set<string> = new Set()` -> Set<string>)
        const annotated = resolveBindingType(path);
        if (annotated?.inner && typesEqual(result, annotated)) result = annotated;
      }
      // $Primitive('unknown') (e.g. from `+` with unresolved operands) is truthy but imprecise -
      // allow typeof / instanceof guards to refine it to a concrete type
      if (result?.type === 'unknown') {
        result = resolveTypeGuardNarrowing(path) || result;
      }
    } catch (error) {
      // drop the sentinel so a future query may retry instead of seeing a stale `null`
      resolveCache.delete(node);
      throw error;
    }
    resolveCache.set(node, result);
    return result;
  }

  // RHS of `= expr` in assignment or variable declarator
  function getPatternInit(p) {
    if (t.isAssignmentExpression(p?.node)) return p.get('right');
    if (t.isVariableDeclarator(p?.node)) return p.get('init');
    return null;
  }

  // resolve the type of the object from which a property is accessed:
  // member expression (obj.prop, obj?.prop) or destructuring ({ prop } = obj)
  function resolvePropertyObjectType(path) {
    if (isMemberLike(path)) return resolveNodeType(path.get('object'));
    if (!t.isObjectProperty(path.node)) return null;
    const objectPattern = path.parentPath;
    if (!t.isObjectPattern(objectPattern?.node)) return null;
    if (objectPattern.node.typeAnnotation) {
      return resolveTypeAnnotation(objectPattern.node.typeAnnotation, objectPattern.scope);
    }
    const parent = objectPattern.parentPath;
    // direct parent owns the init - resolve the whole RHS
    const directInit = getPatternInit(parent);
    if (directInit?.node) return resolveNodeType(directInit);
    // nested pattern: collect key path via shared walk, resolve through the init
    let ancestor = parent;
    while (ancestor && PATTERN_WRAPPERS.has(babelNodeType(ancestor.node))) ancestor = ancestor.parentPath;
    const keyPath = collectPatternKeyPath(objectPattern);
    if (keyPath?.length) {
      const initPath = getPatternInit(ancestor);
      if (initPath?.node) {
        const member = resolveObjectMemberPath(resolveRuntimeExpression(initPath), keyPath);
        if (member) return member;
      }
    }
    const forOfPath = t.isForOfStatement(ancestor?.node) ? ancestor : findForLoopParent(ancestor);
    if (t.isForOfStatement(forOfPath?.node)) return resolveForOfResolvedElement(forOfPath);
    return null;
  }

  const DOM_COLLECTION_CONSTRUCTORS = assign(create(null), {
    DOMTokenList: 'domcollection',
    HTMLCollection: 'domcollection',
    NodeList: 'domcollection',
  });

  function toHint(type) {
    if (!type) return null;
    if (type.primitive) return type.type === 'unknown' ? null : type.type;
    const name = type.constructor;
    if (!name) return null;
    if (hasOwn(DOM_COLLECTION_CONSTRUCTORS, name)) return DOM_COLLECTION_CONSTRUCTORS[name];
    return name.toLowerCase();
  }

  // intersect a whitelist set with another hint set
  // if included is null, returns a fresh copy of the hints
  function intersectHintSets(included, hints) {
    if (!included) return new Set(hints);
    for (const hint of included) if (!hints.has(hint)) included.delete(hint);
    return included;
  }

  // collect type hints to include/exclude from typeof / instanceof guards when no annotation
  // returns { includedHints: Set } for positive typeof (whitelist, future-proof)
  // or { excludedHints: Set } for negative-only guards (blacklist)
  // or null when no hints can be determined
  function resolveGuardHints(path) {
    const info = findGuardsForBinding(path);
    if (!info) return null;
    const { guards, classification } = info;
    // only unannotated or open (unknown/any/object/mixed) bindings accept hint-based narrowing.
    // 'closed' is already filtered by findGuardsForBinding
    if (classification.kind !== 'none' && classification.kind !== 'open') return null;
    // bail if any positive guard resolves to a concrete type (already handled by resolveTypeGuardNarrowing)
    if (guards.some(g => g.positive && resolveGuardType(g))) return null;

    // resolve typeof / typeof-or guard to a set of hints
    function typeofGuardHints(guard) {
      if (guard.kind === 'typeof') {
        return hasOwn(TYPEOF_HINT_GROUPS, guard.value) ? TYPEOF_HINT_GROUPS[guard.value] : null;
      }
      if (guard.kind === 'typeof-or') {
        const union = new Set();
        for (const value of guard.values) {
          if (hasOwn(TYPEOF_HINT_GROUPS, value)) {
            for (const hint of TYPEOF_HINT_GROUPS[value]) union.add(hint);
          }
        }
        return union.size ? union : null;
      }
      return null;
    }

    function addHintsToSet(target, guard) {
      const hints = typeofGuardHints(guard);
      if (hints) {
        for (const hint of hints) target.add(hint);
        return true;
      }
      const hint = toHint(resolveGuardType(guard));
      if (hint) {
        target.add(hint);
        return true;
      }
      return false;
    }

    function deleteHintsFromSet(target, guard) {
      const hints = typeofGuardHints(guard);
      if (hints) {
        for (const hint of hints) target.delete(hint);
        return;
      }
      const hint = toHint(resolveGuardType(guard));
      if (hint) target.delete(hint);
    }

    // check for positive typeof guards -> use whitelist approach
    // whitelist is future-proof: unknown future hints are excluded by default
    let included = null;
    for (const guard of guards) {
      if (!guard.positive) continue;
      const hints = typeofGuardHints(guard);
      if (hints) included = intersectHintSets(included, hints);
    }

    if (included) {
      // subtract negative guards from the whitelist
      for (const guard of guards) {
        if (!guard.positive) deleteHintsFromSet(included, guard);
      }
      return included.size ? { includedHints: included } : null;
    }

    // no positive typeof -> use blacklist approach (conservative: unknown future hints are included)
    const excluded = new Set();
    for (const guard of guards) {
      if (!guard.positive) addHintsToSet(excluded, guard);
    }
    return excluded.size ? { excludedHints: excluded } : null;
  }

  function isString(path) {
    return primitiveTypeOf(resolveNodeType(path)) === 'string';
  }

  function isObject(path) {
    return resolveNodeType(path)?.primitive === false;
  }

  // {get,set} bundle around `resolvedTypeCache` - closure indirection so per-file `reset()`
  // re-binding propagates to consumers (direct WeakMap export would leave stale refs)
  const resolvedType = {
    get: node => resolvedTypeCache.get(node),
    set: (node, type) => resolvedTypeCache.set(node, type),
  };
  return {
    isObject,
    isString,
    reset,
    resolveGuardHints,
    resolveNodeType,
    resolvePropertyObjectType,
    resolvedType,
    toHint,
  };
}

export { createResolveNodeType, TYPE_HINTS };
