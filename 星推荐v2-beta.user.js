// ==UserScript==
// @name             斗鱼全民星推荐助手-beta
// @namespace        http://tampermonkey.net/
// @version          beta-16-beta.1
// @author           ienone&Truthss
// @description      斗鱼全民星推荐自动领取脚本 - 控制页服务端领取、收益统计与可视化任务面板
// @license          MIT
// @match            *://www.douyu.com/*
// @connect          www.douyu.com
// @grant            GM_addStyle
// @grant            GM_deleteValue
// @grant            GM_getValue
// @grant            GM_log
// @grant            GM_openInTab
// @grant            GM_setValue
// @grant            GM_xmlhttpRequest
// @grant            unsafeWindow
// @run-at           document-idle
// @noframes
// @original-author  ysl-ovo (https://greasyfork.org/zh-CN/users/1453821-ysl-ovo)
// ==/UserScript==

(function () {
  'use strict';

  const d=new Set;const importCSS = async e=>{d.has(e)||(d.add(e),(t=>{typeof GM_addStyle=="function"?GM_addStyle(t):document.head.appendChild(document.createElement("style")).append(t);})(e));};

  const CONFIG = {



SCRIPT_PREFIX: "[全民星推荐助手]",
CONTROL_ROOM_ID: "6657",
TEMP_CONTROL_ROOM_RID: "6979222",
CONTROL_ROOM_RESOLVED_FROM: "6657",

INITIAL_SCRIPT_DELAY: 3e3,
ROOM_PREWARM_DURATION: 3e3,

DRAGGABLE_BUTTON_ID: "douyu-qmx-starter-button",
BUTTON_POS_STORAGE_KEY: "douyu_qmx_button_position",
MODAL_DISPLAY_MODE: "floating",

API_URL: "https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/redbag/square/list",
COIN_LIST_URL: "https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/coin/record/list",
API_RETRY_COUNT: 3,
API_RETRY_DELAY: 5e3,
API_ROOM_PROBE_CONCURRENCY: 6,
API_ROOM_PROBE_TIMEOUT: 5e3,

MAX_CONCURRENT_TASKS: 24,
DAILY_LIMIT_ACTION: "CONTINUE_DORMANT",

STATE_STORAGE_KEY: "douyu_qmx_dashboard_state",
DAILY_LIMIT_REACHED_KEY: "douyu_qmx_daily_limit_reached",
STATS_INFO_STORAGE_KEY: "douyu_qmx_stats",

DEFAULT_THEME: "dark",
    INJECT_TARGET_RETRIES: 10,
INJECT_TARGET_INTERVAL: 500,
API_ROOM_FETCH_COUNT: 10,
UI_FEEDBACK_DELAY: 2e3,
DRAG_BUTTON_DEFAULT_PADDING: 20,
CONVERT_LEGACY_POSITION: true
};
  var _GM_deleteValue = (() => typeof GM_deleteValue != "undefined" ? GM_deleteValue : void 0)();
  var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_log = (() => typeof GM_log != "undefined" ? GM_log : void 0)();
  var _GM_openInTab = (() => typeof GM_openInTab != "undefined" ? GM_openInTab : void 0)();
  var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _GM_xmlhttpRequest = (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
  const USER_SETTING_KEYS = Object.freeze([
    "CONTROL_ROOM_ID",
    "TEMP_CONTROL_ROOM_RID",
    "CONTROL_ROOM_RESOLVED_FROM",
    "ROOM_PREWARM_DURATION",
    "DAILY_LIMIT_ACTION",
    "MODAL_DISPLAY_MODE"
  ]);
  const pickUserSettings = (value) => Object.fromEntries(
    USER_SETTING_KEYS.filter((key) => Object.hasOwn(value || {}, key)).map((key) => [key, value[key]])
  );
  const normalizeUserSettings = (value) => {
    const settings = pickUserSettings(value);
    if (Object.hasOwn(settings, "ROOM_PREWARM_DURATION")) {
      const duration = Number(settings.ROOM_PREWARM_DURATION);
      settings.ROOM_PREWARM_DURATION = Math.round(
        Math.min(15e3, Math.max(500, Number.isFinite(duration) ? duration : 3e3))
      );
    }
    return settings;
  };
  const normalizeRuntimePatch = (value) => {
    const settings = { ...value || {} };
    if (Object.hasOwn(settings, "ROOM_PREWARM_DURATION")) {
      settings.ROOM_PREWARM_DURATION = normalizeUserSettings(settings).ROOM_PREWARM_DURATION;
    }
    return settings;
  };
  const SettingsManager = {
    STORAGE_KEY: "douyu_qmx_user_settings",
get() {
      const storedSettings = _GM_getValue(this.STORAGE_KEY, {});
      const userSettings = normalizeUserSettings(storedSettings);
      const storedKeys = Object.keys(storedSettings || {}).sort().join(",");
      const userKeys = Object.keys(userSettings).sort().join(",");
      if (storedKeys !== userKeys) {
        _GM_setValue(this.STORAGE_KEY, userSettings);
      }
      const themeSetting = _GM_getValue(
        "douyu_qmx_theme",
        CONFIG.DEFAULT_THEME
      );
      const runtimeSettings2 = Object.assign({}, CONFIG, userSettings, { THEME: themeSetting });
      if (!Object.hasOwn(userSettings, "CONTROL_ROOM_RESOLVED_FROM")) {
        runtimeSettings2.CONTROL_ROOM_RESOLVED_FROM = "";
      }
      return runtimeSettings2;
    },
save(settingsToSave) {
      const normalized = { ...settingsToSave || {} };
      if (Object.hasOwn(normalized, "THEME")) {
        const theme = normalized.THEME;
        _GM_setValue("douyu_qmx_theme", theme);
        delete normalized.THEME;
      }
      _GM_setValue(this.STORAGE_KEY, normalizeUserSettings(normalized));
    },
update(newSettings) {
      const normalizedSettings = normalizeRuntimePatch(newSettings);
      Object.assign(SETTINGS, normalizedSettings);
      const currentStored = _GM_getValue(this.STORAGE_KEY, {});
      const mergedToSave = Object.assign({}, currentStored, normalizedSettings);
      this.save(mergedToSave);
      window.dispatchEvent(new CustomEvent("qmx-settings-update", { detail: normalizedSettings }));
    },
reset() {
      _GM_deleteValue(this.STORAGE_KEY);
      _GM_deleteValue("douyu_qmx_theme");
    }
  };
  const SETTINGS = SettingsManager.get();
  SETTINGS.THEME = _GM_getValue("douyu_qmx_theme", SETTINGS.DEFAULT_THEME);
  const Utils = {
log(message) {
      const logMsg = `${SETTINGS.SCRIPT_PREFIX} ${message}`;
      try {
        _GM_log(logMsg);
      } catch (e) {
        console.log(e);
        console.log(logMsg);
      }
    },
claimLog(source, message, details = {}) {
      const allowedKeys = new Set([
        "roomId",
        "bagId",
        "result",
        "error",
        "msg",
        "remainingSec",
        "intervalMs",
        "durationMs",
        "reason",
        "httpStatus",
        "rewardText"
      ]);
      const safeDetails = Object.fromEntries(Object.entries(details).filter(([key]) => allowedKeys.has(key)).map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 160) : value]));
      const suffix = Object.keys(safeDetails).length ? ` ${JSON.stringify(safeDetails)}` : "";
      const logMsg = `${SETTINGS.SCRIPT_PREFIX} [领取路径:${source}] ${message}${suffix}`;
      console.info(logMsg);
      try {
        _GM_log(logMsg);
      } catch {
      }
    },
sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
getRandomDelay(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
getCurrentRoomId() {
      const url = window.location.href;
      let match = url.match(/douyu\.com\/(?:beta\/)?(\d+)/);
      if (match && match[1]) {
        return match[1];
      }
      match = url.match(/rid=(\d+)/);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    },
formatTime(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const paddedMinutes = String(minutes).padStart(2, "0");
      const paddedSeconds = String(seconds).padStart(2, "0");
      return `${paddedMinutes}:${paddedSeconds}`;
    },
getBeijingTime() {
      const now = new Date();
      const utcMillis = now.getTime();
      const beijingMillis = utcMillis + 8 * 60 * 60 * 1e3;
      return new Date(beijingMillis);
    },
formatDateAsBeijing(date) {
      const beijingDate = new Date(date.getTime() + 8 * 60 * 60 * 1e3);
      const year = beijingDate.getUTCFullYear();
      const month = String(beijingDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(beijingDate.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
debounce(func, delay) {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    },
throttle(func, delay) {
      let lastCall = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          return func.apply(this, args);
        }
      };
    },
isInLiveRoom() {
      const roomId = this.getCurrentRoomId();
      return roomId !== null && document.querySelector("[data-v-5aa519d2]");
    },
getElementPosition(element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
    },
safeExecute(func, context = "unknown") {
      try {
        return func();
      } catch (error) {
        this.log(`执行函数时出错 [${context}]: ${error.message}`, "error");
        return null;
      }
    },
generateId(prefix = "dda") {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
deepClone(obj) {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      if (obj instanceof Date) {
        return new Date(obj.getTime());
      }
      if (obj instanceof Array) {
        return obj.map((item) => this.deepClone(item));
      }
      if (typeof obj === "object") {
        const cloned = {};
        for (const key in obj) {
          if (Object.hasOwn(obj, key)) {
            cloned[key] = this.deepClone(obj[key]);
          }
        }
        return cloned;
      }
    },
getElementWithRetry: async function(selector, parentNode = document, retries = 5, interval = 1e3) {
      let element = parentNode.querySelector(selector);
      if (element) {
        return element;
      }
      for (let i = 0; i < retries; i++) {
        await Utils.sleep(interval);
        element = parentNode.querySelector(selector);
        if (element) {
          return element;
        }
      }
      throw new Error(`无法找到元素: ${selector}，已重试 ${retries} 次`);
    }
  };
  function initHackTimer(workerScript) {
    try {
      var blob = new Blob([
        "                var fakeIdToId = {};                onmessage = function (event) {                    var data = event.data,                        name = data.name,                        fakeId = data.fakeId,                        time;                    if(data.hasOwnProperty('time')) {                        time = data.time;                    }                    switch (name) {                        case 'setInterval':                            fakeIdToId[fakeId] = setInterval(function () {                                postMessage({fakeId: fakeId});                            }, time);                            break;                        case 'clearInterval':                            if (fakeIdToId.hasOwnProperty (fakeId)) {                                clearInterval(fakeIdToId[fakeId]);                                delete fakeIdToId[fakeId];                            }                            break;                        case 'setTimeout':                            fakeIdToId[fakeId] = setTimeout(function () {                                postMessage({fakeId: fakeId});                                if (fakeIdToId.hasOwnProperty (fakeId)) {                                    delete fakeIdToId[fakeId];                                }                            }, time);                            break;                        case 'clearTimeout':                            if (fakeIdToId.hasOwnProperty (fakeId)) {                                clearTimeout(fakeIdToId[fakeId]);                                delete fakeIdToId[fakeId];                            }                            break;                    }                }                "
      ]);
      workerScript = window.URL.createObjectURL(blob);
    } catch (error) {
      Utils.log(error);
    }
    var worker, fakeIdToCallback = {}, lastFakeId = 0, maxFakeId = 2147483647, logPrefix = "HackTimer.js by turuslan: ";
    if (typeof Worker !== "undefined") {
      let getFakeId = function() {
        do {
          if (lastFakeId == maxFakeId) {
            lastFakeId = 0;
          } else {
            lastFakeId++;
          }
        } while (Object.hasOwn(fakeIdToCallback, lastFakeId));
        return lastFakeId;
      };
      try {
        worker = new Worker(workerScript);
        window.setInterval = function(callback, time) {
          var fakeId = getFakeId();
          fakeIdToCallback[fakeId] = {
            callback,
            parameters: Array.prototype.slice.call(arguments, 2)
          };
          worker.postMessage({
            name: "setInterval",
            fakeId,
            time
          });
          return fakeId;
        };
        window.clearInterval = function(fakeId) {
          if (Object.hasOwn(fakeIdToCallback, fakeId)) {
            delete fakeIdToCallback[fakeId];
            worker.postMessage({
              name: "clearInterval",
              fakeId
            });
          }
        };
        window.setTimeout = function(callback, time) {
          var fakeId = getFakeId();
          fakeIdToCallback[fakeId] = {
            callback,
            parameters: Array.prototype.slice.call(arguments, 2),
            isTimeout: true
          };
          worker.postMessage({
            name: "setTimeout",
            fakeId,
            time
          });
          return fakeId;
        };
        window.clearTimeout = function(fakeId) {
          if (Object.hasOwn(fakeIdToCallback, fakeId)) {
            delete fakeIdToCallback[fakeId];
            worker.postMessage({
              name: "clearTimeout",
              fakeId
            });
          }
        };
        worker.onmessage = function(event) {
          var data = event.data, fakeId = data.fakeId, request, parameters, callback;
          if (Object.hasOwn(fakeIdToCallback, fakeId)) {
            request = fakeIdToCallback[fakeId];
            callback = request.callback;
            parameters = request.parameters;
            if (Object.hasOwn(request, "isTimeout") && request.isTimeout) {
              delete fakeIdToCallback[fakeId];
            }
          }
          if (typeof callback === "string") {
            try {
              callback = new Function(callback);
            } catch (error) {
              console.log(logPrefix + "Error parsing callback code string: ", error);
            }
          }
          if (typeof callback === "function") {
            callback.apply(window, parameters);
          }
        };
        worker.onerror = function(event) {
          console.log(event);
        };
        console.log(logPrefix + "Initialisation succeeded");
      } catch (error) {
        console.log(logPrefix + "Initialisation failed");
        console.error(error);
      }
    } else {
      console.log(logPrefix + "Initialisation failed - HTML5 Web Worker is not supported");
    }
  }
  const ControlPanelRefactoredCss = ':root{color-scheme:light dark;--motion-easing: cubic-bezier(.4, 0, .2, 1);--status-color-waiting: #4CAF50;--status-color-claiming: #2196F3;--status-color-switching: #FFC107;--status-color-error: #F44336;--status-color-opening: #9C27B0;--status-color-dormant: #757575;--status-color-unresponsive: #FFA000;--status-color-disconnected: #BDBDBD;--status-color-stalled: #9af39dff}body[data-theme=dark]{--md-sys-color-primary: #D0BCFF;--md-sys-color-on-primary: #381E72;--md-sys-color-primary-container: #4F378B;--md-sys-color-on-primary-container: #EADDFF;--md-sys-color-surface-container: #211F26;--md-sys-color-on-surface: #E6E1E5;--md-sys-color-on-surface-variant: #CAC4D0;--md-sys-color-outline: #938F99;--md-sys-color-surface-bright: #36343B;--md-sys-color-tertiary: #EFB8C8;--md-sys-color-scrim: #000000;--surface-container-highest: #3D3B42}body[data-theme=light]{--md-sys-color-primary: #6750A4;--md-sys-color-on-primary: #FFFFFF;--md-sys-color-primary-container: #EADDFF;--md-sys-color-on-primary-container: #21005D;--md-sys-color-surface-container: #F3EDF7;--md-sys-color-surface-bright: #FEF7FF;--md-sys-color-on-surface: #1C1B1F;--md-sys-color-on-surface-variant: #49454F;--md-sys-color-outline: #79747E;--md-sys-color-tertiary: #7D5260;--md-sys-color-scrim: #000000;--surface-container-highest: #E6E0E9}.qmx-hidden{display:none!important}.qmx-modal-open-scroll-lock{overflow:hidden!important}.is-dragging{transition:none!important}.qmx-flex-center{display:flex;align-items:center;justify-content:center}.qmx-flex-between{display:flex;align-items:center;justify-content:space-between}.qmx-flex-column{display:flex;flex-direction:column}.qmx-modal-base{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.95);z-index:10001;background-color:var(--md-sys-color-surface-bright);color:var(--md-sys-color-on-surface);border-radius:28px;box-shadow:0 12px 32px #00000080;display:flex;flex-direction:column;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s,transform .3s}.qmx-modal-base.visible{opacity:1;visibility:visible;transform:translate(-50%,-50%) scale(1)}.qmx-backdrop{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:var(--md-sys-color-scrim);z-index:9998;opacity:0;visibility:hidden;transition:opacity .3s ease}.qmx-backdrop.visible{opacity:.5;visibility:visible}.qmx-btn{padding:10px 16px;border:1px solid var(--md-sys-color-outline);background-color:transparent;color:var(--md-sys-color-primary);border-radius:20px;font-size:14px;font-weight:500;cursor:pointer;transition:background-color .18s var(--motion-easing),color .18s var(--motion-easing),border-color .18s var(--motion-easing),box-shadow .18s var(--motion-easing),transform .12s var(--motion-easing);-webkit-user-select:none;user-select:none}.qmx-btn:hover{border-color:color-mix(in srgb,var(--md-sys-color-primary) 72%,var(--md-sys-color-outline));background-color:color-mix(in srgb,var(--md-sys-color-primary) 10%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--md-sys-color-primary) 12%,transparent)}.qmx-btn:active{transform:scale(.975);box-shadow:none}.qmx-btn:disabled{opacity:.5;cursor:not-allowed}.qmx-btn--primary{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);border:none}.qmx-btn--primary:hover{background-color:color-mix(in srgb,var(--md-sys-color-primary) 88%,var(--md-sys-color-on-primary));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--md-sys-color-on-primary) 20%,transparent)}.qmx-btn--danger{border-color:#f44336;color:#f44336}.qmx-btn--danger:hover{background-color:#f443361a}.qmx-btn--icon{width:36px;height:36px;padding:0;border-radius:50%;background-color:#d0bcff26;border:none;color:var(--md-sys-color-primary)}.qmx-btn--icon:hover{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);transform:scale(1.05) rotate(180deg)}.qmx-styled-list{list-style:none;padding-left:0}.qmx-styled-list li{position:relative;padding-left:20px;margin-bottom:8px}.qmx-styled-list li:before{content:"◆";position:absolute;left:0;top:2px;color:var(--md-sys-color-primary);font-size:12px}.qmx-scrollbar::-webkit-scrollbar{width:10px}.qmx-scrollbar::-webkit-scrollbar-track{background:var(--md-sys-color-surface-bright);border-radius:10px}.qmx-scrollbar::-webkit-scrollbar-thumb{background-color:var(--md-sys-color-primary);border-radius:10px;border:2px solid var(--md-sys-color-surface-bright)}.qmx-scrollbar::-webkit-scrollbar-thumb:hover{background-color:#e0d1ff}.qmx-input{background-color:var(--md-sys-color-surface-container);border:1px solid var(--md-sys-color-outline);color:var(--md-sys-color-on-surface);border-radius:8px;padding:12px;width:100%;box-sizing:border-box;transition:box-shadow .2s,border-color .2s}.qmx-input:hover{border-color:var(--md-sys-color-primary)}.qmx-input:focus{outline:none;border-color:var(--md-sys-color-primary);box-shadow:0 0 0 2px #d0bcff4d}.qmx-input[type=number]::-webkit-inner-spin-button,.qmx-input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.qmx-input[type=number]{margin-left:5px;margin-bottom:9px;-moz-appearance:textfield;appearance:textfield}.qmx-fieldset-unit{position:relative;padding:0;margin:0;border:1px solid var(--md-sys-color-outline);border-radius:8px;background-color:var(--md-sys-color-surface-container);transition:border-color .2s,box-shadow .2s;width:100%;box-sizing:border-box}.qmx-fieldset-unit:hover{border-color:var(--md-sys-color-primary)}.qmx-fieldset-unit:focus-within{border-color:var(--md-sys-color-primary);box-shadow:0 0 0 2px #d0bcff4d}.qmx-fieldset-unit input[type=number]{border:none;background:none;outline:none;box-shadow:none;color:var(--md-sys-color-on-surface);padding:3px 10px 4px;width:100%;box-sizing:border-box}.qmx-fieldset-unit legend{padding:0 6px;font-size:12px;color:var(--md-sys-color-on-surface-variant);margin-left:auto;margin-right:12px;text-align:right;pointer-events:none}.qmx-toggle{position:relative;display:inline-block;width:52px;height:30px}.qmx-toggle input{opacity:0;width:0;height:0}.qmx-toggle .slider{position:absolute;cursor:pointer;inset:0;background-color:var(--md-sys-color-surface-container);border:1px solid var(--md-sys-color-outline);border-radius:30px;transition:background-color .3s,border-color .3s}.qmx-toggle .slider:before{position:absolute;content:"";height:22px;width:22px;left:3px;bottom:3px;background-color:var(--md-sys-color-on-surface-variant);border-radius:50%;box-shadow:0 1px 3px #0003;transition:all .3s cubic-bezier(.175,.885,.32,1.275)}.qmx-toggle input:checked+.slider{background-color:var(--md-sys-color-primary);border-color:var(--md-sys-color-primary)}.qmx-toggle input:checked+.slider:before{background-color:var(--md-sys-color-on-primary);transform:translate(22px)}.qmx-toggle:hover .slider{border-color:var(--md-sys-color-primary)}.qmx-select{position:relative;width:100%}.qmx-select-styled{position:relative;padding:10px 30px 10px 12px;background-color:var(--md-sys-color-surface-container);border:1px solid var(--md-sys-color-outline);border-radius:8px;cursor:pointer;transition:all .2s;-webkit-user-select:none;user-select:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:inset 0 2px 4px #00000014}.qmx-select-styled:after{content:"";position:absolute;top:50%;right:12px;transform:translateY(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--md-sys-color-on-surface-variant);transition:transform .3s ease}.qmx-select:hover .qmx-select-styled{border-color:var(--md-sys-color-primary)}.qmx-select.active .qmx-select-styled{border-color:var(--md-sys-color-primary);box-shadow:inset 0 3px 6px #0000001a,0 0 0 2px #d0bcff4d}.qmx-select.active .qmx-select-styled:after{transform:translateY(-50%) rotate(180deg)}.qmx-select-options{position:absolute;top:105%;left:0;right:0;z-index:10;background-color:var(--md-sys-color-surface-bright);border:1px solid var(--md-sys-color-outline);border-radius:8px;max-height:0;overflow:hidden;opacity:0;transform:translateY(-10px);transition:all .3s ease;padding:4px 0}.qmx-select.active .qmx-select-options{max-height:200px;opacity:1;transform:translateY(0)}.qmx-select-options div{padding:10px 12px;cursor:pointer;transition:background-color .2s}.qmx-select-options div:hover{background-color:#d0bcff1a}.qmx-select-options div.selected{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);font-weight:500}.qmx-range-slider-wrapper{display:flex;flex-direction:column;gap:8px}.qmx-range-slider-container{position:relative;height:24px;display:flex;align-items:center}.qmx-range-slider-container input[type=range]{position:absolute;width:100%;height:4px;-webkit-appearance:none;appearance:none;background:none;pointer-events:none;margin:0}.qmx-range-slider-container input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;pointer-events:auto;width:20px;height:20px;background-color:var(--md-sys-color-primary);border-radius:50%;cursor:grab;border:none;box-shadow:0 1px 3px #0000004d;transition:transform .2s}.qmx-range-slider-container input[type=range]::-webkit-slider-thumb:active{cursor:grabbing;transform:scale(1.1)}.qmx-range-slider-container input[type=range]::-moz-range-thumb{pointer-events:auto;width:20px;height:20px;background-color:var(--md-sys-color-primary);border-radius:50%;cursor:grab;border:none;box-shadow:0 1px 3px #0000004d;transition:transform .2s}.qmx-range-slider-container input[type=range]::-moz-range-thumb:active{cursor:grabbing;transform:scale(1.1)}.qmx-range-slider-track-container{position:absolute;width:100%;height:4px;background-color:var(--md-sys-color-surface-container);border-radius:2px}.qmx-range-slider-progress{position:absolute;height:100%;background-color:var(--md-sys-color-primary);border-radius:2px}.qmx-range-slider-values{font-size:14px;color:var(--md-sys-color-primary);text-align:center;font-weight:500}#douyu-qmx-starter-button{position:fixed;top:0;left:0;z-index:10000;background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);border:none;width:56px;height:56px;border-radius:16px;cursor:grab;box-shadow:0 4px 8px #0000004d;display:flex;align-items:center;justify-content:center;transform:translate3d(var(--tx, 0px),var(--ty, 0px),0) scale(1);transition:transform .3s cubic-bezier(.4,0,.2,1),opacity .3s cubic-bezier(.4,0,.2,1);will-change:transform,opacity}#douyu-qmx-starter-button .icon{font-size:28px}#douyu-qmx-starter-button.hidden{opacity:0;transform:translate3d(var(--tx, 0px),var(--ty, 0px),0) scale(.5);pointer-events:none}#qmx-modal-container{background-color:var(--md-sys-color-surface-container);color:var(--md-sys-color-on-surface);display:flex;flex-direction:column}#qmx-modal-container.mode-floating,#qmx-modal-container.mode-centered{position:fixed;z-index:9999;width:335px;max-width:90vw;max-height:80vh;border-radius:28px;box-shadow:0 8px 24px #0006;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s,transform .2s ease-out;will-change:transform,opacity}#qmx-modal-container.visible{opacity:1;visibility:visible}#qmx-modal-container.mode-floating{top:0;left:0;transform:translate3d(var(--tx, 0px),var(--ty, 0px),0)}#qmx-modal-container.mode-floating .qmx-modal-header{cursor:move}#qmx-modal-container.mode-centered{top:50%;left:50%;transform:translate(-50%,-50%)}#qmx-modal-container.mode-inject-rank-list{position:relative;width:100%;flex:1;min-height:0;box-shadow:none;border-radius:0;transform:none!important}.qmx-modal-header{position:relative;padding:10px 20px 4px;font-size:20px;font-weight:400;color:var(--md-sys-color-on-surface);-webkit-user-select:none;user-select:none;display:flex;align-items:center;justify-content:space-between}.qmx-modal-close-icon{width:36px;height:36px;background-color:#d0bcff26;border:none;border-radius:50%;cursor:pointer;transition:background-color .2s,transform .2s;position:relative;flex-shrink:0;color:var(--md-sys-color-primary)}.qmx-modal-close-icon:hover{background-color:var(--md-sys-color-primary);transform:scale(1.05) rotate(180deg)}.qmx-modal-close-icon:before,.qmx-modal-close-icon:after{content:"";position:absolute;top:50%;left:50%;width:16px;height:2px;background-color:currentColor;transition:background-color .2s ease-in-out}.qmx-modal-close-icon:hover:before,.qmx-modal-close-icon:hover:after{background-color:var(--md-sys-color-on-primary)}.qmx-modal-close-icon:before{transform:translate(-50%,-50%) rotate(45deg)}.qmx-modal-close-icon:after{transform:translate(-50%,-50%) rotate(-45deg)}.qmx-modal-content{padding:0 24px;flex:1;min-height:0;max-height:80vh;display:flex;flex-direction:column;overflow-y:scroll}.qmx-modal-content h3{flex-shrink:0;font-size:16px;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin:0 0 8px}#qmx-tab-list{overflow-y:auto;flex-grow:1;padding-right:4px;margin-right:-4px}.qmx-tab-list-item{background-color:var(--md-sys-color-surface-bright);border-radius:16px;padding:8px 16px 8px 18px;margin-bottom:8px;display:flex;align-items:center;gap:12px;transition:background-color .2s,transform .3s ease,opacity .3s ease;position:relative;overflow:hidden}.qmx-tab-list-item:hover{background-color:var(--surface-container-highest)}.qmx-item-enter{opacity:0;transform:translate(20px)}.qmx-item-enter-active{opacity:1;transform:translate(0)}.qmx-item-exit-active{position:absolute;opacity:0;transform:scale(.8);transition:all .3s ease;z-index:-1;pointer-events:none}.qmx-tab-status-dot{position:absolute;left:0;top:50%;transform:translateY(-50%);width:2px;height:28px;border-radius:0 4px 4px 0;transition:all .3s cubic-bezier(.25,.46,.45,.94);flex-shrink:0}.qmx-tab-list-item:hover .qmx-tab-status-dot{height:32px;width:3px}.qmx-tab-info{display:flex;flex-direction:column;flex-grow:1;gap:2px;font-size:14px;overflow:hidden;min-width:0}.qmx-tab-header{display:flex;align-items:center;justify-content:flex-start;height:auto;overflow:visible;margin-bottom:2px}.qmx-tab-identity{position:relative;display:inline-flex;align-items:center;gap:0;padding:2px 4px;border-radius:999px;border:1px solid var(--md-sys-color-on-surface-variant);background-color:var(--md-sys-color-surface-bright);color:var(--md-sys-color-on-surface);font-size:13px;font-weight:500;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease,padding-left .2s ease;overflow:visible}.qmx-tab-identity:hover{padding-left:24px;border-color:var(--md-sys-color-primary);box-shadow:0 6px 16px #00000040}.qmx-tab-identity.copied{border-color:var(--status-color-waiting);box-shadow:0 0 0 2px #4caf5033}.qmx-tab-identity-icon{position:absolute;left:8px;top:50%;transform:translateY(-50%) translate(-100%);width:14px;height:14px;color:var(--md-sys-color-primary);opacity:0;transition:opacity .2s ease,transform .2s ease;pointer-events:none;z-index:10}.qmx-tab-identity:hover .qmx-tab-identity-icon{opacity:1;transform:translateY(-50%) translate(0);pointer-events:auto;cursor:pointer}.qmx-tab-identity-text{display:inline-flex;flex-direction:column;position:relative;overflow:hidden;pointer-events:none;min-width:0}.qmx-tab-identity-text span{transition:transform .25s ease,opacity .2s ease;white-space:nowrap;text-align:left}.qmx-tab-identity[data-state=nickname] .identity-roomid,.qmx-tab-identity[data-state=room] .identity-nickname{transform:translateY(-100%);opacity:0;position:absolute;left:0;top:0}.qmx-tab-identity[data-state=nickname] .identity-nickname,.qmx-tab-identity[data-state=room] .identity-roomid{position:relative;transform:translateY(0);opacity:1}.qmx-tab-details{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--md-sys-color-on-surface-variant);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qmx-tab-prizes{display:flex;align-items:center;gap:4px;margin-left:auto;padding:4px 8px;background-color:var(--md-sys-color-surface-container, rgba(0, 0, 0, .05));flex-shrink:0}.qmx-tab-prizes.single-prize{flex-direction:row;border-radius:100px}.qmx-tab-prizes.multi-prizes{flex-direction:column;border-radius:12px;min-width:70px;padding:6px 10px}.qmx-tab-prize-item{display:inline-flex;align-items:center;gap:4px;background:transparent;padding:0;border:none;line-height:1;color:var(--md-sys-color-on-surface);font-weight:500;font-size:11px}.qmx-tab-prize-item:hover{opacity:.8}.qmx-tab-prize-item svg{display:block;width:12px;height:12px;flex-shrink:0}.qmx-tab-prize-text{font-weight:600;white-space:nowrap;color:inherit;font-size:11px;display:flex;align-items:center}.qmx-tab-close-btn{flex-shrink:0;background-color:#d0bcff26;border:none;color:var(--md-sys-color-primary);cursor:pointer;padding:0;transition:background-color .2s,transform .2s,color .2s;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%}.qmx-tab-close-btn svg{width:14px;height:14px;stroke:currentColor;stroke-width:3}.qmx-tab-close-btn:hover{color:var(--md-sys-color-on-primary);background-color:var(--md-sys-color-primary);transform:scale(1.1) rotate(90deg)}.qmx-modal-footer{padding:16px 24px;display:flex;gap:8px}.qmx-modal-btn{flex-grow:1;padding:10px 16px;border:1px solid var(--md-sys-color-outline);background-color:transparent;color:var(--md-sys-color-primary);border-radius:20px;font-size:14px;font-weight:500;cursor:pointer;transition:background-color .18s var(--motion-easing),color .18s var(--motion-easing),border-color .18s var(--motion-easing),box-shadow .18s var(--motion-easing),transform .12s var(--motion-easing);-webkit-user-select:none;user-select:none}.qmx-modal-btn.danger{border-color:var(--status-color-error);color:var(--status-color-error)}#qmx-modal-container.mode-floating,#qmx-modal-container.mode-centered{width:430px;height:min(620px,80vh)}.qmx-modal-header-actions{display:flex;align-items:center;gap:6px}.qmx-panel-title{position:relative;display:block;width:84px;height:28px;overflow:hidden;flex-shrink:0}.qmx-panel-title>span{position:absolute;inset:0;display:flex;align-items:center;white-space:nowrap;transition:opacity .19s ease,transform .23s cubic-bezier(.2,.75,.2,1)}.qmx-panel-title [data-panel-title=stats]{opacity:0;transform:translateY(8px)}#qmx-modal-container.is-stats-page .qmx-panel-title [data-panel-title=tasks]{opacity:0;transform:translateY(-8px)}#qmx-modal-container.is-stats-page .qmx-panel-title [data-panel-title=stats]{opacity:1;transform:translateY(0)}.qmx-header-icon-btn{width:36px;height:36px;padding:8px;border:0;border-radius:50%;background:#d0bcff1f;color:var(--md-sys-color-primary);cursor:pointer;position:relative;transition:background-color .16s ease,transform .16s ease}.qmx-header-icon-btn:hover{background:#d0bcff3d;transform:scale(1.04)}.qmx-header-icon-btn>svg:not(.qmx-page-icon){width:20px;height:20px}.qmx-theme-icon,.qmx-settings-icon-btn>svg{position:absolute;inset:8px}.qmx-theme-toggle-btn{isolation:isolate;overflow:hidden}.qmx-theme-toggle-btn:before{content:"";position:absolute;pointer-events:none}.qmx-theme-toggle-btn:before{inset:4px;z-index:-1;border-radius:50%;background:radial-gradient(circle,#ffbf4057,#ffbf4000 68%);opacity:.85;transform:scale(.88);transition:background .32s ease,opacity .24s ease,transform .42s cubic-bezier(.2,.7,.2,1)}.qmx-theme-icon{z-index:1;transition:opacity .22s ease,transform .46s cubic-bezier(.2,.8,.2,1)}.qmx-theme-icon-sun{opacity:1;transform:rotate(0) scale(1)}.qmx-theme-icon-moon{opacity:0;transform:rotate(-95deg) scale(.58)}.qmx-theme-toggle-btn[data-theme=dark]:before{background:radial-gradient(circle,#9b7bd857,#9b7bd800 70%);transform:scale(1.08)}.qmx-theme-toggle-btn[data-theme=dark] .qmx-theme-icon-sun{opacity:0;transform:rotate(100deg) scale(.52)}.qmx-theme-toggle-btn[data-theme=dark] .qmx-theme-icon-moon{opacity:1;transform:rotate(0) scale(1)}.qmx-theme-toggle-btn.is-switching:before{animation:qmx-theme-pulse .54s cubic-bezier(.2,.75,.15,1)}.qmx-page-icon{position:absolute;inset:8px;width:20px;height:20px;transition:opacity .15s ease,transform .18s ease}.qmx-page-icon-back{opacity:0;transform:translate(7px)}#qmx-modal-container.is-stats-page .qmx-page-icon-stats{opacity:0;transform:translate(-7px) scale(.84)}#qmx-modal-container.is-stats-page .qmx-page-icon-back{opacity:1;transform:translate(0)}.qmx-panel-viewport{flex:1;min-height:0;overflow:hidden}.qmx-panel-track{width:200%;height:100%;display:flex;transform:translate(0);transition:transform .18s ease-out;will-change:transform}#qmx-modal-container.is-stats-page .qmx-panel-track{transform:translate(-50%)}.qmx-panel-page{flex:0 0 50%;width:50%;min-width:0;min-height:0;box-sizing:border-box}.qmx-task-page{display:flex;flex-direction:column}.qmx-stats-disabled .qmx-panel-track{width:100%}.qmx-stats-disabled .qmx-panel-page{flex-basis:100%;width:100%}.qmx-stats-disabled .qmx-stats-page{display:none}.qmx-task-overview{display:flex;align-items:center;gap:9px;min-height:26px;padding:2px 24px 8px;color:var(--md-sys-color-on-surface-variant);font-size:13px;font-variant-numeric:tabular-nums}.qmx-overview-state{width:10px;height:10px;border-radius:50%;background:var(--status-color-disconnected, #8a8a8a);transition:background-color .16s ease,border-radius .16s ease,transform .16s ease}.qmx-overview-state[data-state=active],.qmx-overview-state[data-state=waiting]{background:var(--status-color-waiting, #64c889)}.qmx-overview-state[data-state=claiming]{background:var(--status-color-claiming, #f0bd52);border-radius:2px;transform:rotate(45deg) scale(.9)}.qmx-overview-state[data-state=error]{background:var(--status-color-error, #ef6b73);border-radius:2px;transform:scale(1.08)}.qmx-modal-content{max-height:none;overflow-y:auto}.qmx-tab-list-item{border:1px solid transparent}.qmx-tab-list-item[data-status=claiming]{transform:translate(2px);border-color:color-mix(in srgb,var(--status-color-claiming, #f0bd52) 38%,transparent)}.qmx-tab-list-item[data-status=error],.qmx-tab-list-item[data-status=unresponsive],.qmx-tab-list-item[data-status=disconnected]{border-color:color-mix(in srgb,var(--status-color-error, #ef6b73) 42%,transparent)}.qmx-tab-list-item[data-status=success]{border-color:color-mix(in srgb,#65c992 44%,transparent)}.qmx-tab-list-item[data-status=success] .qmx-tab-status-dot{width:9px;height:9px;border-radius:50%;background:#65c992!important}.qmx-tab-list-item[data-status=claiming] .qmx-tab-status-dot{width:8px;height:8px;left:5px;border-radius:2px;transform:translateY(-50%) rotate(45deg)}.qmx-tab-list-item[data-status=error] .qmx-tab-status-dot,.qmx-tab-list-item[data-status=unresponsive] .qmx-tab-status-dot,.qmx-tab-list-item[data-status=disconnected] .qmx-tab-status-dot{width:6px;height:20px;border-radius:0 3px 3px 0}.qmx-tab-status-name{font-weight:600;color:var(--md-sys-color-on-surface-variant)}.qmx-tab-status-text{opacity:.62;overflow:hidden;text-overflow:ellipsis}.layout-Player-asideMainTop.qmx-aside-slot-active{position:relative!important;overflow:hidden!important}.layout-Player-asideMainTop.qmx-aside-slot-active>:not(#qmx-modal-container){display:none!important}#qmx-modal-container.mode-inject-rank-list{position:absolute;inset:0;width:100%;height:100%;min-height:0;background:var(--md-sys-color-surface-container);border-radius:0;box-shadow:none;z-index:2}.qmx-stats-page{display:flex;flex-direction:column;min-height:0;padding:0 20px 18px}.qmx-stats-page-toolbar{display:flex;justify-content:space-between;align-items:center;min-height:36px;padding:0 2px 8px}.qmx-stats-range{display:inline-flex;gap:3px;padding:3px;border-radius:15px;background:var(--md-sys-color-surface-bright)}.qmx-stats-range button{height:24px;padding:0 10px;border:0;border-radius:12px;background:transparent;color:var(--md-sys-color-on-surface-variant);cursor:pointer;transition:color .15s ease,background-color .15s ease,transform .15s ease}.qmx-stats-range button.active{color:var(--md-sys-color-on-primary);background:var(--md-sys-color-primary);transform:scale(1.02)}.qmx-stats-refresh{width:32px;height:32px;padding:7px;border:0;border-radius:50%;color:var(--md-sys-color-primary);background:#d0bcff1f;cursor:pointer}.qmx-stats-refresh svg{width:100%;height:100%}.qmx-stats-refresh.rotating{animation:rotate360 .9s ease-in-out}.qmx-stats-content{flex:1;min-height:0;max-height:none;opacity:1;overflow-y:auto;padding:0 4px 0 0}.qmx-stats-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.qmx-stat-card{min-width:0;min-height:54px;padding:9px 8px 8px;border-radius:16px;background:var(--md-sys-color-surface-bright)}.qmx-stat-card strong,.qmx-stat-card span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qmx-stat-card strong{font-size:18px;font-variant-numeric:tabular-nums}.qmx-stat-card span{margin-top:3px;color:var(--md-sys-color-on-surface-variant);font-size:10px}.qmx-stat-card[data-tone=success] strong{color:#52a979}.qmx-stat-card[data-tone=warning] strong{color:#c89236}.qmx-stat-card[data-tone=coin] strong{color:#c99529}.qmx-stat-card[data-tone=starlight] strong{color:#9b7bd8}.qmx-stats-section{margin-top:2px}.qmx-stats-section-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}.qmx-stats-section-title{margin-bottom:7px;color:var(--md-sys-color-on-surface-variant);font-size:12px;font-weight:600}.qmx-stats-section-heading .qmx-stats-section-title{margin-bottom:0}.qmx-trend-legend{display:flex;align-items:center;gap:10px;color:var(--md-sys-color-on-surface-variant);font-size:9px}.qmx-trend-legend span{display:inline-flex;align-items:center;gap:4px}.qmx-trend-legend i{width:7px;height:7px;border-radius:3px}[data-reward=coin]{color:#c99529}[data-reward=starlight]{color:#9b7bd8}.qmx-trend-legend [data-reward=coin] i,.qmx-trend-bars [data-reward=coin]{background:#d7a83f}.qmx-trend-legend [data-reward=starlight] i,.qmx-trend-bars [data-reward=starlight]{background:#9b7bd8}.qmx-stats-trend{height:118px;display:flex;align-items:flex-end;gap:4px;padding:10px 9px 5px;border-radius:18px;background:var(--md-sys-color-surface-bright)}.qmx-trend-column{flex:1;min-width:2px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px}.qmx-trend-values{width:100%;min-height:11px;display:flex;justify-content:center;gap:4px;font-size:8px;font-variant-numeric:tabular-nums}.qmx-trend-values b{max-width:45%;overflow:hidden;text-overflow:ellipsis;font-weight:600}.qmx-trend-bars{width:100%;height:72px;display:flex;justify-content:center;align-items:flex-end;gap:3px}.qmx-trend-bars i{width:min(10px,35%);min-width:1px;border-radius:6px 6px 2px 2px;transition:height .18s ease-out,background-color .16s ease}.qmx-trend-column small{min-height:11px;font-size:9px;color:var(--md-sys-color-on-surface-variant);font-style:normal;font-variant-numeric:tabular-nums}.qmx-stats-trend.is-weekly{gap:12px}.qmx-stats-trend.is-weekly .qmx-trend-bars i{width:min(18px,34%)}.qmx-stats-trend.is-weekly .qmx-trend-column small{font-size:8px}.qmx-stats-log-toolbar{display:flex;margin-top:14px}.qmx-stats-diagnostics{margin-top:6px;border-radius:18px;background:var(--md-sys-color-surface-bright);overflow:hidden}.qmx-stats-diagnostics summary{min-height:40px;display:grid;grid-template-columns:8px 1fr auto 18px;align-items:center;gap:8px;padding:0 12px;color:var(--md-sys-color-on-surface-variant);cursor:pointer;list-style:none;font-size:11px;font-weight:600}.qmx-stats-diagnostics summary::-webkit-details-marker{display:none}.qmx-stats-diagnostics summary>i{width:7px;height:7px;border-radius:50%;background:#65c992}.qmx-stats-diagnostics[data-tone=warning] summary>i{border-radius:2px;background:#e6b45c;transform:rotate(45deg)}.qmx-stats-diagnostics summary b{min-width:20px;padding:2px 6px;border-radius:9px;background:color-mix(in srgb,var(--md-sys-color-outline) 20%,transparent);text-align:center;font-size:9px;font-variant-numeric:tabular-nums}.qmx-stats-diagnostics summary svg{width:18px;height:18px;transition:transform .16s ease}.qmx-stats-diagnostics[open] summary svg{transform:rotate(180deg)}.qmx-stats-timeline{display:grid;gap:5px;padding:0 7px 7px}.qmx-timeline-row{min-height:38px;display:grid;grid-template-columns:8px 54px 1fr auto;align-items:center;gap:7px;padding:0 8px;border-radius:13px;background:var(--md-sys-color-surface-container);font-size:10px}.qmx-timeline-row>i{width:7px;height:7px;border-radius:50%;background:#8d8d8d}.qmx-timeline-row[data-tone=warning]>i{background:#e6b45c;border-radius:2px;transform:rotate(45deg)}.qmx-timeline-row[data-tone=error]>i{background:#ef6b73;border-radius:2px}.qmx-timeline-row time{color:var(--md-sys-color-on-surface-variant);font-variant-numeric:tabular-nums}.qmx-timeline-row span,.qmx-timeline-row b,.qmx-timeline-row small{min-width:0}.qmx-timeline-row span{display:grid}.qmx-timeline-row b,.qmx-timeline-row small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qmx-timeline-row small{margin-top:1px;color:var(--md-sys-color-outline);font-size:9px}.qmx-timeline-row em{color:var(--md-sys-color-on-surface-variant);font-size:9px;font-style:normal}.qmx-stats-empty{height:42px;display:grid;place-items:center;border-radius:16px;background:var(--md-sys-color-surface-bright)}.qmx-stats-empty i{width:18px;height:4px;border-radius:2px;background:var(--md-sys-color-outline);opacity:.45}@media (prefers-reduced-motion: reduce){.qmx-panel-track,.qmx-panel-title>span,.qmx-page-icon,.qmx-overview-state,.qmx-tab-status-dot,.qmx-trend-bars i,.qmx-stats-diagnostics summary svg,.qmx-theme-icon,.qmx-theme-toggle-btn:before{transition-duration:.01ms!important;animation-duration:.01ms!important}}.qmx-modal-btn.danger:hover{border-color:var(--status-color-error);background-color:color-mix(in srgb,var(--status-color-error) 10%,transparent);color:var(--status-color-error);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--status-color-error) 10%,transparent)}@keyframes rotate360{to{transform:rotate(360deg)}}@keyframes qmx-theme-pulse{0%{opacity:.55;transform:scale(.78)}52%{opacity:1;transform:scale(1.18)}to{opacity:.85;transform:scale(1)}}.qmx-tab-header.show-id .qmx-tab-nickname{pointer-events:none!important}.qmx-tab-header.show-id .qmx-tab-room-id{pointer-events:auto!important}#qmx-settings-modal{width:500px;max-width:95vw}.qmx-settings-header{padding:12px 24px;border-bottom:1px solid var(--md-sys-color-outline);flex-shrink:0}.qmx-settings-tabs{display:flex;gap:8px}.qmx-settings-tabs .tab-link{padding:8px 16px;border:none;background:none;color:var(--md-sys-color-on-surface-variant);cursor:pointer;border-radius:8px;transition:background-color .2s,color .2s;font-size:14px}.qmx-settings-tabs .tab-link:hover{background-color:#ffffff0d}.qmx-settings-tabs .tab-link.active{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);font-weight:500}.qmx-settings-content{padding:16px 24px;flex-grow:1;overflow-y:auto;overflow-x:hidden;max-height:60vh;scrollbar-gutter:stable}.qmx-settings-content .tab-content{display:none}.qmx-settings-content .tab-content.active{display:block}.qmx-settings-footer{padding:16px 24px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--md-sys-color-outline);flex-shrink:0}.qmx-settings-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;align-items:start}.qmx-settings-item{display:flex;flex-direction:column;justify-content:center;gap:8px}.qmx-settings-item label{font-size:14px;font-weight:500;display:flex;align-items:center;gap:6px}.qmx-settings-item-wide{grid-column:1 / -1}.qmx-settings-warning{padding:12px;background-color:#f4433633;border:1px solid #F44336;color:#efb8c8;border-radius:8px;grid-column:1 / -1}#tab-about{min-height:132px}.qmx-about-identity{display:flex;align-items:center;gap:10px;padding:8px 2px 22px;font-size:16px}.qmx-about-identity .version-tag{display:inline-block;background-color:color-mix(in srgb,var(--md-sys-color-primary) 15%,transparent);color:var(--md-sys-color-primary);padding:3px 9px;border-radius:999px;font-size:11px;font-weight:500}.qmx-about-links{display:flex;gap:10px}.qmx-about-links a{flex:1;padding:10px 14px;border:1px solid var(--md-sys-color-outline);border-radius:16px;color:var(--md-sys-color-tertiary);text-decoration:none;text-align:center;font-weight:500;transition:color .18s ease,border-color .18s ease,background-color .18s ease}.qmx-about-links a:hover{border-color:var(--md-sys-color-primary);background:color-mix(in srgb,var(--md-sys-color-primary) 9%,transparent);color:var(--md-sys-color-primary)}#qmx-notice-modal{width:450px;max-width:90vw}#qmx-notice-modal .qmx-modal-content{padding:16px 24px}#qmx-notice-modal .qmx-modal-content p{margin-bottom:12px;line-height:1.6;font-size:15px;color:var(--md-sys-color-on-surface-variant)}#qmx-notice-modal .qmx-modal-content ul{margin:12px 0;padding-left:20px}#qmx-notice-modal .qmx-modal-content li{margin-bottom:10px;position:relative;font-size:15px;line-height:1.6}#qmx-notice-modal .qmx-modal-content li:before{content:"◆";position:absolute;left:-18px;color:var(--md-sys-color-primary);font-size:12px}#qmx-notice-modal h3{font-size:20px;font-weight:500;margin:0}#qmx-notice-modal h4{color:var(--md-sys-color-primary);font-size:16px;font-weight:500;margin-top:16px;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid var(--md-sys-color-outline)}#qmx-notice-modal .qmx-warning-text{background-color:#ffc1071a;border-left:4px solid #FFC107;padding:12px 16px;margin:16px 0;border-radius:4px;font-size:15px;line-height:1.6}#qmx-notice-modal .qmx-warning-text strong{color:#ff8f00}#qmx-notice-modal a{color:var(--md-sys-color-tertiary);text-decoration:none;font-weight:500;transition:color .2s}#qmx-notice-modal a:hover{color:#ffd6e1;text-decoration:underline}#qmx-modal-backdrop,#qmx-notice-backdrop{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:var(--md-sys-color-scrim);z-index:9998;opacity:0;visibility:hidden;transition:opacity .3s ease}#qmx-modal-backdrop.visible,#qmx-notice-backdrop.visible{opacity:.5;visibility:visible}#qmx-settings-modal,#qmx-notice-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.95);z-index:10001;background-color:var(--md-sys-color-surface-bright);color:var(--md-sys-color-on-surface);border-radius:28px;box-shadow:0 12px 32px #00000080;display:flex;flex-direction:column;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s,transform .3s}#qmx-settings-modal.visible,#qmx-notice-modal.visible{opacity:1;visibility:visible;transform:translate(-50%,-50%) scale(1)}.qmx-modal-btn{position:relative;flex-grow:1;padding:10px 16px;border:1px solid var(--md-sys-color-outline);background-color:transparent;color:var(--md-sys-color-primary);border-radius:20px;font-size:14px;font-weight:500;cursor:pointer;transition:background-color .18s var(--motion-easing),color .18s var(--motion-easing),border-color .18s var(--motion-easing),box-shadow .18s var(--motion-easing),transform .12s var(--motion-easing);-webkit-user-select:none;user-select:none}.qmx-modal-btn:hover{border-color:color-mix(in srgb,var(--md-sys-color-primary) 72%,var(--md-sys-color-outline));background-color:color-mix(in srgb,var(--md-sys-color-primary) 10%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--md-sys-color-primary) 12%,transparent)}.qmx-modal-btn:active{transform:scale(.975);box-shadow:none}.qmx-modal-btn:disabled{opacity:.5;cursor:not-allowed}.qmx-modal-btn.primary{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);border:none}.qmx-modal-btn.primary:hover{background-color:color-mix(in srgb,var(--md-sys-color-primary) 88%,var(--md-sys-color-on-primary));color:var(--md-sys-color-on-primary);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--md-sys-color-on-primary) 20%,transparent)}.qmx-settings-footer .qmx-modal-btn.primary[data-state]{color:transparent;border-radius:13px}.qmx-settings-footer .qmx-modal-btn.primary[data-state]:after{position:absolute;inset:0;display:grid;place-items:center;color:var(--md-sys-color-on-primary)}.qmx-settings-footer .qmx-modal-btn.primary[data-state=saving]:after{content:"";width:14px;height:14px;inset:50% auto auto 50%;border:2px solid color-mix(in srgb,var(--md-sys-color-on-primary) 35%,transparent);border-top-color:var(--md-sys-color-on-primary);border-radius:50%;animation:qmx-save-spin .65s linear infinite}.qmx-settings-footer .qmx-modal-btn.primary[data-state=saved]{background-color:#4f9f73}.qmx-settings-footer .qmx-modal-btn.primary[data-state=saved]:after{content:"✓";font-size:16px}.qmx-settings-footer .qmx-modal-btn.primary[data-state=error]{background-color:var(--status-color-error);animation:qmx-save-error .26s ease-out}.qmx-settings-footer .qmx-modal-btn.primary[data-state=error]:after{content:"!";font-weight:700}@keyframes qmx-save-spin{0%{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes qmx-save-error{0%,to{transform:translate(0)}35%{transform:translate(-3px)}70%{transform:translate(3px)}}@media (prefers-reduced-motion: reduce){.qmx-settings-footer .qmx-modal-btn.primary[data-state]:after,.qmx-settings-footer .qmx-modal-btn.primary[data-state=error]{animation-duration:.01ms!important}}.qmx-modal-btn.danger{border-color:#f44336;color:#f44336}.qmx-modal-btn.danger:hover{background-color:color-mix(in srgb,var(--status-color-error) 10%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--status-color-error) 10%,transparent)}.qmx-modal-content::-webkit-scrollbar,.qmx-settings-content::-webkit-scrollbar{width:10px}.qmx-modal-content::-webkit-scrollbar-track,.qmx-settings-content::-webkit-scrollbar-track{background:var(--md-sys-color-surface-bright);border-radius:10px}.qmx-modal-content::-webkit-scrollbar-thumb,.qmx-settings-content::-webkit-scrollbar-thumb{background-color:var(--md-sys-color-primary);border-radius:10px;border:2px solid var(--md-sys-color-surface-bright)}.qmx-modal-content::-webkit-scrollbar-thumb:hover,.qmx-settings-content::-webkit-scrollbar-thumb:hover{background-color:#e0d1ff}';
  importCSS(ControlPanelRefactoredCss);
  const statsPanelTemplate = `
    <section class="qmx-panel-page qmx-stats-page" id="qmx-stats-page" aria-label="数据统计">
        <div class="qmx-stats-page-toolbar">
            <div class="qmx-stats-range" aria-label="统计周期">
                <button type="button" class="active" data-period="daily">7天</button>
                <button type="button" data-period="weekly">4周</button>
            </div>
            <button class="qmx-stats-refresh" type="button" title="刷新统计数据" aria-label="刷新统计数据">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.65 6.35A7.95 7.95 0 0012 4a8 8 0 107.73 10h-2.08A6 6 0 1116.22 7.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
            </button>
        </div>
        <div class="qmx-stats-content" id="qmx-stats-content">
            <div class="qmx-stats-summary" id="qmx-stats-summary"></div>
            <section class="qmx-stats-section">
                <div class="qmx-stats-section-heading">
                    <div class="qmx-stats-section-title">收益趋势</div>
                    <div class="qmx-trend-legend" aria-label="图例">
                        <span data-reward="coin"><i></i>金币</span>
                        <span data-reward="starlight"><i></i>星光棒</span>
                    </div>
                </div>
                <div class="qmx-stats-trend" id="qmx-stats-trend"></div>
            </section>
            <div class="qmx-stats-log-toolbar">
                <div class="qmx-stats-range qmx-stats-log-range" aria-label="日志类型">
                    <button type="button" class="active" data-log-mode="all">日志</button>
                    <button type="button" data-log-mode="exceptions">异常日志</button>
                </div>
            </div>
            <details class="qmx-stats-diagnostics" id="qmx-stats-diagnostics" open>
                <summary>
                    <i></i>
                    <span id="qmx-stats-log-label">近期记录</span>
                    <b id="qmx-stats-diagnostic-count">0</b>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </summary>
                <div class="qmx-stats-timeline" id="qmx-stats-timeline"></div>
            </details>
        </div>
    </section>
`;
  const mainPanelTemplate = (maxTasks) => `
    <div class="qmx-modal-header">
        <span id="qmx-panel-title" class="qmx-panel-title" aria-live="polite" aria-label="控制中心">
            <span data-panel-title="tasks">控制中心</span>
            <span data-panel-title="stats">数据统计</span>
        </span>
        <div class="qmx-modal-header-actions">
            <button id="qmx-page-switch-btn" class="qmx-header-icon-btn qmx-page-switch-btn" type="button" title="查看统计" aria-label="切换任务与统计页面">
                <svg class="qmx-page-icon qmx-page-icon-stats" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10h3v9H5v-9zm5-5h3v14h-3V5zm5 8h3v6h-3v-6z" fill="currentColor"/></svg>
                <svg class="qmx-page-icon qmx-page-icon-back" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button id="qmx-theme-toggle-btn" class="qmx-header-icon-btn qmx-theme-toggle-btn" type="button" title="切换日夜模式" aria-label="切换日夜模式">
                <svg class="qmx-theme-icon qmx-theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <svg class="qmx-theme-icon qmx-theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.2A8 8 0 018.8 3.5 8.5 8.5 0 1020.5 15.2z" fill="currentColor"/></svg>
            </button>
            <button id="qmx-modal-settings-btn" class="qmx-header-icon-btn qmx-settings-icon-btn" type="button" title="设置" aria-label="打开设置">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94a7.3 7.3 0 000-1.88l2.03-1.58-1.92-3.32-2.39.96a7.1 7.1 0 00-1.62-.94L14.88 3h-3.84l-.36 2.18c-.58.24-1.12.55-1.62.94l-2.39-.96-1.92 3.32 2.03 1.58a7.3 7.3 0 000 1.88l-2.03 1.58 1.92 3.32 2.39-.96c.5.39 1.04.7 1.62.94l.36 2.18h3.84l.36-2.18c.58-.24 1.12-.55 1.62-.94l2.39.96 1.92-3.32-2.03-1.58zM13 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" fill="currentColor"/></svg>
            </button>
            <button id="qmx-modal-close-btn" class="qmx-modal-close-icon" title="关闭" aria-label="关闭控制中心"></button>
        </div>
    </div>
    <div class="qmx-panel-viewport">
        <div class="qmx-panel-track">
            <section class="qmx-panel-page qmx-task-page" id="qmx-task-page" aria-label="当前工作">
                <div class="qmx-task-overview">
                    <span class="qmx-overview-state" id="qmx-overview-state" data-state="idle"></span>
                    <span><strong id="qmx-active-tabs-count">0</strong> / ${maxTasks}</span>
                </div>
                <div class="qmx-modal-content">
                    <div id="qmx-tab-list"></div>
                </div>
                <div class="qmx-modal-footer">
                    <button id="qmx-modal-close-all-btn" class="qmx-modal-btn danger">停止所有</button>
                    <button id="qmx-modal-open-btn" class="qmx-modal-btn primary">启动领取任务</button>
                </div>
            </section>
            ${statsPanelTemplate}
        </div>
    </div>
`;
  const settingsPanelTemplate = (SETTINGS2) => `
    <div class="qmx-settings-header">
        <div class="qmx-settings-tabs">
            <button class="tab-link active" data-tab="star">星推荐</button>
            ${""}
            <button class="tab-link" data-tab="about">关于</button>
        </div>
    </div>
    <div class="qmx-settings-content">
        <div id="tab-star" class="tab-content active">
            <div class="qmx-settings-grid">
                <div class="qmx-settings-item">
                    <label for="setting-control-room-id">控制室房间号</label>
                    <input type="number" class="qmx-input" id="setting-control-room-id" value="${SETTINGS2.CONTROL_ROOM_ID}">
                </div>
                <div class="qmx-settings-item">
                    <label for="setting-prewarm-duration">后台页面停留时间（秒）</label>
                    <input type="number" class="qmx-input" id="setting-prewarm-duration" min="0.5" max="15" step="0.5" value="${SETTINGS2.ROOM_PREWARM_DURATION / 1e3}">
                </div>
                <div class="qmx-settings-item">
                    <label>达到上限后的行为</label>
                    <div class="qmx-select" data-target-id="setting-daily-limit-action">
                        <div class="qmx-select-styled"></div>
                        <div class="qmx-select-options"></div>
                        <select id="setting-daily-limit-action" style="display:none">
                            <option value="CONTINUE_DORMANT" ${SETTINGS2.DAILY_LIMIT_ACTION === "CONTINUE_DORMANT" ? "selected" : ""}>休眠并等待次日恢复</option>
                            <option value="STOP_ALL" ${SETTINGS2.DAILY_LIMIT_ACTION === "STOP_ALL" ? "selected" : ""}>停止所有领取任务</option>
                        </select>
                    </div>
                </div>
                <div class="qmx-settings-item">
                    <label>控制中心显示方式</label>
                    <div class="qmx-select" data-target-id="setting-modal-mode">
                        <div class="qmx-select-styled"></div>
                        <div class="qmx-select-options"></div>
                        <select id="setting-modal-mode" style="display:none">
                            <option value="floating" ${SETTINGS2.MODAL_DISPLAY_MODE === "floating" ? "selected" : ""}>浮动窗口</option>
                            <option value="centered" ${SETTINGS2.MODAL_DISPLAY_MODE === "centered" ? "selected" : ""}>屏幕居中</option>
                            <option value="inject-rank-list" ${SETTINGS2.MODAL_DISPLAY_MODE === "inject-rank-list" ? "selected" : ""}>侧栏模式</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        ${""}

        <div id="tab-about" class="tab-content">
            <div class="qmx-about-identity">
                <strong>全民星推荐助手</strong>
                <span class="version-tag">v2.1.0 Beta</span>
            </div>
            <div class="qmx-about-links">
                <a href="https://github.com/ienone/douyu-qmx-pro/" target="_blank" rel="noopener noreferrer">源码</a>
                <a href="https://github.com/ienone/douyu-qmx-pro/issues" target="_blank" rel="noopener noreferrer">反馈</a>
            </div>
        </div>
    </div>
    <div class="qmx-settings-footer">
        <button id="qmx-settings-cancel-btn" class="qmx-modal-btn">取消</button>
        <button id="qmx-settings-reset-btn" class="qmx-modal-btn danger">恢复默认</button>
        <button id="qmx-settings-save-btn" class="qmx-modal-btn primary">保存</button>
    </div>
`;
  const ThemeManager = {
applyTheme(theme) {
      document.body.setAttribute("data-theme", theme);
      SETTINGS.THEME = theme;
      _GM_setValue("douyu_qmx_theme", theme);
    }
  };
  const GlobalState = {
get() {
      let state2 = _GM_getValue(SETTINGS.STATE_STORAGE_KEY, { tasks: {} });
      if (!state2 || typeof state2 !== "object") {
        state2 = { tasks: {} };
      }
      if (!state2.tasks || typeof state2.tasks !== "object") state2.tasks = {};
      if (Object.hasOwn(state2, "tabs")) {
        delete state2.tabs;
        _GM_setValue(SETTINGS.STATE_STORAGE_KEY, state2);
      }
      return state2;
    },
set(state2) {
      _GM_setValue(SETTINGS.STATE_STORAGE_KEY, state2);
    },
updateTask(roomId, status, statusText, options = {}) {
      if (!roomId) return;
      const state2 = this.get();
      const oldTaskData = state2.tasks[roomId] || {};
      const updates = {
        status,
        statusText,
        lastUpdateTime: Date.now(),
        ...options
      };
      const newTaskData = { ...oldTaskData, ...updates };
      for (const key in newTaskData) {
        if (newTaskData[key] === null) {
          delete newTaskData[key];
        }
      }
      state2.tasks[roomId] = newTaskData;
      this.set(state2);
    },
removeTask(roomId) {
      if (!roomId) return;
      const state2 = this.get();
      delete state2.tasks[roomId];
      this.set(state2);
    },
setDailyLimit(reached) {
      _GM_setValue(SETTINGS.DAILY_LIMIT_REACHED_KEY, { reached, timestamp: Date.now() });
    },
getDailyLimit() {
      return _GM_getValue(SETTINGS.DAILY_LIMIT_REACHED_KEY);
    },
    setAccountRisk(suspected, details = {}) {
      const state2 = this.get();
      if (suspected) {
        state2.accountRisk = { ...details, suspected: true, timestamp: Date.now() };
      } else {
        delete state2.accountRisk;
      }
      this.set(state2);
    },
    getAccountRisk() {
      const risk = this.get().accountRisk;
      if (!risk?.suspected) return void 0;
      if (Number(risk.expiresAt) > Date.now()) return risk;
      this.setAccountRisk(false);
      return void 0;
    }
  };
  let isGlobalClickListenerAdded = false;
  function activateCustomSelects(parentElement) {
    parentElement.querySelectorAll(".qmx-select").forEach((wrapper) => {
      const nativeSelect = wrapper.querySelector("select");
      const styledSelect = wrapper.querySelector(".qmx-select-styled");
      const optionsList = wrapper.querySelector(".qmx-select-options");
      styledSelect.textContent = nativeSelect.options[nativeSelect.selectedIndex].text;
      optionsList.innerHTML = "";
      for (const option of nativeSelect.options) {
        const optionDiv = document.createElement("div");
        optionDiv.textContent = option.text;
        optionDiv.dataset.value = option.value;
        if (option.selected) {
          optionDiv.classList.add("selected");
        }
        optionsList.appendChild(optionDiv);
      }
      styledSelect.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".qmx-select.active").forEach((el) => {
          if (el !== wrapper) {
            el.classList.remove("active");
          }
        });
        wrapper.classList.toggle("active");
      });
      optionsList.querySelectorAll("div").forEach((optionDiv) => {
        optionDiv.addEventListener("click", () => {
          styledSelect.textContent = optionDiv.textContent;
          nativeSelect.value = optionDiv.dataset.value;
          optionsList.querySelector(".selected")?.classList.remove("selected");
          optionDiv.classList.add("selected");
          wrapper.classList.remove("active");
        });
      });
    });
    if (!isGlobalClickListenerAdded) {
      document.addEventListener("click", () => {
        document.querySelectorAll(".qmx-select.active").forEach((el) => {
          el.classList.remove("active");
        });
      });
      isGlobalClickListenerAdded = true;
    }
  }
  const extractDouyuCsrfConfig = (source) => {
    const text = String(source || "").replaceAll('\\"', '"').replaceAll("\\'", "'");
    const cookieKey = text.match(/(?:["']?tvk["']?)\s*:\s*["']([^"']+)["']/)?.[1] || "";
    const cookiePrefix = text.match(/(?:["']?cookie_pre["']?)\s*:\s*["']([^"']*)["']/)?.[1] || "";
    return {
      fieldName: text.match(/(?:["']?tn["']?)\s*:\s*["']([^"']+)["']/)?.[1] || "",
      cookieName: cookieKey && cookiePrefix && !cookieKey.startsWith(cookiePrefix) ? `${cookiePrefix}${cookieKey}` : cookieKey
    };
  };
  const SNATCH_OUTCOME = Object.freeze({
    SUCCESS: "success",
    NOT_READY: "not_ready",
    EXHAUSTED: "exhausted",
    DAILY_LIMIT: "daily_limit",
    AUTH_FAILED: "auth_failed",
    ALREADY_CLAIMED: "already_claimed",
    UNKNOWN: "unknown"
  });
  const asNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };
  const getRedBagKey = (bag, roomId = bag?.rid) => [
    String(roomId || ""),
    String(bag?.id || ""),
    String(bag?.code || "")
  ].join(":");
  const normalizeRedBag = (bag, roomId) => ({
    rid: String(roomId || bag?.rid || ""),
    id: asNumber(bag?.id),
    code: String(bag?.code || ""),
    status: asNumber(bag?.status, -1),
    waitSec: Math.max(0, asNumber(bag?.waitSec)),
    createTime: asNumber(bag?.createTime),
    rbType: asNumber(bag?.rbType),
    prizeList: Array.isArray(bag?.prizeList) ? bag.prizeList : []
  });
  const summarizePrizePool = (prizeList) => (Array.isArray(prizeList) ? prizeList : []).reduce((summary, prize) => {
    const amount = Math.max(0, asNumber(prize?.num));
    const prizeType = asNumber(prize?.ptype ?? prize?.prizeType, -1);
    if (prizeType === 9) summary.coins += amount;
    if (prizeType === 2) summary.starlight += amount;
    summary.total = summary.coins + summary.starlight;
    return summary;
  }, { coins: 0, starlight: 0, total: 0 });
  const summarizeRedBagPrizePool = (bag) => summarizePrizePool(bag?.prizeList);
  const compareRedBagPrizeValue = (left, right) => {
    const leftPool = summarizeRedBagPrizePool(left);
    const rightPool = summarizeRedBagPrizePool(right);
    if (leftPool.total !== rightPool.total) return rightPool.total - leftPool.total;
    if (leftPool.coins !== rightPool.coins) return rightPool.coins - leftPool.coins;
    return rightPool.starlight - leftPool.starlight;
  };
  const selectActiveRedBag = ({
    redBagList,
    roomId,
    completedKeys = new Set()
  }) => {
    const active = (Array.isArray(redBagList) ? redBagList : []).map((bag) => normalizeRedBag(bag, roomId)).filter((bag) => bag.id && bag.code && bag.status === 0).filter((bag) => !completedKeys.has(getRedBagKey(bag)));
    active.sort((left, right) => {
      const prizeOrder = compareRedBagPrizeValue(left, right);
      if (prizeOrder !== 0) return prizeOrder;
      if (left.waitSec !== right.waitSec) return left.waitSec - right.waitSec;
      if (left.createTime !== right.createTime) return left.createTime - right.createTime;
      return left.id - right.id;
    });
    return active[0] || null;
  };
  const createRedBagBinding = (bag, receivedAt = Date.now()) => {
    const normalized = normalizeRedBag(bag, bag?.rid);
    return {
      key: getRedBagKey(normalized),
      bag: normalized,
      firstReceivedAt: receivedAt
    };
  };
  const getSnatchAttemptOffsets = (waitSec) => {
    const wait = Math.max(30, Math.round(asNumber(waitSec)));
    const first = Math.round(wait * (wait >= 300 ? 2 / 3 : 1 / 2));
    const nearEnd = Math.max(first + 10, wait - 20);
    return [first, nearEnd, wait, wait + 20, wait + 50].map((seconds) => seconds * 1e3);
  };
  const classifySnatchResponse = (response) => {
    const error = Number(response?.error);
    const message = String(response?.msg || "");
    if (error === 0) return SNATCH_OUTCOME.SUCCESS;
    if (error === 12006) return SNATCH_OUTCOME.NOT_READY;
    if (error === 12001 || /已派完|已抢完|已结束|已过期/.test(message)) {
      return SNATCH_OUTCOME.EXHAUSTED;
    }
    if (error === -1 && /上限|次数/.test(message)) return SNATCH_OUTCOME.DAILY_LIMIT;
    if (/登录|鉴权|csrf|token|凭证/i.test(message)) return SNATCH_OUTCOME.AUTH_FAILED;
    if (/已领取|领取过|重复领取/.test(message)) return SNATCH_OUTCOME.ALREADY_CLAIMED;
    return SNATCH_OUTCOME.UNKNOWN;
  };
  const countConsecutiveImmediate12001 = (events, now = Date.now()) => {
    const bagKeys = new Set();
    const cutoff = now - 30 * 60 * 1e3;
    for (const event of Array.isArray(events) ? events : []) {
      const timestamp = Number(event?.timestamp);
      if (!Number.isFinite(timestamp) || timestamp < cutoff) break;
      if (event?.phase !== "claim") continue;
      if (event.result !== "exhausted" || Number(event.error) !== 12001 || Number(event.attemptCount) !== 1) break;
      const bagKey = String(event.bagKey || `${event.roomId || ""}:${event.bagId || ""}`);
      if (bagKey !== ":") bagKeys.add(bagKey);
    }
    return bagKeys.size;
  };
  const toDisplayPrizes = (prizeList) => (Array.isArray(prizeList) ? prizeList : []).filter((prize) => Number(prize?.num) > 0).map((prize) => ({
    img: String(prize?.img || ""),
    name: String(prize?.name || ""),
    text: `×${Number(prize.num)}`
  }));
  const ROOM_POOL_KEY = "douyu_qmx_room_pool";
  const ROOM_POOL_LOCK_KEY = "douyu_qmx_room_pool_lock";
  const CSRF_CONFIG_KEY = "douyu_qmx_csrf_config";
  const RED_BAG_ROOM_LIST_PATH = "/japi/livebiznc/web/anchorstardiscover/redbag/room/list";
  const RED_BAG_SNATCH_PATH = "/japi/livebiznc/web/anchorstardiscover/redbag/snatch";
  const CSRF_COOKIE_PATH = "/wgapi/livenc/liveweb/csrfApi/getCsrfCookie";
  const mapWithConcurrency = async (items, concurrency, mapper) => {
    const results = new Array(items.length);
    let cursor = 0;
    const workerCount = Math.min(items.length, Math.max(1, Number(concurrency) || 1));
    const workers = Array.from({ length: workerCount }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await mapper(items[index], index);
      }
    });
    await Promise.all(workers);
    return results;
  };
  const normalizeSquareCandidates = (items, limit) => {
    const seenRoomIds = new Set();
    const candidates = [];
    for (const item of Array.isArray(items) ? items : []) {
      const rid = String(item?.rid || "");
      if (!/^\d+$/.test(rid) || seenRoomIds.has(rid)) continue;
      seenRoomIds.add(rid);
      candidates.push({
        rid,
        rbId: Number(item?.rbId) || 0,
        rbType: Number(item?.rbType) || 0,
        sourceIndex: candidates.length
      });
      if (candidates.length >= limit) break;
    }
    return candidates;
  };
  const createRequestError = (message, kind = "transport", details = {}) => Object.assign(
    new Error(message),
    { kind, ...details }
  );
  const readDocumentCookie = (pageWindow, cookieName) => {
    const cookieText = String(pageWindow?.document?.cookie || "");
    const item = cookieText.split(";").map((part) => part.trim()).find(
      (part) => part.startsWith(`${cookieName}=`)
    );
    if (!item) return "";
    const value = item.slice(cookieName.length + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };
  const readEmbeddedCsrfConfig = (pageWindow) => {
    const scripts = Array.from(pageWindow?.document?.scripts || []);
    const source = scripts.map((script) => script.textContent || "").filter((text) => /(?:cookie_pre|["']?tvk["']?\s*:|["']?tn["']?\s*:)/.test(text)).join("\n");
    return extractDouyuCsrfConfig(source);
  };
  const isCompleteCsrfConfig = (config) => Boolean(config?.fieldName && config?.cookieName);
  const DouyuAPI = {
    getPageWindow() {
      if (typeof _unsafeWindow !== "undefined" && _unsafeWindow?.fetch) return _unsafeWindow;
      return window;
    },
    async pageFetchJson(path, options = {}) {
      const pageWindow = this.getPageWindow();
      const { timeout = 1e4, ...fetchOptions } = options;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await pageWindow.fetch.call(pageWindow, path, {
          credentials: "include",
          ...fetchOptions,
          signal: controller.signal
        });
        const text = await response.text();
        let payload;
        try {
          payload = JSON.parse(text);
        } catch {
          throw createRequestError("斗鱼接口返回了非 JSON 响应", "protocol", {
            httpStatus: response.status
          });
        }
        if (!response.ok) {
          throw createRequestError(`斗鱼接口 HTTP ${response.status}`, "transport", {
            httpStatus: response.status,
            payload
          });
        }
        return payload;
      } catch (error) {
        if (error?.kind) throw error;
        const message = error?.name === "AbortError" ? "斗鱼接口请求超时" : String(error?.message || error);
        throw createRequestError(message, "transport");
      } finally {
        clearTimeout(timeoutId);
      }
    },
    async pageFetchText(path, options = {}) {
      const pageWindow = this.getPageWindow();
      const { timeout = 15e3, ...fetchOptions } = options;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await pageWindow.fetch.call(pageWindow, path, {
          credentials: "include",
          ...fetchOptions,
          signal: controller.signal
        });
        const text = await response.text();
        if (!response.ok) {
          throw createRequestError(`斗鱼页面 HTTP ${response.status}`, "transport", {
            httpStatus: response.status
          });
        }
        return { text, url: response.url || String(path), status: response.status };
      } catch (error) {
        if (error?.kind) throw error;
        const message = error?.name === "AbortError" ? "斗鱼页面请求超时" : String(error?.message || error);
        throw createRequestError(message, "transport");
      } finally {
        clearTimeout(timeoutId);
      }
    },
    async resolveRoomIdentity(roomId) {
      const inputRoomId = String(roomId || "").trim();
      if (!/^\d+$/.test(inputRoomId)) {
        throw createRequestError("控制室房间号必须是纯数字", "protocol");
      }
      const { text, url } = await this.pageFetchText(`/${inputRoomId}`, { method: "GET" });
      const realRoomId = text.match(/window\.room_id\s*=\s*(\d+)/)?.[1] || "";
      const canonicalTag = text.match(/<link\b[^>]*\brel=["'][^"']*canonical[^"']*["'][^>]*>/i)?.[0] || "";
      const canonicalUrl = canonicalTag.match(/\bhref=["']([^"']+)/i)?.[1] || "";
      const getPathRoomId = (value) => {
        try {
          return new URL(value, window.location.origin).pathname.match(/^\/(\d+)\/?$/)?.[1] || "";
        } catch {
          return "";
        }
      };
      const controlRoomId = getPathRoomId(canonicalUrl) || getPathRoomId(url) || inputRoomId;
      if (!realRoomId) {
        throw createRequestError("未能从直播间页面解析真实 RID", "protocol");
      }
      return { controlRoomId, realRoomId };
    },
    async getDynamicCsrf() {
      const pageWindow = this.getPageWindow();
      const embedded = readEmbeddedCsrfConfig(pageWindow);
      if (isCompleteCsrfConfig(embedded)) {
        _GM_setValue(CSRF_CONFIG_KEY, embedded);
      }
      const config = isCompleteCsrfConfig(embedded) ? embedded : _GM_getValue(CSRF_CONFIG_KEY, {});
      const fieldName = String(config?.fieldName || "");
      const cookieName = String(config?.cookieName || "");
      if (!fieldName || !cookieName) {
        throw createRequestError("当前页及共享缓存中没有动态 CSRF 配置", "auth");
      }
      let token = readDocumentCookie(pageWindow, cookieName);
      if (!token) {
        await this.pageFetchJson(CSRF_COOKIE_PATH, { method: "GET" });
        token = readDocumentCookie(pageWindow, cookieName);
      }
      if (!token) {
        throw createRequestError("动态 CSRF Cookie 不可用", "auth");
      }
      return { fieldName, token };
    },
    cachePageCsrfConfig() {
      const embedded = readEmbeddedCsrfConfig(this.getPageWindow());
      if (!isCompleteCsrfConfig(embedded)) return false;
      _GM_setValue(CSRF_CONFIG_KEY, embedded);
      return true;
    },
    async getRoomRedBags(rid, options = {}) {
      const payload = await this.pageFetchJson(
        `${RED_BAG_ROOM_LIST_PATH}?rid=${encodeURIComponent(rid)}`,
        { method: "GET", timeout: options.timeout }
      );
      if (Number(payload?.error) !== 0 || !Array.isArray(payload?.data?.redBagList)) {
        throw createRequestError(
          String(payload?.msg || "红包列表响应结构异常"),
          "protocol",
          { businessError: payload?.error }
        );
      }
      return { ...payload.data, receivedAt: Date.now() };
    },
    async rankSquareCandidates(candidates) {
      const probes = await mapWithConcurrency(
        candidates,
        SETTINGS.API_ROOM_PROBE_CONCURRENCY,
        async (candidate) => {
          try {
            const roomData = await this.getRoomRedBags(candidate.rid, {
              timeout: SETTINGS.API_ROOM_PROBE_TIMEOUT
            });
            const bag = selectActiveRedBag({
              redBagList: roomData.redBagList,
              roomId: candidate.rid
            });
            if (!bag) return { candidate, state: "stale", bag: null };
            return { candidate, state: "ranked", bag };
          } catch (error) {
            return { candidate, state: "unverified", bag: null, error };
          }
        }
      );
      const ranked = probes.filter((probe) => probe.state === "ranked");
      ranked.sort((left, right) => {
        const prizeOrder = compareRedBagPrizeValue(left.bag, right.bag);
        if (prizeOrder !== 0) return prizeOrder;
        if (left.bag.waitSec !== right.bag.waitSec) return left.bag.waitSec - right.bag.waitSec;
        return left.candidate.sourceIndex - right.candidate.sourceIndex;
      });
      const unverified = probes.filter((probe) => probe.state === "unverified");
      const staleCount = probes.length - ranked.length - unverified.length;
      Utils.log(
        `[房间优选] 已探测 ${probes.length} 个候选：有效 ${ranked.length}，已失效 ${staleCount}，查询失败 ${unverified.length}。`
      );
      if (ranked[0]) {
        const pool = summarizeRedBagPrizePool(ranked[0].bag);
        Utils.log(
          `[房间优选] 当前最高奖池房间 ${ranked[0].candidate.rid}：金币 ${pool.coins}，星光棒 ${pool.starlight}，总量 ${pool.total}，等待 ${ranked[0].bag.waitSec} 秒。`
        );
      }
      return [...ranked, ...unverified].map((probe) => `https://www.douyu.com/${probe.candidate.rid}`);
    },
    async snatchRedBag({ rid, id, code }) {
      if (!rid || !id || !code) {
        throw createRequestError("红包身份参数不完整", "protocol");
      }
      const { fieldName, token } = await this.getDynamicCsrf();
      const body = new URLSearchParams({
        code: String(code),
        id: String(id),
        rid: String(rid),
        [fieldName]: token
      });
      return this.pageFetchJson(RED_BAG_SNATCH_PATH, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: body.toString()
      });
    },
getRoomPool() {
      const pool = _GM_getValue(ROOM_POOL_KEY, []);
      return Array.isArray(pool) ? pool : [];
    },
setRoomPool(pool) {
      _GM_setValue(ROOM_POOL_KEY, Array.isArray(pool) ? pool : []);
    },
getRoomIdFromUrl(url) {
      if (!url || typeof url !== "string") return null;
      return url.match(/\/(\d+)/)?.[1] || null;
    },
async acquireRoomPoolLock() {
      while (_GM_getValue(ROOM_POOL_LOCK_KEY, false)) {
        await Utils.sleep(20);
      }
      _GM_setValue(ROOM_POOL_LOCK_KEY, true);
    },
releaseRoomPoolLock() {
      _GM_setValue(ROOM_POOL_LOCK_KEY, false);
    },
async getRoom(count, rid, retries = SETTINGS.API_RETRY_COUNT) {
      this.cachePageCsrfConfig();
      const consumeFromPool = () => {
        const uniquePool = Array.from(new Set(this.getRoomPool()));
        if (uniquePool.length === 0) {
          this.setRoomPool(uniquePool);
          return null;
        }
        const [url] = uniquePool.splice(0, 1);
        this.setRoomPool(uniquePool);
        return url || null;
      };
      await this.acquireRoomPoolLock();
      try {
        const cachedUrl = consumeFromPool();
        if (cachedUrl) {
          Utils.log(`[房间池] 命中缓存URL: ${cachedUrl}`);
          return cachedUrl;
        }
      } finally {
        this.releaseRoomPoolLock();
      }
      const fetchedRooms = await this.getRooms(count, rid, retries);
      await this.acquireRoomPoolLock();
      try {
        const mergedPool = Array.from(
new Set([...this.getRoomPool(), ...fetchedRooms])
        );
        this.setRoomPool(mergedPool);
        const nextUrl = consumeFromPool();
        if (nextUrl) {
          Utils.log(`[房间池] 拉取后消费URL: ${nextUrl}`);
          return nextUrl;
        }
        Utils.log("[房间池] 拉取后仍无可用URL。");
        return null;
      } finally {
        this.releaseRoomPoolLock();
      }
    },
getRooms(count, rid, retries = SETTINGS.API_RETRY_COUNT) {
      return new Promise((resolve, reject) => {
        const attempt = (remainingTries) => {
          Utils.log(`开始调用 API 获取房间列表... (剩余重试次数: ${remainingTries})`);
          _GM_xmlhttpRequest({
            method: "GET",
            url: `${SETTINGS.API_URL}?rid=${rid}`,
            headers: {
              Referer: "https://www.douyu.com/",
              "User-Agent": navigator.userAgent
            },
            responseType: "json",
            timeout: 1e4,
            onload: (response) => {
              if (response.status === 200 && response.response?.error === 0 && Array.isArray(response.response.data?.redBagList)) {
                const candidates = normalizeSquareCandidates(
                  response.response.data.redBagList,
                  count * 2
                );
                this.rankSquareCandidates(candidates).then((rooms) => {
                  Utils.log(`API 成功返回并排序 ${rooms.length} 个房间URL。`);
                  resolve(rooms);
                }).catch((error) => {
                  Utils.log(`候选房间奖池排序失败，保留 square/list 原顺序: ${error.message}`);
                  resolve(candidates.map((item) => `https://www.douyu.com/${item.rid}`));
                });
              } else {
                const errorMsg = `API 数据格式错误或失败: ${response.response?.msg || "未知错误"}`;
                Utils.log(errorMsg);
                if (remainingTries > 0) retry(remainingTries - 1, errorMsg);
                else reject(new Error(errorMsg));
              }
            },
            onerror: (error) => {
              const errorMsg = `API 请求网络错误: ${error.statusText || "未知"}`;
              Utils.log(errorMsg);
              if (remainingTries > 0) retry(remainingTries - 1, errorMsg);
              else reject(new Error(errorMsg));
            },
            ontimeout: () => {
              const errorMsg = "API 请求超时";
              Utils.log(errorMsg);
              if (remainingTries > 0) retry(remainingTries - 1, errorMsg);
              else reject(new Error(errorMsg));
            }
          });
        };
        const retry = (remainingTries, reason) => {
          Utils.log(`${reason}，将在 ${SETTINGS.API_RETRY_DELAY / 1e3} 秒后重试...`);
          setTimeout(() => attempt(remainingTries), SETTINGS.API_RETRY_DELAY);
        };
        attempt(retries);
      });
    },
async getCoinRecord(current, count, retries = SETTINGS.API_RETRY_COUNT) {
      const query2 = new URLSearchParams({
        current: String(Math.max(1, Number(current) || 1)),
        pageSize: String(Math.min(100, Math.max(10, Number(count) || 20)))
      });
      const requestUrl = `${SETTINGS.COIN_LIST_URL}?${query2.toString()}`;
      const retryCount = Math.max(0, Number(retries) || 0);
      for (let attempt = 0; attempt <= retryCount; attempt += 1) {
        const remainingTries = retryCount - attempt;
        Utils.log(`开始调用 API 获取金币历史列表... (剩余重试次数: ${remainingTries})`);
        try {
          const payload = await this.pageFetchJson(requestUrl, { method: "GET" });
          const businessError = Number(payload?.error);
          if (businessError !== 0) {
            throw createRequestError(
              String(payload?.msg || "金币记录接口返回失败"),
              businessError === -9 ? "auth" : "business",
              { businessError }
            );
          }
          if (!Array.isArray(payload?.data?.list)) {
            throw createRequestError("金币记录响应结构异常", "protocol");
          }
          const coinListData = payload.data.list.filter(
            (item) => Number(item?.opDirection) === 1 && String(item?.remark || "").includes("红包")
          );
          Utils.log(`API 成功返回 ${coinListData.length} 个红包记录。`);
          return coinListData;
        } catch (error) {
          if (error?.kind !== "transport" || remainingTries === 0) throw error;
          Utils.log(
            `${error.message}，将在 ${SETTINGS.API_RETRY_DELAY / 1e3} 秒后重试...`
          );
          await Utils.sleep(SETTINGS.API_RETRY_DELAY);
        }
      }
      return [];
    }
  };
  const SettingsPanel = {
show() {
      const modal = document.getElementById("qmx-settings-modal");
      modal.innerHTML = settingsPanelTemplate(SETTINGS);
      activateCustomSelects(modal);
      this.bindPanelEvents(modal);
      document.getElementById("qmx-modal-backdrop").classList.add("visible");
      modal.classList.add("visible");
      document.body.classList.add("qmx-modal-open-scroll-lock");
      this.updateSaveButtonState();
    },
hide() {
      const modal = document.getElementById("qmx-settings-modal");
      modal.classList.remove("visible");
      document.body.classList.remove("qmx-modal-open-scroll-lock");
      if (SETTINGS.MODAL_DISPLAY_MODE !== "centered" || !document.getElementById("qmx-modal-container").classList.contains("visible")) {
        document.getElementById("qmx-modal-backdrop").classList.remove("visible");
      }
    },
getSettingsFromUI() {
      return {
CONTROL_ROOM_ID: document.getElementById("setting-control-room-id").value,
        ROOM_PREWARM_DURATION: Math.round(
          Math.min(15, Math.max(0.5, Number(document.getElementById("setting-prewarm-duration").value) || 3)) * 1e3
        ),
        DAILY_LIMIT_ACTION: document.getElementById("setting-daily-limit-action").value,
        MODAL_DISPLAY_MODE: document.getElementById("setting-modal-mode").value,
...{}
      };
    },
updateSaveButtonState() {
      const newSettings = this.getSettingsFromUI();
      const saveBtn = document.getElementById("qmx-settings-save-btn");
      if (saveBtn) {
        saveBtn.textContent = "保存";
        if (saveBtn.dataset.state !== "saving") {
          delete saveBtn.dataset.state;
          saveBtn.removeAttribute("title");
        }
      }
      return { newSettings };
    },
async save() {
      const { newSettings } = this.updateSaveButtonState();
      const saveBtn = document.getElementById("qmx-settings-save-btn");
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.dataset.state = "saving";
        saveBtn.title = "正在保存";
      }
      try {
        const enteredRoomId = String(newSettings.CONTROL_ROOM_ID || "").trim();
        const mappingIsCurrent = enteredRoomId === String(SETTINGS.CONTROL_ROOM_RESOLVED_FROM || "") && Boolean(SETTINGS.TEMP_CONTROL_ROOM_RID);
        if (mappingIsCurrent) {
          newSettings.TEMP_CONTROL_ROOM_RID = SETTINGS.TEMP_CONTROL_ROOM_RID;
          newSettings.CONTROL_ROOM_RESOLVED_FROM = SETTINGS.CONTROL_ROOM_RESOLVED_FROM;
        } else {
          const identity = await DouyuAPI.resolveRoomIdentity(enteredRoomId);
          newSettings.CONTROL_ROOM_ID = identity.controlRoomId;
          newSettings.TEMP_CONTROL_ROOM_RID = identity.realRoomId;
          newSettings.CONTROL_ROOM_RESOLVED_FROM = identity.controlRoomId;
        }
        SettingsManager.update(newSettings);
      } catch (error) {
        Utils.log(`[设置] 控制室房间号校验失败: ${String(error?.message || error)}`);
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.dataset.state = "error";
          saveBtn.title = "控制室校验失败";
          setTimeout(() => {
            delete saveBtn.dataset.state;
            saveBtn.removeAttribute("title");
          }, 1400);
        }
        return;
      }
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.dataset.state = "saved";
        saveBtn.title = "已保存";
        setTimeout(() => {
          this.hide();
        }, 600);
      } else {
        this.hide();
      }
    },
bindPanelEvents(modal) {
      modal.querySelector("#qmx-settings-cancel-btn").onclick = () => this.hide();
      modal.querySelector("#qmx-settings-save-btn").onclick = () => void this.save();
      modal.querySelector("#qmx-settings-reset-btn").onclick = () => {
        if (confirm("确定要恢复所有默认设置吗？此操作会刷新页面。")) {
          SettingsManager.reset();
          window.location.reload();
        }
      };
      const inputs = modal.querySelectorAll("input, select");
      inputs.forEach((input) => {
        input.addEventListener("change", () => this.updateSaveButtonState());
        input.addEventListener("input", () => this.updateSaveButtonState());
      });
      const customOptions = modal.querySelectorAll(".qmx-select-options div");
      customOptions.forEach((opt) => {
        opt.addEventListener("click", () => {
          setTimeout(() => this.updateSaveButtonState(), 10);
        });
      });
      modal.querySelectorAll(".tab-link").forEach((button) => {
        button.onclick = (e) => {
          const tabId = e.target.dataset.tab;
          modal.querySelector(".tab-link.active")?.classList.remove("active");
          modal.querySelector(".tab-content.active")?.classList.remove("active");
          e.target.classList.add("active");
          modal.querySelector(`#tab-${tabId}`).classList.add("active");
        };
      });
    }
  };
  const FirstTimeNotice = {
showFirstUseNotice() {
      const NOTICE_SHOWN_KEY = "douyu_qmx_first_use_notice_v2_1_shown";
      const hasShownNotice = _GM_getValue(NOTICE_SHOWN_KEY, false);
      if (!hasShownNotice) {
        const noticeHTML = `
                <div class="qmx-modal-header">
                    <h3>使用说明</h3>
                    <button id="qmx-notice-close-btn" class="qmx-modal-close-icon" title="关闭"></button>
                </div>
                <div class="qmx-modal-content">
                    <h4 style="color: var(--status-color-error, #f44336); margin-top: 0;">账号风险提示</h4>
                    <p><strong>自动领取很可能触发斗鱼活动风控，即使领取数量不多也可能被限制。</strong>风控提示只负责提醒，不会自动停止领取。</p>

                    <h4 style="color: var(--status-color-success, #4CAF50); margin-top: 0;">星推荐领取方式</h4>
                    <p>领取任务由控制页统一执行，工作直播间只用于获取必要信息，不需要持续保留：</p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>脚本会在后台短暂打开候选直播间，完成初始化后自动关闭</li>
                        <li>控制页根据红包等待时长安排最多 5 次领取请求</li>
                        <li>红包是否可领以斗鱼接口响应为准，不依赖页面倒计时和模拟点击</li>
                    </ul>

                    <h4 style="color: var(--accent-color, #ff6b6b);">使用前确认</h4>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>请保持控制室页面登录斗鱼账号</li>
                        <li>如出现鉴权失败，请先检查登录状态和油猴脚本权限</li>
                        <li>控制室房间号可在设置中修改，真实 RID 会自动关联，不需要手动填写</li>
                    </ul>

                    <h4 style="margin-bottom: 5px;">⭐️点点star吧~</h4>
                    <p style="margin-top: 5px;">项目地址：<a href="https://github.com/ienone/douyu-qmx-pro" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color, #ff6b6b);">douyu-qmx-pro</a>，觉得好用请给个star🌟~~</p>
                </div>
                <div class="qmx-modal-footer">
                    <button id="qmx-notice-settings-btn" class="qmx-modal-btn">前往设置</button>
                    <button id="qmx-notice-ok-btn" class="qmx-modal-btn primary">我知道了</button>
                </div>
            `;
        const noticeContainer = document.createElement("div");
        noticeContainer.id = "qmx-notice-modal";
        noticeContainer.className = "visible mode-centered";
        noticeContainer.innerHTML = noticeHTML;
        const backdrop = document.createElement("div");
        backdrop.id = "qmx-notice-backdrop";
        backdrop.className = "visible";
        document.body.appendChild(backdrop);
        document.body.appendChild(noticeContainer);
        const closeNotice = () => {
          noticeContainer.classList.remove("visible");
          backdrop.classList.remove("visible");
          setTimeout(() => {
            noticeContainer.remove();
            backdrop.remove();
          }, 300);
          _GM_setValue(NOTICE_SHOWN_KEY, true);
        };
        document.getElementById("qmx-notice-close-btn").onclick = closeNotice;
        document.getElementById("qmx-notice-ok-btn").onclick = closeNotice;
        document.getElementById("qmx-notice-settings-btn").onclick = () => {
          closeNotice();
          SettingsPanel.show();
        };
      }
    }
  };
  const STORAGE_KEY = "douyu_qmx_claim_events_v1";
  const LOCK_KEY = "douyu_qmx_claim_events_lock";
  const MAX_EVENTS = 2e3;
  const RETENTION_MS = 30 * 24 * 60 * 60 * 1e3;
  const readEvents = () => {
    const value = _GM_getValue(STORAGE_KEY, []);
    return Array.isArray(value) ? value : [];
  };
  const prune = (events, now = Date.now()) => events.filter((event) => Number(event.timestamp) >= now - RETENTION_MS).sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, MAX_EVENTS);
  const getAttemptKey = (event) => {
    if (event.bagKey) return String(event.bagKey);
    if (event.bagId !== void 0 && event.bagId !== null && event.bagId !== "") {
      return `${String(event.roomId || "unknown")}:${String(event.bagId)}`;
    }
    return String(event.id || `legacy-${event.timestamp}-${Math.random()}`);
  };
  const ClaimEventStore = {
    record(event) {
      const payload = {
        id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        result: "unknown",
        ...event
      };
      const commit = () => {
        if (_GM_getValue(LOCK_KEY, false)) {
          setTimeout(commit, 40);
          return;
        }
        _GM_setValue(LOCK_KEY, true);
        try {
          _GM_setValue(STORAGE_KEY, prune([payload, ...readEvents()]));
        } finally {
          _GM_setValue(LOCK_KEY, false);
        }
        window.dispatchEvent(new CustomEvent("qmx-claim-event", { detail: payload }));
      };
      commit();
      return payload;
    },
    list({ days = 30 } = {}) {
      const threshold = Date.now() - Math.max(1, days) * 24 * 60 * 60 * 1e3;
      return prune(readEvents()).filter((event) => Number(event.timestamp) >= threshold);
    },
    summarize({ days = 7 } = {}) {
      const events = this.list({ days });
      const attemptMap = events.filter((event) => event.phase === "claim").reduce((map, event) => {
        const key = getAttemptKey(event);
        const attempt = map.get(key) || { key, events: [] };
        attempt.events.push(event);
        map.set(key, attempt);
        return map;
      }, new Map());
      const attemptList = Array.from(attemptMap.values());
      const successfulAttempts = attemptList.filter(
        (attempt) => attempt.events.some((event) => event.result === "success")
      );
      const success = successfulAttempts.length;
      const attempts = attemptList.length;
      const byResult = events.reduce((acc, event) => {
        acc[event.result] = (acc[event.result] || 0) + 1;
        return acc;
      }, {});
      const successBySource = successfulAttempts.reduce((acc, attempt) => {
        const successEvent = attempt.events.find((event) => event.result === "success");
        const source = String(successEvent?.source || "legacy");
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});
      return {
        events,
        success,
        attempts,
        successRate: attempts ? Math.round(success / attempts * 100) : 0,
        byResult,
        successBySource
      };
    }
  };
  const runtimeSettings = SETTINGS;
  const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
  const RESULT_META = {
    success: { label: "领取成功", tone: "success" },
    empty_or_failed: { label: "空包或失败", tone: "warning" },
    open_failed: { label: "打开失败", tone: "error" },
    exhausted: { label: "红包已派完", tone: "idle" },
    already_claimed: { label: "已经领取", tone: "idle" },
    auth_failed: { label: "鉴权失败", tone: "error" },
    daily_limit: { label: "达到上限", tone: "idle" },
    risk_suspected: { label: "疑似风控", tone: "error" },
    unknown: { label: "其他", tone: "idle" }
  };
  const EXCEPTION_LOG_RESULTS = new Set([
    "empty_or_failed",
    "open_failed",
    "auth_failed",
    "risk_suspected",
    "unknown"
  ]);
  const state = {
    initialized: false,
    days: 7,
    period: "daily",
    logMode: "all",
    claimHandler: null,
    visibilityHandler: null,
    remoteRefreshPromise: null,
    postClaimRefreshTimer: null
  };
  const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const getRewardHistory = () => {
    const history = _GM_getValue(runtimeSettings.STATS_INFO_STORAGE_KEY, {});
    return history && typeof history === "object" ? history : {};
  };
  const formatTime = (timestamp) => new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date(timestamp));
  const formatNumber = (value) => new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
  const getEventDate = (event) => Utils.formatDateAsBeijing(new Date(event.timestamp));
  const getDateRange = (days) => Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.now() - (days - index - 1) * 864e5);
    return Utils.formatDateAsBeijing(date);
  });
  const getSuccessfulClaimCount = (events) => {
    const keys = new Set();
    events.filter((event) => event.result === "success").forEach((event) => {
      const key = event.bagKey || (event.bagId !== void 0 ? `${event.roomId || "unknown"}:${event.bagId}` : event.id || `legacy:${event.timestamp}`);
      keys.add(String(key));
    });
    return keys.size;
  };
  const getRewardTotals = (events) => events.reduce((totals, event) => {
    if (event.result !== "success" || !event.rewards) return totals;
    const coins = Number(event.rewards.coins);
    const starlight = Number(event.rewards.starlight);
    if (Number.isFinite(coins)) totals.coins += coins;
    if (Number.isFinite(starlight)) totals.starlight += starlight;
    totals.coveredClaims += 1;
    return totals;
  }, { coins: 0, starlight: 0, coveredClaims: 0 });
  const getRewardText = (event) => {
    const coins = Number(event.rewards?.coins) || 0;
    const starlight = Number(event.rewards?.starlight) || 0;
    const parts = [
      coins > 0 ? `金币 ${formatNumber(coins)}` : "",
      starlight > 0 ? `星光棒 ${formatNumber(starlight)}` : ""
    ].filter(Boolean);
    if (parts.length) return parts.join(" · ");
    if (event.rewardText) return event.rewardText;
    return "未记录奖励详情";
  };
  const StatsInfo = {
    init() {
      if (state.initialized || !document.getElementById("qmx-stats-page")) return;
      state.initialized = true;
      this.bindEvents();
      this.removeExpiredData();
      this.refresh();
    },
    bindEvents() {
      document.querySelectorAll(".qmx-stats-range [data-period]").forEach((button) => {
        button.onclick = () => {
          state.period = button.dataset.period === "weekly" ? "weekly" : "daily";
          state.days = state.period === "weekly" ? 28 : 7;
          document.querySelectorAll(".qmx-stats-range [data-period]").forEach((item) => {
            item.classList.toggle("active", item === button);
          });
          this.refresh();
        };
      });
      document.querySelectorAll(".qmx-stats-log-range [data-log-mode]").forEach((button) => {
        button.onclick = () => {
          state.logMode = button.dataset.logMode === "exceptions" ? "exceptions" : "all";
          document.querySelectorAll(".qmx-stats-log-range [data-log-mode]").forEach((item) => {
            item.classList.toggle("active", item === button);
          });
          this.refresh();
        };
      });
      const refreshButton = document.querySelector(".qmx-stats-refresh");
      if (refreshButton) {
        refreshButton.onclick = async () => {
          refreshButton.classList.remove("rotating");
          void refreshButton.offsetWidth;
          refreshButton.classList.add("rotating");
          await this.refreshFromSources();
          window.setTimeout(() => refreshButton.classList.remove("rotating"), 900);
        };
      }
      state.claimHandler = ((event) => {
        this.refresh();
        const claimEvent = event.detail;
        if (claimEvent?.result !== "success") return;
        if (state.postClaimRefreshTimer) window.clearTimeout(state.postClaimRefreshTimer);
        state.postClaimRefreshTimer = window.setTimeout(() => {
          state.postClaimRefreshTimer = null;
          void this.refreshFromSources();
        }, 2e3);
      });
      state.visibilityHandler = (() => {
        if (document.visibilityState === "visible") this.refresh();
      });
      window.addEventListener("qmx-claim-event", state.claimHandler);
      document.addEventListener("visibilitychange", state.visibilityHandler);
    },
    destroy() {
      if (state.claimHandler) window.removeEventListener("qmx-claim-event", state.claimHandler);
      if (state.visibilityHandler) document.removeEventListener("visibilitychange", state.visibilityHandler);
      state.claimHandler = null;
      state.visibilityHandler = null;
      state.remoteRefreshPromise = null;
      if (state.postClaimRefreshTimer) window.clearTimeout(state.postClaimRefreshTimer);
      state.postClaimRefreshTimer = null;
      state.initialized = false;
    },
    async refreshFromSources() {
      if (!state.initialized) return;
      if (state.remoteRefreshPromise) return state.remoteRefreshPromise;
      state.remoteRefreshPromise = (async () => {
        await this.getCoinListUpdate();
        this.refresh();
      })().finally(() => {
        state.remoteRefreshPromise = null;
      });
      return state.remoteRefreshPromise;
    },
    async getCoinListUpdate() {
      try {
        const coinList = await DouyuAPI.getCoinRecord(1, 100, 3);
        if (!Array.isArray(coinList)) return;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayRecords = coinList.filter((item) => Number(item.createTime) > startOfToday.getTime() / 1e3);
        const total = todayRecords.reduce((sum, item) => sum + (Number(item.balanceDiff) || 0), 0);
        const today = Utils.formatDateAsBeijing( new Date());
        const history = getRewardHistory();
        history[today] = {
          receivedCount: todayRecords.length,
          total,
          avg: todayRecords.length ? Number((total / todayRecords.length).toFixed(2)) : 0
        };
        _GM_setValue(runtimeSettings.STATS_INFO_STORAGE_KEY, history);
      } catch (error) {
        Utils.log(`[数据统计] 金币记录刷新失败: ${getErrorMessage(error)}`);
      }
    },
    refresh() {
      if (!state.initialized) return;
      const summary = ClaimEventStore.summarize({ days: state.days });
      const history = getRewardHistory();
      this.renderSummary(summary, history);
      this.renderTrend(summary.events, history);
      this.renderLogs(summary.events);
    },
    renderSummary(summary, history) {
      const container = document.getElementById("qmx-stats-summary");
      if (!container) return;
      const today = Utils.formatDateAsBeijing( new Date());
      const todayEvents = summary.events.filter((event) => getEventDate(event) === today);
      const localRewards = getRewardTotals(todayEvents);
      const accountReward = history[today] || { receivedCount: 0, total: 0 };
      const todayClaims = Math.max(getSuccessfulClaimCount(todayEvents), accountReward.receivedCount);
      const cards = [
        { value: todayClaims, label: "今日领取", tone: "success" },
        { value: formatNumber(Math.max(accountReward.total, localRewards.coins)), label: "今日金币", tone: "coin" },
        { value: formatNumber(localRewards.starlight), label: "今日星光棒", tone: "starlight" },
        {
          value: `${summary.successRate}%`,
          label: state.period === "weekly" ? "4周成功率" : "7天成功率",
          tone: summary.successRate >= 60 ? "success" : "warning"
        }
      ];
      container.innerHTML = cards.map((card) => `
            <div class="qmx-stat-card" data-tone="${card.tone}">
                <strong>${escapeHtml(card.value)}</strong>
                <span>${escapeHtml(card.label)}</span>
            </div>
        `).join("");
    },
    renderTrend(events, history) {
      const container = document.getElementById("qmx-stats-trend");
      if (!container) return;
      const dates = getDateRange(state.days);
      const dateGroups = state.period === "weekly" ? Array.from({ length: 4 }, (_, index) => dates.slice(index * 7, index * 7 + 7)) : dates.map((date) => [date]);
      const values = dateGroups.map((group) => {
        const dateSet = new Set(group);
        const rewards = getRewardTotals(events.filter((event) => dateSet.has(getEventDate(event))));
        const accountCoins = group.reduce((sum, date) => sum + (Number(history[date]?.total) || 0), 0);
        return {
          coins: Math.max(accountCoins, rewards.coins),
          starlight: rewards.starlight
        };
      });
      const max = Math.max(1, ...values.flatMap((reward) => [reward.coins, reward.starlight]));
      const getHeight = (value) => value > 0 ? Math.max(4, Math.round(value / max * 72)) : 0;
      container.classList.toggle("is-weekly", state.period === "weekly");
      container.innerHTML = dateGroups.map((group, index) => {
        const reward = values[index];
        const firstDate = group[0];
        const lastDate = group[group.length - 1];
        const label = state.period === "weekly" ? `${firstDate.slice(5).replace("-", "/")}–${lastDate.slice(5).replace("-", "/")}` : firstDate.slice(5);
        const title = state.period === "weekly" ? `${firstDate} 至 ${lastDate}` : firstDate;
        return `
            <div class="qmx-trend-column has-label"
                 title="${title}：金币 ${reward.coins}，星光棒 ${reward.starlight}">
                <span class="qmx-trend-values">
                    <b data-reward="coin">${formatNumber(reward.coins)}</b>
                    <b data-reward="starlight">${formatNumber(reward.starlight)}</b>
                </span>
                <span class="qmx-trend-bars">
                    <i data-reward="coin" style="height:${getHeight(reward.coins)}px"></i>
                    <i data-reward="starlight" style="height:${getHeight(reward.starlight)}px"></i>
                </span>
                <small>${label}</small>
            </div>
        `;
      }).join("");
    },
    renderLogs(events) {
      const container = document.getElementById("qmx-stats-timeline");
      const details = document.getElementById("qmx-stats-diagnostics");
      const count = document.getElementById("qmx-stats-diagnostic-count");
      const label = document.getElementById("qmx-stats-log-label");
      if (!container || !details || !count || !label) return;
      const claimEvents = events.filter((event) => event.phase === "claim");
      const logs = state.logMode === "exceptions" ? claimEvents.filter((event) => EXCEPTION_LOG_RESULTS.has(event.result)) : claimEvents;
      const hasExceptions = logs.some((event) => EXCEPTION_LOG_RESULTS.has(event.result));
      details.dataset.tone = hasExceptions ? "warning" : "stable";
      label.textContent = state.logMode === "exceptions" ? "异常记录" : "领取记录";
      count.textContent = String(logs.length);
      if (logs.length === 0) {
        container.innerHTML = '<div class="qmx-stats-empty"><i></i></div>';
        return;
      }
      container.innerHTML = logs.slice(0, 12).map((event) => {
        const meta = RESULT_META[event.result] || RESULT_META.unknown;
        const roomLabel = event.roomName ? `${event.roomName}${event.roomId ? ` · ${event.roomId}` : ""}` : event.roomId ? `房间 ${event.roomId}` : "未知直播间";
        const context = event.result === "success" ? getRewardText(event) : event.reason || meta.label;
        return `
                <div class="qmx-timeline-row" data-tone="${meta.tone}">
                    <i></i>
                    <time datetime="${new Date(event.timestamp).toISOString()}">${formatTime(event.timestamp)}</time>
                    <span>
                        <b title="${escapeHtml(roomLabel)}">${escapeHtml(roomLabel)}</b>
                        <small title="${escapeHtml(context)}">${escapeHtml(context)}</small>
                    </span>
                    <em>${escapeHtml(meta.label)}</em>
                </div>
            `;
      }).join("");
    },
    removeExpiredData() {
      const history = getRewardHistory();
      const cutoff = Date.now() - 30 * 864e5;
      const retained = Object.fromEntries(Object.entries(history).filter(([date]) => {
        const timestamp = ( new Date(`${date}T00:00:00+08:00`)).getTime();
        return Number.isFinite(timestamp) && timestamp >= cutoff;
      }));
      _GM_setValue(runtimeSettings.STATS_INFO_STORAGE_KEY, retained);
    }
  };
  const closeTabHandle = (tab) => {
    try {
      tab?.close?.();
    } catch (error) {
      Utils.log(`[PageLoader] 关闭短时工作页失败: ${String(error?.message || error)}`);
    }
  };
  const PageLoader = {
openPrewarmTab(url) {
      if (!url || typeof url !== "string") {
        throw new Error("短时工作页 URL 无效");
      }
      const targetUrl = new URL(url, "https://www.douyu.com");
      targetUrl.searchParams.set("qmxPrewarm", "1");
      const tab = _GM_openInTab(targetUrl.href, { active: false, setParent: true });
      const openedAt = Date.now();
      const roomId = url.match(/\/(\d+)/)?.[1] || null;
      let closed = false;
      Utils.log(`[PageLoader] 已后台打开短时工作页: ${url}`);
      return {
        url: targetUrl.href,
        roomId,
        openedAt,
        close() {
          if (closed) return;
          closed = true;
          closeTabHandle(tab);
          Utils.log(`[PageLoader] 已关闭短时工作页: ${url}`);
        }
      };
    }
  };
  const MAX_DISCOVERY_ATTEMPTS = 6;
  const MAX_CONSECUTIVE_FAILURES = 3;
  const ACCOUNT_RISK_THRESHOLD = 3;
  const tasks = new Map();
  const roomTaskIds = new Map();
  const activeBagKeys = new Set();
  const completedBagKeys = new Set();
  let taskSequence = 0;
  const cancelAllTasks = () => {
    for (const task of tasks.values()) {
      task.cancelled = true;
      task.prewarm?.close();
    }
    tasks.clear();
    roomTaskIds.clear();
    activeBagKeys.clear();
    const state2 = GlobalState.get();
    state2.tasks = {};
    GlobalState.set(state2);
  };
  const randomDelay = (min, max) => Utils.getRandomDelay(
    Math.max(0, Number(min) || 0),
    Math.max(Number(min) || 0, Number(max) || 0)
  );
  const waitForTask = async (task, durationMs) => {
    const deadline = Date.now() + Math.max(0, durationMs);
    while (!task.cancelled && Date.now() < deadline) {
      await Utils.sleep(Math.min(250, deadline - Date.now()));
    }
    return !task.cancelled;
  };
  const getNextBeijingDayDelay = () => {
    const now = Date.now();
    const beijingNow = new Date(now + 8 * 60 * 60 * 1e3);
    const resetAt = Date.UTC(
      beijingNow.getUTCFullYear(),
      beijingNow.getUTCMonth(),
      beijingNow.getUTCDate() + 1,
      0,
      0,
      30
    ) - 8 * 60 * 60 * 1e3;
    return Math.max(0, resetAt - now);
  };
  const recordTerminal = (binding, result, details = {}) => ClaimEventStore.record({
    roomId: binding.bag.rid,
    roomName: binding.roomName,
    bagId: binding.bag.id,
    bagKey: binding.key,
    phase: "claim",
    result,
    source: "snatch",
    ...details
  });
  const releaseCandidate = (task, binding, { removeState = true } = {}) => {
    activeBagKeys.delete(binding.key);
    completedBagKeys.add(binding.key);
    if (task.currentRoomId) {
      roomTaskIds.delete(task.currentRoomId);
      if (removeState) GlobalState.removeTask(task.currentRoomId);
    }
    task.currentRoomId = null;
    task.prewarm = null;
  };
  const discoverCandidate = async (task) => {
    for (let attempt = 0; attempt < MAX_DISCOVERY_ATTEMPTS && !task.cancelled; attempt += 1) {
      const currentRid = task.currentRoomId || SETTINGS.CONTROL_ROOM_ID;
      const url = await DouyuAPI.getRoom(SETTINGS.API_ROOM_FETCH_COUNT, currentRid, 0);
      if (!url) return null;
      const roomId = url.match(/\/(\d+)/)?.[1];
      if (!roomId || roomTaskIds.has(roomId)) continue;
      try {
        const roomData = await DouyuAPI.getRoomRedBags(roomId);
        const bag = selectActiveRedBag({
          redBagList: roomData.redBagList,
          roomId,
          completedKeys: completedBagKeys
        });
        if (!bag) continue;
        const bagKey = getRedBagKey(bag, roomId);
        if (activeBagKeys.has(bagKey)) continue;
        return { url, roomId, roomData, bag };
      } catch (error) {
        Utils.claimLog("SNATCH", "候选红包确认失败", {
          roomId,
          reason: String(error?.message || error)
        });
      }
    }
    return null;
  };
  const refreshTerminalRoomState = async (binding) => {
    try {
      const roomData = await DouyuAPI.getRoomRedBags(binding.bag.rid);
      const sameBag = roomData.redBagList.find(
        (bag) => getRedBagKey(bag, binding.bag.rid) === binding.key
      );
      return sameBag ? Number(sameBag.status) : null;
    } catch {
      return null;
    }
  };
  const claimBoundBag = async (task, binding, openedAt) => {
    const attemptOffsets = getSnatchAttemptOffsets(binding.bag.waitSec);
    let consecutiveFailures = 0;
    let attemptCount = 0;
    let notReadyCount = 0;
    let lastAttemptAt = 0;
    Utils.claimLog("SNATCH", "短时开页完成，等待首次领取", {
      roomId: binding.bag.rid,
      bagId: binding.bag.id,
      intervalMs: attemptOffsets[0]
    });
    for (const offsetMs of attemptOffsets) {
      if (task.cancelled) return { stop: true };
      const nextAttemptAt = Math.max(openedAt + offsetMs, lastAttemptAt + 1e4);
      GlobalState.updateTask(binding.bag.rid, "WAITING", "倒计时", {
        countdown: { endTime: nextAttemptAt },
        prizes: toDisplayPrizes(binding.bag.prizeList),
        claimSource: "snatch",
        bagId: binding.bag.id
      });
      if (!await waitForTask(task, nextAttemptAt - Date.now())) return { stop: true };
      const requestedAt = Date.now();
      lastAttemptAt = requestedAt;
      GlobalState.updateTask(binding.bag.rid, "CLAIMING", "请求可领取状态", {
        countdown: null,
        prizes: toDisplayPrizes(binding.bag.prizeList),
        claimSource: "snatch",
        bagId: binding.bag.id
      });
      try {
        attemptCount += 1;
        const response = await DouyuAPI.snatchRedBag(binding.bag);
        const outcome = classifySnatchResponse(response);
        consecutiveFailures = outcome === SNATCH_OUTCOME.UNKNOWN ? consecutiveFailures + 1 : 0;
        Utils.claimLog("SNATCH", "控制页领取响应", {
          roomId: binding.bag.rid,
          bagId: binding.bag.id,
          result: outcome,
          error: response?.error,
          msg: response?.msg,
          durationMs: requestedAt - openedAt
        });
        if (outcome === SNATCH_OUTCOME.SUCCESS) {
          const prizes = toDisplayPrizes(response?.data?.prizeList);
          const rewards = summarizePrizePool(response?.data?.prizeList);
          const rewardText = [
            rewards.coins > 0 ? `金币 ${rewards.coins}` : "",
            rewards.starlight > 0 ? `星光棒 ${rewards.starlight}` : ""
          ].filter(Boolean).join("、") || "未获得奖励";
          recordTerminal(binding, "success", {
            durationMs: Date.now() - openedAt,
            rewardText,
            rewards
          });
          Utils.claimLog("SNATCH", "领取结果已确认", {
            roomId: binding.bag.rid,
            bagId: binding.bag.id,
            rewardText
          });
          GlobalState.updateTask(binding.bag.rid, "SUCCESS", "领取成功", {
            countdown: null,
            prizes,
            claimSource: "snatch",
            bagId: binding.bag.id
          });
          await waitForTask(task, 1500);
          return { result: "success" };
        }
        if (outcome === SNATCH_OUTCOME.EXHAUSTED) {
          const details = {
            error: response?.error,
            reason: String(response?.msg || "红包已派完"),
            attemptCount,
            notReadyCount
          };
          const riskCount = Number(response?.error) === 12001 && attemptCount === 1 ? countConsecutiveImmediate12001([{
            timestamp: Date.now(),
            phase: "claim",
            result: "exhausted",
            bagKey: binding.key,
            ...details
          }, ...ClaimEventStore.list({ days: 1 })]) : 0;
          if (riskCount >= ACCOUNT_RISK_THRESHOLD) {
            recordTerminal(binding, "risk_suspected", details);
            GlobalState.setAccountRisk(true, {
              count: riskCount,
              expiresAt: Date.now() + getNextBeijingDayDelay()
            });
            Utils.claimLog("SNATCH", "连续首次请求返回 12001，疑似账户风控，仅提示不停止领取", {
              count: riskCount
            });
            return { result: "risk_suspected" };
          }
          recordTerminal(binding, outcome, details);
          return { result: outcome };
        }
        if (outcome === SNATCH_OUTCOME.ALREADY_CLAIMED) {
          recordTerminal(binding, outcome, {
            error: response?.error,
            reason: String(response?.msg || "已经领取"),
            attemptCount,
            notReadyCount
          });
          return { result: outcome };
        }
        if (outcome === SNATCH_OUTCOME.DAILY_LIMIT) {
          recordTerminal(binding, "daily_limit");
          GlobalState.setDailyLimit(true);
          return { result: "daily_limit", dailyLimit: true };
        }
        if (outcome === SNATCH_OUTCOME.AUTH_FAILED) {
          recordTerminal(binding, "auth_failed");
          GlobalState.updateTask(binding.bag.rid, "ERROR", "领取鉴权失败", {
            countdown: null,
            claimSource: "snatch"
          });
          return { result: "auth_failed", stop: true, preserveState: true };
        }
        if (outcome === SNATCH_OUTCOME.UNKNOWN && consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          recordTerminal(binding, "unknown", { reason: String(response?.msg || "未知业务响应") });
          return { result: "unknown" };
        }
        if (outcome === SNATCH_OUTCOME.NOT_READY) notReadyCount += 1;
      } catch (error) {
        consecutiveFailures += 1;
        Utils.claimLog("SNATCH", "控制页领取请求失败", {
          roomId: binding.bag.rid,
          bagId: binding.bag.id,
          reason: String(error?.message || error),
          httpStatus: error?.httpStatus
        });
        if (error?.kind === "auth" || consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          recordTerminal(binding, "auth_failed", { reason: String(error?.message || error) });
          GlobalState.updateTask(binding.bag.rid, "ERROR", "领取请求失败", {
            countdown: null,
            claimSource: "snatch"
          });
          return { result: "request_failed", stop: true, preserveState: true };
        }
      }
    }
    if (task.cancelled) return { stop: true };
    const finalStatus = await refreshTerminalRoomState(binding);
    const result = finalStatus === 3 ? "exhausted" : "unknown";
    recordTerminal(binding, result, {
      reason: finalStatus === 3 ? "room/list 确认红包结束" : "五次领取尝试后仍未确认结果"
    });
    return { result };
  };
  const processCandidate = async (task, candidate) => {
    const binding = createRedBagBinding(candidate.bag, candidate.roomData.receivedAt);
    binding.roomName = candidate.roomData.anchorName || `房间 ${candidate.roomId}`;
    task.binding = binding;
    task.currentRoomId = candidate.roomId;
    roomTaskIds.set(candidate.roomId, task.id);
    activeBagKeys.add(binding.key);
    GlobalState.updateTask(candidate.roomId, "OPENING", "短时初始化", {
      nickname: candidate.roomData.anchorName || `房间 ${candidate.roomId}`,
      countdown: null,
      prizes: toDisplayPrizes(binding.bag.prizeList),
      claimSource: "snatch",
      bagId: binding.bag.id
    });
    try {
      task.prewarm = PageLoader.openPrewarmTab(candidate.url);
      const openedAt = task.prewarm.openedAt;
      if (!await waitForTask(task, SETTINGS.ROOM_PREWARM_DURATION)) {
        return { stop: true };
      }
      task.prewarm.close();
      task.prewarm = null;
      return await claimBoundBag(task, binding, openedAt);
    } catch (error) {
      recordTerminal(binding, "open_failed", { reason: String(error?.message || error) });
      GlobalState.updateTask(candidate.roomId, "ERROR", "短时开页失败", {
        countdown: null,
        claimSource: "snatch"
      });
      return { result: "open_failed" };
    } finally {
      task.prewarm?.close();
      task.prewarm = null;
    }
  };
  const runTask = async (task, firstCandidate) => {
    let candidate = firstCandidate;
    try {
      while (!task.cancelled && candidate) {
        const outcome = await processCandidate(task, candidate);
        if (outcome.dailyLimit && SETTINGS.DAILY_LIMIT_ACTION === "CONTINUE_DORMANT") {
          GlobalState.updateTask(candidate.roomId, "DORMANT", "等待次日恢复", {
            countdown: null,
            claimSource: "snatch"
          });
          if (!await waitForTask(task, getNextBeijingDayDelay())) break;
          GlobalState.setDailyLimit(false);
        }
        releaseCandidate(task, task.binding, { removeState: !outcome.preserveState });
        if (outcome.dailyLimit && SETTINGS.DAILY_LIMIT_ACTION === "STOP_ALL") {
          cancelAllTasks();
          break;
        }
        if (outcome.stop) break;
        if (!await waitForTask(task, randomDelay(600, 1400))) break;
        candidate = await discoverCandidate(task);
      }
    } catch (error) {
      Utils.claimLog("SNATCH", "领取任务异常结束", { reason: String(error?.message || error) });
      if (task.currentRoomId) {
        GlobalState.updateTask(task.currentRoomId, "ERROR", "任务异常结束", {
          countdown: null,
          claimSource: "snatch"
        });
      }
    } finally {
      task.prewarm?.close();
      tasks.delete(task.id);
      if (task.currentRoomId) roomTaskIds.delete(task.currentRoomId);
    }
  };
  const RedBagTaskController = {
    getActiveCount() {
      return tasks.size;
    },
    async start() {
      if (tasks.size >= SETTINGS.MAX_CONCURRENT_TASKS) return false;
      const limitState = GlobalState.getDailyLimit();
      if (limitState?.reached) return false;
      const task = {
        id: `control-task-${Date.now()}-${taskSequence += 1}`,
        cancelled: false,
        currentRoomId: null,
        prewarm: null,
        binding: null
      };
      tasks.set(task.id, task);
      try {
        const candidate = await discoverCandidate(task);
        if (!candidate || task.cancelled) {
          tasks.delete(task.id);
          return false;
        }
        void runTask(task, candidate);
        return true;
      } catch (error) {
        tasks.delete(task.id);
        Utils.claimLog("SNATCH", "启动领取任务失败", { reason: String(error?.message || error) });
        return false;
      }
    },
    stopRoom(roomId) {
      const normalizedRoomId = String(roomId);
      const taskId = roomTaskIds.get(normalizedRoomId);
      const task = taskId ? tasks.get(taskId) : null;
      if (!task) {
        GlobalState.removeTask(normalizedRoomId);
        return false;
      }
      task.cancelled = true;
      task.prewarm?.close();
      roomTaskIds.delete(normalizedRoomId);
      if (task.binding?.key) activeBagKeys.delete(task.binding.key);
      GlobalState.removeTask(normalizedRoomId);
      return true;
    },
    stopAll() {
      cancelAllTasks();
    },
    dispose() {
      this.stopAll();
    }
  };
  const DOUYU_SELECTORS = Object.freeze({
    playerMain: "#js-player-main",
    playerVideo: "#js-player-video-case",
    playerToolbar: "#js-player-toolbar",
    giftSlot: "#js-giftList-area",
    aside: "#js-player-asideMain",
    asideTop: ".layout-Player-asideMainTop",
    rank: ".layout-Player-rank",
    chat: ".layout-Player-chat",
    chatComposer: ".ChatSend",
    chatInput: '.ChatSend-txt[contenteditable="true"], textarea.ChatSend-txt, input.ChatSend-txt, .ChatSend-txt',
    chatSendButton: ".ChatSend-button"
  });
  const query = (selector, root = document) => root?.querySelector?.(selector) || null;
  const DouyuLayoutAdapter = {
    observer: null,
    resizeObserver: null,
    callbacks: new Set(),
    scheduled: false,
    getPlayerMain() {
      return query(DOUYU_SELECTORS.playerMain);
    },
    getAsideSlot() {
      return query(DOUYU_SELECTORS.asideTop);
    },
    getGiftSlot() {
      return query(DOUYU_SELECTORS.giftSlot);
    },
    getChatComposer() {
      const container = query(DOUYU_SELECTORS.chatComposer) || query(DOUYU_SELECTORS.chat);
      if (!container) return null;
      const input = query(DOUYU_SELECTORS.chatInput, container);
      const sendButton = query(DOUYU_SELECTORS.chatSendButton, container);
      return input ? { container, input, sendButton } : null;
    },
    isTheaterMode() {
      return Boolean(
        document.body?.classList.contains("is-fullScreenPage") && this.getPlayerMain() && this.getGiftSlot()
      );
    },
    isLiveLayout() {
      return Boolean(this.getPlayerMain() && this.getChatComposer());
    },
    getSnapshot() {
      const composer = this.getChatComposer();
      return {
        theater: this.isTheaterMode(),
        liveLayout: this.isLiveLayout(),
        playerMain: this.getPlayerMain(),
        asideSlot: this.getAsideSlot(),
        giftSlot: this.getGiftSlot(),
        composer
      };
    },
    scheduleNotify() {
      if (this.scheduled) return;
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.scheduled = false;
        const snapshot = this.getSnapshot();
        this.callbacks.forEach((callback) => callback(snapshot));
        this.refreshResizeTargets(snapshot);
      });
    },
    refreshResizeTargets(snapshot = this.getSnapshot()) {
      if (typeof ResizeObserver === "undefined") return;
      if (!this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(() => this.scheduleNotify());
      }
      this.resizeObserver.disconnect();
      [snapshot.playerMain, snapshot.asideSlot, snapshot.giftSlot].filter(Boolean).forEach((element) => this.resizeObserver.observe(element));
    },
    ensureObserver() {
      if (this.observer || typeof MutationObserver === "undefined") return;
      this.observer = new MutationObserver(() => this.scheduleNotify());
      this.observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
      });
      this.refreshResizeTargets();
    },
    observe(callback, { immediate = true } = {}) {
      if (typeof callback !== "function") return () => {
      };
      this.callbacks.add(callback);
      this.ensureObserver();
      if (immediate) callback(this.getSnapshot());
      return () => {
        this.callbacks.delete(callback);
        if (this.callbacks.size === 0) {
          this.observer?.disconnect();
          this.resizeObserver?.disconnect();
          this.observer = null;
          this.resizeObserver = null;
        }
      };
    }
  };
  const ICONS = {
    GOLD: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#FFA000" stroke-width="2"/><text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="14" fill="#B8860B" font-weight="bold" font-family="Arial">¥</text></svg>`,
    STARLIGHT: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FF69B4" stroke="#FF1493" stroke-width="2"/></svg>`
  };
  const ControlPage = {
initialized: false,
    injectionTarget: null,
isPanelInjected: false,
modalContainer: null,
stopLayoutObserver: null,
init() {
      if (this.initialized || document.getElementById("qmx-modal-container")) {
        Utils.log("[控制中心] 检测到已有实例，跳过重复初始化。");
        return;
      }
      this.initialized = true;
      Utils.log("当前是控制页面，开始设置UI...");
      ThemeManager.applyTheme(SETTINGS.THEME);
      this.clearClosedTabs();
      this.createHTML();
      StatsInfo.init();
      this.applyModalMode();
      this.bindEvents();
      window.addEventListener("qmx-settings-update", (e) => {
        this.handleSettingsUpdate(e.detail);
      });
      setInterval(() => {
        this.renderDashboard();
        this.checkInjectionState();
      }, 1e3);
      FirstTimeNotice.showFirstUseNotice();
      window.addEventListener("beforeunload", () => {
        RedBagTaskController.dispose();
      });
      window.addEventListener("resize", () => {
        this.correctButtonPosition();
        this.correctModalPosition();
      });
    },
checkInjectionState() {
      if (SETTINGS.MODAL_DISPLAY_MODE === "inject-rank-list" && this.isPanelInjected) {
        if (!this.injectionTarget?.isConnected || !this.modalContainer?.isConnected || this.modalContainer.parentNode !== this.injectionTarget) {
          Utils.log("[监控] 检测到面板脱离DOM (可能是页面重绘)，正在重新注入...");
          this.isPanelInjected = false;
          this.applyModalMode();
        }
      }
    },
async handleSettingsUpdate(newSettings) {
      Utils.log("[ControlPage] 检测到设置更新，正在应用...");
      if (newSettings.MODAL_DISPLAY_MODE) {
        this.applyModalMode();
        this.correctModalPosition();
      }
    },
    setPanelPage(page) {
      const modal = this.modalContainer || document.getElementById("qmx-modal-container");
      if (!modal) return;
      const title = modal.querySelector("#qmx-panel-title");
      const button = modal.querySelector("#qmx-page-switch-btn");
      const showStats = page === "stats";
      modal.classList.toggle("is-stats-page", showStats);
      modal.dataset.page = showStats ? "stats" : "tasks";
      if (title) title.setAttribute("aria-label", showStats ? "数据统计" : "控制中心");
      if (button) button.title = showStats ? "返回当前工作" : "查看统计";
      if (showStats) void StatsInfo.refreshFromSources?.();
    },
    createHTML() {
      Utils.log("创建UI的HTML结构...");
      const modalBackdrop = document.createElement("div");
      modalBackdrop.id = "qmx-modal-backdrop";
      const modalContainer = document.createElement("div");
      modalContainer.id = "qmx-modal-container";
      this.modalContainer = modalContainer;
      modalContainer.innerHTML = mainPanelTemplate(SETTINGS.MAX_CONCURRENT_TASKS);
      document.body.appendChild(modalBackdrop);
      document.body.appendChild(modalContainer);
      const mainButton = document.createElement("button");
      mainButton.id = SETTINGS.DRAGGABLE_BUTTON_ID;
      mainButton.innerHTML = `<span class="icon">🎁</span>`;
      document.body.appendChild(mainButton);
      const settingsModal = document.createElement("div");
      settingsModal.id = "qmx-settings-modal";
      document.body.appendChild(settingsModal);
    },
bindEvents() {
      Utils.log("为UI元素绑定事件...");
      const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
      const modalContainer = document.getElementById("qmx-modal-container");
      const modalBackdrop = document.getElementById("qmx-modal-backdrop");
      const pageSwitchButton = modalContainer.querySelector("#qmx-page-switch-btn");
      if (pageSwitchButton) {
        pageSwitchButton.addEventListener("click", () => {
          const nextPage = modalContainer.dataset.page === "stats" ? "tasks" : "stats";
          this.setPanelPage(nextPage);
        });
      }
      const themeButton = modalContainer.querySelector("#qmx-theme-toggle-btn");
      const updateThemeButton = () => {
        if (!themeButton) return;
        const dark = SETTINGS.THEME === "dark";
        themeButton.dataset.theme = dark ? "dark" : "light";
        themeButton.title = dark ? "切换到日间模式" : "切换到夜间模式";
        themeButton.setAttribute("aria-label", themeButton.title);
      };
      updateThemeButton();
      if (themeButton) {
        themeButton.onclick = () => {
          themeButton.classList.remove("is-switching");
          void themeButton.offsetWidth;
          themeButton.classList.add("is-switching");
          const nextTheme = SETTINGS.THEME === "dark" ? "light" : "dark";
          SettingsManager.update({ THEME: nextTheme });
          ThemeManager.applyTheme(nextTheme);
          updateThemeButton();
          window.setTimeout(() => themeButton.classList.remove("is-switching"), 560);
        };
      }
      modalContainer.querySelector("#qmx-modal-settings-btn").onclick = () => SettingsPanel.show();
      this.setupDrag(mainButton, SETTINGS.BUTTON_POS_STORAGE_KEY, () => this.showPanel());
      const modalHeader = modalContainer.querySelector(".qmx-modal-header");
      this.setupDrag(modalContainer, "douyu_qmx_modal_position", null, modalHeader);
      modalContainer.querySelector("#qmx-modal-close-btn").onclick = () => this.hidePanel();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalContainer.classList.contains("visible")) {
          this.hidePanel();
        }
      });
      if (SETTINGS.MODAL_DISPLAY_MODE !== "inject-rank-list") {
        modalBackdrop.onclick = () => this.hidePanel();
      }
      modalContainer.querySelector("#qmx-modal-open-btn").onclick = () => this.startOneNewTask();
      modalContainer.querySelector("#qmx-modal-close-all-btn").onclick = () => {
        if (confirm("确定要停止所有领取任务吗？")) {
          Utils.log("用户请求停止所有领取任务。");
          RedBagTaskController.stopAll();
          this.renderDashboard();
        }
      };
      document.getElementById("qmx-tab-list").addEventListener("click", (e) => {
        const closeButton = e.target.closest(".qmx-tab-close-btn");
        if (!closeButton) return;
        const roomItem = e.target.closest("[data-room-id]");
        const roomId = roomItem?.dataset.roomId;
        if (!roomId) return;
        Utils.log(`[控制中心] 用户请求停止房间任务: ${roomId}。`);
        RedBagTaskController.stopRoom(roomId);
        roomItem.style.opacity = "0";
        roomItem.style.transform = "scale(0.8)";
        roomItem.style.transition = "all 0.3s ease";
        setTimeout(() => roomItem.remove(), 300);
      });
    },
