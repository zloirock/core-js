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

const runTestsOnEnv = async function (typeScriptVersion, target, type) {
  $.verbose = false;
  const command = `npx -p typescript@${ typeScriptVersion } tsc -p proposals/${ type }/tsconfig.${ target }.json`;
  echo(`$ ${ command }`);
  try {
    await $`npx -p typescript@${ typeScriptVersion } tsc -p proposals/${ type }/tsconfig.${ target }.json`.quiet();
    echo(chalk.green(`$ ${ command }`));
  } catch (error) {
    echo(`$ ${ chalk.red(command) }\n ${ error }`);
    process.exit(1);
  }
};

// for (const version of typeScriptVersions) {
//   for (const target of targets) {
//     await Promise.all([
//       runTestsOnEnv(version, target, 'global'),
//       runTestsOnEnv(version, target, 'pure')
//     ]);
//   }
// }
// 51

// await Promise.all(
//   typeScriptVersions.flatMap(version =>
//     targets.flatMap(target => [
//       runTestsOnEnv(version, target, 'global'),
//       runTestsOnEnv(version, target, 'pure')
//     ])
//   )
// );
// 22

await Promise.all(
  typeScriptVersions.flatMap(version => targets.map(async target => {
    await runTestsOnEnv(version, target, 'global');
    await runTestsOnEnv(version, target, 'pure');
  })),
);
// 19

// for (const version of typeScriptVersions) {
//   await Promise.all(
//     targets.flatMap(target => [
//       runTestsOnEnv(version, target, 'global'),
//       runTestsOnEnv(version, target, 'pure')
//     ])
//   );
// }
// 59

// await $`tsc -p proposals/global/tsconfig.esnext.json`;
// await $`tsc -p proposals/global/tsconfig.es2023.json`;
// await $`tsc -p proposals/global/tsconfig.es6.json`;
//
// await $`tsc -p proposals/pure/tsconfig.esnext.json`;
// await $`tsc -p proposals/pure/tsconfig.es2023.json`;
// await $`tsc -p proposals/pure/tsconfig.es6.json`;

