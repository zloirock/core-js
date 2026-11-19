function first<T>(x: [T, ...T[]]): T { return x[0]; }
first(['a', 'b']).trim();
