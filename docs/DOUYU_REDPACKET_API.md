# 斗鱼星推荐红包 API 文档

> **发现日期**: 2026-01-05  
> **最近复核**: 2026-09-04
> **用途**: 查询直播间星推荐红包情况，查询领取结果  
> **来源**: 斗鱼前端代码与现网页面实测
> **边界**: 只把现网观察到的字段写成已确认契约；未实测错误码另行标注

---

## 0. 查询候选房间 API（`square/list`）

### 基本信息

- **接口地址**: `https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/redbag/square/list`
- **请求方法**: `GET`
- **用途**: 发现当前有星推荐红包的候选直播间

### 请求示例

```http
GET /japi/livebiznc/web/anchorstardiscover/redbag/square/list?rid=6657 HTTP/1.1
Host: www.douyu.com
```

### 响应字段

`data.redBagList` 中当前确认包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| rbId | number | 本条候选对应的红包 ID |
| rid | number | 直播间房间号 |
| rbType | number | 红包类型（7/8 等），不能据此推导具体奖池数量 |
| roomShowType | number | 房间展示类型 |
| avatar | string | 主播头像 URL |

2026-08-29 现网复核时，`square/list` **不包含** `prizeList`、`num`、`ptype`、`waitSec` 或 `code`。因此它可以用于发现候选房间，但不能单独比较金币或星光棒奖池大小。按奖池排序时仍需对候选 `rid` 查询匿名 `room/list`，该过程不要求先打开直播间。

---

## 1. 查询指定房间红包明细 API（`room/list`）

### 基本信息

- **接口地址**: `https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/redbag/room/list`
- **请求方法**: `GET`
- **Content-Type**: `application/json`

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| rid | string | 是 | 直播间房间号 |

### 请求示例

```http
GET /japi/livebiznc/web/anchorstardiscover/redbag/room/list?rid=12736152 HTTP/1.1
Host: www.douyu.com
Accept: application/json, text/plain, */*
```

该查询接口已验证可匿名调用，不要求登录 Cookie 或 `X-Requested-With`。

### 响应参数

#### 响应结构

```json
{
  "error": 0,
  "msg": "success",
  "data": {
    "cnt": 2,
    "rid": 12736152,
    "anchorName": "主播昵称",
    "anchorAvatar": "主播头像URL",
    "redBagList": [...]
  }
}
```

#### data 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| cnt | number | 当前 `status=0` 的红包数量，不等于 `redBagList.length` |
| rid | number | 房间号 |
| anchorName | string | 主播昵称 |
| anchorAvatar | string | 主播头像URL |
| redBagList | array | 红包列表，可能同时包含当前红包和历史红包 |

#### redBagList 元素结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 红包ID |
| code | string | 红包唯一标识码；当前观察为 32 位十六进制字符串，生成算法未确认 |
| rbType | number | 红包类型（7/8等） |
| status | number | 红包状态（0=等待中, 3=已结束） |
| waitSec | number | 前端从收到本次响应后使用的等待时长，不是绝对剩余秒数 |
| createTime | number | 服务端创建时间戳（Unix时间）；当前前端未用它校准倒计时 |
| prizeList | array | 奖品列表 |

#### prizeList 元素结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 奖品ID（可能为空） |
| img | string | 奖品图标URL |
| name | string/null | 奖品名称 |
| num | number | 奖品数量 |
| ptype | number | 奖品类型（2=星光棒, 9=金币） |

### 响应示例

```json
{
  "error": 0,
  "msg": "success",
  "data": {
    "cnt": 2,
    "rid": 12736152,
    "anchorName": "好姐妹秋月愛莉",
    "anchorAvatar": "https://apic.douyucdn.cn/upload/avatar_v3/202409/xxx_big.jpg",
    "redBagList": [
      {
        "id": 1333679,
        "code": "d69ca47cb3c5a020e914c69eaf91c63d",
        "rbType": 8,
        "status": 0,
        "waitSec": 600,
        "createTime": 1767628108,
        "prizeList": [
          {
            "id": "3567",
            "img": "https://sta-op.douyucdn.cn/dygev/2025/12/12/xxx.png",
            "name": null,
            "num": 500,
            "ptype": 2
          },
          {
            "id": "",
            "img": "",
            "name": null,
            "num": 2000,
            "ptype": 9
          }
        ]
      },
      {
        "id": 1333642,
        "code": "14725d0351f4fcfb1bfe7e321876dbeb",
        "rbType": 7,
        "status": 3,
        "waitSec": 90,
        "createTime": 1767626771,
        "prizeList": [
          {
            "id": "",
            "img": "https://sta-op.douyucdn.cn/dygev/2024/05/13/xxx.png",
            "name": null,
            "num": 200,
            "ptype": 9
          }
        ]
      }
    ]
  }
}
```

### 状态说明（现网已观察）