renderDashboard() {
      const state2 = GlobalState.get();
      const tabList = document.getElementById("qmx-tab-list");
      if (!tabList) return;
      const tabIds = Object.keys(state2.tasks);
      document.getElementById("qmx-active-tabs-count").textContent = tabIds.length;
      const overviewState = document.getElementById("qmx-overview-state");
      if (overviewState) {
        const statuses = tabIds.map((roomId) => state2.tasks[roomId]?.status);
        const visualState = tabIds.length === 0 ? "idle" : statuses.includes("ERROR") ? "error" : statuses.includes("CLAIMING") ? "claiming" : statuses.includes("WAITING") ? "waiting" : "active";
        overviewState.dataset.state = visualState;
      }
      const statusDisplayMap = {
        OPENING: "加载中",
        WAITING: "等待中",
        CLAIMING: "校验中",
        SUCCESS: "已领取",
        DORMANT: "休眠中",
        ERROR: "出错了"
      };
      const existingRoomIds = new Set(
        Array.from(tabList.children).map((node) => node.dataset.roomId).filter(Boolean)
      );
      tabIds.forEach((roomId) => {
        const tabData = state2.tasks[roomId];
        let existingItem = tabList.querySelector(`[data-room-id="${roomId}"]`);
        let currentStatusText = tabData.statusText;
        if (tabData.status === "WAITING" && tabData.countdown?.endTime && (!currentStatusText || currentStatusText.startsWith("倒计时") || currentStatusText === "寻找任务中...")) {
          const remainingSeconds = (tabData.countdown.endTime - Date.now()) / 1e3;
          if (remainingSeconds > 0) {
            currentStatusText = `倒计时 ${Utils.formatTime(remainingSeconds)}`;
          } else {
            currentStatusText = "等待开抢...";
          }
        }
        if (existingItem) {
          existingItem.dataset.status = String(tabData.status || "UNKNOWN").toLowerCase();
          const nicknameEl = existingItem.querySelector(".identity-nickname") || existingItem.querySelector(".qmx-tab-nickname");
          const statusNameEl = existingItem.querySelector(".qmx-tab-status-name");
          const statusTextEl = existingItem.querySelector(".qmx-tab-status-text");
          const dotEl = existingItem.querySelector(".qmx-tab-status-dot");
          if (tabData.nickname && nicknameEl && nicknameEl.textContent !== tabData.nickname) {
            nicknameEl.textContent = tabData.nickname;
          }
          const newStatusName = `[${statusDisplayMap[tabData.status] || tabData.status}]`;
          if (statusNameEl.textContent !== newStatusName) {
            statusNameEl.textContent = newStatusName;
            dotEl.style.backgroundColor = `var(--status-color-${tabData.status.toLowerCase()}, #9E9E9E)`;
          }
          if (statusTextEl.textContent !== currentStatusText) {
            statusTextEl.textContent = currentStatusText;
          }
          let prizesContainer = existingItem.querySelector(".qmx-tab-prizes");
          const newPrizesHtml = this.generatePrizesHTML(tabData.prizes);
          if (newPrizesHtml) {
            if (!prizesContainer) {
              const closeBtn = existingItem.querySelector(".qmx-tab-close-btn");
              if (closeBtn) {
                closeBtn.insertAdjacentHTML("beforebegin", newPrizesHtml);
              } else {
                existingItem.insertAdjacentHTML("beforeend", newPrizesHtml);
              }
            } else {
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = newPrizesHtml;
              const newContainer = tempDiv.firstElementChild;
              const oldLayoutClass = prizesContainer.classList.contains("multi-prizes") ? "multi-prizes" : "single-prize";
              const newLayoutClass = newContainer.classList.contains("multi-prizes") ? "multi-prizes" : "single-prize";
              const oldText = prizesContainer.textContent.trim();
              const newText = newContainer.textContent.trim();
              if (oldLayoutClass !== newLayoutClass || oldText !== newText) {
                prizesContainer.outerHTML = newPrizesHtml;
              }
            }
          } else if (prizesContainer) {
            prizesContainer.remove();
          }
        } else {
          const newItem = this.createTaskItem(roomId, tabData, statusDisplayMap, currentStatusText);
          tabList.appendChild(newItem);
          requestAnimationFrame(() => {
            newItem.classList.add("qmx-item-enter-active");
            setTimeout(() => newItem.classList.remove("qmx-item-enter"), 300);
          });
        }
      });
      existingRoomIds.forEach((roomId) => {
        if (!state2.tasks[roomId]) {
          const itemToRemove = tabList.querySelector(`[data-room-id="${roomId}"]`);
          if (itemToRemove && !itemToRemove.classList.contains("qmx-item-exit-active")) {
            Utils.log(`[Render] 房间 ${roomId}: 在最新状态中已消失，执行移除。`);
            itemToRemove.classList.add("qmx-item-exit-active");
            setTimeout(() => itemToRemove.remove(), 300);
          }
        }
      });
      const emptyMsg = tabList.querySelector(".qmx-empty-list-msg");
      if (tabIds.length === 0) {
        if (!emptyMsg) {
          tabList.innerHTML = '<div class="qmx-tab-list-item qmx-empty-list-msg">没有正在运行的任务</div>';
        }
      } else if (emptyMsg) {
        emptyMsg.remove();
      }
      this.renderLimitStatus();
    },
