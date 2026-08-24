// recognition of the plugins' OWN OUTPUT: a pass over a file a prior pass (either
// emitter, either plugin, any config) already transformed must not claim the spellings
// that pass deliberately left - or the file grows per pass. every census here answers one
// such spelling by SHAPE, injector-free where it can (prepasses run before any injector
// exists), and takes the `isPureImportSource` test bound to the active package via
// `pureImportSourceTest`. semantics live here so both plugins' dispatchers gate on the
// same family; the emitters only bind their injector state
import { entryToGlobalHint } from '../index.js';
import { ORPHAN_REF_PATTERN, UNUSED_NAME_PATTERN } from '../injector-base.js';
import {
  TS_EXPR_WRAPPERS,
  blocksUidSlot,
  declaresRequireBinding,
  kebabToCamel,
  pureImportSourceEntry,
  statementListOf,
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
          for (const decl of rootNode?.body ?? []) {
            if (decl.type === 'ImportDeclaration' && tests.isPureImportSource(decl.source?.value ?? '')) {
              may = true;
              break;
            }
            if (decl.type !== 'VariableDeclaration') continue;
            for (const declarator of decl.declarations) {
              if (declarator.id?.type !== 'Identifier') continue;
              if (!declarator.init && ORPHAN_REF_PATTERN.test(declarator.id.name)) {
                may = true;
                break;
              }
              if (declarator.init?.type === 'CallExpression' && declarator.init.callee?.name === 'require'
                && typeof declarator.init.arguments?.[0]?.value === 'string'
                && tests.isPureImportSource(declarator.init.arguments[0].value)) {
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
// and substituted-default censuses
function pureDefaultImportBinding(path, name, { isPureImportSource, isOwnPassBinding }) {
  const rootNode = rootProgramOf(path);
  for (const decl of rootNode?.body ?? []) {
    if (decl.type === 'ImportDeclaration'
      && decl.specifiers?.some(sp => sp.type === 'ImportDefaultSpecifier' && sp.local?.name === name)) {
      return !isOwnPassBinding?.(name) && isPureImportSource(decl.source?.value ?? '');
    }
    if (decl.type !== 'VariableDeclaration') continue;
    for (const declarator of decl.declarations) {
      if (declarator.id?.type === 'Identifier' && declarator.id.name === name
        && declarator.init?.type === 'CallExpression' && declarator.init.callee?.name === 'require'
        && typeof declarator.init.arguments?.[0]?.value === 'string'
        // an in-file `require` binding shadows the CJS import - the alias stays opaque
        && !declaresRequireBinding(rootNode.body)) {
        return !isOwnPassBinding?.(name) && isPureImportSource(declarator.init.arguments[0].value);
      }
    }
  }
  return false;
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

// the raw read OUR shadow-alias guard deliberately keeps (`h === Ctor ? _X : h.of` - the
// alternate reads the shadowed value): a pass over our own output must not claim it again,
// or the guard nests one level per pass
function guardedAliasAlternateRead(path, tests) {
  // the read may sit DEEPER in the alternate (`h === Ctor ? _X : h.from.bind(h)` claims
  // `h.from`): climb the expression composition to the guard, then ask whose arm we rode
  let cur = path;
  for (let up = cur.parentPath; up?.node; cur = up, up = up.parentPath) {
    const parent = up.node;
    if (parent.type === 'ConditionalExpression') {
      if (parent.alternate !== cur.node) return false;
      const consequent = unwrapRuntimeExpr(parent.consequent);
      return consequent?.type === 'Identifier' && pureDefaultImportBinding(path, consequent.name, tests);
    }
    if (parent.type !== 'MemberExpression' && parent.type !== 'OptionalMemberExpression'
      && parent.type !== 'CallExpression' && parent.type !== 'ParenthesizedExpression'
      && parent.type !== 'ChainExpression' && !TS_EXPR_WRAPPERS.has(parent.type)) return false;
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

// does the receiver spine carry a MINTED pure-call side effect (a sequence prefix or a
// computed key holding `_x(...)` bound to a pure default import)? that spelling is our own
// prior pass's output: its pending claims are spent, and a fresh claim over it would
// UPGRADE a verdict the first pass settled (`(push, _globalThis)[key]?.tail` collapsed on
// the second pass where the first deliberately kept the source `?.`)
// the RENDERED GUARD spelling our collapse writes (`null == probe ? void 0 : _x.tail`):
// a receiver carrying one is our own prior output - a fresh claim over it re-upgrades a
// settled verdict (the same census family as `navHoldsMintedSeCall`, for the guard shape)
// a COMPUTED member whose key is a minted pure import (`[1, 2][_Symbol$iterator]` - the
// symbol read our pass left through its own binding): re-claiming it re-resolves the alias
// and upgrades the kept spelling (`_getIteratorMethod([1, 2])`) on a pass over our output
function computedKeyIsMintedImport(node, path, tests) {
  if (!node?.computed) return false;
  // a MemberExpression spells its key as `.property`, a destructure Property as `.key` -
  // and an SE-bearing key reads its VALUE from the sequence tail (`[(se, _Symbol$iterator)]`)
  let key = unwrapRuntimeExpr(node.property ?? node.key);
  while (key?.type === 'SequenceExpression') key = unwrapRuntimeExpr(key.expressions.at(-1));
  return key?.type === 'Identifier' && pureDefaultImportBinding(path, key.name, tests);
}

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
    if (cur.type === 'LogicalExpression' || cur.type === 'BinaryExpression') stack.push(cur.left, cur.right);
  }
  return false;
}

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
    if (cur.type === 'CallExpression') {
      // the minted dispatch reads `_x(recv).call(recv, ...)` - the callee spells the import
      // one or two member hops in
      let callee = unwrapRuntimeExpr(cur.callee);
      if (callee?.type === 'MemberExpression') callee = unwrapRuntimeExpr(callee.object);
      if (callee?.type === 'CallExpression') callee = unwrapRuntimeExpr(callee.callee);
      if (callee?.type === 'Identifier' && pureDefaultImportBinding(path, callee.name, tests)) return true;
    }
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
function overwriteRebindSibling(path, { localName, ...tests }) {
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
    const callee = assign.right?.type === 'CallExpression' ? assign.right.callee : null;
    if (callee?.type !== 'Identifier' || !pureDefaultImportBinding(stmt, callee.name, tests)) return false;
    if (assign.left.name === localName) return true;
  }
  return false;
}

// an ADOPTED sentinel - a `_unusedN` the census found in the sentinel position of a source that
// already imports core-js (a re-parse of our own output, or a user file written against the
// pure imports) - is ours only where our extraction of THIS KEY stands with it: every rest
// rebuild leaves the extracted value in the same statement list, as a declarator init or an
// assignment read through the key's pure-import binding (`at = _atMaybeArray(_ref)`,
// `from = _Array$from`, a `for` head's `from = _Array$from, _unused = ...`; a nested proxy key
// names the NAMESPACE the import hangs off - `Array: _unused` beside `_Array$from`; a symbol
// iterator key reads through `get-iterator-method`). a user's unread alias in that position has
// no such sibling and keeps its rewrite - its importers may read it. shared by both emitters'
// destructure dispatchers, ahead of EVERY route: without the skip a pass over our own output
// re-extracts the sentinel as a live binding and mints a fresh one, growing the file per pass
export function restSentinelExtractionSibling(path, { key, symbolIterator, injector }) {
  let p = path;
  while (p?.parentPath && !statementListOf(p.parentPath.node)) p = p.parentPath;
  const list = statementListOf(p?.parentPath?.node);
  if (!Array.isArray(list)) return false;
  function extractsKey(name) {
    const info = injector.getPureImport(name);
    if (!info) return false;
    const segments = info.entry.split('/');
    if (symbolIterator) return info.entry === 'get-iterator-method';
    if (typeof key !== 'string') return false;
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
    let callee = read?.type === 'CallExpression' ? unwrapRuntimeExpr(read.callee) : read;
    if (callee?.type === 'MemberExpression') callee = unwrapRuntimeExpr(callee.object);
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

export function rootProgramOf(path) {
  let root = path;
  while (root?.parentPath?.node) root = root.parentPath;
  return root?.node ?? null;
}

// the member funnel: every nav-position census in one gate, ahead of both emitters' member
// claim routes. `node` is the MemberExpression, `metaPath` its path
export function ownEmittedNavClaim(node, metaPath, tests) {
  if (tests.programMayHoldOwnOutput && !tests.programMayHoldOwnOutput(rootProgramOf(metaPath))) return false;
  return guardedAliasAlternateRead(metaPath, tests)
    || computedKeyIsMintedImport(node, metaPath, tests)
    || adoptedRefReceiverClaim(node, metaPath, tests)
    || ownDefaultedGuardFallbackClaim(metaPath, tests)
    || ownRenderedGuardAlternateClaim(metaPath, tests)
    || navHoldsMintedSeCall(node.object, metaPath, tests)
    || navHoldsRenderedGuard(node.object, metaPath, tests);
}

// the pattern funnel: every destructure-prop census in one gate, ahead of both emitters'
// destructure routes. `metaPath` is the prop's path
export function ownEmittedPatternClaim(metaPath, tests) {
  if (tests.programMayHoldOwnOutput && !tests.programMayHoldOwnOutput(rootProgramOf(metaPath))) return false;
  if (defaultHoldsPureImport(metaPath, tests)
    || patternDefaultHoldsPureImport(metaPath, tests)
    || computedKeyIsMintedImport(metaPath.node, metaPath, tests)) return true;
  const value = metaPath.node?.value;
  const local = value?.type === 'AssignmentPattern' ? value.left : value;
  return local?.type === 'Identifier' && overwriteRebindSibling(metaPath, { localName: local.name, ...tests });
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
