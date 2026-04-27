// detect polyfillable usage patterns (usage-global and usage-pure modes)
import { buildDestructuringInitMeta } from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  checkLogicalAssignLhsGlobal,
  checkLogicalAssignLhsMember,
  isKnownGlobalName,
} from '@core-js/polyfill-provider/detect-usage/globals';
import { checkTypeAnnotations, walkTypeAnnotationGlobals } from '@core-js/polyfill-provider/detect-usage/annotations';
import {
  createSelfRefVarGuard,
  resolveKey as sharedResolveKey,
  resolveObjectName as sharedResolveObjectName,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { handleBinaryIn, handleMemberExpressionNode } from '@core-js/polyfill-provider/detect-usage/members';
import { createSyntaxRules } from '@core-js/polyfill-provider/detect-syntax';
import {
  TS_EXPR_WRAPPERS,
  findIifeArgForParam,
  findTSRuntimeBindingInPath,
  flattenableHostSlot,
  isASTNode,
  isAmbientBindingShape,
  isClassifiableReceiverArg,
  isFunctionParamDestructureParent,
  isInUpdateOperand,
  isMemberWriteOnlyContext,
  isTSTypeOnlyIdentifierPath,
  resolveCallArgument,
  unwrapInitValue,
  unwrapParens,
  walkPatternIdentifiers,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { POSSIBLE_GLOBAL_OBJECTS } from '@core-js/polyfill-provider/helpers/class-walk';

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
function isReferenced(node, parent, parentKey, parentPath, skipUpdateTargets) {
  if (!parent) return true;
  // TS type-only positions: `type X = …` ids, `export { type X }` specifiers
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
  // shared write-only context filter: pure `x = y` / destructure-LHS / AssignmentPattern.left.
  // covers Identifier and MemberExpression positions; compound (`x += y`) excluded so member-LHS
  // can still emit (read fires first)
  if (isMemberWriteOnlyContext(node, parent, parentPath?.parent)) return false;
  // Identifier LHS of compound assignment (`Map ||= X` / `Map += 1`) - polyfill substitutes
  // bare global with a read-only import binding, so assigning throws regardless of operator.
  // member LHS with compound is allowed through (read fires before write)
  if (parent.type === 'AssignmentExpression' && parentKey === 'left' && node.type === 'Identifier') return false;
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
  if (!(scope?.hasBinding?.(name) ?? false)) {
    return hasTSRuntimeBinding(scope, name, path);
  }
  // hasBinding=true; for real scopes where getBinding is also available, filter out ambient
  // TS-only declarations. stub scopes (`detectEntries` shadowScope) don't expose getBinding -
  // their hasBinding=true is authoritative
  const native = scope?.getBinding?.(name);
  return !(native && isAmbientBinding(native));
}

export const estreeAdapter = {
  hasBinding: (scope, name, path = null) => hasRuntimeBinding(scope, name, path),
  getBinding(scope, name) {
    const b = scope?.getBinding(name);
    if (!b) return null;
    // `importSource` is part of the adapter contract: `resolveKey` in polyfill-provider
    // needs it to recognise `import X from '.../symbol/<name>'` as Symbol.X. exposing the
    // raw module source at this interface is deliberate - not a leak, just the minimum
    // parser-agnostic info the provider requires to infer well-known symbol imports
    let importSource = null;
    if (IMPORT_SPECIFIER_TYPES.has(b.path.node?.type)) {
      importSource = b.path.parent?.source?.value ?? null;
    }
    return { node: b.path.node, constantViolations: b.constantViolations, importSource };
  },
  getBindingNodeType: (scope, name) => scope?.getBinding(name)?.path?.node?.type ?? null,
  // oxc-parser preserves `ParenthesizedExpression`; unwrap so `require(('x'))` /
  // `import(('x'))` survive the ESTree->string translation
  isStringLiteral: node => isLiteralString(unwrapParens(node)),
  getStringValue: node => {
    const inner = unwrapParens(node);
    return isLiteralString(inner) ? inner.value : null;
  },
};

const isLiteralString = node => node?.type === 'Literal' && typeof node.value === 'string';

function resolveKey(node, computed, scope) {
  return sharedResolveKey(node, computed, scope, estreeAdapter);
}

// --- Destructuring ---

function extractPropertyKey(propNode, scope) {
  if (!propNode.computed) {
    return propNode.key.type === 'Identifier' ? propNode.key.name
      : estreeAdapter.isStringLiteral(propNode.key) ? propNode.key.value
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
      }
      break;
    case 'Property': {
      // nested pattern `{ Array: { from } } = globalThis` - inner Property's outer chain:
      // Property -> ObjectPattern -> VariableDeclarator. resolve outer init; if proxy-global,
      // return structured meta with outer key as receiver and inner as key.
      // peel ParenthesizedExpression + SequenceExpression tails so `(se(), globalThis)` init
      // still resolves to the proxy-global receiver (parity with non-nested destructure)
      const outerPattern = parent.parentPath;
      const outerHost = outerPattern?.parentPath;
      // shared `flattenableHostSlot` returns 'init' for VariableDeclarator, 'right' for
      // AssignmentExpression-in-ExpressionStatement (peeling oxc's preserved parens),
      // null otherwise. AssignmentPattern excluded - see helper docstring
      const slot = flattenableHostSlot(outerHost?.node, outerHost);
      const receiverNode = slot ? outerHost.node[slot] : null;
      if (outerPattern?.node?.type === 'ObjectPattern' && receiverNode) {
        const outerInit = unwrapInitValue(receiverNode);
        const receiver = outerInit
          ? sharedResolveObjectName(outerInit, outerHost.scope ?? scope, estreeAdapter)
          : null;
        if (receiver && POSSIBLE_GLOBAL_OBJECTS.has(receiver)) {
          const innerKey = extractPropertyKey(propNode, scope);
          const outerKey = sharedResolveKey(parent.node.key, parent.node.computed, outerHost.scope ?? scope, estreeAdapter);
          if (innerKey && outerKey) {
            return { kind: 'property', object: outerKey, key: innerKey, placement: 'static' };
          }
        }
      }
      break;
    }
    case 'ForOfStatement':
    case 'ForInStatement':
    case 'ArrayPattern':
    case 'RestElement':
    case 'CatchClause': break;
    default: {
      // IIFE destructuring: !function ({ entries }) {} (Object). also covers TS-wrapped
      // callees `((arrow) as any)(Object)` and ChainExpression-wrapped optional call sites
      const funcNode = parent.node;
      if (funcNode.type === 'FunctionExpression' || funcNode.type === 'ArrowFunctionExpression') {
        const paramIndex = funcNode.params?.indexOf(objectPattern.node);
        if (paramIndex >= 0) {
          let callPath = parent.parentPath;
          while (callPath?.node && (callPath.node.type === 'UnaryExpression'
            || callPath.node.type === 'SequenceExpression'
            || callPath.node.type === 'ParenthesizedExpression'
            || callPath.node.type === 'ChainExpression'
            || TS_EXPR_WRAPPERS.has(callPath.node.type))) {
            callPath = callPath.parentPath;
          }
          const callNode = callPath?.node;
          if (callNode?.type === 'NewExpression' || callNode?.type === 'CallExpression') {
            initNode = resolveCallArgument(callNode.arguments ?? [], paramIndex);
          }
        }
      }
      if (!initNode) return null;
    }
  }

  const key = extractPropertyKey(propNode, scope);
  if (!key) return null;
  return buildDestructuringInitMeta(initNode, key, scope, estreeAdapter);
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
function makeSynthPath(node, parent, parentKey, parentPath, scope, listKey = null, container = null) {
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
        ? value.map((el, i) => makeSynthPath(el, node, i, self, scope, key, value))
        : makeSynthPath(value ?? null, node, key, self, scope, null, node);
      childCache.set(key, result);
      return result;
    },
  };
  return self;
}

