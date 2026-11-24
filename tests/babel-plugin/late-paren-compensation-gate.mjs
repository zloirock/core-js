// Unit tests for the gate on the LATE paren compensation - the pass that runs in `post()`, after
// every sibling's `Program:exit`. The early fold walk reports whether anything is still owed parens;
// when nothing is, the late pass may not re-walk the file it just finished walking, and descends only
// into the top-level nodes a sibling added since. That gated descent is worth ~12% of a plain file's
// transform time, and it is unreachable from the fixtures: they run core-js in ISOLATION, so nothing
// is ever inserted after our exit and the "what did the late pass still reach" question cannot be
// posed there at all. The three cases below pose it directly, through a sibling ordered AFTER core-js
// so its `Program:exit` lands between our exit and our `post()`.
// BABEL_REQUIRE_FROM mirrors the fixture runner's hook so the suite runs under babel@8 (default) and
// babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { createChecker } from '../polyfill-provider/harness.mjs';
import corejsPlugin from '../../packages/core-js-babel-plugin/index.js';
import { generatorWorkarounds } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync, transformSync, transformFromAstSync, traverse, version } = requireBabel('@babel/core');
const { parse } = requireBabel('@babel/parser');

const { checkTruthy, finish } = createChecker('late-paren-compensation-gate');

function parseTS(source) {
  return parse(source, { sourceType: 'module', plugins: ['typescript'] });
}

// sibling ordered AFTER core-js: its exit runs once ours already did, so what it plants here is
// exactly what only `post()` can still reach. `where` picks whether the plant lands in a NEW
// top-level statement or INSIDE one that was already there when we finished
function makeSiblingPlanting(where, observed) {
  return ({ types: t }) => ({
    visitor: {
      Program: {
        exit(programPath) {
          // Folding the argument records a visit even when the generator preserves the callee's parens itself.
          const planted = parseTS('(o?.f!)((g<number>)())').program.body[0].expression;
          observed.planted = planted;
          if (where === 'new-statement') {
            programPath.pushContainer('body', t.expressionStatement(planted));
          } else {
            programPath.node.body.at(-1).declarations[0].init = planted;
          }
        },
      },
    },
    // Read the tree after core-js's post().
    post() {
      observed.visited = observed.planted.arguments[0].callee.type === 'Identifier';
      observed.compensated = observed.planted.callee.type === 'ParenthesizedExpression';
    },
  });
}

// Drive the shipped fallback even when the installed generator already contains the fix.
// Only the advertised version changes; parsing, traversal and printing stay real.
function withBabelVersion(release) {
  return (api, options) => corejsPlugin(Object.create(api, {
    version: { value: release },
  }), options);
}

async function plant(where, source, parserPlugins = [], release = version) {
  const observed = {};
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: parserPlugins },
    plugins: [
      [withBabelVersion(release), { method: 'usage-global', version: '4.0', targets: { ie: 11 } }],
      makeSiblingPlanting(where, observed),
    ],
  });
  return { ...observed, code };
}

// a sibling-added TOP-LEVEL statement is what the gated descent exists to cover, and the whole
// reason the pass sits in `post()` rather than at our own exit
for (const [release, nonNull] of [['7.29.13', true], ['8.1.1', true], ['8.1.2', false]]) {
  const { visited, compensated } = await plant('new-statement', 'var a = [1, 2].flat();', [], release);
  checkTruthy(`sibling-added top-level statement is visited/${ release }`, visited);
  checkTruthy(`non-null parens are restored only when needed/${ release }`, compensated === nonNull);
}
const planted = await plant('new-statement', '');
checkTruthy('printed call ends the optional chain', parseTS(planted.code).program.body.at(-1).expression.type === 'CallExpression');

// the price of the gate, and the reason it is spelled as a gate rather than a full re-walk: a
// statement that was already there when we finished is not re-entered, so a sibling mutating INSIDE
// one is out of reach. What buys that back is a full AST walk on every file. The shape is out of
// reach only for a sibling that builds a new sealed chain inside an existing statement, so
// everything the early pass saw is still all there is. If the trade is revisited, this case says so
{
  const { visited } = await plant('in-existing-statement', 'var a = [1, 2].flat();');
  checkTruthy('nothing pending: an existing statement is not re-entered', !visited);
}

