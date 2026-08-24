import { entryToGlobalHint } from '@core-js/polyfill-provider';
import {
  blocksUidSlot, isInitlessVarDecl, isNonReferencePosition, isTopLevelImportLike,
  memberKeyNamesReducer, staticMemberFromEntrySegment,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { resolveImportPath } from '@core-js/polyfill-provider/helpers/path-normalize';
import { assignCanonicalRefSlots } from '@core-js/polyfill-provider/injector-base';
import { polyfillOrderComparator, sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options/inject';
import { walkAstNodes, isDirectiveStatement } from '../plugin-helpers.js';
import { bareImport, bareRequire, defaultImport, identifier, varRequire, variableDeclaration, variableDeclarator } from './builders.js';

// the AST engine's flush over the SHARED injector instance (the provider base is a pure
// data sink; the text subclass renders through MagicString, this module renders nodes).
// ordering mirrors both legs' shared rule: globals and pure imports each canonically
// sorted through the one polyfill-order comparator

function importAnchorIndex(body) {
  let index = 0;
  while (index < body.length && isDirectiveStatement(body[index])) index++;
  return index;
}

// the trailing edge of the leading import block AFTER the injected imports land - the
// `var _ref;` block anchors there, the same slot the text engine spells by offset
// the `var _ref;` anchor: the index PAST the leading import region, asked through the shared
// region canon (`isTopLevelImportLike` + the directive / initless-var step-overs) so both legs
// draw the same boundary - a re-export or an interspersed `var x;` must not truncate it
function refAnchorIndex(body, from) {
  let index = from;
  let end = from;
  while (index < body.length) {
    const statement = body[index];
    if (isTopLevelImportLike(statement)) end = ++index;
    else if (isDirectiveStatement(statement) || isInitlessVarDecl(statement)) index++;
    else break;
  }
  return end;
}

// the single-pass orphan filter, the text `liveInBody` twin: a pure import whose minted
// name no longer appears in the tree was superseded by a later routing - EXCEPT a pure
// STATIC whose module attaches the method to the pure constructor on load: when any
// emission reads that static through the injected constructor (`_Map.groupBy`), the
// binding-unused import stays load-bearing
// the census also serves the generated-ref canon below: `refNodes` / `printRank` see only
// REFERENCE positions (a member key or object key spelling a slot-shaped name is source
// text, same rule the babel census applies), while `usedNames` stays position-blind to
// mirror the text leg's `\bname\b` liveness scan
function collectLiveness(program, mintedRefNames, { retire = null } = {}) {
  // the census answers about the tree the flush RENUMBERS, so a retire pass that reshapes it
  // runs first - a name it drops must never reach the slot rank
  retire?.(program, mintedRefNames);
  const usedNames = new Set();
  const memberReads = new Set();
  const referenceNames = new Set();
  const refNodes = new Set();
  const refCounts = new Map();
  const printRank = [];
  const declFirstNames = new Set();
  // an id-rooted member KEY reserves its name too - the census both legs share
  const memberKeys = memberKeyNamesReducer();
  walkAstNodes({ root: program, visit(node, parent) {
    // a `:` slot is where babel's uid scan stops: a name written past one claims nothing
    // (`declare const v: { _ref2(): void }` leaves `_ref2` free), while a type-alias RHS or
    // an interface body carries no such wrapper and is walked at any depth (`false` prunes)
    if (node.type === 'TSTypeAnnotation') return false;
    if (node.type === 'Identifier') {
      usedNames.add(node.name);
      // what may be REWRITTEN and what BLOCKS a slot are two questions: a source-text name is
      // never rewritten, yet an overload signature's key still reserves its name
      if (!isNonReferencePosition(parent, node)) {
        if (mintedRefNames.has(node.name)) {
          refNodes.add(node);
          const count = refCounts.get(node.name) ?? 0;
          // a generated memo DECLARATION hoists above the statement it serves, so its binding id is
          // not where the name was needed: babel numbers it at the point of the second READ. the
          // name still ranks - just at that read, and at its declaration when nothing reads it
          if (!count && parent?.type === 'VariableDeclarator' && parent.id === node && parent.init) {
            declFirstNames.add(node.name);
          } else if (!printRank.includes(node.name)) printRank.push(node.name);
          refCounts.set(node.name, count + 1);
        } else referenceNames.add(node.name);
      } else if (blocksUidSlot(parent, node)) referenceNames.add(node.name);
    }
    if (node.type === 'MemberExpression' && node.object?.type === 'Identifier') {
      const key = node.computed
        ? (node.property?.type === 'Literal' ? node.property.value : null)
        : node.property?.name;
      if (key) memberReads.add(`${ node.object.name }.${ key }`);
    }
    memberKeys.visit(node);
  } });
  for (const name of declFirstNames) if (!printRank.includes(name)) printRank.push(name);
  for (const name of memberKeys.result().memberKeyNames) {
    if (!mintedRefNames.has(name)) referenceNames.add(name);
  }
  return { usedNames, memberReads, referenceNames, refNodes, refCounts, printRank };
}

// dead nested guard-memo strip, the AST-side twin of the text leg's `stripDeadNestedGuardMemos`
// (token edits) and of the babel leg's `guardCensus` + prune: a guard memo nested DIRECTLY inside
// an outer guard's test slot whose ref nothing reads (`null == (_refY = null == (_refX = root)
// ? void 0 : ...)`) is write-only - the outer test already owns the one evaluation. the deadness
// only exists AFTER composition, so the strip runs here, ahead of the slot census. a TOP-LEVEL
// guard keeps its memo (the locked kept-swap canon)
function retireNestedGuardMemos(program, mintedRefNames) {
  const counts = new Map();
  const sites = [];
  function nullSide(binary, other) {
    if (binary?.type !== 'BinaryExpression' || binary.operator !== '==') return false;
    const opposite = binary.left === other ? binary.right : binary.right === other ? binary.left : null;
    return opposite?.type === 'Literal' && opposite.value === null;
  }
  (function visit(node, ancestors) {
    if (Array.isArray(node)) {
      for (const item of node) visit(item, ancestors);
      return;
    }
    if (!node || typeof node !== 'object' || !node.type) return;
    if (node.type === 'Identifier' && mintedRefNames.has(node.name) && !isNonReferencePosition(ancestors.at(-1), node)) {
      counts.set(node.name, (counts.get(node.name) ?? 0) + 1);
    }
    if (node.type === 'AssignmentExpression' && node.operator === '=' && node.left?.type === 'Identifier'
      && mintedRefNames.has(node.left.name)) {
      const [test, cond, outer, grand] = [ancestors.at(-1), ancestors.at(-2), ancestors.at(-3), ancestors.at(-4)];
      if (nullSide(test, node) && cond?.type === 'ConditionalExpression' && cond.test === test
        && cond.consequent?.type === 'UnaryExpression' && cond.consequent.operator === 'void'
        && outer?.type === 'AssignmentExpression' && outer.right === cond
        && outer.left?.type === 'Identifier' && mintedRefNames.has(outer.left.name)
        && nullSide(grand, outer)) sites.push({ node, test });
    }
    ancestors.push(node);
    for (const value of Object.values(node)) visit(value, ancestors);
    ancestors.pop();
  })(program, []);
  for (const { node, test } of sites) {
    if (counts.get(node.left.name) !== 1) continue;
    if (test.left === node) test.left = node.right;
    else test.right = node.right;
  }
}

// every node reachable from the program - the flush asks it whether a recorded ref host
// still lives in the tree
function collectNodes(root) {
  const seen = new Set();
  (function walk(node) {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) for (const item of value) walk(item);
      else walk(value);
    }
  })(root);
  return seen;
}

