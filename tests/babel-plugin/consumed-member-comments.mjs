// Consuming a member must preserve the complete lexical comment sequence, including nested calls.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';
import plugin from '../../packages/core-js-babel-plugin/index.js';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parseAsync, transformAsync } = requireBabel('@babel/core');
const { checkDeep, check, finish } = createChecker('consumed-member-comments');
const config = { filename: 'input.mjs', configFile: false, babelrc: false };
async function signature(source) {
  return (await parseAsync(source, config)).comments.map(({ type, value }) => [type, value]);
}
check('missing comment detector', (await signature('Array /* a */.from([])')).length === (await signature('Array.from([])')).length, false);
check('reordered comment detector', JSON.stringify(await signature('x /* a */ /* b */')) === JSON.stringify(await signature('x /* b */ /* a */')), false);

for (const source of [
  'Array /* a */ . /* b */ from /* c */ (/* arg */ [1]);',
  'globalThis /* a */ . /* b */ Array /* c */ . /* d */ from /* e */ ([1]);',
  '[1] /* a */ . /* b */ at /* c */ (/* arg */ 0);',
  '[1] /* a */ . /* b */ slice(0) /* c */ . /* d */ at /* e */ (0);',
  'list /* a */ ?. /* b */ at /* c */ (/* arg */ 0);',
  'Array /* a */ [/* b */ "from" /* c */](/* arg */ [1]);',
  '[1] /* a */ [/* b */ "at" /* c */](/* arg */ 0);',
  '[1][Symbol.iterator](/* inner */);',
  "Array['fr' /* key */ + 'om']([1]);",
  "[1]['a' /* key */ + 't'](0);",
  "Array[(() => /* key */ 'from')()]([1]);",
  '(() => /* receiver */ Array)().from([1]);',
  "Array /* receiver */ [/* effect */ effect(), /* key */ 'from']([1]);",
  "[1] /* receiver */ [/* effect */ effect(), /* key */ 'at'](0);",

]) for (const parens of [false, true]) for (const method of ['usage-global', 'usage-pure']) {
  let output = `(/* head */ 0, ${ source.slice(0, -1) } /* tail */);`;
  const expected = await signature(output);
  for (let pass = 1; pass <= 2; pass++) {
    output = (await transformAsync(output, {
      ...config, parserOpts: { createParenthesizedExpressions: parens },
      plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }]],
    })).code;
    checkDeep(`${ method }: parens ${ parens }: pass ${ pass }: ${ source }`, await signature(output), expected);
  }
}

