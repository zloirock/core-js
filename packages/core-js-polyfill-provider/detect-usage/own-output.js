// recognition of the plugins' OWN OUTPUT: a pass over a file a prior pass (either
// emitter, either plugin, any config) already transformed must not claim the spellings
// that pass deliberately left - or the file grows per pass. every census here answers one
// such spelling by SHAPE, injector-free where it can (prepasses run before any injector
// exists), and takes the `isPureImportSource` test bound to the active package via
// `pureImportSourceTest`. semantics live here so both plugins' dispatchers gate on the
// same family; the emitters only bind their injector state
import { entryToGlobalHint, hasOwnStaticDefinition } from '../index.js';
import { ORPHAN_REF_PATTERN, UNUSED_NAME_PATTERN } from '../injector-base.js';
import { isSourcedSymbolIteratorMeta } from './members.js';
import { PATTERN_CHAIN_TYPES } from './destructure.js';
import {
  patternSlotTarget,
  POSSIBLE_GLOBAL_OBJECTS,
  SKIPPABLE_WRAPPER_TYPES,
  blocksUidSlot,
  defaultImportSourcesOf,
  destructureReceiverSlot,
  foldedPropertyKeyName,
  kebabToCamel,
  memberKeyName,
  pureImportEntryOf,
  pureImportSourceEntry,
  requireCallSource,
  rootProgramOf,
  staticMemberFromEntrySegment,
  statementListOf,
  tsImportEqualsRequireSource,
  unwrapExportedDeclaration,
  unwrapRuntimeExpr,
} from '../helpers/ast-patterns.js';

// the full test bag the censuses take, bound to a live injector: the source test plus the
// own-pass exclusion (a name THIS pass minted is a sibling emission, not a prior pass's).
// memoized per injector (one per file) - the bag also carries the per-program shape gate
// below, so a raw file pays no census cost at all
const TESTS_BY_INJECTOR = new WeakMap();
export function ownOutputTests(injector) {
  let tests = TESTS_BY_INJECTOR.get(injector);
  if (!tests) {
    const shapeByProgram = new WeakMap();
    tests = {
      isPureImportSource: pureImportSourceTest(injector.pkg),
      isOwnPassBinding: name => injector.isOwnPassPureBinding(name),
      isOwnPassName: name => injector.isOwnPassGeneratedName?.(name) === true,
      // may this program hold ANY own-output spelling? every census bottoms out in a
      // prior-pass pure binding or an adopted `_refN` declaration at the program root -
      // a file with neither answers every census false, so the funnels skip the family
      // wholesale (the scan runs once per file, not per claim)
      programMayHoldOwnOutput(rootNode) {
        let may = shapeByProgram.get(rootNode);
        if (may === undefined) {
          may = false;
          for (const stmt of rootNode?.body ?? []) {
            // the export wrapper / modifier changes nothing about what the binding holds
            const decl = unwrapExportedDeclaration(stmt);
            if (decl?.type === 'ImportDeclaration' && tests.isPureImportSource(decl.source?.value ?? '')) {
              may = true;
              break;
            }
            // the TS `import x = require(...)` spelling of the same binding
            if (decl?.type === 'TSImportEqualsDeclaration'
              && tests.isPureImportSource(tsImportEqualsRequireSource(decl) ?? '')) {
              may = true;
              break;
            }
            if (decl?.type !== 'VariableDeclaration') continue;
            for (const declarator of decl.declarations) {
              if (declarator.id?.type !== 'Identifier') continue;
              if (!declarator.init && ORPHAN_REF_PATTERN.test(declarator.id.name)) {
                may = true;
                break;
              }
              const required = requireCallSource(declarator.init);
              if (required !== null && tests.isPureImportSource(required)) {
                may = true;
                break;
              }
              // ... and a binding wearing the MINTED spelling with no import behind it at all: a
              // bundler rewrote that import into its own module call, and the name is the only thing
              // this file keeps of it - without this the whole family skips a bundled re-pass
              if (declarator.init && mintedNameTarget(declarator.id.name)?.member) {
                may = true;
                break;
              }
            }
            if (may) break;
          }
          shapeByProgram.set(rootNode, may);
        }
        return may;
      },
    };
    TESTS_BY_INJECTOR.set(injector, tests);
  }
  return tests;
}

// the source test every census takes, bound to the configured package root: our own
// channels write the package's own specifier, and a PRIOR config's output (another package
// alias or `mode` flavor) still reads as pure by its flavor segment - the same rule the
// provider's binding resolution uses
function pureImportSourceTest(pkg) {
  return function isPureImportSource(source) {
    // the package match stops at a segment boundary - `${pkg}-extras/...` is a foreign name
    return source === pkg || source.startsWith(`${ pkg }/`) || pureImportSourceEntry(source) !== null;
  };
}

// is `name` bound by a DEFAULT import (or require binding) of the pure package at the
// program root - the one spelling our own channels write. shared by the overwrite-rebind
// and substituted-default censuses; the binding table is the program's one index of those
function pureDefaultImportBinding(path, name, { isPureImportSource, isOwnPassBinding }) {
  const source = defaultImportSourcesOf(rootProgramOf(path)).get(name) ?? null;
  return source !== null && !isOwnPassBinding?.(name) && isPureImportSource(source);
}

