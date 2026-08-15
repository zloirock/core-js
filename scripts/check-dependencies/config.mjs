// exclude / minor / patch
export default {
  root: {
    // temporarily, to avoid issues with v4 refactoring
    '@babel/*': 'minor',
  },
  // should work in node 8
  'core-js-builder': {
    mkdirp: 'minor',
    webpack: 'minor',
  },
  'scripts/bundle-tests': {
    // temporarily, to avoid issues with v4 refactoring
    '@babel/core': 'minor',
  },
  'tests/eslint': {
    // eslint-plugin-sonarjs does not work with typescript@7
    typescript: 'minor',
  },
  'tests/observables': {
    '@babel/cli': 'minor',
    'moon-unit': 'patch',
  },
};
