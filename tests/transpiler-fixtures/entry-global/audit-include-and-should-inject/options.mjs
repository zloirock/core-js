// `shouldInjectPolyfill` + non-empty `include`/`exclude` is a mis-configuration - the user
// callback takes precedence, so declarative lists would be ignored. provider rejects upfront
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      include: ['es.array.at'],
      shouldInjectPolyfill: () => true,
    }],
  ],
};
