// the TEXT engine's e2e leg, on the primary sandwich phase: same suite, same babel-loader
// straddle, the splice renderer instead of the tree one (the plugin default) - the escape
// hatch's e2e coverage until phase 5 removes the text layer; it also runs in the stripped
// realm (see tests/unit-node/e2e-usage-pure.mjs)
import buildConfig from './webpack.usage-pure-unplugin-base.mjs';

export default buildConfig('pre+post', { engine: 'text' });
