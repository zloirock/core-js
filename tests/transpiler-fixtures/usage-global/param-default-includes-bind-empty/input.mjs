function f(value = [1]) { return value.includes('a'); }
export default f.bind(null)();