renderLimitStatus() {
      let limitState = GlobalState.getDailyLimit();
      const accountRisk = GlobalState.getAccountRisk();
      let limitMessageEl = document.getElementById("qmx-limit-message");
      const openBtn = document.getElementById("qmx-modal-open-btn");
      if (limitState?.reached && Utils.formatDateAsBeijing(new Date(limitState.timestamp)) !== Utils.formatDateAsBeijing( new Date())) {
        Utils.log("[控制中心] 新的一天，重置每日上限旗标。");
        GlobalState.setDailyLimit(false);
        limitState = null;
      }
      if (accountRisk?.suspected || limitState?.reached) {
        if (!limitMessageEl) {
          limitMessageEl = document.createElement("div");
          limitMessageEl.id = "qmx-limit-message";
          limitMessageEl.style.cssText = "padding: 10px 24px; background-color: var(--status-color-error); color: white; font-weight: 500; text-align: center;";
          const header = document.querySelector(".qmx-modal-header");
          header.parentNode.insertBefore(limitMessageEl, header.nextSibling);
          document.querySelector(".qmx-modal-header").after(limitMessageEl);
        }
        if (limitState?.reached) {
          limitMessageEl.textContent = SETTINGS.DAILY_LIMIT_ACTION === "CONTINUE_DORMANT" ? "今日已达上限。现有任务休眠并等待次日恢复。" : "今日已达上限。任务已全部停止。";
          openBtn.disabled = true;
          openBtn.textContent = "今日已达上限";
        } else {
          limitMessageEl.textContent = `连续 ${accountRisk.count || 3} 次首次请求返回 12001，疑似账户风控，请自行判断是否继续。`;
          openBtn.disabled = false;
          openBtn.textContent = "启动领取任务";
        }
      } else {
        if (limitMessageEl) limitMessageEl.remove();
        openBtn.disabled = false;
        openBtn.textContent = "启动领取任务";
      }
    },
