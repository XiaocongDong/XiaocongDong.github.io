---
title: 实现JavaScript语言解释器-（二）
tags:
  - TypeScript
  - Interpreter
  - JavaScript
  - 编译原理
thumbnail: /gallery/thumbnails/simple-js.jpg
date: 2021-04-18 13:43:15
---


## 前言
在上一篇文章中我为大家介绍了Simpe项目的一些`背景知识`以及如何使用`有限状态机`来实现`词法解析`，在本篇文章中我将会为大家介绍`语法分析`的相关内容，并且通过设计一门`内部DSL语言`来实现Simple语言的语法解析。
<!-- more-->

## 什么是语法解析
词法解析过后，字符串的代码会被解析生成`一系列Token串`，例如下面是代码`let a = 'HelloWorld';`的词法解析输出：
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
我们前面说到Simple语言其实是JavaScript的一个`子集`，所以Simple的语法也是JavaScript语法的一个子集。那么Simple的语法规则都有哪些呢？在进入到使用专业的术语表达Simple语法规则之前，我们可以先用中文来表达一下Simple的语法规则：
* 变量定义：let, const或者var后面接一个identifier，然后是可选的等号初始化表达式：
  ```ts
  let a;
  // 或者
  let a = 10;
  ```
* if条件判断：if关键字后面加上由左右括号包裹起来的条件，条件可以是任意的表达式语句，接着会跟上花括号括起来的语句块。if语句块后面可以选择性地跟上另外一个else语句块或者else if语句块：
  ```ts
  if (isBoss) {
    console.log('niu bi');
  } else {
    console.log('bu niu bi');
  };
  ```
* while循环：while关键字后面加上由左右括号包裹起来的条件，条件可以是任意的表达式语句，接着是由花括号包裹起来的循环体：
  ```ts
  while(isAlive) {
    console.log('coding');
  };
  ```
...

细心的你可能发现在上面的例子中所有语句都是以分号`;`结尾的，这是因为为了简化语法解析的流程，**Simple解释器强制要求每个表达式都要以分号结尾**，这样我们才可以将重点放在**掌握语言的实现原理**而不是拘泥于JavaScript灵活的语法规则上。

上面我们使用了最直白的中文表达了Simple语言的一小部分语法规则，在实际工程里面我们肯定不能这么干，我们一般会使用**巴克斯范式**（BNF）或者**扩展巴克斯范式**（EBNF）来定义编程语言的**语法规则**。

## BNF
我们先来看一个变量定义的巴科斯范式例子：
![](/images/simple/bnf.png)

在上面的巴科斯范式中，每条规则都是由左右两部分组成的。在规则的左边是一个`非终结符`，而右边是`终结符`和`非终结符`的组合。`非终结符`表示这个符号还可以继续细分，例如`varModifier`这个非终结符可以被解析为`let`，`const`或`var`这三个字符的其中一个，而`终结符`表示这个符号不能继续细分了，它一般是一个字符串，例如`if`，`while`，`(`或者`)`等。无论是终结符还是非终结符我们都可以统一将其叫做**模式（pattern）**。

在BNF的规则中，除了**模式**符号，还有下面这些表示这些**模式出现次数**的符号，下面是一些我们在Simple语言实现中用到的符号：

| 符号      | 作用 |
| ----------- | ----------- |
| [pattern]   | 是option的意思，它表示括号里的模式出现0次或者一次，例如变量初始化的时候后面的等号会出现零次或者1次，因为初始值是可选的        |
| pattern1 \| pattern2   | 是or的意思，它表示模式1或者模式2被匹配，例如变量定义的时候可以使用`let`，`const`或者`var`        |
| { pattern }      | 是repeat的意思， 表示模式至少重复零次，例如if语句后面可以跟上0个或者多个else if       |

要实现Simple语言上面这些规则就够用了，如果你想了解更多关于BNF或者EBNF的内容，可以自行查阅相关的资料。

