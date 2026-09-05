try {} catch ({ [Symbol.iterator]: iter }) { for (const x of { [iter]: () => ({ next() { return { done: true }; } }) }) {} }
