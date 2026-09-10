import "core-js/modules/es.object.freeze";
// the call's own static pulls its module; the ARGUMENT is an ordinary free identifier. a name that
// merely rhymes with a global carries no constructor and escapes into no family - the entry a name
// derives has to spell that name back, or every variable called `array` or `set` ships one
Object.freeze(array);