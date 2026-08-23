const { mkdir, readJson, rm, writeJson } = fs;
const { join, resolve } = path;
const { cyan, green, grey, red } = chalk;

const { TYPE_DEFINITIONS_TESTS = 'SMOKE' } = process.env;

if (!['ALL', 'SMOKE'].includes(TYPE_DEFINITIONS_TESTS)) {
  throw new Error('Incorrect or lack of TYPE_DEFINITIONS_TESTS');
}

const ALL_TESTS = TYPE_DEFINITIONS_TESTS === 'ALL';
const NUM_CPUS = os.cpus().length;
const TMP_DIR = './tmp/';

const ES_TARGETS = [
  'esnext',
  'es2022',
  'es6',
];

const DEFAULT_TYPE_SCRIPT_VERSION = '7.0';

const TYPE_SCRIPT_VERSIONS = [DEFAULT_TYPE_SCRIPT_VERSION, ...ALL_TESTS ? [
  '6.0',
  '5.9',
  '5.8',
  '5.7',
  '5.6',
  // '5.5', // fails with node types: Named property 'next' of types 'AsyncIterator<T, TReturn, TNext>' and 'AsyncIteratorObject<T, TReturn, TNext>' are not identical.
  // '5.4',
  // '5.3',
  // '5.2',
] : [
  // empty
]];

const ENVIRONMENTS = ALL_TESTS ? [
  '@types/node@26',
  '@types/node@25',
  '@types/node@24',
  '@types/node@22',
  '@types/node@20',
  '@types/node@18',
  '@types/node@16',
  // '@types/node@15', // fails
  // '@types/bun@latest', // ArrayBuffer.resize signature incorrect. Return type ArrayBuffer instead of void.
  // '@types/deno@latest', // fails
] : [
  '@types/node@26',
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
  return join(TMP_DIR, env.replaceAll('/', '-').replaceAll('@', ''));
}

function getTmpTsDir(ts) {
  return join(TMP_DIR, `ts-${ ts }`);
}

// absolute: the environment tasks run from tmp/<env>, a relative compiler path would resolve against it
function getTscBin(ts) {
  return resolve(getTmpTsDir(ts), 'node_modules', 'typescript', 'bin', 'tsc');
}

async function runTasksInParallel() {
  const limit = Math.max(NUM_CPUS - 1, 1);
  let i = 0;

  await Promise.all(Array(limit).fill().map(async () => {
    while (i < tasks.length) await runTask(tasks[i++]);
  }));
}

async function runTask({ cwd, ts = DEFAULT_TYPE_SCRIPT_VERSION, config, args = [] }) {
  const label = [`tsc@${ ts }`, '--project', config, ...args].join(' ');
  echo`run ${ cyan(label) }`;
  tested++;
  try {
    await $({ cwd, verbose: false })`node ${ getTscBin(ts) } --project ${ config } ${ args }`;
    echo(green(`success ${ cyan(label) }`));
  } catch (error) {
    failed++;
    echo(red(`fail ${ cyan(label) }:\n${ grey(error) }`));
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

async function installInto(directory, spec) {
  await mkdir(directory, { recursive: true });
  await $({ cwd: directory, verbose: false })`npm init --yes`;
  await $({ cwd: directory, verbose: false })`npm install ${ spec }`;
}

async function installEnvironment(env) {
  const tmpEnvDir = getTmpEnvDir(env);
  await installInto(tmpEnvDir, env);
  for (const mode of CORE_JS_MODES) {
    await writeJson(join(tmpEnvDir, `tsconfig.${ mode }.json`), {
      extends: '../../tsconfig.json',
      include: [`../../${ mode }/**/*.ts`],
      exclude: [`../../${ mode }/**/${ LIB_RULES.dom }`],
    });
    await writeJson(join(tmpEnvDir, `tsconfig.${ mode }.dom.json`), {
      extends: '../../tsconfig.json',
      include: [`../../${ mode }/**/*.ts`],
    });
    await writeJson(join(tmpEnvDir, `tsconfig.${ mode }.es6.json`), {
      extends: '../../tsconfig.json',
      include: [`../../${ mode }/**/*.ts`],
      exclude: [`../../${ mode }/**/${ TARGET_RULES.es6 }`, `../../${ mode }/${ LIB_RULES.dom }`],
    });
    await writeJson(join(tmpEnvDir, `tsconfig.${ mode }.es6.dom.json`), {
      extends: '../../tsconfig.json',
      include: [`../../${ mode }/**/*.ts`],
      exclude: [`../../${ mode }/**/${ TARGET_RULES.es6 }`],
    });
  }
  echo`installed ${ cyan(env) }`;
}

// a version like `7.0` is a range: resolving it here, once per run, gives every task of the
// leg the same compiler build - and skips the npx resolution that cost more than the compile
async function installCompiler(ts) {
  const directory = getTmpTsDir(ts);
  await installInto(directory, `typescript@${ ts }`);
  const { version } = await readJson(join(directory, 'node_modules', 'typescript', 'package.json'));
  echo`installed ${ cyan(`typescript@${ ts }`) } as ${ cyan(version) }`;
}

async function prepareEnvironments() {
  await clearTmpDir();
  // allSettled, not all: a rejected install must not leave its siblings running orphaned past
  // the process death - they keep writing into tmp/ and race the next run's clearTmpDir
  const installations = await Promise.allSettled([
    ...ENVIRONMENTS.map(installEnvironment),
    ...TYPE_SCRIPT_VERSIONS.map(installCompiler),
  ]);
  const rejected = installations.filter(result => result.status === 'rejected');
  if (rejected.length) throw new AggregateError(rejected.map(result => result.reason), 'environment preparation failed');
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

echo(`Tested: ${ green(tested) }, Failed: ${ failed ? red(failed) : green(failed) }`);

if (failed) throw new Error('Some tests have failed');
