// Execute each output with its actual loader: parsing alone cannot detect an injected
// require in ESM or an import that makes a legacy script strict.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, checkTruthy, finish } = createChecker('module-goals-runtime');
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'module-goals-'));
let count = 0;

async function eraseTypes(code, filename) {
  return (await transformAsync(code, {
    configFile: false, babelrc: false, filename,
    plugins: [[requireBabel.resolve('@babel/plugin-transform-typescript'), { allowDeclareFields: true }]],
  })).code;
}

async function execute(code, esm, strip) {
  const file = path.join(DIR, `case-${ count++ }.${ esm ? 'mjs' : 'cjs' }`);
  const trailer = esm ? '\nexport { result as r }; export const effects = [];'
    : '\nexports.r = result; exports.effects = [];';
  await fs.writeFile(file, code + trailer);
  return runInWorker(file, { sourceType: esm ? 'module' : 'script', strip });
}

const CASES = [
  ['octal', 'var result = [010].at(0);', '/input.js', 'script', 8],
  ['octal escape', String.raw`var result = ["\1"].at(0);`, '/input.js', 'script', '\u0001'],
  ['reserved binding', 'var private = [3]; var result = private.at(0);', '/input.js', 'script', 3],
  ['duplicate parameters', 'function pick(a, a) { return [a].at(0); } var result = pick(1, 3);', '/input.js', 'script', 3],
  ['with statement', 'with ({}) {} var result = [3].at(0);', '/input.js', 'script', 3],
  ['delete binding', 'delete missing; var result = [3].at(0);', '/input.js', 'script', 3],
  ['CommonJS return', 'if (false) return; var result = [3].at(0);', '/input.cjs', 'commonjs', 3],
  ['wrapper return in js', 'if (false) return; var result = [3].at(0);', '/input.js', 'commonjs', 3],
  ['wrapper this', 'var result = [[this === exports, new.target === undefined]].at(0);', '/input.cjs', 'commonjs', [true, true]],
];

async function checkFormats() {
  for (const [name, source, id, goal, value] of CASES) {
    scenarioSource(source, { label: name });
    const expected = `OK|${ JSON.stringify(value) }|[]`;
    check(`${ name }/native`, await execute(source, false, false), expected);
    for (const method of ['usage-global', 'usage-pure', 'entry-global']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      const input = method === 'entry-global' ? `require('core-js/actual/array/at');\n${ source }` : source;
      const plugin = createUnplugin(options);
      const outputs = [];
      for (const host of ['babel', 'unplugin', 'pre+post']) {
        try {
          let output;
          if (host === 'babel') {
            output = (await transformAsync(input, {
              configFile: false, babelrc: false, filename: id, sourceType: goal,
              plugins: [[babelPlugin, options]],
            })).code;
          } else if (host === 'unplugin') output = plugin.transform(input, id)?.code ?? input;
          else {
            const pre = plugin.transform(input, id, 'pre')?.code ?? input;
            output = plugin.transform(pre, id, 'post')?.code ?? pre;
          }
          outputs.push([host, output]);
        } catch (error) {
          check(`${ name }/${ method }/${ host }/transform`, error.message, 'successful transform');
        }
      }
      for (const [host, output] of outputs) {
        checkTruthy(`${ name }/${ method }/${ host }/CommonJS injection`, output.includes('require('));
        for (const strip of [false, true]) {
          check(`${ name }/${ method }/${ host }/${ strip ? 'stripped' : 'full' }`,
            await execute(output, false, strip), expected);
        }
      }
    }
  }

  for (const extension of ['mjs', 'mts']) for (const goal of ['script', 'unambiguous']) {
    const id = `/worker.${ extension }`;
    const source = extension === 'mts' ? 'var result: number = [3].at(0);' : 'var result = [3].at(0);';
    scenarioSource(source, { label: `${ extension }/${ goal }` });
    check(`${ extension }/${ goal }/native`, await execute(extension === 'mts' ? await eraseTypes(source, id) : source, true, false), 'OK|3|[]');
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      const babel = (await transformAsync(source, {
        configFile: false, babelrc: false, filename: id,
        parserOpts: { sourceType: goal }, plugins: [[babelPlugin, options],
          ...extension === 'mts' ? [requireBabel.resolve('@babel/plugin-transform-typescript')] : []],
      })).code;
      const plugin = createUnplugin(options);
      const single = plugin.transform(source, id)?.code ?? source;
      const pre = plugin.transform(source, id, 'pre')?.code ?? source;
      const post = plugin.transform(pre, id, 'post')?.code ?? pre;
      for (const [host, output] of [['babel', babel], ['unplugin', single], ['pre+post', post]]) {
        checkTruthy(`${ extension }/${ goal }/${ method }/${ host }/ESM injection`, output.includes('import '));
        const runnable = extension === 'mts' ? await eraseTypes(output, id) : output;
        for (const strip of [false, true]) {
          check(`${ extension }/${ goal }/${ method }/${ host }/${ strip ? 'stripped' : 'full' }`,
            await execute(runnable, true, strip), 'OK|3|[]');
        }
      }
    }
  }
}

