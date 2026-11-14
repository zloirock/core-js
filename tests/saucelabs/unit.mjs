import { run } from './helpers.mjs';
import platforms from './platforms.mjs';
import allPlatforms from './all-platforms.mjs';
import { evaluate } from './evaluate.mjs';

const { cyan } = chalk;

const options = argv._.filter(arg => arg.startsWith('--'));
const unknown = options.find(option => option !== '--all');
if (unknown) throw new Error(`unknown option ${ unknown }, only --all is supported`);

await run({
  name: 'unit',
  pages: [
    'unit-browser/global.html',
    'unit-browser/pure.html',
  ],
  platforms: options.includes('--all') ? await allPlatforms(process.env.SAUCE_REGION || 'us-west-1') : platforms,
  concurrency: 10,
  reporter: 'qunitResults',
  evaluate: results => evaluate(results, cyan),
});
