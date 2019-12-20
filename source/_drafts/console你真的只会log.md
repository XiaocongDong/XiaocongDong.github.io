---
title: 快速提高debug效率的console方法
tags:
  - 前端开发技巧
  - JavaScript
---
console.log这个API我相信写过前端或者node的人一定都有接触过，它可谓是debug灵丹妙药。可是你知不知道console这个object除了log方法，还有许多可以帮你快速提高代码debug的效率（逼格）的方法呢？本文将会为大家介绍几个鲜为人知可是却十分有用的console APIs。
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

![](/images/console/level-verbose.png)

## console.assert
### 使用场景
条件性输出。有些输出你可能只想在某些条件不满足的时候才进行输出，这个时候你可以用这种方法。
### 用法
```javascript
console.assert(condition, ...data)
```
注意只有condition是false的时候data才会被输出：
![](/images/console/assert.png)

## console.table
### 使用情景
以表格的形式输出数据。这个方法最适用的场景我觉得是对象的数组，因为他可以让你一目了然地看到数组内对象各个属性的值。
### 用法
![](/images/console/table.png)
在这种情景如果你直接使用console.log来输出students这个变量你还要逐个点开才能看到里面的内容真是非常不方便。

## console.group
### 使用情景
当你有大量的内容要输出到界面上时，可以使用console.group方法为输出的内容添加一定的缩进来更好地整理这些内容。
### 用法
![](/images/console/group.png)
这里要记住的是每个group都需要手动地调用groupEnd来退出。

## console.trace
### 使用情景
追踪函数的执行栈。当你想知道一个函数具体是怎样被调用的时，可以使用console.trace这个函数去追踪它的执行栈。
### 用法
![](/images/console/trace.png)

## console.count
### 使用场景
统计代码的执行次数。
### 用法
![](/images/console/count.png)
你还可以使用label去做多个统计：
![](/images/console/label-count.png)

## console.time
### 使用场景
记录代码执行的耗时，以毫秒（ms）为单位。
### 用法
```
console.time(timerName)
```
![](/images/console/time.png)

## 参考网站
* https://developer.mozilla.org/en-US/docs/Web/API/Console
* https://medium.com/javascript-in-plain-english/mastering-js-console-log-like-a-pro-1c634e6393f9
