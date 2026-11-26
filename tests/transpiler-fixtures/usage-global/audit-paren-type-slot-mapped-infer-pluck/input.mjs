type Pluck<V> = { [K in ('items' | 'name')]: V };
declare const plucked: Pluck<number[]>;
plucked.items.includes(1);