// frame scope for an inline function inside a decorator - locals shadow parentScope
function makeFrameScope(parentScope, localDecls) {
  const bindingCache = new Map();
  const frame = {
    hasBinding: name => localDecls.has(name) || (parentScope?.hasBinding(name) ?? false),
    getBinding: name => {
      const local = localDecls.get(name);
      if (!local) return parentScope?.getBinding?.(name) ?? null;
      let binding = bindingCache.get(name);
      if (!binding) {
        binding = { constant: local.constant, path: makeSynthPath(local.node, null, null, null, frame) };
        bindingCache.set(name, binding);
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

function collectFunctionLocals(fnNode) {
  const cached = LOCALS_CACHE.get(fnNode);
  if (cached) return cached;
  const locals = new Map();
  // params marked constant so resolve-node-type follows typeAnnotation
  for (const param of fnNode.params || []) {
    walkPatternIdentifiers(param, id => locals.set(id.name, { constant: true, node: param }));
  }
  if (fnNode.id?.name) locals.set(fnNode.id.name, { constant: true, node: fnNode });
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    // hoisted `function foo()` binds in the enclosing function scope; register the
    // name, then skip the body (new scope) as with any function-like
    if (node.type === 'FunctionDeclaration') {
      if (node.id?.name) locals.set(node.id.name, { constant: true, node });
      return;
    }
    if (FUNCTION_NODE_TYPES.has(node.type)) return;
    if (node.type === 'VariableDeclaration') {
      const constant = node.kind === 'const';
      for (const d of node.declarations) {
        walkPatternIdentifiers(d.id, id => locals.set(id.name, { constant, node: d }));
      }
    } else if (node.type === 'ClassDeclaration' && node.id?.name) {
      locals.set(node.id.name, { constant: true, node });
    } else if (node.type === 'CatchClause' && node.param) {
      // catch-binding is block-scoped but close enough: flat frame-locals only need
      // "does this name shadow the global" for polyfill-lookup suppression
      walkPatternIdentifiers(node.param, id => locals.set(id.name, { constant: false, node: node.param }));
    }
    forEachChildNode(node, walk);
  }
  if (fnNode.body) walk(fnNode.body);
  LOCALS_CACHE.set(fnNode, locals);
  return locals;
}

function walkSubtree(node, parent, parentKey, parentPath, scope, visitors, listKey = null, container = null) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
  const childScope = FUNCTION_NODE_TYPES.has(node.type)
    ? makeFrameScope(scope, collectFunctionLocals(node))
    : scope;
  const synthPath = makeSynthPath(node, parent, parentKey, parentPath, childScope, listKey, container);
  visitors[node.type]?.(synthPath);
  forEachChildNode(node, (child, childKey, childListKey, childContainer) => {
    walkSubtree(child, node, childKey, synthPath, childScope, visitors, childListKey, childContainer);
  });
}

function walkDecoratorList(decorators, parentPath, decoratorVisitors) {
  if (!decorators?.length) return;
  for (let i = 0; i < decorators.length; i++) {
    walkSubtree(decorators[i], parentPath.node, i, parentPath, parentPath.scope, decoratorVisitors, 'decorators', decorators);
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

// --- Usage visitors ---

export function createUsageVisitors({
  onUsage, onWarning, method, suppressProxyGlobals = false, walkAnnotations = true, isEntryAvailable,
}) {
  // only usage-pure rewrites global identifiers to named import bindings (which are frozen).
  // usage-global injects side-effect imports and leaves the identifier alone, so `Map++`
  // must polyfill - otherwise `Map` ReferenceError's in engines where the native is missing
  const skipUpdateTargets = method === 'usage-pure';
  const handledObjects = new WeakSet();
  // estree-toolkit doesn't expose `binding.kind` - walk up to the enclosing VariableDeclaration
  const isSelfRefVarBinding = createSelfRefVarGuard(
    b => (b?.path?.parent ?? b?.path?.parentPath?.node)?.kind,
  );

  const annotationGlobal = path => name => {
    if (estreeAdapter.hasBinding(path.scope, name)) return;
    onUsage({ kind: 'global', name }, path);
  };

  function identifierVisitor(path) {
    const { node, parent, key: parentKey } = path;
    // `isReferenced` returns false for write-context leaves like `Map ||= X`; diagnose the
    // pattern before the early return so users see why nothing was polyfilled
    if (onWarning) {
      const warning = checkLogicalAssignLhsGlobal(node, parent, estreeAdapter.hasBinding(path.scope, node.name));
      if (warning) onWarning(warning);
    }
    if (!isReferenced(node, parent, parentKey, path.parentPath, skipUpdateTargets)) return;
    // re-export: export { Promise } from 'foo' - local is not a reference when source is present
    if (parent?.type === 'ExportSpecifier' && parentKey === 'local'
      && path.parentPath?.parentPath?.node?.source) return;
    if (estreeAdapter.hasBinding(path.scope, node.name, path)) {
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
    if (onWarning) {
      const warning = checkLogicalAssignLhsMember(node, parent, path.scope, estreeAdapter);
      if (warning) onWarning(warning);
    }
    if (handledObjects.has(node)) return;
    if (!isReferenced(node, parent, parentKey, path.parentPath, skipUpdateTargets)) return;
    const meta = handleMemberExpressionNode(node, path.scope, estreeAdapter, handledObjects, suppressProxyGlobals);
    if (meta) onUsage(meta, path);
  }

  function binaryExpressionVisitor(path) {
    const meta = handleBinaryIn(path.node, path.scope, estreeAdapter, handledObjects, isEntryAvailable);
    if (meta) onUsage(meta, path);
  }

  // Property visitor is shared: top-level destructure bindings and decorator-arg patterns
  // both need `buildDestructuringMeta` to route polyfillable receivers through synth-swap.
  // decorator walk must include it explicitly - `walkSubtree`'s visitor lookup is keyed by
  // node type, and without the entry the decorator subtree never reaches destructure handling
  const propertyVisitor = path => {
    if (path.node.method || path.parent?.type !== 'ObjectPattern') return;
    const meta = buildDestructuringMeta(path.node, path.parentPath);
    if (meta) onUsage(meta, path);
  };
  const decoratorVisitors = {
    Identifier: identifierVisitor,
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: binaryExpressionVisitor,
    Property: propertyVisitor,
  };
  const visitDecorators = path => walkDecorators(path, decoratorVisitors);
  const checkTypeAnnotation = path => checkTypeAnnotations(path.node, annotationGlobal(path));

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
    // namespace tags still polyfill the outer global
    JSXIdentifier(path) {
      const isOpeningTagName = path.parent?.type === 'JSXOpeningElement' && path.key === 'name';
      let isMemberRoot = false;
      if (!isOpeningTagName) {
        let cur = path;
        while (cur?.parent?.type === 'JSXMemberExpression' && cur.parent.object === cur.node) {
          cur = cur.parentPath;
        }
        isMemberRoot = cur !== path && cur?.parent?.type === 'JSXOpeningElement' && cur.key === 'name';
      }
      if (!isOpeningTagName && !isMemberRoot) return;
      if (estreeAdapter.hasBinding(path.scope, path.node.name)) return;
      onUsage({ kind: 'global', name: path.node.name }, path);
    },
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: binaryExpressionVisitor,
    Property: propertyVisitor,
    ClassDeclaration: visitDecorators,
    ClassExpression: visitDecorators,
    MethodDefinition: visitDecorators,
    PropertyDefinition: visitDecorators,
    AccessorProperty: visitDecorators,
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
