// the syntax table shared between babel-plugin and unplugin: one named entry set per FORM, and the
// arms that map a node onto one. Both halves stay here - which set a form owes, and when the form
// is present - while the mapping from each dialect's node TYPES onto these arms belongs to the
// bindings' own visitor tables.
import { isAmbientTypeDeclaration } from './helpers/ast-patterns.js';
import { isMethodShapeMember, isPrivateMemberNode } from './resolve-node-type/ast-shapes.js';

// --- what each syntax form's downgrade actually reads ---

// The plugin's own pass sees the syntax; the DOWNGRADE that follows is what calls the built-ins,
// and it is somebody else's - babel, swc, tsc, esbuild, each with its own runtime. So the set here
// is what those runtimes read, measured by lowering the form and reading the emitted code, not what
// the form means. The babel leg additionally re-traverses helper bodies a sibling inlined into the
// program, which covers some of this by accident - but only while the helpers ARE inlined:
// `@babel/plugin-transform-runtime` imports them instead and that coverage disappears, which is why
// the rules below have to ask for the modules themselves.

// `_toConsumableArray` and its twins read `r[Symbol.iterator]` behind a `typeof Symbol` guard and
// hand the iterable to `Array.from`
const ITERABLE_SPREAD_ENTRIES = ['symbol/constructor', 'symbol/iterator', 'array/from'];
// a REST element additionally slices the array the helper materialised
const ARRAY_REST_ENTRIES = [...ITERABLE_SPREAD_ENTRIES, 'array/slice'];
// `_objectSpread2` walks `Object.getOwnPropertySymbols` - guarded, but the fallback SKIPS symbol
// keys, and a polyfilled `Symbol` is exactly what puts them there - and copies with `Object.assign`
// under the assumption that spreads set properties. What it does NOT need is
// `Object.getOwnPropertyDescriptors`: the helper falls back to copying each descriptor with the ES5
// pair, which does the same thing, so the entry would buy a module nothing reaches.
// The fallback argument has a boundary, and `Object.assign` is where it runs out: babel 7 reaches it
// through an `_extends` helper that falls back to a manual copy, while babel 8 emits the call at the
// site with nothing behind it. A set covers the union over the lowerings, so a guard in ONE of them
// retires nothing
const OBJECT_SPREAD_ENTRIES = [
  'symbol/constructor',
  'object/get-own-property-symbols',
  'object/assign',
];
// an async function owes the promise even with no `await` in it: the lowering wraps the body in
// `new Promise` and resolves each step through `Promise.resolve`
const ASYNC_ENTRIES = ['promise/constructor', 'promise/resolve'];
// the async-iterator helper additionally rejects, and reads the async-iteration well-known symbol
const ASYNC_ITERATION_ENTRIES = [...ASYNC_ENTRIES, 'promise/reject', 'symbol/async-iterator'];
// an instance private field / accessor / brand check is lowered to a `WeakMap` per field ...
const PRIVATE_FIELD_ENTRIES = ['weak-map/constructor'];
// ... and an instance private METHOD to one `WeakSet` per class, the brand it checks against
const PRIVATE_METHOD_ENTRIES = ['weak-set/constructor'];
// the named-capture-group lowering rebuilds the RegExp around a groups object held in a `WeakMap`
// and re-dispatches `Symbol.replace`, so the regexp family under it comes along - `exec` because the
// wrapper calls the original through it, `String.prototype.replace` because that is what dispatches
// to `Symbol.replace` at the call site. It re-parents the wrapper through babel's own
// `setPrototypeOf` helper, which falls back to `__proto__` and needs no polyfill of its own
const NAMED_GROUP_ENTRIES = [
  'symbol/constructor',
  'symbol/replace',
  'weak-map/constructor',
  'regexp/exec',
  'string/replace',
];
// which decorator lowering will consume these decorators is not ours to pick - babel offers seven
// `version` values and swc two more, each with a runtime of its own - and the plugin cannot verify
// an option that claimed one. So the arm asks for the union of what every known one reads; they are
// all `es/`, so a modern target filters them away and the price is paid only where the engine is
// actually missing them
const DECORATOR_RUNTIME_ENTRIES = [
  'symbol/for',
  'object/assign',
  'object/get-own-property-symbols',
  'map/constructor',
  'weak-map/constructor',
];

