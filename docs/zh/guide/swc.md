---
icon: tool
category: guide
---

# SWC 集成

高速 JavaScript 转译器 `SWC` [内建了对 Core-JS 的集成](https://swc.rs/docs/configuration/supported-browsers), 可以简化全局版本的 Core-JS 的使用。
类似于 [`@babel/preset-env`](babel.md#babelpreset-env)，SWC 支持两种模式，`usage` 和 `entry`。不过目前 `usage` 模式的表现相对于 `Babel` 仍旧不那么尽如人意。
以下为一个在 `.swcrc` 中使用 core-js 的简单示例：

```json
{
  "env": {
    "targets": "> 0.25%, not dead",
    "mode": "entry",
    "coreJs": "3.25"
  }
}
```
