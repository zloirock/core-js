// per-traversal scope state for `var _ref;` ref injection. mutates as the visitor walks
// (`setScope` runs before each callback; `genRef` reads the current scope), drains accumulated
// body / scoped vars after the traverse pass via `applyTransforms`. `genRef` allocates a
// UID AND queues a scope-local `var X;` emission at the target block (body wrap /
// block body / program). callers that emit their own `const X = Y` (e.g. memo decls inside
// destructure parts) go straight to `injector.generateLocalRef` with `hoisted: false` to
// avoid a duplicate bare `var X;`
import { isBodylessStatementSlot } from '@core-js/polyfill-provider/destructure-host-shape';
import { skipDirectivePrologue, varScopeAnchor } from './plugin-helpers.js';

// arrow expression body wraps to `{ var ...; return expr; }` (host is Expression);
// bodyless control-statement body wraps to `{ var ...; stmt }` (host is Statement). same
// node-keyed bookkeeping for both - one Map with a kind tag drives both the queue-applied
// path (`applyTransforms`) and the inline-bake path (`consumeRefBindingsInRange`)
const WRAP_KIND_ARROW = 'arrow';
const WRAP_KIND_STMT = 'stmt';

// inclusive containment - pos at body.start or body.end counts as "inside". used by
// scopedVar / bodyWrap overlap checks where insertPos sits at block-anchor positions
// (immediately after `{`) which can coincide with a sibling body's start
function bodyContains(body, pos) {
  return pos >= body.start && pos <= body.end;
}

function pushToMap(map, key, value) {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}

// precompute the wrap nesting for one drained range in a single outer-first sweep (sort by
// start asc + end desc, so every wrap lands after its ancestors): a stack of still-open
// ancestors yields each wrap's immediate parent in one pass, and the parentless ones are the
// outermost roots. lets `#composeBodyWrapText` do O(1) child lookups instead of re-filtering
// the full wrap + scopedVar lists at every level (was O(W^2 + W*S) - quadratic on the
// thousands-of-arrows minified-bundle shape). returns:
//   roots        - outermost wraps (not enclosed by any other), emitted as top-level splices
//   childrenMap  - body -> its immediate child wraps
//   scopedVarMap - body -> scopedVar splices whose innermost enclosing wrap it is (ones inside
//                  no wrap stay out of the map and are emitted as plain splices by the caller)
function buildWrapNesting(wraps, scopedVarSplices) {
  const sorted = [...wraps].sort((a, b) => a[0].start - b[0].start || b[0].end - a[0].end);
  const childrenMap = new Map();
  const roots = [];
  const stack = [];
  for (const wrap of sorted) {
    const [body] = wrap;
    while (stack.length && stack.at(-1)[0].end < body.end) stack.pop();
    const parent = stack.at(-1);
    if (parent) pushToMap(childrenMap, parent[0], wrap);
    else roots.push(wrap);
    stack.push(wrap);
  }
  // scopedVars are rare (catch-clause / block-scoped emit), so the last-container scan stays
  // cheap; the eliminated cost was the per-level wrap re-filter, not this
  const scopedVarMap = new Map();
  for (const sv of scopedVarSplices) {
    let innermost = null;
    for (const wrap of sorted) if (bodyContains(wrap[0], sv.start)) innermost = wrap;
    if (innermost) pushToMap(scopedVarMap, innermost[0], sv);
  }
  return { roots, childrenMap, scopedVarMap };
}

export default class ScopeTracker {
  // insertion position for `var _ref;` inside enclosing block (-1 = file scope)
  scope = -1;
  // innermost body node needing block conversion + its wrap kind, or null. picked up by
  // `genRef` so the var lands in a fresh block right above its use sites
  bodyWrap = null;
  #code;
  #injector;
  // insertionPos -> [var names]
  #scopedVars = new Map();
  // body node -> { kind, names: [var names] }
  #bodyWraps = new Map();
  // insertionPos -> { start, end } of the brace-delimited block, so a scoped `var` whose insert
  // would land inside an enclosing overwrite can be re-emitted as a composing body-overwrite
  #scopedVarBlocks = new Map();
  // setScope walk-up cache. each node's enclosing scope is fixed by its position in the
  // AST, so the walk is purely a function of the node. multiple traverse passes within
  // one runTransform are SAFE (same AST, same node identity); a fresh AST per file
  // invalidates the cache via WeakMap GC
  #scopeCache = new WeakMap();

