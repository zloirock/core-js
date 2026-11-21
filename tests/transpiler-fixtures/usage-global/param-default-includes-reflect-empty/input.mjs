function f(value = [1]) { return value.includes('a'); }
export default Reflect.apply(f, null, []);
