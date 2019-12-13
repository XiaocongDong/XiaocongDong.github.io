---
title: Svelte 3 初学者完全教程
tags: Svelte
# thumbnail: /gallery/svelte_intro.png
---
想必大家都有用过一些Web框架，例如React, Vue和Angular。可是最近一款“新”的框架[Svelte](!https://svelte.dev/)却开始受到越来越多人的关注。Svelte之所以可以在框架林立的前端领域还能受到大家的关注主要是因为其理念和一些主流的框架完全不同（runtime vs compiler）。本文将会为大家介绍和Svelte框架相关的一些概念，以及教大家如何入门这个新的框架去构建一个简单的书店（book store）应用。

# 为什么要学习Svelte?
## 大的运行时
React和Vue之类的框架是基于runtime的，也就是框架本身的代码会被打包到产品中并在你请求网站的时候发送到你的浏览器，当用户在你的页面进行各种操作的时候，你的框架的代码会进行一些virtual DOM diff和相关的调度算法去更新页面上面的DOM。不同于React和Vue，Svelte框架的代码不会被包含在你最后打包的代码中，它只会存在于你的编译阶段。你所有对组件状态的变更操作，都会在代码被编译的时候转换为原生的JavaScript操作，不会在用户操作页面的时候再动态计算需要改的地方。

问题是，作为一个前端程序员，我为什么要关心框架的代码会不会被发送给浏览器呢？因为这个会直接影响到你网站的首屏加载代码的大小，从而影响的首屏加载时间！那么这些常用框架它们的runtime的大小有多大呢？来看一个[统计数据](https://gist.github.com/Restuta/cda69e50a853aa64912d):

| Name                             | Size     |
| -------------------------------- | -------- |
| Ember 2.2.0                      | 435K     |
| Ember 1.13.8                     | 486K     |
| Angular 2                        | 566K     |
| Angular 2 + Rx                   | **766K** |
| Angular 1.4.5                    | 143K     |
| Vue 2.4.2                        | 58.8K    |
| Inferno 1.2.2                    | 48K      |
| Preact 7.2.0                     | **16K**  |
| React 0.14.5 + React DOM         | **133K** |
| React 0.14.5 + React DOM + Redux | 139K     |
| React 16.2.0 + React DOM         | 97.5K    |

由上面的统计数据可以看出一些常用的框架例如React和Vue本身框架就有几十k甚至100多k的大小，也就是说即使你的web业务代码很少，你用了这些框架你的首屏加载的代码最少也得快100k起步。可是对于一些功能简单的应用，一些框架的功能压根就没有必要被打包，例如React的Concurrent Mode并不是所有的应用都需要。那么有什么办法去解决这个问题吗？用过一些打包工具的人一定通说过tree-shaking这个概念，tree-shaking的意思就是在代码打包的时候，打包工具会识别出那些没有被使用过的代码，进而不讲它们打包到最后的产品代码中。那么框架的代码能否也可以被tree-shaking呢？我们只加载我们用到的框架代码？其实这就是Compiler-as-framework这个概念的出发点，将框架放在编译阶段，而Svelte就是基于这个概念的一个框架。

## 低效的Virtual DOM diffing
除了大的runtime代码，基于Virtual DOM的diff算法的低效其实也是一个Svelte想解决的问题。看到这个你可能会问，virtual dom不是一直以高效著称吗？怎么会有低效的问题？virtual dom的高效是因为当组件的状态发生改变的时候，它会通过一系列的计算来确定真是需要改变的dom来避免无效的dom更新来达到的。所以它的高效是建立在不直接更新“无辜”节点的基础上的。而且虽然原生的节点虽然没有被更新，可是它们所在的组件可能被重渲染了（re-render），为了避免组件的无效重渲染，你就要在代码中书写大量的诸如ShouldComponentUpdate，useMemo之类的判断。

# 什么是Svelte?
Svelte是由[RollupJs](https://rollupjs.org/guide/en/)的作者Rich Harris编写的编译型的框架，它具有以下特点：
* 和React和Vue等现代Web框架很相似，允许开发者快速地开发具有流畅用户体验的Web应用。
* 没有使用Virtual DOM，也不是一个runtime的库。
* Svelte会在编译的时候将你的应用转换为原生的JavaScript操作，