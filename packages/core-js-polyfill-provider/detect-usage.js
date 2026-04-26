// shared usage detection for babel-plugin and unplugin. all functions accept raw AST nodes
// + scope + adapter to abstract Babel vs ESTree differences.
//
// scope adapter interface:
//   hasBinding(scope, name)         -> boolean
//   getBinding(scope, name)         -> { node, constantViolations } | null
//   getBindingNodeType(scope, name) -> string | null
//   isStringLiteral(node)           -> boolean
//   getStringValue(node)            -> string | null
//
// implementation split across `detect-usage/` submodules for cohesion:
//   - globals: known global names + logical-assign LHS diagnostics
//   - resolve: AST-pattern resolvers (resolveKey / resolveObjectName / patternBindingName /
//     findProxyGlobal / createSelfRefVarGuard) + Symbol-ref helpers + binding-to-global
//   - members: MemberExpression + `key in obj` BinaryExpression handlers
//   - destructure: destructure-receiver detection + branch analysis (fromFallback)
//   - annotations: TS / Flow type-annotation detection + isPolyfillableOptional
//   - entries: getEntrySource + scanExistingCoreJSImports
import { resolveCallArgument as sharedResolveCallArgument } from './helpers.js';

// re-export so external callers (babel-plugin / unplugin internals) keep importing from
// here. canonical home is `helpers/ast-patterns.js`
export const resolveCallArgument = sharedResolveCallArgument;

export {
  isKnownGlobalName,
  checkLogicalAssignLhsGlobal,
  checkLogicalAssignLhsMember,
} from './detect-usage/globals.js';

export {
  patternBindingName,
  resolveObjectName,
  resolveKey,
  createSelfRefVarGuard,
  findProxyGlobal,
} from './detect-usage/resolve.js';

export {
  handleMemberExpressionNode,
  resolveSymbolInEntry,
  resolveSymbolIteratorEntry,
  handleBinaryIn,
} from './detect-usage/members.js';

export {
  buildDestructuringInitMeta,
  isViableBranchForKey,
  enumerateFallbackDestructureBranches,
  canTransformDestructuring,
} from './detect-usage/destructure.js';

export {
  isTypeAnnotationNodeType,
  walkTypeAnnotationGlobals,
  isPolyfillableOptional,
  checkTypeAnnotations,
} from './detect-usage/annotations.js';

export {
  getEntrySource,
  scanExistingCoreJSImports,
} from './detect-usage/entries.js';
