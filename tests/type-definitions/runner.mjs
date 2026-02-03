import os from 'node:os';
import { fs } from 'zx';

const { mkdir, writeJson } = fs;
const TMP_DIR = './tmp/';
const ALL_TESTS = process.env.ALL_TYPE_DEFINITIONS_TESTS === '1';

const TARGETS = [
  'esnext',
  'es2022',
  'es6',
];
const TYPE_SCRIPT_VERSIONS = [
  '5.9',
  '5.8',
  '5.7',
  '5.6',
  // '5.5', fails with node types: Named property 'next' of types 'AsyncIterator<T, TReturn, TNext>' and 'AsyncIteratorObject<T, TReturn, TNext>' are not identical.
  // '5.4',
  // '5.3',
  // '5.2',
];
const ENVS = [
  null,
  '@types/node@24',
  '@types/node@20',
  '@types/node@18',
  '@types/node@16',
  // '@types/node@15', // fails
  // '@types/bun@latest', // conflicts with DOM types (TextDecorator, SharedArrayBuffer...)
];
const TYPES = [
  'global',
  'pure',
];
const LIBS = [
  'dom',
  // null,  // fails on web types
];
const TARGET_RULES = {
  es6: ['**/*es2018*test.ts'],
};

const LIB_RULES = {
  dom: ['**/*dom*test.ts'],
};

let tested = 0;
let failed = 0;

function getEnvPath(env) {
  if (!env) return null;
  return path.join(TMP_DIR, env.replaceAll('/', '-').replaceAll('@', ''));
}

async function runLimited(tasks, limit) {
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      await runTask(tasks[idx]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
}

async function runTask(config) {
  $.verbose = false;
  const command = `$ npx ${ config.args.join(' ') }`;
  try {
    tested++;
    echo(command);
    if (config.cwd) {
      await $({ cwd: config.cwd })`npx ${ config.args }`.quiet();
    } else {
      await $`npx ${ config.args }`.quiet();
    }
    echo(chalk.green(command));
  } catch (error) {
    failed++;
    echo(chalk.red(`${ command }\n ${ error }`));
  }
}

function buildTasks(types, targets, typeScriptVersions, envs, libs) {
  const tasks = [];
  for (const type of types) {
    for (const target of targets) {
      for (const typeScriptVersion of typeScriptVersions) {
        for (const env of envs) {
          for (const lib of libs) {
            let tsConfigPostfix = TARGET_RULES[target] ? `.${ target }` : '';
            tsConfigPostfix += lib && LIB_RULES[lib] ? `.${ lib }` : '';
            const libsStr = lib ? `${ target },${ lib }` : target;
            const tsConfigPath = env ? `./tsconfig.${ type }${ tsConfigPostfix }.json` : `${ type }/tsconfig${ tsConfigPostfix }.json`;
            const taskConfig = {
              cwd: getEnvPath(env),
              args: [
                '-p', `typescript@${ typeScriptVersion }`,
                'tsc',
                '-p', tsConfigPath,
                '--target', target,
                '--lib', `${ libsStr }`,
              ],
            };
            // eslint-disable-next-line max-depth -- it's needed here
            if (type) {
              const typesSuffix = type === 'pure' ? '/pure' : '';
              const envLibName = env ? `,${ env.substring(0, env.lastIndexOf('@')) }` : '';
              taskConfig.args.push('--types', `@core-js/types${ typesSuffix }${ envLibName }`);
            }
            tasks.push(taskConfig);
          }
        }
      }
    }
  }
  return tasks;
}

async function clearTmpDir() {
  await $`rm -rf ${ TMP_DIR }`;
}

async function prepareEnvironment(environments, coreJsTypes) {
  await clearTmpDir();
  for (const env of environments) {
    if (!env) continue;
    const tmpEnvDir = getEnvPath(env);
    await mkdir(tmpEnvDir, { recursive: true });
    await $({ cwd: tmpEnvDir })`npm init -y > /dev/null 2>&1`;
    await $({ cwd: tmpEnvDir })`npm install ${ env }`;
    for (const type of coreJsTypes) {
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ type }.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ type }/**/*.ts`],
        exclude: [`../../${ type }/**/${ LIB_RULES.dom }`],
      });
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ type }.dom.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ type }/**/*.ts`],
      });
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ type }.es6.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ type }/**/*.ts`],
        exclude: [`../../${ type }/**/${ TARGET_RULES.es6 }`, `../../${ type }/${ LIB_RULES.dom }`],
      });
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ type }.es6.dom.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ type }/**/*.ts`],
        exclude: [`../../${ type }/**/${ TARGET_RULES.es6 }`],
      });
    }
  }
}

let tasks = [];
tasks.push(
  { args: ['-p', 'typescript@5.9', 'tsc'] },
  { args: ['-p', 'typescript@5.9', 'tsc', '-p', 'templates/tsconfig.json'] },
  { args: ['-p', 'typescript@5.9', '-p', '@types/node@24', 'tsc', '-p', 'templates/tsconfig.require.json'] },
  { args: ['-p', 'typescript@5.9', 'tsc', '-p', 'entries/tsconfig.full.json'] },
  { args: ['-p', 'typescript@5.9', 'tsc', '-p', 'entries/tsconfig.actual.json'] },
  { args: ['-p', 'typescript@5.9', 'tsc', '-p', 'entries/tsconfig.stable.json'] },
  { args: ['-p', 'typescript@5.9', 'tsc', '-p', 'entries/tsconfig.es.json'] },
  { args: ['-p', 'typescript@5.9', 'tsc', '-p', 'entries/tsconfig.proposals.json'] },
);

let envs;
if (ALL_TESTS) {
  envs = ENVS;
  tasks = [...tasks, ...buildTasks(TYPES, TARGETS, TYPE_SCRIPT_VERSIONS, envs, LIBS)];
} else {
  envs = [null, '@types/node@24'];
  tasks = [...tasks, ...buildTasks(TYPES, ['esnext', 'es2022', 'es6'], ['5.9', '5.6'], envs, ['dom', null])];
}
const numCPUs = os.cpus().length;
await prepareEnvironment(envs, TYPES);
await runLimited(tasks, Math.max(numCPUs - 1, 1));
await clearTmpDir();
echo(`Tested: ${ chalk.green(tested) }, Failed: ${ chalk.red(failed) }`);
if (failed) throw new Error('Some tests have failed');