## 如何实现语法解析
在我们编写完属于我们语言的BNF规则之后，可以使用[Yacc](http://dinosaur.compilertools.net/yacc/index.html)或者[Antlr](https://www.antlr.org/)等开源工具来将我们的BNF定义转化成词法解析和语法解析的客户端代码。在实现Simple语言的过程中，为了更好地学习语法解析的原理，我没有直接使用这些工具，而是通过编写一门灵活的用来定义语法规则的**领域专用语言（DSL）**来定义Simple语言的语法规则。可能很多同学不知道什么是DSL，不要着急，这就为大家解释什么是DSL。

### DSL的定义
身为程序员，我相信大家都或多或少听说过DSL这个概念，即使你没听过，你也肯定用过。在了解DSL定义之前我们先来看一下都有哪些常用的DSL：
* HTML
* CSS
* XML
* JSX
* Markdown
* RegExp
* JQuery
* Gulp
...

我相信作为一个程序员特别是前端程序员，大家一定不会对上面的DSL感到陌生。DSL的全称是**Domain-Specific Language**，翻译过来就是**领域特定语言**，和JavaScrpt等**通用编程语言**（GPL - General-Purpose Language）最大的区别就是：DSL是为特定领域编写的，而GPL可以用来解决不同领域的问题。举个例子，HTML是一门DSL，因为它只能用来定义网页的结构。而JavaScript是一门GPL，因此它可以用来解决很多通用的问题，例如编写各式各样的客户端程序和服务端程序。正是由于DSL只需要关心当前领域的问题，所以它不需要**图灵完备**，这也意味着它可以更加接近人类的思维方式，让一些不是专门编写程序的人也可以参与到DSL的编写中（设计师也可以编写HTML代码）。

### DSL的分类
DSL被分成了两大类，一类是内部DSL，一类是外部DSL。
#### 内部DSL
内部DSL是建立在某个**宿主语言**（通常是一门GPL，例如JavaScript）之上的特殊DSL，它具有下面这些特点：
* 和宿主语言**共享编译与调试**等基础设施，对那些会使用宿主语言的开发者来说，使用该宿主语言编写的DSL的门槛会很低，而且内部DSL可以很容易就集成到宿主语言的应用里面去，它的使用方法就像引用一个外部依赖一样简单，宿主欢迎只需要安装就可以了。
* 它可以视为使用宿主语言对特定任务（特定领域）的一个封装，使用者可以很容易使用这层封装编写出可读性很高的代码。例如JQuery就是一门内部DSL，它里面封装了很多对页面DOM操作的函数，由于它的功能很有局限性，所以它可以封装出更加符合人们直觉的API，而且它编写的代码的可读性会比直接使用浏览器原生的native browser APIS要高很多。
 
下面是一个分别使用浏览器原生API和使用JQuery API来实现同样任务的例子：
![](/images/simple/native.png)
![](/images/simple/jquery.png "JQuery")

#### 外部DSL
和内部DSL不同，外部DSL没有依赖的宿主环境，它是一门独立的语言，例如HTML和CSS等。因为外部DSL是完全独立的语言，所以它具有下面这些特点：
* 不能享用现有语言的编译和调试等工具，如有需要要自己实现，成本很高
* 如果你是语言的实现者，需要自己设计和实现一门全新的语言，对自己的要求很高。如果你是语言的学习者就需要学习一门新的语言，比内部DSL具有更高的学习成本。而且如果语言的设计者自身水平不够，他们弄出来的DSL一旦被用在了项目里面，后面可能会成为阻碍项目发展的一个大坑
* 同样也是由于外部DSL没有宿主语言环境的约束，所以它不会受任何现有语言的束缚，因此它可以针对当前需要解决的领域问题来定义更加灵活的语法规则，和内部DSL相比它有更小的来自于宿主语言的语言噪声

下面是一个外部DSL的例子 - Mustache
![](/images/simple/mustache.png)

### Simple语言的语法解析DSL
前面说到了内部DSL和外部DSL的一些特点和区别，由于我们的语法解析逻辑要和之前介绍的词法解析逻辑串联起来，所以我在这里就选择了宿主环境是TypeScript的内部DSL来实现
#### DSL的设计
如何从头开始设计一门内部DSL呢？我们需要从要解决的**领域特定问题**出发，对于Simple语言它就是：将Simple语言的BNF语法规则使用TypeScipt表达出来。在上面BNF的介绍中，我们知道BNF主要有三种规则：**option**，**repeat**和**or**。每个规则之间可以相互**组合和嵌套**，等等，互相组合和嵌套？你想到了什么JavaScript语法可以表达这种场景？没错就是函数的**链式调用**。

对于程序员来说最清晰的解释应该是直接看代码了，所以我们可以来看一下Simple语言语法解析的代码部分。和词法解析类似，Simple的语法规则放在`lib/config/Parser`这个文件中，下面是这个文件的示例内容：
```ts
// rule函数会生成一个根据定义的语法规则解析Token串从而生成AST节点的Parser实例，这个函数会接收一个用来生成对应AST节点的AST类，所有的AST节点类定义都放在lib/ast/node这个文件夹下
const ifStatement = rule(IfStatement)
ifStatement
  // if语句使用if字符串作为开头
  .separator(TOKEN_TYPE.IF)
  // if字符串后面会有一个左括号
  .separator(TOKEN_TYPE.LEFT_PAREN)
  // 括号里面是一个执行结果为布尔值的binaryExpression
  .ast(binaryExpression)
  // 右括号
  .separator(TOKEN_TYPE.RIGHT_PAREN)
  // if条件成立后的执行块
  .ast(blockStatement)
  // 后面的内容是可选的
  .option(
    rule().or(
      // else if语句
      rule().separator(TOKEN_TYPE.ELSE).ast(ifStatement),
      // else语句
      rule().separator(TOKEN_TYPE.ELSE).ast(blockStatement)
    )
  )
```
上面就是Simple的if表达式定义了，由于使用了DSL进行封装，ifStatement的语法规则非常通俗易懂，而且十分灵活。试想一下假如我们突然要改变ifStatement的语法规则：不允许`if`后面加`else if`。要满足这个改变我们只需要将`rule().separator(TOKEN_TYPE.ELSE).ast(ifStatement)`这个规则去掉就可以了。接着就让我们深入到上面代码的各个函数和变量的定义中去：
##### rule函数
这个函数是一个用来生成对应AST节点Parser的工厂函数，它会接收一个AST节点的`构造函数`作为参数，然后返回一个对应的Parser类实例。
```ts
// lib/ast/parser/rule
const rule = (NodeClass?: new () => Node): Parser => {
  return new Parser(NodeClass)
}
```
##### Parser类
Parser类是整个Simple语法解析的**核心**。它通过**函数链式调用**的方法定义当前AST节点的**语法规则**，在语法解析阶段根据定义的语法规则**消耗词法解析阶段生成的Token串**，如果语法规则匹配它会生成对应AST节点，否则Token串的光标会**重置为规则开始匹配的位置（回溯）**从而让父节点的Parser实例使用下一个语法规则进行匹配，当父节点没有任何一个语法规则满足条件时，会抛出`Syntax Error`。下面是Parser类的各个函数的介绍：

| 方法      | 作用 |
| ----------- | ----------- |
| .separator(TOKEN)   |   定义一个终结符语法规则，该终结符不会作为当前AST节点的子节点，例如if表达式的if字符串    |
| .token(TOKEN)   | 定义一个终结符语法规则，该终结符会被作为当前AST节点的子节点，例如算术表达式中的运算符(+，-，*，/)        |
| .option(parser) | 定义一个可选的非终结符规则，非终结符规则都是一个子Parser实例，例如上面if表达式定义中的`else if`子表达式 |
| .repeat(parser) | 定义一个出现0次或者多次的非终结符规则，例如数组里面的元素可能是0个或者多个       |
| .or(...parser|TOKEN) | or里面的规则有且出现一个，例如变量定义的时候可能是var，let或者const      |
| .expression(parser, operatorsConfig) | 特殊的用来表示算术运算的规则      |
| .parse(tokenBuffer) | 这个函数会接收词法解析阶段生成的tokenBuffer串作为输入，然后使用当前Parser实例的语法规则来消耗TokenBuffer串的内容，如果有完全匹配就会根据当前Parser节点的AST构造函数生成对应的AST节点，否则会将TokenBuffer重置为当前节点规则开始匹配的起始位置（setCursor）然后返回到父级节点|

##### AST节点类的定义
Simple语言所有的AST节点定义都放在`lib/ast/node`这个文件夹底下。对于每一种类型的AST节点，这个文件夹下都会有其对应的AST节点类。例如赋值表达式节点的定义是**AssignmentExpression**类，if语句的定义是**IfStatement**类等等。这些节点类都有一个统一的基类**Node**，Node定义了所有节点都会有的节点**类型属性**（type），节点生成规则**create函数**，以及当前节点在代码**执行阶段**的计算规则**evaluate函数**。下面是示例代码：
```ts
// lib/ast/node/Node
class Node {
  // 节点类型
  type: NODE_TYPE
  // 节点的起始位置信息，方便产生语法错误时给开发者进行定位
  loc: {
    start: ILocation,
    end: ILocation
  } = {
    start: null,
    end: null
  }

  // 节点的生成规则，当前节点会根据其子节点的内容生成
  create(children: Array<Node>): Node {
    if (children.length === 1) {
      return children[0]
    } else {
      return this
    }
  }

  // 节点的运算规则，节点在运算时会传进当前的环境变量，每个节点都需要实现自己的运算规则，下一篇文章会详细展开
  evaluate(env?: Environment): any {
    throw new Error('Child Class must implement its evaluate method')
  }
}
```
现在我们来看一下IfStatement这个AST节点类的定义
```ts
class IfStatement extends Node {
  // 该节点的类型是if statement
  type: NODE_TYPE = NODE_TYPE.IF_STATEMENT
  // if的判断条件，必须是是一个BinaryExpression节点
  test: BinaryExpression = null
  // if条件成立的条件下的执行语句，是一个BlockStatement节点
  consequent: BlockStatement = null
  // else的执行语句
  alternate: IfStatement|BlockStatement = null

  // Parser会解析出if语句的所有children节点信息来构造当前的IfStatement节点，children节点的内容和定义由lib/config/Parser文件定义
  create(children: Array<Node>): Node {
    this.test = children[0] as BinaryExpression
    this.consequent = children[1] as BlockStatement
    this.alternate = children[2] as IfStatement|BlockStatement
    return this
  }

  evaluate(env: Environment): any {
    // 后面文章会讲
  }
}
```
### AST
介绍完Parser类和AST节点类后你现在就可以看懂`lib/config/Parser`的语法规则定义了，这个文件里面包含了Simple所有语法规则的定义，其中包括根节点的定义：
```ts
// 列举了所有可能的statement
statement
  .or(
    breakStatement,
    returnStatement,
    expressionStatement,
    variableStatement,
    assignmentExpression,
    whileStatement,
    ifStatement,
    forStatement,
    functionDeclaration,
  )
const statementList = rule(StatementList)
  .repeat(
    rule()
      .ast(statement)
      .throw('statement must end with semi colon')
      .separator(TOKEN_TYPE.SEMI_COLON)

// 一个程序其实就是很多statement的组合
const program = statementList
```
最后就是将上一章的词法解析和语法解析串联起来，代码在`lib/parser`这个文件里面：
```ts
// tokenBuffer是词法解析的结果
const parse = (tokenBuffer: TokenBuffer): Node => {
  // parser是lib/config/Parser的根节点（program节点），rootNode对应的就是抽象语法树AST
  const rootNode = parser.parse(tokenBuffer)

  if (!tokenBuffer.isEmpty()) {
    // 如果到最后还有没有被解析完的Token就表明编写的代码有语法错误，需要报错给开发者
    const firstToken = tokenBuffer.peek()
    throw new SyntaxError(`unrecognized token ${firstToken.value}`, firstToken.range.start)
  }

  return rootNode
}
```
我们来看一下rootNode的具体内容，假如开发者写了以下的代码：
```js
let a = true;
if (a) {
    console.log('Simple language is very simple');  
} else {
    console.log('This will never happen!');
};
```
会生成下面的AST：
```json
{
  "loc": {
    "start": {
      "line": 1,
      "column": 1
    },
    "end": {
      "line": 6,
      "column": 1
    }
  },
  "type": "STATEMENT_LIST",
  "statements": [
    {
      "loc": {
        "start": {
          "line": 1,
          "column": 1
        },
        "end": {
          "line": 1,
          "column": 12
        }
      },
      "type": "VARIABLE_STATEMENT",
      "declarations": [
        {
          "loc": {
            "start": {
              "line": 1,
              "column": 5
            },
            "end": {
              "line": 1,
              "column": 12
            }
          },
          "type": "VARIABLE_DECLARATOR",
          "id": "a",
          "init": {
            "loc": {
              "start": {
                "line": 1,
                "column": 9
              },
              "end": {
                "line": 1,
                "column": 12
              }
            },
            "type": "BOOLEAN_LITERAL",
            "value": true
          }
        }
      ],
      "kind": "LET"
    },
    {
      "loc": {
        "start": {
          "line": 2,
          "column": 1
        },
        "end": {
          "line": 6,
          "column": 1
        }
      },
      "type": "IF_STATEMENT",
      "test": {
        "loc": {
          "start": {
            "line": 2,
            "column": 5
          },
          "end": {
            "line": 2,
            "column": 5
          }
        },
        "type": "IDENTIFIER",
        "name": "a"
      },
      "consequent": {
        "loc": {
          "start": {
            "line": 2,
            "column": 8
          },
          "end": {
            "line": 4,
            "column": 1
          }
        },
        "type": "BLOCK_STATEMENT",
        "body": {
          "loc": {
            "start": {
              "line": 3,
              "column": 5
            },
            "end": {
              "line": 3,
              "column": 49
            }
          },
          "type": "STATEMENT_LIST",
          "statements": [
            {
              "loc": {
                "start": {
                  "line": 3,
                  "column": 5
                },
                "end": {
                  "line": 3,
                  "column": 49
                }
              },
              "type": "EXPRESSION_STATEMENT",
              "expression": {
                "loc": {
                  "start": {
                    "line": 3,
                    "column": 5
                  },
                  "end": {
                    "line": 3,
                    "column": 49
                  }
                },
                "type": "CALL_EXPRESSION",
                "callee": {
                  "loc": {
                    "start": {
                      "line": 3,
                      "column": 5
                    },
                    "end": {
                      "line": 3,
                      "column": 15
                    }
                  },
                  "type": "MEMBER_EXPRESSION",
                  "object": {
                    "loc": {
                      "start": {
                        "line": 3,
                        "column": 5
                      },
                      "end": {
                        "line": 3,
                        "column": 11
                      }
                    },
                    "type": "IDENTIFIER",
                    "name": "console"
                  },
                  "property": {
                    "loc": {
                      "start": {
                        "line": 3,
                        "column": 13
                      },
                      "end": {
                        "line": 3,
                        "column": 15
                      }
                    },
                    "type": "IDENTIFIER",
                    "name": "log"
                  }
                },
                "arguments": [
                  {
                    "loc": {
                      "start": {
                        "line": 3,
                        "column": 17
                      },
                      "end": {
                        "line": 3,
                        "column": 48
                      }
                    },
                    "type": "STRING_LITERAL",
                    "value": "Simple language is very simple"
                  }
                ]
              }
            }
          ]
        }
      },
      "alternate": {
        "loc": {
          "start": {
            "line": 4,
            "column": 8
          },
          "end": {
            "line": 6,
            "column": 1
          }
        },
        "type": "BLOCK_STATEMENT",
        "body": {
          "loc": {
            "start": {
              "line": 5,
              "column": 5
            },
            "end": {
              "line": 5,
              "column": 42
            }
          },
          "type": "STATEMENT_LIST",
          "statements": [
            {
              "loc": {
                "start": {
                  "line": 5,
                  "column": 5
                },
                "end": {
                  "line": 5,
                  "column": 42
                }
              },
              "type": "EXPRESSION_STATEMENT",
              "expression": {
                "loc": {
                  "start": {
                    "line": 5,
                    "column": 5
                  },
                  "end": {
                    "line": 5,
                    "column": 42
                  }
                },
                "type": "CALL_EXPRESSION",
                "callee": {
                  "loc": {
                    "start": {
                      "line": 5,
                      "column": 5
                    },
                    "end": {
                      "line": 5,
                      "column": 15
                    }
                  },
                  "type": "MEMBER_EXPRESSION",
                  "object": {
                    "loc": {
                      "start": {
                        "line": 5,
                        "column": 5
                      },
                      "end": {
                        "line": 5,
                        "column": 11
                      }
                    },
                    "type": "IDENTIFIER",
                    "name": "console"
                  },
                  "property": {
                    "loc": {
                      "start": {
                        "line": 5,
                        "column": 13
                      },
                      "end": {
                        "line": 5,
                        "column": 15
                      }
                    },
                    "type": "IDENTIFIER",
                    "name": "log"
                  }
                },
                "arguments": [
                  {
                    "loc": {
                      "start": {
                        "line": 5,
                        "column": 17
                      },
                      "end": {
                        "line": 5,
                        "column": 41
                      }
                    },
                    "type": "STRING_LITERAL",
                    "value": "This will never happen!"
                  }
                ]
              }
            }
          ]
        }
      }
    }
  ]
}
```
## 小结
在本篇文章中我介绍了什么是`语法解析`，以及给大家入门了`领域专用语言`的一些基本知识，最后讲解了Simple语言是如何利用`内部DSL`来实现其语法解析机制的。

在下一篇文章中我将会为大家介绍Simple语言的`运行时`是如何实现的，会包括`闭包`如何实现以及`this绑定`等内容，大家敬请期待！

## 个人技术动态
欢迎关注公众号**进击的大葱**一起学习成长

![](/images/wechat_qr.jpg)
