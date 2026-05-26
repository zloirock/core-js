// detect polyfillable usage patterns (usage-global and usage-pure modes)
import {
  buildDestructuringInitMeta,
  resolveNestedDestructureReceiver as sharedResolveNestedDestructureReceiver,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  checkLogicalAssignLhsGlobal,
  checkLogicalAssignLhsMember,
  isKnownGlobalName,
} from '@core-js/polyfill-provider/detect-usage/globals';
import { checkTypeAnnotations, walkTypeAnnotationGlobals } from '@core-js/polyfill-provider/detect-usage/annotations';
import {
  createSelfRefVarGuard,
  resolveKey as sharedResolveKey,
  unwrapParens,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { handleBinaryIn, handleMemberExpressionNode } from '@core-js/polyfill-provider/detect-usage/members';
import { createSyntaxRules } from '@core-js/polyfill-provider/detect-syntax';
import {
  findFunctionScopeVarInPath,
  findIifeArgForParam,
  findIifeCallSite,
  findTSRuntimeBindingInPath,
  isASTNode,
  isAmbientBindingShape,
  isFunctionParamDestructureParent,
  isInUpdateOperand,
  isMemberWriteOnlyContext,
  isTSTypeOnlyIdentifierPath,
  resolveCallArgument,
  walkPatternIdentifiers,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { isClassifiableReceiverArg } from '@core-js/polyfill-provider/helpers/class-walk';

// --- isReferenced ---

const IMPORT_SPECIFIER_TYPES = new Set([
  'ImportSpecifier',
  'ImportDefaultSpecifier',
  'ImportNamespaceSpecifier',
]);

const DECLARATION_ID_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ClassDeclaration',
  'ClassExpression',
  'VariableDeclarator',
]);

const CLASS_MEMBER_TYPES = new Set([
  'MethodDefinition',
  'PropertyDefinition',
  'AccessorProperty',
]);

const LABEL_TYPES = new Set([
  'LabeledStatement',
  'BreakStatement',
  'ContinueStatement',
]);

// check if an identifier is referenced (not a declaration, property key, or export alias).
// `skipUpdateTargets` (usage-pure only) additionally rejects UpdateExpression operands, since
// the polyfill rewrite would produce `_Map++` on a frozen import binding. usage-global must
// pass `false` here or `Map++` wouldn't inject its polyfill and would ReferenceError in IE 11
function isReferenced({ node, parent, parentKey, parentPath, skipUpdateTargets }) {
  if (!parent) return true;
  // TS type-only positions: `type X = ...` ids, `export { type X }` specifiers
  if (isTSTypeOnlyIdentifierPath({ parent, key: parentKey, parentPath })) return false;
  // property key positions
  if (parent.type === 'Property' && parentKey === 'key' && !parent.computed) return false;
  if (parent.type === 'MemberExpression' && parentKey === 'property' && !parent.computed) return false;
  if (CLASS_MEMBER_TYPES.has(parent.type) && parentKey === 'key' && !parent.computed) return false;
  if (parent.type === 'ImportAttribute' && parentKey === 'key') return false;
  // declaration id positions
  if (DECLARATION_ID_TYPES.has(parent.type) && parentKey === 'id') return false;
  if (LABEL_TYPES.has(parent.type) && parentKey === 'label') return false;
  // `IMPORT_SPECIFIER_TYPES` skips all import positions regardless of `importKind`, so
  // `import { type X, foo }` / `import type { X }` are already covered here
  if (IMPORT_SPECIFIER_TYPES.has(parent.type)) return false;
  // export-alias position: both `export { X } from "mod"` (ExportSpecifier) and
  // `export * as X from "mod"` (oxc's ExportAllDeclaration with `exported` slot) put the
  // local name in a re-export alias - not a runtime reference to the polyfilled global
  if ((parent.type === 'ExportSpecifier' || parent.type === 'ExportAllDeclaration')
    && parentKey === 'exported') return false;
  // Identifier LHS of assignment: module / strict-mode reads the binding before write, so
  // `Map = X` / `Map ||= X` / `Map += X` all need the polyfill in global mode. pure-mode
  // rewrite to frozen `_Map` TypeError's at write, so reject. checked BEFORE the member
  // write-only filter (line 679 in `isMemberWriteOnlyContext` matches Identifier LHS too)
  if (node.type === 'Identifier' && parent.type === 'AssignmentExpression' && parentKey === 'left') return !skipUpdateTargets;
  // member-write-only / destructure-LHS / AssignmentPattern.left for non-Identifier shapes
  if (isMemberWriteOnlyContext(node, parent, parentPath?.parent)) return false;
  if (parent.type === 'CatchClause' && parentKey === 'param') return false;
  if ((parent.type === 'ForInStatement' || parent.type === 'ForOfStatement') && parentKey === 'left') return false;
  if (parent.type === 'ArrayPattern' || (parent.type === 'RestElement' && parentKey === 'argument')) return false;
  // UpdateExpression operand, peeling transparent wrappers - gate see `skipUpdateTargets`
  if (skipUpdateTargets && isInUpdateOperand(parentPath)) return false;
  return true;
}

