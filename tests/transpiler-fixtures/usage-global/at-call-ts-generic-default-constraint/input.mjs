function wrap<T extends string[] = string[]>(items: T): T { return items; }
wrap().at(-1);
