import { buildReturnTypesArtifact } from './normalize-return-types.mjs';

await fs.writeJson('packages/core-js-compat/known-built-in-return-types.json', buildReturnTypesArtifact(), { spaces: '  ' });

echo(chalk.green('known-built-in-return-types rebuilt'));
