async function f() { try { await g(); } catch ({ includes }) { includes("x"); } }
