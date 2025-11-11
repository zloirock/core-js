import os from 'node:os';

await $`tsc`;
await $`tsc -p tsconfig.require.json`;

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
  // '@types/node@18',
  '@types/bun@latest',
];
const types = [
  'global',
  'pure',
];
const libs = [
  null,
  'dom',
];

const runTestsOnEnv = async function ({ typeScriptVersion, target, type, env, lib }) {
  $.verbose = false;
  const command = `npx -p typescript@${ typeScriptVersion }${ env ? ` -p ${ env }` : '' } tsc -p proposals/${ type }/tsconfig.json --target ${ target }${ lib ? ` --lib ${ lib }` : '' }`;
  echo(`$ ${ command }`);
  try {
    if (env && lib) {
      await $`npx -p typescript@${ typeScriptVersion } -p ${ env } tsc -p proposals/${ type }/tsconfig.json --target ${ target } --lib ${ target },${ lib }`.quiet();
    } else if (env) {
      await $`npx -p typescript@${ typeScriptVersion } -p ${ env } tsc -p proposals/${ type }/tsconfig.json --target ${ target }`.quiet();
    } else if (lib) {
      await $`npx -p typescript@${ typeScriptVersion } tsc -p proposals/${ type }/tsconfig.json --target ${ target } --lib ${ target },${ lib }`.quiet();
    } else {
      await $`npx -p typescript@${ typeScriptVersion } tsc -p proposals/${ type }/tsconfig.json --target ${ target }`.quiet();
    }
    echo(chalk.green(`$ ${ command }`));
  } catch (error) {
    echo(`$ ${ chalk.red(command) }\n ${ error }`);
    // eslint-disable-next-line node/no-process-exit -- it's needed here
    process.exit(1);
  }
};

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

const numCPUs = os.cpus().length;
await runLimited(taskConfigs, Math.max(numCPUs - 1, 1));

// await $`tsc -p proposals/global/tsconfig.esnext.json`;
// await $`tsc -p proposals/global/tsconfig.es2023.json`;
// await $`tsc -p proposals/global/tsconfig.es6.json`;
//
// await $`tsc -p proposals/pure/tsconfig.esnext.json`;
// await $`tsc -p proposals/pure/tsconfig.es2023.json`;
// await $`tsc -p proposals/pure/tsconfig.es6.node.json`;