// the SUBSTITUTED DEFAULT a prior pass left in place (`({ [(se, 'k')]: f = _X } = R)` -
// the prop's default IS the pure import): re-claiming it re-extracts a sentinel and a
// degenerate guard per pass. constrained to COMPUTED keys - the one position our
// SE-key-assign route leaves this spelling in
function defaultHoldsPureImport(path, tests) {
  const prop = path.node;
  if (!prop?.computed || prop.value?.type !== 'AssignmentPattern') return false;
  const right = unwrapRuntimeExpr(prop.value.right);
  if (right?.type !== 'Identifier') return false;
  return pureDefaultImportBinding(path, right.name, tests);
}

// the (global, member) a MINTED NAME spells, read back where the import that bound it is no longer
// visible: a bundler rewrites every import into its own module call, so a pass over bundled output
// sees the binding by name alone and the whole own-output family went blind there - the guard it
// wrote was re-claimed and nested one level per pass. the name is enough to say WHICH read it stands
// for, and the definitions confirm it names a real one; the three-way agreement the caller then owes
// is the same one an import-backed spelling owes, so a user binding wearing the shape decides nothing
const MINTED_STATIC_NAME = /^_+(?<global>[A-Z]\w*)\$(?<member>\w+)$/u;
const MINTED_CTOR_NAME = /^_+(?<global>[A-Z]\w*)$/u;
function mintedNameTarget(name) {
  const statik = MINTED_STATIC_NAME.exec(name ?? '');
  if (statik) {
    const { global, member } = statik.groups;
    return hasOwnStaticDefinition(global, member) ? { global, member } : null;
  }
  const ctor = MINTED_CTOR_NAME.exec(name ?? '');
  return ctor ? { global: ctor.groups.global, member: null } : null;
}

// the (global, member) a pure entry names - `array/of` -> Array + `of`, a family entry
// (`map`, `map/constructor`) naming the global with no member of its own. the segment split
// is the injector's, so a member whose spelling the kebab head cannot carry reads the same
function entryGuardTarget(entry) {
  const family = entryToGlobalHint(entry);
  if (family !== null) return { global: family, member: null };
  const segments = typeof entry === 'string' ? entry.split('/') : [];
  const global = segments.length < 2 ? null : entryToGlobalHint(segments.at(-2));
  return global === null ? null : { global, member: staticMemberFromEntrySegment(global, segments.at(-1)) };
}

// the read a guard's alternate keeps, peeled to `<bare receiver>.<member>` through the
// composition our render leaves above it (`h.from.bind(h)`, `h?.groupBy`, a TS wrapper)
function guardedReadLeaf(node) {
  for (let cur = unwrapRuntimeExpr(node); cur;) {
    if (cur.type === 'CallExpression' || cur.type === 'OptionalCallExpression') {
      cur = unwrapRuntimeExpr(cur.callee);
      continue;
    }
    if (cur.type !== 'MemberExpression' && cur.type !== 'OptionalMemberExpression') return null;
    const object = unwrapRuntimeExpr(cur.object);
    if (object?.type === 'Identifier') {
      const member = memberKeyName(cur);
      return member === null ? null : { receiver: object.name, member };
    }
    cur = object;
  }
  return null;
}

// does this conditional's TEST already settle the alternate's claim? our shadow-alias render is
// `h === Ctor ? _X : h.of`, and what makes the alternate off limits is the test, not the member: on
// that arm `h` is provably NOT the global `_X` was minted for, so a claim there would polyfill a
// value that global's polyfill has nothing to do with - our own kept read and a foreign member
// under the same test alike. a test against ANOTHER global settles nothing: `h` may still be this
// one, and the alternate keeps its claim
function ownGuardRenderShape(conditional, path) {
  const consequent = unwrapRuntimeExpr(conditional.consequent);
  if (consequent?.type !== 'Identifier') return false;
  const target = entryGuardTarget(pureImportEntryOf(path, consequent.name))
    ?? mintedNameTarget(consequent.name);
  if (target === null) return false;
  const read = guardedReadLeaf(conditional.alternate);
  if (read === null) return false;
  const test = unwrapRuntimeExpr(conditional.test);
  if (test?.type !== 'BinaryExpression' || test.operator !== '===') return false;
  const left = unwrapRuntimeExpr(test.left);
  const right = unwrapRuntimeExpr(test.right);
  // the render spells the receiver first, but the test is symmetric - take whichever side is it
  const against = left?.type === 'Identifier' && left.name === read.receiver ? right
    : right?.type === 'Identifier' && right.name === read.receiver ? left : null;
  if (against?.type !== 'Identifier') return false;
  // a global core-js never replaces is tested against its BARE name, a replaced one against
  // the minted constructor binding
  // An inherited pre+post import can still belong to this injector. The completed
  // identity test protects its raw arm regardless of which pass allocated the import.
  const entry = pureImportEntryOf(path, against.name);
  const compared = entry === null
    ? mintedNameTarget(against.name)?.global ?? against.name : entryGuardTarget(entry)?.global;
  // A realm guard substitutes the GLOBAL itself rather than one of its statics.
  // Its raw branch still owes the selected object's property or nullish TypeError.
  return target.member === null
    ? POSSIBLE_GLOBAL_OBJECTS.has(compared) && read.member === target.global
    : compared === target.global;
}

