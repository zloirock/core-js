// exclude / minor / patch
export default {
  'tests/babel-plugin-v7': {
    '@babel/*': 'minor',
  },
  'tests/eslint': {
    // eslint-plugin-sonarjs does not work with typescript@7
    typescript: 'minor',
  },
  'tests/test262': {
    // update only when needed to avoid noise
    test262: 'exclude',
  },
};
