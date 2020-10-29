---
title: 实现JavaScript的语言解释器（一）
tags:
  - TypeScript
  - Interpreter
  - JavaScript
  - 编译原理
thumbnail: /gallery/thumbnails/simple-js.jpg
date: 2020-10-29 11:06:33
---

## 前言
对于大多数前端开发者来说JavaScript可谓是我们最熟悉的编程语言了，它十分强大可是有些语言特性却十分难以理解，例如**闭包**和**this绑定等**概念往往会让初学者摸不着头脑。网上有很多诸如《你看完这篇还不懂this绑定就来砍我》之类的文章来为大家传道解惑。可是在我看来这些文章大多流于表面，你读了很多可能还是会被面试官问倒。 那么如何才能彻彻底底理解这些语言特性，从而在面试的时候立于不败之地呢？在我看来要想真的理解一样东西，最好的途径就是**实现**这样东西，这也是西方程序员非常喜欢说的**learning by implementing**。例如，你想更好地理解React，那么最好的办法就是你自己动手实现一个React。因此为了更好地理解JavaScript的语言特性，我就自己动手实现了一个叫做Simple的JavaScript语言解释器，这个解释器十分简单，它基于**TypeScript**实现了**JavaScript语法的子集**，主要包括下面这些功能：
<!-- more-->
* 基本数据类型
* 复杂数据类型object, array和function
* 变量定义
* 数学运算
* 逻辑运算
* if条件判断
* while，for循环
* 函数式编程
* 闭包
* this绑定

本系列文章正是笔者在实现完Simple语言解释器后写的整理性文章，它会包括下面这些部分：
* 项目介绍和词法分析（本文）
* 语法分析
* 执行JavaScript代码

虽然Simple的实现和V8引擎（或者其它JavaScript引擎）没什么关系，你也不能通过本系列文章来理解它们的源码，可是看完本系列文章后你将会有下面这些收获：
* 加深对JavaScript语言的理解（this和闭包等）
* 掌握编译原理的基础知识
* 知道什么是DSL以及如何实现内部DSL来提高研发效率（Simple的语法分析是基于内部DSL的）