// the raw read OUR shadow-alias guard deliberately keeps (`h === Ctor ? _X : h.of` - the
// alternate reads the shadowed value): a pass over our own output must not claim it again,
// or the guard nests one level per pass
function guardedAliasAlternateRead(path) {
  // the read may sit DEEPER in the alternate (`h === Ctor ? _X : h.from.bind(h)` claims
  // `h.from`): climb the expression composition to the guard, then ask whose arm we rode
  let cur = path;
  for (let up = cur.parentPath; up?.node; cur = up, up = up.parentPath) {
    const parent = up.node;
    if (parent.type === 'ConditionalExpression') {
      return parent.alternate === cur.node && ownGuardRenderShape(parent, path);
    }
    if (parent.type !== 'MemberExpression' && parent.type !== 'OptionalMemberExpression'
      && parent.type !== 'CallExpression' && !SKIPPABLE_WRAPPER_TYPES.has(parent.type)) return false;
  }
  return false;
}

// an INSTANCE claim over an adopted GENERATED REF (`_ref.slice(1)` where `_ref` memoizes a
// value the first pass already typed and adjudicated): the raw spelling IS the verdict -
// re-claiming through the ref's unknown type would upgrade it to a maybe-dispatch
function adoptedRefReceiverClaim(node, path, tests = null) {
  const receiver = unwrapRuntimeExpr(node?.object);
  if (receiver?.type !== 'Identifier' || !ORPHAN_REF_PATTERN.test(receiver.name)) return false;
  // a `_refN` THIS pass minted is a sibling emission's memo, not an adopted prior verdict
  if (tests?.isOwnPassName?.(receiver.name)) return false;
  for (const stmt of rootProgramOf(path)?.body ?? []) {
    if (stmt.type !== 'VariableDeclaration' || stmt.kind !== 'var') continue;
    for (const declarator of stmt.declarations) {
      if (declarator.id?.type === 'Identifier' && declarator.id.name === receiver.name && !declarator.init) return true;
    }
  }
  return false;
}

// the PATTERN default a prior pass substituted (`function f({ P } = _globalThis)` - the
// root swapped in place, the props deliberately left reading through it): a pass over our
// own output must not re-decide the pattern's claims - the ownership verdict already stood
function patternDefaultHoldsPureImport(path, tests) {
  const pattern = path.parentPath?.node;
  const wrapper = path.parentPath?.parentPath;
  if (pattern?.type !== 'ObjectPattern' || wrapper?.node?.type !== 'AssignmentPattern'
    || wrapper.node.left !== pattern) return false;
  const right = unwrapRuntimeExpr(wrapper.node.right);
  if (right?.type !== 'Identifier') return false;
  return pureDefaultImportBinding(path, right.name, tests);
}

// a COMPUTED member whose key is a minted pure import (`[1, 2][_Symbol$iterator]` - the
// symbol read our pass left through its own binding): re-claiming it re-resolves the alias
// and upgrades the kept spelling (`_getIteratorMethod([1, 2])`) on a pass over our output
// ... except, for a MEMBER read (`readOfIteratorIsNotOurs`), the ITERATOR key: the iterator
// method's render is the helper itself, never the key spelling, so a read keyed by a prior
// pass's `symbol/iterator` import is a pattern key a LOWERING turned into a read (the babel
// sandwich lowers a kept `[_Symbol$iterator]: it` prop into `it = o[_Symbol$iterator]`) - and
// standing down left that read raw, undefined where the engine has no native iterator. the
// handler's own gates (`super`, a write target, an entry the targets do not need) answer the
// same way on every pass, so the fixpoint needs no census there. a PATTERN prop keeps the
// census: its spelling IS our render
function computedKeyIsMintedImport(node, path, tests, { readOfIteratorIsNotOurs = false } = {}) {
  if (!node?.computed) return false;
  // a MemberExpression spells its key as `.property`, a destructure Property as `.key` -
  // and an SE-bearing key reads its VALUE from the sequence tail (`[(se, _Symbol$iterator)]`)
  let key = unwrapRuntimeExpr(node.property ?? node.key);
  while (key?.type === 'SequenceExpression') key = unwrapRuntimeExpr(key.expressions.at(-1));
  if (key?.type !== 'Identifier' || !pureDefaultImportBinding(path, key.name, tests)) return false;
  return !readOfIteratorIsNotOurs
    || pureImportSourceEntry(defaultImportSourcesOf(rootProgramOf(path)).get(key.name)) !== 'symbol/iterator';
}

