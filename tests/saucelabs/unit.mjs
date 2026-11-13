import { run } from './helpers.mjs';
import platforms from './platforms.mjs';
import allPlatforms from './all-platforms.mjs';
import { evaluate } from './evaluate.mjs';

const { cyan } = chalk;

if (argv.all !== undefined && argv.all !== true) throw new Error('pass --all as a flag after the optional commit SHA');

await run({
  name: 'unit',
  pages: [
    'unit-browser/global.html',
    'unit-browser/pure.html',
  ],
  platforms: argv.all ? await allPlatforms(process.env.SAUCE_REGION || 'us-west-1') : platforms,
  concurrency: 10,
  reporter: 'qunitResults',
  evaluate: results => evaluate(results, cyan),
});
