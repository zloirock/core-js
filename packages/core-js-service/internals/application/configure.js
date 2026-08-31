import targetsParser from '@core-js/compat/targets-parser';
import { COMPRESSION, ENCODING_PREFERENCE, RETAIN } from '../../config.js';

// which representations of every bundle are stored, and with what. an encoding is named by the
// token it carries on the wire, so what a developer writes here is what a client asks for and what
// `bundles.encodings` reports
function resolveCompression(option) {
  if (option === null || typeof option != 'object' || Array.isArray(option)) {
    throw new TypeError('[core-js] `compression` has to be an object of encodings');
  }

  const resolved = {};

  for (const [encoding, settings] of Object.entries(option)) {
    if (!ENCODING_PREFERENCE.includes(encoding)) {
      throw new TypeError(`[core-js] \`compression.${ encoding }\` is not an encoding this serves, `
        + `expected one of ${ ENCODING_PREFERENCE.join(', ') }`);
    }

    // the uncompressed form is the bytes themselves, so there is nothing to configure about it
    const settingsAllowed = encoding !== 'identity'
      && settings !== null && typeof settings == 'object' && !Array.isArray(settings);

    if (typeof settings != 'boolean' && !settingsAllowed) {
      throw new TypeError(`[core-js] \`compression.${ encoding }\` has to be ${
        encoding === 'identity' ? 'a boolean' : 'a boolean or zlib options' }`);
    }

    if (settings !== false) resolved[encoding] = settings === true ? {} : settings;
  }

  // a store that holds nothing can answer nothing, and the failure would be one 406 per request
  if (!Object.keys(resolved).length) {
    throw new TypeError('[core-js] `compression` has to leave at least one encoding enabled');
  }

  return Object.freeze(resolved);
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
    compression = COMPRESSION,
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

  if (directory !== null && typeof directory != 'string') {
    throw new TypeError('[core-js] `directory` has to be a path or `null`');
  }

  // `null` is "keep every generation", not "keep none": the two ends of the range are told apart
  // because the difference is a directory that grows forever against a page that loses its polyfills
  if (retain !== null && (!Number.isInteger(retain) || retain < 0)) {
    throw new TypeError('[core-js] `retain` has to be a number of generations or `null`');
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
    // resolved here rather than left to compat: with no declaration the plan covers the whole
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
    directory,
    retain,
    compression: resolveCompression(compression),
    versions: resolveVersions(version),
  };
}