// Babel prints a retained shorthand default through its value. The main visitor
// keeps its key comments there after usage walks, including on later passes.
for (const [label, source] of [
  ['custom key', 'function read({custom /* key */ = /* right */ 7} = {}) { /* body */ return custom; } export const r = read();'],
  ['shorthand default', `function read({at /* key */ = /* right */ (() => { /* inside */ return 7; })()} = [1]) {
    /* body */ return at;
  } export const r = typeof read();`],
  ['aliased arrow', 'const read = ({at /* key */ = /* right */ 7} = [1]) => at; export const r = typeof read();'],
  ['renamed slot', `function read({at /* key */: /* value */ method = /* right */ 7} = [1]) {
    /* body */ return method;
  } export const r = typeof read();`],
  ['computed key', `function read({['at' /* key */]: /* value */ method = /* right */ 7} = [1]) {
    /* body */ return method;
  } export const r = typeof read();`],
  ['sibling defaults', `function read({at /* first key */ = /* first right */ 7,
    flat /* next key */ = /* next right */ 9} = [1]) {
    /* body */ return [typeof at, typeof flat];
  } export const r = read();`],
  ['supplied undefined', `function read({at /* key */ = /* right */ (() => 17)} = [1]) {
    /* body */ return at.call([9], 0);
  } export const r = [read(), read({at: undefined}), read({at: () => 8})];`],
  ['leaf default', `function read({at /* key */ = /* right */ 17}) {
    /* body */ return at;
  } export const r = read({at: undefined});`],
]) for (const parens of [false, true]) for (const method of ['usage-pure', 'usage-global', 'entry-global']) {
  let output = source;
  const expected = await signature(source);
  for (let pass = 1; pass <= 2; pass++) {
    output = (await transformAsync(output, {
      ...config, parserOpts: { createParenthesizedExpressions: parens },
      plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }]],
    })).code;
    checkDeep(`parameter default comments/${ method }/${ label }/parens ${ parens }/pass ${ pass }`, await signature(output), expected);
  }
}
// A synth swaps only the receiver: its retained pattern owns ordinary key comments.
for (const [label, source] of [
  ['plain native key', 'export function read({from,length /* native key */:size}=Array){return[from([4])[0],size]} export const r=read();'],
  ['selected native key', `const flag=Function('return true')();
    export function read({from,length /* native key */:size}=flag?Array:Object){return[from([4])[0],size]}
    export const r=read();`],
  ['quoted native key', "export function read({from,'length' /* native key */:size}=Array){return[from([4])[0],size]} export const r=read();"],
  ['effectful native key', `const events=[];
    export function read({from,[(events.push('key'),'length')] /* native key */:size}=Array){return[from([4])[0],size,events]}
    export const r=read();`],
  ['computed instance key', "export function read({at,['length'] /* native key */:size}=[1]){return[at.call([4],0),size]} export const r=read();"],
]) for (const parens of [false, true]) {
  let output = source;
  const expected = await signature(source);
  for (let pass = 1; pass <= 2; pass++) {
    output = (await transformAsync(output, {
      ...config, parserOpts: { createParenthesizedExpressions: parens },
      plugins: [[plugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
    })).code;
    checkDeep(`synth key comments/${ label }/parens ${ parens }/pass ${ pass }`, await signature(output), expected);
  }
}

// Opted-out native reads still need their anchors in the synthesized receiver on re-entry.
for (const directive of ['from /* opted key */ /* core-js-disable-line */', '// core-js-disable-next-line\nfrom /* opted key */']) {
  const source = `function fallback(){return['fallback']}
    export function read({
      ${ directive }=fallback,
      of,
      'length' /* native key */:size
    }=Array){return[from([4])[0],of(4)[0],size]}
    export const r=read();`;
  let output = source;
  for (let pass = 1; pass <= 2; pass++) {
    output = (await transformAsync(output, {
      ...config, plugins: [[plugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
    })).code;
    const ast = await parseAsync(output, config);
    checkDeep(`synth opt-out/${ directive }/pass ${ pass }/only the covered sibling imports`,
      ast.program.body.filter(node => node.type === 'ImportDeclaration').map(node => node.source.value),
      ['@core-js/pure/actual/array/of']);
    check(`synth opt-out/${ directive }/pass ${ pass }/ordinary comments stay single`,
      ast.comments.filter(comment => comment.value.trim() === 'native key').length, 1);
    check(`synth opt-out/${ directive }/pass ${ pass }/the original opted-out key owns its ordinary comment`,
      ast.comments.filter(comment => comment.value.trim() === 'opted key').length, 1);
  }
}

// A split retires sequence and paren containers, plus quiet literals. Their trivia stays
// beside the surviving products, using the original comment identities for printer deduplication.
for (const [label, source] of [
  ['receiver prefix', `import readMethod from '@core-js/pure/actual/string/instance/ends-with';
    let ctor,proto,method,memo,sibling;const receiver={Ctor:String,sibling:7};
    (/* receiver prefix */ (touch(),receiver),({Ctor:ctor}=receiver),({prototype:proto}=ctor),
    method=(memo=readMethod(proto))===void 0?/* method default */fallback():memo,({sibling:sibling}=receiver));`],
  ['ordered heads', `export function read(receiver,value){
    // statement head
    (/* sequence head */ (/* inner head */ receiver,value),({value:value}=receiver) /* tail */);return value;}`],
  ['nested split', '(/* outer head */(before(),({custom}=source)),/* nested head */(after(),({other}=source))/* outer tail */);'],
  ['nested tail owners', '(before(),(tick(),({custom}=source)/* leaf tail */)/* nested tail */,after());'],
  ['paren head', '(/* wrapper */((before(),source),({custom}=source)));'],
  ['paren tail', '((before(),source),({custom}=source))/* wrapper tail */;'],
  ['quiet middle', '(({custom}=source),/* quiet middle */0,use(custom));'],
  ['quiet tail', '(({custom}=source),/* quiet tail */0/* quiet end */);'],
  ['quiet wrapper', '(/* quiet wrapper */((0)),({custom}=source));'],
  ['quiet string', 'export function read(){let custom;(/* quiet string */"use strict",({custom}=source));return this;}'],
  ['entry joined require', '/* entry statement */(/* entry outer */require("core-js/actual/array/at"),/* entry quiet */0,use());'],
]) for (const parens of [false, true]) for (const method of ['usage-pure', 'usage-global', 'entry-global']) {
  const expected = await signature(source);
  let output = source;
  for (let pass = 1; pass <= 2; pass++) {
    output = (await transformAsync(output, {
      ...config, parserOpts: { createParenthesizedExpressions: parens },
      plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }]],
    })).code;
    checkDeep(`split comments/${ label }/${ method }/parens ${ parens }/pass ${ pass }`, await signature(output), expected);
    if (label === 'quiet string') {
      const ast = await parseAsync(output, config);
      const fn = ast.program.body.find(node => node.type === 'ExportNamedDeclaration').declaration;
      check(`split comments/${ method }/parens ${ parens }/pass ${ pass }/no promoted directive`, fn.body.directives.length, 0);
    }
  }
}

// Retired containers forward the source comment objects across the Babel insertion boundary.
for (const parens of [false, true]) {
  let owners;
  await transformAsync('(/* sequence head */before(),({custom}=source),after())/* sequence tail */;', {
    ...config, parserOpts: { createParenthesizedExpressions: parens },
    plugins: [() => ({ post(file) {
      const { comments } = file.ast;
      const { body } = file.ast.program;
      owners = ['sequence head', 'sequence tail'].map((value, index) => {
        const comment = comments.find(item => item.value.trim() === value);
        return (index ? body.at(-1).trailingComments : body[0].leadingComments)?.includes(comment);
      });
    } }), [plugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  checkDeep(`split comments/parens ${ parens }/source identities survive insertion`, owners, [true, true]);
}

// Source-line coverage is kept by the existing directive anchors when splitting reflows it.
// A prefix next-line over the sequence's first literal covers the entire source sequence.
for (const [label, source, names] of [
  ['line', 'let at,flat;\n(({at}=[1]),({flat}=[[1]])/* core-js-disable-line */);', []],
  ['wrapper next-line', 'let at,flat;\n(\n// core-js-disable-next-line\n(({at}=[1]),({flat}=[[1]]))\n);', []],
  ['removed prefix', 'let at,flat;\n(\n// core-js-disable-next-line\n0,\n({at}=[1]),({flat}=[[1]])\n);', []],
  ['removed tail', 'let at,flat;\n(\n({at}=[1]),\n({flat}=[[1]]),0 // core-js-disable-line\n);', ['at']],
  ['uncovered inverse', 'let at,flat;\n(({at}=[1]),({flat}=[[1]]));', ['at', 'flat']],
]) for (const parens of [false, true]) for (const method of ['usage-pure', 'usage-global']) {
  const expected = names.map(name => method === 'usage-pure'
    ? `@core-js/pure/actual/array/instance/${ name }` : `core-js/modules/es.array.${ name }`);
  if (method === 'usage-global' && names.includes('flat')) expected.push('core-js/modules/es.array.species', 'core-js/modules/es.array.unscopables.flat');
  let output = source;
  for (let pass = 1; pass <= 2; pass++) {
    output = (await transformAsync(output, {
      ...config, parserOpts: { createParenthesizedExpressions: parens },
      plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }]],
    })).code;
    const ast = await parseAsync(output, config);
    checkDeep(`split opt-out/${ label }/${ method }/parens ${ parens }/pass ${ pass }`,
      ast.program.body.filter(node => node.type === 'ImportDeclaration').map(node => node.source.value).sort(), expected.toSorted());
  }
}

finish();