// the table above as DATA, so it can be MEASURED rather than only asserted by its own comments:
// `tests/polyfill-provider/syntax-set-measurement.mjs` lowers each form with the babel transform
// that owns it and reads what the helpers it inlines actually call. A set added here without a row
// there is an unmeasured set, and the measurement fails on the omission rather than skipping it
export const SYNTAX_DOWNGRADE_ENTRIES = {
  ITERABLE_SPREAD_ENTRIES,
  ARRAY_REST_ENTRIES,
  OBJECT_SPREAD_ENTRIES,
  ASYNC_ENTRIES,
  ASYNC_ITERATION_ENTRIES,
  PRIVATE_FIELD_ENTRIES,
  PRIVATE_METHOD_ENTRIES,
  NAMED_GROUP_ENTRIES,
  DECORATOR_RUNTIME_ENTRIES,
};

// a regexp literal whose pattern names a group, or back-references one
const NAMED_CAPTURE_GROUP_RE = /\(\?<[^\W\d]|\\k</;

// the pattern of a regexp literal in either dialect - babel keeps it on the node, estree in a
// `regex` bag beside the (possibly unrepresentable) value
function regexpPattern(node) {
  return node.pattern ?? node.regex?.pattern ?? null;
}

// the rules themselves, over RAW AST nodes - no framework-specific APIs, so a binding hands in
// whatever its parser produced. `createSyntaxPathHandlers` below is the same table over PATHS,
// which is what the ancestry gate needs
export function createSyntaxRules({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack = false }) {
  function injectAll(entries) {
    for (const entry of entries) injectModulesForModeEntry(entry);
  }

  // the two shapes every spread-like form resolves to. JSX spells both of them with nodes of its
  // own, and a TS or Flow twin spells them with node types of its own again, so the mapping from
  // node type to shape belongs to each binding's visitor table while the SETS live only here
  function onIterableSpreadShape() {
    injectAll(ITERABLE_SPREAD_ENTRIES);
  }

  function onObjectSpreadShape() {
    injectAll(OBJECT_SPREAD_ENTRIES);
  }

  return {
    onImportExpression(node) {
      if (isDisabled(node)) return;
      injectModulesForModeEntry(isWebpack ? 'promise/all' : 'promise/constructor');
    },
    onFunction(node) {
      if (isDisabled(node)) return;
      // `async` is a fact about the FUNCTION - it owes the promise whether or not it awaits -
      // while an `await` is a fact about its own evaluation and has an arm of its own, which is
      // what gives top-level await an owner at all
      if (node.async) {
        injectAll(node.generator ? ASYNC_ITERATION_ENTRIES : ASYNC_ENTRIES);
      } else if (node.generator) {
        injectAll(ITERABLE_SPREAD_ENTRIES);
      }
    },
    onAwaitExpression(node) {
      if (isDisabled(node)) return;
      injectAll(ASYNC_ENTRIES);
    },
    onForOfStatement(node) {
      if (isDisabled(node)) return;
      injectAll(node.await ? [...ITERABLE_SPREAD_ENTRIES, ...ASYNC_ITERATION_ENTRIES] : ITERABLE_SPREAD_ENTRIES);
    },
    onArrayPattern(node) {
      if (isDisabled(node)) return;
      // a rest element makes the helper materialise the whole iterable and slice it
      injectAll(node.elements?.some(el => el?.type === 'RestElement' || el?.type === 'RestProperty')
        ? ARRAY_REST_ENTRIES : ITERABLE_SPREAD_ENTRIES);
    },
    onSpreadElement(node, parentType) {
      if (isDisabled(node)) return;
      if (parentType === 'ObjectExpression') onObjectSpreadShape();
      else onIterableSpreadShape();
    },
    onObjectPattern(node) {
      if (isDisabled(node)) return;
      // only a REST property lowers to the object-rest helper; a plain destructure reads members
      if (node.properties?.some(p => p?.type === 'RestElement' || p?.type === 'RestProperty')) onObjectSpreadShape();
    },
    onJsxSpreadAttribute(node) {
      if (isDisabled(node)) return;
      onObjectSpreadShape();
    },
    onJsxSpreadChild(node) {
      if (isDisabled(node)) return;
      // a spread CHILD becomes a spread in the element call's argument list, which is the plain
      // iterable-spread shape and nothing more. The `[a].concat(...)` the call lowering builds
      // around it reads native `concat` over two plain arrays - `es.array.concat` is the
      // `Symbol.isConcatSpreadable` and species fix, which nothing here can reach, and the
      // ordinary call-argument spread beside this arm does not ask for it either
      onIterableSpreadShape();
    },
    onYieldExpression(node) {
      if (isDisabled(node)) return;
      if (node.delegate) onIterableSpreadShape();
    },
    onRegExpLiteral(node) {
      if (isDisabled(node)) return;
      const pattern = regexpPattern(node);
      if (pattern && NAMED_CAPTURE_GROUP_RE.test(pattern)) injectAll(NAMED_GROUP_ENTRIES);
    },
    onClassMember(node) {
      if (isDisabled(node)) return;
      // classified by the KEY, never by the node type: `ClassPrivateProperty` / `ClassPrivateMethod`
      // / `AccessorProperty` and their TS twins differ across parsers, and the key does not.
      // a STATIC private member is lowered with `Object.defineProperty` alone and owes nothing -
      // the arm exists to keep the instance sets off it
      if (!isPrivateMemberNode(node) || node.static) return;
      // a private METHOD is one brand per class, checked with a `WeakSet`; a private FIELD and a
      // private ACCESSOR are one `WeakMap` per member, holding its value. `kind` separates the two
      // in both dialects - a getter-setter pair is a member with storage, not a brand
      injectAll(isMethodShapeMember(node.type) && node.kind === 'method'
        ? PRIVATE_METHOD_ENTRIES : PRIVATE_FIELD_ENTRIES);
    },
    onVariableDeclaration(node) {
      if (isDisabled(node)) return;
      if (node.kind === 'using' || node.kind === 'await using') {
        if (node.kind === 'await using') injectModulesForModeEntry('symbol/async-dispose');
        injectModulesForModeEntry('symbol/dispose');
        injectModulesForModeEntry('suppressed-error');
      }
    },
    onClass(node) {
      if (isDisabled(node)) return;
      function hasActiveDecorator(decorators) {
        return decorators?.some(d => !isDisabled(d));
      }
      if (hasActiveDecorator(node.decorators) || node.body.body.some(el => hasActiveDecorator(el.decorators))) {
        // decorator-metadata is stage 2.7 so its modules sit outside `actual/`; inject them
        // directly to keep auto-injection working for decorators regardless of mode
        injectModulesForEntry('modules/esnext.function.metadata');
        injectModulesForEntry('modules/esnext.symbol.metadata');
        injectAll(DECORATOR_RUNTIME_ENTRIES);
      }
    },
  };
}

// does this path sit in code that reaches the output at all? a TS ambient declaration and an
// interface method signature carry real parameter and binding PATTERNS, so a downgrade set asked
// for one of them would be owed to a signature nothing ever runs. the climb is written once here:
// both legs' paths spell `.node` / `.parentPath` alike, and the two answered differently only
// because each was reaching these subtrees by a route of its own
function pathIsEmitted(path) {
  for (let current = path; current?.node; current = current.parentPath) {
    if (isAmbientTypeDeclaration(current.node)) return false;
  }
  return true;
}

// the path-level halves of the emitters' syntax visitors: each plugin maps its own dialect's
// visitor keys onto these handlers (babel's virtual `Function` / `Class` aliases and its
// parser@7 `CallExpression` import shape, estree's enumerated node types) - the bodies stay
// single-sourced here. `rules` is exposed for the one babel branch that dispatches manually
export function createSyntaxPathHandlers(options) {
  const rules = createSyntaxRules(options);
  function on(handler) {
    return path => {
      if (pathIsEmitted(path)) handler(path);
    };
  }
  return {
    rules,
    onImportExpression: on(path => rules.onImportExpression(path.node)),
    onFunction: on(path => rules.onFunction(path.node)),
    onAwaitExpression: on(path => rules.onAwaitExpression(path.node)),
    onForOfStatement: on(path => rules.onForOfStatement(path.node)),
    onArrayPattern: on(path => rules.onArrayPattern(path.node)),
    onObjectPattern: on(path => rules.onObjectPattern(path.node)),
    onSpreadElement: on(path => rules.onSpreadElement(path.node, path.parent?.type)),
    onJsxSpreadAttribute: on(path => rules.onJsxSpreadAttribute(path.node)),
    onJsxSpreadChild: on(path => rules.onJsxSpreadChild(path.node)),
    onYieldExpression: on(path => rules.onYieldExpression(path.node)),
    onRegExpLiteral: on(path => rules.onRegExpLiteral(path.node)),
    onClassMember: on(path => rules.onClassMember(path.node)),
    onVariableDeclaration: on(path => rules.onVariableDeclaration(path.node)),
    onClass: on(path => rules.onClass(path.node)),
  };
}