async function checkHostOverrides() {
  for (const extension of ['mjs', 'mts']) for (const method of ['usage-global', 'usage-pure']) {
    const filename = `/worker.${ extension }`;
    const options = { method, version: '4.0', targets: { ie: 11 } };
    const source = 'export var result = [3].at(0);';
    scenarioSource(source, { label: `${ extension }/${ method }/preceding lowering` });
    const modules = [requireBabel.resolve('@babel/plugin-transform-modules-commonjs'),
      ...extension === 'mts' ? [requireBabel.resolve('@babel/plugin-transform-typescript')] : []];
    for (const reverse of [false, true]) {
      const presets = [() => ({ plugins: modules }), () => ({ plugins: [[babelPlugin, options]] })];
      if (reverse) presets.reverse();
      const { code } = await transformAsync(source, {
        filename, configFile: false, babelrc: false, passPerPreset: true, presets,
      });
      check(`${ extension }/${ method }/${ reverse }/no remaining imports`, /\bimport\s/.test(code), false);
      for (const strip of [false, true]) {
        check(`${ extension }/${ method }/${ reverse }/${ strip }/lowered loader`,
          await execute(code, false, strip), 'OK|3|[]');
      }
    }
    const input = 'if (false) return; var result = [3].at(0);';
    for (const moduleType of ['javascript/auto', 'javascript/dynamic']) {
      const output = createUnplugin(options).transform(input, filename, 'single', '', { moduleType }).code;
      for (const strip of [false, true]) {
        check(`${ extension }/${ method }/${ moduleType }/${ strip }/wrapper loader`,
          await execute(output, false, strip), 'OK|3|[]');
      }
    }
  }
  // A later core-js pass must read the new census, even if an earlier pass cached ESM
  // markers on this exact Program before the intervening CommonJS lowering.
  function introduceUse({ types: t }) {
    return { visitor: { Program: { exit(p) {
      const call = t.callExpression(t.memberExpression(t.identifier('result'), t.identifier('at')), [t.numericLiteral(0)]);
      p.pushContainer('body', t.expressionStatement(t.assignmentExpression('=', t.identifier('result'), call)));
    } } } };
  }
  for (const filename of ['/worker.js', '/worker.mjs']) for (const method of ['usage-global', 'usage-pure']) {
    const options = { method, version: '4.0', targets: { ie: 11 } };
    function preset() { return { plugins: [[babelPlugin, options]] }; }
    const { code } = await transformAsync('export var result = [3];', {
      filename, configFile: false, babelrc: false, passPerPreset: true,
      presets: [[preset, {}, 'before-lowering'],
        () => ({ plugins: [requireBabel.resolve('@babel/plugin-transform-modules-commonjs'), introduceUse] }),
        [preset, {}, 'after-lowering']],
    });
    check(`${ filename }/${ method }/refreshed imports`, /\bimport\s/.test(code), false);
    for (const strip of [false, true]) {
      check(`${ filename }/${ method }/${ strip }/refreshed loader`, await execute(code, false, strip), 'OK|3|[]');
    }
  }
}

