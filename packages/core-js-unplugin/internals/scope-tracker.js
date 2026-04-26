// per-traversal scope state for `var _ref;` ref injection. mutates as the visitor walks
// (`setScope` runs before each callback; `genRef` reads the current scope), drains accumulated
// arrow / scoped vars after the traverse pass via `applyTransforms`. `genRef` allocates a
// UID AND queues a scope-local `var X;` emission at the target block (arrow-body wrap /
// block body / program). callers that emit their own `const X = Y` (e.g. memo decls inside
// destructure parts) go straight to `injector.generateLocalRef` with `hoisted: false` to
// avoid a duplicate bare `var X;`
import { varScopeAnchor } from './plugin-helpers.js';

export default class ScopeTracker {
  // insertion position for `var _ref;` inside enclosing block (-1 = file scope)
  scope = -1;
  // innermost arrow expression body node needing block conversion
  arrow = null;
  #code;
  #injector;
  // insertionPos -> [var names]
  #scopedVars = new Map();
  // arrow body node -> [var names]
  #arrowVars = new Map();
  // setScope walk-up cache. each node's enclosing scope is fixed by its position in the
  // AST, so the walk is purely a function of the node. multiple traverse passes within
  // one runTransform are SAFE (same AST, same node identity); a fresh AST per file
  // invalidates the cache via WeakMap GC
  #scopeCache = new WeakMap();

  constructor({ code, injector }) {
    this.#code = code;
    this.#injector = injector;
  }

  // advance past `{` and any directive prologue (`"use strict"`, etc.) so that
  // inserted `var _ref;` does not split the directive off from being first in body
  // and silently flip the function to sloppy mode
  static skipDirectives(statements, startPos) {
    let end = startPos;
    for (const stmt of statements ?? []) {
      if (stmt.type !== 'ExpressionStatement' || typeof stmt.directive !== 'string') break;
      end = stmt.end;
    }
    return end;
  }

  setScope(metaPath) {
    const cached = this.#scopeCache.get(metaPath.node);
    if (cached) {
      this.scope = cached.scope;
      this.arrow = cached.arrow;
      return;
    }
    this.scope = -1;
    this.arrow = null;
    // walk up; on each step `prev` is the immediate child path of `p`. ES spec:
    // parameter expressions live in their own scope and CANNOT see `var` declarations
    // from the function body, so if the polyfill is inside the params (default value,
    // computed destructuring key, etc.), the enclosing function is skipped and the
    // `_ref` declaration ends up in the next outer scope.
    for (let prev = metaPath, p = metaPath.parentPath; p; prev = p, p = p.parentPath) {
      const { type, body, params } = p.node;
      if (params?.includes(prev.node)) continue;
      if (type === 'ArrowFunctionExpression' && body?.type !== 'BlockStatement') {
        this.arrow ??= body;
        continue;
      }
      const anchor = varScopeAnchor(p.node, this.#code);
      if (anchor) {
        this.scope = ScopeTracker.skipDirectives(anchor.statements, anchor.insertPos);
        break;
      }
    }
    this.#scopeCache.set(metaPath.node, { scope: this.scope, arrow: this.arrow });
  }

  genRef(overrides) {
    const { arrow, scope } = overrides || this;
    // arrow expression body: var goes into a new block wrapping the body
    if (arrow) {
      const name = this.#injector.generateLocalRef();
      if (!this.#arrowVars.has(arrow)) this.#arrowVars.set(arrow, []);
      this.#arrowVars.get(arrow).push(name);
      return name;
    }
    // file scope: hoisted via injector.flush; block body: var inserted at body start
    // (caller tracks via `scopedVars` and emits its own `var X;`, so no injector-level hoist)
    const name = scope === -1 ? this.#injector.generateHoistedRef() : this.#injector.generateLocalRef();
    if (scope !== -1) {
      if (!this.#scopedVars.has(scope)) this.#scopedVars.set(scope, []);
      this.#scopedVars.get(scope).push(name);
    }
    return name;
  }

  applyTransforms(queue) {
    // wrap arrow expression bodies: () => expr -> () => { var _ref; return expr; }
    for (const [body, names] of this.#arrowVars) {
      queue.add(body.start, body.end,
        `{ var ${ names.join(', ') }; return ${ this.#code.slice(body.start, body.end) }; }`);
    }
    // queue scoped var declarations at each computed insertion point (after `{` + any
    // directive prologue - see skipDirectives). use `queue.insert` so the apply phase
    // remains the single drain (overwrites + inserts both flushed by `queue.apply()`)
    for (const [insertPos, names] of this.#scopedVars) {
      queue.insert(insertPos, `\nvar ${ names.join(', ') };`);
    }
    queue.apply();
  }
}
