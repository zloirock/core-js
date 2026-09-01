// Decision tests for the destructure pieces the bindings stopped owning: the collapsed
// spelling of a proxy-receiver plan, the memo re-read target, the catch-clause relocation
// gate and the own-output sentinel census. All four were written twice - once per binding -
// and a fixture only proves the two agreed on the shapes the corpus happens to carry
import { planMemoReadTarget } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { buildNestedDestructurePlan, planCatchClauseExtraction } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { sentinelAlreadyProcessed } from '../../packages/core-js-polyfill-provider/detect-usage/own-output.js';
import { HOST_SLOT, hostSlot, renderProxyReceiverPlan } from '../../packages/core-js-polyfill-provider/render.js';
import { buildOffsetToLine } from '../../packages/core-js-polyfill-provider/helpers/source-scan.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, finish, runBoth } = createChecker('destructure-collapse');

function injectImport(entry, hintName) {
  return `_${ hintName ?? entry }`;
}

function identifier(name) {
  return { type: 'Identifier', name };
}
function collapsePlan(extra = {}) {
  return {
    kind: 'collapse',
    rootBinding: { pure: { entry: 'actual/global-this', hintName: 'globalThis' } },
    harvestedSE: [],
    keyPrefixSE: [],
    property: identifier('Array'),
    computed: false,
    optional: false,
    ...extra,
  };
}

// --- renderProxyReceiverPlan: one spelling for both bindings ---

check('render/pure root swaps to the injected binding',
  renderProxyReceiverPlan(collapsePlan(), { injectImport }).object.name, '_globalThis');
check('render/pure root keeps the leaf key plain',
  renderProxyReceiverPlan(collapsePlan(), { injectImport }).property.name, 'Array');
check('render/alias root is spelled verbatim',
  renderProxyReceiverPlan(collapsePlan({ rootBinding: { alias: identifier('g') } }), { injectImport }).object.name, 'g');

// a clone, never the plan's own node: the substrate mutates what it inserts, and the plan is
// re-read by the other routes off the same receiver
checkTruthy('render/alias root is CLONED',
  (() => {
    const alias = identifier('g');
    return renderProxyReceiverPlan(collapsePlan({ rootBinding: { alias } }), { injectImport }).object !== alias;
  })());

// harvested effects ride AHEAD of the root, in the order the plan collected them
check('render/harvested effects prefix the root',
  (() => {
    const rendered = renderProxyReceiverPlan(collapsePlan({
      harvestedSE: [identifier('a'), identifier('b')],
    }), { injectImport });
    return rendered.object.expressions.map(e => e.name).join(',');
  })(), 'a,b,_globalThis');

// dropped-hop key effects migrate INTO the surviving key instead, which forces it computed -
// its plain spelling becomes the string the source read
check('render/key prefix folds into the leaf key',
  (() => {
    const rendered = renderProxyReceiverPlan(collapsePlan({
      keyPrefixSE: [identifier('c')],
    }), { injectImport });
    return `${ rendered.computed }:${ rendered.property.expressions.map(e => e.name ?? e.value).join(',') }`;
  })(), 'true:c,Array');

check('render/a kept root re-hangs its guard on the leaf',
  renderProxyReceiverPlan(collapsePlan({
    rootBinding: { keep: identifier('q') }, optional: true,
  }), { injectImport }).optional, true);

check('render/member kind wraps the inner plan',
  (() => {
    const rendered = renderProxyReceiverPlan({
      kind: 'member', inner: collapsePlan(), property: identifier('from'), computed: false,
    }, { injectImport });
    return `${ rendered.property.name }.${ rendered.object.property.name }`;
  })(), 'from.Array');

