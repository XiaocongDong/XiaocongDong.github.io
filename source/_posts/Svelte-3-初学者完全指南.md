---
title: Svelte 3 初学者完全指南
tags: Svelte
date: 2019-12-17 12:04:50
---

React, Vue和Angular差不多占据了Web开发的大部分江山，可是最近半年[Svelte](!https://svelte.dev/)开始逐渐吸引越来越多人的眼球。这个Svelte框架到底有什么过人之处呢？本文将会为大家分析一下Svelte火起来的原因，并且通过使用Svelte去搭建一个简单的书店应用（bookshop）来帮助大家快速入门这门框架。

# Svelte为什么会火?
要想知道Svelte为什么会火，首先得看看React和Vue这些框架存在什么问题。
<!-- more --> 
## big runtime - 大的运行时
React和Vue都是基于runtime的框架。所谓基于runtime的框架就是框架本身的代码也会被打包到最终的bundle.js并被发送到用户浏览器。当用户在你的页面进行各种操作改变组件的状态时，框架的runtime会根据新的组件状态（state）计算（diff）出哪些DOM节点需要被更新，从而更新视图。那么这些runtime代码到底有多大呢，可以看一些社区的[统计数据](https://gist.github.com/Restuta/cda69e50a853aa64912d):

| Name                             | Size      |
| -------------------------------- | --------- |
| Ember 2.2.0                      | 435K      |
| Ember 1.13.8                     | 486K      |
| Angular 2                        | 566K      |
| Angular 2 + Rx                   | **766K**  |
| Angular 1.4.5                    | 143K      |
| Vue 2.4.2                        | 58.8K     |
| Inferno 1.2.2                    | 48K       |
| Preact 7.2.0                     | **16K**   |
| React 0.14.5 + React DOM         | **133K**  |
| React 0.14.5 + React DOM + Redux | 139K      |
| React 16.2.0 + React DOM         | **97.5K** |

从上面的表格可以看出常用的框架中，最小的Vue都有58k，React更有97.5k。换句话说如果你使用了React作为开发的框架，即使你的业务代码很简单，你的首屏bundle size都要100k起步。当然100k不算很大，可是事物都是相对的，相对于大型的管理系统来说100k肯定不算什么，可是对于那些首屏加载时间敏感的应用（例如淘宝，京东主页），100k的bundle size在一些网络环境不好的情况或者手机端真的会影响用户体验。那么如何减少框架的runtime代码大小呢？要想减少runtime代码的最有效的方法就是压根不用runtime。其实回想一下Web开发的历史，很早之前在用Jquery和Bootstrap一把梭的时候，我们的代码不就是不包含runtime的吗？当数据变化时直接通过JavaScript去改变原生DOM节点，没有框架那一系列diff和调度（React Fiber）的过程。这时你可能会问，要减少bundle size真的要回到那个刀耕火种的时代吗？有没有那种既可以让我用接近React和Vue的语法编写代码，同时又不包含框架runtime的办法。这恰恰就是Svelte要做的东西，它采用了Compiler-as-framework的理念，将框架的概念放在编译时而不是运行时。你编写的应用代码在用诸如Webpack和Rollup等工具打包的时候会被直接转换为JavaScript对DOM节点的原生操作，从而让bundle.js不包含框架的runtime。那么Svelte到底可以将bundle size减少多少呢？以下是[RealWorld](https://www.freecodecamp.org/news/a-realworld-comparison-of-front-end-frameworks-with-benchmarks-2019-update-4be0d3c78075/)这个项目的统计：![](/images/svelte3-intro/bundle-size.png)
由上面的图表可以看出实现相同功能的应用，Svelte的bundle size大小是Vue的1/4，是React的1/20！单纯从这个数据来看，Svelte这个框架对bundle size的优化真的很大。

## 低效的Virtual DOM Diff
什么？Virtual DOM不是一直都很高效的吗？其实Virtual DOM高效是一个误解。说Virtual DOM高效的一个理由就是它不会直接操作原生的DOM节点，因为这个很消耗性能。当组件状态变化时它会通过某些diff算法去计算出本次数据更新真实的视图变化，然后只改变“需要改变”的DOM节点。用过React的人可能都会体会到React并没有想象中那么高效，框架有时候会做很多无用功，这体现在很多组件会被“无缘无故”进行重渲染（re-render）。注意这里说的re-render和对原生DOM进行操作是两码事！所谓的re-render是你定义的class Component的render方法被重新执行，或者你的组件函数被重新执行。组件被重渲染是因为Vitual DOM的高效是建立在diff算法上的，而要有diff一定要将组件重渲染才能知道组件的新状态和旧状态有没有发生改变，从而才能计算出哪些DOM需要被更新。你可能会说React Fiber不是出来了吗，这个应该不是问题了吧？其实Fiber这个架构解决的问题是不让组件的重渲染和reconcile的过程阻塞主线程的执行，组件重渲染的问题依然存在，而且据反馈，React Hooks出来后组件的重渲染更加频繁了。正是因为框架本身很难避免无用的渲染，React才允许你使用一些诸如shouldComponentUpdate，PureComponent和useMemo的API去告诉框架哪些组件不需要被重渲染，可是这也就引入了很多模板代码（boilerplate）。如果大家想了解更多关于Virtual DOM存在的问题，可以看一下[virtual dom is pure overhead](https://svelte.dev/blog/virtual-dom-is-pure-overhead)这篇文章。

那么如何解决Vitual DOM算法低效的问题呢？最有效的解决方案就是**不用Virtual DOM**！其实作为一个框架要解决的问题是当数据发生改变的时候相应的DOM节点会被更新（reactive），Virtual DOM需要比较新老组件的状态才能达到这个目的，而更加高效的办法其实是**数据变化的时候直接更新对应的DOM节点**：
```javascript
if (changed.name) {
  text.data = name;
}
```
这就是Svelte采用的办法。Svelte会在代码编译的时候将每一个状态的改变转换为对应DOM节点的操作，从而在组件状态变化的时候快速高效地对DOM节点进行更新。根据[js framework benchmark](https://krausest.github.io/js-framework-benchmark/current.html)的统计，Svelte在对一些大列表操作的时候性能比React和Vue都要好。

# 什么是Svelte?
Svelte是由[RollupJs](https://rollupjs.org/guide/en/)的作者Rich Harris编写的编译型框架，没了解过RollupJs的同学可以去它官网了解一下，它其实是一个类似于Webpack的打包工具。Svelte这个框架具有以下特点：
* 和React，Vue等现代Web框架的用法很相似，它可以允许开发者快速开发出具有流畅用户体验的Web应用。
* 不使用**Virtual DOM**，也不是一个runtime的库。
* 基于Compiler as framework的理念，会在编译的时候将你的应用转换为原生的DOM操作。
* 默认就支持类似于CSS modules的CSS scope功能，让你避免CSS样式冲突的困扰。
* 原生支持CSS animation。
* 极其容易的组件状态管理（state management），减少开发者的模板代码编写（boilerplate less）。
* 支持反应式定义（Reactive statement）。
* 极其容易的应用全局状态管理，框架本身自带全局状态，类似于React的Redux和Vue的Vuex。
* 支持context，避免组件的props drilling。

Svelte这个框架与Vue和React之间最大的区别是它除了管理组件的状态和追踪他们的渲染，还有很多其他有用的功能。例如它原生支持CSS scope和CSS animation。如果你用React或者Vue是需要引入第三方库来实现同样的功能的，而第三方依赖的引入会给开发者增加学习和维护的成本。

# 用Svelte搭建一个Bookshop应用
接下来我们会从头开始搭建一个基于Svelte框架的简单书店应用bookshop，通过这个demo，希望大家可以理解Svelte的一些基本概念和掌握它的一些基本用法并能够使用Svelte去搭建更加复杂的应用。
## 应用功能
Bookshop应用支持以下功能：
* 管理员录入新图书
* 展示书店图书列表
* 将图书加到购物车
* 展示购物车的数据信息

## 对学习者的技术要求
* 掌握html，css和javascript的基础用法
* 有过React或者Vue的相关开发经验最佳

项目的源代码可以在我的[github仓库](https://github.com/XiaocongDong/svelte-bookshop)找到。

## 项目搭建
首先在我们的本地开发环境新建一个项目文件夹：
```shell
mkdir svelte-bookshop
```
接着用svelte官方的脚手架去初始化我们的应用：
```shell
npx degit sveltejs/template svelte-bookshop
cd svelte-bookshop

yarn
yarn dev
```
[degit](https://github.com/Rich-Harris/degit)这个命令会将github上面的项目文件直接拷贝到某个本地文件夹，这里使用到的svelte/tempalte模板项目的github地址是[这个](https://github.com/sveltejs/template)。以上命令成功运行后，访问[http://localhost:5000](http://localhost:5000/)你会看到如下界面：
![](/images/svelte3-intro/bootstrap.png)
界面很简单就是展示一个hello world，接着让我们看一下生成的项目目录结构：
![](/images/svelte3-intro/bootstrap-structure.png)
生成的代码主要包含以下文件目录结构：
* rollup.config.js，这个是rollup的配置文件，类似于webpack.config.js，里面指定了项目的入口文件是src/main.js。
* src文件夹，这个文件夹用来存储我们的项目源代码，现在只有一个项目的主入口文件main.js和一个组件文件App.svelte。
* public文件夹，这个文件夹是用来存储项目的静态文件（index.html, global.css和favicon.png）和rollup编译生成的静态文件（build文件夹底下的bundle.js和bundle.css以及它们各自的source map）。

接着让我们具体看一下src文件夹底下的各个文件内容
### src/App.svelte
```javascript
<script>
	export let name;
</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
```
这个文件定义了一个叫做App的Svelte组件，这里要注意App.svelte文件内并没有定义组件的名称，**组件的名称是由它的文件名确定的**。**Svelte组件的文件名都是以.svelte结尾的**，一个组件文件通常会包含以下三部分内容：
* **\<script\>标签**，和组件相关的任何JavaScript代码都可以放在这里，例如组件的状态定义或者一些异步Ajax请求。在这个App.svelte文件里面没有定义局部的组件状态，而是定义并export了一个name变量。对于Svelte框架，export一个变量就是将这个变量指定为当前组件的一个外部参数 - props。这种做法和React里面的将props作为组件的第一个参数的区别很大，可能大家一开始有点不习惯，不过后面习惯了，你可能也会爱上这种写法的。
* **\<style\>标签**，和组件相关的CSS代码会放在这里。注意这里的CSS是局部生效的（scope），也就是说App.svelte中的h1标签的样式只会对App组件内的h1标签生效，而对项目其他的包括这个组件的子节点的h1标签失效。具体可以用浏览器的调试工具看一下h1标签的实际样式就明白了: ![](/images/svelte3-intro/bootstrap-h1-css.png)由上图可以看出Svelte在生成代码的时候会用一些随机的哈希值将组件的样式和其它组件的样式区别开来。
* **组件的HTML标签**。组件的HTML标签可以直接在文件中写出来，例如App组件的HTML部分是：
```html
<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>
```
App组件最外层是一个main标签，main标签里面有一个h1标签和p标签，其中h1标签里面是一个`Hello `字符串加一个用花括号包裹的插入字符串（interpolation），在React JSX里面的写法应该是`Hello ${name}`，它们都表示这个位置的字符串就是name这个变量的内容。至于这个name变量就是我们在上面用export定义的外部参数。

总的来说Svelte会将所有和组件相关的JavaScript，CSS和HTML代码都放在同一个文件里面，这个做法有点像Vue，不过和Vue相比它的模板代码更少。

### src/main.js
```javascript
import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;
```
这个文件内容很简单，就是将刚刚定义的App组件挂载到目标节点body上，而且为App组件提供了值为`world`的name参数。这段代码的作用和React中的ReactDOM.render函数一样。

接着让我们看一下生成的静态代码是什么样子的。
### public/build/bundle.js
先看生成的JavaScript主文件bundle.js，由于原文件比较大，我只截取了其中比较关键的一部分：
```javascript
/* src/App.svelte generated by Svelte v3.16.4 */

const file = "src/App.svelte";

function create_fragment(ctx) {
  let main;
  let h1;
  let t0;
  let t1;
  let t2;
  let t3;
  let p;
  let t4;
  let a;
  let t6;

  const block = {
    c: function create() {
      main = element("main");
      h1 = element("h1");
      t0 = text("Hello ");
      t1 = text(/*name*/ ctx[0]);
      t2 = text("!");
      t3 = space();
      p = element("p");
      t4 = text("Visit the ");
      a = element("a");
      a.textContent = "Svelte tutorial";
      t6 = text(" to learn how to build Svelte apps.");
      attr_dev(h1, "class", "svelte-1tky8bj");
      add_location(h1, file, 5, 1, 46);
      attr_dev(a, "href", "https://svelte.dev/tutorial");
      add_location(a, file, 6, 14, 83);
      add_location(p, file, 6, 1, 70);
      attr_dev(main, "class", "svelte-1tky8bj");
      add_location(main, file, 4, 0, 38);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, main, anchor);
      append_dev(main, h1);
      append_dev(h1, t0);
      append_dev(h1, t1);
      append_dev(h1, t2);
      append_dev(main, t3);
      append_dev(main, p);
      append_dev(p, t4);
      append_dev(p, a);
      append_dev(p, t6);
    },
    p: function update(ctx, dirty) {
      if (dirty[0] & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching) detach_dev(main);
    }
  };

  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment.name,
    type: "component",
    source: "",
    ctx
  });

  return block;
}
```
这段代码对应的就是我们刚刚定义的App组件，`create_fragment`方法会接受一个上下文对象`ctx`参数并返回一个代表组件的block对象。
#### block
这个对象主要包含以下四个重要的方法`c`（create），`m`（mount），`p`（update）和`d`（destroy）。
#### c（create）
```javascript
function create() {
  main = element("main");
  h1 = element("h1");
  t0 = text("Hello ");
  t1 = text(/*name*/ ctx[0]);
  t2 = text("!");
  t3 = space();
  p = element("p");
  t4 = text("Visit the ");
  a = element("a");
  a.textContent = "Svelte tutorial";
  t6 = text(" to learn how to build Svelte apps.");
  attr_dev(h1, "class", "svelte-1tky8bj");
  add_location(h1, file, 5, 1, 46);
  attr_dev(a, "href", "https://svelte.dev/tutorial");
  add_location(a, file, 6, 14, 83);
  add_location(p, file, 6, 1, 70);
  attr_dev(main, "class", "svelte-1tky8bj");
  add_location(main, file, 4, 0, 38);
}
```
这个函数的功能是生成（create）和App组件相关的一些原生DOM节点，并为它们添加一些元数据（meta data）。
#### m（mount）
```javascript
function mount(target, anchor) {
  insert_dev(target, main, anchor);
  append_dev(main, h1);
  append_dev(h1, t0);
  append_dev(h1, t1);
  append_dev(h1, t2);
  append_dev(main, t3);
  append_dev(main, p);
  append_dev(p, t4);
  append_dev(p, a);
  append_dev(p, t6);
}
```
这个函数的功能是挂载c函数生成的那些DOM节点。
#### p（update）
```javascript
function update(ctx, dirty) {
  if (dirty[0] & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
}
```
p函数会在ctx上下文更新的时候去更新对应DOM节点的属性。大概就是当上下文变化的时候，检查一下name这个变量有没有变化，如果发生变化则更新DOM节点。
#### d（destroy）
```javascript
function destroy(detaching) {
  if (detaching) detach_dev(main);
}
```
d函数是用来删除App组件的。

看完Svelte生成的代码后，我想你对我在文章开头说的Compiler-as-framework等概念应该有了更加深刻的认识，Svelte和React（Vue也类似）不一样的是，**React应用在打包完之后，还保留了如React.createElement，setState等框架函数的调用代码，而Svelte编译完之后，框架代码会被转化为操作原生DOM节点的代码。**

大概了解了项目的组织结构后，让我们开始正式搭建书店bookshop应用。

## 组件定义
### HTML markup
首先让我们创建一个展示书本具体信息的卡片组件，在src文件夹底下新建一个BookCard.svelte文件，里面定义一下卡片组件的HTML markup：
```html
// src/BookCard.svelte
<div>
  <h1>title</h1>
  <div>price</div>
  <div>description</div>
  <button>添加到购物车</button>
</div>
```
然后在App.svelte组件里面使用BookCard组件:
```html
// src/App.svelte
<script>
  import BookCard from "./BookCard.svelte";
</script>

<style>
 ...
</style>

<main>
  <h1>Welcome to my online bookstore!</h1>
  <section>
    <BookCard />
  </section>
</main>
```
**使用自定义的组件的方法很简单：先在script标签里面导入新定义的组件BookCard，然后将该组件写在App组件的HTML markup里面，语法和JSX一样的。**这时候再查看页面的内容：![](/images/svelte3-intro/bookcard-markup.png)

### CSS
BookCard组件虽然出来了，我们得定义一些CSS让它变得更好看一点：
```html
// src/BookCard.svelte
<style>
  .card {
    text-align: left;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    padding: 10px;
  }

  h1 {
    font-size: 20px;
  }

  h2 {
    font-size: 15px;
    color: #999;
  }

  button {
    background-color: #ff3e00;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    border: none;
  }
</style>

<div class="card">
  <h1>title</h1>
  <h2>price</h2>
  <p>description</p>
  <button>添加到购物车</button>
</div>
```
**给组件定义样式的方法就是新建一个style标签然后把该组件相关的样式写在这个标签内，注意这里的样式只会对组件内的元素有效，不会影响到其他组件的样式的。**加完样式后，界面应该会变成这个样子：![](/images/svelte3-intro/bookcard-css.png)

### props定义
书本的具体信息应该是由传入的props指定的。**Svelte组件的props要用export来指明，指明的props变量可以直接被组件使用**：
```html
// src/BookCard.svelte
<script>
  export let title;
  export let price;
  export let description;
</script>

<style>
...
</style>

<div class="card">
  <h1>title</h1>
  <h2>price</h2>
  <p>description</p>
  <button>添加到购物车</button>
</div>
```
### 变量使用
定义和引入的变量可以在组件的HTML markup中直接使用，具体用法是在Markup中用花括号（curly braces）引用该变量，具体代码时：
```html
// src/BookCard.svelte
<script>
  export let title;
  export let price;
  export let description;
</script>

<style>
...
</style>

<div class="card">
  <h1>{title}</h1>
  <h2>${price}</h2>
  <p>{description}</p>
  <button>添加到购物车</button>
</div>
```
### 组件参数传递
然后在父级组件App中，将BookCard需要的参数传给该组件：
```html
// src/App.svelte
<script>
  ...
  let title = "JavaScript高级编程";
  let price = 99.0;
  let description = "一起来学习JavaScript啊";
</script>

<style>
  ...
</style>

<main>
  <h1>Welcome to my online bookstore!</h1>
  <section>
    <BookCard title={title} price={price} description={description} />
  </section>
</main>
```
这时候书本卡片的内容应该是传入的参数了：![](/images/svelte3-intro/bookcard-props.png)
对于组件参数传递，Svelte还提供了以下更加方便的写法：
```html
// src/App.svelte
<main>
  <h1>Welcome to my online bookstore!</h1>
  <section>
    <BookCard {title} {price} {description} />
  </section>
</main>
```
## 录入书本信息
作为一个书店，管理员应该可以录入新的图书，所以我们给App组件添加一个简单的表单来让用户录入数据：
```html
// src/App.svelte
<script>
  ...
</script>

<style>
  ....
</style>

<main>
  <h1>Welcome to my online bookstore!</h1>
  <section>
    <h2>Add new book</h2>
    <label for="title">Title</label>
    <input type="text" id="title" value={title} />
    <label for="price">Price</label>
    <input type="number" id="price" value={price} />
    <label for="description">Description</label>
    <textarea rows="3" id="description" value={description} />
  </section>
  <section>
    <BookCard {title} {price} {description} />
  </section>
</main>
```
我们为App组件新建了一些input标签，并指定这些input标签的值为我们之前定义的变量，这时候我们试着改变输入框的内容：![](/images/svelte3-intro/book-input-not-bind.gif)
虽然输入框的初始值是变量对应的值，可是变量的值并不会随着输入框的值的改变而改变，也就是它们的值没有”绑定起来“，要想实现双向数据绑定，我们可以给输入框添加一个监听事件。
### 事件绑定
**我们可以使用on关键字加事件名称给DOM添加事件监听器**，以下代码将会监听input输入框的`input`事件：
```html
<script>
  ...
  let title = "JavaScript高级编程";
  ...

  function handleTitleChange(event) {
    title = event.target.value;
  }
</script>

<style>
  ...
</style>

<main>
  <h1>Welcome to my online bookstore!</h1>
  <section>
    <h2>Add new book</h2>
    <label for="title">Title</label>
    <input type="text" id="title" value={title} on:input={handleTitleChange} />
    ...
  </section>
</main>
```
这时候我们再改变input的值，会发现卡片里面的内容也发生了改变，说明我们成功改变了`title`变量的值：![](/images/svelte3-intro/book-input-event-bind.gif)

### 自动数据双向绑定
可是如果每一个input标签都要手动添加一个事件监听的话我们的代码会有很多模板代码，为了解决这个问题，**Svelte允许我们直接用bind关键字加要绑定的属性进行双向数据绑定**：
```html
// src/App.svelte
<script>
  ...
  let title = "JavaScript高级编程";
  let price = 99.0;
  let description = "一起来学习JavaScript啊";
</script>

<style>
  ...
</style>

<main>
  <h1>Welcome to my online bookstore!</h1>
  <section>
    <h2>Add new book</h2>
    <label for="title">Title</label>
    <input type="text" id="title" bind:value={title} />
    <label for="price">Price</label>
    <input type="number" id="price" bind:value={price} />
    <label for="description">Description</label>
    <textarea rows="3" id="description" bind:value={description} />
  </section>
  ...
</main>
```
这时候我们就可以把各个变量的初始值去掉：
```html
// src/App.svelte
<script>
  let title = "";
  let price = 0;
  let description = "";
</script>
```
这时候我们页面的输入框和所有变量都”绑定“起来了：![](/images/svelte3-intro/book-input-bind.gif)
## 展示书本列表
我们的书店应该不止一本书，要用一个数组把所有的书本存起来：
```html
// src/App.svelte
<script>
  ...
  let books = [];
  ...
</script>
```
接着我们再为刚刚新增的表单添加一个提交按钮，用户填完书本的信息后点击提交会新建一个book对象，新建的book对象会被加到books列表中去：
```html
<script>
  ...
  let books = [];

  function handleAddBook() {
    books = books.concat({ title, price, description });
    title = "";
    price = 0;
    description = "";
  }
  ...
</script>

<style>
  ...
  button {
    background-color: #ff3e00;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    border: none;
  }
  ...
</style>

<main>
  <h1>Welcome to my online bookstore!</h1>
  <section>
    <h2>Add new book</h2>
    <label for="title">Title</label>
    <input type="text" id="title" bind:value={title} />
    <label for="price">Price</label>
    <input type="number" id="price" bind:value={price} />
    <label for="description">Description</label>
    <textarea rows="3" id="description" bind:value={description} />
    <div>
      <button on:click={handleAddBook}>add book</button>
    </div>
  </section>
  ...
</main>
```
### 展示列表数据
**我们可以使用each语法块去展示books列表的数据**：
```html
// src/App.svelte
<script>
  ....

  let books = [];

  function handleAddBook() {
    books = books.concat({ title, price, description });
    title = "";
    price = 0;
    description = "";
  }
</script>

<main>
  ...
  <section>
    {#each books as book}
      <BookCard
        title={book.title}
        price={book.price}
        description={book.description} />
    {/each}
  </section>
</main>
```
**你也可以直接在each块定义的时候解构出被递归对象里面的内容**，上面的代码变为：
```html
// src/App.svelte
  ...
  <section>
    {#each books as { title, price, description }}
      <BookCard {title} {price} {description} />
    {/each}
  </section>
  ...
```
代码更改完后，你的页面就可以录入新书并展示书的列表了：![](/images/svelte3-intro/book-list.gif)
## 购物车功能
首先我们要为BookCard这个组件的按钮添加一个点击事件：用户点击书本卡片按钮的时候这本书会被加到购物车中。要实现这个效果我们可以为BookCard按钮定义一个**handleAddBook**的参数，这个参数由外面组件来提供，**handleAddBook**函数会在用户点击BookCard按钮的时候被调用并将该书添加购物车中。代码如下：
```html
// src/BookCard.svelte
<script>
  ...
  export let handleAddToCart;
</script>

<style>
  ...
</style>

<div class="card">
  <h1>{title}</h1>
  <h2>${price}</h2>
  <p>{description}</p>
  <button on:click={() => handleAddToCart(title)}>添加到购物车</button>
</div>
```
```html
// src/App.svelte
<script>
  ...
  let booksInCart = [];

  function handleAddToCart(title) {
    let bookNeededToBeAdded = books.find(book => book.title == title);
    booksInCart = booksInCart.concat(bookNeededToBeAdded);
  }
</script>

<style>
  ...
</style>

<main>
  ...
  <section>
    <h2>购物车</h2>
    {#each booksInCart as { title, price }}
      <div>名称: {title}, 价钱: {price}</div>
    {/each}
  </section>
  <section>
    <h2>书单</h2>
    {#each books as { title, price, description }}
      <BookCard {title} {price} {description} {handleAddToCart} />
    {/each}
  </section>
</main>
```
这时候我们就可以看到我们的购物车了：![](/images/svelte3-intro/book-cart.gif)
### 条件判断
**Svelte可以用if语法块根据不同条件展示不同的内容**，我们可以在购物车为空的时候给用户展示一个空的状态：
```html
// src/App.svelte
...
<section>
  <h2>购物车</h2>
  {#if booksInCart.length === 0}
    <p>购物车空的哦~</p>
  {:else}
    {#each booksInCart as { title, price }}
      <div>名称: {title}, 价钱: {price}</div>
    {/each}
  {/if}
</section>
...
```
这时候界面变为：![](/images/svelte3-intro/book-cart-if.gif)

## 展示购物车统计信息
我们再为书店添加一个帮用户统计购物车的书本的功能，可以展示现在购物车里面的书本总数和总金额，代码如下:
```html
// src/App.svelte
<script>
  ...
  let booksInCart = [];

  let booksNumInCart = booksInCart.length;
  let totalCheckoutPrice = booksInCart.reduce(
    (sum, book) => sum + book.price,
    0
  );
  ...
</script>

...
<section>
  <h2>购物车</h2>
  <div>书本总数：{booksNumInCart}</div>
  <div>订单金额：{totalCheckoutPrice}</div>
  ...
</section>
...
```
这时候我们操作界面却发现购物车的数据变化时统计数据竟然没有变化：![](/images/svelte3-intro/book-cart-total.gif)
数据没有变化的原因是我们每次添加书本到购物车的时候没有手动地去改变`booksNumInCart`和`totalCheckoutPrice`的值。不过如果需要在购物车数据发生变化的时候手动维护统计数据的话，代码会变得很丑陋。
### 反应式定义
对于这种情况，Svelte提供了**反应式定义（Reactive assignment）**的方法来表示这种联动的数据，**具体做法就是用`$`符号定义变量而不是let**，以下是代码：
```html
<script>
  ...
  let booksInCart = [];

  $: booksNumInCart = booksInCart.length;
  $: totalCheckoutPrice = booksInCart.reduce(
    (sum, book) => sum + book.price,
    0
  );
  ...
</script>
```
这样当`booksInCart`这个数据发生改变的时候，`booksNumInCart`和`totalCheckoutPrice`这个两个变量就会自动被重新计算。
这时候我们再对界面进行操作的话，会发现统计数据会随着购物车的数据变化而自动发生改变：![](/images/svelte3-intro/book-cart-reactive.gif)

## 总结
我们的简易书店系统（bookshop）大概就实现了这些功能，现在来总结一下在开发项目的时候覆盖到的Svelte框架基础知识：
* 组件定义 - component definition
* 变量使用 - using variables 
* props定义和参数传递 - props definition and passing
* 事件监听 - event listening
* 数据绑定 - data binding
* 条件判断 - if condition
* 列表数据展示 - each block

其实Svelte框架还有很多我没有提到的有用的功能特性，例如：
* 事件传递 - event forwarding
* 生命周期函数 - life-cycle functions
* 全局状态管理 - stores
* 上下文管理 - context
* CSS 动画 - css animation
*  ...

由于文章篇幅的限制我在这里没有覆盖Svelte所有的属性，大家兴趣可以看一下svelte的[官方教程](https://svelte.dev/tutorial/basics)。

# 我个人对Svelte框架的一些看法
个人觉得由于Virtual DOM的各种问题，Compiler as framework这个思路应该是前端框架发展的一个趋势。Svelte目前实现的功能虽然已经非常不错了，可是就目前来说我觉得它还有以下问题：
* Scalability - 可扩展性。React和Vue等框架自带的runtime虽然会增加首屏加载的bundle.js，可是当项目变得越来越大的时候，框架的runtime在bundle.js里面占据的比例也会越来越小，相反由于Svelte生成的代码的封装性没有React和Vue的好，它在大型项目中会不会堆积很多重复的代码呢？这个时候我们就得考虑一下是不是存在一个Svelte生成的代码大于React和Vue生成的代码的阈值了。这个问题现在还没有具体的答案，只能等后人实践的时候给出答案了，大家有兴趣可以看一下作者在[github上面的讨论](https://github.com/sveltejs/svelte/issues/2546)。
* Ecosystem - 生态。作为一个最近才火起来的框架，Svelte的生态还远远不及已经普及那么多年的React和Vue，这也是我觉得就目前来说Svelte还撼动不了React和Vue的地位的原因。不过Svelte会不会因为它的先进性而迎来生态大爆发呢？我们可以拭目以待。

不过有一点可以肯定的是，Svelte由于在一些不复杂的项目中生成的代码远远比React，Vue和Angular小的优势会在一些性能不那么好的嵌入式操作系统中大放异彩。

# 学习Svelte有用的链接
* [作者的Rethinking reactivity演讲](https://www.youtube.com/watch?v=AdNJ3fydeao)
* [Svelte官网](https://svelte.dev/)
* [Svelte github仓库](https://github.com/sveltejs/svelte)