try {
  await checkFormats();
  await checkHostOverrides();
  // A bare Script's var is also a global slot. Changing it while evaluating the key
  // must not change the receiver already evaluated before that key.
  const source = 'var n = 010; var list; list = [4]; var result = list[(this.list = [9], "at")](0);';
  scenarioSource(source, { label: 'bare-script receiver snapshot' });
  // Run the script and its required helpers in the same isolated realm: a helper from
  // this process would see foreign Array prototypes, not the stripped worker's ones.
  function bare(...scripts) {
    const run = scripts.map(code => `require('node:vm').runInThisContext(${ JSON.stringify(code) });`).join('\n');
    return `global.require = require; ${ run } var result = global.result;`;
  }
  check('bare-script/native receiver', await execute(bare(source), false, false), 'OK|4|[]');
  const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  const babel = (await transformAsync(source, {
    configFile: false, babelrc: false, filename: '/bare.js', sourceType: 'script', plugins: [[babelPlugin, options]],
  })).code;
  const unplugin = createUnplugin(options).transform(source, '/bare.js').code;
  for (const [host, output] of [['babel', babel], ['unplugin', unplugin]]) {
    for (const strip of [false, true]) {
      check(`bare-script/${ host }/${ strip ? 'stripped' : 'full' } receiver`,
        await execute(bare(output), false, strip), 'OK|4|[]');
    }
  }
  // The second script shares the realm, but its argument cannot occur in the first script's caller census.
  const caller = 'var result = first([123]);';
  for (const [kind, definition] of [
    ['declaration', "function first(x = 'ab') { return x.at(0); }"],
    ['arrow', "const first = (x = 'ab') => x.at(0);"],
    ['expression', "const first = function inner(x = 'ab') { return x.at(0); };"],
    ['block', "if (true) { function first(x = 'ab') { return x.at(0); } }"],
  ]) {
    const input = `${ definition }\nfirst();`;
    const scriptOptions = { ...options, importStyle: 'require' };
    const outputs = {
      native: input,
      babel: (await transformAsync(input, {
        configFile: false, babelrc: false, filename: '/first.js', sourceType: 'script', plugins: [[babelPlugin, scriptOptions]],
      })).code,
      unplugin: createUnplugin(scriptOptions).transform(input, '/first.js').code,
    };
    for (const [host, output] of Object.entries(outputs)) {
      check(`second script/${ kind }/${ host }`, await execute(bare(output, caller), false, host !== 'native'), 'OK|123|[]');
    }
  }
  // A getter defined by another script can observe a global lexical binding during the rest copy.
  const observer = `var seen = [];
    function watch() { try { seen.push(typeof f); } catch (error) { seen.push(error.name); } }
    global.window = { get Array() { watch(); return Array; }, get after() { watch(); return 5; } };`;
  const pattern = 'const { [(watch(), "Array")]: { from: f }, ...rest } = globalThis.window;'
    + ' global.result = [seen, f([7])[0], rest.after];';
  for (const block of [false, true]) {
    const input = block ? `{ ${ pattern } }` : pattern;
    const opts = { ...options, importStyle: 'require' };
    const plugin = createUnplugin(opts);
    const pre = plugin.transform(input, '/pattern.js', 'pre').code;
    const outputs = {
      native: input,
      babel: (await transformAsync(input, {
        configFile: false, babelrc: false, filename: '/pattern.js', sourceType: 'script', plugins: [[babelPlugin, opts]],
      })).code,
      unplugin: pre,
      post: plugin.transform(pre, '/pattern.js', 'post')?.code ?? pre,
    };
    const readings = block ? ['undefined', 'undefined', 'undefined'] : ['ReferenceError', 'ReferenceError', 'function'];
    for (const [host, output] of Object.entries(outputs)) {
      check(`script binding during rest/${ block }/${ host }`, await execute(bare(observer, output), false, host !== 'native'),
        `OK|${ JSON.stringify([readings, 7, 5]) }|[]`);
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