- **status = 0**: 红包等待中（倒计时状态）
- **status = 3**: 红包已结束（已领完或过期）

前端内部还使用其他数值表示本地 UI 状态，不能据此扩展服务端状态枚举。

### 红包类型说明

- **rbType = 8**: 已在星推荐活动房间现网确认
- **rbType = 7**: 历史响应样本中出现，本轮未重新确认其业务名称

---

## 2. 领取红包 API

### 基本信息

- **接口地址**: `https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/redbag/snatch`
- **请求方法**: `POST`
- **Content-Type**: `application/x-www-form-urlencoded`

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 红包唯一标识码（从列表API获取） |
| id | number | 是 | 红包ID（从列表API获取） |
| rid | number | 是 | 直播间房间号 |
| `$SYS.tn` 指定的字段名 | string | 是 | 值来自 `$SYS.tvk` 指定的 Cookie；字段名和 Cookie 名都不应硬编码 |

### 请求示例

```http
POST /japi/livebiznc/web/anchorstardiscover/redbag/snatch HTTP/1.1
Host: www.douyu.com
Content-Type: application/x-www-form-urlencoded
Accept: application/json, text/plain, */*
Cookie: [认证Cookie]

code=f075ce93bafd6dddb81fb3a810ae4af3&id=1333628&rid=12759376&<动态CSRF字段名>=<对应Cookie值>
```

当前公共请求层的 CSRF 处理流程：

1. `$SYS.tn` 提供表单字段名；实际 Cookie 名由 `$SYS.cookie_pre + $SYS.tvk` 组成。
2. 控制页可以缓存解析出的字段名与 Cookie 名，供自身路由变化后回退使用；缓存不保存 Cookie 值或 token。
3. 若对应 Cookie 不存在，先请求 `/wgapi/livenc/liveweb/csrfApi/getCsrfCookie`，由服务器设置 Cookie。
4. 发起领取时重新读取当前登录会话的 Cookie，并把动态字段和值加入 POST 表单。

2026-08-29 在新版控制室页面内嵌配置中解析到 `tn=ctn`、`tvk=ccn`、`cookie_pre=acf_`，因此实际 Cookie 名是 `acf_ccn`。页面没有直接暴露 `window.$SYS`，当前实现解析页面内嵌脚本文本，不再兼容旧的页面全局变量形式。早期工作页领取架构曾受部分直播间不下发这些字段影响；2026-08-30 起所有 `snatch` 均由控制页执行，短时工作页不读取或共享认证数据。字段名、前缀和 Cookie 键仍不在代码中硬编码。CSRF 只证明合法登录会话，不代表已经满足领取时间。

### 响应参数

#### 响应结构

```json
{
  "error": 0,
  "msg": "success",
  "data": {
    "id": 1333628,
    "rbType": 8,
    "prizeList": [...]
  }
}
```

#### data 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 红包ID |
| rbType | number | 红包类型 |
| prizeList | array | 领取到的奖品列表 |

#### prizeList 元素结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 奖品ID |
| img | string | 奖品图标URL |
| name | string/null | 奖品名称 |
| num | number | 领取到的奖品数量 |
| prizeType | number | 奖品类型 |

### 响应示例

#### 成功领取

```json
{
  "error": 0,
  "msg": "success",
  "data": {
    "id": 1333628,
    "rbType": 8,
    "prizeList": [
      {
        "id": "3567",
        "img": "https://sta-op.douyucdn.cn/dygev/2025/12/12/xxx.png",
        "name": null,
        "num": 4,
        "prizeType": 2
      },
      {
        "id": "",
        "img": "",
        "prizeType": 9,
        "name": null,
        "num": 37
      }
    ]
  }
}
```

#### 空包（未中奖）

```json
{
  "error": 0,
  "msg": "success",
  "data": {
    "id": 1333628,
    "rbType": 8,
    "prizeList": []
  }
}
```

#### 尚未到领取时机（现网已确认）

```json
{
  "error": 12006,
  "msg": "稍等会儿才能抢哟",
  "data": null
}
```

`12006` 是可重试状态，不是鉴权失败。2026-08-29 实测中，脚本保持同一红包身份按 5 秒间隔重试，随后由同一 `snatch` 接口返回 `error=0`；该 5 秒频率只是实验参数。2026-09-04 起，插件按 `waitSec` 为每个红包最多安排 5 次请求，不再从开页后 30–50 秒开始持续轮询。

#### 其他业务错误码（前端静态代码）

| error | 官方前端处理 | 当前结论 |
|------:|--------------|----------|
| 12001 | 红包已派完状态 | 单次返回不能证明账号被风控 |
| 12002–12005 | 通用领取错误状态 | 尚无逐项现网样本，不能补写具体含义 |
| 12006 | 恢复为可再次点击状态 | 已现网确认可稍后重试 |
| 12007 | 通用领取错误状态 | 尚无现网样本 |

