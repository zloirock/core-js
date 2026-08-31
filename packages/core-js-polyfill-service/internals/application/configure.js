import targetsParser from '@core-js/compat/targets-parser';

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
    ...unknown
  } = options;

  // a misspelled option means the service runs on a default the developer did not ask for. ⚠ the
  // list of known names is the destructuring above and nothing else, so the two cannot drift apart
  for (const name of Object.keys(unknown)) {
    warn(`configure:unknown:${ name }`, `\`${ name }\` is not an option of the service, it was ignored`);
  }

  // the scope is part of the input, not a refinement of it. ⚠ falling back to the whole of core-js
  // would work - at twice the buckets and several times the disk - and the developer would never
  // hear about it
  if (!Array.isArray(scope) || scope.some(name => typeof name != 'string')) {
    throw new TypeError('`@core-js/polyfill-service`: `scope` is required and has to be an array of '
      + 'core-js module names - the list of what the application can reach for, as the build sees it');
  }

  if (!Array.isArray(exclude)) throw new TypeError('`@core-js/polyfill-service`: `exclude` has to be an array');
  if (typeof minify != 'boolean') throw new TypeError('`@core-js/polyfill-service`: `minify` has to be a boolean');

  // ⚠ `null` is "keep every generation", not "keep none": the two ends of the range are told apart
  // because the difference is a directory that grows forever against a page that loses its polyfills
  if (retain !== null && (!Number.isInteger(retain) || retain < 0)) {
    throw new TypeError('`@core-js/polyfill-service`: `retain` has to be a number of generations or `null`');
  }

  const lookup = {
    ...configPath === undefined ? null : { configPath },
    ...browserslistEnv === undefined ? null : { browserslistEnv },
    ignoreBrowserslistConfig,
  };

  let declaration = null;

  if (targets !== null && targets !== undefined) {
    declaration = typeof targets == 'object' && !Array.isArray(targets)
      ? { ...targets, ...lookup }
      : { browsers: targets, ...lookup };
  } else if (!ignoreBrowserslistConfig) {
    // ⚠ resolved here rather than left to compat: with no declaration the plan covers the whole
    // floor of core-js, and compat left to itself would find the project browserslist config when
    // building the BASELINE alone - a baseline narrower than the plan it belongs to
    const fromConfig = targetsParser(lookup);
    if (fromConfig.size) declaration = Object.fromEntries(fromConfig);
  }

  return {
    scope: Object.freeze([...scope]),
    exclude: Object.freeze([...exclude]),
    targets: declaration,
    minify,
    versions: resolveVersions(version),
  };
}
