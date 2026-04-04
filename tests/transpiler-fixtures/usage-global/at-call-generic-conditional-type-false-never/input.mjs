function extract<T>(x: T): T extends string ? T : never { return x as any; }
extract('hello').at(0);
