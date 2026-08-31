import targetsParser from '@core-js/compat/targets-parser';
import { RETAIN, ROUTE } from '../../config.js';

// down to the empty string, `'/'` included: the route is pasted in front of `/<id>.js`, so a
// route that is nothing but slashes would produce `//<id>.js` - a protocol-relative URL, which
// sends the browser to a HOST named after the bundle instead of to us
function withoutTrailingSlashes(path) {
  let end = path.length;
  while (end > 0 && path[end - 1] === '/') end--;
  return path.slice(0, end);
}

// the options of the service, resolved into one structure with every field filled: nothing
// downstream has to wonder whether a path is absolute or a version is a range
export default function configure(options, { warn, resolveVersions }) {
  const {
    scope,
    targets = null,
    version = 'node_modules',
    configPath,
    browserslistEnv,
    ignoreBrowserslistConfig = false,
    exclude = [],
    minify = true,
    directory = null,
    retain = RETAIN,
    brotli = false,
    route = ROUTE,
    ...unknown
  } = options;

  // a misspelled option means the service runs on a default the developer did not ask for. the
  // list of known names is the destructuring above and nothing else, so the two cannot drift apart
  for (const name of Object.keys(unknown)) {
    warn(`configure:unknown:${ name }`, `\`${ name }\` is not an option of the service, it was ignored`);
  }

  // the scope is part of the input, not a refinement of it. falling back to the whole of core-js
  // would work - at twice the buckets and several times the disk - and the developer would never
  // hear about it
  if (!Array.isArray(scope) || scope.some(name => typeof name != 'string')) {
    throw new TypeError('[core-js] `scope` is required and has to be an array of '
      + 'core-js module names - the list of what the application can reach for, as the build sees it');
  }

  if (!Array.isArray(exclude)) throw new TypeError('[core-js] `exclude` has to be an array');
  if (typeof minify != 'boolean') throw new TypeError('[core-js] `minify` has to be a boolean');
  if (typeof brotli != 'boolean') throw new TypeError('[core-js] `brotli` has to be a boolean');

  if (typeof route != 'string' || !route.startsWith('/')) {
    throw new TypeError('[core-js] `route` has to be a path starting with `/`');
  }

  if (directory !== null && typeof directory != 'string') {
    throw new TypeError('[core-js] `directory` has to be a path or `null`');
  }

  // `null` is "keep every generation", not "keep none": the two ends of the range are told apart
  // because the difference is a directory that grows forever against a page that loses its polyfills
  if (retain !== null && (!Number.isInteger(retain) || retain < 0)) {
    throw new TypeError('[core-js] `retain` has to be a number of generations or `null`');
  }

  const browserslistLookup = {
    ...configPath === undefined ? null : { configPath },
    ...browserslistEnv === undefined ? null : { browserslistEnv },
    ignoreBrowserslistConfig,
  };

  let declaration = null;

  if (targets !== null && targets !== undefined) {
    declaration = typeof targets == 'object' && !Array.isArray(targets)
      ? { ...targets, ...browserslistLookup }
      : { browsers: targets, ...browserslistLookup };
  } else if (!ignoreBrowserslistConfig) {
    // resolved here rather than left to compat: with no declaration the plan covers the whole
    // floor of core-js, and compat left to itself would find the project browserslist config when
    // building the BASELINE alone - a baseline narrower than the plan it belongs to
    const fromConfig = targetsParser(browserslistLookup);
    if (fromConfig.size) declaration = Object.fromEntries(fromConfig);
  }

  return {
    scope: Object.freeze([...scope]),
    exclude: Object.freeze([...exclude]),
    targets: declaration,
    minify,
    directory,
    retain,
    brotli,
    route: withoutTrailingSlashes(route),
    versions: resolveVersions(version),
  };
}