// --- ESTree scope adapter ---

// estree-toolkit's scope tracker doesn't recognise TS-specific runtime declarations
// (TSImportEqualsDeclaration, TSEnumDeclaration, TSModuleDeclaration). walk path's
// ancestor chain (Program / BlockStatement / TSModuleBlock / StaticBlock) so both
// `function f() { enum Map {} new Map() }` and `namespace Outer { namespace Map {} new Map() }`
// correctly identify the shadow. anchor preference: explicit `path` (the identifier path,
// reaches inner anchors) > `scope.path` (the scope owner, may anchor at Program only)
function hasTSRuntimeBinding(scope, name, path = null) {
  const anchor = path ?? scope?.path ?? null;
  return anchor ? findTSRuntimeBindingInPath(anchor, name) : false;
}

// estree-toolkit's scope tracker registers `declare class X` / `declare const X` / `interface X`
// / `import type X` as bindings even though they're tsc-elided. consult the binding before
// declaring a shadow so ambient/type-only declarations don't suppress polyfill emission.
// shared `isAmbientBindingShape` covers all tsc-elided binding forms uniformly with babel
function isAmbientBinding(binding) {
  return isAmbientBindingShape(binding?.path?.node, binding?.path?.parent);
}

function hasRuntimeBinding(scope, name, path = null) {
  // pass `path` through to `scope.hasBinding` / `scope.getBinding`: native estree-toolkit
  // scopes ignore the extra arg (their signature is name-only), but `makeFrameScope` uses
  // it for position-aware block-scope shadow checks - the inner `let`/`const`/`catch.param`
  // binding only matches when the lookup site sits inside its containing block
  if (!(scope?.hasBinding?.(name, path) ?? false)) {
    if (hasTSRuntimeBinding(scope, name, path)) return true;
    // estree-toolkit doesn't hoist `var` declarations from nested non-function blocks to
    // the enclosing function scope (babel's tracker does). without this fallback,
    // `function () { if (cond) { var globalThis = ...; } return globalThis; }` reports
    // no binding at the inner reference, the Identifier visitor queues
    // `globalThis -> _globalThis`, and `polyfillSiblingReceiverRefs`'s OWN var-walker
    // disagrees - the resulting nth-occurrence mismatch fails compose with "could not
    // locate inner needle". walking `path` ancestors for var-scope owners closes the gap
    return path ? findFunctionScopeVarInPath(path, name) : false;
  }
  // hasBinding=true; for real scopes where getBinding is also available, filter out ambient
  // TS-only declarations. stub scopes (`detectEntries` shadowScope) don't expose getBinding -
  // their hasBinding=true is authoritative
  const native = scope?.getBinding?.(name, path);
  return !(native && isAmbientBinding(native));
}