// the RENDERED GUARD spelling our collapse writes (`null == probe ? void 0 : _x.tail`):
// a receiver carrying one is our own prior output - a fresh claim over it re-upgrades a
// settled verdict (the same census family as `navHoldsMintedSeCall`, for the guard shape)
function navHoldsRenderedGuard(objectNode, path, tests) {
  const stack = [objectNode];
  while (stack.length) {
    const cur = unwrapRuntimeExpr(stack.pop());
    if (!cur || typeof cur !== 'object' || !cur.type) continue;
    if (cur.type === 'ConditionalExpression') {
      const test = unwrapRuntimeExpr(cur.test);
      const consequent = unwrapRuntimeExpr(cur.consequent);
      const nullCompare = test?.type === 'BinaryExpression' && test.operator === '=='
        && (test.left?.value === null || test.right?.value === null
          || test.left?.type === 'NullLiteral' || test.right?.type === 'NullLiteral');
      const voidZeroArm = consequent?.type === 'UnaryExpression' && consequent.operator === 'void';
      if (nullCompare && voidZeroArm) {
        let leaf = unwrapRuntimeExpr(cur.alternate);
        while (leaf?.type === 'MemberExpression' || leaf?.type === 'OptionalMemberExpression') {
          leaf = unwrapRuntimeExpr(leaf.object);
        }
        if (leaf?.type === 'Identifier' && pureDefaultImportBinding(path, leaf.name, tests)) return true;
      }
      stack.push(cur.test, cur.consequent, cur.alternate);
      continue;
    }
    if (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') {
      stack.push(cur.object);
      if (cur.computed) stack.push(cur.property);
      continue;
    }
    if (cur.type === 'SequenceExpression' || cur.type === 'TemplateLiteral') {
      stack.push(...cur.expressions ?? []);
      continue;
    }
    // a STORE hands the guard on as its value (`(held = null == probe ? void 0 : _x.tail).m`), the
    // same carrier the minted-SE census next door already walks: read without it, the receiver's
    // own render read as somebody else's spelling and the claim came back on the next pass
    if (cur.type === 'AssignmentExpression') {
      stack.push(cur.right);
      continue;
    }
    if (cur.type === 'LogicalExpression' || cur.type === 'BinaryExpression') stack.push(cur.left, cur.right);
  }
  return false;
}

// does the receiver spine carry a MINTED pure-call side effect (a sequence prefix or a
// computed key holding `_x(...)` bound to a pure default import)? that spelling is our own
// prior pass's output: its pending claims are spent, and a fresh claim over it would
// UPGRADE a verdict the first pass settled (`(push, _globalThis)[key]?.tail` collapsed on
// the second pass where the first deliberately kept the source `?.`)
export function navHoldsMintedSeCall(objectNode, path, tests) {
  const stack = [objectNode];
  while (stack.length) {
    const cur = unwrapRuntimeExpr(stack.pop());
    if (!cur || typeof cur !== 'object') continue;
    if (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') {
      stack.push(cur.object);
      if (cur.computed) stack.push(cur.property);
      continue;
    }
    if (cur.type === 'SequenceExpression') {
      stack.push(...cur.expressions.slice(0, -1), cur.expressions.at(-1));
      continue;
    }
    // value-position composition the receiver may wear - the minted call can sit in any arm
    if (cur.type === 'ConditionalExpression') {
      stack.push(cur.test, cur.consequent, cur.alternate);
      continue;
    }
    if (cur.type === 'LogicalExpression' || cur.type === 'BinaryExpression') {
      stack.push(cur.left, cur.right);
      continue;
    }
    if (cur.type === 'AssignmentExpression') {
      stack.push(cur.right);
      continue;
    }
    if (cur.type === 'CallExpression' || cur.type === 'OptionalCallExpression') {
      // the minted dispatch reads `_x(recv).call(recv, ...)` - the callee spells the import
      // one or two member hops in. an OPTIONAL dispatch (`_x(_ref = recv)?.call(_ref, ...)`) is the
      // same render, and babel spells its hops `Optional*` where estree flags a plain node: reading
      // one spelling alone made this census answer per LEG, re-claiming on pass 2 what pass 1 left
      let callee = unwrapRuntimeExpr(cur.callee);
      if (callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression') {
        callee = unwrapRuntimeExpr(callee.object);
      }
      if (callee?.type === 'CallExpression' || callee?.type === 'OptionalCallExpression') {
        callee = unwrapRuntimeExpr(callee.callee);
      }
      if (callee?.type === 'Identifier' && pureDefaultImportBinding(path, callee.name, tests)) return true;
    }
  }
  return false;
}

// the pure read a REBIND assigns, in EVERY spelling the overwrite channels write it: the instance
// dispatch CALL (`_flatMaybeArray(recv)`), the memoized defaulted guard composed around one
// (`(_refN = _atMaybeArray(recv)) === void 0 ? kept : _refN`), and the STATIC form, which is the
// import BINDING itself (`gb = _Map$groupBy`) - a value, with no call to recognize it by. a bare
// binding is the one spelling a user could plausibly write beside their own destructure, so it
// counts only where the name spells the PROP'S OWN key: `_Map$groupBy` beside `{ groupBy: gb }` is
// our own overwrite, `_Array$from` beside it is somebody else's line
function rebindReadsOurPolyfill(node, stmt, tests, key) {
  const stack = [node];
  while (stack.length) {
    const expr = unwrapRuntimeExpr(stack.pop());
    if (!expr) continue;
    if (expr.type === 'ConditionalExpression') {
      stack.push(expr.test, expr.consequent, expr.alternate);
      continue;
    }
    if (expr.type === 'BinaryExpression') {
      stack.push(expr.left, expr.right);
      continue;
    }
    if (expr.type === 'AssignmentExpression') {
      stack.push(expr.right);
      continue;
    }
    if (expr.type === 'SequenceExpression') {
      stack.push(...expr.expressions);
      continue;
    }
    if (expr.type === 'CallExpression') {
      const callee = unwrapRuntimeExpr(expr.callee);
      if (callee?.type === 'Identifier' && pureDefaultImportBinding(stmt, callee.name, tests)) return true;
      continue;
    }
    if (expr.type !== 'Identifier' || typeof key !== 'string') continue;
    if (!pureDefaultImportBinding(stmt, expr.name, tests)) continue;
    const target = mintedNameTarget(expr.name);
    if (target && (target.member ?? target.global) === key) return true;
  }
  return false;
}

