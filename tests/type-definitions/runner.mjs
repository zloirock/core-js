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
const EXCLUDE_RULES = {
  es6: ['**/*es2018*test.ts'],
  dom: ['**/*dom*test.ts'],
};

let tested = 0;
let failed = 0;

function getEnvPath(env) {
  if (!env) return null;
  return path.join(TMP_DIR, env.replaceAll('/', '-').replaceAll('@', ''));
}

async function runTestsOnEnv({ typeScriptVersion, target, type, env, lib }) {
  $.verbose = false;
  const envLibName = env ? env.substring(0, env.lastIndexOf('@')) : '';
  let tsConfigPostfix = EXCLUDE_RULES[target] ? `.${ target }` : '';
  tsConfigPostfix = lib && EXCLUDE_RULES[lib] ? `${ tsConfigPostfix }.${ lib }` : tsConfigPostfix;
  const command = `npx -p typescript@${ typeScriptVersion }${
    env ? ` -p ${ env }` : '' } tsc -p ${ type }/tsconfig${ tsConfigPostfix }.json --target ${ target } --lib ${ target }${ lib ? `,${ lib }` : '' }${
    env ? ` --types @core-js/types${ type === 'pure' ? '/pure' : '' },${ envLibName }` : '' }`;
  echo(`$ ${ command }`);
  try {
    tested++;
    if (env && lib) {
      await $({ cwd: getEnvPath(env) })`npx -p typescript@${ typeScriptVersion } tsc -p ./tsconfig.${ type }${ tsConfigPostfix }.json --target ${ target } --lib ${ target },${ lib } --types @core-js/types${ type === 'pure' ? '/pure' : '' },${ envLibName }`.quiet();
    } else if (env) {
      await $({ cwd: getEnvPath(env) })`npx -p typescript@${ typeScriptVersion } tsc -p ./tsconfig.${ type }${ tsConfigPostfix }.json --target ${ target } --lib ${ target } --types @core-js/types${ type === 'pure' ? '/pure' : '' },${ envLibName }`.quiet();
    } else if (lib) {
      await $`npx -p typescript@${ typeScriptVersion } tsc -p ${ type }/tsconfig${ tsConfigPostfix }.json --target ${ target } --lib ${ target },${ lib }`.quiet();
    } else {
      await $`npx -p typescript@${ typeScriptVersion } tsc -p ${ type }/tsconfig${ tsConfigPostfix }.json --target ${ target } --lib ${ target }`.quiet();
    }
    echo(chalk.green(`$ ${ command }`));
  } catch (error) {
    failed++;
    echo(`$ ${ chalk.red(command) }\n ${ error }`);
  }
}

async function runLimited(configs, limit) {
  let i = 0;
  async function worker() {
    while (i < configs.length) {
      const idx = i++;
      await runTestsOnEnv(configs[idx]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
}

function buildTasksConfigs(types, targets, typeScriptVersions, envs, libs) {
  const taskConfigs = [];
  for (const type of types) {
    for (const target of targets) {
      for (const typeScriptVersion of typeScriptVersions) {
        for (const env of envs) {
          for (const lib of libs) {
            taskConfigs.push({ env, lib, target, type, typeScriptVersion });
          }
        }
      }
    }
  }
  return taskConfigs;
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
        exclude: [`../../${ type }/**/${ EXCLUDE_RULES.dom }`],
      });
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ type }.dom.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ type }/**/*.ts`],
      });
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ type }.es6.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ type }/**/*.ts`],
        exclude: [`../../${ type }/**/${ EXCLUDE_RULES.es6 }`, `../../${ type }/${ EXCLUDE_RULES.dom }`],
      });
      await writeJson(path.join(tmpEnvDir, `tsconfig.${ type }.es6.dom.json`), {
        extends: '../../tsconfig.json',
        include: [`../../${ type }/**/*.ts`],
        exclude: [`../../${ type }/**/${ EXCLUDE_RULES.es6 }`],
      });
    }
  }
}

await $`npx -p typescript@5.9 tsc`;
await $`npx -p typescript@5.9 tsc -p templates/tsconfig.json`;
await $`npx -p typescript@5.9 -p @types/node@24 tsc -p templates/tsconfig.require.json`;

let taskConfigs, envs;
if (ALL_TESTS) {
  envs = ENVS;
  taskConfigs = buildTasksConfigs(TYPES, TARGETS, TYPE_SCRIPT_VERSIONS, ENVS, LIBS);
} else {
  envs = [null];
  taskConfigs = buildTasksConfigs(TYPES, ['esnext', 'es2022', 'es6'], ['5.9', '5.6'], envs, ['dom', null]);
}
const numCPUs = os.cpus().length;
await prepareEnvironment(envs, TYPES);
await runLimited(taskConfigs, Math.max(numCPUs - 1, 1));
await clearTmpDir();
echo(`Tested: ${ chalk.green(tested) }, Failed: ${ chalk.red(failed) }`);
if (failed) throw new Error('Some tests have failed');