// factory: per-plugin-instance adapter closed over a getInjector callback. babel-plugin
// uses the same shape (`createBabelAdapter(getInjector)`) - keeps unplugin's adapter
// contract symmetric without leaning on module-level state. `getInjector()` returns the
// active per-transform injector or null between transforms; both consumers
// (adapter.getBinding's polyfillHint AND typeResolvers' getPolyfillBindingEntry) read
// through the same callback so user-imported polyfill UIDs (`import _Promise from
// '@core-js/pure/.../promise/constructor'; _Promise.resolve(1)`) get recognised as
// proxy-globals. re-entrancy is the caller's contract: plugin.js save/restore is the
// runTransform try/finally - early-returns before the save leave the outer injector intact.
// no-injector instances (default callback) are safe for adapter consumers that only need
// pure literal / binding checks (detect-entry's require/import scan)
export function createEstreeAdapter(getInjector = () => null) {
  return {
    // user-resolved package prefixes (`pkg` + `additionalPackages`) for symbol-import
    // detection in `bindingSymbolKey`. null between transforms (no injector active)
    get packages() { return getInjector()?.packages ?? null; },
    hasBinding(scope, name, path = null) {
      return hasRuntimeBinding(scope, name, path);
    },
    getBinding(scope, name) {
      const b = scope?.getBinding?.(name);
      if (!b) return null;
      // `importSource` is part of the adapter contract: `resolveKey` in polyfill-provider
      // needs it to recognise `import X from '.../symbol/<name>'` as Symbol.X. exposing the
      // raw module source at this interface is deliberate - not a leak, just the minimum
      // parser-agnostic info the provider requires to infer well-known symbol imports.
      // `polyfillHint` enables proxy-global recognition for user-imported polyfill UIDs
      // (`_Promise` -> 'Promise') so `_Promise.resolve(1)` rewrites to `_Promise$resolve(1)`
      // matching babel-plugin's behavior - constructor module typically doesn't expose
      // statics, so the rewrite avoids a runtime undefined-call crash.
      // shadow guard (symmetric with babel-plugin): `info.source !== null` means a
      // registered pure import - only attach `polyfillHint` when the actual scope binding
      // IS an import too. `info.source === null` is a destructure-alias (synthetic, no
      // standalone import) and attaches unconditionally
      const info = getInjector()?.getBindingInfo?.(name) ?? null;
      const isImportBinding = IMPORT_SPECIFIER_TYPES.has(b.path.node?.type);
      const importSource = isImportBinding ? b.path.parent?.source?.value ?? null : null;
      const polyfillHint = info ? (info.source === null || isImportBinding ? info.hint : null) : null;
      return {
        node: b.path.node,
        constantViolations: b.constantViolations,
        importSource,
        polyfillHint,
      };
    },
    getBindingNodeType(scope, name) {
      return scope?.getBinding(name)?.path?.node?.type ?? null;
    },
    // shared `unwrapParens` peels paren / TS expression wrappers / safe SequenceExpression
    // so `require('core-js/...' as any)` / `require((0, 'core-js/...'))` / `require(('core-js/...'))`
    // all reach the underlying string literal. SE prefix that carries observable side-effects
    // stops further peeling - entry-detection doesn't rewrite the call, so unsafe SE stays
    isStringLiteral(node) {
      return isLiteralString(unwrapParens(node));
    },
    getStringValue(node) {
      const inner = unwrapParens(node);
      return isLiteralString(inner) ? inner.value : null;
    },
  };
}

function isLiteralString(node) {
  return node?.type === 'Literal' && typeof node.value === 'string';
}

// --- Decorator sub-traversal ---

// estree-toolkit's visitor keys skip `decorators` - walk them manually with
// synthetic Babel-shaped paths so resolve-node-type can read typeAnnotations

const FUNCTION_NODE_TYPES = new Set(['FunctionExpression', 'FunctionDeclaration', 'ArrowFunctionExpression']);

// `isASTNode` drops parent back-pointers, location objects, and primitives without listing
// them by name; tolerates parsers adding new metadata fields (e.g. `typeArguments`).
// `visit(child, key, listKey, container)` matches babel NodePath shape: for array children
// `key` = index, `listKey` = property name; for non-array `key` = property name, `listKey` = null
function forEachChildNode(node, visit) {
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) if (isASTNode(value[i])) visit(value[i], i, key, value);
    } else if (isASTNode(value)) visit(value, key, null, node);
  }
}

// babel NodePath parity: for array-indexed children `key` = numeric index, `listKey` =
// property name, `container` = the array; for non-array children `key` = property name,
// `listKey` = null, `container` = parent node. consumers like `getStatementSiblings` rely
// on numeric key + listKey to recognise statement-in-block position
function makeSynthPath({ node, parent, parentKey, parentPath, scope, listKey = null, container = null }) {
  // cache `.get(key)` results per synth-path so repeated `path.get('object')` calls within
  // one traversal return the same wrapper. downstream consumers that identity-check
  // descendants (scope lookups, handled-object Sets) see stable paths. array branches cached
  // as-a-whole; same key always returns the same array of child paths
  const childCache = new Map();
  const self = {
    node,
    parent,
    parentPath,
    key: parentKey,
    listKey,
    container: container ?? parent,
    scope,
    get(key) {
      if (childCache.has(key)) return childCache.get(key);
      const value = node?.[key];
      const result = Array.isArray(value)
        ? value.map((el, i) => makeSynthPath({
          node: el, parent: node, parentKey: i, parentPath: self, scope, listKey: key, container: value,
        }))
        : makeSynthPath({
          node: value ?? null, parent: node, parentKey: key, parentPath: self, scope, container: node,
        });
      childCache.set(key, result);
      return result;
    },
  };
  return self;
}

