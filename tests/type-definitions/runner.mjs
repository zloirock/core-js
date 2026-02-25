import { cpus } from 'node:os';
import { fs } from 'zx';

const { mkdir, rm, writeJson } = fs;

const { TYPE_DEFINITIONS_TESTS } = process.env;

if (!['ALL', 'CI', 'SMOKE'].includes(TYPE_DEFINITIONS_TESTS)) {
  throw new Error('Incorrect or lack of TYPE_DEFINITIONS_TESTS');
}

const ALL_TESTS = TYPE_DEFINITIONS_TESTS === 'ALL';
const CI_TESTS = TYPE_DEFINITIONS_TESTS === 'CI';
const NUM_CPUS = cpus().length;
const TMP_DIR = './tmp/';

const ES_TARGETS = [
  'esnext',
  'es2022',
  'es6',
];

const DEFAULT_TYPE_SCRIPT_VERSION = '5.9';

const TYPE_SCRIPT_VERSIONS = [DEFAULT_TYPE_SCRIPT_VERSION, ...ALL_TESTS ? [
  '6.0.0-beta',
  '5.8',
  '5.7',
  '5.6',
  // '5.5', // fails with node types: Named property 'next' of types 'AsyncIterator<T, TReturn, TNext>' and 'AsyncIteratorObject<T, TReturn, TNext>' are not identical.
  // '5.4',
  // '5.3',
  // '5.2',
] : CI_TESTS ? [
  '6.0.0-beta',
  '5.6',
] : [
  // empty
]];

const ENVIRONMENTS = ALL_TESTS ? [
  '@types/node@25',
  '@types/node@24',
  '@types/node@22',
  '@types/node@20',
  '@types/node@18',
  '@types/node@16',
  // '@types/node@15', // fails
  // '@types/bun@latest', // ArrayBuffer.resize signature incorrect. Return type ArrayBuffer instead of void.
  // '@types/deno@latest', // fails
] : CI_TESTS ? [
  '@types/node@25',
  '@types/node@24',
  '@types/node@22',
  '@types/node@16',
] : [
  '@types/node@25',
];

const LIBS = [
  'dom',
];

const CORE_JS_MODES = [
  'global',
  'pure',
];

const TARGET_RULES = {
  es6: '**/*es2018*test.ts',
};

const LIB_RULES = {
  dom: '**/*dom*test.ts',
};

let tested = 0;
let failed = 0;

function getTmpEnvDir(env) {
  if (!env) return null;
  return path.join(TMP_DIR, env.replaceAll('/', '-').replaceAll('@', ''));
}

async function runTasksInParallel() {
  const limit = Math.max(NUM_CPUS - 1, 1);
  let i = 0;

  await Promise.all(Array(limit).fill().map(async () => {
    while (i < tasks.length) await runTask(tasks[i++]);
  }));
}

async function runTask({ cwd, ts = DEFAULT_TYPE_SCRIPT_VERSION, config, args = [] }) {
  const task = $({ cwd, verbose: false })`npx --package typescript@${ ts } tsc --project ${ config } ${ args }`;
  // eslint-disable-next-line no-underscore-dangle -- third-party code
  const { cmd } = task._snapshot;
  echo`run ${ chalk.cyan(cmd) }`;
  tested++;
  try {
    await task;
    echo(chalk.green(`success ${ chalk.cyan(cmd) }`));
  } catch (error) {
    failed++;
    echo(chalk.red(`fail ${ chalk.cyan(cmd) }:\n${ chalk.grey(error) }`));
  }
}

function * buildTasks() {
  for (const mode of CORE_JS_MODES) {
    for (const target of ES_TARGETS) {
      for (const ts of TYPE_SCRIPT_VERSIONS) {
        for (const env of [null, ...ENVIRONMENTS]) {
          for (const lib of [null, ...LIBS]) {
            const tsConfigPostfix = `${ TARGET_RULES[target] ? `.${ target }` : '' }${ LIB_RULES[lib] ? `.${ lib }` : '' }`;
            const config = env ? `./tsconfig.${ mode }${ tsConfigPostfix }.json` : `${ mode }/tsconfig${ tsConfigPostfix }.json`;
            const libWithTarget = lib ? `${ target },${ lib }` : target;
            const types = [`@core-js/types${ mode === 'pure' ? '/pure' : '' }`];
            // eslint-disable-next-line max-depth -- ok
            if (env) types.push(env.replace(/^(?<envWithoutVersion>@?[^@]+)@.+$/, '$<envWithoutVersion>'));
            const args = [
              '--target', target,
              '--lib', libWithTarget,
              '--types', types.join(','),
            ];
            yield { cwd: getTmpEnvDir(env), ts, config, args };
          }
        }
      }
    }
  }
}

async function clearTmpDir() {
  await rm(TMP_DIR, { recursive: true, force: true });
}

async function prepareEnvironments() {
  await clearTmpDir();
  for (const env of ENVIRONMENTS) {
    if (!env) continue;
    const tmpEnvDir = getTmpEnvDir(env);
    await mkdir(tmpEnvDir, { recursive: true });
    await $({ cwd: tmpEnvDir, verbose: false })`npm init --yes`;
    await $({ cwd: tmpEnvDir })`npm install ${ env }`;
    for (const mode of CORE_JS_MODES) {
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ mode }.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ mode }/**/*.ts`],
        exclude: [`../../${ mode }/**/${ LIB_RULES.dom }`],
      });
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ mode }.dom.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ mode }/**/*.ts`],
      });
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ mode }.es6.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ mode }/**/*.ts`],
        exclude: [`../../${ mode }/**/${ TARGET_RULES.es6 }`, `../../${ mode }/${ LIB_RULES.dom }`],
      });
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ mode }.es6.dom.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ mode }/**/*.ts`],
        exclude: [`../../${ mode }/**/${ TARGET_RULES.es6 }`],
      });
    }
  }
}

const tasks = [
  { config: 'tools/tsconfig.json' },
  { config: 'templates/tsconfig.json' },
  { config: 'templates/tsconfig.require.json' },
  { config: 'entries/full/tsconfig.json' },
  { config: 'entries/actual/tsconfig.json' },
  { config: 'entries/stable/tsconfig.json' },
  { config: 'entries/es/tsconfig.json' },
  { config: 'entries/proposals/tsconfig.json' },
  { config: 'entries/global-imports/tsconfig.json' },
  { config: 'entries/pure-imports/tsconfig.json' },
  { config: 'entries/configurator/tsconfig.json' },
  { config: 'entries/pure-pollutions/tsconfig.json' },
  ...buildTasks(),
];

await prepareEnvironments();
await runTasksInParallel();
await clearTmpDir();

echo(`Tested: ${ chalk.green(tested) }, Failed: ${ chalk.red(failed) }`);

if (failed) throw new Error('Some tests have failed');