// the OVERWRITE REBIND a prior pass appended after a kept-raw destructure
// (`({ y: { flat: m } } = obj);\nm = _flatMaybeArray(x);`): a re-transform of our own
// output must not claim the pattern's prop again - the rebind already owns the binding,
// and re-claiming appended one more rebind per pass. recognized by shape, ahead of the
// claim routes in both emitters: the ASSIGNMENT-form host statement's NEXT sibling assigns
// the prop's LOCAL from a call whose callee is a DEFAULT import (or require binding) of
// the pure package - the spelling only our own overwrite channel writes there. a user
// hand-writing that exact sandwich forfeits the claim with it (the sentinel census's
// accepted adoption risk)
function overwriteRebindSibling(path, { localName, key, ...tests }) {
  if (typeof localName !== 'string') return false;
  let stmt = path;
  while (stmt?.parentPath?.node && stmt.node.type !== 'ExpressionStatement') stmt = stmt.parentPath;
  if (stmt?.node?.type !== 'ExpressionStatement') return false;
  const list = statementListOf(stmt.parentPath?.node);
  if (!Array.isArray(list)) return false;
  // a multi-prop pattern appends ONE rebind per claimed prop - scan the following RUN of
  // rebind-shaped statements, not just the first
  for (let at = list.indexOf(stmt.node) + 1; at < list.length; at++) {
    const assign = list[at]?.type === 'ExpressionStatement' ? list[at].expression : null;
    if (assign?.type !== 'AssignmentExpression' || assign.operator !== '='
      || assign.left?.type !== 'Identifier') return false;
    if (!rebindReadsOurPolyfill(assign.right, stmt, tests, key)) return false;
    if (assign.left.name === localName) return true;
  }
  return false;
}

// a sentinel-valued prop a PRIOR pass printed (`{ key: _unusedN }`): ours outright, or an
// adopted name that still stands beside our extraction of THIS key. both dispatchers ask it
// ahead of every route
export function sentinelAlreadyProcessed(path, { node, meta, injector }) {
  const { value } = node;
  if (value?.type !== 'Identifier' || !injector.hasGeneratedUnusedName(value.name)) return false;
  return !injector.isAdoptedUnusedName(value.name) || restSentinelExtractionSibling(path, {
    key: typeof meta?.key === 'string' ? meta.key : node.key?.name ?? node.key?.value,
    symbolIterator: !!meta && isSourcedSymbolIteratorMeta(meta),
    injector,
  });
}

