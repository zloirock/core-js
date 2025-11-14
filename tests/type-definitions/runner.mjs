import os from 'node:os';
import { fs } from 'zx';

const { mkdir, writeJson } = fs;
const TMP_DIR = './tmp/';

const targets = [
  'esnext',
  'es2023',
  'es6',
];
const typeScriptVersions = [
  '5.9',
  '5.8',
  '5.7',
  '5.6',
  // '5.5'
];
const envs = [
  null,
  '@types/node@24',
  '@types/node@20',
  '@types/node@18',
  '@types/node@16',
  // '@types/node@15', // fails
  // '@types/bun@latest', // fails
];
const types = [
  'global',
  'pure',
];
const libs = [
  null,
  'dom',
];

let tested = 0;
let failed = 0;

const getEnvPath = function (env) {
  if (!env) return null;
  return path.join(TMP_DIR, env.replaceAll('/', '-').replaceAll('@', ''));
};

const runTestsOnEnv = async function ({ typeScriptVersion, target, type, env, lib }) {
  $.verbose = false;
  const envLibName = env ? env.substring(0, env.lastIndexOf('@')) : '';
  const command = `npx -p typescript@${ typeScriptVersion }${ env ? ` -p ${ env }` : '' } `
    + `tsc -p proposals/${ type }/tsconfig.json --target ${ target }${ lib ? ` --lib ${ target },${ lib }` : '' }${ env ? ` --types @core-js/types,${ envLibName }` : '' }`;
  echo(`$ ${ command }`);
  try {
    if (env && lib) {
      await $({ cwd: getEnvPath(env) })`npx -p typescript@${ typeScriptVersion } tsc -p ./tsconfig.${ type }.json --target ${ target } --lib ${ target },${ lib } --types @core-js/types,${ envLibName }`.quiet();
    } else if (env) {
      await $({ cwd: getEnvPath(env) })`npx -p typescript@${ typeScriptVersion } tsc -p ./tsconfig.${ type }.json --target ${ target } --types @core-js/types,${ envLibName }`.quiet();
    } else if (lib) {
      await $`npx -p typescript@${ typeScriptVersion } tsc -p proposals/${ type }/tsconfig.json --target ${ target } --lib ${ target },${ lib }`.quiet();
    } else {
      await $`npx -p typescript@${ typeScriptVersion } tsc -p proposals/${ type }/tsconfig.json --target ${ target }`.quiet();
    }
    echo(chalk.green(`$ ${ command }`));
    tested++;
  } catch (error) {
    tested++;
    failed++;
    echo(`$ ${ chalk.red(command) }\n ${ error }`);
  }
};

const runLimited = async function (configs, limit) {
  let i = 0;
  async function worker() {
    while (i < configs.length) {
      const idx = i++;
      await runTestsOnEnv(configs[idx]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
};

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

const clearTmpDir = async function () {
  await $`rm -rf ${ TMP_DIR }`;
};

const prepareEnvironment = async function (environments, coreJsTypes) {
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
        include: [`../../proposals/${ type }/*.ts`],
      });
    }
  }
};

await $`npx -p typescript@5.9 tsc`;
await $`npx -p typescript@5.9 -p @types/node@24 tsc -p tsconfig.require.json`;
const numCPUs = os.cpus().length;
await prepareEnvironment(envs, types);
await runLimited(taskConfigs, Math.max(numCPUs - 1, 1));
await clearTmpDir();
echo(`Tested: ${ chalk.green(tested) }, Failed: ${ chalk.red(failed) }`);

// await $`tsc -p proposals/global/tsconfig.esnext.json`;
// await $`tsc -p proposals/global/tsconfig.es2023.json`;
// await $`tsc -p proposals/global/tsconfig.es6.json`;
//
// await $`tsc -p proposals/pure/tsconfig.esnext.json`;
// await $`tsc -p proposals/pure/tsconfig.es2023.json`;
// await $`tsc -p proposals/pure/tsconfig.es6.node.json`;