async startOneNewTask() {
      const openBtn = document.getElementById("qmx-modal-open-btn");
      if (openBtn.disabled) return;
      if (RedBagTaskController.getActiveCount() >= SETTINGS.MAX_CONCURRENT_TASKS) {
        Utils.log(`已达到最大领取任务数量 (${SETTINGS.MAX_CONCURRENT_TASKS})。`);
        return;
      }
      openBtn.disabled = true;
      openBtn.textContent = "正在查找...";
      try {
        const started = await RedBagTaskController.start();
        if (!started) {
          Utils.log("未能找到新的有效红包房间。");
          openBtn.textContent = "无新房间";
          await Utils.sleep(SETTINGS.UI_FEEDBACK_DELAY);
        }
      } catch (error) {
        Utils.log(`查找或打开房间时出错: ${error.message}`);
        openBtn.textContent = "查找出错";
        await Utils.sleep(SETTINGS.UI_FEEDBACK_DELAY);
      } finally {
        openBtn.disabled = false;
        this.renderLimitStatus();
      }
    },
setupDrag(element, storageKey, onClick, handle = element) {
      let isMouseDown = false;
      let hasDragged = false;
      let startX, startY, initialX, initialY;
      const clickThreshold = 5;
      const setPosition = (x, y) => {
        element.style.setProperty("--tx", `${x}px`);
        element.style.setProperty("--ty", `${y}px`);
      };
      const savedPos = _GM_getValue(storageKey);
      let currentRatio = null;
      if (savedPos) {
        if (typeof savedPos.ratioX === "number" && typeof savedPos.ratioY === "number") {
          currentRatio = savedPos;
        } else if (SETTINGS.CONVERT_LEGACY_POSITION && typeof savedPos.x === "number" && typeof savedPos.y === "number") {
          Utils.log(`[位置迁移] 发现旧的像素位置，正在转换为比例位置...`);
          const movableWidth = window.innerWidth - element.offsetWidth;
          const movableHeight = window.innerHeight - element.offsetHeight;
          currentRatio = {
            ratioX: Math.max(0, Math.min(1, savedPos.x / movableWidth)),
            ratioY: Math.max(0, Math.min(1, savedPos.y / movableHeight))
          };
          _GM_setValue(storageKey, currentRatio);
        }
      }
      if (currentRatio) {
        const newX = currentRatio.ratioX * (window.innerWidth - element.offsetWidth);
        const newY = currentRatio.ratioY * (window.innerHeight - element.offsetHeight);
        setPosition(newX, newY);
      } else {
        if (element.id === SETTINGS.DRAGGABLE_BUTTON_ID) {
          const padding = SETTINGS.DRAG_BUTTON_DEFAULT_PADDING;
          const defaultX = window.innerWidth - element.offsetWidth - padding;
          const defaultY = padding;
          setPosition(defaultX, defaultY);
        } else {
          const defaultX = (window.innerWidth - element.offsetWidth) / 2;
          const defaultY = (window.innerHeight - element.offsetHeight) / 2;
          setPosition(defaultX, defaultY);
        }
      }
      const onMouseDown = (e) => {
        if (e.button !== 0) return;
        const interactiveTarget = e.target.closest?.("button, input, select, textarea, a, summary");
        if (interactiveTarget && interactiveTarget !== element) return;
        isMouseDown = true;
        hasDragged = false;
        const rect = element.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        initialX = rect.left;
        initialY = rect.top;
        element.classList.add("is-dragging");
        handle.style.cursor = "grabbing";
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp, { once: true });
      };
      const onMouseMove = (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!hasDragged && Math.sqrt(dx * dx + dy * dy) > clickThreshold) {
          hasDragged = true;
        }
        let newX = initialX + dx;
        let newY = initialY + dy;
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        setPosition(newX, newY);
      };
      const onMouseUp = () => {
        isMouseDown = false;
        document.removeEventListener("mousemove", onMouseMove);
        element.classList.remove("is-dragging");
        handle.style.cursor = "grab";
        if (hasDragged) {
          const finalRect = element.getBoundingClientRect();
          const movableWidth = window.innerWidth - element.offsetWidth;
          const movableHeight = window.innerHeight - element.offsetHeight;
          const ratioX = movableWidth > 0 ? Math.max(0, Math.min(1, finalRect.left / movableWidth)) : 0;
          const ratioY = movableHeight > 0 ? Math.max(0, Math.min(1, finalRect.top / movableHeight)) : 0;
          _GM_setValue(storageKey, { ratioX, ratioY });
        } else if (onClick && typeof onClick === "function") {
          onClick();
        }
      };
      handle.addEventListener("mousedown", onMouseDown);
    },
