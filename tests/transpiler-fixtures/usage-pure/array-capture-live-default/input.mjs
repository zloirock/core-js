// A live default supplies the captured value, never the original undefined source.
export function read(source) { const [{ includes } = fallback()] = [source]; return includes; }