若 30 分钟内连续 3 个不同红包都在第一次 `snatch` 时直接返回 `12001`，插件只显示“疑似账户风控”。这是经验性提示，不是斗鱼公开的风控错误码，也不会自动停止领取。

#### 已达上限（历史记录，本轮未复测）

```json
{
  "error": -1,
  "msg": "已达到每日领取上限",
  "data": null
}
```

---

## 3. 认证与请求头

### 鉴权边界

- `room/list` 查询已验证可匿名 GET。
- `snatch` 领取需要浏览器登录态和动态 CSRF 字段。
- 不应复制或硬编码一组 Cookie 名；由同源浏览器会话发送认证 Cookie，并按 `$SYS.tn`、`$SYS.cookie_pre` 与 `$SYS.tvk` 解析 CSRF。
- 2026-08-29 已在页面相对倒计时结束前持续发送 `snatch`：先返回 `12006`，随后提前于本地预计结束时间返回成功。服务端响应必须作为能否领取的最终依据。

### 领取时机现网样本（2026-08-29）

- 房间 `12865305`，红包 `1663094`，首次 `room/list.waitSec=90`。
- `snatch` 在本地预计剩余 `90/85/80/.../50` 秒时均返回 `12006 / 稍等会儿才能抢哟`。
- 本地预计仍剩 `45` 秒时，`snatch` 返回 `error=0 / success`。
- 本轮更新后的最新四个工作房间均由统计面板记录为 `API · 领取成功`，没有出现新的 DOM 兼容领取事件。

该样本说明 `receivedAt + waitSec` 适合做粗略调度，但不是服务端真实可领时刻；插件不应为了等页面倒计时而推迟请求。

### 工作直播间与当前请求调度

- 完全不打开目标直播间的实验无法领取，说明服务端还需要由目标房间建立某种用户活动上下文；具体是页面登录、Socket 入组、`sd202404_uinfo`、`sd202404_rbinfo` 还是其他步骤，尚未最终确定。
- 已有 90 秒红包样本在工作直播间短时打开并关闭后，由控制页完成领取。因此当前架构只短暂打开工作直播间获取必要信息，不要求标签页常驻。
- 300 秒和 600 秒红包的短时开页实验多次经历 `12006` 后转为 `12001`，尚没有足够稳定的成功样本，不能承诺必然领取。
- 当前最多请求 5 次，按开页时间计算的偏移为：90 秒红包 `45/70/90/110/140` 秒，300 秒红包 `200/280/300/320/350` 秒，600 秒红包 `400/580/600/620/650` 秒。其他时长使用同一比例策略，相邻实际请求至少间隔 10 秒。

### 前端中发现的关联接口与消息

| 类型 | 名称 | 作用与证据边界 |
|------|------|----------------|
| GET | `/redbag/snatch/record?code=...&id=...&rid=...` | 官方红包结果页用于读取参与者和奖品记录；响应 `data` 可能是字符串化结构，插件当前未调用 |
| GET | `/wgapi/livenc/liveweb/csrfApi/getCsrfCookie` | 请求服务器补设动态 CSRF Cookie |
| GET | `/anchorstardiscover/coin/record/list` | 查询账户金币变动记录，当前统计页使用 |
| Socket | `sd202404_uinfo` | 星推荐用户信息消息；单独出现不能证明红包领取资格已建立 |
| Socket | `sd202404_actinfo` | 星推荐活动信息消息 |
| Socket | `sd202404_rbinfo` | 星推荐红包信息消息 |
| Socket | `sd202404_coininfo` | 星推荐金币信息消息 |

控制台日志、`GM_log` 和领取统计保存在浏览器或油猴本地；当前代码没有把这些日志上传到斗鱼或项目服务器。

### 参考请求头

```http
Accept: application/json, text/plain, */*
Accept-Language: zh-CN,zh;q=0.9
Referer: https://www.douyu.com/{房间号}
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36...
```

`X-Requested-With` 不是查询接口的必要请求头。

---
## 更新记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-09-04 | 1.5 | 补充 12001–12007 前端处理、关联接口与 Socket 消息、短时工作页边界及五次请求调度 |
| 2026-08-30 | 1.4 | 记录短时后台开页后的控制页领取架构、当前轮询范围及 DOM 降级移除状态 |
| 2026-08-29 | 1.3 | 现网验证 `12006` 与提前 `snatch` 成功时机，并补充新版工作页缺失内嵌 CSRF 配置时的共享映射方案 |
| 2026-08-29 | 1.2 | 补充 `square/list` 实际字段与奖池排序边界，明确奖池数量来自候选房间的 `room/list` |
| 2026-08-29 | 1.1 | 现网复核：修正 `cnt`、`waitSec`、`code`、匿名查询、动态 CSRF、状态与错误码边界 |
| 2026-01-05 | 1.0 | 初始版本，记录查询和领取API |

---
