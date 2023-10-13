import { cpus } from 'node:os';

const ignore = {
  root: [
    // TODO: temporarily, to avoid issues with v4 refactoring
    '@babel/core',
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-block-scoped-functions',
    '@babel/plugin-transform-block-scoping',
    '@babel/plugin-transform-classes',
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-class-static-block',
    '@babel/plugin-transform-computed-properties',
    '@babel/plugin-transform-destructuring',
    '@babel/plugin-transform-duplicate-named-capturing-groups-regex',
    '@babel/plugin-transform-explicit-resource-management',
    '@babel/plugin-transform-exponentiation-operator',
    '@babel/plugin-transform-for-of',
    '@babel/plugin-transform-literals',
    '@babel/plugin-transform-logical-assignment-operators',
    '@babel/plugin-transform-member-expression-literals',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-new-target',
    '@babel/plugin-transform-nullish-coalescing-operator',
    '@babel/plugin-transform-numeric-separator',
    '@babel/plugin-transform-object-rest-spread',
    '@babel/plugin-transform-object-super',
    '@babel/plugin-transform-optional-catch-binding',
    '@babel/plugin-transform-optional-chaining',
    '@babel/plugin-transform-parameters',
    '@babel/plugin-transform-private-methods',
    '@babel/plugin-transform-private-property-in-object',
    '@babel/plugin-transform-property-literals',
    '@babel/plugin-transform-regenerator',
    '@babel/plugin-transform-regexp-modifiers',
    '@babel/plugin-transform-reserved-words',
    '@babel/plugin-transform-shorthand-properties',
    '@babel/plugin-transform-spread',
    '@babel/plugin-transform-template-literals',
    '@babel/plugin-transform-unicode-regex',
  ],
  'scripts/bundle-tests': [
    // TODO: temporarily, to avoid issues with v4 refactoring
    '@babel/core',
  ],
};

const pkgs = await glob([
  'package.json',
  'website/package.json',
  '@(packages|scripts|tests)/*/package.json',
]);

async function checkPackage(path) {
  const { name = 'root', dependencies, devDependencies } = await fs.readJson(path);
  if (!dependencies && !devDependencies) return;

  const exclude = ignore[name];

  const { stdout } = await $({ verbose: false })`updates \
    --json \
    --file ${ path } \
    --timeout 60000 \
    --exclude ${ Array.isArray(exclude) ? exclude.join(',') : '' } \
  `;

  const results = JSON.parse(stdout)?.results?.npm;
  const obsolete = { ...results?.dependencies, ...results?.devDependencies };

  if (Object.keys(obsolete).length) {
    echo(chalk.cyan(`${ name }:`));
    console.table(obsolete);
  }
}

let i = 0;

await Promise.all(Array(cpus().length).fill().map(async () => {
  while (i < pkgs.length) {
    const path = pkgs[i++];
    try {
      await checkPackage(path);
    } catch {
      echo(chalk.red(`${ chalk.cyan(path) } check error`));
    }
  }
}));

echo(chalk.green('dependencies checked'));
