var $def = require('./$.def');

$def($def.P + $def.F, 'String', {
  escapeHTML: require('./$.replacer')(/[&<>"']/g, {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  })
});