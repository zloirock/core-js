import {
  blocksUidSlot,
  unwrapParens,
  requireCallSource,
  tsRuntimeBindingName,
  walkPatternIdentifiers,
  walkWrittenIdentifiers,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { coreJSImportSubpath, moduleIdLanguage } from '@core-js/polyfill-provider/helpers/path-normalize';

// oxc's own vocabulary for what a (query-stripped, SFC-lifted) module id names. The language FACT
// is the provider's (`moduleIdLanguage`); this is its translation into the two knobs `parseSync`
// takes, and it stays in the binding because the vocabulary is the parser's. `lang` also drives the
// PRINTER, and the two must never disagree - a tree parsed as JSX printed by the non-JSX printer
// throws.
// The goal is `module` except for a CommonJS extension or explicit host, and deliberately NOT oxc's
// `unambiguous`: that decides by ESM DECLARATIONS alone, so a module whose only module-only syntax
// is a top-level `await` comes back as a script - and worse, silently reparsed, with
// `await (import(x))` becoming a CALL of something named `await`. `script` is reached instead by
// a retry after a syntax or strict-mode error. CommonJS additionally admits wrapper-only
// syntax such as a top-level return. A successful initial parse always stays.
export function sourceDialectOf(cleanId, loader, moduleType) {
  const filename = moduleIdLanguage(cleanId);
  const language = loader ? moduleIdLanguage(`input.${ loader }`) : filename;
  const jsx = language?.jsx ?? true;
  const scriptHost = moduleType === 'javascript/auto' || moduleType === 'javascript/dynamic';
  return {
    jsx,
    // An explicit host overrides the extension, as in resolveModuleFormat. Otherwise an
    // `.mjs` / `.mts` parse failure means a broken Module, not permission to retry Script.
    esm: moduleType === 'javascript/esm' || !scriptHost && (filename?.esm ?? false),
    lang: language?.ts ? (jsx ? 'tsx' : 'ts') : 'jsx',
    parseGoal: moduleType === 'javascript/dynamic'
      || moduleType !== 'javascript/esm' && filename?.script ? 'commonjs' : 'module',
  };
}

// Reserve bindings and live references across the whole source, and record writes
// separately for pure-import deduplication. A generated-looking spelling is no proof
// that an assignment belongs to the plugin: post already receives declared memos.
export function bindingNamesReducer() {
  const names = new Set();
  // names the USER writes through (plain or compound assignment) - the injector's
  // dedup-target poison: a user pure-import binding that is reassigned no longer holds the
  // polyfill, so deduping onto it would substitute the wrong value at runtime
  const assignedNames = new Set();
  function addPattern(pat) {
    walkPatternIdentifiers(pat, id => names.add(id.name));
  }
  function addWrite(id) {
    names.add(id.name);
    assignedNames.add(id.name);
  }

  function visit(node, { parentNode, underTypeAnnotation }) {
    switch (node.type) {
      case 'VariableDeclarator':
        addPattern(node.id);
        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        if (node.id) names.add(node.id.name);
        for (const p of node.params) addPattern(p);
        break;
      case 'ArrowFunctionExpression':
        for (const p of node.params) addPattern(p);
        break;
      case 'ClassDeclaration':
      case 'ClassExpression':
      case 'TSEnumDeclaration':
      case 'TSModuleDeclaration': {
        // canonical id->runtime-name: leftmost segment for a `namespace A.B {}` TSQualifiedName id,
        // `.name` for a plain Identifier id, undefined for `declare module "foo"` (StringLiteral) or
        // an anonymous class - so the StringLiteral / anonymous cases stay out of the Set
        const declName = tsRuntimeBindingName(node.id);
        if (declName) names.add(declName);
        break;
      }
      case 'CatchClause': if (node.param) addPattern(node.param); break;
      case 'ImportSpecifier':
      case 'ImportDefaultSpecifier':
      case 'ImportNamespaceSpecifier':
        names.add(node.local.name);
        break;
      // An export without a source references this module's binding; a re-export
      // names the other module's slot and does not reserve a local UID.
      case 'ExportSpecifier':
        if (node.local?.name && !parentNode?.source) names.add(node.local.name);
        break;
      case 'AssignmentExpression':
      case 'UpdateExpression':
      case 'ForInStatement':
      case 'ForOfStatement':
        // The shared write scan handles wrapped targets, patterns and loop heads.
        walkWrittenIdentifiers(node, addWrite);
        break;
      // every Identifier surfaces here - bindings already reserved via their structural case,
      // but bare references (`console.log(_ref)` where `_ref` is undeclared) land only here.
      // a NON-REFERENCE position (object-literal key, non-computed member property, statement
      // label, import/export name slot) is a source-text name, not a binding the allocator can
      // shadow: reserving it makes unplugin over-number a UID-shaped `{ _ref: 1 }` / `foo()._ref`
      // / `_ref:` one slot above babel (which reserves only real bindings + references + id-rooted
      // member keys - the latter kept via `memberKeyNamesReducer`). skip so the taken-set matches.
      // undeclared reads in user code still land here referentially and stay reserved (a plugin
      // `_ref` must not shadow a `ReferenceError`-throwing reference with a silent `undefined`)
      case 'Identifier':
        if (!underTypeAnnotation && blocksUidSlot(parentNode, node)) names.add(node.name);
        break;
    }
  }
  function result() {
    return { names, assignedNames };
  }
  return { visit, result };
}

// top-level statement mapped to the core-js source string it imports, else null.
// dispatches ESM `import` and CJS `require`/var-require shapes to their extractors
function pureImportSource(node) {
  switch (node?.type) {
    case 'ImportDeclaration': return node.source?.value?.toLowerCase() ?? null;
    case 'ExpressionStatement': return requireCallSource(node.expression)?.toLowerCase() ?? null;
    case 'VariableDeclaration':
      for (const d of node.declarations) {
        const src = requireCallSource(d.init);
        if (src) return src.toLowerCase();
      }
      return null;
    default: return null;
  }
}

// A top-level import from a configured package admits recognition of prior output.
// It is only a coarse gate: consumers still verify the sentinel's position and liveness.
// `packages` is the resolver's already-normalised list (pkg + additionalPackages, lowercased);
// resolved absolute roots count too; a relative `./vendor/` copy would not be emitted by us.
// matches a core-js import in either specifier shape - usage-pure default (`import _Map from
// "@core-js/pure/..."`) or usage-global side-effect (`import "core-js/modules/..."`) - reading
// `ImportDeclaration.source.value` regardless of shape. usage-pure emits its imports INLINE in
// `pre` (it rewrites source text, so the output must carry its own imports to stay valid if post
// bails or loses the snapshot), so this fingerprint DOES re-detect a usage-pure pre-output on a
// snapshot-lost post / cache-miss run, including its unread rest sentinels.
// usage-global still DEFERS its side-effect imports to post, so a usage-global pre-output carries
// no core-js import and isn't re-detected here; that path strands at most a missing side-effect
// polyfill. Snapshot retention preserves that deferred work.
export function hasCoreJSImport(ast, packages) {
  for (const node of ast.body) {
    const source = pureImportSource(node);
    if (!source) continue;
    if (coreJSImportSubpath(source, packages) !== null) return true;
  }
  return false;
}

// the bundlers this package supports: exactly the public entries (`<bundler>.js` / `.d.ts`, the
// `./<bundler>` export). a value outside the set degrades to generic handling with a warning.
// upstream unplugin's `framework` union is wider (it carries `unloader`), and that is not support:
// an unknown host is reported as unknown, never quietly handled as a neighbour
export const KNOWN_BUNDLERS = new Set([
  'bun',
  'esbuild',
  'farm',
  'rolldown',
  'rollup',
  'rsbuild',
  'rspack',
  'vite',
  'webpack',
]);

// dynamic `import()` chunk-loader contract: bundlers in this set implement `import(...)`
// as `Promise.all([...])` of chunk fetches, so the resolved value is itself a Promise.all
// result rather than a bare module promise. detect-syntax adds `es.promise.all` polyfill
// only for these bundlers. rspack mirrors webpack semantics by design, and rsbuild builds
// on rspack (same chunk runtime); farm uses the same Promise.all chunk envelope (per its
// upstream loader runtime). rolldown / vite / rollup return a bare module Promise
// for dynamic import and do NOT need the extra polyfill. unknown bundler value already
// drops to `false` upstream
const CHUNK_LOADER_BUNDLERS = new Set([
  'farm',
  'rsbuild',
  'rspack',
  'webpack',
]);

// the chunk-loader contract above, asked by bundler name; an unknown or absent name has none
export function isChunkLoaderBundler(bundler) {
  return CHUNK_LOADER_BUNDLERS.has(bundler);
}

// strip ALL leading U+FEFF (Byte Order Mark) characters. a single-strip would leave
// residual BOM bytes mid-prefix when a sibling plugin's per-pass BOM prepend stacks
// on top of ours, or when source is malformed multi-BOM. returns the BOM-free string;
// callers track whether a BOM was present (via a separate `charCodeAt(0)` check before
// stripping) so `sourcesContent` can keep the user's original bytes - the OUTPUT never
// re-emits a BOM
export function stripLeadingBOMs(code) {
  let i = 0;
  while (code.charCodeAt(i) === 0xFEFF) i++;
  return i === 0 ? code : code.slice(i);
}

// TODO: Remove once optional-chaining transforms before Babel 7.29.13 / 8.1.0 are unsupported.
// The later transformer is supplied by the bundler. Older Babel loses the receiver of
// `(obj.method<T>)?.()`; moving the type arguments onto the call exposes the member to it.
export function optionalCallInstantiationCallee(node) {
  if (node?.type !== 'CallExpression' || !node.optional) return null;
  const callee = unwrapParens(node.callee);
  if (callee?.type !== 'TSInstantiationExpression') return null;
  if (!(callee.typeArguments ?? callee.typeParameters)) return null;
  // An ordinary name has no receiver. Keep eval indirect and compound callees grouped
  // even if the next stage uses an older Babel generator before lowering the call.
  const target = unwrapParens(callee.expression);
  return target.type === 'Identifier' && target.name !== 'eval' ? null : callee;
}