Simple解释器的源代码已经开源在github上面了，地址是[https://github.com/XiaocongDong/simple](https://github.com/XiaocongDong/simple)，我还开发了一个简易的代码编辑器供大家把玩，地址是[https://superseany.com/opensource/simple/build/](https://superseany.com/opensource/simple/build/)，大家可以在这个编辑器里面编写和运行JavaScript代码，并且可以看到JavaScript代码生成的**单词（Token）**和**语法树（AST）**。

接着就让我们进入本系列文章的第一部分 - 项目介绍和词法分析的内容。

## 项目介绍
### 编译器 vs 解释器
在开始了解Simple的实现原理之前，我们先来搞清楚两个基本的编译原理概念：编译器（Compiler） vs 解释器（Interpreter）。
#### 编译器
编译器可以理解成语言的**转换器**，它会把源文件从一种形式的代码转换成另外一种形式的代码，它只是负责转换代码，**不会真正执行代码的逻辑**。在开发前端项目的过程中，我们用到的代码打包器Webpack其实就是一个JavaScript编译器，它只会打包我们的代码而不会执行它们。
#### 解释器
解释器顾名思义就是会对我们的代码进行**解释执行**，它和编译器不一样，它不会对源代码进行转换（最起码不会输出中间文件），而是边解释边执行源代码的逻辑。
#### Simple解释器
由于Simple不会对编写的JavaScript代码进行中间代码转换，它只会解释并且执行代码的逻辑，所以它是一个不折不扣的**JavaScript语言解释器**。

### Simple的架构设计
我们编写的代码其实就是保存在计算机硬盘上面的字符串文本，而实现语言解释器的本质其实就是`教会计算机如何才能理解并执行这些文本代码`。那么计算机如何才能理解我们写的东西呢？考虑到大多数编程语言都是用英语进行编码的，我们不妨先来看一下人是如何理解一个英语句子的，看能不能受到一些启发。
#### 人理解英语句子的过程
![](/images/simple/english-sentence.png)
**Put a pencil on the table**。我相信大家肯定都知道这句话是什么意思，可是你是否有思考过你是如何**理解这句话**的呢？或者更进一步，你能不能将你理解这句话的过程拆分成一个个单独的步骤？

我相信大多数人在理解上面这句话的过程中都会经历这些阶段：
* **切割**单词，**理解**每个单词的意思：句子是由单词组成的，我们要理解句子的意思首先就要知道每个单词的意思。Put a pencil on the table这个句子每个单词的意思分别是：
  * put: **动词**，放置。
  * a: **不定冠词**，一个。
  * pencil: **名词**，铅笔。
  * on: **介词**，在...上面。
  * the: **定冠词**，这张。
  * table: **名词**，桌子。
* 单词切割完后，我们就会根据**英语语法规则**划分句子的**结构**：在理解完句子每个单词的意思后，我们接着就会根据英语的语法规则来对句子进行结构的划分，例如对于上面这个句子，我们会这样进行划分：
  * 因为句子第一个单词是动词put，而且动词后面跟的是不定冠词修饰的名词，所以这个句子应该是个**动词 + 名词**的祈使句，因此这句话的前半句的意思就是叫某人放（put）一支（a）铅笔（pencil）。
  * 前半句解释完后，我们再看一下这个句子的后半句。后半句的开头是一个介词（on）然后接着一个定冠词修饰的名词（the table），所以它是用来修饰句子前半句的结构为**介词 + 名词**的**状语**，表示铅笔是放在这个桌子上的。
  * 划分和理解完句子的结构后，我们自然也明白了这个句子的意思，那就是：将铅笔放在这张桌子上面。

#### 计算机如何理解代码
知道了我们是如何理解一个英语句子后，我们再来思考一下如何让计算机来理解我们的代码。我们都知道**计算机科学的很多知识都是对现实世界的建模**。举个例子，我们熟知的数据结构Queue对应的就是我们日常生活中经常会排的队，而一些设计模式，例如Visitor，Listener等都是对现实生活情景的建模。在计算机科学里面研究编程语言的学科叫做**编译原理**，那么编译原理的一些基本概念是如何和我们上面说到的人类理解句子的步骤一一对应起来的呢？

上面说到我们理解一个句子的第一步是**切割单词然后理解每个单词的意思**，这一个步骤其实对应的就是编译原理中的**词法分析**（Lexical Analysis）。词法分析顾名思义就是在单词层面对代码进行解释，它主要会将代码字符串划分为一个个独立的单词（token）。

在理解完每个单词的意思后我们会**根据英语语法规则划分句子的结构**，这个步骤对应的编译原理的概念是**语法分析**（Syntax Analysis/Parser）。语法分析的过程会将词法分析生成的单词串根据定义的**语法规则**生成一颗**抽象语法树**（AST）。生成的抽象语法树最后就会被一些**运行时**（runtime）执行。

综上所述，一个语言解释器的软件架构大体是这样的：
![](/images/simple/architecture.png)

上面其实也就是Simple的软件架构，接着让我们来看一下词法分析的具体实现。
## 词法分析
前面已经说过，所谓的**词法分析**就是将文件的代码**以单词（token）为单位切割成一个个独立的单元**。这里要注意的是编译原理的单词和英文里面的单词不是等同的概念，在编译原理里面，除了`let`，`for`和`while`等用字母连接起来的字符串是单词，一些诸如`=`，`==`，`&&`和`+`等非字母连接起来的字符串也是合法的单词。对于Simple解释器来说，下面都是一些合法的单词：
* 关键字：let，const，break，continue，if，else，while，function，true，false，for，undefined，null，new，return
* 标识符：主要是一些开发者定义的变量名字，例如arr，server，result等
* 字面量：字面量包括数字字面量（number）和字符串字面量（string），Simple解释器只支持单引号字符串，例如'this is a string literal'
* 算术和逻辑运算符号：+，-，++，--，*，/，&&，||，>，>=，<，<=，==
* 赋值运算符：=，+=，-=
* 特殊符号：[，]，{，}，.，:，(，)

这里要注意的是词法分析阶段不会保留源代码中所有的字符，一些无用的信息例如空格，换行和代码注释等都会在这个阶段被去掉。下面是一个词法分析的效果图：
![](/images/simple/lexical-analysis.png)

对于词法分析，大概有以下两种实现：
### 正则表达式
这个方法可能是大多数开发者都会想到的做法。由于Simple解释器没有使用这种做法，所以这里只会简单介绍一下流程，总体来说，它包含以下这些步骤：
* 为各个单词类型定义对应的正则表达式，例如数字字面量的正则表达式是`/[0-9][0-9]*/`（不考虑浮点数的情况），简单赋值运算符的正则表达式是`/=/`，等于运算符的正则表达式是`/==/`。
* 将各个单词类型的正则表达式按照**词法优先级顺序**依次和代码字符串进行**match**操作，如果某个单词类型的正则表达式有**命中**，就将对应的子字符串提取出来，然后从刚才命中的字符串**最后的位置**开始继续执行match操作，如此**循环反复**直到所有字符串都match完毕为止。这里有一个十分重要的点是不同的单词类型是有**词法优先级顺序**的，例如等于运算符`==`的优先级要比`=`的优先级要高，因为如果开发者写了两个等号，想表达的肯定是等于判断，而不是两个赋值符号。

### 基于有限状态机
由于**所有的正则表达式都可以转化为与其对应的有限状态机**，所以词法分析同样也可以使用有限状态机来实现。那么什么是有限状态机呢？

有限状态机的英文名称是**Finite State Machine（FSM）**，它有下面这些特点：
* 它的状态是**有限的**
* 它同一个时刻只能有一个状态，也就是**当前状态**
* 在接收到外界的数据后，有限状态机会根据**当前状态**以及**接收到的数据**计算出下一个状态并**转换**到该状态

我们熟悉的红绿灯其实就是一个有限状态机的例子。红绿灯只能有三种颜色，分别是红色，绿色和黄色，所以它的状态集是有限的。由于红绿灯在某一个时刻只能有一种颜色（试想下红绿灯同时是红色和绿色会怎样：）），因此它当前的状态是唯一的。最后红绿灯会根据当前的状态（颜色）和输入（过了多少时间）装换成下一个状态，例如红灯过了60秒就会变黄灯而不能变绿灯。

从上面的定义我们知道一个有限状态机最重要的是下面这三个要素：
* 状态集
* 当前状态
* 不同状态之间如何扭转

知道了什么是有限状态机和它的三要素之后，接着让我们来看一个使用简易有限状态机来做词法分析的例子。我们要设计的有限状态机可以识别下面类型的单词：
* identifier（标识符）
* number（数字字面量，不包含浮点数）
* string（字符串字面量，单引号包起来的）
* 加号（+）
* 加号赋值运算符（+=）

我们先来为这个有限状态机定义一下上面提到的状态机三要素：
* 状态集：状态集应该包含状态机在接收到任何输入后出现的`所有状态`，对于上面的状态机会有下面的状态：
  * initial：初始状态
  * number：当状态机识别到数字字面量时会处于这个状态
  * start string literal：当状态机接收到第一个单引号的时候并且没有接收到第二个单引号前（字符串还没结束）都是处于这个状态
  * string literal：当状态机识别到字符串字面量时会处于这个状态
  * identifier：当状态机识别到标识符会处于这个状态
  * plus：当状态机识别到加号会处于这个状态
  * plus assign：当前状态机识别到加号赋值运算符会处于这个状态
* 当前状态：该有限状态机的当前状态可以是上面定义的任意一个状态
* 不同状态之间如何扭转：当状态机处于某一个状态时，它只可以**扭转到某些特定的状态**。举个例子，如果状态机现在处于`start string literal`状态，它只可以维持当前状态或者转换到`string literal`状态。在当前输入不能让状态机进行状态扭转时，会有两种情况，第一种情况是当前状态是一个**可终止的状态**，也就是说当前状态机已经知道生成一个token需要的所有信息了，这个时候状态机会输出当前状态表示的单词类型，输出上一个单词后，状态机会重置为初始状态接着再重新处理刚才的输入；如果当前状态是个**非终止状态**的话，也就是说当前状态机还没有足够的信息输出一个单词，这个时候状态机会报错。在当前这个例子中，可终止状态有`number`，`string literal`和`identifier`，而非终止状态有`start string literal`。下面是这个状态机的状态扭转图：![](/images/simple/fsm.png)

这里要注意的是状态机除了要存储当前的状态信息外，还要保留现在还没输出为单词的字符，也就是说要有一个`buffer`变量来存储遇到的字符输入。例如遇到`+`后，`buffer`会变成`+`，后面再遇到`=`，`buffer`会变为`+=`，最后`+=`被输出，`buffer`会被重置为空字符串`''`。

状态机三要素定义完成后，我们就可以使用上面的状态机来对`a+='Simple'`这个字符串就行词法分析了：

1. 刚开始的时候状态机会处于initial状态，接着状态机会逐个接收代码的每个字符并完成对应的状态扭转和单词输出
2. 状态机接收到`a`字符，根据上面定义的状态扭转图我们知道该字符可以让状态机扭转为`identifier`这个状态，并且会将该字符保存在`buffer`这个变量里面
3. 状态机接收到`+`字符，由于identifier不能根据`+`字符进行状态扭转了，而它当前又处于一个可终止状态（identifier状态）所以状态机会输出之前记录下来的`a`单词，然后将状态重置为`initial`。状态机重置状态后会重新处理`+`字符，这时候状态机装换为`plus`状态，并且将`+`这个字符记录下来，这时候`buffer`变为`+`
4. 状态机接收到`=`字符，从上面的扭转图可以看出，状态机可以转换到`plus assign`这个状态，所以状态机会进行状态的扭转并记录下`=`这个字符，`buffer`变为`+=`
5. 状态机接收到`'`字符，由于`plus assign`不能根据`'`字符进行状态转换，而`plus assign`又是一个可终止的状态，所以状态机会输出当前`buffer`记录的`+=`作为单词，并且将状态重置为`initial`。状态机重置状态后会重新处理`'`字符，这时候状态机转换为`start string literal`状态
6. 当状态机分别接收到`S`，`i`，`m`，`p`，`l`和`e`时，由于它们都不是单引号，所以状态机会维持在`start string literal`这个状态，并且这些字符会被依次加入到`buffer`中，最后buffer会变为`Simple`
7. 状态机接收到`'`字符，状态机转换到`string literal`状态，这就意味着状态机已经识别到一个合法的字符串单词了
8. 最后状态机判断没有字符可以输入后，它会看一下当前的状态是否是可终止状态，由于`string literal`是可终止状态，所以状态机会输出当前单词。反之，如果状态机发现没有新的字符可以输入而自己又处于一个非终止的状态，它就会抛一个叫做`Unexpected EOF`的错误

以上就是使用有限状态机来实现词法分析器的一个简单例子，Simple解释器的词法分析实现和上面的步骤是一样的。在Simple解释器中，我将状态机的核心逻辑（记录当前状态和进行状态扭转）和状态机的配置（状态集的定义以及不同状态之间如何扭转）的逻辑解耦开来了，这样可以方便后面对Simple语言的词法规则进行修改和扩展，并且它还可以使用另外一个状态机配置来实现另外一门语言的词法分析。

状态机的核心逻辑代码放在了`lib/lexer/Tokenizer.ts`文件里面，而状态机的配置则放在`lib/config/Tokenizer.ts`里面，下面是具体的源代码分析：
#### 状态机配置定义
Simple的状态机配置定义在[lib/config/Tokenizer.ts](https://github.com/XiaocongDong/simple/blob/master/lib/config/Tokenizer.ts)里面，下面是简化版的例子，具体代码可以到github上面看：
```typescript
// lib/config/Tokenizer.ts

// State定义了Simple语言状态机所有可能的状态
enum State {
  INITIAL = 'INITIAL',
  NUMBER_LITERAL = 'NUMBER_LITERAL',
  IDENTIFER = 'IDENTIFER',
  START_STRING_LITERAL = 'START_STRING_LITERAL',
  STRING_LITERAL = 'STRING_LITERAL'
  ...
}

// 状态扭转定义
const config: IConfig = {
  initialState: State.INITIAL, // 定义状态机的初始状态
  states: { // 枚举状态机所有的状态配置
    [State.INITIAL]: {
      isEnd: false, // 表示该状态是否是可终止状态
      transitions: [ // 枚举状态机所有的状态转换
        {
          state: State.NUMBER_LITERAL,
          checker: /[0-9]/
        },
        {
          state: State.START_STRING_LITERAL,
          checker: "'"
        }
    },
    [State.NUMBER_LITERAL]: {
      isEnd: true,
      TokenType: TOKEN_TYPE.NUMBER_LITERAL,
      transitions: [
        {
          state: State.NUMBER_LITERAL,
          checker: /[0-9\.]/
        }
      ]
    },
    [State.START_STRING_LITERAL]: {
      isEnd: false,
      transitions: [
        {
          state: State.START_STRING_LITERAL,
          checker: /[^']/
        },
        {
          state: State.STRING_LITERAL,
          checker: "'"
        }
      ]
    },
    [State.STRING_LITERAL]: {
      isEnd: true,
      TokenType: TOKEN_TYPE.STRING_LITERAL
    },
    ...
  }
}
```
上面的配置文件定义了一个`config`对象，该对象会作为参数传递给`lib/lexer/Tokenizer.ts`里面的有限状态机类`Tokenizer`。这个config对象有两个参数，一个是初始状态值，一个是该状态机的所有状态配置`states`。初始状态值就是状态机刚开始的状态值，同时在状态机识别到一个新的单词后，它也会重置为这个状态。`states`是一个`Object`类型的对象，它的key是某个状态的值，而value则是这个状态对应的配置，一个状态的配置包括下面这些内容:
* isEnd: boolean，代表这个状态是否是可终止状态
* TokenType: 代表这个状态对应的单词类型。如果该状态是个可终止状态，它就可以有对应的单词类型。如果TokenType没有指定，即使有单词匹配成功也不会生成对应的单词。
* transitions: 里面存储了这个状态所有可能的状态转换（transition），每个状态转换会有下面这些属性：
  * state：要转换到的状态
  * checker：状态转换的条件，可以是字符串，正则表达式或者是一个返回布尔值的函数，当输入满足checker的条件时状态机就会发生状态转换

#### 状态机核心逻辑实现
上面看了Simple状态机的配置后，我们再来看一下使用该配置的状态机的核心代码`lib/Lexer/Tokenizer.ts`。为了实现`Tokenizer`的功能，我设计了两个辅助类，一个是用于记录当前位置信息的`LocationKeeper`类，它是用来记录当前处理的字符在源文件的行数和列数的，这个类比较简单，这里不会详细介绍有兴趣的可以看源代码。另外一个类是`TokenBuffer`类，所有被状态机识别出的单词都会被存储到这个类的实例中，因此它需要提供一些方法对单词进行读写（read/write）操作，这个类会在`Tokenizer`类介绍完后介绍。

我们先来看一下`Tokenizer`类处理输入字符的核心逻辑`consume(ch: string)`函数：
```typescript
// lib/lexer/Tokenizer.ts
class Tokenizer {
  ...
  consume(ch: string) {
    // 如果输入字符是空格或者换行符而且当前的状态是初始状态的话，只更新当前位置信息
    if ((ch === SPACE || ch === NEW_LINE) && this.state === this.initialState) {
      this.locationKeeper.consume(ch)
      return
    }

    // 接着会根据当前的状态和输入的字符进行状态扭转

    // 获取当前状态的配置信息，this.state保存的是状态机当前的状态
    const currentStateConfig: IStateConfig = this.statesConfig[this.state]
    if (!currentStateConfig) {
      // 开发者忘记配置这个状态了，我们也要报错，develper-friendly ：）
      throw new Error(`Missing state config for ${this.state}`)
    }

    // 获取当前状态所有转换可能
    const transitions = currentStateConfig.transitions
    if (!transitions) {
      // 如果当前状态不可以转换而且是可终止状态
      if (currentStateConfig.isEnd) {
        // 生成token，存进tokenBuffer里面
        this.addToken(currentStateConfig.TokenType)
        // 重置当前状态
        this.reset()
        // 再次消耗当前输入的字符
        this.consume(ch)
        return
      }

      // 当前状态不能转换而且是非终止状态的话就报错！
      throw new SyntaxError(`Unexpected character ${ch}`, this.locationKeeper.getCurrentLocation())
    }

    // 将输入字符和checker进行比较以确定需要进行的状态转换
    const targetTransition = transitions.find(({ checker }) => {
      if (typeof checker === 'string') {
        return ch === checker
      }

      if (checker instanceof RegExp) {
        return checker.test(ch)
      }

      return checker(ch)
    })
    
    // 不存在可以转换的状态
    if (!targetTransition) {
      // 是可终止状态
      if (currentStateConfig.isEnd) {
        if (currentStateConfig.TokenType) {
          // 添加token到tokenBuffer实例
          this.addToken(currentStateConfig.TokenType)
        }
        // 重置状态
        this.reset()
        // 重新消耗输入字符
        this.consume(ch)
        return
      }

      // 不存在可以转换的状态而现在又是非终止状态，我们只能报错了！
      this.locationKeeper.consume(ch)
      throw new SyntaxError('Invalid or unexpected token', this.locationKeeper.getCurrentLocation())      
    }

    // 下面的逻辑是状态成功扭转后进行的

    // 更新当前记录的位置信息，代码的行数和列数
    this.locationKeeper.consume(ch)

    // 下面代码是为了记录当前单词的开始位置的
    if (this.state === this.initialState && targetTransition.state !== this.initialState) {
      this.locationKeeper.markLocation()
    }

    // 将当前状态转换为目标状态
    this.state = targetTransition.state
    // 将当前的字符加入到buffer里面
    this.buffer += ch
  }
}
```
接着我们来看一下用来存储识别到的单词的类`TokenBuffer`的源代码：
```typescript
// lib/lexer/TokenBuffer.ts
import { IToken } from "./types/token"

class TokenBuffer {
  // 存储当前已经识别出来的单词
  private tokens: Array<IToken> = []
  // 存储当前已经读到的单词的位置
  private cursor: number = 0

  // peek会返回当前的单词，它不会改变光标的位置，只会预读
  peek() {
    return this.tokens[this.cursor]
  }

  // 和peek不一样，它会读出当前的单词，因此会改变光标的位置
  read() {
    const currentToken = this.tokens[this.cursor]
    const nextCursor = this.cursor < this.tokens.length ? ++this.cursor : this.tokens.length
    this.cursor = nextCursor
    return currentToken
  }

  // 取消上次的读取，将单词"放"回去
  unread() {
    const lastCursor = --this.cursor
    this.cursor = lastCursor
    return this.tokens[lastCursor]
  }

  // 写入新的token
  write(token: IToken) {
    this.tokens.push(token)
  }

  // 获取当前光标的位置
  getCursor() {
    return this.cursor
  }

  // 直接设置当期光标的位置，主要是在语法分析阶段进行回退用的
  setCursor(cursor: number) {
    this.cursor = cursor
  }

  // 以JSON格式输出当前的tokens
  toJSON(): Array<IToken> {
    return this.tokens
  }

  // 判断单词是否已经全部处理完毕了
  isEmpty(): boolean {
    return this.cursor === this.tokens.length
  }
}
```
细心的同学会发现我在实现上面的`TokenBuffer`时每次读取单词都只是移动光标，而没有真正将该单词从数组里面取出来，这样做的好处就是方便语法分析阶段在某个语法规则不匹配的时候回退之前读到的单词，从而使用另外一个语法规则来匹配。

#### Token单词串
最后我们再来看一下这个有限状态机识别到的Token串是什么样子的，下面是输入的代码：
```javascript
let a = 'HelloWorld';
```
经过有限状态机的处理，输出的Token串是：
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
从上面的输出可以看出每个单词（token）都会有下面这些属性：
* type: 单词的类型，也就是非终止状态里面定义的TokenType
* value: 这个单词具体的值
* range: 里面存储了这个单词的开始和结束的位置信息，包括行数和列数。这些位置信息会在代码报错的时候帮助开发者定位错误

## 小结
在本篇文章中我为大家介绍了Simple这个项目的`背景和内容`，然后再为大家介绍了一些简单的`编译原理`基础知识，最后再详述了如何使用`有限状态机`来实现`词法分析`并且解读了Simple项目对应的`源代码`。

在下一篇文章中我将会为大家详细介绍`语法分析`的一些基本知识，以及普及一些`领域特定语言（DSL）`的基本概念，最后再详细介绍一下我是如何使用灵活的`DSL`来实现Simple语言的`语法分析`的。

## 个人技术动态
欢迎关注公众号**进击的大葱**一起学习成长

![](/images/wechat_qr.jpg)
