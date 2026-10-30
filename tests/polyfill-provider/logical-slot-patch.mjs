// Logical patches share one admission and renderer, with a live fallback and a cloned receiver.
import { planLogicalSlotPatch } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { logicalSlotPatchHost } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { cloneNode, hostSlot, identifier, renderLogicalSlotPatch } from '../../packages/core-js-polyfill-provider/render.js';
import { createChecker } from './harness.mjs';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';

const { check, checkDeep, finish, runBoth } = createChecker('logical-slot-patch');
const metadata = { kind: 'property', key: 'at' };
const pure = { kind: 'instance', entry: 'array/instance/at', hintName: 'at' };
const tests = { isPureImportSource: source => source.startsWith('@core-js/pure/'), isOwnPassBinding: () => false };

for (const [target, operator] of [
  ['rows.at', '||='],
  ['(rows.at)', '??='],
  ['(rows.at as any)', '||='],
  ['rows.at!', '??='],
  ['((rows.at as any)!)', '??='],
  ['rows[(effect(), "at")]', '||='],
  ['getRows().at', '??='],
  ['(effect(), rows).at', '||='],
  ['rows[(rows = other, "at")]', '||='],
]) runBoth(`admit/${ target }/${ operator }`, `${ target } ${ operator } before();`, (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression');
  const original = JSON.stringify(program.node);
  const skippedNodes = new WeakSet();
  let resolutions = 0;
  const options = {
    tests,
    skippedNodes,
    ctx: { path, scope: path.scope, adapter: (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' }) },
    resolvePure(meta, member) {
      check(`${ label } same member`, member === path, true);
      check(`${ label } same metadata`, meta === metadata, true);
      resolutions++;
      return pure;
    },
  };
  const plan = planLogicalSlotPatch(metadata, path, options);
  check(`${ label } operator`, plan.operator, operator.slice(0, -1));
  check(`${ label } member receiver through wrappers`, plan.receiverNode === path.node.object, true);
  check(`${ label } pure decision retained`, plan.pure === pure, true);
  check(`${ label } no source edits`, JSON.stringify(program.node), original);
  check(`${ label } no hidden skip registration`, skippedNodes.has(plan.host), false);
  check(`${ label } one resolution`, resolutions, 1);

  // A nested claim may replace the fallback after the query and before rendering.
  const currentRhs = identifier('after');
  plan.host.right = currentRhs;
  const beforeRender = JSON.stringify(program.node);
  const imports = [];
  let clones = 0;
  let captures = 0;
  const product = renderLogicalSlotPatch(plan, {
    injectImport(entry, hint) { imports.push([entry, hint]); return '_lookup'; },
    cloneReceiver(node) { clones++; return cloneNode(node); },
    mintRef() { captures++; return '_held'; },
  });
  checkDeep(`${ label } one import`, imports, [[pure.entry, pure.hintName]]);
  check(`${ label } cloned repeated receivers`, clones, 1 + Number(plan.computed));
  check(`${ label } one required capture`, captures, Number(plan.receiverMemo.capture));
  const { expression } = product;
  const lookup = expression.left;
  const firstRead = plan.computed ? lookup.arguments[0].expressions[0] : lookup.arguments[0];
  check(`${ label } dispatch is the condition`, lookup.callee.name, '_lookup');
  check(`${ label } one conditional operator`, expression.operator, operator.slice(0, -1));
  check(`${ label } fallback writes without reading again`, expression.right.operator, '=');
  checkDeep(`${ label } repeated receiver`, product.receiver, plan.receiverMemo.capture ? identifier('_held') : plan.receiverMemo.receiver);
  check(`${ label } repeated receiver cloned`, product.receiver === plan.receiverMemo.receiver, false);
  check(`${ label } first read retains source identity`, (captures ? firstRead.right : firstRead) === plan.receiverNode, true);
  check(`${ label } live target moves unchanged`, expression.right.left === plan.host.left, true);
  check(`${ label } live RHS moves unchanged`, expression.right.right === currentRhs, true);
  if (plan.computed) {
    check(`${ label } key follows receiver before dispatch`, lookup.arguments[0].expressions[1] === plan.keyNode, true);
    check(`${ label } assignment uses the proven key`, product.property.value, 'at');
  } else check(`${ label } noncomputed key remains opaque`, product.property === plan.keyNode, true);
  check(`${ label } render does not assign`, JSON.stringify(program.node), beforeRender);
  const embedded = renderLogicalSlotPatch(plan, { injectImport: () => '_lookup', cloneReceiver: cloneNode, mintRef: () => '_held', embed: hostSlot });
  checkDeep(`${ label } host RHS is opaque`, embedded.expression.right.right, hostSlot(currentRhs));
  skippedNodes.add(plan.host);
  check(`${ label } already applied host refuses`, planLogicalSlotPatch(metadata, path, options), null);
});

for (const [source, capture] of [
  ['const rows = []; rows.at ||= patch;', false],
  ['const rows = []; (effect(), rows).at ||= patch;', false],
  ['let rows = []; rows[(rows = other, "at")] ||= patch;', true],
  ['getRows().at ||= patch;', true],
  ['holder.rows.at ||= patch;', true],
]) runBoth(`snapshot/${ source }`, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression');
  const plan = planLogicalSlotPatch(metadata, path, {
    tests, skippedNodes: new WeakSet(), resolvePure: () => pure,
    ctx: { path, scope: path.scope, adapter: (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' }) },
  });
  check(`${ label } capture required`, plan.receiverMemo.capture, capture);
});

for (const source of ['rows.at &&= patch;', 'rows.at = patch;', 'rows.at++;', 'other = rows.at;', 'rows.at;', 'class Box extends Base { install() { super.at ||= patch; } }']) {
  runBoth(`source refusal/${ source }`, source, (parser, program, label) => {
    const path = parser.pickPath(program, 'MemberExpression');
    check(`${ label } finder`, logicalSlotPatchHost(path), null);
    check(`${ label } no resolution`, planLogicalSlotPatch(metadata, path, {
      tests, skippedNodes: new WeakSet(), resolvePure() { throw new Error('Refused source reached resolution'); },
    }), null);
  });
}

for (const kind of [null, 'static', 'global']) runBoth(`pure refusal/${ kind }`, 'rows.at ||= patch;', (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression');
  check(label, planLogicalSlotPatch(metadata, path, {
    tests, skippedNodes: new WeakSet(), resolvePure: () => kind && { ...pure, kind },
  }), null);
});

for (const [name, source, owned] of [
  ['prior pass', 'import lookup from "@core-js/pure/actual/array/instance/at"; rows.at ||= lookup(rows) || patch;', true],
  ['wrapped prior pass', 'import lookup from "@core-js/pure/actual/array/instance/at"; (rows.at as any) ??= lookup(rows) ?? patch;', true],
  ['different operator', 'import lookup from "@core-js/pure/actual/array/instance/at"; rows.at ||= lookup(rows) ?? patch;', false],
  ['foreign import', 'import lookup from "other"; rows.at ||= lookup(rows) || patch;', false],
  ['shadowed binding', 'import lookup from "@core-js/pure/actual/array/instance/at"; function read(lookup) { rows.at ||= lookup(rows) || patch; }', false],
]) runBoth(`own output/${ name }`, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression');
  let resolutions = 0;
  const options = {
    tests,
    skippedNodes: new WeakSet(),
    resolvePure() {
      resolutions++;
      return pure;
    },
  };
  check(`${ label } refused`, planLogicalSlotPatch(metadata, path, options) === null, owned);
  check(`${ label } refusal before resolution`, resolutions, owned ? 0 : 1);
  check(`${ label } current pass is not prior output`, planLogicalSlotPatch(metadata, path, {
    ...options, tests: { ...tests, isOwnPassBinding: () => true },
  }) !== null, true);
});

finish();