// and the flag is what decides, not luck: the SAME plant in the SAME position is reached once the
// file owes parens on its own, because then the late pass takes the full walk
{
  const { visited } = await plant('in-existing-statement', 'var a = [1, 2].flat();\nvar b = (o?.f)!();', ['typescript'], '8.1.1');
  checkTruthy('parens pending: the full walk reaches the same plant', visited);
}

// what makes a file owe them is the tag being an optional CHAIN, not its being tagged: a template
// tag is common enough that counting every one would hand the full walk to most files that use one
{
  const { visited } = await plant('in-existing-statement', 'var a = [1, 2].flat();\nvar b = String.raw`x`;');
  checkTruthy('a plain template tag does not owe parens, so the walk stays gated', !visited);
}

// Patched generators print both tag spellings without help. Older ones need the
// late walk, including when a TS wrapper sits between the tag and the optional chain.
for (const [release, instantiation, tag, write] of [
  ['7.29.7', true, true, true], ['7.29.12', false, true, true], ['7.29.13', false, false, true],
  ['8.0.4', true, true, true], ['8.0.5', true, false, true], ['8.0.10', false, false, false], ['8.1.0', false, false, false],
]) {
  const actual = generatorWorkarounds(release);
  checkTruthy(`workaround boundaries/${ release }`, actual.instantiation === instantiation && actual.tag === tag && actual.write === write);
}
for (const [release, pending] of [['7.29.11', true], ['7.29.12', false], ['8.0.9', true], ['8.0.10', false]]) {
  checkTruthy(`optional constructor workaround/${ release }`, generatorWorkarounds(release).newCallee === pending);
}
for (const release of [version, '7.29.7', '8.0.4']) {
  const workarounds = generatorWorkarounds(release);
  for (const source of ['(o?.f)`x`', '(o?.f!)`x`']) {
    const { visited, code } = await plant('in-existing-statement',
      `const tag = ${ source }; var seed = 0;`, ['typescript'], release);
    checkTruthy(`tag gets a late walk only on old generators: ${ release }/${ source }`, visited === workarounds.tag);
    checkTruthy(`tag remains grouped: ${ release }/${ source }`, code.includes(source));
  }

  for (const [source, pending] of [
    ['(fn<T>).member', workarounds.instantiation],
    ['(x as number)++', workarounds.write],
    ['(<number>obj.x) = value', workarounds.write],
  ]) {
    const { visited } = await plant('in-existing-statement', `const value = ${ source }; var seed = 0;`, ['typescript'], release);
    checkTruthy(`a fixed generator needs no late walk: ${ release }/${ source }`, visited === pending);
  }
}

for (const [release, legacy] of [['7.29.13', true], ['8.1.1', true], ['8.1.2-beta.0', true], ['8.1.2', false]]) {
  for (const [source, pending] of [
    ['(o?.f)!()', true], ['(o?.f!)()', legacy], ['(o?.f!).x', legacy], ['o?.f!()', false],
    ['(o?.f)!?.()', true], ['o?.f!?.()', false], ['use((o?.f)!)', true],
  ]) {
    const { visited, code } = await plant('in-existing-statement',
      `var b = ${ source };\nvar a = [1, 2].flat();`, ['typescript'], release);
    checkTruthy(`non-null seal schedules a late walk/${ release }/${ source }`, visited === pending);
    if (source.includes('(o?.f)!')) {
      checkTruthy(`grouping on the assertion operand survives/${ release }/${ source }`, code.includes(source), code);
    }
  }
}

