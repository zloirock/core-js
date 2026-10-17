{
for (const { x } of [...[{ x: [1] }], { x: [2] }]) x.at(0);
}
