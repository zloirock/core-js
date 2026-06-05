// self-reference `var X = X` of an injectable global that carries no known RETURN type (so it
// is absent from known-built-in-return-types) must still register the usage and inject - the
// gate now derives from built-in-definitions globals, covering Iterator / AsyncIterator / etc.
var Iterator = Iterator;
