// ~ES7 : https://gist.github.com/kangax/9698100
$define(STATIC, REGEXP, {escape: createEscaper(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)});