// an ADOPTED sentinel - a `_unusedN` the census found in the sentinel position of a source that
// already imports core-js (a re-parse of our own output, or a user file written against the
// pure imports) - is ours only where our extraction of THIS KEY stands with it: every rest
// rebuild leaves the extracted value in the same statement list, as a declarator init or an
// assignment read through the key's pure-import binding (`at = _atMaybeArray(_ref)`,
// `from = _Array$from`, a `for` head's `from = _Array$from, _unused = ...`; a nested proxy key
// names the NAMESPACE the import hangs off - `Array: _unused` beside `_Array$from`; a symbol
// iterator key reads through `get-iterator-method`). a user's unread alias in that position has
// no such sibling and keeps its rewrite - its importers may read it. reached through the census
// above, which both dispatchers ask ahead of EVERY route: without the skip a pass over our own
// output re-extracts the sentinel as a live binding and mints a fresh one, growing it per pass
function restSentinelExtractionSibling(path, { key, symbolIterator, injector }) {
  let p = path;
  let paramsBody = null;
  while (p?.parentPath && !statementListOf(p.parentPath.node)) {
    // a sentinel standing in a function's PARAM pattern is answered by that function's BODY:
    // the extraction our own pass wrote for it went to the top of the body, not beside the
    // function (`function f({ from: _unused, ...rest } = R) { let from = _X; }`). without the
    // hop the climb reaches the enclosing statement list, finds nothing, and the next pass
    // re-extracts the sentinel as a live binding - the file grows per pass
    if (Array.isArray(p.parentPath.node?.params) && p.parentPath.node.params.includes(p.node)) {
      paramsBody = statementListOf(p.parentPath.node.body);
      break;
    }
    p = p.parentPath;
  }
  const list = paramsBody ?? statementListOf(p?.parentPath?.node);
  if (!Array.isArray(list)) return false;
  function extractsKey(name) {
    const info = injector.getPureImport(name);
    if (!info) return false;
    const segments = info.entry.split('/');
    if (symbolIterator) return info.entry === 'get-iterator-method';
    if (typeof key !== 'string') return false;
    // ... and a PROXY GLOBAL key names the REALM every pure import in the list hangs off, not a
    // member of anything: our render of a dropped realm hop keeps that key beside the extraction the
    // drop enabled, and the extraction reads the member two levels down (`{ [(eff(), 'self')]:
    // _unused }` beside `_Array$from`). Asking the entry to name the hop leaves the sentinel
    // unrecognised, and the next pass re-extracts it as a live binding
    if (POSSIBLE_GLOBAL_OBJECTS.has(key)) return true;
    return kebabToCamel(segments.at(-1)).toLowerCase() === key.toLowerCase()
      || (segments.length > 1 && entryToGlobalHint(segments[0]) === key);
  }
  function readsPureImport(expr) {
    // the DEFAULTED extraction guards read the import through their composition -
    // `_X === void 0 ? fb : _X` and the memoized `(_ref = _X(recv)) === void 0 ? fb : _ref`
    // spellings included: the sentinel beside them is as processed as the plain read's
    const stack = [expr];
    while (stack.length) {
      const e = unwrapRuntimeExpr(stack.pop());
      if (!e) continue;
      switch (e.type) {
        case 'ConditionalExpression': stack.push(e.test, e.alternate, e.consequent); continue;
        case 'BinaryExpression': stack.push(e.left, e.right); continue;
        case 'AssignmentExpression': stack.push(e.right); continue;
        case 'SequenceExpression': stack.push(...e.expressions); continue;
      }
      const callee = e.type === 'CallExpression' ? unwrapRuntimeExpr(e.callee) : e;
      if (callee?.type === 'Identifier' && extractsKey(callee.name)) return true;
    }
    return false;
  }
  function * inits(stmt) {
    const node = stmt?.type === 'ExportNamedDeclaration' ? stmt.declaration : stmt;
    switch (node?.type) {
      case 'VariableDeclaration':
        for (const d of node.declarations) yield d.init;
        break;
      case 'ForStatement':
        yield * inits(node.init);
        yield * inits(node.body);
        break;
      // bodyless single-statement slots host the pair too (`if (1) var { k: _unusedN } = R,
      // a = _X(_ref);` - the whole pair is ONE declaration in the slot)
      case 'IfStatement':
        yield * inits(node.consequent);
        if (node.alternate) yield * inits(node.alternate);
        break;
      case 'WhileStatement':
      case 'DoWhileStatement':
      case 'ForInStatement':
      case 'ForOfStatement':
      case 'LabeledStatement':
        yield * inits(node.body);
        break;
      case 'ExpressionStatement': {
        const expressions = node.expression?.type === 'SequenceExpression' ? node.expression.expressions : [node.expression];
        for (const e of expressions) if (e?.type === 'AssignmentExpression') yield e.right;
      }
    }
  }
  for (const stmt of list) for (const init of inits(stmt)) if (init && readsPureImport(init)) return true;
  return false;
}

// the RECEIVER a prior pass swapped ONE ARM of onto our own ponyfill - the identity narrow over a
// realm alias (`realm === _globalThis ? _Promise : realm.Promise`) and the selecting receiver whose
// diverging arm it replaced (`nul || _Iterator.prototype`) are the two spellings of that one render.
// The swapped arm already carries what the pattern reads, so mirroring the receiver again lays a
// literal over our own import and adds an entry per pass, while the other arm stays the source's own
// value. recognised by the arm's BINDING - a user ternary or `||` of the same shape holds no pure
// import there - and the ternary additionally by its narrow shape, whose other arm reads the tested
// receiver itself
function ownNarrowedReceiverArm(path, tests) {
  // the climb stops at the FIRST host that holds a value - a default pairing the pattern is one
  // (`function ({ map } = nul || _Iterator.prototype)`), and walking past it reaches the function,
  // which holds nothing the pattern reads
  let from = path;
  let host = path.parentPath;
  while (host && PATTERN_CHAIN_TYPES.has(host.node?.type)
    && !(host.node.type === 'AssignmentPattern' && host.node.left === from.node)) {
    from = host;
    host = host.parentPath;
  }
  const slot = destructureReceiverSlot(host?.node);
  const receiver = slot ? unwrapRuntimeExpr(host.node[slot]) : null;
  if (receiver?.type === 'LogicalExpression' && (receiver.operator === '||' || receiver.operator === '&&')) {
    return pureImportRootName(receiver.right) !== null
      && pureDefaultImportBinding(path, pureImportRootName(receiver.right), tests);
  }
  if (receiver?.type !== 'ConditionalExpression') return false;
  const { test } = receiver;
  const consequent = unwrapRuntimeExpr(receiver.consequent);
  const alternate = unwrapRuntimeExpr(receiver.alternate);
  if (consequent?.type !== 'Identifier' || test?.type !== 'BinaryExpression' || test.operator !== '==='
    || test.left?.type !== 'Identifier' || alternate?.type !== 'MemberExpression' || alternate.computed
    || alternate.object?.type !== 'Identifier' || alternate.object.name !== test.left.name) return false;
  return pureDefaultImportBinding(path, consequent.name, tests);
}

// the name an arm bottoms out on, through the plain member hops our renders spell over an import
// (`_Iterator.prototype`); a computed hop or any other shape names nothing
function pureImportRootName(node) {
  let cur = unwrapRuntimeExpr(node);
  while (cur?.type === 'MemberExpression' && !cur.computed) cur = unwrapRuntimeExpr(cur.object);
  return cur?.type === 'Identifier' ? cur.name : null;
}

