---
title: 实现JavaScript语言解释器-二
tags:
  - TypeScript
  - Interpreter
  - JavaScript
  - 编译原理
thumbnail: /gallery/thumbnails/simple-js.jpg
---

## 前言
在上一篇文章中我为大家介绍了Simpe项目的一些`背景知识`以及如何使用`有限状态机`来实现`词法解析`，在本篇文章中我将会为大家介绍`语法分析`的相关内容，并且通过设计一门`内部DSL语言`来实现Simple语言的语法解析。

## 什么是语法解析
词法解析过后，字符串的代码会被解析生成`一系列Token串`，例如下面是代码`let a = 'HelloWorld';`的词法解析输出为：
```json
[
  {
    "type": "LET",
    "value": "let",
    "range": {
      "start": {
        "line": 1,
        "column": 1
      },
      "end": {
        "line": 1,
        "column": 3
      }
    }
  },
  {
    "type": "IDENTIFIER",
    "value": "a",
    "range": {
      "start": {
        "line": 1,
        "column": 5
      },
      "end": {
        "line": 1,
        "column": 5
      }
    }
  },
  {
    "type": "ASSIGN",
    "value": "=",
    "range": {
      "start": {
        "line": 1,
        "column": 7
      },
      "end": {
        "line": 1,
        "column": 7
      }
    }
  },
  {
    "type": "STRING_LITERAL",
    "value": "'HelloWorld'",
    "range": {
      "start": {
        "line": 1,
        "column": 9
      },
      "end": {
        "line": 1,
        "column": 20
      }
    }
  },
  {
    "type": "SEMICOLON",
    "value": ";",
    "range": {
      "start": {
        "line": 1,
        "column": 21
      },
      "end": {
        "line": 1,
        "column": 21
      }
    }
  }
]
```

在`语法解析（Syntax Analysis）`阶段，Simple解释器会根据定义的`语法规则`来分析单词之间的组合关系，从而输出一棵`抽象语法树`（**A**bstract **S**yntax **T**ree），这也就我们常听到的**AST**了。那么为什么说这棵语法树是抽象的呢？这是因为在语法解析阶段一些诸如分号和左右括号等用来组织代码用的token会被去掉，因此生成的语法树没有包含词法解析阶段生成的所有token信息，所以它是`抽象的`。在语法解析阶段，如果Simple解释器发现输入的Token字符串不能通过既定的语法规则来解析，就会抛出一个`语法错误（Syntax Error）`，例如赋值语句没有右表达式的时候就会抛出`Syntax Error`。

从上面的描述可以看出，词法解析阶段的重点是`分离单词`，而语法解析阶段最重要的是根据既定的`语法规则`来`组合`单词。那么对于Simple解释器来说，它的语法规则又是什么呢？

## Simple语言的语法
我们前面说到Simple语言其实是JavaScript的一个`子集`，所以Simple的语法也是JavaScript的一个子集。那么Simple的语法规则都有哪些呢？我们可以先用中文来表达一下JavaScript的语法规则：
* 变量定义：let, const或者var后面接一个identifier，后面是可选的等号初始化表达式：
  ```ts
  let a;
  const b = 10;
  ```
* if条件判断：if关键字后面加上由左右括号包裹起来的条件，条件可以是任意的表达式语句，接着会跟上花括号括起来的语句块。if语句块后面可以选择性地跟上另外一个else语句块或者else if语句块：
  ```ts
  if (isBoss) {
    console.log('niu bi');
  } else {
    console.log('bu niu bi');
  };
  ```
* while循环：while关键字后面加上由左右括号包裹起来的条件，条件可以是任意的表达式语句，接着或加上由花括号包裹起来的循环体：
  ```ts
  while(isAlive) {
    console.log('coding');
  };
  ```
...

细心的你可能发现在上面的例子中我的所有语句都是以分号`;`结尾的，这是因为为了简化语法解析的流程，Simple解释器强制要求每个表达式都要以分号结尾，毕竟我们不是真正想造个语言出来，掌握最核心的原理才是我们想要的结果。

上面我们使用最直白的中文罗列出了Simple语言的语法规则，在实际开发中我们肯定不会使用这种方式来定义语言的语法规则的，在工程里面，我们一般使用巴克斯范式（BNF）或者扩展巴克斯范式（EBNF）来定义编程语言的语法规则。

## BNF
我们先来看一个变量定义语法的巴科斯范式例子：
![](/images/simple/bnf.png)

在上面的巴科斯范式中，每条规则都是由左右两部分组成的。在规则的左边是一个`非终结符`，而右边是`终结符`和`非终结符`的组合。`非终结符`表示这个符号还可以继续细分，例如`varModifier`这个符号可以被细分为`let`，`const`和`var`三种情况，而`非终结符`表示这个符号不能继续细分了，它一般是一个字符串，例如`if`，`while`，`(`和`)`等。

在BNF的规则中，除了终结符和非终结符，还有下面这些用来语法规则的符号：
| 符号      | 作用 |
| ----------- | ----------- |
| [pattern]   | option: 模式pattern出现0次或者一次，例如变量初始化的时候后面的等号会出现零次或者1次        |
| pattern1 | pattern2   | or: pattern1或者pattern2被匹配，例如变量定义的时候可以是`let`，`const`或者`var`        |
| { pattern }      | repeat: 模式pattern至少重复零次，例如if语句后面可以跟上0个或者多个else if       |

注意上面列出来的符号只是在Simple解释器里面使用到的符号，假如你想知道所有的符号可以查看维基百科的相关定义。

## Simple怎么表达语法规则
上面说的BNF规则不能直接应用在Simple解释器的代码里面，社区里面有很多优秀的功力帮我们根据定义的BNF规则生成对应编程语言的代码，例如[Yacc](http://dinosaur.compilertools.net/yacc/index.html)和[Antlr](https://www.antlr.org/)。我们当然可以直接使用这些现有的优秀的库来实现语法解析，可是为了深入地学习语法解析，我们可以自己开发一门内部的DSL语言来表达语法规则，从而根据这些规则将词法解析生成的Token串生成的对应的抽象语法树。那么什么是DSL，以及我们为什么需要使用DSL呢？

### DSL的定义
身为程序员，我相信大家都或多或少听说过DSL这个概念，那么什么是DSL呢？在了解DSL的定义之前我们先来看一下都有哪些常用的DSL：
* HTML
* CSS
* XML
* JSX
* Markdown
* RegExp
* JQuery
* Gulp
...

从上面的例子可以看出，虽然我们不知道DSL的定义可是DSL却和我们的日常开发是联系得十分紧密的。DSL的全称是Domain-Specific Language，翻译过来就是领域特定语言，和JavaScrpt等GPL（General-Purpose Language）的最大的区别是，DSL是为特定领域涉及的，而GPL可以用来解决不同领域的文艺。例如HTML只能用来定义网页的结构。正是由于DSL只需要关心当前领域的问题，所以它不需要是图灵完备的，而且它更加接近人类的思维方式，一些不是专业程序员的人也可以参与到DSL的编写中，例如设计师也可以编写HTML。