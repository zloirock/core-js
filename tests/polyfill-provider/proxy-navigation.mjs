// Route selection must preserve the deleted extent, source identity and the timing
// of a declined native attempt. Neither a guard nor a retained write is disposable.
import {
  navGuardCollapseRoutes,
  proxyHopClaimRoutes,
  staticClaimNavigationRoutes,
  staticClaimNeedsGuard,
  navGuardKeepsStoredProbe,
} from '../../packages/core-js-polyfill-provider/detect-usage/proxy-navigation.js';
import { canCollapseDeletedNavigation, planProvenNavGuardCollapse } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('proxy-navigation');
function resolvePure({ name }) {
  return ['globalThis', 'self', 'Array'].includes(name) ? { entry: name, hintName: name } : null;
}
function context(parser, path) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  return { scope: path.scope, path, adapter };
}

for (const [expression, folds] of [
  ['globalThis.self.chrome', true],
  ['globalThis.window?.self.chrome', false],
  ['globalThis.self?.chrome', true],
  ['globalThis?.self.chrome', true],
  ['(held = globalThis.window)?.self.chrome', false],
  ['(held = (effect(), globalThis.window))?.self.chrome', false],
  ['(before(), held = (effect(), globalThis.window))?.self.chrome', false],
  ['(held = globalThis).self.chrome', true],
  ['(() => globalThis.window)()?.self.chrome', false],
  ['(() => globalThis)()?.self.chrome', true],
]) runBoth(`delete/${ expression }`, `let held; delete ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'UnaryExpression').get('argument');
  const aliasCtx = context(parser, path);
  const source = JSON.stringify(program.node);
  const facts = { hosted: true, guardNode: path.node, aliasCtx, resolvePure };
  check(`${ label }/deciding optional`, canCollapseDeletedNavigation(facts), folds);
  check(`${ label }/ordinary read`, canCollapseDeletedNavigation({ ...facts, hosted: false }), false);
  check(`${ label }/lowered test is read`, canCollapseDeletedNavigation({ ...facts, loweredGuardTest: true }), false);
  check(`${ label }/source stays intact`, JSON.stringify(program.node), source);
  for (const valueFormSpells of [false, true]) {
    const plan = { hops: [], resolvePure, valueFormSpells };
    const routes = [...navGuardCollapseRoutes(plan, { source: () => path.node, aliasCtx, deleteHosted: () => true })];
    checkDeep(`${ label }/value spelling ${ valueFormSpells }`, routes.map(route => route.kind),
      [folds ? valueFormSpells ? 'delete-collapse' : 'stand-down' : 'guard']);
  }
});

runBoth('claim versus whole run', 'delete globalThis.self.window?.self.chrome;', (parser, program, label) => {
  const path = parser.pickPath(program, 'UnaryExpression').get('argument');
  const aliasCtx = context(parser, path);
  const claim = parser.collectPaths(program, 'MemberExpression')
    .find(item => item.node.property.name === 'self' && item.node.object.type === 'Identifier').node;
  check(`${ label }/claim alone can fold`, canCollapseDeletedNavigation({ hosted: true, guardNode: claim, aliasCtx, resolvePure }), true);
  check(`${ label }/outer deciding guard stays`, canCollapseDeletedNavigation({ hosted: true, guardNode: path.node, aliasCtx, resolvePure }), false);
});

runBoth('collapse source and retained write', 'let held; const result = (held = globalThis).self;', (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression');
  const { node } = path;
  const aliasCtx = context(parser, path);
  const source = JSON.stringify(program.node);
  const facts = { node, above: path.parentPath.node, aliasCtx, resolvePure, hintName: 'self',
    sealed: false, stored: false, probeTest: false, deleteHosted: false, deleteFold: false, deleteClaimFold: () => false, deleteRunFold: () => false };
  const routes = [...proxyHopClaimRoutes(facts)];
  checkDeep(`${ label }/single collapse`, routes.map(route => route.kind), ['collapse']);
  check(`${ label }/retained write identity`, routes[0].collapsed.keptWrite, unwrapRuntimeExpr(node.object));
  check(`${ label }/effect identity`, routes[0].collapsed.effects[0], unwrapRuntimeExpr(node.object));
  check(`${ label }/source unchanged`, JSON.stringify(program.node), source);
});

runBoth('native continuation is lazy', 'const result = globalThis.self;', (parser, program, label) => {
  const path = parser.pickPath(program, 'Identifier', item => item.node.name === 'globalThis');
  const { node } = path;
  const aliasCtx = context(parser, path);
  let deleteQueries = 0;
  let runQueries = 0;
  let sourceRun = null;
  const routes = staticClaimNavigationRoutes({ node, kind: 'global', hintName: 'globalThis', meta: {}, aliasCtx, resolvePure,
    deletion() { deleteQueries++; return false; },
    sealedThrow() { throw new Error('a bare root has no sealed member read'); },
    rootRun() { runQueries++; return { run: sourceRun }; } });
  check(`${ label }/creation performs no query`, deleteQueries, 0);
  check(`${ label }/host first`, routes.next().value.kind, 'root-host');
  check(`${ label }/only initial consumer queried`, deleteQueries, 1);
  check(`${ label }/guard before collapse`, routes.next().value.kind, 'root-guard');
  check(`${ label }/run not read before native attempt`, runQueries, 0);
  sourceRun = { child: path.parentPath.node, consumer: path.parentPath.parentPath.node };
  const collapse = routes.next().value;
  check(`${ label }/current run`, collapse.run, sourceRun);
  check(`${ label }/root landing`, collapse.pure.entry, 'self');
  check(`${ label }/exhausted`, routes.next().done, true);
  check(`${ label }/one run query`, runQueries, 1);
  check(`${ label }/bare root needs no guard`, staticClaimNeedsGuard(node, () => true), false);
});

runBoth('mutated middle and deleted leaf differ', 'delete globalThis.window.self.chrome;', (parser, program, label) => {
  const path = parser.pickPath(program, 'UnaryExpression').get('argument');
  const aliasCtx = context(parser, path);
  const facts = { hosted: true, mutationPath: path, guardNode: path.node, aliasCtx, resolvePure };
  for (const [key, expected] of [['window', false], ['self', false], ['chrome', true]]) {
    aliasCtx.adapter = { ...aliasCtx.adapter, isMutatedStatic: (object, name) => object === 'globalThis' && name === key };
    check(`${ label }/${ key }`, canCollapseDeletedNavigation(facts), expected);
  }
});

for (const source of ['held = globalThis.window', 'before(), held = globalThis.window']) {
  for (const [tail, keepsStore] of [['chrome', false], ['box.chrome', true]]) runBoth(`stored absent probe under delete/${ source }/${ tail }`,
    `let held; delete (${ source })?.self.${ tail };`, (parser, program, label) => {
      const type = parser.name === 'babel' ? 'OptionalMemberExpression' : 'MemberExpression';
      const path = parser.pickPath(program, type, item => item.node.property.name === 'self');
      const aliasCtx = context(parser, path);
      const plan = planProvenNavGuardCollapse({ rootNode: path.node, ...aliasCtx, resolvePure,
        throughKeptAssign: true, allowSequenceRoot: true });
      check(`${ label }/plan owns the store`, plan.rootAssign, parser.pickPath(program, 'AssignmentExpression').node);
      check(`${ label }/delete keeps the stored probe`, navGuardKeepsStoredProbe(plan,
        { path, aliasCtx, invoked: false, deleteHosted: true }), keepsStore);
      check(`${ label }/read also keeps the store`, navGuardKeepsStoredProbe(plan,
        { path, aliasCtx, invoked: false, deleteHosted: false }), true);
      check(`${ label }/callee cannot drop its read`, navGuardKeepsStoredProbe(plan,
        { path, aliasCtx, invoked: true, deleteHosted: true }), false);
    });
}

for (const [expression, expected] of [
  ['(held = globalThis.window)?.self.Array', ['stored-probe']],
  ['(before(), held = (effect(), globalThis.window))?.self.Array', ['stored-probe']],
  ['(() => globalThis)()?.window?.self.window', ['root-guard', 'static-guard']],
]) runBoth(`hop priority/${ expression }`, `let held; const result = ${ expression };`, (parser, program, label) => {
  const type = parser.name === 'babel' ? 'OptionalMemberExpression' : 'MemberExpression';
  const path = parser.pickPath(program, type, item => item.node.property.name === 'self');
  const routes = proxyHopClaimRoutes({ node: path.node, above: path.parentPath.node, aliasCtx: context(parser, path),
    resolvePure, hintName: 'self', sealed: false, stored: false, probeTest: false,
    deleteHosted: false, deleteFold: false, deleteRunFold: () => false, deleteClaimFold: () => false });
  for (const kind of expected) check(`${ label }/${ kind }`, routes.next().value.kind, kind);
  routes.return();
});

runBoth('call-root priority and lazy landing', 'const result = (() => globalThis)().window.self;', (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'self');
  const call = parser.pickPath(program, 'CallExpression').node;
  const aliasCtx = context(parser, path);
  let reads = 0;
  let deletes = 0;
  const plan = { hops: [], call, rootName: 'globalThis', resolvePure };
  const facts = {
    aliasCtx,
    source() { reads++; return path.node; },
    deleteHosted() { deletes++; return false; },
  };
  const accepted = navGuardCollapseRoutes(plan, facts);
  check(`${ label }/receiver first`, accepted.next().value.kind, 'receiver-collapse');
  accepted.return();
  check(`${ label }/success avoids fallback reads`, reads, 0);
  check(`${ label }/success avoids delete query`, deletes, 0);
  const declined = navGuardCollapseRoutes(plan, facts);
  check(`${ label }/same initial choice`, declined.next().value.kind, 'receiver-collapse');
  const landing = declined.next().value;
  check(`${ label }/root fallback`, landing.kind, 'root-collapse');
  check(`${ label }/backed landing`, landing.pure.entry, 'self');
  check(`${ label }/one landing query`, reads, 1);
  check(`${ label }/guard last`, declined.next().value.kind, 'guard');
  check(`${ label }/delete queried after declines`, deletes, 1);
  check(`${ label }/finished`, declined.next().done, true);
});

finish();
