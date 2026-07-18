// standalone-post unplugin leg: the whole transform runs AFTER babel lowered syntax,
// types and modules - detection and emission both see the lowered CJS text
import buildConfig from './webpack.usage-pure-unplugin-base.mjs';

export default buildConfig('post');
