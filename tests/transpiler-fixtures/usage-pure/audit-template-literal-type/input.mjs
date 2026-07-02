// TSTemplateLiteralType resolves to $Primitive('string'); receiver => string-specific polyfill.
// .at(0) on string => _atMaybeString; .includes on string => _stringIncludes.
declare const s: `hello_${string}`;
s.at(0);
s.includes('foo');