  constructor({ code, injector }) {
    this.#code = code;
    this.#injector = injector;
  }

  setScope(metaPath) {
    const cached = this.#scopeCache.get(metaPath.node);
    if (cached) {
      this.scope = cached.scope;
      this.bodyWrap = cached.bodyWrap;
      return;
    }
    this.scope = -1;
    this.bodyWrap = null;
    // walk up; on each step `prev` is the immediate child path of `p`. ES spec:
    // parameter expressions live in their own scope and CANNOT see `var` declarations
    // from the function body, so if the polyfill is inside the params (default value,
    // computed destructuring key, etc.), the enclosing function is skipped and the
    // `_ref` declaration ends up in the next outer scope.
    for (let prev = metaPath, p = metaPath.parentPath; p; prev = p, p = p.parentPath) {
      const { type, body, params } = p.node;
      if (params?.includes(prev.node)) continue;
      // arrow expression body: var goes into a new block wrapping the body (kind=arrow,
      // wrap text adds `return` since the host is an Expression slot)
      if (type === 'ArrowFunctionExpression' && body?.type !== 'BlockStatement') {
        this.bodyWrap ??= { body, kind: WRAP_KIND_ARROW };
        continue;
      }
      // bodyless control body (`for (..;..) stmt`, `if (..) stmt`, etc. without braces):
      // `var _ref;` cannot land here without converting the slot to a BlockStatement;
      // hoisting to the enclosing function would visually divorce the ref from its uses
      // and diverge from babel-plugin's per-block wrap
      if (prev.node.type !== 'BlockStatement' && isBodylessStatementSlot(p.node, prev.node)) {
        this.bodyWrap ??= { body: prev.node, kind: WRAP_KIND_STMT };
        continue;
      }
      const anchor = varScopeAnchor(p.node, this.#code);
      if (anchor) {
        this.scope = skipDirectivePrologue(anchor.statements, anchor.insertPos);
        // remember the brace-delimited block range (BlockStatement / StaticBlock is the node
        // itself; catch / namespace wrap their block in `.body`) so applyTransforms can re-emit
        // the scoped `var` as a composing body-overwrite when its insert would land inside an
        // enclosing overwrite
        const braceNode = p.node.type === 'BlockStatement' || p.node.type === 'StaticBlock' ? p.node : p.node.body;
        if (braceNode) this.#scopedVarBlocks.set(this.scope, { start: braceNode.start, end: braceNode.end });
        break;
      }
    }
    this.#scopeCache.set(metaPath.node, { scope: this.scope, bodyWrap: this.bodyWrap });
  }

  genRef(overrides) {
    const { bodyWrap, scope } = overrides || this;
    if (bodyWrap) {
      const name = this.#injector.generateLocalRef();
      const entry = this.#bodyWraps.get(bodyWrap.body) ?? { kind: bodyWrap.kind, names: [] };
      entry.names.push(name);
      this.#bodyWraps.set(bodyWrap.body, entry);
      return name;
    }
    // file scope: hoisted via injector.flush; block body: var inserted at body start
    // (caller tracks via `scopedVars` and emits its own `var X;`, so no injector-level hoist)
    const name = scope === -1 ? this.#injector.generateDeclaredRef() : this.#injector.generateLocalRef();
    if (scope !== -1) {
      if (!this.#scopedVars.has(scope)) this.#scopedVars.set(scope, []);
      this.#scopedVars.get(scope).push(name);
    }
    return name;
  }

  // detect leading whitespace of the next non-empty line after `pos` so a baked `var X;`
  // splice matches surrounding block indent. without this, the inserted `var X;` would
  // start at column 0 (immediately after the block-opening `{`'s newline), visually
  // misaligned with sibling statements. cap scan to LF / EOF so pathological inputs
  // (no-newline file) don't burn through the source. ALSO bail on enclosing `}` before
  // `\n`: minified single-line bodies (`function f(){body}\n  nextLine`) would otherwise
  // pick up `nextLine`'s indent which belongs to a sibling scope, not the body
  #detectIndentAt(pos) {
    const code = this.#code;
    let i = pos;
    while (i < code.length && code[i] !== '\n') {
      if (code[i] === '}') return '';
      i++;
    }
    if (i >= code.length) return '';
    i++;
    let indent = '';
    while (i < code.length && (code[i] === ' ' || code[i] === '\t')) {
      indent += code[i];
      i++;
    }
    return indent;
  }

  // text for a scoped `var _ref, ...;` line at `insertPos`, indented to match siblings.
  // single source of truth for both the queue-applied path (`applyTransforms`) and the
  // inline-bake path (`consumeRefBindingsInRange`) so visual layout stays symmetric
  #scopedVarText(insertPos, names) {
    return `\n${ this.#detectIndentAt(insertPos) }var ${ names.join(', ') };`;
  }

