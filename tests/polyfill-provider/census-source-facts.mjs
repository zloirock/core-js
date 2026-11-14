// Census answers belong to a source site in one program, including copies of that site.
import { adapters, createChecker, findNode } from './harness.mjs';
import {
  classStaticCallSlot, collectFileCensus, LOCAL_MEMBER_CALLEES, PARAMETER_STATIC_SOURCES,
  privateNameSpelling, sourceCensusFact,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { cloneNode } from '../../packages/core-js-polyfill-provider/render.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, finish } = createChecker('census-source-facts');
const source = 'const o = { make() { return Array; } }; o.make().from([]); ((P) => P.allSettled)(Promise);';
for (const parser of adapters) {
  const path = parser.parseAndScope(source);
  function scan() { return collectFileCensus(path.node, [mutationShapesReducer(null), escapedCtorReferencesReducer()]); }
  scan();
  const member = findNode(path.node, node => node.type === 'MemberExpression' && node.property.name === 'make');
  const [parameter] = findNode(path.node, node => node.type === 'ArrowFunctionExpression').params;
  for (const [name, table, node] of [['member', LOCAL_MEMBER_CALLEES, member], ['parameter', PARAMETER_STATIC_SOURCES, parameter]]) {
    const fact = sourceCensusFact(table, node, path);
    check(`${ parser.name }/${ name }: proof is live`, Boolean(fact), true);
    check(`${ parser.name }/${ name }: source clone`, sourceCensusFact(table, cloneNode(node), path), fact);
    check(`${ parser.name }/${ name }: no invented site`, sourceCensusFact(table, { type: node.type }, path), undefined);
    const foreign = parser.parseAndScope(source);
    check(`${ parser.name }/${ name }: another parse`, sourceCensusFact(table, node, foreign), undefined);
    check(`${ parser.name }/${ name }: detached path`, sourceCensusFact(table, node, null), undefined);
  }
  const first = LOCAL_MEMBER_CALLEES.get(path.node);
  scan();
  check(`${ parser.name }: recensus replaces table`, LOCAL_MEMBER_CALLEES.get(path.node) !== first, true);
  path.node.body = [];
  scan();
  check(`${ parser.name }: recensus drops obsolete member`, sourceCensusFact(LOCAL_MEMBER_CALLEES, member, path), undefined);
  check(`${ parser.name }: recensus drops obsolete parameter`, sourceCensusFact(PARAMETER_STATIC_SOURCES, parameter, path), undefined);
  for (const reversed of [false, true]) {
    const parts = ['static #m() { return Array; }', 'static ["#m"]() { return Promise; }'];
    const [classNode] = parser.parseAndScope(`class F { ${ (reversed ? parts.reverse() : parts).join(' ') } }`).node.body;
    const selected = classStaticCallSlot(classNode, '#m', true);
    check(`${ parser.name }/${ reversed }: private declaration`, privateNameSpelling(selected?.key), '#m');
    check(`${ parser.name }/${ reversed }: public declaration is separate`, classStaticCallSlot(classNode, '#m') !== selected, true);
    check(`${ parser.name }/${ reversed }: public declaration is live`, Boolean(classStaticCallSlot(classNode, '#m')), true);
  }
  const privatePath = parser.parseAndScope('class F { static #read(C) { return C.from([]); } static run() { return F.#read(Array); } } F.run();');
  collectFileCensus(privatePath.node, [mutationShapesReducer(null), escapedCtorReferencesReducer()]);
  const [privateParameter] = findNode(privatePath.node, node => node.params?.[0]?.name === 'C').params;
  check(`${ parser.name }: private key keeps callers closed`, sourceCensusFact(PARAMETER_STATIC_SOURCES, privateParameter, privatePath), 'Array');
}
finish();
