import { assertES5 } from '../assert-es5.mjs';
import { generateTestsIndex } from './generate-tests-index.mjs';

// the e2e leg also picks up `.ts` files: TS-type-driven dispatch (class-field narrowing,
// annotation unions) otherwise has NO runtime oracle - only compile-time fixtures
await generateTestsIndex('e2e-usage-pure', '@core-js/pure', /^[a-z]/, ['.js', '.ts']);

echo(chalk.green('e2e-usage-pure index generated'));

await Promise.all([
  ['e2e-usage-pure-babel', 'webpack.usage-pure-babel.config.js'],
  ['e2e-usage-pure-unplugin-pre', 'webpack.usage-pure-unplugin-pre.config.mjs'],
  ['e2e-usage-pure-unplugin-pre-post', 'webpack.usage-pure-unplugin-pre-post.config.mjs'],
  ['e2e-usage-pure-unplugin-post', 'webpack.usage-pure-unplugin-post.config.mjs'],
  ['e2e-usage-pure-unplugin-text-pre-post', 'webpack.usage-pure-unplugin-text-pre-post.config.mjs'],
].map(([output, config]) => $`webpack \
  --entry ../../tests/e2e-usage-pure/index.js \
  --output-filename ${ output }.js \
  --config ${ config } \
`));

// ES5-syntax gate over the ie11-targeted e2e bundles: any emit channel that inserts AST
// content behind the lowering passes (a Program-exit slot mutation once froze a raw arrow
// out of a kept call argument) breaks these bundles ONLY on the legacy browser itself -
// parse each with an ES5 parser so the class fails right here instead of in a karma run
// nobody has an IE11 for. The gate itself is shared with tests/e2e-libs
for (const bundle of ['e2e-usage-pure-babel', 'e2e-usage-pure-unplugin-pre',
  'e2e-usage-pure-unplugin-pre-post', 'e2e-usage-pure-unplugin-post', 'e2e-usage-pure-unplugin-text-pre-post']) {
  assertES5(await fs.readFile(`../../tests/bundles/${ bundle }.js`, 'utf8'), `${ bundle }.js`);
}
echo(chalk.green('e2e-usage-pure bundled, bundles parse as ES5'));
