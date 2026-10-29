const featuresExclude = [
  'arraybuffer-transfer',
  'error-stack-accessor',
  'immutable-arraybuffer',
  'regexp-duplicate-named-groups',
  'regexp-modifiers',
  'regexp-v-flag',
  'resizable-arraybuffer',
];

export default function run(patterns, {
  test262Dir = 'node_modules/test262',
  prelude = '../../packages/core-js-bundle/index.js',
} = {}) {
  return $`test262-harness \
    --error-for-failures \
    --features-exclude=${ featuresExclude.join(',') } \
    --threads=${ os.cpus().length } \
    --timeout=60000 \
    --host-args="--unhandled-rejections=none" \
    --preprocessor=preprocessor.js \
    --prelude=${ prelude } \
    --test262-dir=${ test262Dir } \
    ${ patterns } \
  `;
}
