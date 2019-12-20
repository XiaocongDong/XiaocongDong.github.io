---
title: console你真的只会log?
tags:
  - 前端开发技巧
  - JavaScript
---
console.log这个API我相信写过前端或者node的人一定都有接触过，它可谓是我们在代码出bug时的灵丹妙药。可是你知不知道console这个神奇的object除了log这个方法，还有其他方法可以帮你快速提高代码debug的效率（逼格）呢？本文将会为大家介绍几个鲜为人知可是却十分有用的console APIs。
## console.log | console.info | console.debug | console.warn | console.error
### 使用场景
帮助开发者快速地识别出不同类型的输出内容，以及可以在调试工具里面按照不同的level进行筛选消息，让你不再在海量的信息中迷失自己。
### 用法
这几个方法用起来都差不多，可能会存在颜色的区别：
![](/images/console/level.png)
注意console.debug如果没有输出可以将log level中的verbose选上（chrome）:
![](/images/console/level-verbose.png)

## 替换字符串 - string substitution
### 使用场景
更好地呈现输出时的上下文信息（context）。
### 用法
现在支持以下的替换字符串：
| 替换字符串     |                                                     描述 |
| -------------- | -------------------------------------------------------: |
| `%o` 或者 `%O` | 打印 JavaScript 对象，可以是整数、字符串或是 JSON 数据。 |
| `%d`或者`%i`   |                                               打印整数。 |
| `%s`           |                                             打印字符串。 |
| `%f`           |                                             打印浮点数。 |
![](/images/level-verbose.png)