// What the late pass DOES with what it reaches. The fold half runs early, ahead of the lowerings
// that misread the node - but an instantiation a later-ordered sibling inserts was never early, and
// the paren restoration alone covers only the shapes the fold leaves behind. So the fold runs here
// too. The stripped output must compile, and the reprint must preserve the outer expression:
// an arrow body, a ternary branch, an assignment or a logical operand can swallow a call.
const SHAPES = [
  ['slot-legal identifier', 'var r = (f<string>)(1);'],
  ['member callee', 'var r = (h.m<string>)(1);'],
  ['fusing cast', 'var r = ((f as any)<string>)(1);'],
  ['fusing update', 'var r = ((q++)<string>)(1);'],
  ['sequence operand', 'var r = ((q++, f)<string>)(1);'],
  ['arrow operand', 'var r = ((() => f)<string>)()(1);'],
  ['conditional operand', 'var r = ((c ? f : g)<string>)(1);'],
  ['assignment operand', 'var r = ((s = f)<string>)(1);'],
  ['logical operand', 'var r = ((f || g)<string>)(1);'],
  ['member tail', 'var r = (h<string>).m;'],
  ['computed tail', 'var r = (l<string>)[0];'],
  ['optional member tail', 'var r = (h<string>)?.m;'],
  ['new host', 'var r = new (C<string>)(1);'],
  ['tagged-template host', 'var r = (t<string>)`x`;'],
  ['conditional test', 'var r = ((s = f)<string>) ? 1 : 2;'],
  ['optional call host', 'var r = (h.m<string>)?.(1);'],
  ['optional call after a chain instantiation', 'var r = ((o?.f)<string>)?.(1);'],
  ['optional call after a non-null instantiation', 'var r = ((o.f!)<string>)?.(1);'],
  ['sealed instantiation call', 'var r = ((o?.f)<string>)(1);'],
  ['sealed non-null call', 'var r = (o?.f)!();'],
  ['sealed non-null member', 'var r = (o?.f)!.x;'],
  ['nested sealed assertion', 'var r = (o?.f!)!();'],
];

// Older traversal tables omit a parameter property's decorators in both the raw
// counter and the late restoration. Exercise the omission even on patched hosts.
// Keep the table swap synchronous: other unit modules can have pending transforms.
const traverseRequire = createRequire(createRequire(requireBabel.resolve('@babel/core')).resolve('@babel/traverse'));
const { VISITOR_KEYS } = traverseRequire('@babel/types');
const parameterKeys = VISITOR_KEYS.TSParameterProperty;
const decoratorParser = { plugins: ['typescript', 'decorators-legacy'] };
const typescript = requireBabel('@babel/plugin-transform-typescript');
function decoratorArgumentResult(code) {
  const cls = parse(code, decoratorParser).program.body.find(node => node.type === 'ClassDeclaration');
  const [argument] = cls.body.body[0].params[0].decorators[0].expression.arguments;
  const t = requireBabel('@babel/types');
  // Lower optionals too: a second print through an old generator can lose a tag's seal again.
  // eslint-disable-next-line node/no-sync -- the temporary traversal table must not leak to other unit modules
  const lowered = transformFromAstSync(t.file(t.program([t.expressionStatement(argument)])), null, {
    configFile: false, babelrc: false, plugins: [typescript, requireBabel('@babel/plugin-transform-optional-chaining')],
  }).code;
  try {
    return runInNewContext(lowered, { o: null, x: 1 });
  } catch (error) {
    return error.name;
  }
}

function checkDecoratorHosts(method, omitDecorators) {
  for (const createParenthesizedExpressions of [false, true]) {
    for (const parameter of ['value: unknown', 'public value: unknown', 'public value: unknown = 0']) {
      for (const late of [false, true]) {
        for (const directive of ['', '// core-js-disable-file\n']) {
          for (const [expression, expected] of [
            ['(o?.f)!()', 'TypeError'], ['o?.f!()', undefined],
            ['((o?.f)<number>)()', 'TypeError'], ['(o?.f)`x`', 'TypeError'],
            ['(x as number)++', 1],
          ]) {
            const source = `class C { constructor(@dec(${ expression }) ${ parameter }) {} }`;
            // eslint-disable-next-line node/no-sync -- the temporary traversal table must not leak to other unit modules
            const { code } = transformSync(directive + (late ? '' : source), {
              configFile: false, babelrc: false, filename: 'decorator-parens.ts',
              parserOpts: { ...decoratorParser, createParenthesizedExpressions },
              plugins: [
                ['@core-js', { method, targets: { ie: 11 } }],
                ...late ? [() => ({ visitor: {
                  Program: { exit(p) { p.pushContainer('body', parse(source, decoratorParser).program.body); } },
                } })] : [],
              ],
            });
            const label = `${ omitDecorators }/${ method }/${ createParenthesizedExpressions }/${ parameter }/${ late }/${ !!directive }`;
            checkTruthy(`decorator parens/${ label }/${ expression }`, decoratorArgumentResult(code) === expected);
          }
        }
      }
    }
  }
}

