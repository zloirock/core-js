var $def = require('./$.def');

$def($def.P + $def.F, 'String', {
  unescapeHTML: require('./$.replacer')(/&(?:amp|lt|gt|quot|apos);/g, {
    '&amp;':  '&',
    '&lt;':   '<',
    '&gt;':   '>',
    '&quot;': '"',
    '&apos;': "'"
  })
});