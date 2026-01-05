# 斗鱼星推荐红包 API 文档

> **发现日期**: 2026-01-05  
> **用途**: 查询直播间星推荐红包情况，查询领取结果  
> **来源**: 逆向斗鱼前端代码

---

## 1. 查询红包列表 API

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
X-Requested-With: XMLHttpRequest
Cookie: [认证Cookie]
```

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
| cnt | number | 红包总数量 |
| rid | number | 房间号 |
| anchorName | string | 主播昵称 |
| anchorAvatar | string | 主播头像URL |
| redBagList | array | 红包列表 |

#### redBagList 元素结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 红包ID |
| code | string | 红包唯一标识码（MD5格式） |
| rbType | number | 红包类型（7/8等） |
| status | number | 红包状态（0=等待中, 3=已结束） |
| waitSec | number | 剩余等待秒数 |
| createTime | number | 创建时间戳（Unix时间） |
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

### 状态说明

- **status = 0**: 红包等待中（倒计时状态）
- **status = 3**: 红包已结束（已领完或过期）

### 红包类型说明

- **rbType = 7**: 普通红包
- **rbType = 8**: 星推荐红包

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
| ctn | string | 是 | 加密token（从Cookie中的acf_ccn获取） |

### 请求示例

```http
POST /japi/livebiznc/web/anchorstardiscover/redbag/snatch HTTP/1.1
Host: www.douyu.com
Content-Type: application/x-www-form-urlencoded
Accept: application/json, text/plain, */*
X-Requested-With: XMLHttpRequest
Cookie: [认证Cookie]

code=f075ce93bafd6dddb81fb3a810ae4af3&id=1333628&rid=12759376&ctn=4e6b5b3c53ef7fbad07098213eb2cb57
```

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

#### 已达上限

```json
{
  "error": -1,
  "msg": "已达到每日领取上限",
  "data": null
}
```

---

## 3. 认证与请求头

### Cookie 字段

| Cookie名 | 说明 |
|----------|------|
| acf_uid | 用户ID |
| acf_auth | 认证令牌 |
| acf_jwt_token | JWT令牌 |
| acf_stk | Session Token |
| acf_ccn | 加密Token（用于领取API的ctn参数） |
| dy_auth | 斗鱼认证 |
| PHPSESSID | PHP会话ID |

### 参考请求头

```http
Accept: application/json, text/plain, */*
Accept-Language: zh-CN,zh;q=0.9
X-Requested-With: XMLHttpRequest
Referer: https://www.douyu.com/{房间号}
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36...
```

---
## 更新记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-01-05 | 1.0 | 初始版本，记录查询和领取API |

---