// `embed` is the seam for a binding whose dialect is NOT canonical: every carried node passes
// through it, and the babel converter reads exactly that wrapper
check('render/embed wraps every carried node',
  (() => {
    const rendered = renderProxyReceiverPlan(collapsePlan({
      rootBinding: { alias: identifier('g') }, harvestedSE: [identifier('a')],
    }), { injectImport, embed: hostSlot });
    const root = rendered.object.expressions;
    return [root[0].type, root[1].type, rendered.property.type].join(',');
  })(), [HOST_SLOT, HOST_SLOT, HOST_SLOT].join(','));

// ... and the INJECTED binding is the canon's own node, never host-slotted - the binding name
// comes from the injector, so there is no source node to carry
check('render/an injected root is canonical, not embedded',
  renderProxyReceiverPlan(collapsePlan(), { injectImport, embed: hostSlot }).object.type, 'Identifier');

// --- planMemoReadTarget: what a memoized receiver re-reads ---

function resolvePureGlobals(meta) {
  return meta.kind === 'global' && meta.name === 'globalThis'
    ? { entry: 'actual/global-this', hintName: 'globalThis' } : null;
}

runBoth('memo/proxy chain collapses through the plan', 'var q = globalThis.self.Array;', (adapter, prog, lbl) => {
  const receiver = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'Array').node;
  const plan = planMemoReadTarget(receiver, {
    aliasCtx: { adapter: null, scope: null, path: null },
    resolvePure: resolvePureGlobals,
  });
  check(`${ lbl } collapses`, plan?.plan?.kind, 'collapse');
  check(`${ lbl } no ctor swap`, plan?.pure, null);
});

// a receiver nothing resolves for keeps its own spelling: null is what tells the caller to
// re-read it verbatim, and only that remainder does
runBoth('memo/unresolvable receiver declines', 'var q = user.thing.Array;', (adapter, prog, lbl) => {
  const receiver = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'Array').node;
  check(lbl, planMemoReadTarget(receiver, {
    aliasCtx: { adapter: null, scope: null, path: null },
    resolvePure: resolvePureGlobals,
  }), null);
});

// the sequence prefix around the receiver is peeled off and handed back separately - it has to
// run once, ahead of the binding, and the collapse target is the tail
runBoth('memo/sequence prefix is peeled off the tail', 'var q = (c++, globalThis.self.Array);', (adapter, prog, lbl) => {
  const receiver = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'Array').node;
  const seq = adapter.pickPath(prog, 'SequenceExpression');
  const plan = planMemoReadTarget(seq ? seq.node : receiver, {
    aliasCtx: { adapter: null, scope: null, path: null },
    resolvePure: resolvePureGlobals,
  });
  check(`${ lbl } prefix length`, plan?.prefix?.length, 1);
  check(`${ lbl } tail is the nav`, plan?.tail?.property?.name, 'Array');
});

// --- planCatchClauseExtraction: whether the catch param has to become a `_ref` ---

function catchResolvePure(meta) {
  return meta.kind === 'property' && meta.key === 'at'
    ? { entry: 'actual/instance/at', hintName: 'at', kind: 'instance' } : null;
}

function planCatch(adapter, prog) {
  const clause = adapter.pickPath(prog, 'CatchClause');
  return planCatchClauseExtraction({
    paramNode: clause.node.param,
    bodyNode: clause.node.body,
    scope: clause.scope,
    adapter: { isStringLiteral: () => false, getStringValue: n => n.value, hasBinding: () => false, getBinding: () => null },
    path: clause,
    resolvePure: catchResolvePure,
    walkNode: (root, visit) => {
      const stack = [[root, null]];
      while (stack.length) {
        const [node, parent] = stack.pop();
        if (!node || typeof node !== 'object' || !node.type) continue;
        visit(node, parent);
        for (const value of Object.values(node)) {
          if (Array.isArray(value)) for (const item of value) stack.push([item, node]);
          else stack.push([value, node]);
        }
      }
    },
  });
}

