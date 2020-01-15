---
title: CSS in JS的好与坏
thumbnail: /gallery/thumbnails/css-in-js.png
tags:
  - CSS-in-JS
  - CSS
  - JavaScript
---
## 是什么
CSS-in-JS是一种技术（technique），而不是一个具体的库实现（library）。简单来说CSS-in-JS就是**将应用的CSS样式写在JavaScript文件里面**，而不是独立为一些`.css`，`.scss`或者`less`之类的文件，这样你就可以在CSS中使用一些属于JS的诸如模块声明，变量定义，函数调用和条件判断等语言特性来提供灵活的可扩展的样式定义。值得一提的是，虽然CSS-in-JS不是一种很新的技术，可是它在国内普及度好像并不是很高，它当初的出现是因为一些`component-based`的Web框架（例如React，Vue和Angular）的逐渐流行，使得开发者也想将组件的CSS样式也一块封装到组件中去以**解决原生CSS写法的一系列问题**。还有就是CSS-in-JS在React社区的热度是最高的，这是因为React本身不会管用户怎么去为组件定义样式的问题，而Vue和Angular都有属于框架本身的一套定义样式的方案。

本文将通过分析CSS-in-JS这项技术带来的好处以及它存在的一些问题来帮助大家判断自己是不是要在项目中使用CSS-in-JS。

## 不同的实现
实现了CSS-in-JS的库有很多很多，[据统计](https://github.com/MicheleBertoli/css-in-js)现在已经超过了61种。虽然每个库解决的问题都差不多，可是它们的实现方法和语法却大相径庭。从实现方法上区分大体分为两种：唯一CSS选择器和内联样式（Unique Selector VS Inline Styles）。接下来我们会分别看一下对应于这两种实现方式的两个比较有代表性的实现：[styled-components](https://www.styled-components.com/)和[radium](https://formidable.com/open-source/radium/)。

### Styled-components
[Styled-components](https://www.styled-components.com/) 应该是CSS-in-JS最热门的一个库了，到目前为止github的star数已经超过了27k。通过styled-components，你可以使用ES6的[标签模板字符串](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)语法（Tagged Templates）为需要`styled`的Component定义一系列CSS属性，当该组件的JS代码被解析执行的时候，styled-components会动态生成一个CSS选择器，并把对应的CSS样式通过style标签的形式插入到head标签里面。动态生成的CSS选择器会有一小段哈希值来保证全局唯一性来避免样式发生冲突。

[CSS-in-JS Playground](https://www.cssinjsplayground.com/)是一个可以快速尝试不同CSS-in-JS实现的网站，上面有一个简单的用styled-components实现表单的例子：

![](/images/css-in-js/styled-component-form.png)

打开DevTools查看一下生成的CSS：

![](/images/css-in-js/styled-component-form-devtools.png)

从上面DevTools可以看出styled的Component样式存在于style标签内，而且选择器名字是一串随机的哈希字符串。

### Radium
[Radium](https://formidable.com/open-source/radium/)是由FormidableLabs创建的在github上有超过7.2k star的CSS-in-JS库。Radium和styled-components的最大区别是它生成的是标签内联样式（inline styles）。由于标签内联样式处理诸如`media query`以及`:hover`，`:focus`，`:active`等和浏览器状态相关的样式非常不方便，所以radium为这些样式封装了一些标准的接口以及抽象。

再来看一下radium在CSS-in-JS Playground的例子：

![](/images/css-in-js/radium-form.png)

打开DevTools查看一下生成的CSS：

![](/images/css-in-js/radium-form-css.png)

从DevTools上面inpsect的结果可以看出，radium会直接在标签内生成内联样式。

不同的CSS-in-JS实现除了生成的CSS样式和编写语法有所区别外，它们实现的功能也不尽相同，除了一些最基本的诸如CSS局部作用域的功能，下面这些功能有的实现会包含而有的却不支持：
* 自带生成浏览器引擎前缀 - built-in vendor prefix
* 抽取独立的CSS样式表 - extract css file
* 自带支持动画 - built-in support for animations
* 其他

想了解更多关于不同CSS-in-JS的对比，可以看一下Michele Bertoli整理的不同实现的[对比图](https://github.com/michelebertoli/css-in-js#features)。

## 好处
看完了一些不同的实现，对CSS-in-JS有了大概的了解后，我们可以来聊一下CSS-in-JS都有什么好处和坏处了。
### Scoping Styles
Automatically creating hash name for your class, no need to worry about naming and class conflicts.
### 避免无用的CSS样式堆积 - Dead Code Elimination
Scope CSS to component level, no need to worry about css cascading to affect other element styles. if you don't need the component, the style of this component will be removed. shift will less code

are afraid what they can or can't delete

converging to the component level

### Critical CSS
link style is render-blocking, critical css will generate the minimum css needed for the first-page-rendering and put it directly in the style tag of the page to prevent page render blocking. Async load the rest of css.

### Code Reuse
自定义函数，在CSS里面使用函数

### Easy to use with Design Systems/Component Libraries
npm install
extend the code
## 坏处
### runtime
### lock-in
### code readability
automatically generated selectors significantly wosen code readability.

## 个人思考
You maynot need the css in js.

create a complex UX for monolithic front-end, such as state-based functionality.

## 参考文献
* [An Introduction to CSS-in-JS: Examples, Pros, and Cons](https://webdesign.tutsplus.com/articles/an-introduction-to-css-in-js-examples-pros-and-cons--cms-33574)
* [Why I Write CSS in JavaScript](https://mxstbr.com/thoughts/css-in-js)
* [Oh No! Our Stylesheet Only Grows and Grows and Grows!](https://css-tricks.com/oh-no-stylesheet-grows-grows-grows-append-stylesheet-problem/)
* [What actually is CSS-in-JS](https://medium.com/dailyjs/what-is-actually-css-in-js-f2f529a2757)
* [The tradeoffs of CSS-in-JS](https://medium.com/free-code-camp/the-tradeoffs-of-css-in-js-bee5cf926fdb)
* [9 CSS in JS Libraries you should Know in 2019](https://blog.bitsrc.io/9-css-in-js-libraries-you-should-know-in-2018-25afb4025b9b)
