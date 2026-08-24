// the AST engine's e2e leg, on the primary sandwich phase: same suite, same babel-loader
// straddle, the tree renderer instead of the text one - and the one leg of the engine that
// also runs in the stripped realm (see tests/unit-node/e2e-usage-pure.mjs)
import buildConfig from './webpack.usage-pure-unplugin-base.mjs';

export default buildConfig('pre+post', { engine: 'ast' });
