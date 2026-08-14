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
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');

const { checkTruthy, finish } = createChecker('late-paren-compensation-gate');

// an optional chain used as a tagged template's TAG is the compensation's own subject: the source
// parens are what ended the chain, and printing the tag bare (`o?.f`t``) does not parse at all
function optionalChainTag(t) {
  return t.taggedTemplateExpression(
    t.optionalMemberExpression(t.identifier('o'), t.identifier('f'), false, true),
    t.templateLiteral([t.templateElement({ raw: 't', cooked: 't' }, true)], []),
  );
}

function isCompensated(node) {
  return node?.tag?.type === 'ParenthesizedExpression';
}

// sibling ordered AFTER core-js: its exit runs once ours already did, so what it plants here is
// exactly what only `post()` can still reach. `where` picks whether the plant lands in a NEW
// top-level statement or INSIDE one that was already there when we finished
function makeSiblingPlanting(where, observed) {
  return ({ types: t }) => ({
    visitor: {
      Program: {
        exit(programPath) {
          const planted = optionalChainTag(t);
          observed.planted = planted;
          if (where === 'new-statement') {
            programPath.pushContainer('body', t.expressionStatement(planted));
          } else {
            programPath.node.body.at(-1).declarations[0].init = planted;
          }
        },
      },
    },
    // runs after core-js's own `post()`, so it reads the tree the late pass just left behind. it
    // also unplants, keeping the printed output valid whatever the verdict was
    post() {
      observed.compensated = isCompensated(observed.planted);
      if (where !== 'new-statement') observed.planted.tag = { type: 'NumericLiteral', value: 1 };
    },
  });
}

async function plant(where, source) {
  const observed = {};
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    plugins: [
      ['@core-js', { method: 'usage-global', version: '4.0', targets: { ie: 11 } }],
      makeSiblingPlanting(where, observed),
    ],
  });
  return { ...observed, code };
}

// a sibling-added TOP-LEVEL statement is what the gated descent exists to cover, and the whole
// reason the pass sits in `post()` rather than at our own exit
{
  const { compensated, code } = await plant('new-statement', 'var a = [1, 2].flat();');
  checkTruthy('sibling-added top-level statement is compensated', compensated);
  checkTruthy('and prints with the parens that make it parse', code.includes('(o?.f)`t`'));
}

// the price of the gate, and the reason it is spelled as a gate rather than a full re-walk: a
// statement that was already there when we finished is not re-entered, so a sibling mutating INSIDE
// one is out of reach. What buys that back is a full AST walk on every file. The shape is out of
// reach only for a sibling that BUILDS one: no emitter in these packages constructs a tagged
// template or an instantiation at all, and the lowerings only ever remove optional chains, so
// everything the early pass saw is still all there is. If the trade is revisited, this case says so
{
  const { compensated } = await plant('in-existing-statement', 'var a = [1, 2].flat();');
  checkTruthy('nothing pending: an existing statement is not re-entered', !compensated);
}

// and the flag is what decides, not luck: the SAME plant in the SAME position is reached once the
// file owes parens on its own, because then the late pass takes the full walk
{
  const { compensated } = await plant('in-existing-statement', 'var a = [1, 2].flat();\nvar b = (o?.f)`x`;');
  checkTruthy('parens pending: the full walk reaches the same plant', compensated);
}

// what makes a file owe them is the tag being an optional CHAIN, not its being tagged: a template
// tag is common enough that counting every one would hand the full walk to most files that use one
{
  const { compensated } = await plant('in-existing-statement', 'var a = [1, 2].flat();\nvar b = String.raw`x`;');
  checkTruthy('a plain template tag does not owe parens, so the walk stays gated', !compensated);
}

// What the late pass DOES with what it reaches. The fold half runs early, ahead of the lowerings
// that misread the node - but an instantiation a later-ordered sibling inserts was never early, and
// the paren restoration alone covers only the shapes the fold leaves behind. So the fold runs here
// too. The oracle is the ASSOCIATION, not parseability: every one of these reprints into something
// that parses, and four of them parse as a DIFFERENT expression - the call swallowed by an arrow
// body, by a ternary branch, by an assignment, by a logical operand.
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
];

const { parse } = requireBabel('@babel/parser');
function parseTS(source) {
  return parse(source, { sourceType: 'module', plugins: ['typescript'] });
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

for (const [name, snippet] of SHAPES) {
  const { code } = await transformAsync('var seed = [1, 2].flat();\n', {
    configFile: false,
    babelrc: false,
    filename: 'planted.ts',
    parserOpts: { plugins: ['typescript'] },
    plugins: [
      ['@core-js', { method: 'usage-global', version: '4.0', targets: { ie: 11 } }],
      siblingPlanting(snippet),
    ],
  });
  const emitted = code.split('\n').filter(line => !line.startsWith('import') && !line.startsWith('var seed')).join('\n');
  let reprinted = null;
  try {
    reprinted = plantedExpressionType(emitted);
  } catch { /* stays null: unparsable output fails the check below with the same verdict */ }
  checkTruthy(`sibling-planted ${ name }: reprint evaluates as the same expression`,
    reprinted === plantedExpressionType(snippet));
}

finish();