for (const omitDecorators of [false, true]) {
  try {
    if (omitDecorators) VISITOR_KEYS.TSParameterProperty = parameterKeys.filter(key => key !== 'decorators');
    const control = parse('class C { constructor(@dec public value: number) {} }', decoratorParser);
    checkTruthy(`parameter decorators/traversal control/${ omitDecorators }`,
      traverse.hasType(control, 'Decorator') === (!omitDecorators && parameterKeys.includes('decorators')));
    for (const method of ['entry-global', 'usage-global', 'usage-pure']) checkDecoratorHosts(method, omitDecorators);
  } finally {
    VISITOR_KEYS.TSParameterProperty = parameterKeys;
  }
}

// The generator must preserve which expression is updated or assigned, including when
// the source parser kept explicit parens. A successful reparse alone misses `<T>(x++)`.
for (const createParenthesizedExpressions of [false, true]) {
  const source = [
    '(x as number)++;',
    '--(x satisfies number);',
    '(<number>x)--;',
    '(<number>o.x) = value;',
    '({ x: (<number>o.x) = value } = source);',
    'x!++;',
  ].join('\n');
  const { code } = await transformAsync(source, {
    configFile: false, babelrc: false, filename: 'asserted-writes.ts',
    parserOpts: { plugins: ['typescript'], createParenthesizedExpressions },
    plugins: [['@core-js', { method: 'usage-pure', targets: { ie: 11 } }]],
  });
  checkTruthy(`asserted write targets round-trip/${ createParenthesizedExpressions }`,
    requireBabel('@babel/types').isNodesEquivalent(parseTS(source).program, parseTS(code).program));
}

// the planted statement's own top-level expression: what the whole thing evaluates AS
function plantedExpressionType(source) {
  const statement = parseTS(source).program.body.at(-1);
  return (statement.declarations?.[0]?.init ?? statement.expression).type;
}

function siblingPlanting(snippet) {
  return () => ({
    visitor: {
      Program: {
        exit(programPath) { programPath.pushContainer('body', parseTS(snippet).program.body); },
      },
    },
  });
}

const plantedDir = await fs.mkdtemp(path.join(os.tmpdir(), 'core-js-planted-'));
let plantedNumber = 0;
try {
  for (const release of [version, '7.29.7', '8.0.4']) {
    for (const [name, snippet] of SHAPES) {
      const { code } = await transformAsync('var seed = [1, 2].flat();\n', {
        configFile: false,
        babelrc: false,
        filename: 'planted.ts',
        parserOpts: { plugins: ['typescript'] },
        plugins: [
          [withBabelVersion(release), { method: 'usage-global', version: '4.0', targets: { ie: 11 } }],
          siblingPlanting(snippet),
        ],
      });
      const emitted = code.split('\n').filter(line => !line.startsWith('import') && !line.startsWith('var seed')).join('\n');
      const file = path.join(plantedDir, `case-${ plantedNumber++ }.mts`);
      await fs.writeFile(file, `function planted() {\n${ emitted }\n}`);
      let reprinted = null;
      try {
        await import(pathToFileURL(file).href);
        reprinted = plantedExpressionType(emitted);
      } catch { /* stays null: unparsable output fails the check below with the same verdict */ }
      checkTruthy(`sibling-planted ${ release }/${ name }: reprint compiles with the same outer expression`,
        reprinted === plantedExpressionType(snippet));
    }
  }
} finally {
  await fs.remove(plantedDir);
}