// a claim INSIDE the fallback arm of our own defaulted-extraction guard
// (`(_refN = _X(recv)) === void 0 ? fb : _refN` and the plain `_X === void 0 ? fb : _X`):
// the arm is dead at runtime (the polyfilled read is always defined), so pass 1
// deliberately leaves the fallback's claims raw - re-claiming them re-spells dead code on
// every pass. recognized by the guard's OWN spelling: the compared read's callee (or the
// read itself) is a pure default-import binding
function ownDefaultedGuardFallbackClaim(path, tests) {
  function guardReadsPureImport(testNode) {
    const test = unwrapRuntimeExpr(testNode);
    if (test?.type !== 'BinaryExpression' || test.operator !== '===') return false;
    const right = unwrapRuntimeExpr(test.right);
    if (right?.type !== 'UnaryExpression' || right.operator !== 'void') return false;
    let read = unwrapRuntimeExpr(test.left);
    if (read?.type === 'AssignmentExpression') read = unwrapRuntimeExpr(read.right);
    let callee = read?.type === 'CallExpression' || read?.type === 'OptionalCallExpression'
      ? unwrapRuntimeExpr(read.callee) : read;
    if (callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression') {
      callee = unwrapRuntimeExpr(callee.object);
    }
    return callee?.type === 'Identifier' && pureDefaultImportBinding(path, callee.name, tests);
  }
  for (let cur = path, up = cur.parentPath; up?.node; cur = up, up = up.parentPath) {
    const parent = up.node;
    if (parent.type === 'ConditionalExpression' && parent.consequent === cur.node
      && guardReadsPureImport(parent.test)) return true;
    // the climb stays inside the expression the arm hosts
    if (typeof parent.type !== 'string' || parent.type.endsWith('Statement')
      || parent.type.endsWith('Declaration')) return false;
  }
  return false;
}

// a claim RIDING THE ALTERNATE of our own rendered null-guard (`null == probe ? void 0 :
// <claims here>` where the probed read's leaf is a pure binding): the render deliberately
// kept the alternate's spellings - the collapse already adjudicated them, and a fresh
// claim (a proxy-hop fold included) re-decides a settled verdict on every pass
function ownRenderedGuardAlternateClaim(path, tests) {
  function isNullLiteral(node) {
    const literal = unwrapRuntimeExpr(node);
    return literal?.value === null || literal?.type === 'NullLiteral';
  }
  for (let cur = path, up = cur.parentPath; up?.node; cur = up, up = up.parentPath) {
    const parent = up.node;
    if (parent.type === 'ConditionalExpression' && parent.alternate === cur.node) {
      const test = unwrapRuntimeExpr(parent.test);
      const consequent = unwrapRuntimeExpr(parent.consequent);
      if (test?.type === 'BinaryExpression' && test.operator === '=='
        && (isNullLiteral(test.left) || isNullLiteral(test.right))
        && consequent?.type === 'UnaryExpression' && consequent.operator === 'void') {
        let leaf = unwrapRuntimeExpr(isNullLiteral(test.left) ? test.right : test.left);
        while (leaf?.type === 'MemberExpression' || leaf?.type === 'OptionalMemberExpression') {
          leaf = unwrapRuntimeExpr(leaf.object);
        }
        if (leaf?.type === 'Identifier' && pureDefaultImportBinding(path, leaf.name, tests)) return true;
      }
    }
    if (typeof parent.type !== 'string' || parent.type.endsWith('Statement')
      || parent.type.endsWith('Declaration')) return false;
  }
  return false;
}

// the LOGICAL-ASSIGNMENT PATCH's own render read back. The binding puts our dispatch ahead of the
// third-party value and leaves the `||=` host exactly as the source wrote it, so a later pass finds
// the same shape and prepends a second copy - one dispatch more per pass, converging on nothing. No
// fixture can see it: a fixture compares ONE pass, and the growth needs two. `path` is the member the
// operator writes, and the leading operand being a call of a PRIOR-pass pure binding is the tell
export function ownEmittedLogicalPatch(path, tests) {
  const host = path.parentPath?.node;
  if (host?.type !== 'AssignmentExpression' || host.left !== path.node) return false;
  const operator = host.operator === '||=' ? '||' : host.operator === '??=' ? '??' : null;
  if (!operator) return false;
  const right = unwrapRuntimeExpr(host.right);
  if (right?.type !== 'LogicalExpression' || right.operator !== operator) return false;
  const call = unwrapRuntimeExpr(right.left);
  return call?.type === 'CallExpression' && call.callee?.type === 'Identifier'
    && pureDefaultImportBinding(path, call.callee.name, tests);
}

// the member funnel: every nav-position census in one gate, ahead of both emitters' member
// claim routes. `node` is the MemberExpression, `metaPath` its path
export function ownEmittedNavClaim(node, metaPath, tests) {
  if (tests.programMayHoldOwnOutput && !tests.programMayHoldOwnOutput(rootProgramOf(metaPath))) return false;
  return guardedAliasAlternateRead(metaPath)
    || computedKeyIsMintedImport(node, metaPath, tests, { readOfIteratorIsNotOurs: true })
    || adoptedRefReceiverClaim(node, metaPath, tests)
    || ownDefaultedGuardFallbackClaim(metaPath, tests)
    || ownRenderedGuardAlternateClaim(metaPath, tests)
    || navHoldsMintedSeCall(node.object, metaPath, tests)
    || navHoldsRenderedGuard(node.object, metaPath, tests);
}