// the minted family a generated name belongs to: the two renumber in slot spaces of their own
// and declare in that same order where they share a `var`
function refFamilyOf(name) {
  return name.startsWith('_unused') ? '_unused' : '_ref';
}

export function flushIntoProgram({ injector, program, refNames = [], renameOnly = [], refOrder = [] }) {
  const isRequire = injector.importStyle === 'require';
  function resolve(subpath) {
    return resolveImportPath(injector.pkg, subpath, injector.absoluteImports);
  }
  const nodes = [];
  for (const moduleName of sortByPolyfillOrder(injector.globalImports)) {
    const path = resolve(`modules/${ moduleName }`);
    nodes.push(isRequire ? bareRequire(path) : bareImport(path));
  }
  // `renameOnly` names carry no declaration of their own (a pattern sentinel), but they belong
  // to the same minted family and must renumber with it - a dropped one would strand its slot
  const mintedRefNames = new Set([...refNames.map(entry => entry.name), ...renameOnly, ...refOrder]);
  const { usedNames, memberReads, referenceNames, refNodes, refCounts, printRank } =
    collectLiveness(program, mintedRefNames, { retire: retireNestedGuardMemos });
  // generated-ref canon, the shared slot rule both emitters print through: a minted ref the
  // emission ended up not using is dropped, the survivors renumber into compact print-order
  // slots. minted names never collide with source spellings (the injector's uniqueName
  // guarantee), so renaming by NAME touches exactly the plugin-emitted identifiers
  // per-FAMILY renumber: `_unused` sentinels share the census but never take `_ref` slots
  const renameMap = new Map();
  for (const prefix of ['_ref', '_unused']) {
    const familyRank = printRank.filter(name => refFamilyOf(name) === prefix);
    // a RESERVED name blocks its slot with no spelling of its own to find: a mutated global
    // slot written through a string key (`Object.defineProperty(self, '_ref3', ...)`) reaches
    // the census only through the injector's own reservation
    for (const [from, to] of assignCanonicalRefSlots(prefix, familyRank,
      name => referenceNames.has(name) || injector.reservedNames.has(name))) {
      renameMap.set(from, to);
    }
  }
  for (const node of refNodes) {
    const to = renameMap.get(node.name);
    if (to) node.name = to;
  }
  const liveRefs = refNames
    .map((entry, registrationIndex) => ({ ...entry, registrationIndex }))
    .filter(entry => refCounts.has(entry.name))
    .sort((a, b) => printRank.indexOf(a.name) - printRank.indexOf(b.name))
    .map(entry => ({ ...entry, name: renameMap.get(entry.name) ?? entry.name }));
  const ctorNameByNamespace = new Map();
  for (const [source, name] of injector.pureImports) {
    const segments = source.split('/');
    if (segments.at(-1) === 'constructor') ctorNameByNamespace.set(segments.at(-2), name);
  }
  function liveInProgram(source, name) {
    if (usedNames.has(name)) return true;
    const segments = source.split('/');
    const ctor = segments.length >= 2 ? ctorNameByNamespace.get(segments.at(-2)) : null;
    if (!ctor) return false;
    const key = staticMemberFromEntrySegment(entryToGlobalHint(segments.at(-2)), segments.at(-1));
    return memberReads.has(`${ ctor }.${ key }`);
  }
  const activePure = [...injector.pureImports]
    .filter(([source, name]) => !injector.existingPureImports.has(source) && liveInProgram(source, name))
    .sort(([a], [b]) => polyfillOrderComparator(a, b));
  for (const [source, name] of activePure) {
    const path = resolve(source);
    nodes.push(isRequire ? varRequire(name, path) : defaultImport(name, path));
  }
  const anchor = importAnchorIndex(program.body);
  program.body.splice(anchor, 0, ...nodes);
  // refs group per host body: program-level ones behind the import block, function-level
  // ones at their body's head (the babel `scope.push` anchor)
  const byHost = new Map();
  // a recorded host can be REPLACED before the flush (a drain that rebuilds a statement
  // clones the subtree it moves): the declaration would then land in a detached node and
  // the surviving reads have none. the program level always holds one, so a lost host
  // degrades there instead of dropping - a re-homed clone is the fix, this is the net
  const liveHosts = liveRefs.some(entry => entry.hostFunction || entry.hostBlock)
    ? collectNodes(program) : null;
  for (const { name, registrationIndex, hostFunction, hostBlock, hostBodyless } of liveRefs) {
    let host = program;
    if ((hostFunction && !liveHosts?.has(hostFunction)) || (hostBlock && !liveHosts?.has(hostBlock))) {
      if (!byHost.has(program)) byHost.set(program, []);
      byHost.get(program).push({ name, registrationIndex });
      continue;
    }
    if (hostBodyless) {
      // wrap the bodyless statement slot in a block on the final tree - babel's scope.push
      // creates the same block when a ref lands in a block-less loop / if body
      const { parent, slot } = hostBodyless;
      if (parent[slot]?.type !== 'BlockStatement') {
        parent[slot] = { type: 'BlockStatement', body: [parent[slot]] };
      }
      host = parent[slot];
    } else if (hostBlock) host = hostBlock;
    else if (hostFunction) {
      // babel's scope.push converts an expression-bodied arrow to a block - here on the
      // final tree, so the wrap can no longer be clobbered by a chain-root replacement
      if (hostFunction.body.type !== 'BlockStatement') {
        hostFunction.body = { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: hostFunction.body }] };
      }
      host = hostFunction.body;
    }
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push({ name, registrationIndex });
  }
  for (const [host, entries] of byHost) {
    // a program-level block declares in print order; a function-level one in REGISTRATION
    // order - babel's scope.push appends there, and a deferred check ref (minted before the
    // receiver memo, declared after it) lands behind it (`var _ref2, _ref;`)
    // ... and the PROGRAM-level declaration groups by FAMILY whatever the print order says: the
    // two register through channels of their own - the injector opens the `var` for the refs
    // and the drain's sentinels append to it (`var _ref, _unused;`)
    const names = (host === program
      ? [...entries.filter(entry => refFamilyOf(entry.name) === '_ref'),
        ...entries.filter(entry => refFamilyOf(entry.name) !== '_ref')]
      : entries.toSorted((a, b) => a.registrationIndex - b.registrationIndex)).map(entry => entry.name);
    const declaration = variableDeclaration('var', names.map(name => variableDeclarator(identifier(name))));
    if (host === program) program.body.splice(refAnchorIndex(program.body, anchor + nodes.length), 0, declaration);
    // a function-host block anchors PAST its directive prologue (babel's scope.push slot)
    else host.body.splice(importAnchorIndex(host.body), 0, declaration);
  }
}
