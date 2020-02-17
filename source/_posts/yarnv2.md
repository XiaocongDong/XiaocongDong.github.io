---
title: Yarn v2介绍
tags:
  - yarn
thumbnail: /gallery/thumbnails/yarn2.png
categories:
  - 前端
date: 2020-02-17 08:55:57
---

[Yarn](http://yarnpkg.com/)作为JavaScript生态的一个强大的依赖管理工具在今年[1月24日](https://dev.to/arcanis/introducing-yarn-2-4eh1)的时候正式发布了v2版本。在本篇文章中，我将会为大家介绍以下内容：
* [为什么要开发v2版本](#为什么要开发v2版本)
* [v2都有什么新的特性](#v2都有什么新的特性)
* [Yarn的未来计划](#Yarn的未来计划)

备注：如果你想知道如何直接使用v2版本可以查看[Getting Started](https://next.yarnpkg.com/getting-started/install)，如果你想从v1版本迁移到v2版本可以查看[Migrations](https://next.yarnpkg.com/advanced/migration)。
<!-- more-->
## 为什么要开发v2版本
### 原有代码架构满足不了新的需求
Yarn创建于2016年初，它在刚开始的时候借鉴了很多npm的东西，其中的架构设计本身就不是很符合Yarn开发者的愿景。在那之后，由于不断有新的需求产生，Yarn在接下来的几年中还添加了很多新的功能，其中包括Workspaces(2017), Plug'n'Play(2018)和Zip loading(2019)。这些新的概念在Yarn刚刚被创建的时候压根就不存在，所以Yarn的架构设计也就没有考虑到日后这些新功能的添加，因此随着时间的推移，Yarn的代码变得越来越难维护和扩展。由于这个技术原因，Yarn需要一个更加现代化的代码架构来满足新需求的开发。
### 鼓励开发者贡献代码
Yarn作为一个社区项目，秉承的一个理念就是: `we don't want to work for you, we want to work with you`。由此可以看出Yarn的开发者其实是希望更加多的开发者参与到这个项目的开发，而不是只有他们来维护。为了降低开发者为Yarn项目贡献代码的门槛，Yarn v2版本做了以下的一些改变：
* 从Flow迁移到了现在更加流行的TypeScript作为开发语言，让开发者可以用更加熟悉的技术栈来贡献代码。
* 采用基于插件（Plugin）的模块化（Modular）代码架构，让开发者不用搞懂Yarn的核心代码就可以通过实现插件的方式来为Yarn添加新的功能。而且Yarn的核心功能也是由不同的内置插件实现的，这点和Webpack的设计思想如出一辙，因此开发者可以很容易就搞懂每个功能是如何实现的。

## v2都有什么新的特性
说完了为什么要开发v2版本之后，我们再来看一下它都有什么新的特性。
### 可读性更高的输出日志
虽然相对于其他替代方案（例如npm）Yarn的输出日志的可读性算是比较高的了，可是它还是存在各种各样的问题，例如当输出信息特别多的时候，开发者很难在一大堆输出中找到有用的内容，而且输出日志的颜色并没有起到帮助用户快速识别出重要信息的作用，甚至还会对日志的阅读造成一定的干扰。基于这些原因，v2版本对输出日志进行了一些改进，我们先来看一下它大概变成了什么样子了：
![](/images/yarn2/log.png)
由上面的输出内容我们可以看到现在每一行日志的开头添加了一个错误号码（error code），不同的错误号码代表的意思可以在这个[文档](https://next.yarnpkg.com/advanced/error-codes)中找到。这些错误号码可以让开发者快速定位错误并且可以更加方便地搜索到修复错误的办法。除了新增错误号码，输出日志在颜色上也有很大的改进，例如上面输出中会用鲜艳的颜色来突出依赖的名称以及它的版本号，这样可以更加方便开发者获取有用的信息。

### Yarn dlx
[yarn dlx](https://next.yarnpkg.com/cli/dlx)的功能和[npx](https://github.com/npm/npx#readme)类似。dlx是`download and execute`的简称，这个命令会在本地创建一个临时的环境来下载指定的依赖，依赖下载完成后，它会在当前的工作目录（cwd）中执行这个依赖包含的可执行二进制文件，这个临时的空间会在命令完成后被删除，所以这些操作都是一次性的。

`yarn dlx`这个命令不会改变当前项目的package.json的内容，而且它只可以执行远端的脚本而不能执行本地的脚本（本地脚本可以用yarn run来执行），所以它相对于npx有更高的安全性。 

由于v2版本默认开启了[Plug'n'Play](https://next.yarnpkg.com/features/pnp)的功能，当你使用了一次`yarn dlx`命令执行某个远端脚本后，这个脚本的依赖会被缓存到本地环境中，这样当它被再次执行的时候它就不需要下载依赖了，所以它的速度会变得很快。

### 更好的workspaces支持
v2版本一个最大的改变就是将[workspaces](https://next.yarnpkg.com/features/workspaces)变成了一等公民（first-class citizen），这样就可以更好地支持[monorepo](https://next.yarnpkg.com/advanced/lexicon#monorepository)的开发了。v2版本对workspaces的支持体现在以下这些方面：

#### yarn add 添加交互模式（interactive mode）
假如你要在项目的某个workspace中引入某个依赖，你可能要考虑其他workspaces是否也用到了这个依赖，而且要避免引入不兼容的版本。v2版本中，你可以使用`-i`参数来让`yarn add`命令进入到交互模式，这样yarn就会帮你检查这个依赖有没有在其他workspaces中被使用，并且会让你选择是要复用其他workspaces中的依赖版本还是使用另外的版本。
![](/images/yarn2/add-interactive.png)

#### 一次更新所有workspaces某个依赖的版本
v2版本新加了一个`yarn up`命令。这个命令和`yarn upgrade`命令类似，都是用来更新某个依赖的版本的。和`yarn upgrade`不同的是它可以同时更新所有workspaces的该依赖的版本，而不用切换到各个workspace中运行更新命令。这个命令同样具有交互模式`-i`来让你确认在不同workspace进行的具体操作。

#### 自动发布关联的workspaces
有参与过monorepo开发的同学们一定会遇到过这样的问题：当某个包（workspace）发布了新的版本之后，发布其它相关联的包十分麻烦。如果你在项目中使用的是[Lerna](https://github.com/lerna/lerna)，当你发布一个包的新版本的时候，你要么所有的包都要发布新的版本，要么你得自己手动来管理其他包的版本发布。虽然自己来管理其它包的发布也是可以的，可是人为的东西肯定会存在疏忽，而且多人协作的项目会让人很头疼。为了解决这个问题，Yarn v2版本采取了和Lerna以及其他类似工具完全不同的解决方案，它把这部分逻辑放在了一个单独的叫做[version的插件](https://next.yarnpkg.com/features/release-workflow)中。version插件允许你将一部分包版本管理工作分发给你的代码贡献者，而且它还提供了一个友好的交互界面来让你十分容易地管理关联包的发布：
![](/images/yarn2/version.png)

#### 在多个workspaces中运行相同的命令
在同一个项目的不同workspaces中运行同一个命令是很常见的情形，Yarn v2版本提供了一个新的`yarn workspaces foreach`命令来让你在多个workspaces中运行同一个命令，这个命令是由它内置的[workspace-tools插件](https://github.com/yarnpkg/berry/tree/master/packages/plugin-workspace-tools)支持的，例如以下命令会在所有的workspaces中运行build命令：
```shell
yarn workspaces foreach run build
```
#### 给所有workspaces添加约束（contraints）
有时候你希望同一个项目的所有workspaces都要遵循某些规则，例如`所有的workspaces都不能使用underscore作为依赖`又或者`所有workspaces依赖的某个包版本要互相兼容`等。v2版本有一个新的概念叫做[约束](https://next.yarnpkg.com/features/constraints)（Constraints），这里的约束是对项目内各个workspaces的`package.json`进行的约束，就像ESLint对JS文件进行约束一样，它会在workspaces的package.json破坏了某些规则之后给你错误提示并且可以帮你修复其中一部分错误。

Yarn的约束规则是用[Prolog](!https://baike.baidu.com/item/%E9%80%BB%E8%BE%91%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80/20864034?fromtitle=Prolog&fromid=8379187&fr=aladdin)语法来编写的。想要为你的workspaces添加约束，你首先得引入`constraints`插件：
```shell
yarn plugin import constraints
```
然后在项目的根目录定义一个存放约束规则的`constraints.pro`文件，最后在这个文件中定义你想要的约束条件，例如以下的约束条件会禁止所有的workspaces将underscore作为依赖：
```prolog
gen_enforced_dependency(WorkspaceCwd, 'underscore', null, DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, 'underscore', _, DependencyType).
```
约束规则定义完后可以使用`yarn constraints check`命令来校验项目的workspaces是否满足定义的约束规则，当有错误发生时，可以使用`yarn constraints fix`命令自动修复那些可以被自动修复的错误。
#### 像搜索数据库一样查询workspaces的依赖信息
`yarn constraints query`命令可以查询项目中的workspaces用到的依赖信息，例如以下命令会输出各个workspace使用到的lodash版本信息：
```shell
$my-project: yarn constraints query "workspace_has_dependency(Cwd, 'lodash', Range, _)."
➤ YN0000: ┌ Cwd   = 'packages/backend'
➤ YN0000: └ Range = '4.17.0'
➤ YN0000: ┌ Cwd   = 'packages/frontend'
➤ YN0000: └ Range = '4.17.0'
➤ YN0000: Done with warnings in 0.03s
```
个人感觉上面的依赖查询很像在MySQL数据库里面用SELECT语法查询数据库，是一个十分强大而且有用的功能。
### 依赖零安装 （Zero-Installs）
[依赖零安装](https://next.yarnpkg.com/features/zero-installs)更像是一个理念而不是一个功能，它的思路是希望我们每次在使用git更新完代码后，不需要再次使用`yarn install`命令来更新本地仓库的依赖来提高开发效率和避免一些问题的发生。它的具体做法是让开发者将本地的依赖包也提交到远端的git仓库中，看到这里你可能回想：“不就是将node_modules也提交吗？这个做法很蠢吧！”。确实如果直接将node_modules提交到远端仓库的话，每次提交都是一个噩梦，因为node_modules的文件很多（几万个文件很常见），首先你上传和下载代码的速度会变得很慢，其次很影响别人对你的代码进行review。为了解决这个问题，v2版本默认开启了Plug'n'Play + zip loading的功能，这个功能开启后你的项目将不再存在node_modules文件夹，所有的依赖都会被压缩成一个文件放在特定的地方，由于压缩后的包体积很小，而且包的数量不会很多，所以就不会存在以上说到的node_modules存在的问题。

可是为什么要做到依赖零安装呢？这是因为它有以下的好处：
* 更好的开发体验
  * 你每次使用`git pull`, `git checkout`, `git rebase`这些命令更新完你的代码后无需使用`yarn install`进行依赖的安装，这样可以避免一些问题的出现，例如别人更新了某个依赖的版本后，如果你没有进行对应的更新的话，你的代码会挂。
  * 代码review的时候可以更清楚哪些依赖发生了改变。
* 更快，更简单，更稳定的CI部署
  * 由于每次部署代码的时候，`yarn install`占用的时间都是一个大头，去掉这个步骤后部署速度将会大大提升。
  * 不会存在本地运行没问题，发布线上环境的时候挂掉了的问题。
  * 不用你在CI文件里面进行一些安装依赖的配置。

想要看一下pnp + zip loading实际效果的同学可以看一下yarn v2版本的[代码
](https://github.com/yarnpkg/berry)，你可以看到它就是在自己仓库的`.yarn/cache`目录下存放了它所有的依赖：
![](/images/yarn2/berry-pnp.png)

### 添加新的协议
Yarn v2版本添加了两个新的协议：`patch`和`portal`协议。不知道什么是协议的同学可以看一下官网[介绍](https://next.yarnpkg.com/features/protocols)，它大概是用来告诉yarn，定义在package.json文件里面的依赖是如何解析的。
#### Patch协议
我们日常开发中有时候会需要更改某个依赖的原代码来做一些试验性的东西，这个时候就可以使用这个patch协议了。我们先来看一下怎么使用：
```json
{
  "dependencies": {
    "left-pad": "patch:left-pad@1.3.0#./my-patch.patch"
  }
}
```
上面的package.json中定义了`left-pad`这个依赖是如何解析的，我们可以看到left-pad的解析其实就用到了patch协议，它表示项目中用到的left-pad代码是1.3.0这个版本的代码叠加上`./my-patch.patch`这个补丁，所谓的补丁就是我们自己对left-pad这个库的代码的更改，和git的diff文件类似。
#### Portal协议
Portal协议和原有的link协议类似。它的作用是告诉yarn项目中的某个依赖指向本地文件系统的某个软链接（symlink），其实和yarn link的作用是差不多的。和link协议不同的是，portal指向的是一些包（package），也就是有package.json文件的那种文件夹，而且yarn会去解析这个包中的transitive dependencies。关于portal协议和link协议的更具体的区别可以看[官方文档](https://next.yarnpkg.com/features/protocols#whats-the-difference-between-link-and-portal)。

### 范式化shell脚本（Normalized shell）
v2版本对Windows开发环境有了更好的兼容。你之前可能会遇到这样一个问题：你在package.json定义的script命令在OSX系统中可以运行，可是在windows电脑上却会报错。出现这个问题的原因是你在package.json中定义的script最终是通过Yarn创建一个子进程来执行的，而子进程的shell环境在Windows和OSX环境是不一样的（例如文件路径的写法就不一样）。为了解决这个问题，Yarn v2自带一个简单shell解析器（interpreter），这个解析器是用来兼容Windows和OSX shell环境的区别的，它覆盖了90%常用的shell脚本写法，所以正常来说你定义的shell脚本在Windows环境和OSX环境在这个解析器的兼容下都可以正常运行：
```json
{
  "scripts": {
    "redirect": "node ./something.js > hello.md",
    "no-cross-env": "NODE_ENV=prod webpack"
  }
}
```

### 模块化代码架构
在前面已经提到Yarn v2版本已经转变为一个模块化的架构，并且它支持用户自定义Plugin去增强它的功能。用户自定义的插件可以获取到Yarn解析出的dependency tree信息以及一些其他的上下文信息，因此很容易就可以实现一些诸如[Lerna](https://lerna.js.org/)，[Femoto](https://fable.io/blog/Introducing-Femto.html)和[Patch-Package](https://github.com/ds300/patch-package)的库。

想要感受下Yarn的插件是怎么实现的同学可以看一下官方实现的[typescript插件](https://github.com/yarnpkg/berry/tree/master/packages/plugin-typescript)。这个typescript插件对于用Typescript开发的同学来说十分有用，它可以在你使用`yarn add`命令添加依赖的时候同时也添加这个依赖对应的`@types/`包，这样你就可以避免很多手动的工作了。更多和插件的相关的内容可以查看这个[教程](https://next.yarnpkg.com/advanced/plugin-tutorial)。

### 其他更新
除了上面的提到的新的属性外，v2版本还有以下这些更新：
* Peer dependencies也可以在yarn link里面使用了
* Lockfile的格式变为了标准的YAML格式
* 包只能依赖那些在package.json声明的依赖，不允许require那些没有声明的依赖
* 范式化了配置文件
* ...

想要查看v2版本所有更新内容的朋友可以看Maël Nison的文章 - [Introducing Yarn 2](https://dev.to/arcanis/introducing-yarn-2-4eh1)或者直接查看它的[change log](https://github.com/yarnpkg/berry/blob/master/CHANGELOG.md)。
### Yarn的未来计划
* v1最后一个版本v1.22已经发布，作者从此不会再在v1的代码上添加任何新的功能了。Yarn所有的新功能都只会在v2版本的代码库上开发。
* v1的代码仓库将会被从`yarnpkg/yarn`迁移到`yarnpkg/legacy`，这个仓库会继续开放一定的时间用来修复一些bug，然后会在一两年后achieve掉。v2版本的代码由于历史遗留问题不会迁移到`yarnpkg/yarn`，而且会在未来很长的一段事件保留在`yarnpkg/berry`。
* v1的官方网站会被搬到legacy.yarnpkg.com，yarnpkg.com官网的内容已经是v2版本next.yarnpkg.com的内容了。
* npm仓库中，`legacy`标签指向的是最新的v1版本代码，`latest`标签会继续指向v1的最新版本的代码几周，然后指向v2的代码。`berry`标签将会一直指向v2版本的最新版本。
* 大概在今年4月的时候，[Node 14版本的Docker镜像可能会默认自带v2版本](https://github.com/nodejs/docker-node/issues/1180)，这样你就可以直接在容器里使用v2的功能了。

### 参考文献
* [Yarn berry官方文档](https://next.yarnpkg.com/)
* [Yarn 2 - Reinventing package management - Maël Nison aka @arcanis at @ReactEurope 2019
](https://www.youtube.com/watch?v=SU0N4y8S1Qc)
* [Introducing Yarn 2!](https://dev.to/arcanis/introducing-yarn-2-4eh1)

## 个人技术动态
欢迎关注公众号**进击的大葱**一起学习成长
![](/images/wechat_qr.jpg)
