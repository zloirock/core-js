// Runtime oracle for the JSX tag-name reference: a tag hands the component to a renderer that calls
// it with props, so a parameter default the emitter folds away is still overridable and the folded
// value is simply WRONG. Import-set parity cannot see this - both legs import the same module and
// differ only in where they put it - so the assertion here is the returned VALUE, native against
// both emitters.
//
// It lives in this directory rather than in `e2e-usage-pure` or the differential because neither
// carries a JSX dialect: their pipelines lower TS and nothing else, and no `@babel` JSX transform is
// installed. The lowering is swc's, the same engine the builder downgrades with, with `h` as pragma.
//
// The BARE tag slots are the ones a runtime row can reach at all: a member tag needs the component
// hung on an object, and that second reference decides the reads on its own. The rest of the closed
// slot table - member root, intrinsic spelling, attribute name, member tail, namespaced halves - is
// locked in the `audit-jsx-*-census` fixtures, where the decision is visible without running.
import { pathToFileURL } from 'node:url';
import { transformAsync } from '@babel/core';
import { transform as swcTransform } from '@swc/core';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker } from './harness.mjs';

const { fail, finish, pass } = createChecker('jsx-tag-reference-runtime');

const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
// the standard element factory - the renderer CALLS the component with the props the element carried
const PRELUDE = 'const h = (type, props) => (typeof type === "function" ? type(props) : type);\n';
// a REST element is what makes the fold caller-lossy: no synthesized literal can enumerate the keys,
// so the emitter either keeps the pattern or replaces the binding with the ponyfill outright
const COMPONENT = 'function Component({ from, ...rest } = Array) {\n  return [from, rest.other];\n}\n';

// the emitted modules import `@core-js/pure`, so they must sit inside the tree that resolves it
const TMP = path.join(import.meta.dirname, '..', 'transpiler-differential', 'tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'jsx-runtime-'));
let counter = 0;

async function valueOf(source) {
  const { code: lowered } = await swcTransform(source, {
    filename: 'case.jsx',
    jsc: {
      parser: { syntax: 'ecmascript', jsx: true },
      transform: { react: { pragma: 'h', throwIfNamespace: false } },
      target: 'es2022',
    },
    module: { type: 'es6' },
  });
  const file = path.join(DIR, `case-${ counter++ }.mjs`);
  await fs.outputFile(file, lowered);
  const { value } = await import(pathToFileURL(file).href);
  // a ponyfill standing where the caller's prop belongs is a FUNCTION, so name the shape rather
  // than the identity - `[function from]` is exactly the wrong answer this row exists to catch
  return typeof value[0] === 'function' ? `[function ${ value[0].name }]` : JSON.stringify(value[0]);
}

async function runRow(label, jsx) {
  const source = `${ PRELUDE }${ COMPONENT }export const value = ${ jsx };\n`;
  let babelCode, unpluginCode;
  try {
    babelCode = (await transformAsync(source, {
      plugins: [['@core-js', OPTIONS]],
      parserOpts: { plugins: ['jsx'] },
      filename: 'case.jsx',
      babelrc: false,
      configFile: false,
    })).code;
    unpluginCode = createUnplugin(OPTIONS).transform(source, 'case.jsx')?.code ?? source;
  } catch (error) {
    return fail(label, `transform threw: ${ error.message }`);
  }
  const native = await valueOf(source);
  const babel = await valueOf(babelCode);
  const unplugin = await valueOf(unpluginCode);
  // native is the reference: the renderer supplied the prop, so that is what a correct emission reads
  if (native === babel && native === unplugin) return pass();
  fail(label, `native ${ native }, babel ${ babel }, unplugin ${ unplugin }`);
}

// --- rows: every position a bare tag can stand in, all resolving to the one component
await runRow('bare self-closing tag', '<Component from="SUPPLIED" other={2} />');
await runRow('paired tag', '<Component from="SUPPLIED" other={2}></Component>');
await runRow('tag inside a nested arrow', '(() => <Component from="SUPPLIED" other={2} />)()');
await runRow('tag behind a conditional', 'true ? <Component from="SUPPLIED" other={2} /> : null');

// The usage-global direction of the same blindness - a DROPPED injection rather than a substituted
// value - has no row here, and not for want of trying: measured, both legs inject the array AND the
// string module for every shape of this family whether the census sees the tag or not, because
// usage-global injects when a polyfill MIGHT be needed. A stripped realm therefore answers alike on
// a blinded census and a seeing one, so a row built on it could never redden. That direction is
// covered by the census fixtures instead, where the decision is read rather than run.
await fs.remove(DIR);
finish();
