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

// pure helper: from a list of `[body, entry]` wraps, return those NOT enclosed by any
// other wrap in the same list. shared by `consumeRefBindingsInRange` (outermost wraps in
// the drained range) and `#composeBodyWrapText` (direct descendants within a body slice).
// O(N log N): sort by start asc + end desc, then sweep tracking the max end seen so far.
// after sort, all prior wraps have start <= current.start, so a current wrap is enclosed
// iff max_end_seen >= current.end (some prior wrap's range covers it). minified single-
// expression bundles can pile thousands of arrow body-wraps under one flatten host, so
// quadratic enclosure-check turns destructure-flatten into a quadratic-in-AST hotspot
function findOutermostWraps(wraps) {
  if (wraps.length <= 1) return wraps.slice();
  const sorted = [...wraps].sort(
    (a, b) => a[0].start - b[0].start || b[0].end - a[0].end);
  const result = [];
  let maxEnd = -1;
  for (const wrap of sorted) {
    if (maxEnd >= wrap[0].end) continue;
    result.push(wrap);
    maxEnd = wrap[0].end;
  }
  return result;
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
    const outermostWraps = findOutermostWraps(wrapsInRange);
    const splices = scopedVarSplices.filter(
      sv => !outermostWraps.some(([body]) => bodyContains(body, sv.start)));
    for (const [body, entry] of outermostWraps) {
      splices.push({
        start: body.start,
        end: body.end,
        content: this.#composeBodyWrapText(body, entry, wrapsInRange, scopedVarSplices),
      });
    }
    return splices;
  }

  // build body-wrap text with DIRECT descendant body-wraps + scopedVar inserts composed into
  // the slice. recursion handles deeper-level body-wraps - each level composes only its
  // immediate children, child's own compose handles grandchildren. scopedVars inside any
  // nested wrap pass through to that wrap's recursive call instead of landing here so each
  // var declaration appears exactly once at the right block level. splicing iterates
  // descendants in descending start order so earlier-position splices don't shift later-
  // position offsets
  #composeBodyWrapText(body, entry, allWrapsInRange, allScopedVarSplices = []) {
    const inside = allWrapsInRange.filter(([other]) => other !== body
      && other.start >= body.start && other.end <= body.end);
    const direct = findOutermostWraps(inside).sort((a, b) => b[0].start - a[0].start);
    // scopedVars inside this body but NOT inside any nested wrap (the nested wrap's
    // recursive call will absorb its own scopedVars). without this filter, the same var
    // declaration would appear at multiple block levels
    const directScopedVars = allScopedVarSplices.filter(
      sv => bodyContains(body, sv.start)
        && !inside.some(([innerBody]) => bodyContains(innerBody, sv.start)));
    let slice = this.#code.slice(body.start, body.end);
    // merge body-wraps + scopedVars sorted descending by start so each splice's local offset
    // stays valid throughout the loop (earlier positions don't shift later-iteration coords)
    const composed = [
      ...direct.map(([b, e]) => ({
        start: b.start,
        end: b.end,
        content: this.#composeBodyWrapText(b, e, allWrapsInRange, allScopedVarSplices),
      })),
      ...directScopedVars,
    ].sort((a, b) => b.start - a.start);
    for (const sp of composed) {
      const localStart = sp.start - body.start;
      const localEnd = sp.end - body.start;
      slice = slice.slice(0, localStart) + sp.content + slice.slice(localEnd);
    }
    return entry.kind === WRAP_KIND_ARROW
      ? `{ var ${ entry.names.join(', ') }; return ${ slice }; }`
      : `{ var ${ entry.names.join(', ') }; ${ slice } }`;
  }

  applyTransforms(queue) {
    // wrap body nodes: arrow `() => expr` -> `() => { var _ref; return expr; }`;
    // bodyless `for (..;..) stmt` -> `for (..;..) { var _ref; stmt }`
    for (const [body, entry] of this.#bodyWraps) {
      queue.add(body.start, body.end, this.#bodyWrapText(body, entry));
    }
    // queue scoped var declarations at each computed insertion point (after `{` + any
    // directive prologue - see skipDirectives). use `queue.insert` so the apply phase
    // remains the single drain (overwrites + inserts both flushed by `queue.apply()`)
    for (const [insertPos, names] of this.#scopedVars) {
      queue.insert(insertPos, this.#scopedVarText(insertPos, names));
    }
    queue.apply();
  }
}
