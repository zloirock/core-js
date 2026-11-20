import { fileURLToPath } from 'node:url';

export default function run(patterns, {
  test262Dir = 'node_modules/test262',
  prelude = '../../packages/core-js-bundle/index.js',
} = {}) {
  const preprocessor = patterns.length ? './check-selection.js' : './preprocessor.js';
  return $`test262-harness \
    --error-for-failures \
    --threads=${ os.cpus().length } \
    --timeout=60000 \
    --host-args="--unhandled-rejections=none" \
    --preprocessor=${ fileURLToPath(new URL(preprocessor, import.meta.url)) } \
    --prelude=${ prelude } \
    --test262-dir=${ test262Dir } \
    -- ${ patterns.length ? patterns : [`${ test262Dir }/test/built-ins/**/*.js`] } \
  `;
}