// the MIRROR's own literal read back: that render replaces the receiver with `{ <key>: { <member>:
// _X } }` and leaves the pattern exactly where it stood, so a later pass meets a leaf whose paired
// slot ALREADY holds our import - and claiming it again turns the static into an INSTANCE dispatch
// on the slot and appends an entry per pass (`keys = _keys(_ref2)` beside `_Object$keys`). The
// pattern's own key path is what pairs the two, folded structurally so the SE-key spelling our
// render leaves in place names the slot its dotted twin names. A SELECTING receiver keeps its arms,
// and one arm holding our import is enough: the other is the user's own value, which no render of
// ours ever wrote into. A spread anywhere on the path makes the pairing unprovable
function patternSlotHoldsPureImport(path, tests) {
  const keys = [];
  let cur = path;
  for (; cur?.node; cur = cur.parentPath) {
    const { type } = cur.node;
    if (type === 'ObjectPattern') continue;
    if (type !== 'Property' && type !== 'ObjectProperty') break;
    const key = foldedPropertyKeyName(cur.node);
    if (key === null) return false;
    keys.unshift(key);
  }
  const host = cur?.node;
  const init = host?.type === 'VariableDeclarator' ? host.init
    : host?.type === 'AssignmentExpression' && host.operator === '=' ? host.right : null;
  if (!init || !keys.length) return false;
  const selecting = unwrapRuntimeExpr(init);
  const arms = selecting?.type === 'LogicalExpression' ? [selecting.left, selecting.right]
    : selecting?.type === 'ConditionalExpression' ? [selecting.consequent, selecting.alternate] : [selecting];
  return arms.some(arm => {
    let node = unwrapRuntimeExpr(arm);
    for (const key of keys) {
      if (node?.type !== 'ObjectExpression' || node.properties.some(prop => prop.type === 'SpreadElement')) return false;
      const match = node.properties.find(prop => (prop.type === 'Property' || prop.type === 'ObjectProperty')
        && !prop.computed && foldedPropertyKeyName(prop) === key);
      if (!match) return false;
      node = unwrapRuntimeExpr(match.value);
    }
    return node?.type === 'Identifier' && pureDefaultImportBinding(path, node.name, tests);
  });
}

// the pattern funnel: every destructure-prop census in one gate, ahead of both emitters'
// destructure routes. `metaPath` is the prop's path
export function ownEmittedPatternClaim(metaPath, tests) {
  if (tests.programMayHoldOwnOutput && !tests.programMayHoldOwnOutput(rootProgramOf(metaPath))) return false;
  if (defaultHoldsPureImport(metaPath, tests)
    || patternDefaultHoldsPureImport(metaPath, tests)
    || patternSlotHoldsPureImport(metaPath, tests)
    || ownNarrowedReceiverArm(metaPath, tests)
    || computedKeyIsMintedImport(metaPath.node, metaPath, tests)) return true;
  const value = metaPath.node?.value;
  const local = patternSlotTarget(value);
  // the prop's own key names WHAT a bare-binding rebind beside it must read - a computed spelling
  // qualifies only where it folds to a plain string
  const keyNode = metaPath.node?.key;
  const key = metaPath.node?.computed
    ? typeof keyNode?.value === 'string' ? keyNode.value : null
    : keyNode?.name ?? (typeof keyNode?.value === 'string' ? keyNode.value : null);
  return local?.type === 'Identifier'
    && overwriteRebindSibling(metaPath, { localName: local.name, key, ...tests });
}

// census reducer for the SENTINEL POSITIONS the emitters print `_unusedN` into: a
// rest-rebuild's value slot, the SE-key form's computed one, the nested-instance plain
// spelling. a name bound there and read nowhere else is what a re-parse adopts as its own
// sentinel (`adoptUnusedNames`); a user binding in that position that IS read somewhere
// keeps its rewrite. the assignment-form pair's bare initless `var _unusedN;` id is part
// of our own spelling, not a disqualifying read
export function restSentinelNamesReducer() {
  const sentinelCandidates = new Set();
  const sentinelShapedReads = new Map();
  function visit(node, { parentNode, underTypeAnnotation }) {
    if (node.type === 'ObjectPattern') {
      for (const p of node.properties) {
        if ((p.type === 'Property' || p.type === 'ObjectProperty') && !p.shorthand
          && p.value?.type === 'Identifier' && UNUSED_NAME_PATTERN.test(p.value.name)) {
          sentinelCandidates.add(p.value.name);
        }
      }
    } else if (node.type === 'Identifier' && !underTypeAnnotation && blocksUidSlot(parentNode, node)) {
      const initlessVarId = parentNode?.type === 'VariableDeclarator' && parentNode.id === node && !parentNode.init;
      if (!initlessVarId && UNUSED_NAME_PATTERN.test(node.name)) {
        sentinelShapedReads.set(node.name, (sentinelShapedReads.get(node.name) ?? 0) + 1);
      }
    }
  }
  function result() {
    // a candidate's own pattern binding is one occurrence; any second one is a read
    return { restSentinelNames: new Set([...sentinelCandidates].filter(name => sentinelShapedReads.get(name) === 1)) };
  }
  return { visit, result };
}
