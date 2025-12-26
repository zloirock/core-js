import os from 'node:os';
import { fs } from 'zx';

const { mkdir, writeJson } = fs;
const TMP_DIR = './tmp/';
const ALL_TESTS = process.env.ALL_TYPE_DEFINITIONS_TESTS === '1';

const targets = [
  'esnext',
  'es2022',
  'es6',
];
const typeScriptVersions = [
  '5.9',
  '5.8',
  '5.7',
  '5.6',
  // '5.5', fails with node types: Named property 'next' of types 'AsyncIterator<T, TReturn, TNext>' and 'AsyncIteratorObject<T, TReturn, TNext>' are not identical.
  // '5.4',
  // '5.3',
  // '5.2',
];
const envs = [
  null,
  '@types/node@24',
  '@types/node@20',
  '@types/node@18',
  '@types/node@16',
  // '@types/node@15', // fails
  // '@types/bun@latest', // conflicts with DOM types (TextDecorator, SharedArrayBuffer...)
];
const types = [
  'global',
  'pure',
];
const libs = [
  'dom',
  // null,  // fails on web types
];

let tested = 0;
let failed = 0;

function getEnvPath(env) {
  if (!env) return null;
  return path.join(TMP_DIR, env.replaceAll('/', '-').replaceAll('@', ''));
}

async function runTestsOnEnv({ typeScriptVersion, target, type, env, lib }) {
  $.verbose = false;
  const envLibName = env ? env.substring(0, env.lastIndexOf('@')) : '';
  const command = `npx -p typescript@${ typeScriptVersion }${
    env ? ` -p ${ env }` : '' } tsc -p ${ type }/tsconfig.json --target ${ target } --lib ${ target }${ lib ? `,${ lib }` : '' }${
    env ? ` --types @core-js/types${ type === 'pure' ? '/pure' : '' },${ envLibName }` : '' }`;
  echo(`$ ${ command }`);
  try {
    tested++;
    if (env && lib) {
      await $({ cwd: getEnvPath(env) })`npx -p typescript@${ typeScriptVersion } tsc -p ./tsconfig.${ type }.json --target ${ target } --lib ${ target },${ lib } --types @core-js/types${ type === 'pure' ? '/pure' : '' },${ envLibName }`.quiet();
    } else if (env) {
      await $({ cwd: getEnvPath(env) })`npx -p typescript@${ typeScriptVersion } tsc -p ./tsconfig.${ type }.json --target ${ target } --lib ${ target } --types @core-js/types${ type === 'pure' ? '/pure' : '' },${ envLibName }`.quiet();
    } else if (lib) {
      await $`npx -p typescript@${ typeScriptVersion } tsc -p ${ type }/tsconfig.json --target ${ target } --lib ${ target },${ lib }`.quiet();
    } else {
      await $`npx -p typescript@${ typeScriptVersion } tsc -p ${ type }/tsconfig.json --target ${ target } --lib ${ target }`.quiet();
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
      });
    }
  }
}

await $`npx -p typescript@5.9 tsc`;
await $`npx -p typescript@5.9 tsc -p tsconfig.templates.import.json`;
await $`npx -p typescript@5.9 tsc -p tsconfig.entries.json`;
await $`npx -p typescript@5.9 tsc -p tsconfig.entries.pure.json`;
await $`npx -p typescript@5.9 -p @types/node@24 tsc -p tsconfig.templates.require.json`;

if (!ALL_TESTS) {
  await $`npx -p typescript@5.9 tsc -p pure/tsconfig.json --target es6 --lib es6`;
  await $`npx -p typescript@5.9 tsc -p pure/tsconfig.json --target es2023 --lib es2023`;
  await $`npx -p typescript@5.9 tsc -p pure/tsconfig.json --target esnext --lib esnext`;
  await $`npx -p typescript@5.9 tsc -p global/tsconfig.json --target es6 --lib es6,dom`;
  await $`npx -p typescript@5.9 tsc -p global/tsconfig.json --target es2023 --lib es2023,dom`;
  await $`npx -p typescript@5.9 tsc -p global/tsconfig.json --target esnext --lib esnext,dom`;
} else {
  const numCPUs = os.cpus().length;
  await prepareEnvironment(envs, types);
  await runLimited(taskConfigs, Math.max(numCPUs - 1, 1));
  await clearTmpDir();
  echo(`Tested: ${ chalk.green(tested) }, Failed: ${ chalk.red(failed) }`);
}
