````markdown
---
title: "我如何用 Hugo + GitHub Pages 从 0 搭建并部署个人网站"
date: 2026-01-21
tags: ["Hugo", "GitHub Pages", "建站", "踩坑记录"]
categories: ["Tech"]
draft: false
---

最近我从零开始，用 **Hugo + GitHub Pages** 搭建了自己的个人网站。  
整个过程并不算顺利，但非常真实，也让我对静态站点的构建、部署以及线上环境的行为有了完整理解。

这篇文章记录从本地环境准备到最终网站成功上线过程中，我遇到的主要问题，以及对应的解决思路。

---

## 一、环境准备：别被工具链卡住

一开始我尝试在 Windows 下使用 Scoop 安装 Hugo：

```powershell
scoop install hugo-extended
````

但很快遇到了问题：

* `scoop` 无法识别
* `irm get.scoop.sh | iex` 卡住不动

在排查网络、执行策略后，我选择了更直接的方式：

* 从 Hugo 官网下载 `hugo_extended_xxx_windows-amd64.zip`
* 手动解压并加入 `PATH`
* 验证：

```powershell
hugo version
```

事实证明，在 Windows 环境下，**直接使用官方二进制是最稳定、成本最低的方案**。

---

## 二、主题与 Git：网络问题比配置更折磨人

我选择了 PaperMod 作为 Hugo 主题，但在添加 submodule 时多次失败：

```powershell
git submodule add https://github.com/adityatelange/hugo-PaperMod themes/PaperMod
```

错误包括：

* `RPC failed`
* `connection was reset`
* `TLS connect error`

最反直觉的一点是：
**问题并不在 GitHub，而在本地 Git 代理配置**。
在关闭代理之后，submodule 拉取和 `git push` 反而全部恢复正常。

---

## 三、本地能跑，不代表配置是对的

`hugo server` 成功启动，并不意味着项目结构是正确的。

我曾遇到：

* 页面没有样式
* 首页显示 `Page not found`
* Hugo 输出警告，找不到 `home` layout

最终定位到原因：

* 项目目录结构混乱
* 根目录下存在多个 `hugo.toml`

整理后确保：

* 只有一个配置文件
* 主题目录完整
* 所有文件位于 Hugo 约定的位置

本地页面才真正正常渲染。

---

## 四、GitHub Pages 404 的核心原因

网站部署完成后，访问：

```
https://miastian.github.io/
```

却显示：

```
404 File not found
```

关键认知在于：

> **GitHub Pages 不会运行 Hugo，只会托管静态文件**

也就是说，Pages 指向的分支中 **必须直接存在 `index.html`**。

在确认 GitHub Actions 正常执行、并且 `gh-pages` 分支中确实生成了 `index.html` 后，可以确定：

* 构建是成功的
* 部署流程是正确的
* 问题不在 Hugo 本身

---

## 五、用户主页仓库的特殊访问规则

尝试访问：

```
https://miastian.github.io/index.html
```

发现无法访问。

这是因为：

* `username.github.io` 属于 **用户主页仓库**
* 只能通过根路径 `/` 访问
* `/index.html` 本身并不会暴露

这是 GitHub Pages 的正常行为，而不是部署错误。

---

## 六、最隐蔽也最关键的问题：链接生成

最困扰我的问题是：

> 首页正常，但点击 Posts / Tags 后页面无法访问

最终定位到两个关键配置。

### 1️⃣ PaperMod 的环境模式

最初配置为：

```toml
[params]
env = "development"
```

在该模式下，主题会生成偏向本地开发的链接。

线上部署必须改为：

```toml
env = "production"
```

---

### 2️⃣ 菜单 URL 使用了硬编码绝对路径

原本的写法是：

```toml
url = "/posts/"
```

这种写法在 GitHub Pages 场景下，可能绕过 `baseURL`，导致生成错误链接。

正确做法是交给 Hugo 处理路径：

```toml
url = "posts/"
```

同理，`about`、`tags` 等页面也应使用相同规则。

---

## 七、最终结果

完成上述修改后：

* 首页可以正常访问
* `/posts/`、`/about/`、`/tags/` 等路径全部生效
* 本地 `hugo server` 与线上行为完全一致

至此，一个完整、稳定的 **Hugo + GitHub Pages** 个人网站正式上线。

---

## 结语

这次搭建过程让我意识到：

> 搭建个人网站并不是“套模板”，而是一整套真实的工程实践。

从环境、构建、部署到线上行为，每一步都需要理解其背后的逻辑。
希望这篇记录，能为后来者提供一些可复用的经验。

```
```