// frame scope for an inline function inside a decorator - locals shadow parentScope.
// position-aware: `localDecls` carries Map<name, Array<{constant, node, blockStart,
// blockEnd}>> so block-scoped bindings (`let`/`const`/`catch.param`/block-level
// FunctionDeclaration / ClassDeclaration) only shadow the parent when the lookup site
// sits inside their containing block. fn-scoped bindings (`var`, params, fn.id, hoisted
// FunctionDeclaration at fn body top level) use the whole fn body range and shadow uniformly
function findLocalAt(localDecls, name, path) {
  const entries = localDecls.get(name);
  if (!entries) return null;
  const pos = path?.node?.start;
  // no position context (e.g. caller used the legacy `hasBinding(name)` signature) -
  // return the most-recently-added entry which corresponds to the innermost binding
  // walked. matches the pre-position "last write wins" overwrite semantics
  if (typeof pos !== 'number') return entries[0];
  // pick the most-specific (smallest containing block) shadow whose range covers `pos`.
  // ties broken by insertion order (most recent first - same as no-position fallback)
  let best = null;
  let bestSpan = Infinity;
  for (const entry of entries) {
    if (entry.blockStart <= pos && pos <= entry.blockEnd) {
      const span = entry.blockEnd - entry.blockStart;
      if (span < bestSpan) {
        best = entry;
        bestSpan = span;
      }
    }
  }
  return best;
}

function makeFrameScope(parentScope, localDecls) {
  const bindingCache = new Map();
  const frame = {
    hasBinding(name, path) {
      return findLocalAt(localDecls, name, path) !== null
        || (parentScope?.hasBinding(name, path) ?? false);
    },
    getBinding(name, path) {
      const local = findLocalAt(localDecls, name, path);
      if (!local) return parentScope?.getBinding?.(name, path) ?? null;
      // cache keyed on the entry identity, not the name - distinct shadows of the same
      // name (`let X = 1; { let X = 2; }`) must produce distinct synthetic bindings
      let binding = bindingCache.get(local);
      if (!binding) {
        binding = {
          constant: local.constant,
          path: makeSynthPath({ node: local.node, parent: null, parentKey: null, parentPath: null, scope: frame }),
        };
        bindingCache.set(local, binding);
      }
      return binding;
    },
  };
  return frame;
}

// module-level cache: keyed on fn AST node identity. plugin instances each parse their own
// AST, so node-identity is per-instance and cache entries never leak across instances.
// only risks staleness if an external caller hands the same node to two configurations,
// which the unplugin / babel-plugin pipeline doesn't do
const LOCALS_CACHE = new WeakMap();

// nodes that open a fresh lexical block scope. each entry inside one of these scopes its
// `let`/`const` / class declarations / catch parameters to the block's source range so
// shadow detection at a use-site uses position-aware containment. `var` and hoisted
// FunctionDeclaration retain function-scope semantics (they get the fn body's range
// passed through directly, ignoring intermediate block boundaries)
const BLOCK_SCOPING_NODE_TYPES = new Set([
  'BlockStatement',
  'StaticBlock',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'SwitchStatement',
]);

// LIFO insertion: most-recently-added entry sits at index 0 so the no-position fallback
// returns the innermost shadow (matches the pre-refactor "last write wins" semantics of
// the old single-entry Map.set). entries carry their own block range so position-aware
// lookup can pick the right shadow among same-name bindings in distinct scopes
function addLocal(locals, name, entry) {
  const list = locals.get(name);
  if (list) list.unshift(entry);
  else locals.set(name, [entry]);
}

function addPatternLocals(locals, pattern, entry) {
  walkPatternIdentifiers(pattern, id => addLocal(locals, id.name, entry));
}

