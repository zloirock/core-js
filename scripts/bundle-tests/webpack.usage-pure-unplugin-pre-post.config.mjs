// primary unplugin leg: 'pre+post' straddles babel-loader - the analog of the babel
// plugin's in-pass pre-traversal + programExit emission
import buildConfig from './webpack.usage-pure-unplugin-base.mjs';

export default buildConfig('pre+post');