  // text replacing a body node with a BlockStatement. arrow expression body adds `return`
  // (host is Expression); bodyless control-statement body keeps the slice verbatim (host
  // is already a Statement with its own terminator)
  #bodyWrapText(body, entry) {
    const slice = this.#code.slice(body.start, body.end);
    return entry.kind === WRAP_KIND_ARROW
      ? `{ var ${ entry.names.join(', ') }; return ${ slice }; }`
      : `{ var ${ entry.names.join(', ') }; ${ slice } }`;
  }

  // claim ref-binding emissions whose anchor lies within [start, end] - both `#scopedVars`
  // (block-body `var _ref;` zero-length inserts) and `#bodyWraps` (expr-body / bodyless-
  // stmt-body block conversions) get unified into a single `{start, end, content}` splice
  // list (insert shape uses start === end). used by destructure-emitter's flatten path:
  // it queues an overwrite covering the same range and bakes these splices into the
  // replacement text directly. without consume-and-bake, `applyTransforms` queues an
  // insert at a position INSIDE the parent overwrite, MagicString `_split`s an already-
  // edited chunk and throws "Cannot split a chunk that has already been edited"
  // nested body-wraps (`() => [1].at(0) + ((() => [2].at(0))())`) are pre-composed: the
  // outer's slice captures original source including the inner body, and a flat `spliceInRange`
  // pass would have the OUTER splice (applied second by ascending-position iteration)
  // overwrite the INNER splice with raw original text. compose inner content INTO outer's
  // body slice before emitting the outermost splice; the inner entries are dropped from
  // the returned list (and the map) since their effect is now baked into the outer
  consumeRefBindingsInRange(start, end) {
    const scopedVarSplices = [];
    for (const [insertPos, names] of this.#scopedVars) {
      if (insertPos >= start && insertPos <= end) {
        scopedVarSplices.push({ start: insertPos, end: insertPos, content: this.#scopedVarText(insertPos, names) });
        this.#scopedVars.delete(insertPos);
      }
    }
    const wrapsInRange = [];
    for (const [body, entry] of this.#bodyWraps) {
      if (body.start >= start && body.end <= end) wrapsInRange.push([body, entry]);
    }
    // inner wraps are absorbed into outer's composed content rather than emitted as
    // separate splices - drop ALL wraps from the map but only emit outermost splices
    for (const [body] of wrapsInRange) this.#bodyWraps.delete(body);
    // scopedVars inside an outermost bodyWrap range must be COMPOSED into the wrap's body
    // slice, not emitted as separate splices: spliceInRange iterates descending by start,
    // so a sibling scopedVar (insert at later pos) applies first then the bodyWrap overwrite
    // [B,E] uses ORIGINAL-source coords to slice the post-insert string, dropping the
    // scopedVar text entirely AND truncating the body content shifted by the insert length
    const { roots, childrenMap, scopedVarMap } = buildWrapNesting(wrapsInRange, scopedVarSplices);
    const splices = scopedVarSplices.filter(
      sv => !roots.some(([body]) => bodyContains(body, sv.start)));
    for (const [body, entry] of roots) {
      splices.push({
        start: body.start,
        end: body.end,
        content: this.#composeBodyWrapText(body, entry, childrenMap, scopedVarMap),
      });
    }
    return splices;
  }

  // claim (remove + return) the var names anchored DIRECTLY in `braceNode`'s own block scope.
  // a caller that emits its own block-leading prelude (catch-clause) declares them at the top of
  // that prelude instead of letting `applyTransforms` insert `var X;` AFTER the prelude - valid
  // via hoisting but reads as use-before-declare. only the exact block is claimed (matched by
  // brace range); nested-block vars keep their own anchors. no body-wrap interaction: a wrapped
  // block (arrow / bodyless stmt) isn't a brace-delimited scope tracked in `#scopedVarBlocks`
  claimBlockScopedVars(braceNode) {
    for (const [insertPos, block] of this.#scopedVarBlocks) {
      if (block.start !== braceNode.start || block.end !== braceNode.end) continue;
      const names = this.#scopedVars.get(insertPos);
      if (!names?.length) return [];
      this.#scopedVars.delete(insertPos);
      this.#scopedVarBlocks.delete(insertPos);
      return names;
    }
    return [];
  }

  // build body-wrap text with each wrap's IMMEDIATE child body-wraps + its own scopedVar inserts
  // composed into the slice. nesting comes from `childrenMap` / `scopedVarMap` (precomputed once
  // by buildWrapNesting) so each wrap is O(1) lookup, not a re-filter of the whole range. the
  // traversal is ITERATIVE post-order (an explicit heap `stack`, not call recursion) so wrap
  // nesting of ANY depth composes correctly without risking a call-stack overflow - a child's
  // composed text is computed and cached in `textOf` before its parent splices it in. each wrap
  // merges its children + own scopedVars in descending start order so an earlier-position splice
  // doesn't shift a later one's local offset
  #composeBodyWrapText(rootBody, rootEntry, childrenMap, scopedVarMap) {
    const textOf = new Map();
    // DFS frame: [body, entry, expanded]. first visit pushes children, second visit composes
    // (post-order) - so every child's text is in `textOf` by the time its parent is composed
    const stack = [[rootBody, rootEntry, false]];
    while (stack.length) {
      const frame = stack.at(-1);
      const [body, entry, expanded] = frame;
      const children = childrenMap.get(body) ?? [];
      if (!expanded) {
        frame[2] = true;
        for (const child of children) stack.push([child[0], child[1], false]);
        continue;
      }
      stack.pop();
      let slice = this.#code.slice(body.start, body.end);
      const directScopedVars = scopedVarMap.get(body) ?? [];
      const composed = [
        ...children.map(([childBody]) => ({
          start: childBody.start,
          end: childBody.end,
          content: textOf.get(childBody),
        })),
        ...directScopedVars,
      ].sort((a, b) => b.start - a.start);
      for (const sp of composed) {
        const localStart = sp.start - body.start;
        const localEnd = sp.end - body.start;
        slice = slice.slice(0, localStart) + sp.content + slice.slice(localEnd);
      }
      textOf.set(body, entry.kind === WRAP_KIND_ARROW
        ? `{ var ${ entry.names.join(', ') }; return ${ slice }; }`
        : `{ var ${ entry.names.join(', ') }; ${ slice } }`);
    }
    return textOf.get(rootBody);
  }

  applyTransforms(queue) {
    // wrap body nodes: arrow `() => expr` -> `() => { var _ref; return expr; }`;
    // bodyless `for (..;..) stmt` -> `for (..;..) { var _ref; stmt }`
    for (const [body, entry] of this.#bodyWraps) {
      queue.add(body.start, body.end, this.#bodyWrapText(body, entry));
    }
    // queue scoped var declarations at each computed insertion point (after `{` + any directive
    // prologue). normally a plain insert; but when the insert point sits inside an enclosing
    // overwrite (e.g. an instance-method memo wrapping an IIFE whose body hosts another polyfill)
    // a raw insert can't fold into the overwritten chunk - re-emit it as a body-spanning overwrite
    // so it composes into the enclosing transform like #bodyWraps. brace head (up to insertPos)
    // and tail stay verbatim so nested transforms inside the block still compose by content
    for (const [insertPos, names] of this.#scopedVars) {
      const block = this.#scopedVarBlocks.get(insertPos);
      if (block && queue.insertLandsInsideOverwrite(insertPos)) {
        const head = this.#code.slice(block.start, insertPos);
        const tail = this.#code.slice(insertPos, block.end);
        queue.add(block.start, block.end, `${ head } var ${ names.join(', ') };${ tail }`);
      } else {
        queue.insert(insertPos, this.#scopedVarText(insertPos, names));
      }
    }
    queue.apply();
  }
}