function collectFunctionLocals(fnNode) {
  const cached = LOCALS_CACHE.get(fnNode);
  if (cached) return cached;
  const locals = new Map();
  // fn-scope range covers the WHOLE function node (signature + body) so param identifiers
  // themselves resolve to their own bindings - `fnNode.body.start` would leave params
  // outside the range and `findLocalAt` would miss them, letting the identifier visitor
  // rewrite `(Map) -> (_Map)` for a function-param shadow
  const fnStart = fnNode.start;
  const fnEnd = fnNode.end;
  for (const param of fnNode.params ?? []) {
    addPatternLocals(locals, param, { constant: true, node: param, blockStart: fnStart, blockEnd: fnEnd });
  }
  if (fnNode.id?.name) {
    addLocal(locals, fnNode.id.name, { constant: true, node: fnNode, blockStart: fnStart, blockEnd: fnEnd });
  }
  function walk(node, blockStart, blockEnd) {
    if (!node || typeof node !== 'object') return;
    // FunctionDeclaration is block-scoped per ES6+ strict mode; at fn body top level the
    // currentBlock IS the fn body so it naturally widens to fn-scope semantics. body opens
    // its own scope - stop descent regardless
    if (node.type === 'FunctionDeclaration') {
      if (node.id?.name) {
        addLocal(locals, node.id.name, { constant: true, node, blockStart, blockEnd });
      }
      return;
    }
    if (FUNCTION_NODE_TYPES.has(node.type)) return;
    if (node.type === 'VariableDeclaration') {
      // `var` hoists out of any enclosing block (fn-scoped); `let`/`const`/`using` /
      // `await using` are block-scoped. catch-bindings walk separately below
      const isVar = node.kind === 'var';
      const scopeStart = isVar ? fnStart : blockStart;
      const scopeEnd = isVar ? fnEnd : blockEnd;
      const constant = node.kind === 'const';
      for (const d of node.declarations) {
        addPatternLocals(locals, d.id, { constant, node: d, blockStart: scopeStart, blockEnd: scopeEnd });
      }
    } else if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      // ClassDeclaration is block-scoped (strict mode); ClassExpression doesn't bind
      // in the enclosing scope. body opens its own scope - stop descent either way
      if (node.type === 'ClassDeclaration' && node.id?.name) {
        addLocal(locals, node.id.name, { constant: true, node, blockStart, blockEnd });
      }
      return;
    } else if (node.type === 'CatchClause' && node.param) {
      // catch-binding lives only inside the handler body. descend with the catch-body
      // context so `let`/`const` inside also get correct ranges
      const catchStart = node.body?.start ?? node.start;
      const catchEnd = node.body?.end ?? node.end;
      addPatternLocals(locals, node.param, {
        constant: false, node: node.param, blockStart: catchStart, blockEnd: catchEnd,
      });
      if (node.body) walk(node.body, catchStart, catchEnd);
      return;
    }
    // block-shape nodes push a new block context for their descendants
    const inBlock = BLOCK_SCOPING_NODE_TYPES.has(node.type);
    const childStart = inBlock ? node.start : blockStart;
    const childEnd = inBlock ? node.end : blockEnd;
    forEachChildNode(node, child => walk(child, childStart, childEnd));
  }
  if (fnNode.body) walk(fnNode.body, fnStart, fnEnd);
  LOCALS_CACHE.set(fnNode, locals);
  return locals;
}

function walkSubtree({ node, parent, parentKey, parentPath, scope, visitors, listKey = null, container = null }) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
  const childScope = FUNCTION_NODE_TYPES.has(node.type)
    ? makeFrameScope(scope, collectFunctionLocals(node))
    : scope;
  const synthPath = makeSynthPath({ node, parent, parentKey, parentPath, scope: childScope, listKey, container });
  visitors[node.type]?.(synthPath);
  forEachChildNode(node, (child, childKey, childListKey, childContainer) => {
    walkSubtree({
      node: child, parent: node, parentKey: childKey, parentPath: synthPath, scope: childScope, visitors,
      listKey: childListKey, container: childContainer,
    });
  });
}

function walkDecoratorList(decorators, parentPath, decoratorVisitors) {
  if (!decorators?.length) return;
  for (let i = 0; i < decorators.length; i++) {
    walkSubtree({
      node: decorators[i], parent: parentPath.node, parentKey: i, parentPath, scope: parentPath.scope,
      visitors: decoratorVisitors, listKey: 'decorators', container: decorators,
    });
  }
}

// walks the node's own decorators plus any param-level decorators (TS legacy `@dec arg`
// on class method / constructor params). `MethodDefinition.params` lives on `.value`
function walkDecorators(parentPath, decoratorVisitors) {
  const { node } = parentPath;
  walkDecoratorList(node?.decorators, parentPath, decoratorVisitors);
  const params = node?.params ?? node?.value?.params;
  if (!params) return;
  for (const param of params) walkDecoratorList(param?.decorators, parentPath, decoratorVisitors);
}

// JSXIdentifier sits at the opening tag-name slot (`<Map />`'s `Map` Identifier with
// parent=JSXOpeningElement, key='name'). only this position is a runtime reference;
// attribute names, closing-tag dupes, and member-property tails reach the visitor too
// but should be ignored
function isJsxOpeningTagName(path) {
  return path.parent?.type === 'JSXOpeningElement' && path.key === 'name';
}

// JSXMemberExpression root (`<Map.Provider.X />` -> `Map` Identifier sits at the bottom
// of an `object`-chain whose terminal `MemberExpression` is the opening tag-name).
// walks `.object` upward; arbitrary depth supported - returns true only when we land on
// a JSXOpeningElement.name slot AFTER traversing at least one JSXMemberExpression hop
function isJsxMemberRoot(path) {
  let cur = path;
  while (cur?.parent?.type === 'JSXMemberExpression' && cur.parent.object === cur.node) {
    cur = cur.parentPath;
  }
  return cur !== path && isJsxOpeningTagName(cur);
}