runBoth('catch/a read resolvable prop relocates', 'try { f(); } catch ({ at }) { use(at); }', (adapter, prog, lbl) => {
  const plan = planCatch(adapter, prog);
  checkTruthy(`${ lbl } plans`, plan);
  check(`${ lbl } nothing skipped`, plan?.unobservable.length, 0);
});

// an UNREAD binding buys an import plus a dead dispatcher call - the pattern stays native
runBoth('catch/an unread resolvable prop declines', 'try { f(); } catch ({ at }) { g(); }', (adapter, prog, lbl) => {
  check(lbl, planCatch(adapter, prog), null);
});

// a name nothing resolves for is not a candidate at all
runBoth('catch/an unresolvable prop declines', 'try { f(); } catch ({ message }) { use(message); }', (adapter, prog, lbl) => {
  check(lbl, planCatch(adapter, prog), null);
});

// positional bindings can't be rewritten by key, so an array pattern is left alone
runBoth('catch/an array pattern declines', 'try { f(); } catch ([at]) { use(at); }', (adapter, prog, lbl) => {
  check(lbl, planCatch(adapter, prog), null);
});

runBoth('catch/a bare param declines', 'try { f(); } catch (e) { use(e); }', (adapter, prog, lbl) => {
  check(lbl, planCatch(adapter, prog), null);
});

// a read prop beside an unread one relocates for the read one and hands the other back, so the
// binding can leave it a native read in the residual
runBoth('catch/an unread sibling comes back to be skipped',
  'try { f(); } catch ({ at, message }) { use(at); }', (adapter, prog, lbl) => {
    const plan = planCatch(adapter, prog);
    checkTruthy(`${ lbl } plans`, plan);
    check(`${ lbl } skips nothing readable`, plan?.unobservable.length, 0);
  });

// --- sentinelAlreadyProcessed: our own output, recognised ---

function injectorFor({ generated = [], adopted = [], pureImports = {} } = {}) {
  return {
    hasGeneratedUnusedName: name => generated.includes(name),
    isAdoptedUnusedName: name => adopted.includes(name),
    getPureImport: name => pureImports[name] ?? null,
  };
}

runBoth('sentinel/our own unused name is processed', 'const { from: _unused } = R;', (adapter, prog, lbl) => {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const propPath = adapter.pickPath(prog, type);
  check(lbl, sentinelAlreadyProcessed(propPath, {
    node: propPath.node, meta: null, injector: injectorFor({ generated: ['_unused'] }),
  }), true);
});

// an ADOPTED name (a prior pass's, or a user's own) only skips while OUR extraction of this key
// stands beside it - here nothing does, so the prop keeps its rewrite
runBoth('sentinel/an adopted name with no extraction sibling is not', 'const { from: _unused } = R;', (adapter, prog, lbl) => {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const propPath = adapter.pickPath(prog, type);
  check(lbl, sentinelAlreadyProcessed(propPath, {
    node: propPath.node, meta: null, injector: injectorFor({ generated: ['_unused'], adopted: ['_unused'] }),
  }), false);
});

runBoth('sentinel/a live binding is not a sentinel', 'const { from: f } = R;', (adapter, prog, lbl) => {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const propPath = adapter.pickPath(prog, type);
  check(lbl, sentinelAlreadyProcessed(propPath, {
    node: propPath.node, meta: null, injector: injectorFor({ generated: ['_unused'] }),
  }), false);
});

// a PATTERN-valued prop has no name to test at all
runBoth('sentinel/a pattern value is not a sentinel', 'const { Array: { from } } = R;', (adapter, prog, lbl) => {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const propPath = adapter.pickPath(prog, type, p => p.node.key?.name === 'Array');
  check(lbl, sentinelAlreadyProcessed(propPath, {
    node: propPath.node, meta: null, injector: injectorFor({ generated: ['_unused'] }),
  }), false);
});