showPanel() {
      const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
      const modalContainer = document.getElementById("qmx-modal-container");
      mainButton.classList.add("hidden");
      if (this.isPanelInjected) {
        this.injectionTarget.classList.add("qmx-aside-slot-active");
        modalContainer.classList.remove("qmx-hidden");
      } else {
        modalContainer.classList.add("visible");
        if (SETTINGS.MODAL_DISPLAY_MODE === "centered") {
          document.getElementById("qmx-modal-backdrop").classList.add("visible");
        }
      }
      Utils.log("控制面板已显示。");
    },
hidePanel() {
      const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
      const modalContainer = document.getElementById("qmx-modal-container");
      mainButton.classList.remove("hidden");
      if (this.isPanelInjected) {
        modalContainer.classList.add("qmx-hidden");
        this.injectionTarget?.classList.remove("qmx-aside-slot-active");
      } else {
        modalContainer.classList.remove("visible");
        if (SETTINGS.MODAL_DISPLAY_MODE === "centered") {
          document.getElementById("qmx-modal-backdrop").classList.remove("visible");
        }
      }
      Utils.log("控制面板已隐藏。");
    },
createTaskItem(roomId, tabData, statusMap, statusText) {
      const newItem = document.createElement("div");
      newItem.className = "qmx-tab-list-item qmx-item-enter";
      newItem.dataset.roomId = roomId;
      newItem.dataset.status = String(tabData.status || "UNKNOWN").toLowerCase();
      const statusColor = `var(--status-color-${tabData.status.toLowerCase()}, #9E9E9E)`;
      const nickname = tabData.nickname || "加载中...";
      const statusName = statusMap[tabData.status] || tabData.status;
      const prizesHtml = this.generatePrizesHTML(tabData.prizes);
      newItem.innerHTML = `
                <div class="qmx-tab-status-dot" style="background-color: ${statusColor};"></div>
                <div class="qmx-tab-info">
                    <div class="qmx-tab-header">
                        <button class="qmx-tab-identity" type="button" data-state="nickname" title="点击切换或复制">
                            <span class="qmx-tab-identity-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" role="img" focusable="false">
                                    <path d="M8 7h3v2H8v9H6V9H3V7h3V4h2v3zm7 0h6v2h-6v9h-2V7h2z" fill="currentColor"></path>
                                </svg>
                            </span>
                            <span class="qmx-tab-identity-text">
                                <span class="identity-nickname">${nickname}</span>
                                <span class="identity-roomid">${roomId}</span>
                            </span>
                        </button>
                    </div>
                    <div class="qmx-tab-details">
                        <span class="qmx-tab-status-name">[${statusName}]</span>
                        <span class="qmx-tab-status-text">${statusText}</span>
                    </div>
                </div>
                ${prizesHtml}
                <button class="qmx-tab-close-btn" title="停止该领取任务">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
      const identityBtn = newItem.querySelector(".qmx-tab-identity");
      const nicknameSpan = identityBtn.querySelector(".identity-nickname");
      const roomIdSpan = identityBtn.querySelector(".identity-roomid");
      const iconSpan = identityBtn.querySelector(".qmx-tab-identity-icon");
      const setIdentityState = (state2) => {
        identityBtn.dataset.state = state2;
      };
      const copyIdentityValue = async (state2) => {
        const value = state2 === "room" ? roomIdSpan.textContent.trim() : nicknameSpan.textContent.trim();
        const label = state2 === "room" ? "房间号" : "房间名";
        try {
          await navigator.clipboard.writeText(value);
          identityBtn.classList.add("copied");
          setTimeout(() => identityBtn.classList.remove("copied"), 300);
          Utils.log(`[房间号切换] 已复制${label}: ${value}`);
        } catch (err) {
          Utils.log(`[房间号切换] 复制失败: ${err.message}`);
        }
      };
      iconSpan.addEventListener("click", async (e) => {
        e.stopPropagation();
        const currentState = identityBtn.dataset.state === "room" ? "room" : "nickname";
        await copyIdentityValue(currentState);
      });
      identityBtn.addEventListener("click", (e) => {
        if (e.target.closest(".qmx-tab-identity-icon")) {
          return;
        }
        e.stopPropagation();
        const currentState = identityBtn.dataset.state === "room" ? "room" : "nickname";
        const nextState = currentState === "nickname" ? "room" : "nickname";
        setIdentityState(nextState);
      });
      identityBtn.addEventListener(
        "mouseenter",
        () => Utils.log(`[房间号切换] 鼠标悬停在房间胶囊: ${roomId}`),
        { once: true }
      );
      return newItem;
    },
generatePrizesHTML(prizes) {
      if (!prizes || !Array.isArray(prizes) || prizes.length === 0) return "";
      const layoutClass = prizes.length > 1 ? "multi-prizes" : "single-prize";
      return `<div class="qmx-tab-prizes ${layoutClass}">` + prizes.map((p, index) => {
        let icon = ICONS.GOLD;
        if (prizes.length === 2 && index === 1) {
          icon = ICONS.STARLIGHT;
        }
        return `<div class="qmx-tab-prize-item" title="${p.name || p.text}">
                    ${icon}
                    <span class="qmx-tab-prize-text">${p.text}</span>
                </div>`;
      }).join("") + `</div>`;
    },
applyModalMode() {
      const modalContainer = this.modalContainer || document.getElementById("qmx-modal-container");
      if (!modalContainer) return;
      const mode = SETTINGS.MODAL_DISPLAY_MODE;
      const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
      this.stopLayoutObserver?.();
      this.stopLayoutObserver = null;
      this.injectionTarget?.classList.remove("qmx-aside-slot-active");
      if (mode === "inject-rank-list") {
        const mountIntoAside = (snapshot) => {
          const target = snapshot.asideSlot;
          if (!target) return;
          if (this.injectionTarget && this.injectionTarget !== target) {
            this.injectionTarget.classList.remove("qmx-aside-slot-active");
          }
          this.injectionTarget = target;
          this.isPanelInjected = true;
          if (modalContainer.parentNode !== target) target.appendChild(modalContainer);
          modalContainer.classList.remove("mode-centered", "mode-floating", "visible");
          modalContainer.classList.add("mode-inject-rank-list");
          const panelOpen = mainButton?.classList.contains("hidden");
          modalContainer.classList.toggle("qmx-hidden", !panelOpen);
          target.classList.toggle("qmx-aside-slot-active", Boolean(panelOpen));
        };
        this.isPanelInjected = false;
        this.stopLayoutObserver = DouyuLayoutAdapter.observe(mountIntoAside);
        return;
      }
      this.isPanelInjected = false;
      this.injectionTarget = null;
      if (modalContainer.parentNode !== document.body) document.body.appendChild(modalContainer);
      modalContainer.classList.remove("mode-inject-rank-list", "mode-centered", "mode-floating", "qmx-hidden");
      modalContainer.classList.add(`mode-${mode}`);
      modalContainer.classList.toggle("visible", Boolean(mainButton?.classList.contains("hidden")));
    },
correctPosition(elementId, storageKey) {
      const element = document.getElementById(elementId);
      if (!element) return;
      const savedPos = _GM_getValue(storageKey);
      if (savedPos && typeof savedPos.ratioX === "number" && typeof savedPos.ratioY === "number") {
        const newX = savedPos.ratioX * (window.innerWidth - element.offsetWidth);
        const newY = savedPos.ratioY * (window.innerHeight - element.offsetHeight);
        element.style.setProperty("--tx", `${newX}px`);
        element.style.setProperty("--ty", `${newY}px`);
      }
    },
correctButtonPosition() {
      this.correctPosition(SETTINGS.DRAGGABLE_BUTTON_ID, SETTINGS.BUTTON_POS_STORAGE_KEY);
    },
correctModalPosition() {
      if (SETTINGS.MODAL_DISPLAY_MODE !== "floating" || this.isPanelInjected) {
        return;
      }
      this.correctPosition("qmx-modal-container", "douyu_qmx_modal_position");
    },
clearClosedTabs() {
      const state2 = GlobalState.get();
      if (state2.tasks && Object.keys(state2.tasks).length > 0) {
        Utils.log("检测到残留的领取任务状态，正在清空...");
        state2.tasks = {};
        GlobalState.set(state2);
        Utils.log("已清空残留的领取任务状态");
      }
    }
  };
  (function() {
    function main() {
      initHackTimer("HackTimerWorker.js");
      const currentUrl = new URL(window.location.href);
      const pathRoomId = currentUrl.pathname.match(/^\/(?:beta\/)?(\d+)\/?$/)?.[1] || "";
      const topicRoomId = currentUrl.pathname.includes("/topic/") ? currentUrl.searchParams.get("rid") || "" : "";
      const controlIds = [SETTINGS.CONTROL_ROOM_ID, SETTINGS.TEMP_CONTROL_ROOM_RID].filter(Boolean).map(String);
      const controlIdSet = new Set(controlIds);
      Utils.log(`控制页识别ID列表: ${controlIds.join(", ")}`);
      const isControlRoom = controlIdSet.has(pathRoomId) || controlIdSet.has(topicRoomId);
      if (isControlRoom) {
        ControlPage.init();
        return;
      }
      const roomId = Utils.getCurrentRoomId();
      if (roomId) ;
      else {
        Utils.log("当前页面非控制页或直播间，脚本不活动。");
      }
    }
    Utils.log(`脚本将在 ${SETTINGS.INITIAL_SCRIPT_DELAY / 1e3} 秒后开始初始化...`);
    setTimeout(main, SETTINGS.INITIAL_SCRIPT_DELAY);
  })();

})();