// the one shape an EMITTER puts into an instantiation slot: the guarded ctor narrow swaps a member
// read for a ternary, which the slot rejects bare. What the swap owes is the parens for the slot it
// fills ITSELF; a TS wrapper standing between the two fills that slot instead, and its own priority
// is the late restoration's question, off the same predicate. Spelling both at the emit duplicated
// a paren the reprint already carries, so the association below is what says the wrapper leg is
// covered: without the parens the `<string>` re-parses into the cast's own type and the whole
// expression stops being an instantiation at all
for (const [name, receiverSlot, wants] of [
  ['bare instantiation slot', 'M.groupBy<string>', ['TSInstantiationExpression', 'ConditionalExpression']],
  ['under a TS cast', '(M.groupBy as any)<string>', ['TSInstantiationExpression', 'TSAsExpression', 'ConditionalExpression']],
  ['under a satisfies', '(M.groupBy satisfies unknown)<string>', ['TSInstantiationExpression', 'TSSatisfiesExpression', 'ConditionalExpression']],
  ['under an angle-bracket assertion', '(<any>M.groupBy)<string>', ['TSInstantiationExpression', 'TSTypeAssertion', 'ConditionalExpression']],
]) {
  // the ctor alias is read from a function DEFINED before the destructure, which is what keeps the
  // narrow guarded rather than folded straight to the pure static
  const { code } = await transformAsync(
    `function early() { return ${ receiverSlot }; }
var { ['Map']: M } = globalThis;
export const r = early();
`, {
      configFile: false,
      babelrc: false,
      filename: 'guarded.ts',
      parserOpts: { plugins: ['typescript'] },
      plugins: [['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
    });
  const emitted = code.split('\n').filter(line => !line.startsWith('import')).join('\n');
  let spine = null;
  try {
    let node = parseTS(emitted).program.body
      .find(statement => statement.type === 'FunctionDeclaration').body.body[0].argument;
    spine = [];
    while (node) {
      spine.push(node.type);
      node = node.expression;
    }
  } catch { /* stays null: an unparsable reprint fails the check below with the same verdict */ }
  checkTruthy(`guarded narrow ${ name }: the swap keeps its instantiation association`,
    JSON.stringify(spine) === JSON.stringify(wants));
}

// A separate TS lowering observes the semantics of the generated text, rather than the
// original tree. Exercise both parser dialects and every mode that forces a reprint.
for (const method of ['entry-global', 'usage-global', 'usage-pure']) {
  for (const createParenthesizedExpressions of [false, true]) {
    for (const directive of ['', '// core-js-disable-file\n', '// core-js-disable-next-line\n', '// core-js-disable-line']) {
      for (const [expression, throws] of [
        ['o?.f!()', false], ['(o?.f)!()', true], ['(o?.f!)!()', true],
        ['((o?.f)<number>)()', true], ['(o?.f)<number>?.()', false],
        ['(o?.f!)()', true], ['(o?.f!!)()', true], ['(o?.f!).x', true],
        ['(o?.f)!?.()', false], ['(o?.f)!.x', true], ['(o?.f)?.x', false],
      ]) {
        const source = `const o: any = null; let result;
${ directive.endsWith('\n') ? directive : '' }try { result = ${ expression }; } catch { result = "throw"; } ${ directive.endsWith('\n') ? '' : directive }`;
        const { code } = await transformAsync(source, {
          configFile: false, babelrc: false, filename: 'seal.ts',
          parserOpts: { plugins: ['typescript'], createParenthesizedExpressions },
          plugins: [['@core-js', { method, version: '4.0', targets: { ie: 11 } }]],
        });
        const lowered = await transformAsync(code, {
          configFile: false, babelrc: false, filename: 'seal.ts',
          plugins: [requireBabel('@babel/plugin-transform-typescript')],
        });
        checkTruthy(`non-null seal/${ method }/${ createParenthesizedExpressions }/${ directive.trim() }/${ expression }`,
          runInNewContext(`${ lowered.code }\nresult`) === (throws ? 'throw' : undefined));
      }
    }
  }
}

finish();
