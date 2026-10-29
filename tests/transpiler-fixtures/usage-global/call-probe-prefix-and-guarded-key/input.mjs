// A call-yield probe keeps its prefix before the guard and its key inside it.
// The same static import serves both emitters; the source call is evaluated once.
const read = () => globalThis.window;
(log.push('prefix'), read())?.self?.Array[log.push('key'), 'from']((log.push('argument'), [7]));