// --- Usage visitors ---

export function createUsageVisitors({
  adapter, onUsage, onWarning, method, suppressProxyGlobals = false, walkAnnotations = true, isEntryAvailable,
}) {
  // only usage-pure rewrites global identifiers to named import bindings (which are frozen).
  // usage-global injects side-effect imports and leaves the identifier alone, so `Map++`
  // must polyfill - otherwise `Map` ReferenceError's in engines where the native is missing
  const skipUpdateTargets = method === 'usage-pure';
  const handledObjects = new WeakSet();
  // read `kind` off the parent VariableDeclaration via the binding path - works across
  // estree-toolkit shapes (`.path.parent` for one host, `.path.parentPath?.node` for
  // another). babel's `binding.kind` is read directly via the babel adapter's own getter
  const isSelfRefVarBinding = createSelfRefVarGuard(
    b => (b?.path?.parent ?? b?.path?.parentPath?.node)?.kind,
  );

  function resolveKey(node, computed, scope) {
    return sharedResolveKey({ node, computed, scope, adapter });
  }

  function extractPropertyKey(propNode, scope) {
    if (!propNode.computed) {
      return propNode.key.type === 'Identifier' ? propNode.key.name
        : adapter.isStringLiteral(propNode.key) ? propNode.key.value
          : null;
    }
    return resolveKey(propNode.key, true, scope);
  }

  // build meta for destructuring property: const { from } = Array, ({ from } = Array)

  function buildDestructuringMeta(propNode, parentPath) {
    const objectPattern = parentPath;
    const parent = objectPattern?.parentPath;
    if (!parent) return null;

    let initNode;
    const scope = parent.scope || objectPattern.scope;
    // nested patterns leave `initNode` undefined -> typeless meta (`object: null`)
    switch (parent.node.type) {
      case 'VariableDeclarator': initNode = parent.node.init; break;
      case 'AssignmentExpression': initNode = parent.node.right; break;
      case 'AssignmentPattern':
        // `function({ from } = Array)` - AssignmentPattern wraps the param. Route `parent.right`
        // as the destructure receiver so `from` resolves to `Array.from`.
        // for IIFE with statically-classifiable caller-arg (Identifier matching a known
        // builtin), the wrapper-default is dead code at runtime: prefer caller-arg as
        // receiver. non-Identifier shapes (`(...)(globalThis.X)`, `(...)(call())`) carry no
        // static type, so wrapper-default still provides the best static context and the
        // runtime fallback path (`= Array` fires on undefined caller-arg) gets the polyfill
        if (isFunctionParamDestructureParent(objectPattern)) {
          const argNode = findIifeArgForParam(parent.parentPath, parent.node);
          initNode = isClassifiableReceiverArg(argNode) ? argNode : parent.node.right;
          break;
        }
        // nested destructure with inner-default: `{ Array: { from } = {} } = X` - peel the
        // AssignmentPattern wrapper and resolve via the same nested-chain classifier as the
        // bare `{ Array: { from } } = X` shape (proxy-global init guarantees default never
        // fires, so it's transparent under "polyfill always wins")
        if (parent.parentPath?.node?.type === 'Property' && parent.node.left === objectPattern.node) {
          const innerKey = extractPropertyKey(propNode, scope);
          const constructor = innerKey
            ? sharedResolveNestedDestructureReceiver(parent.parentPath, adapter) : null;
          if (constructor) {
            return { kind: 'property', object: constructor, key: innerKey, placement: 'static' };
          }
        }
        break;
      case 'Property': {
        // nested pattern - shared `resolveNestedDestructureReceiver` walks outer-prop chain
        // up to the destructure host and returns the constructor name across proxy-global
        // and static-object descent shapes (see helper docstring)
        const innerKey = extractPropertyKey(propNode, scope);
        const constructor = innerKey ? sharedResolveNestedDestructureReceiver(parent, adapter) : null;
        if (constructor) {
          return { kind: 'property', object: constructor, key: innerKey, placement: 'static' };
        }
        break;
      }
      case 'ForOfStatement':
      case 'ForInStatement':
      case 'ArrayPattern':
      case 'RestElement':
      case 'CatchClause': break;
      default: {
        // IIFE destructuring: `!function({entries}) {}(Object)`. shared `findIifeCallSite`
        // peels wrapper chain (Unary / Sequence / Paren / Chain / TS), accepts CallExpression /
        // NewExpression / OptionalCallExpression, AND enforces the callee-identity gate
        // (`peelIifeCallee(callee, fn) === fn`) so functions PASSED AS ARGS to another call
        // (`doStuff(Object, function({entries}) {...})`) don't get misclassified as IIFEs
        const site = findIifeCallSite(parent, objectPattern.node);
        if (!site) return null;
        initNode = resolveCallArgument(site.callPath.node.arguments ?? [], site.paramIndex);
        if (!initNode) return null;
      }
    }

    const key = extractPropertyKey(propNode, scope);
    if (!key) return null;
    return buildDestructuringInitMeta({ initNode, key, scope, adapter, path: parent });
  }

  function annotationGlobal(path) {
    return name => {
      // pass `path` so `hasRuntimeBinding`'s var-hoisting fallback can detect `var Name`
      // declarations buried inside nested non-function blocks (estree-toolkit registers them
      // in the block's own scope rather than hoisting to the enclosing function)
      if (adapter.hasBinding(path.scope, name, path)) return;
      onUsage({ kind: 'global', name }, path);
    };
  }

  function identifierVisitor(path) {
    // orphaned node (parent removed by sibling transform / pruning): downstream isReferenced
    // and parent-shape checks would crash on null. parity with babel-plugin's handleIdentifier
    if (!path.parent) return;
    const { node, parent, key: parentKey } = path;
    // `isReferenced` returns false for write-context leaves like `Map ||= X`; diagnose the
    // pattern before the early return so users see why nothing was polyfilled
    // usage-pure rewrites globals to read-only import bindings; `_Map ||= X` would TypeError
    // at write time, so emit the warning. usage-global leaves globals untouched - side-effect
    // imports populate the binding before module body runs, so `||=` no-ops without emitting
    // user-visible problem. skip warning in global mode to avoid false-positive noise
    if (onWarning && method === 'usage-pure') {
      const warning = checkLogicalAssignLhsGlobal(path, adapter.hasBinding(path.scope, node.name, path));
      if (warning) onWarning(warning);
    }
    if (!isReferenced({ node, parent, parentKey, parentPath: path.parentPath, skipUpdateTargets })) return;
    // re-export: export { Promise } from 'foo' - local is not a reference when source is present
    if (parent?.type === 'ExportSpecifier' && parentKey === 'local'
      && path.parentPath?.parentPath?.node?.source) return;
    if (adapter.hasBinding(path.scope, node.name, path)) {
      // self-reference `var X = X` - hoisted var init reads the outer (global) scope
      // before the local is assigned. narrow via cached binding check; exclude let/const
      // (TDZ error) and ImportSpecifiers. `node.name` equals binding's own name by lookup
      if (!isSelfRefVarBinding(path.scope?.getBinding?.(node.name))) return;
      if (!isKnownGlobalName(node.name)) return;
      if (handledObjects.has(node)) return;
      onUsage({ kind: 'global', name: node.name }, path);
      return;
    }
    // see `handleBinaryIn` - only resolved polyfillable keys seed `handledObjects`
    if (handledObjects.has(node)) return;
    onUsage({ kind: 'global', name: node.name }, path);
  }

  function memberExpressionVisitor(path) {
    const { node, parent, key: parentKey } = path;
    // `globalThis.Map ||= X` / `globalThis.self.Map ||= X` - check BEFORE `isReferenced`
    // rejects (write-context member) and before child-visitor rewrites `globalThis` ->
    // `_globalThis`. `globalProxyMemberName` (used inside the helper) walks chains and
    // gates on shadowing internally - no separate isBound check needed
    if (onWarning && method === 'usage-pure') {
      const warning = checkLogicalAssignLhsMember({ path, scope: path.scope, adapter });
      if (warning) onWarning(warning);
    }
    if (handledObjects.has(node)) return;
    if (!isReferenced({ node, parent, parentKey, parentPath: path.parentPath, skipUpdateTargets })) return;
    const meta = handleMemberExpressionNode({
      node, scope: path.scope, adapter, handledObjects, suppressProxyGlobals, path,
    });
    if (meta) onUsage(meta, path);
  }

  function binaryExpressionVisitor(path) {
    const meta = handleBinaryIn({
      node: path.node, scope: path.scope, adapter, handledObjects, isEntryAvailable, path,
    });
    if (meta) onUsage(meta, path);
  }

  // Property visitor is shared: top-level destructure bindings and decorator-arg patterns
  // both need `buildDestructuringMeta` to route polyfillable receivers through synth-swap.
  // decorator walk must include it explicitly - `walkSubtree`'s visitor lookup is keyed by
  // node type, and without the entry the decorator subtree never reaches destructure handling
  function propertyVisitor(path) {
    if (path.node.method || path.parent?.type !== 'ObjectPattern') return;
    const meta = buildDestructuringMeta(path.node, path.parentPath);
    if (meta) onUsage(meta, path);
  }

  // JSX tag-name (`<Map />`) or N-deep member-root (`<Map.Provider.X />`). shared between
  // the top-level visitor and `decoratorVisitors` so `@(<Map/>) class C {}` decorators
  // detect the global runtime reference (previously skipped - decorator walk had no
  // JSXIdentifier entry, so the embedded JSX element never triggered polyfill emission).
  // `adapter.hasBinding` gets the path so `hasRuntimeBinding`'s var-hoisting fallback
  // detects a `var Tag` declaration inside a nested non-function block (estree-toolkit
  // registers var in the block's own scope rather than hoisting to enclosing function)
  function jsxIdentifierVisitor(path) {
    if (!isJsxOpeningTagName(path) && !isJsxMemberRoot(path)) return;
    if (adapter.hasBinding(path.scope, path.node.name, path)) return;
    onUsage({ kind: 'global', name: path.node.name }, path);
  }

  const decoratorVisitors = {
    Identifier: identifierVisitor,
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: binaryExpressionVisitor,
    Property: propertyVisitor,
    JSXIdentifier: jsxIdentifierVisitor,
  };

  function visitDecorators(path) {
    walkDecorators(path, decoratorVisitors);
  }

  function checkTypeAnnotation(path) {
    checkTypeAnnotations(path.node, annotationGlobal(path));
  }

  // class-field shapes carry their typeAnnotation on the field-level node, NOT on a nested
  // function - the FunctionExpression walk (method param/return types) doesn't reach field
  // types. when annotation walking is enabled (usage-global), pair the decorator walk with
  // a direct typeAnnotation sweep so `Map` / `Set` polyfills emit for `x: Map<T>` etc.
  // abstract variants get the same treatment - their type-only declarations are still signal
  function visitClassMember(path) {
    visitDecorators(path);
    if (walkAnnotations) checkTypeAnnotation(path);
  }

  return {
    ...walkAnnotations ? {
      FunctionDeclaration: checkTypeAnnotation,
      FunctionExpression: checkTypeAnnotation,
      ArrowFunctionExpression: checkTypeAnnotation,
      VariableDeclarator(path) {
        if (path.node.id?.typeAnnotation) {
          walkTypeAnnotationGlobals(path.node.id.typeAnnotation, annotationGlobal(path));
        }
      },
      CatchClause(path) {
        if (path.node.param?.typeAnnotation) {
          walkTypeAnnotationGlobals(path.node.param.typeAnnotation, annotationGlobal(path));
        }
      },
    } : {},
    Identifier: identifierVisitor,
    // `<Map />` tag-name is a runtime reference to a global constructor. skip attribute
    // names and closing-tag dupes. also accept root of `<Map.Provider.X/>` (N-deep
    // JSXMemberExpression chain) - walk the `.object` chain from path so deeper-than-2
    // namespace tags still polyfill the outer global. shared with `decoratorVisitors`
    // so JSX inside decorator expressions (`@(<Map/>) class C {}`) also triggers
    JSXIdentifier: jsxIdentifierVisitor,
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: binaryExpressionVisitor,
    Property: propertyVisitor,
    ClassDeclaration: visitDecorators,
    ClassExpression: visitDecorators,
    MethodDefinition: visitDecorators,
    PropertyDefinition: visitClassMember,
    AccessorProperty: visitClassMember,
    TSAbstractPropertyDefinition: visitClassMember,
    TSAbstractAccessorProperty: visitClassMember,
  };
}

// --- Syntax visitors ---

export function createSyntaxVisitors({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack = false }) {
  const rules = createSyntaxRules({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack });
  const onFunction = path => rules.onFunction(path.node);
  const onClass = path => rules.onClass(path.node);
  return {
    ImportExpression(path) { rules.onImportExpression(path.node); },
    FunctionDeclaration: onFunction,
    FunctionExpression: onFunction,
    ArrowFunctionExpression: onFunction,
    ForOfStatement(path) { rules.onForOfStatement(path.node); },
    ArrayPattern(path) { rules.onArrayPattern(path.node); },
    SpreadElement(path) { rules.onSpreadElement(path.node, path.parent?.type); },
    YieldExpression(path) { rules.onYieldExpression(path.node); },
    VariableDeclaration(path) { rules.onVariableDeclaration(path.node); },
    ClassDeclaration: onClass,
    ClassExpression: onClass,
  };
}