// an ADOPTED sentinel standing in a PARAM pattern is answered by the function's BODY, where
// our own extraction for that key went - reading the list the FUNCTION sits in finds nothing,
// and the next pass re-extracts the sentinel as a live binding
runBoth('sentinel/a param sentinel reads its extraction from the body',
  'function f({ from: _unused, ...rest } = R) { let from = _Array$from; return from([1]); }',
  (adapter, prog, lbl) => {
    const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
    const propPath = adapter.pickPath(prog, type, p => p.node.key?.name === 'from');
    check(lbl, sentinelAlreadyProcessed(propPath, {
      node: propPath.node,
      meta: { key: 'from' },
      injector: injectorFor({
        generated: ['_unused'],
        adopted: ['_unused'],
        pureImports: { _Array$from: { entry: 'actual/array/from' } },
      }),
    }), true);
  });

// ... and with no extraction beside it in that body the sentinel is a live binding again
runBoth('sentinel/a param sentinel with no body extraction is not processed',
  'function f({ from: _unused, ...rest } = R) { return 1; }',
  (adapter, prog, lbl) => {
    const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
    const propPath = adapter.pickPath(prog, type, p => p.node.key?.name === 'from');
    check(lbl, sentinelAlreadyProcessed(propPath, {
      node: propPath.node,
      meta: { key: 'from' },
      injector: injectorFor({
        generated: ['_unused'],
        adopted: ['_unused'],
        pureImports: { _Array$from: { entry: 'actual/array/from' } },
      }),
    }), false);
  });

// --- buildNestedDestructurePlan: the sole-constructor-hop anchor honours the opt-out ---
// a `{ K: { leaf } }` pattern over the proxy root anchors its residual on K's ponyfill constructor;
// with the directive on the hop line or on a leaf under it the plan has to decline the anchor -
// the static the opt-out kept from being imported is missing on the ponyfill, so the residual
// must stay the raw read off the realm object. the opt-out arrives as the per-prop predicate
{
  const code = 'const {\n  Map: {\n    groupBy,\n  },\n} = globalThis;\nuse(groupBy);';
  const pureStubs = {
    resolvePure: () => ({ entry: 'actual/map/group-by', hintName: 'Map$groupBy' }),
    resolveGlobalPolyfill: name => name === 'Map' ? { entry: 'actual/map/constructor', hintName: 'Map' }
      : name === 'globalThis' ? { entry: 'actual/global-this', hintName: 'globalThis' } : null,
  };
  // the plan asks the adapter the questions of a whole detection run (mutated slots, bindings,
  // shadows); the harness adapters carry none of them, and every one answers "nothing" here.
  // the undirected control below is what proves the shim reaches the anchor at all
  function planFor(adapter, prog, isDisabledProp) {
    const path = adapter.pickPath(prog, 'VariableDeclarator');
    const planAdapter = new Proxy(adapter, { get: (target, key) => key in target ? target[key] : () => null });
    return buildNestedDestructurePlan({ declarator: path.node, scope: path.scope, adapter: planAdapter, path, ...pureStubs, isDisabledProp });
  }
  // babel carries `loc`, oxc offsets only - the same two spellings the directive scan reads
  const offsetToLine = buildOffsetToLine(code);
  function lineOf(node) {
    return node.loc?.start?.line ?? offsetToLine(node.start);
  }
  runBoth('plan/sole ctor hop anchors without an opt-out', code, (adapter, prog, lbl) => {
    check(lbl, planFor(adapter, prog, null)?.anchor, 'Map');
  });
  runBoth('plan/an opt-out on the hop line declines the anchor', code, (adapter, prog, lbl) => {
    check(lbl, planFor(adapter, prog, prop => lineOf(prop) === 2)?.anchor, undefined);
  });
  runBoth('plan/an opt-out on the leaf line declines the anchor', code, (adapter, prog, lbl) => {
    check(lbl, planFor(adapter, prog, prop => lineOf(prop) === 3)?.anchor, undefined);
  });
}

finish();
