// exclude / minor / patch
export default {
  root: {
    // temporarily, to avoid issues with v4 refactoring
    '@babel/*': 'minor',
  },
  'scripts/bundle-tests': {
    // temporarily, to avoid issues with v4 refactoring
    '@babel/core': 'minor',
  },
  'tests/eslint': {
    // eslint-plugin-sonarjs does not work with typescript@7
    typescript: 'minor',
  },
};
