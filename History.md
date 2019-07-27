
v0.5.1 / 2019-07-27
==================

  * better `FibRpcCallor.httpCall`

v0.5.0 / 2019-07-27
===================

  * Release v0.5.0
  * add exported member `httpCall`.
  * simplify typos.
  * add test case and docs about rpcError
  * support custom errors.
  * refactor typos, add exposed member `RpcError`.
  * add test about handler  from function.
  * robust about test; upgrade dependencies.

v0.4.0 / 2019-01-01
===================

  * Release v0.4.0
  * add examples about open_handler; update doc.
  * add exposed member 'open_connect'.
  * correct comment.
  * update doc.
  * add examples to .npmignore

v0.3.0 / 2018-12-24
===================

  * Release v0.3.0
  * support opts for `handlers`, add alias 'open_handler' for handlers with `opt.allow_anytype_params = true`.
  * add appveyor ci config.
  * add examples.
  * refactor type declartions.
  * remove dist in repo.
  * Merge pull request #4 from richardo2016/master

v0.2.2 / 2018-08-20
===================

  * Release v0.2.2
  * add '0.26.1' to ci config, and fix one type declaration
  * better type declaration.
  * Merge pull request #3 from richardo2016/master

v0.2.1 / 2018-08-10
===================

  * Release v0.2.1
  * upgrade devDependencies's version.
  * Merge pull request #2 from richardo2016/master

v0.2.0 / 2018-06-18
===================

  * 0.2.0
  * add err_code_msg, and update README.md
  * migrate source to typescript, update config of '@fibjs/ci'.
  * deprecated old api.
  * add readme
  * 使用 json 接口简化代码
  * upgrade version.
  * Merge pull request #1 from anlebcoder/master
  * rfc 中 content-type 只允许`;`分割，并且type值只允许在第一个
  * Content-Type 按照标准rfc处理
  * 更新 fib-pool 版本
  * 更新版本号
  * 更新 repository 地址
  * 修复消息延迟发送时的错误
  * 重构 handler，增加测试用例
  * 实现  pipeline rpc 客户端
  * 支持 upgrade websocket 服务器接口
  * beta 版
