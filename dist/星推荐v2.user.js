// ==UserScript==
// @name             斗鱼全民星推荐自动领取pro
// @namespace        http://tampermonkey.net/
// @version          2.0.8
// @author           ienone&Truthss
// @description      原版《斗鱼全民星推荐自动领取》的增强版(应该增强了……)在保留核心功能的基础上，引入了可视化管理面板。
// @license          MIT
// @match            *://www.douyu.com/*
// @require          data:application/javascript,%3B(typeof%20System!%3D'undefined')%26%26(System%3Dnew%20System.constructor())%3B
// @connect          list-www.douyu.com
// @connect          data.ienone.top
// @connect          localhost:*
// @grant            GM_addStyle
// @grant            GM_cookie
// @grant            GM_deleteValue
// @grant            GM_getValue
// @grant            GM_listValues
// @grant            GM_log
// @grant            GM_notification
// @grant            GM_openInTab
// @grant            GM_setValue
// @grant            GM_xmlhttpRequest
// @grant            window.close
// @run-at           document-idle
// @noframes
// @original-author  ysl-ovo (https://greasyfork.org/zh-CN/users/1453821-ysl-ovo)
// ==/UserScript==

// -------- Inlined Dependencies --------
// @require https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/system.min.js
/*!
 * SystemJS 6.15.1
 */
!function(){function e(e,t){return(t||"")+" (SystemJS Error#"+e+" https://github.com/systemjs/systemjs/blob/main/docs/errors.md#"+e+")"}function t(e,t){if(-1!==e.indexOf("\\")&&(e=e.replace(j,"/")),"/"===e[0]&&"/"===e[1])return t.slice(0,t.indexOf(":")+1)+e;if("."===e[0]&&("/"===e[1]||"."===e[1]&&("/"===e[2]||2===e.length&&(e+="/"))||1===e.length&&(e+="/"))||"/"===e[0]){var n,r=t.slice(0,t.indexOf(":")+1);if(n="/"===t[r.length+1]?"file:"!==r?(n=t.slice(r.length+2)).slice(n.indexOf("/")+1):t.slice(8):t.slice(r.length+("/"===t[r.length])),"/"===e[0])return t.slice(0,t.length-n.length-1)+e;for(var i=n.slice(0,n.lastIndexOf("/")+1)+e,o=[],s=-1,u=0;u<i.length;u++)-1!==s?"/"===i[u]&&(o.push(i.slice(s,u+1)),s=-1):"."===i[u]?"."!==i[u+1]||"/"!==i[u+2]&&u+2!==i.length?"/"===i[u+1]||u+1===i.length?u+=1:s=u:(o.pop(),u+=2):s=u;return-1!==s&&o.push(i.slice(s)),t.slice(0,t.length-n.length)+o.join("")}}function n(e,n){return t(e,n)||(-1!==e.indexOf(":")?e:t("./"+e,n))}function r(e,n,r,i,o){for(var s in e){var a=t(s,r)||s,f=e[s];if("string"==typeof f){var l=c(i,t(f,r)||f,o);l?n[a]=l:u("W1",s,f,"bare specifier did not resolve")}}}function i(e,t,i){var o;for(o in e.imports&&r(e.imports,i.imports,t,i,null),e.scopes||{}){var s=n(o,t);r(e.scopes[o],i.scopes[s]||(i.scopes[s]={}),t,i,s)}for(o in e.depcache||{})i.depcache[n(o,t)]=e.depcache[o];for(o in e.integrity||{})i.integrity[n(o,t)]=e.integrity[o]}function o(e,t){if(t[e])return e;var n=e.length;do{var r=e.slice(0,n+1);if(r in t)return r}while(-1!==(n=e.lastIndexOf("/",n-1)))}function s(e,t){var n=o(e,t);if(n){var r=t[n];if(null===r)return;if(!(e.length>n.length&&"/"!==r[r.length-1]))return r+e.slice(n.length);u("W2",n,r,"should have a trailing '/'")}}function u(t,n,r,i){console.warn(e(t,"Package target "+i+", resolving target '"+r+"' for "+n))}function c(e,t,n){for(var r=e.scopes,i=n&&o(n,r);i;){var u=s(t,r[i]);if(u)return u;i=o(i.slice(0,i.lastIndexOf("/")),r)}return s(t,e.imports)||-1!==t.indexOf(":")&&t}function a(){this[M]={}}function f(e){return e.id}function l(e,t,n,r){if(e.onload(n,t.id,t.d&&t.d.map(f),!!r),n)throw n}function d(t,n,r,i){var o=t[M][n];if(o)return o;var s=[],u=Object.create(null);P&&Object.defineProperty(u,P,{value:"Module"});var c=Promise.resolve().then((function(){return t.instantiate(n,r,i)})).then((function(r){if(!r)throw Error(e(2,"Module "+n+" did not instantiate"));var i=r[1]((function(e,t){o.h=!0;var n=!1;if("string"==typeof e)e in u&&u[e]===t||(u[e]=t,n=!0);else{for(var r in e)t=e[r],r in u&&u[r]===t||(u[r]=t,n=!0);e&&e.__esModule&&(u.__esModule=e.__esModule)}if(n)for(var i=0;i<s.length;i++){var c=s[i];c&&c(u)}return t}),2===r[1].length?{import:function(e,r){return t.import(e,n,r)},meta:t.createContext(n)}:void 0);return o.e=i.execute||function(){},[r[0],i.setters||[],r[2]||[]]}),(function(e){throw o.e=null,o.er=e,l(t,o,e,!0),e})),a=c.then((function(e){return Promise.all(e[0].map((function(r,i){var o=e[1][i],s=e[2][i];return Promise.resolve(t.resolve(r,n)).then((function(e){var r=d(t,e,n,s);return Promise.resolve(r.I).then((function(){return o&&(r.i.push(o),!r.h&&r.I||o(r.n)),r}))}))}))).then((function(e){o.d=e}))}));return o=t[M][n]={id:n,i:s,n:u,m:i,I:c,L:a,h:!1,d:void 0,e:void 0,er:void 0,E:void 0,C:void 0,p:void 0}}function h(e,t,n,r){if(!r[t.id])return r[t.id]=!0,Promise.resolve(t.L).then((function(){return t.p&&null!==t.p.e||(t.p=n),Promise.all(t.d.map((function(t){return h(e,t,n,r)})))})).catch((function(n){if(t.er)throw n;throw t.e=null,l(e,t,n,!1),n}))}function p(e,t){return t.C=h(e,t,t,{}).then((function(){return v(e,t,{})})).then((function(){return t.n}))}function v(e,t,n){function r(){try{var n=o.call(L);if(n)return n=n.then((function(){t.C=t.n,t.E=null,l(e,t,null,!0)}),(function(n){throw t.er=n,t.E=null,l(e,t,n,!0),n})),t.E=n;t.C=t.n,t.L=t.I=void 0}catch(r){throw t.er=r,r}finally{l(e,t,t.er,!0)}}if(!n[t.id]){if(n[t.id]=!0,!t.e){if(t.er)throw t.er;return t.E?t.E:void 0}var i,o=t.e;return t.e=null,t.d.forEach((function(r){try{var o=v(e,r,n);o&&(i=i||[]).push(o)}catch(s){throw t.er=s,l(e,t,s,!1),s}})),i?Promise.all(i).then(r):r()}}function m(){[].forEach.call(document.querySelectorAll("script"),(function(t){if(!t.sp)if("systemjs-module"===t.type){if(t.sp=!0,!t.src)return;System.import("import:"===t.src.slice(0,7)?t.src.slice(7):n(t.src,g)).catch((function(e){if(e.message.indexOf("https://github.com/systemjs/systemjs/blob/main/docs/errors.md#3")>-1){var n=document.createEvent("Event");n.initEvent("error",!1,!1),t.dispatchEvent(n)}return Promise.reject(e)}))}else if("systemjs-importmap"===t.type){t.sp=!0;var r=t.src?(System.fetch||fetch)(t.src,{integrity:t.integrity,priority:t.fetchPriority,passThrough:!0}).then((function(e){if(!e.ok)throw Error("Invalid status code: "+e.status);return e.text()})).catch((function(n){return n.message=e("W4","Error fetching systemjs-import map "+t.src)+"\n"+n.message,console.warn(n),"function"==typeof t.onerror&&t.onerror(),"{}"})):t.innerHTML;W=W.then((function(){return r})).then((function(n){!function(t,n,r){var o={};try{o=JSON.parse(n)}catch(s){console.warn(Error(e("W5","systemjs-importmap contains invalid JSON")+"\n\n"+n+"\n"))}i(o,r,t)}(N,n,t.src||g)}))}}))}var g,y="undefined"!=typeof Symbol,b="undefined"!=typeof self,S="undefined"!=typeof document,w=b?self:global;if(S){var O=document.querySelector("base[href]");O&&(g=O.href)}if(!g&&"undefined"!=typeof location){var E=(g=location.href.split("#")[0].split("?")[0]).lastIndexOf("/");-1!==E&&(g=g.slice(0,E+1))}var x,j=/\\/g,P=y&&Symbol.toStringTag,M=y?Symbol():"@",I=a.prototype;I.import=function(e,t,n){var r=this;return t&&"object"==typeof t&&(n=t,t=void 0),Promise.resolve(r.prepareImport()).then((function(){return r.resolve(e,t,n)})).then((function(e){var t=d(r,e,void 0,n);return t.C||p(r,t)}))},I.createContext=function(e){var t=this;return{url:e,resolve:function(n,r){return Promise.resolve(t.resolve(n,r||e))}}},I.onload=function(){},I.register=function(e,t,n){x=[e,t,n]},I.getRegister=function(){var e=x;return x=void 0,e};var L=Object.freeze(Object.create(null));w.System=new a;var C,R,W=Promise.resolve(),N={imports:{},scopes:{},depcache:{},integrity:{}},T=S;if(I.prepareImport=function(e){return(T||e)&&(m(),T=!1),W},I.getImportMap=function(){return JSON.parse(JSON.stringify(N))},S&&(m(),window.addEventListener("DOMContentLoaded",m)),I.addImportMap=function(e,t){i(e,t||g,N)},S){window.addEventListener("error",(function(e){J=e.filename,_=e.error}));var A=location.origin}I.createScript=function(e){var t=document.createElement("script");t.async=!0,e.indexOf(A+"/")&&(t.crossOrigin="anonymous");var n=N.integrity[e];return n&&(t.integrity=n),t.src=e,t};var J,_,k={},U=I.register;I.register=function(e,t){if(S&&"loading"===document.readyState&&"string"!=typeof e){var n=document.querySelectorAll("script[src]"),r=n[n.length-1];if(r){C=e;var i=this;R=setTimeout((function(){k[r.src]=[e,t],i.import(r.src)}))}}else C=void 0;return U.call(this,e,t)},I.instantiate=function(t,n){var r=k[t];if(r)return delete k[t],r;var i=this;return Promise.resolve(I.createScript(t)).then((function(r){return new Promise((function(o,s){r.addEventListener("error",(function(){s(Error(e(3,"Error loading "+t+(n?" from "+n:""))))})),r.addEventListener("load",(function(){if(document.head.removeChild(r),J===t)s(_);else{var e=i.getRegister(t);e&&e[0]===C&&clearTimeout(R),o(e)}})),document.head.appendChild(r)}))}))},I.shouldFetch=function(){return!1},"undefined"!=typeof fetch&&(I.fetch=fetch);var $=I.instantiate,B=/^(text|application)\/(x-)?javascript(;|$)/;I.instantiate=function(t,n,r){var i=this;return this.shouldFetch(t,n,r)?this.fetch(t,{credentials:"same-origin",integrity:N.integrity[t],meta:r}).then((function(r){if(!r.ok)throw Error(e(7,r.status+" "+r.statusText+", loading "+t+(n?" from "+n:"")));var o=r.headers.get("content-type");if(!o||!B.test(o))throw Error(e(4,'Unknown Content-Type "'+o+'", loading '+t+(n?" from "+n:"")));return r.text().then((function(e){return e.indexOf("//# sourceURL=")<0&&(e+="\n//# sourceURL="+t),(0,eval)(e),i.getRegister(t)}))})):$.apply(this,arguments)},I.resolve=function(n,r){return c(N,t(n,r=r||g)||n,r)||function(t,n){throw Error(e(8,"Unable to resolve bare specifier '"+t+(n?"' from "+n:"'")))}(n,r)};var F=I.instantiate;I.instantiate=function(e,t,n){var r=N.depcache[e];if(r)for(var i=0;i<r.length;i++)d(this,this.resolve(r[i],e),e);return F.call(this,e,t,n)},b&&"function"==typeof importScripts&&(I.instantiate=function(e){var t=this;return Promise.resolve().then((function(){return importScripts(e),t.getRegister(e)}))}),function(e){function t(t){return!e.hasOwnProperty(t)||!isNaN(t)&&t<e.length||a&&e[t]&&"undefined"!=typeof window&&e[t].parent===window}var n,r,i,o=e.System.constructor.prototype,s=o.import;o.import=function(o,u,c){return function(){for(var o in n=r=void 0,e)t(o)||(n?r||(r=o):n=o,i=o)}(),s.call(this,o,u,c)};var u=[[],function(){return{}}],c=o.getRegister;o.getRegister=function(){var o=c.call(this);if(o)return o;var s,a=function(o){var s,u,c=0;for(var a in e)if(!t(a)){if(0===c&&a!==n||1===c&&a!==r)return a;s?(i=a,u=o&&u||a):s=a===i,c++}return u}(this.firstGlobalProp);if(!a)return u;try{s=e[a]}catch(f){return u}return[[],function(e){return{execute:function(){e(s),e({default:s,__useDefault:!0})}}}]};var a="undefined"!=typeof navigator&&-1!==navigator.userAgent.indexOf("Trident")}("undefined"!=typeof self?self:global),function(e){var t=e.System.constructor.prototype,r=/^[^#?]+\.(css|html|json|wasm)([?#].*)?$/,i=t.shouldFetch.bind(t);t.shouldFetch=function(e){return i(e)||r.test(e)};var o=/^application\/json(;|$)/,s=/^text\/css(;|$)/,u=/^application\/wasm(;|$)/,c=t.fetch;t.fetch=function(t,r){return c(t,r).then((function(i){if(r.passThrough)return i;if(!i.ok)return i;var c=i.headers.get("content-type");return o.test(c)?i.json().then((function(e){return new Response(new Blob(['System.register([],function(e){return{execute:function(){e("default",'+JSON.stringify(e)+")}}})"],{type:"application/javascript"}))})):s.test(c)?i.text().then((function(e){return e=e.replace(/url\(\s*(?:(["'])((?:\\.|[^\n\\"'])+)\1|((?:\\.|[^\s,"'()\\])+))\s*\)/g,(function(e,r,i,o){return["url(",r,n(i||o,t),r,")"].join("")})),new Response(new Blob(["System.register([],function(e){return{execute:function(){var s=new CSSStyleSheet();s.replaceSync("+JSON.stringify(e)+');e("default",s)}}})'],{type:"application/javascript"}))})):u.test(c)?(WebAssembly.compileStreaming?WebAssembly.compileStreaming(i):i.arrayBuffer().then(WebAssembly.compile)).then((function(n){e.System.wasmModules||(e.System.wasmModules=Object.create(null)),e.System.wasmModules[t]=n;var r=[],i=[];return WebAssembly.Module.imports&&WebAssembly.Module.imports(n).forEach((function(e){var t=JSON.stringify(e.module);-1===r.indexOf(t)&&(r.push(t),i.push("function(m){i["+t+"]=m}"))})),new Response(new Blob(["System.register(["+r.join(",")+"],function(e){var i={};return{setters:["+i.join(",")+"],execute:function(){return WebAssembly.instantiate(System.wasmModules["+JSON.stringify(t)+"],i).then(function(m){e(m.exports)})}}})"],{type:"application/javascript"}))})):i}))}}("undefined"!=typeof self?self:global);var q="undefined"!=typeof Symbol&&Symbol.toStringTag;I.get=function(e){var t=this[M][e];if(t&&null===t.e&&!t.E)return t.er?null:t.n},I.set=function(t,n){try{new URL(t)}catch(s){console.warn(Error(e("W3",'"'+t+'" is not a valid URL to set in the module registry')))}var r;q&&"Module"===n[q]?r=n:(r=Object.assign(Object.create(null),n),q&&Object.defineProperty(r,q,{value:"Module"}));var i=Promise.resolve(r),o=this[M][t]||(this[M][t]={id:t,i:[],h:!1,d:[],e:null,er:void 0,E:void 0});return!o.e&&!o.E&&(Object.assign(o,{n:r,I:void 0,L:void 0,C:i}),r)},I.has=function(e){return!!this[M][e]},I.delete=function(e){var t=this[M],n=t[e];if(!n||n.p&&null!==n.p.e||n.E)return!1;var r=n.i;return n.d&&n.d.forEach((function(e){var t=e.i.indexOf(n);-1!==t&&e.i.splice(t,1)})),delete t[e],function(){var n=t[e];if(!n||!r||null!==n.e||n.E)return!1;r.forEach((function(e){n.i.push(e),e(n.n)})),r=null}};var D="undefined"!=typeof Symbol&&Symbol.iterator;I.entries=function(){var e,t,n=this,r=Object.keys(n[M]),i=0,o={next:function(){for(;void 0!==(t=r[i++])&&void 0===(e=n.get(t)););return{done:void 0===t,value:void 0!==t&&[t,e]}}};return o[D]=function(){return this},o}}();
//# sourceMappingURL=system.min.js.map


// @require https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/extras/named-register.min.js
!function(t){function e(t){t.registerRegistry=Object.create(null),t.namedRegisterAliases=Object.create(null)}var r=t.System;e(r);var i,s,n=r.constructor.prototype,l=r.constructor,a=function(){l.call(this),e(this)};a.prototype=n,r.constructor=a;var o=n.register;n.register=function(t,e,r,n){if("string"!=typeof t)return o.apply(this,arguments);var l=[e,r,n];return this.registerRegistry[t]=l,i||(i=l,s=t),Promise.resolve().then((function(){i=null,s=null})),o.apply(this,[e,r,n])};var u=n.resolve;n.resolve=function(t,e){try{return u.call(this,t,e)}catch(r){if(t in this.registerRegistry)return this.namedRegisterAliases[t]||t;throw r}};var c=n.instantiate;n.instantiate=function(t,e,r){var i=this.registerRegistry[t];return i?(this.registerRegistry[t]=null,i):c.call(this,t,e,r)};var g=n.getRegister;n.getRegister=function(t){var e=g.call(this,t);s&&t&&(this.namedRegisterAliases[s]=t);var r=i||e;return i=null,s=null,r}}("undefined"!=typeof self?self:global);
//# sourceMappingURL=named-register.min.js.map

// ------ End Inlined Dependencies ------


System.register("./__entry.js", [], (function (exports, module) {
  'use strict';
  return {
    execute: (function () {
      const d=new Set;const importCSS = async e=>{d.has(e)||(d.add(e),(t=>{typeof GM_addStyle=="function"?GM_addStyle(t):document.head.appendChild(document.createElement("style")).append(t);})(e));};
      const CONFIG = {
SCRIPT_PREFIX: "[全民星推荐助手]",
CONTROL_ROOM_ID: "6657",
TEMP_CONTROL_ROOM_RID: "6979222",
POPUP_WAIT_TIMEOUT: 2e4,
PANEL_WAIT_TIMEOUT: 1e4,
ELEMENT_WAIT_TIMEOUT: 3e4,
RED_ENVELOPE_LOAD_TIMEOUT: 15e3,
MIN_DELAY: 1e3,
MAX_DELAY: 2500,
CLOSE_TAB_DELAY: 1500,
INITIAL_SCRIPT_DELAY: 3e3,
UNRESPONSIVE_TIMEOUT: 15 * 60 * 1e3,
SWITCHING_CLEANUP_TIMEOUT: 3e4,
HEALTHCHECK_INTERVAL: 1e4,
DISCONNECTED_GRACE_PERIOD: 1e4,
STATS_UPDATE_INTERVAL: 4e3,
DRAGGABLE_BUTTON_ID: "douyu-qmx-starter-button",
BUTTON_POS_STORAGE_KEY: "douyu_qmx_button_position",
MODAL_DISPLAY_MODE: "floating",
API_URL: "https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/redbag/square/list",
COIN_LIST_URL: "https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/coin/record/list",
API_RETRY_COUNT: 3,
API_RETRY_DELAY: 5e3,
MAX_WORKER_TABS: 24,
DAILY_LIMIT_ACTION: "CONTINUE_DORMANT",
AUTO_PAUSE_ENABLED: true,
AUTO_PAUSE_DELAY_AFTER_ACTION: 5e3,
CALIBRATION_MODE_ENABLED: false,
SHOW_STATS_IN_PANEL: false,
ENABLE_DANMU_PRO: true,
STATE_STORAGE_KEY: "douyu_qmx_dashboard_state",
DAILY_LIMIT_REACHED_KEY: "douyu_qmx_daily_limit_reached",
STATS_INFO_STORAGE_KEY: "douyu_qmx_stats",
DEFAULT_THEME: "dark",
        INJECT_TARGET_RETRIES: 10,
INJECT_TARGET_INTERVAL: 500,
API_ROOM_FETCH_COUNT: 10,
UI_FEEDBACK_DELAY: 2e3,
DRAG_BUTTON_DEFAULT_PADDING: 20,
CONVERT_LEGACY_POSITION: true,
SELECTORS: {
          redEnvelopeContainer: "#layout-Player-aside div.LiveNewAnchorSupportT-enter",
countdownTimer: "span.LiveNewAnchorSupportT-enter--bottom",
popupModal: "body > div.LiveNewAnchorSupportT-pop",
openButton: "div.LiveNewAnchorSupportT-singleBag--btnOpen",
closeButton: "div.LiveNewAnchorSupportT-pop--close",
criticalElement: "#js-player-video",
pauseButton: "div.pause-c594e8:not(.removed-9d4c42)",
playButton: "div.play-8dbf03:not(.removed-9d4c42)",
rewardSuccessIndicator: ".LiveNewAnchorSupportT-singleBagOpened",
limitReachedPopup: "div.dy-Message-custom-content.dy-Message-info",
rankListContainer: "#layout-Player-aside > div.layout-Player-asideMainTop > div.layout-Player-rank",
anchorName: "div.Title-anchorName > h2.Title-anchorNameH2"
},
DB_NAME: "DouyuDanmukuPro",
        DB_VERSION: 2,
        DB_STORE_NAME: "danmuku_templates",
SETTINGS_KEY_PREFIX: "dda_",
CSS_CLASSES: {
          POPUP: "dda-popup",
          POPUP_SHOW: "show",
          POPUP_CONTENT: "dda-popup-content",
          POPUP_ITEM: "dda-popup-item",
          POPUP_ITEM_ACTIVE: "dda-popup-item-active",
          POPUP_ITEM_TEXT: "dda-popup-item-text",
          POPUP_EMPTY: "dda-popup-empty",
          EMPTY_MESSAGE: "dda-empty-message"
        },
KEYBOARD: {
          ENTER: "Enter",
          ESCAPE: "Escape",
          ARROW_UP: "ArrowUp",
          ARROW_DOWN: "ArrowDown",
          ARROW_LEFT: "ArrowLeft",
          ARROW_RIGHT: "ArrowRight",
          TAB: "Tab",
          BACKSPACE: "Backspace"
        },
API: {
          BASE_URL: "https://api.example.com",
          TIMEOUT: 5e3,
          RETRY_ATTEMPTS: 3
        },
DEBUG: false,
LOG_LEVEL: "info",
minSearchLength: 1,
maxSuggestions: 10,
debounceDelay: 300,
sortBy: "relevance",
autoImportMaxPages: 5,
autoImportPageSize: 50,
autoImportSortByPopularity: true,
enterSelectionModeKey: "ArrowUp",
exitSelectionModeKey: "ArrowDown",
expandCandidatesKey: "ArrowUp",
navigationLeftKey: "ArrowLeft",
navigationRightKey: "ArrowRight",
selectKey: "Enter",
cancelKey: "Escape",
popupShowDelay: 100,
popupHideDelay: 200,
animationDuration: 200,
maxPopupHeight: 300,
itemHeight: 40,
maxCandidateWidth: 200,
capsule: {
          maxWidth: 150,
height: 24,
padding: 16,
margin: 16,
totalHeight: 40,
fontSize: 12,
itemsPerRow: 4,
singleRowMaxItems: 8,
preview: {
            enabled: true,
showDelay: 500,
hideDelay: 100,
maxWidth: 300,
animationDuration: 200,
keyboardShowDelay: 150,
verticalOffset: 8,
horizontalOffset: 0,
preferredPosition: "top"
}
        },
enableAutoComplete: true,
enableKeyboardShortcuts: true,
enableSelectionMode: true,
enableSound: false,
enableSync: false,
syncInterval: 3e5,
maxCacheSize: 1e3,
cacheExpireTime: 864e5
};
      const SettingsManager = {
        STORAGE_KEY: "douyu_qmx_user_settings",
get() {
          const userSettings = GM_getValue(this.STORAGE_KEY, {});
          const themeSetting = GM_getValue(
            "douyu_qmx_theme",
            CONFIG.DEFAULT_THEME
          );
          return Object.assign({}, CONFIG, userSettings, { THEME: themeSetting });
        },
save(settingsToSave) {
          const theme = settingsToSave.THEME;
          delete settingsToSave.THEME;
          GM_setValue("douyu_qmx_theme", theme);
          GM_setValue(this.STORAGE_KEY, settingsToSave);
        },
reset() {
          GM_deleteValue(this.STORAGE_KEY);
          GM_deleteValue("douyu_qmx_theme");
        }
      };
      const SETTINGS = SettingsManager.get();
      SETTINGS.THEME = GM_getValue("douyu_qmx_theme", SETTINGS.DEFAULT_THEME);
      const STATE = {
        isSwitchingRoom: false,
        lastActionTime: 0
      };
      const Utils = {
log(message) {
          const logMsg = `${SETTINGS.SCRIPT_PREFIX} ${message}`;
          try {
            GM_log(logMsg);
          } catch (e) {
            console.log(e);
            console.log(logMsg);
          }
        },
sleep(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        },
getRandomDelay(min = SETTINGS.MIN_DELAY, max = SETTINGS.MAX_DELAY) {
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
lockChecker: function(lockKey, callback, ...args) {
          if (GM_getValue(lockKey, false)) {
            setTimeout(() => callback(...args), 50);
            return false;
          }
          return true;
        },
setLocalValueWithLock: function(lockKey, storageKey, value, nickname) {
          try {
            GM_setValue(lockKey, true);
            GM_setValue(storageKey, value);
          } catch (e) {
            Utils.log(`[${nickname}-写] 严重错误：GM_setValue 写入失败！ 错误信息: ${e.message}`);
          } finally {
            GM_setValue(lockKey, false);
          }
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
      const ControlPanelRefactoredCss = ':root{color-scheme:light dark;--motion-easing: cubic-bezier(.4, 0, .2, 1);--status-color-waiting: #4CAF50;--status-color-claiming: #2196F3;--status-color-switching: #FFC107;--status-color-error: #F44336;--status-color-opening: #9C27B0;--status-color-dormant: #757575;--status-color-unresponsive: #FFA000;--status-color-disconnected: #BDBDBD;--status-color-stalled: #9af39dff}body[data-theme=dark]{--md-sys-color-primary: #D0BCFF;--md-sys-color-on-primary: #381E72;--md-sys-color-primary-container: #4F378B;--md-sys-color-on-primary-container: #EADDFF;--md-sys-color-surface-container: #211F26;--md-sys-color-on-surface: #E6E1E5;--md-sys-color-on-surface-variant: #CAC4D0;--md-sys-color-outline: #938F99;--md-sys-color-surface-bright: #36343B;--md-sys-color-tertiary: #EFB8C8;--md-sys-color-scrim: #000000;--surface-container-highest: #3D3B42}body[data-theme=light]{--md-sys-color-primary: #6750A4;--md-sys-color-on-primary: #FFFFFF;--md-sys-color-primary-container: #EADDFF;--md-sys-color-on-primary-container: #21005D;--md-sys-color-surface-container: #F3EDF7;--md-sys-color-surface-bright: #FEF7FF;--md-sys-color-on-surface: #1C1B1F;--md-sys-color-on-surface-variant: #49454F;--md-sys-color-outline: #79747E;--md-sys-color-tertiary: #7D5260;--md-sys-color-scrim: #000000;--surface-container-highest: #E6E0E9}.qmx-hidden{display:none!important}.qmx-modal-open-scroll-lock{overflow:hidden!important}.is-dragging{transition:none!important}.qmx-flex-center{display:flex;align-items:center;justify-content:center}.qmx-flex-between{display:flex;align-items:center;justify-content:space-between}.qmx-flex-column{display:flex;flex-direction:column}.qmx-modal-base{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.95);z-index:10001;background-color:var(--md-sys-color-surface-bright);color:var(--md-sys-color-on-surface);border-radius:28px;box-shadow:0 12px 32px #00000080;display:flex;flex-direction:column;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s,transform .3s}.qmx-modal-base.visible{opacity:1;visibility:visible;transform:translate(-50%,-50%) scale(1)}.qmx-backdrop{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:var(--md-sys-color-scrim);z-index:9998;opacity:0;visibility:hidden;transition:opacity .3s ease}.qmx-backdrop.visible{opacity:.5;visibility:visible}.qmx-btn{padding:10px 16px;border:1px solid var(--md-sys-color-outline);background-color:transparent;color:var(--md-sys-color-primary);border-radius:20px;font-size:14px;font-weight:500;cursor:pointer;transition:background-color .2s,transform .2s,box-shadow .2s;-webkit-user-select:none;user-select:none}.qmx-btn:hover{background-color:#d0bcff1a;transform:translateY(-2px);box-shadow:0 2px 4px #0000001a}.qmx-btn:active{transform:translateY(0) scale(.98);box-shadow:none}.qmx-btn:disabled{opacity:.5;cursor:not-allowed}.qmx-btn--primary{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);border:none}.qmx-btn--primary:hover{background-color:#c2b3ff;box-shadow:0 4px 8px #0003}.qmx-btn--danger{border-color:#f44336;color:#f44336}.qmx-btn--danger:hover{background-color:#f443361a}.qmx-btn--icon{width:36px;height:36px;padding:0;border-radius:50%;background-color:#d0bcff26;border:none;color:var(--md-sys-color-primary)}.qmx-btn--icon:hover{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);transform:scale(1.05) rotate(180deg)}.qmx-styled-list{list-style:none;padding-left:0}.qmx-styled-list li{position:relative;padding-left:20px;margin-bottom:8px}.qmx-styled-list li:before{content:"◆";position:absolute;left:0;top:2px;color:var(--md-sys-color-primary);font-size:12px}.qmx-scrollbar::-webkit-scrollbar{width:10px}.qmx-scrollbar::-webkit-scrollbar-track{background:var(--md-sys-color-surface-bright);border-radius:10px}.qmx-scrollbar::-webkit-scrollbar-thumb{background-color:var(--md-sys-color-primary);border-radius:10px;border:2px solid var(--md-sys-color-surface-bright)}.qmx-scrollbar::-webkit-scrollbar-thumb:hover{background-color:#e0d1ff}.qmx-input{background-color:var(--md-sys-color-surface-container);border:1px solid var(--md-sys-color-outline);color:var(--md-sys-color-on-surface);border-radius:8px;padding:12px;width:100%;box-sizing:border-box;transition:box-shadow .2s,border-color .2s}.qmx-input:hover{border-color:var(--md-sys-color-primary)}.qmx-input:focus{outline:none;border-color:var(--md-sys-color-primary);box-shadow:0 0 0 2px #d0bcff4d}.qmx-input[type=number]::-webkit-inner-spin-button,.qmx-input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.qmx-input[type=number]{margin-left:5px;margin-bottom:9px;-moz-appearance:textfield;appearance:textfield}.qmx-fieldset-unit{position:relative;padding:0;margin:0;border:1px solid var(--md-sys-color-outline);border-radius:8px;background-color:var(--md-sys-color-surface-container);transition:border-color .2s,box-shadow .2s;width:100%;box-sizing:border-box}.qmx-fieldset-unit:hover{border-color:var(--md-sys-color-primary)}.qmx-fieldset-unit:focus-within{border-color:var(--md-sys-color-primary);box-shadow:0 0 0 2px #d0bcff4d}.qmx-fieldset-unit input[type=number]{border:none;background:none;outline:none;box-shadow:none;color:var(--md-sys-color-on-surface);padding:3px 10px 4px;width:100%;box-sizing:border-box}.qmx-fieldset-unit legend{padding:0 6px;font-size:12px;color:var(--md-sys-color-on-surface-variant);margin-left:auto;margin-right:12px;text-align:right;pointer-events:none}.qmx-toggle{position:relative;display:inline-block;width:52px;height:30px}.qmx-toggle input{opacity:0;width:0;height:0}.qmx-toggle .slider{position:absolute;cursor:pointer;inset:0;background-color:var(--md-sys-color-surface-container);border:1px solid var(--md-sys-color-outline);border-radius:30px;transition:background-color .3s,border-color .3s}.qmx-toggle .slider:before{position:absolute;content:"";height:22px;width:22px;left:3px;bottom:3px;background-color:var(--md-sys-color-on-surface-variant);border-radius:50%;box-shadow:0 1px 3px #0003;transition:all .3s cubic-bezier(.175,.885,.32,1.275)}.qmx-toggle input:checked+.slider{background-color:var(--md-sys-color-primary);border-color:var(--md-sys-color-primary)}.qmx-toggle input:checked+.slider:before{background-color:var(--md-sys-color-on-primary);transform:translate(22px)}.qmx-toggle:hover .slider{border-color:var(--md-sys-color-primary)}.qmx-select{position:relative;width:100%}.qmx-select-styled{position:relative;padding:10px 30px 10px 12px;background-color:var(--md-sys-color-surface-container);border:1px solid var(--md-sys-color-outline);border-radius:8px;cursor:pointer;transition:all .2s;-webkit-user-select:none;user-select:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:inset 0 2px 4px #00000014}.qmx-select-styled:after{content:"";position:absolute;top:50%;right:12px;transform:translateY(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--md-sys-color-on-surface-variant);transition:transform .3s ease}.qmx-select:hover .qmx-select-styled{border-color:var(--md-sys-color-primary)}.qmx-select.active .qmx-select-styled{border-color:var(--md-sys-color-primary);box-shadow:inset 0 3px 6px #0000001a,0 0 0 2px #d0bcff4d}.qmx-select.active .qmx-select-styled:after{transform:translateY(-50%) rotate(180deg)}.qmx-select-options{position:absolute;top:105%;left:0;right:0;z-index:10;background-color:var(--md-sys-color-surface-bright);border:1px solid var(--md-sys-color-outline);border-radius:8px;max-height:0;overflow:hidden;opacity:0;transform:translateY(-10px);transition:all .3s ease;padding:4px 0}.qmx-select.active .qmx-select-options{max-height:200px;opacity:1;transform:translateY(0)}.qmx-select-options div{padding:10px 12px;cursor:pointer;transition:background-color .2s}.qmx-select-options div:hover{background-color:#d0bcff1a}.qmx-select-options div.selected{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);font-weight:500}.qmx-range-slider-wrapper{display:flex;flex-direction:column;gap:8px}.qmx-range-slider-container{position:relative;height:24px;display:flex;align-items:center}.qmx-range-slider-container input[type=range]{position:absolute;width:100%;height:4px;-webkit-appearance:none;appearance:none;background:none;pointer-events:none;margin:0}.qmx-range-slider-container input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;pointer-events:auto;width:20px;height:20px;background-color:var(--md-sys-color-primary);border-radius:50%;cursor:grab;border:none;box-shadow:0 1px 3px #0000004d;transition:transform .2s}.qmx-range-slider-container input[type=range]::-webkit-slider-thumb:active{cursor:grabbing;transform:scale(1.1)}.qmx-range-slider-container input[type=range]::-moz-range-thumb{pointer-events:auto;width:20px;height:20px;background-color:var(--md-sys-color-primary);border-radius:50%;cursor:grab;border:none;box-shadow:0 1px 3px #0000004d;transition:transform .2s}.qmx-range-slider-container input[type=range]::-moz-range-thumb:active{cursor:grabbing;transform:scale(1.1)}.qmx-range-slider-track-container{position:absolute;width:100%;height:4px;background-color:var(--md-sys-color-surface-container);border-radius:2px}.qmx-range-slider-progress{position:absolute;height:100%;background-color:var(--md-sys-color-primary);border-radius:2px}.qmx-range-slider-values{font-size:14px;color:var(--md-sys-color-primary);text-align:center;font-weight:500}.qmx-tooltip-icon{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background-color:var(--md-sys-color-outline);color:var(--md-sys-color-surface-container);font-size:12px;font-weight:700;cursor:help;-webkit-user-select:none;user-select:none}#qmx-global-tooltip{position:fixed;background-color:var(--surface-container-highest);color:var(--md-sys-color-on-surface);padding:8px 12px;border-radius:8px;box-shadow:0 4px 12px #0003;font-size:12px;font-weight:400;line-height:1.5;z-index:10002;max-width:250px;opacity:0;visibility:hidden;transform:translateY(-5px);transition:opacity .2s ease,transform .2s ease,visibility .2s;pointer-events:none}#qmx-global-tooltip.visible{opacity:1;visibility:visible;transform:translateY(0)}.theme-switch{position:relative;display:block;width:60px;height:34px;cursor:pointer;transition:none}.theme-switch input{opacity:0;width:0;height:0}.theme-switch-wrapper{align-self:center}.slider-track{position:absolute;top:0;left:0;width:34px;height:34px;background-color:var(--surface-container-highest);border-radius:17px;box-shadow:inset 2px 2px 4px #0003,inset -2px -2px 4px #ffffff0d;transition:width .3s ease,left .3s ease,border-radius .3s ease,box-shadow .3s ease}.theme-switch:hover .slider-track{width:60px}.theme-switch input:checked+.slider-track{left:26px}.theme-switch:hover input:checked+.slider-track{left:0}.slider-dot{position:absolute;height:26px;width:26px;left:4px;top:4px;background-color:var(--md-sys-color-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 4px 8px #0000004d;transition:transform .3s cubic-bezier(.4,0,.2,1),background-color .3s ease,box-shadow .3s ease}.theme-switch input:checked~.slider-dot{transform:translate(26px);background-color:var(--primary-container)}.slider-dot .icon{position:absolute;width:20px;height:20px;color:var(--md-sys-color-on-primary);transition:opacity .3s ease,transform .3s cubic-bezier(.4,0,.2,1)}.sun{opacity:1;transform:translateY(0) rotate(0)}.moon{opacity:0;transform:translateY(20px) rotate(-45deg)}.theme-switch input:checked~.slider-dot .sun{opacity:0;transform:translateY(-20px) rotate(45deg)}.theme-switch input:checked~.slider-dot .moon{opacity:1;transform:translateY(0) rotate(0);color:var(--md-sys-color-on-surface)}#douyu-qmx-starter-button{position:fixed;top:0;left:0;z-index:10000;background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);border:none;width:56px;height:56px;border-radius:16px;cursor:grab;box-shadow:0 4px 8px #0000004d;display:flex;align-items:center;justify-content:center;transform:translate3d(var(--tx, 0px),var(--ty, 0px),0) scale(1);transition:transform .3s cubic-bezier(.4,0,.2,1),opacity .3s cubic-bezier(.4,0,.2,1);will-change:transform,opacity}#douyu-qmx-starter-button .icon{font-size:28px}#douyu-qmx-starter-button.hidden{opacity:0;transform:translate3d(var(--tx, 0px),var(--ty, 0px),0) scale(.5);pointer-events:none}#qmx-modal-container{background-color:var(--md-sys-color-surface-container);color:var(--md-sys-color-on-surface);display:flex;flex-direction:column}#qmx-modal-container.mode-floating,#qmx-modal-container.mode-centered{position:fixed;z-index:9999;width:335px;max-width:90vw;max-height:80vh;border-radius:28px;box-shadow:0 8px 24px #0006;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s,transform .2s ease-out;will-change:transform,opacity}#qmx-modal-container.visible{opacity:1;visibility:visible}#qmx-modal-container.mode-floating{top:0;left:0;transform:translate3d(var(--tx, 0px),var(--ty, 0px),0)}#qmx-modal-container.mode-floating .qmx-modal-header{cursor:move}#qmx-modal-container.mode-centered{top:50%;left:50%;transform:translate(-50%,-50%)}#qmx-modal-container.mode-inject-rank-list{position:relative;width:100%;flex:1;min-height:0;box-shadow:none;border-radius:0;transform:none!important}.qmx-modal-header{position:relative;padding:12px 20px 0;font-size:22px;font-weight:400;color:var(--md-sys-color-on-surface);-webkit-user-select:none;user-select:none;display:flex;align-items:center;justify-content:space-between}.qmx-modal-close-icon{width:36px;height:36px;background-color:#d0bcff26;border:none;border-radius:50%;cursor:pointer;transition:background-color .2s,transform .2s;position:relative;flex-shrink:0}.qmx-modal-close-icon:hover{background-color:var(--md-sys-color-primary);transform:scale(1.05) rotate(180deg)}.qmx-modal-close-icon:before,.qmx-modal-close-icon:after{content:"";position:absolute;top:50%;left:50%;width:16px;height:2px;background-color:var(--md-sys-color-primary);transition:background-color .2s ease-in-out}.qmx-modal-close-icon:hover:before,.qmx-modal-close-icon:hover:after{background-color:var(--md-sys-color-on-primary)}.qmx-modal-close-icon:before{transform:translate(-50%,-50%) rotate(45deg)}.qmx-modal-close-icon:after{transform:translate(-50%,-50%) rotate(-45deg)}.qmx-modal-content{padding:0 24px;flex:1;min-height:0;display:flex;flex-direction:column}.qmx-modal-content h3{flex-shrink:0;font-size:16px;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin:0 0 8px}.qmx-stats-header{display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:4px 0;-webkit-user-select:none;user-select:none;transition:background-color .2s;border-radius:8px}.qmx-stats-header:hover{background-color:#ffffff0d}.qmx-stats-header h3{font-size:16px;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin:8px 0}.qmx-stats-arrow{font-size:12px;color:var(--md-sys-color-on-surface-variant);transition:transform .3s ease}.qmx-stats-header.expanded .qmx-stats-arrow{transform:rotate(180deg)}.qmx-stats-container{position:relative;overflow:hidden;padding:0}.qmx-stats-toggle{position:relative;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-user-select:none;user-select:none;transition:all .3s cubic-bezier(.25,.46,.45,.94);margin:4px 24px;border-radius:10px}.qmx-stats-indicator{font-size:15px;color:var(--md-sys-color-on-surface-variant);transition:all .3s cubic-bezier(.25,.46,.45,.94);position:absolute;z-index:2}.qmx-stats-label{font-size:12px;color:var(--md-sys-color-on-surface-variant);opacity:0;transform:scale(.95);transition:all .3s cubic-bezier(.25,.46,.45,.94);position:absolute;z-index:1;white-space:nowrap}.qmx-stats-refresh{opacity:0;font-size:15px;transition:all .3s cubic-bezier(.25,.46,.45,.94);position:relative}.qmx-stats-refresh.rotating{animation:rotate360 1s linear}@keyframes rotate360{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.qmx-stats-switcher{opacity:0;font-size:20px;transition:all .3s cubic-bezier(.25,.46,.45,.94);margin:8px 8px 12px}.qmx-stats-toggle:hover{background-color:#ffffff0d;margin:4px 24px 21px}.qmx-stats-toggle:hover .qmx-stats-indicator{transform:translateY(85%)}.qmx-stats-toggle:hover .qmx-stats-label{opacity:1;transform:scale(1)}.qmx-stats-toggle.expanded{height:28px;padding:0 12px;margin:6px 20px}.qmx-stats-toggle.expanded .qmx-stats-indicator{opacity:1;transform:rotate(180deg) scale(1.05);position:relative;margin:9px}.qmx-stats-toggle.expanded .qmx-stats-indicator.transitioning{opacity:0}.qmx-stats-toggle.expanded .qmx-stats-label{opacity:1;transform:scale(1.05);font-size:12px;font-weight:500;position:relative;transition:all .3s cubic-bezier(.25,.46,.45,.94);color:var(--md-sys-color-on-surface)}.qmx-stats-toggle.expanded .qmx-stats-label.transitioning{opacity:0}.qmx-stats-toggle.expanded .qmx-stats-refresh{opacity:1;cursor:pointer;transform:scale(1.05);margin:8px}.qmx-stats-toggle.expanded .qmx-stats-refresh.disabled{opacity:0;transform:translate(100%)}.qmx-stats-toggle.expanded .qmx-stats-switcher{cursor:pointer;opacity:1;position:absolute}.qmx-stats-toggle.expanded #qmx-stats-left{left:60px}.qmx-stats-toggle.expanded #qmx-stats-right{right:60px}.qmx-stats-toggle.expanded .qmx-stats-switcher.disabled{cursor:not-allowed;color:#666}.qmx-stats-toggle.expanded #qmx-stats-left{transform:translate(-55px)}.qmx-stats-toggle.expanded #qmx-stats-right{transform:translate(55px)}.qmx-stats-content{max-height:0;opacity:0;overflow:hidden;transition:max-height .3s cubic-bezier(.25,.46,.45,.94),opacity .2s cubic-bezier(.25,.46,.45,.94) .1s,padding .3s cubic-bezier(.25,.46,.45,.94);padding:0 24px}.qmx-stats-content.expanded{max-height:120px;opacity:1;padding:8px 24px 16px}.qmx-modal-stats{display:flex;gap:1px}.qmx-modal-stats-child{background-color:var(--md-sys-color-surface-bright);border-radius:12px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;gap:8px;transition:background-color .2s,transform .3s ease,opacity .3s ease;width:88px;float:left;margin-left:2%}.qmx-stat-info-avg,.qmx-stat-info-total,.qmx-stat-info-receivedCount{display:flex;flex-direction:column;flex-grow:1;gap:4px;font-size:14px;overflow:hidden}.qmx-stat-header{display:flex;align-items:baseline;justify-content:center}.qmx-stat-nickname{font-weight:500;color:var(--md-sys-color-on-surface);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qmx-stat-details{opacity:1;display:flex;align-items:center;font-size:13px;color:var(--md-sys-color-on-surface-variant);transition:all .3s cubic-bezier(.25,.46,.45,.94);justify-content:center}.qmx-stat-details.transitioning{opacity:0}.qmx-stat-stats{font-weight:500}#qmx-tab-list{overflow-y:auto;flex-grow:1;padding-right:4px;margin-right:-4px}.qmx-tab-list-item{background-color:var(--md-sys-color-surface-bright);border-radius:12px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;gap:8px;transition:background-color .2s,transform .3s ease,opacity .3s ease}.qmx-tab-list-item:hover{background-color:#ffffff0d}.qmx-item-enter{opacity:0;transform:translate(20px)}.qmx-item-enter-active{opacity:1;transform:translate(0)}.qmx-item-exit-active{position:absolute;opacity:0;transform:scale(.8);transition:all .3s ease;z-index:-1;pointer-events:none}.qmx-tab-status-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}.qmx-tab-info{display:flex;flex-direction:column;flex-grow:1;gap:4px;font-size:14px;overflow:hidden}.qmx-tab-header{display:flex;align-items:baseline;justify-content:space-between}.qmx-tab-nickname{font-weight:500;color:var(--md-sys-color-on-surface);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qmx-tab-room-id{font-size:12px;color:var(--md-sys-color-on-surface-variant);opacity:.7}.qmx-tab-details{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--md-sys-color-on-surface-variant)}.qmx-tab-status-name{font-weight:500}.qmx-tab-close-btn{flex-shrink:0;background:none;border:none;color:var(--md-sys-color-on-surface-variant);font-size:20px;cursor:pointer;padding:0 4px;line-height:1;opacity:.6;transition:opacity .2s,color .2s,transform .2s}.qmx-tab-close-btn:hover{opacity:1;color:#f44336;transform:scale(1.1)}.qmx-modal-footer{padding:16px 24px;display:flex;gap:8px}#qmx-settings-modal{width:500px;max-width:95vw}.qmx-settings-header{padding:12px 24px;border-bottom:1px solid var(--md-sys-color-outline);flex-shrink:0}.qmx-settings-tabs{display:flex;gap:8px}.qmx-settings-tabs .tab-link{padding:8px 16px;border:none;background:none;color:var(--md-sys-color-on-surface-variant);cursor:pointer;border-radius:8px;transition:background-color .2s,color .2s;font-size:14px}.qmx-settings-tabs .tab-link:hover{background-color:#ffffff0d}.qmx-settings-tabs .tab-link.active{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);font-weight:500}.qmx-settings-content{padding:16px 24px;flex-grow:1;overflow-y:auto;overflow-x:hidden;max-height:60vh;scrollbar-gutter:stable}.qmx-settings-content .tab-content{display:none}.qmx-settings-content .tab-content.active{display:block}.qmx-settings-footer{padding:16px 24px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--md-sys-color-outline);flex-shrink:0}.qmx-settings-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;align-items:start}.qmx-settings-item{display:flex;flex-direction:column;justify-content:center;gap:8px}.qmx-settings-item label{font-size:14px;font-weight:500;display:flex;align-items:center;gap:6px}.qmx-settings-item small{font-size:12px;color:var(--md-sys-color-on-surface-variant);opacity:.8}.qmx-settings-warning{padding:12px;background-color:#f4433633;border:1px solid #F44336;color:#efb8c8;border-radius:8px;grid-column:1 / -1}#tab-about{line-height:1.7;font-size:14px}#tab-about h4{color:var(--md-sys-color-primary);font-size:16px;font-weight:500;margin-top:20px;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid var(--md-sys-color-outline)}#tab-about h4:first-child{margin-top:0}#tab-about p{margin-bottom:10px;color:var(--md-sys-color-on-surface-variant)}#tab-about .version-tag{display:inline-block;background-color:var(--md-sys-color-tertiary);color:var(--md-sys-color-on-primary);padding:2px 8px;border-radius:12px;font-size:13px;font-weight:500;margin-left:8px}#tab-about a{color:var(--md-sys-color-tertiary);text-decoration:none;font-weight:500;transition:color .2s}#tab-about a:hover{color:#ffd6e1;text-decoration:underline}#qmx-notice-modal{width:450px;max-width:90vw}#qmx-notice-modal .qmx-modal-content{padding:16px 24px}#qmx-notice-modal .qmx-modal-content p{margin-bottom:12px;line-height:1.6;font-size:15px;color:var(--md-sys-color-on-surface-variant)}#qmx-notice-modal .qmx-modal-content ul{margin:12px 0;padding-left:20px}#qmx-notice-modal .qmx-modal-content li{margin-bottom:10px;position:relative;font-size:15px;line-height:1.6}#qmx-notice-modal .qmx-modal-content li:before{content:"◆";position:absolute;left:-18px;color:var(--md-sys-color-primary);font-size:12px}#qmx-notice-modal h3{font-size:20px;font-weight:500;margin:0}#qmx-notice-modal h4{color:var(--md-sys-color-primary);font-size:16px;font-weight:500;margin-top:16px;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid var(--md-sys-color-outline)}#qmx-notice-modal .qmx-warning-text{background-color:#ffc1071a;border-left:4px solid #FFC107;padding:12px 16px;margin:16px 0;border-radius:4px;font-size:15px;line-height:1.6}#qmx-notice-modal .qmx-warning-text strong{color:#ff8f00}#qmx-notice-modal a{color:var(--md-sys-color-tertiary);text-decoration:none;font-weight:500;transition:color .2s}#qmx-notice-modal a:hover{color:#ffd6e1;text-decoration:underline}#qmx-modal-backdrop,#qmx-notice-backdrop{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:var(--md-sys-color-scrim);z-index:9998;opacity:0;visibility:hidden;transition:opacity .3s ease}#qmx-modal-backdrop.visible,#qmx-notice-backdrop.visible{opacity:.5;visibility:visible}#qmx-settings-modal,#qmx-notice-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.95);z-index:10001;background-color:var(--md-sys-color-surface-bright);color:var(--md-sys-color-on-surface);border-radius:28px;box-shadow:0 12px 32px #00000080;display:flex;flex-direction:column;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s,transform .3s}#qmx-settings-modal.visible,#qmx-notice-modal.visible{opacity:1;visibility:visible;transform:translate(-50%,-50%) scale(1)}.qmx-modal-btn{flex-grow:1;padding:10px 16px;border:1px solid var(--md-sys-color-outline);background-color:transparent;color:var(--md-sys-color-primary);border-radius:20px;font-size:14px;font-weight:500;cursor:pointer;transition:background-color .2s,transform .2s,box-shadow .2s;-webkit-user-select:none;user-select:none}.qmx-modal-btn:hover{background-color:#d0bcff1a;transform:translateY(-2px);box-shadow:0 2px 4px #0000001a}.qmx-modal-btn:active{transform:translateY(0) scale(.98);box-shadow:none}.qmx-modal-btn:disabled{opacity:.5;cursor:not-allowed}.qmx-modal-btn.primary{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);border:none}.qmx-modal-btn.primary:hover{background-color:#c2b3ff;box-shadow:0 4px 8px #0003}.qmx-modal-btn.danger{border-color:#f44336;color:#f44336}.qmx-modal-btn.danger:hover{background-color:#f443361a}.qmx-modal-content::-webkit-scrollbar,.qmx-settings-content::-webkit-scrollbar{width:10px}.qmx-modal-content::-webkit-scrollbar-track,.qmx-settings-content::-webkit-scrollbar-track{background:var(--md-sys-color-surface-bright);border-radius:10px}.qmx-modal-content::-webkit-scrollbar-thumb,.qmx-settings-content::-webkit-scrollbar-thumb{background-color:var(--md-sys-color-primary);border-radius:10px;border:2px solid var(--md-sys-color-surface-bright)}.qmx-modal-content::-webkit-scrollbar-thumb:hover,.qmx-settings-content::-webkit-scrollbar-thumb:hover{background-color:#e0d1ff}';
      importCSS(ControlPanelRefactoredCss);
      const mainPanelTemplate = (maxTabs) => `
    <div class="qmx-modal-header">
        <span>控制中心</span>
        <button id="qmx-modal-close-btn" class="qmx-modal-close-icon" title="关闭"></button>
    </div>
    <div class="qmx-stats-container">
        <div class="qmx-stats-toggle" id="qmx-stats-toggle">
            <button id="qmx-stats-left" class="qmx-stats-switcher"><</button>
            <span class="qmx-stats-indicator">▼</span>
            <span class="qmx-stats-label">今日统计</span>
            <button class="qmx-stats-refresh">⟳</button>
            <button id="qmx-stats-right" class="qmx-stats-switcher">></button>
        </div>
        <div class="qmx-stats-content" id="qmx-stats-content">
            <div class="qmx-modal-stats" id="qmx-stats-panel"></div>
        </div>
    </div>
    <div class="qmx-modal-content">
        <h3>监控面板 (<span id="qmx-active-tabs-count">0</span>/${maxTabs})</h3>
        <div id="qmx-tab-list"></div>
    </div>
    <div class="qmx-modal-footer">
        <button id="qmx-modal-settings-btn" class="qmx-modal-btn">设置</button>
        <button id="qmx-modal-close-all-btn" class="qmx-modal-btn danger">关闭所有</button>
        <button id="qmx-modal-open-btn" class="qmx-modal-btn primary">打开新房间</button>
    </div>
`;
      const createUnitInput = (id, label, settingsMeta) => {
        const meta = settingsMeta[id];
        return `
                <div class="qmx-settings-item">
                    <label for="${id}">
                        ${label}
                        <span class="qmx-tooltip-icon" data-tooltip-key="${id.replace("setting-", "")}">?</span>
                    </label>
                    <fieldset class="qmx-fieldset-unit">
                        <legend>${meta.unit}</legend>
                        <input type="number" class="qmx-input" id="${id}" value="${meta.value}">
                    </fieldset>
                </div>
            `;
      };
      const settingsPanelTemplate = (SETTINGS2) => {
        const settingsMeta = {
          "setting-initial-script-delay": { value: SETTINGS2.INITIAL_SCRIPT_DELAY / 1e3, unit: "秒" },
          "setting-auto-pause-delay": { value: SETTINGS2.AUTO_PAUSE_DELAY_AFTER_ACTION / 1e3, unit: "秒" },
          "setting-unresponsive-timeout": { value: SETTINGS2.UNRESPONSIVE_TIMEOUT / 6e4, unit: "分钟" },
          "setting-red-envelope-timeout": { value: SETTINGS2.RED_ENVELOPE_LOAD_TIMEOUT / 1e3, unit: "秒" },
          "setting-popup-wait-timeout": { value: SETTINGS2.POPUP_WAIT_TIMEOUT / 1e3, unit: "秒" },
          "setting-worker-loading-timeout": { value: SETTINGS2.ELEMENT_WAIT_TIMEOUT / 1e3, unit: "秒" },
          "setting-close-tab-delay": { value: SETTINGS2.CLOSE_TAB_DELAY / 1e3, unit: "秒" },
          "setting-api-retry-delay": { value: SETTINGS2.API_RETRY_DELAY / 1e3, unit: "秒" },
          "setting-switching-cleanup-timeout": { value: SETTINGS2.SWITCHING_CLEANUP_TIMEOUT / 1e3, unit: "秒" },
          "setting-healthcheck-interval": { value: SETTINGS2.HEALTHCHECK_INTERVAL / 1e3, unit: "秒" },
          "setting-disconnected-grace-period": { value: SETTINGS2.DISCONNECTED_GRACE_PERIOD / 1e3, unit: "秒" },
          "setting-stats-update-interval": { value: SETTINGS2.STATS_UPDATE_INTERVAL / 1e3, unit: "秒" }
        };
        return `
        <div class="qmx-settings-header">
            <div class="qmx-settings-tabs">
                <button class="tab-link active" data-tab="basic">基本设置</button>
                <button class="tab-link" data-tab="perf">性能与延迟</button>
                <button class="tab-link" data-tab="advanced">高级设置</button>
                <button class="tab-link" data-tab="danmupro">弹幕助手</button>
                <button class="tab-link" data-tab="about">关于</button>
                <!-- 主题模式切换开关 -->
                <div class="qmx-settings-item">
                    <div class="theme-switch-wrapper">
                        <label class="theme-switch">
                            <input type="checkbox" id="setting-theme-mode" ${SETTINGS2.THEME === "dark" ? "checked" : ""}>
                            <!-- 1. 背景轨道：只负责展开和收缩的动画 -->
                            <span class="slider-track"></span>
                            <!-- 2. 滑块圆点：只负责左右移动和图标切换 -->
                            <span class="slider-dot">
                                <span class="icon sun">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <line x1="12" y1="1" x2="12" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="23"></line>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                        <line x1="1" y1="12" x2="3" y2="12"></line>
                                        <line x1="21" y1="12" x2="23" y2="12"></line>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                    </svg>
                                </span>
                                <span class="icon moon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.713-6.636 4.398-8.552a.75.75 0 01.818.162z" clip-rule="evenodd"></path></svg>
                                </span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <div class="qmx-settings-content">
            <!-- ==================== Tab 1: 基本设置 ==================== -->
            <div id="tab-basic" class="tab-content active">
                <div class="qmx-settings-grid">
                    <div class="qmx-settings-item">
                        <label for="setting-control-room-id">控制室房间号 <span class="qmx-tooltip-icon" data-tooltip-key="control-room">?</span></label>
                        <input type="number" class="qmx-input" id="setting-control-room-id" value="${SETTINGS2.CONTROL_ROOM_ID}">
                    </div>
                    <div class="qmx-settings-item"></div>
                    <div class="qmx-settings-item">
                        <label>自动暂停后台视频 <span class="qmx-tooltip-icon" data-tooltip-key="auto-pause">?</span></label>
                        <label class="qmx-toggle">
                            <input type="checkbox" id="setting-auto-pause" ${SETTINGS2.AUTO_PAUSE_ENABLED ? "checked" : ""}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="qmx-settings-item">
                        <label>展示数据统计 <span class="qmx-tooltip-icon" data-tooltip-key="stats-info">?</span></label>
                        <label class="qmx-toggle">
                            <input type="checkbox" id="setting-stats-info" ${SETTINGS2.SHOW_STATS_IN_PANEL ? "checked" : ""}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="qmx-settings-item">
                        <label>启用校准模式 <span class="qmx-tooltip-icon" data-tooltip-key="calibration-mode">?</span></label>
                        <label class="qmx-toggle">
                            <input type="checkbox" id="setting-calibration-mode" ${SETTINGS2.CALIBRATION_MODE_ENABLED ? "checked" : ""}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="qmx-settings-item">
                        <label>启用弹幕助手😋<span class="qmx-tooltip-icon" data-tooltip-key="danmupro-mode">?</span></label>
                        <label class="qmx-toggle">
                            <input type="checkbox" id="setting-danmupro-mode" ${SETTINGS2.ENABLE_DANMU_PRO ? "checked" : ""}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="qmx-settings-item">
                        <label>达到上限后的行为</label>
                        <div class="qmx-select" data-target-id="setting-daily-limit-action">
                            <div class="qmx-select-styled"></div>
                            <div class="qmx-select-options"></div>
                            <select id="setting-daily-limit-action" style="display: none;">
                                <option value="STOP_ALL" ${SETTINGS2.DAILY_LIMIT_ACTION === "STOP_ALL" ? "selected" : ""}>直接关停所有任务</option>
                                <option value="CONTINUE_DORMANT" ${SETTINGS2.DAILY_LIMIT_ACTION === "CONTINUE_DORMANT" ? "selected" : ""}>进入休眠模式，等待刷新</option>
                            </select>
                        </div>
                    </div>
                    <div class="qmx-settings-item">
                        <label>控制中心显示模式</label>
                        <div class="qmx-select" data-target-id="setting-modal-mode">
                            <div class="qmx-select-styled"></div>
                            <div class="qmx-select-options"></div>
                            <select id="setting-modal-mode" style="display: none;">
                                <option value="floating" ${SETTINGS2.MODAL_DISPLAY_MODE === "floating" ? "selected" : ""}>浮动窗口</option>
                                <option value="centered" ${SETTINGS2.MODAL_DISPLAY_MODE === "centered" ? "selected" : ""}>屏幕居中</option>
                                <option value="inject-rank-list" ${SETTINGS2.MODAL_DISPLAY_MODE === "inject-rank-list" ? "selected" : ""}>替换排行榜显示</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <!-- ==================== Tab 2: 性能与延迟 ==================== -->
            <div id="tab-perf" class="tab-content">
                <div class="qmx-settings-grid">
                    ${createUnitInput("setting-initial-script-delay", "脚本初始启动延迟", settingsMeta)}
                    ${createUnitInput("setting-auto-pause-delay", "领取后暂停延迟", settingsMeta)}
                    ${createUnitInput("setting-unresponsive-timeout", "工作页失联超时", settingsMeta)}
                    ${createUnitInput("setting-red-envelope-timeout", "红包活动加载超时", settingsMeta)}
                    ${createUnitInput("setting-popup-wait-timeout", "红包弹窗等待超时", settingsMeta)}
                    ${createUnitInput("setting-worker-loading-timeout", "播放器加载超时", settingsMeta)}
                    ${createUnitInput("setting-close-tab-delay", "关闭标签页延迟", settingsMeta)}
                    ${createUnitInput("setting-switching-cleanup-timeout", "切换中状态兜底超时", settingsMeta)}
                    ${createUnitInput("setting-healthcheck-interval", "哨兵健康检查间隔", settingsMeta)}
                    ${createUnitInput("setting-disconnected-grace-period", "断开连接清理延迟", settingsMeta)}
                    ${createUnitInput("setting-api-retry-delay", "API重试延迟", settingsMeta)}
                    ${createUnitInput("setting-stats-update-interval", "统计信息更新间隔", settingsMeta)}
                    <div class="qmx-settings-item" style="grid-column: 1 / -1;">
                        <label>模拟操作延迟范围 (秒) <span class="qmx-tooltip-icon" data-tooltip-key="range-delay">?</span></label>
                        <div class="qmx-range-slider-wrapper">
                            <div class="qmx-range-slider-container">
                                <div class="qmx-range-slider-track-container"><div class="qmx-range-slider-progress"></div></div>
                                <input type="range" id="setting-min-delay" min="0.1" max="5" step="0.1" value="${SETTINGS2.MIN_DELAY / 1e3}">
                                <input type="range" id="setting-max-delay" min="0.1" max="5" step="0.1" value="${SETTINGS2.MAX_DELAY / 1e3}">
                            </div>
                            <div class="qmx-range-slider-values"></div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- ==================== Tab 3: 高级设置 ==================== -->
            <div id="tab-advanced" class="tab-content">
                <div class="qmx-settings-grid">
                    <div class="qmx-settings-item">
                        <label for="setting-max-tabs">最大工作标签页数量 <span class="qmx-tooltip-icon" data-tooltip-key="max-worker-tabs">?</span></label>
                        <input type="number" class="qmx-input" id="setting-max-tabs" value="${SETTINGS2.MAX_WORKER_TABS}">
                    </div>
                    <div class="qmx-settings-item">
                        <label for="setting-api-fetch-count">单次API获取房间数 <span class="qmx-tooltip-icon" data-tooltip-key="api-room-fetch-count">?</span></label>
                        <input type="number" class="qmx-input" id="setting-api-fetch-count" value="${SETTINGS2.API_ROOM_FETCH_COUNT}">
                    </div>
                    <div class="qmx-settings-item">
                        <label for="setting-api-retry-count">API请求重试次数 <span class="qmx-tooltip-icon" data-tooltip-key="api-retry-count">?</span></label>
                        <input type="number" class="qmx-input" id="setting-api-retry-count" value="${SETTINGS2.API_RETRY_COUNT}">
                    </div>
                    <!-- 新增：添加两个空的占位符，使网格平衡为 2x3 -->
                    <div class="qmx-settings-item"></div>
                    <div class="qmx-settings-item"></div>
                </div>
            </div>
            <!-- ==================== Tab 4: 弹幕助手 ==================== -->
            <div id="tab-danmupro" class="tab-content">
                <h4>关于斗鱼弹幕助手功能</h4>
                <ul class="qmx-styled-list">
                    <li>启用后，可以在弹幕输入框中使用自动弹幕推荐等功能。</li>
                    <li>弹幕智能补全：在聊天输入框输入时，根据关键字自动匹配并显示相关的弹幕模板。</li>
                    <li>全键盘操作：
                        <ul>
                            <li>1. 正常输入模式：打出关键字如‘niko’‘三楼’</li>
                            <li>2. 如果弹幕库中有匹配到的话，会在输入框上方显示几个候选项</li>
                            <li>3. 点击 <code>↑</code> 键进入选择模式</li>
                            <li>4. 点击 <code>←</code> / <code>→</code> 在候选项之间导航</li>
                            <li>5. 点击 <code>Enter</code> 选择并填充弹幕（连点两下<code>Enter</code>就是直接发送弹幕）</li>
                            <li>6. 点击 <code>↓</code> 退出选择模式回到正常输入模式，或点击 <code>Esc</code> 关闭候选框</li>
                            <li>在第2步之后也可以直接鼠标点击选择候选项填充到输入框</li>
                        </ul>
                    </li>
                    <li>长文本预览：当鼠标悬停或键盘选择到内容过长的候选项时，会显示一个悬浮框来展示完整内容。</li>
                </ul>
            </div>      
            <!-- ==================== Tab 5: 关于 ==================== -->
            <div id="tab-about" class="tab-content">
                <!-- 调试工具 - 仅在开发时启用
                <h4>调试工具 <span style="color: #ff6b6b;">⚠️ 仅供测试使用</span></h4>
                <div class="qmx-settings-grid">
                    <div class="qmx-settings-item">
                        <label>模拟达到每日上限</label>
                        <button id="test-daily-limit-btn" class="qmx-modal-btn" style="background-color: #ff6b6b; color: white;">
                            设置为已达上限
                        </button>
                        <small style="color: #888; display: block; margin-top: 5px;">
                            点击后将模拟达到每日红包上限，触发休眠模式（如果启用）
                        </small>
                    </div>
                    <div class="qmx-settings-item">
                        <label>重置每日上限状态</label>
                        <button id="reset-daily-limit-btn" class="qmx-modal-btn">
                            重置上限状态
                        </button>
                        <small style="color: #888; display: block; margin-top: 5px;">
                            清除上限标记，恢复正常运行模式
                        </small>
                    </div>
                </div>
                -->
                <h4>关于脚本 <span class="version-tag">v2.0.8</span></h4>
                <h4>致谢</h4>
                <ul class="qmx-styled-list">
                    <li>本脚本基于<a href="https://greasyfork.org/zh-CN/users/1453821-ysl-ovo" target="_blank" rel="noopener noreferrer">ysl-ovo</a>的插件<a href="https://greasyfork.org/zh-CN/scripts/532514-%E6%96%97%E9%B1%BC%E5%85%A8%E6%B0%91%E6%98%9F%E6%8E%A8%E8%8D%90%E8%87%AA%E5%8A%A8%E9%A2%86%E5%8F%96" target="_blank" rel="noopener noreferrer">《斗鱼全民星推荐自动领取》</a>
                        进行一些功能改进(也许)与界面美化，同样遵循MIT许可证开源。感谢原作者的分享</li>
                    <li>兼容斗鱼新版UI的相关功能与项目重构主要由<a href="https://github.com/Truthss" target="_blank" rel="noopener noreferrer">@Truthss</a> 贡献，非常感谢！</li>
                </ul>
                <h4>一些tips</h4>
                <ul class="qmx-styled-list">
                    <li>每天大概1000左右金币到上限</li>
                    <li>注意这个活动到晚上的时候，100/50/20星光棒的选项可能空了(奖池对应项会变灰)这时候攒金币过了12点再抽，比较有性价比</li>
                    <li>后台标签页有时会在还剩几秒时卡死在红包弹窗界面(标签页倒计时不动了)，然后就死循环了。目前已部分修复此问题</li>
                    <li>脚本还是bug不少，随缘修了＞︿＜</li>
                    <li>DouyuEx 的“阻止P2P上传”功能位置：点击精灵球->从左往右第四个🛠️样貌的选项->右侧菜单顶部 </li>
                    <li>启用统计功能需要把"油猴管理面板->设置->安全->允许脚本访问 Cookie"改为ALL！！',
                </ul>
                <h4>脚本更新日志 (v2.0.8)</h4>
                <ul class="qmx-styled-list">
                    <li>【修复】适配斗鱼星推荐API变动</li>
                    <li>【新增】在控制面板中显示统计信息，记录每日领取的红包数量和金币总额。</li>
                </ul>
                <h4>源码与社区</h4>
                <ul class="qmx-styled-list">
                    <li>可以在 <a href="https://github.com/ienone/douyu-qmx-pro/" target="_blank" rel="noopener noreferrer">GitHub</a> 查看本脚本源码</li>
                    <li>发现BUG或有功能建议，欢迎提交 <a href="https://github.com/ienone/douyu-qmx-pro/issues" target="_blank" rel="noopener noreferrer">Issue</a>（不过大概率不会修……）</li>
                    <li>如果你有能力进行改进，非常欢迎提交 <a href="https://github.com/ienone/douyu-qmx-pro/pulls" target="_blank" rel="noopener noreferrer">Pull Request</a>！</li>
                </ul>
            </div>
        </div>
        <div class="qmx-settings-footer">
            <button id="qmx-settings-cancel-btn" class="qmx-modal-btn">取消</button>
            <button id="qmx-settings-reset-btn" class="qmx-modal-btn danger">恢复默认</button>
            <button id="qmx-settings-save-btn" class="qmx-modal-btn primary">保存并刷新</button>
        </div>
        `;
      };
      const ThemeManager = {
applyTheme(theme) {
          document.body.setAttribute("data-theme", theme);
          SETTINGS.THEME = theme;
          GM_setValue("douyu_qmx_theme", theme);
        }
      };
      const GlobalState = {
get() {
          let state = GM_getValue(SETTINGS.STATE_STORAGE_KEY, { tabs: {} });
          if (!state || typeof state !== "object") {
            state = { tabs: {} };
          }
          return state;
        },
set(state) {
          const lockKey = "douyu_qmx_state_lock";
          if (!Utils.lockChecker(lockKey, () => this.set(), state)) {
            return;
          }
          Utils.setLocalValueWithLock(lockKey, SETTINGS.STATE_STORAGE_KEY, state, "更新全局状态");
        },
updateWorker(roomId, status, statusText, options = {}) {
          if (!roomId) return;
          const state = this.get();
          const oldTabData = state.tabs[roomId] || {};
          if (status === "DISCONNECTED" && oldTabData.status === "SWITCHING") {
            Utils.log(`[状态管理] 检测到正在切换的标签页已断开连接，判定为成功关闭，立即清理。`);
            this.removeWorker(roomId);
            return;
          }
          if (Object.keys(state.tabs).length === 0 && status === "SWITCHING") {
            Utils.log(`[状态管理] 检测到全局状态已清空，忽略残留的SWITCHING状态更新 (房间: ${roomId})`);
            return;
          }
          const updates = {
            status,
            statusText,
            lastUpdateTime: Date.now(),
            ...options
          };
          const newTabData = { ...oldTabData, ...updates };
          for (const key in newTabData) {
            if (newTabData[key] === null) {
              delete newTabData[key];
            }
          }
          state.tabs[roomId] = newTabData;
          this.set(state);
        },
removeWorker(roomId) {
          if (!roomId) return;
          const state = this.get();
          delete state.tabs[roomId];
          this.set(state);
        },
setDailyLimit(reached) {
          GM_setValue(SETTINGS.DAILY_LIMIT_REACHED_KEY, { reached, timestamp: Date.now() });
        },
getDailyLimit() {
          return GM_getValue(SETTINGS.DAILY_LIMIT_REACHED_KEY);
        }
      };
      var _GM_cookie = (() => typeof GM_cookie != "undefined" ? GM_cookie : void 0)();
      var _GM_xmlhttpRequest = (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
      const DouyuAPI = {
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
                    const rooms = response.response.data.redBagList.map((item) => item.rid).filter(Boolean).slice(0, count * 2).map((rid2) => `https://www.douyu.com/${rid2}`);
                    Utils.log(`API 成功返回 ${rooms.length} 个房间URL。`);
                    resolve(rooms);
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
getCookie: function(cookieName) {
          return new Promise((resolve, reject) => {
            _GM_cookie.list({ name: cookieName }, function(cookies, error) {
              if (error) {
                Utils.log(error);
                reject(error);
              } else if (cookies && cookies.length > 0) {
                resolve(cookies[0]);
              } else {
                resolve(null);
              }
            });
          });
        },
getCoinRecord: function(current, count, rid, retries = SETTINGS.API_RETRY_COUNT) {
          return new Promise((resolve, reject) => {
            this.getCookie("acf_auth").then((acfCookie) => {
              if (!acfCookie) {
                Utils.log("获取cookie错误");
                reject(new Error("获取cookie错误"));
                return;
              }
              const fullUrl = `${SETTINGS.COIN_LIST_URL}?current=${current}&pageSize=${count}&rid=${rid}`;
              const attempt = (remainingTries) => {
                Utils.log(
                  `开始调用 API 获取金币历史列表... (剩余重试次数: ${remainingTries})`
                );
                _GM_xmlhttpRequest({
                  method: "GET",
                  url: fullUrl,
                  headers: {
                    Referer: "https://www.douyu.com/",
                    "User-Agent": navigator.userAgent
                  },
                  cookie: acfCookie["value"],
                  responseType: "json",
                  timeout: 1e4,
                  onload: (response) => {
                    if (response.status === 200 && response.response?.error === 0 && Array.isArray(response.response.data.list)) {
                      const coinListData = response.response.data.list.filter(
                        (item) => item.opDirection === 1 && item.remark.includes("红包")
                      );
                      Utils.log(`API 成功返回 ${coinListData.length} 个红包记录。`);
                      resolve(coinListData);
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
            }).catch((error) => {
              Utils.log(error);
              reject(error);
            });
          });
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
      function activateRangeSlider(parentElement) {
        const wrapper = parentElement.querySelector(".qmx-range-slider-wrapper");
        if (!wrapper) {
          return;
        }
        const minSlider = wrapper.querySelector("#setting-min-delay");
        const maxSlider = wrapper.querySelector("#setting-max-delay");
        const sliderValues = wrapper.querySelector(".qmx-range-slider-values");
        const progress = wrapper.querySelector(".qmx-range-slider-progress");
        if (!minSlider || !maxSlider || !sliderValues || !progress) {
          console.error("范围滑块组件缺少必要的子元素 (min/max slider, values, progress)。");
          return;
        }
        function updateSliderView() {
          if (parseFloat(minSlider.value) > parseFloat(maxSlider.value)) {
            maxSlider.value = minSlider.value;
          }
          sliderValues.textContent = `${minSlider.value} s - ${maxSlider.value} s`;
          const minPercent = (minSlider.value - minSlider.min) / (minSlider.max - minSlider.min) * 100;
          const maxPercent = (maxSlider.value - maxSlider.min) / (maxSlider.max - minSlider.min) * 100;
          progress.style.left = `${minPercent}%`;
          progress.style.width = `${maxPercent - minPercent}%`;
        }
        minSlider.addEventListener("input", updateSliderView);
        maxSlider.addEventListener("input", updateSliderView);
        updateSliderView();
      }
      let tooltipElement = null;
      function _ensureTooltipElement() {
        if (!tooltipElement) {
          tooltipElement = document.createElement("div");
          tooltipElement.id = "qmx-global-tooltip";
          document.body.appendChild(tooltipElement);
        }
      }
      function activateToolTips(parentElement, tooltipData) {
        if (!parentElement || typeof tooltipData !== "object") {
          console.warn("[Tooltip] 调用失败：必须提供 parentElement 和 tooltipData。");
          return;
        }
        _ensureTooltipElement();
        parentElement.addEventListener("mouseover", (e) => {
          const trigger = e.target.closest(".qmx-tooltip-icon");
          if (!trigger) return;
          const key = trigger.dataset.tooltipKey;
          const text = tooltipData[key];
          if (text) {
            tooltipElement.textContent = text;
            const triggerRect = trigger.getBoundingClientRect();
            const left = triggerRect.left + triggerRect.width / 2;
            const top = triggerRect.top;
            tooltipElement.style.left = `${left}px`;
            tooltipElement.style.top = `${top}px`;
            tooltipElement.style.transform = `translate(-50%, calc(-100% - 8px))`;
            tooltipElement.classList.add("visible");
          }
        });
        parentElement.addEventListener("mouseout", (e) => {
          const trigger = e.target.closest(".qmx-tooltip-icon");
          if (trigger) {
            tooltipElement.classList.remove("visible");
          }
        });
      }
      const SettingsPanel = {
show() {
          const modal = document.getElementById("qmx-settings-modal");
          const allTooltips = {
            "control-room": "只有在此房间号的直播间中才能看到插件面板，看准了再改！",
            "auto-pause": "自动暂停非控制直播间的视频播放，大幅降低资源占用。",
            "initial-script-delay": "页面加载后等待多久再运行脚本，可适当增加以确保页面完全加载。",
            "auto-pause-delay": "领取红包后等待多久再次尝试暂停视频。",
            "unresponsive-timeout": "工作页多久未汇报任何状态后，在面板上标记为“无响应”。",
            "red-envelope-timeout": "进入直播间后，最长等待多久来寻找红包活动，超时后将切换房间。",
            "popup-wait-timeout": "点击红包后，等待领取弹窗出现的最长时间。",
            "worker-loading-timeout": "新开的直播间卡在加载状态多久还没显示播放组件，被判定为加载失败或缓慢。",
            "range-delay": "脚本在每次点击等操作前后随机等待的时间范围，模拟真人行为。",
            "close-tab-delay": "旧页面在打开新页面后，等待多久再关闭自己，确保新页面已接管。",
            "switching-cleanup-timeout": "处于“切换中”状态的标签页，超过此时间后将被强行清理，避免残留。",
            "max-worker-tabs": "同时运行的直播间数量上限。",
            "api-room-fetch-count": "每次从API获取的房间数。增加可提高找到新房间的几率。",
            "api-retry-count": "获取房间列表失败时的重试次数。",
            "api-retry-delay": "API请求失败后，等待多久再重试。",
            "healthcheck-interval": "哨兵检查后台UI的频率。值越小，UI节流越快，但会增加资源占用。",
            "disconnected-grace-period": "刷新或关闭的标签页，在被彻底清理前等待重连的宽限时间。",
            "calibration-mode": "启用校准模式可提高倒计时精准度。注意：启用此项前请先关闭DouyuEx的 阻止P2P上传 功能",
            "stats-info": '此功能需要把"油猴管理面板->设置->安全->允许脚本访问 Cookie"改为ALL！！ 在控制面板中显示统计信息标签页，记录每日领取的红包数量和金币总额。',
            "stats-update-interval": "统计信息面板中数据更新的频率，值越小更新越及时，但会增加API使用次数。",
            "danmupro-mode": "启用斗鱼弹幕助手功能，可以在弹幕输入框中使用自动弹幕推荐等功能。"
          };
          modal.innerHTML = settingsPanelTemplate(SETTINGS);
          activateToolTips(modal, allTooltips);
          activateCustomSelects(modal);
          activateRangeSlider(modal);
          this.bindPanelEvents(modal);
          document.getElementById("qmx-modal-backdrop").classList.add("visible");
          modal.classList.add("visible");
          document.body.classList.add("qmx-modal-open-scroll-lock");
        },
hide() {
          const modal = document.getElementById("qmx-settings-modal");
          modal.classList.remove("visible");
          document.body.classList.remove("qmx-modal-open-scroll-lock");
          if (SETTINGS.MODAL_DISPLAY_MODE !== "centered" || !document.getElementById("qmx-modal-container").classList.contains("visible")) {
            document.getElementById("qmx-modal-backdrop").classList.remove("visible");
          }
        },
save() {
          const newSettings = {
CONTROL_ROOM_ID: document.getElementById("setting-control-room-id").value,
            AUTO_PAUSE_ENABLED: document.getElementById("setting-auto-pause").checked,
            ENABLE_DANMU_PRO: document.getElementById("setting-danmupro-mode").checked,
            DAILY_LIMIT_ACTION: document.getElementById("setting-daily-limit-action").value,
            MODAL_DISPLAY_MODE: document.getElementById("setting-modal-mode").value,
            SHOW_STATS_IN_PANEL: document.getElementById("setting-stats-info").checked,
            THEME: document.getElementById("setting-theme-mode").checked ? "dark" : "light",
INITIAL_SCRIPT_DELAY: parseFloat(document.getElementById("setting-initial-script-delay").value) * 1e3,
            AUTO_PAUSE_DELAY_AFTER_ACTION: parseFloat(document.getElementById("setting-auto-pause-delay").value) * 1e3,
            SWITCHING_CLEANUP_TIMEOUT: parseFloat(document.getElementById("setting-switching-cleanup-timeout").value) * 1e3,
            UNRESPONSIVE_TIMEOUT: parseInt(document.getElementById("setting-unresponsive-timeout").value, 10) * 6e4,
            RED_ENVELOPE_LOAD_TIMEOUT: parseFloat(document.getElementById("setting-red-envelope-timeout").value) * 1e3,
            POPUP_WAIT_TIMEOUT: parseFloat(document.getElementById("setting-popup-wait-timeout").value) * 1e3,
            CALIBRATION_MODE_ENABLED: document.getElementById("setting-calibration-mode").checked,
            ELEMENT_WAIT_TIMEOUT: parseFloat(document.getElementById("setting-worker-loading-timeout").value) * 1e3,
            MIN_DELAY: parseFloat(document.getElementById("setting-min-delay").value) * 1e3,
            MAX_DELAY: parseFloat(document.getElementById("setting-max-delay").value) * 1e3,
            CLOSE_TAB_DELAY: parseFloat(document.getElementById("setting-close-tab-delay").value) * 1e3,
            HEALTHCHECK_INTERVAL: parseFloat(document.getElementById("setting-healthcheck-interval").value) * 1e3,
            DISCONNECTED_GRACE_PERIOD: parseFloat(document.getElementById("setting-disconnected-grace-period").value) * 1e3,
            STATS_UPDATE_INTERVAL: parseFloat(document.getElementById("setting-stats-update-interval").value) * 1e3,
MAX_WORKER_TABS: parseInt(document.getElementById("setting-max-tabs").value, 10),
            API_ROOM_FETCH_COUNT: parseInt(document.getElementById("setting-api-fetch-count").value, 10),
            API_RETRY_COUNT: parseInt(document.getElementById("setting-api-retry-count").value, 10),
            API_RETRY_DELAY: parseFloat(document.getElementById("setting-api-retry-delay").value) * 1e3
          };
          const existingUserSettings = GM_getValue(SettingsManager.STORAGE_KEY, {});
          const finalSettingsToSave = Object.assign(existingUserSettings, newSettings);
          delete finalSettingsToSave.OPEN_TAB_DELAY;
          SettingsManager.save(finalSettingsToSave);
          alert("设置已保存！页面将刷新以应用所有更改。");
          window.location.reload();
        },
bindPanelEvents(modal) {
          modal.querySelector("#qmx-settings-cancel-btn").onclick = () => this.hide();
          modal.querySelector("#qmx-settings-save-btn").onclick = () => this.save();
          modal.querySelector("#qmx-settings-reset-btn").onclick = () => {
            if (confirm("确定要恢复所有默认设置吗？此操作会刷新页面。")) {
              SettingsManager.reset();
              window.location.reload();
            }
          };
          modal.querySelectorAll(".tab-link").forEach((button) => {
            button.onclick = (e) => {
              const tabId = e.target.dataset.tab;
              modal.querySelector(".tab-link.active")?.classList.remove("active");
              modal.querySelector(".tab-content.active")?.classList.remove("active");
              e.target.classList.add("active");
              modal.querySelector(`#tab-${tabId}`).classList.add("active");
            };
          });
          const themeToggle = modal.querySelector("#setting-theme-mode");
          if (themeToggle) {
            themeToggle.addEventListener("change", (e) => {
              const newTheme = e.target.checked ? "dark" : "light";
              ThemeManager.applyTheme(newTheme);
            });
          }
        }
};
      const FirstTimeNotice = {
showCalibrationNotice() {
          const NOTICE_SHOWN_KEY = "douyu_qmx_calibration_notice_shown";
          const hasShownNotice = GM_getValue(NOTICE_SHOWN_KEY, false);
          if (!hasShownNotice) {
            const noticeHTML = `
                <div class="qmx-modal-header">
                    <h3>星推荐助手提示</h3>
                    <button id="qmx-notice-close-btn" class="qmx-modal-close-icon" title="关闭"></button>
                </div>
                <div class="qmx-modal-content">
                    <p>新增弹幕助手功能😋，助力畅快发弹幕，使用方法详见设置->弹幕助手</p>
                    <p>如需关闭此功能，关闭‘设置->基本设置->启用弹幕助手😋’即可</p>
                    <h4> 项目地址<a href="https://github.com/ienone/douyu-qmx-pro" target="_blank" rel="noopener noreferrer">douyu-qmx-pro</a>，求个star🌟~~</h4>
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
              GM_setValue(NOTICE_SHOWN_KEY, true);
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
      const typedSettings = SETTINGS;
      const globalValue = {
        currentDatePage: Utils.formatDateAsBeijing( new Date()),
updateIntervalID: void 0,
        statElements: new Map()
      };
      const StatsInfo = {
        init: async function() {
          let stats;
          try {
            stats = await Utils.getElementWithRetry(".qmx-stats-content");
          } catch (error) {
            Utils.log(`[数据统计] 初始化失败，错误: ${error}`);
            return;
          }
          const statsConfigs = [
            ["receivedCount", "已领个数"],
            ["total", "总金币"],
            ["avg", "平均每个"]
          ];
          for (const [name, nickname] of statsConfigs) {
            const element = this.initRender(name, nickname);
            stats.appendChild(element);
            try {
              const details = await Utils.getElementWithRetry(".qmx-stat-details", element);
              if (details) {
                globalValue.statElements.set(
                  name,
                  details
                );
              }
            } catch (error) {
              Utils.log(`[数据统计] 缓存元素获取失败: ${error}`);
            }
          }
          GM_setValue("douyu_qmx_stats_lock", false);
          this.ensureTodayDataExists();
          this.updateTodayData();
          await this.getCoinListUpdate();
          this.removeExpiredData();
          this.bindEvents();
          this.updateInterval();
          setInterval(() => {
            this.updateDataForDailyReset();
          }, 60 * 1e3);
        },
updateInterval: function() {
          if (globalValue.updateIntervalID) {
            clearInterval(globalValue.updateIntervalID);
            globalValue.updateIntervalID = void 0;
          }
          globalValue.updateIntervalID = setInterval(() => {
            this.checkUpdate();
          }, typedSettings.STATS_UPDATE_INTERVAL);
        },
ensureTodayDataExists: function() {
          const today = Utils.formatDateAsBeijing( new Date());
          let allData = GM_getValue(typedSettings.STATS_INFO_STORAGE_KEY, null);
          if (!allData || typeof allData !== "object") {
            allData = {};
          }
          if (!allData[today]) {
            allData[today] = {
              receivedCount: 0,
              avg: 0,
              total: 0
            };
            GM_setValue(typedSettings.STATS_INFO_STORAGE_KEY, allData);
          }
          return { allData, todayData: allData[today], today };
        },
bindEvents: function() {
          try {
            this.bindRefreshEvent();
            this.bindSwitcherLeft();
            this.bindSwitcherRight();
          } catch (e) {
            Utils.log(`[数据统计] 绑定事件异常: ${e}`);
            setTimeout(() => {
              this.bindEvents();
            }, 500);
          }
        },
bindRefreshEvent: function() {
          const refreshButton = document.querySelector(".qmx-stats-refresh");
          const today = Utils.formatDateAsBeijing( new Date());
          if (!refreshButton) {
            throw new Error("无法找到刷新按钮元素");
          }
          if (globalValue.currentDatePage !== today) {
            refreshButton.classList.add("disabled");
            refreshButton.onclick = null;
            return;
          }
          setTimeout(() => {
            refreshButton.classList.remove("disabled");
          }, 300);
          refreshButton.onclick = async (e) => {
            e.stopPropagation();
            void refreshButton.offsetWidth;
            refreshButton.classList.add("rotating");
            setTimeout(() => {
              refreshButton.classList.remove("rotating");
            }, 1e3);
            await this.getCoinListUpdate();
          };
        },
bindSwitcher: function(direction) {
          const { allData, today } = this.ensureTodayDataExists();
          globalValue.currentDatePage = globalValue.currentDatePage ?? today;
          const dateList = Object.keys(allData);
          const currentIndex = dateList.indexOf(globalValue.currentDatePage);
          const statsLable = document.querySelector(".qmx-stats-label");
          const indecator = document.querySelector(".qmx-stats-indicator");
          const button = document.querySelector(`#qmx-stats-${direction}`);
          if (!statsLable || !indecator || !button) {
            Utils.log("[数据统计] 切换按钮绑定失败，正在重试");
            setTimeout(() => {
              this.bindSwitcher(direction);
            }, 500);
            return;
          }
          const shouldDisableButton = direction === "left" ? dateList.length <= 1 || currentIndex - 1 < 0 : dateList.length <= 1 || currentIndex + 1 >= dateList.length;
          if (shouldDisableButton) {
            button.classList.add("disabled");
            button.onclick = null;
            return;
          }
          button.classList.remove("disabled");
          button.onclick = (e) => {
            e.stopPropagation();
            const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
            if (newIndex >= 0 && newIndex < dateList.length) {
              globalValue.currentDatePage = dateList[newIndex];
              this.refreshUI(allData[globalValue.currentDatePage]);
              this.bindEvents();
            }
            this.itemTransiton(indecator);
            if (globalValue.currentDatePage !== today) {
              this.contentTransition(statsLable, globalValue.currentDatePage);
            } else {
              this.contentTransition(statsLable, "今日统计");
            }
            if (globalValue.currentDatePage === today) {
              this.updateInterval();
              this.getCoinListUpdate();
            } else {
              clearInterval(globalValue.updateIntervalID);
              globalValue.updateIntervalID = void 0;
            }
          };
        },
bindSwitcherLeft: function() {
          this.bindSwitcher("left");
        },
bindSwitcherRight: function() {
          this.bindSwitcher("right");
        },
contentTransition: function(element, newText, duration = 300) {
          element.classList.add("transitioning");
          setTimeout(() => {
            element.textContent = newText;
            element.classList.remove("transitioning");
          }, duration);
        },
itemTransiton: function(element, duration = 300) {
          element.classList.add("transitioning");
          setTimeout(() => {
            element.classList.remove("transitioning");
          }, duration);
        },
initRender: function(name, nickname) {
          const newItem = document.createElement("div");
          newItem.className = "qmx-modal-stats-child";
          const className = "qmx-stat-info-" + name;
          newItem.innerHTML = `
                <div class=${className}>
                    <div class="qmx-stat-header">
                        <span class="qmx-stat-nickname">${nickname}</span>
                    </div>
                    <div class="qmx-stat-details">
                        <span class="qmx-stat-item">0</span>
                    </div>
                </div>
            `;
          return newItem;
        },
updateTodayData: function() {
          const { allData, todayData } = this.ensureTodayDataExists();
          if (!todayData) return;
          todayData.avg = todayData.receivedCount ? parseFloat((todayData.total / todayData.receivedCount).toFixed(2)) : 0;
          if (!Utils.lockChecker("douyu_qmx_stats_lock", this.updateTodayData.bind(this))) return;
          Utils.setLocalValueWithLock(
            "douyu_qmx_stats_lock",
            typedSettings.STATS_INFO_STORAGE_KEY,
            allData,
            "更新今日统计数据"
          );
          this.refreshUI(todayData);
        },
set: function(name, value) {
          const { allData, todayData } = this.ensureTodayDataExists();
          if (!todayData) return;
          todayData[name] = value;
          if (!Utils.lockChecker("douyu_qmx_stats_lock", this.set.bind(this), name, value)) return;
          Utils.setLocalValueWithLock(
            "douyu_qmx_stats_lock",
            typedSettings.STATS_INFO_STORAGE_KEY,
            allData,
            "更新统计数据"
          );
          this.refreshUI(todayData);
        },
getCoinListUpdate: async function() {
          const currentRoomId = Utils.getCurrentRoomId();
          if (!currentRoomId) {
            Utils.log("[统计] 无法获取当前房间ID，跳过金币记录更新。");
            return;
          }
          const coinList = await DouyuAPI.getCoinRecord(1, 100, currentRoomId, 3);
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const filteredData = coinList.filter(
            (item) => item.createTime > startOfToday.getTime() / 1e3
          );
          const totalCoin = filteredData.reduce((sum, item) => sum + item.balanceDiff, 0);
          const updateList = [
            ["receivedCount", filteredData.length],
            ["total", totalCoin]
          ];
          updateList.forEach(([name, value]) => {
            this.set(name, value);
          });
          this.updateTodayData();
        },
refreshUI: function(todayData) {
          for (const key in todayData) {
            try {
              const typedKey = key;
              const element = globalValue.statElements.get(typedKey);
              if (!element) continue;
              this.contentTransition(element, todayData[typedKey].toString());
            } catch (e) {
              Utils.log(`[StatsInfo] UI刷新异常: ${e}`);
              continue;
            }
          }
        },
removeExpiredData: function() {
          const allData = this.ensureTodayDataExists().allData;
          const newAllData = Object.keys(allData).filter((dateString) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const date = new Date(dateString);
            const diff = today.getTime() - date.getTime();
            const dayDiff = diff / (1e3 * 60 * 60 * 24);
            return dayDiff <= 6;
          }).reduce((obj, key) => {
            return Object.assign(obj, { [key]: allData[key] });
          }, {});
          GM_setValue(typedSettings.STATS_INFO_STORAGE_KEY, newAllData);
          Utils.log("[数据统计]：已清理过期数据");
        },
updateDataForDailyReset: function() {
          const allData = GM_getValue(
            typedSettings.STATS_INFO_STORAGE_KEY,
            null
          );
          if (!allData || typeof allData !== "object") {
            this.ensureTodayDataExists();
            this.updateTodayData();
            this.removeExpiredData();
            return;
          }
          const lastDate = Object.keys(allData).at(-1);
          const nowDate = Utils.formatDateAsBeijing( new Date());
          if (lastDate !== nowDate) {
            this.updateTodayData();
            this.removeExpiredData();
          }
        },
checkUpdate: function() {
          const state = GlobalState.get();
          const tabList = document.getElementById("qmx-tab-list");
          if (!tabList) return;
          const tabIds = Object.keys(state.tabs);
          tabIds.forEach((roomId) => {
            const tabData = state.tabs[roomId];
            const currentStatusText = tabData.statusText;
            if (typedSettings.SHOW_STATS_IN_PANEL) {
              if (currentStatusText.includes("领取到")) {
                this.getCoinListUpdate();
              }
            }
          });
        }
      };
      const ControlPage = {
injectionTarget: null,
isPanelInjected: false,
commandChannel: null,
init() {
          Utils.log("当前是控制页面，开始设置UI...");
          this.commandChannel = new BroadcastChannel("douyu_qmx_commands");
          ThemeManager.applyTheme(SETTINGS.THEME);
          this.createHTML();
          const qmxModalHeader = document.querySelector(".qmx-modal-header");
          if (SETTINGS.SHOW_STATS_IN_PANEL) {
            if (qmxModalHeader) {
              qmxModalHeader.style.padding = "12px 20px 0px 20px;";
            }
            StatsInfo.init();
          } else {
            const statsContent = document.querySelector(".qmx-stats-container");
            if (statsContent && qmxModalHeader) {
              statsContent.remove();
              qmxModalHeader.style.padding = "16px 24px";
            }
          }
          this.applyModalMode();
          this.bindEvents();
          setInterval(() => {
            this.renderDashboard();
            this.cleanupAndMonitorWorkers();
          }, 1e3);
          FirstTimeNotice.showCalibrationNotice();
          window.addEventListener("beforeunload", () => {
            if (this.commandChannel) {
              this.commandChannel.close();
            }
          });
          window.addEventListener("resize", () => {
            this.correctButtonPosition();
          });
        },
        createHTML() {
          Utils.log("创建UI的HTML结构...");
          const modalBackdrop = document.createElement("div");
          modalBackdrop.id = "qmx-modal-backdrop";
          const modalContainer = document.createElement("div");
          modalContainer.id = "qmx-modal-container";
          modalContainer.innerHTML = mainPanelTemplate(SETTINGS.MAX_WORKER_TABS);
          document.body.appendChild(modalBackdrop);
          document.body.appendChild(modalContainer);
          const mainButton = document.createElement("button");
          mainButton.id = SETTINGS.DRAGGABLE_BUTTON_ID;
          mainButton.innerHTML = `<span class="icon">🎁</span>`;
          document.body.appendChild(mainButton);
          const settingsModal = document.createElement("div");
          settingsModal.id = "qmx-settings-modal";
          document.body.appendChild(settingsModal);
          const globalTooltip = document.createElement("div");
          globalTooltip.id = "qmx-global-tooltip";
          document.body.appendChild(globalTooltip);
        },
cleanupAndMonitorWorkers() {
          const state = GlobalState.get();
          let stateModified = false;
          for (const roomId in state.tabs) {
            const tab = state.tabs[roomId];
            const timeSinceLastUpdate = Date.now() - tab.lastUpdateTime;
            if (tab.status === "DISCONNECTED" && timeSinceLastUpdate > SETTINGS.DISCONNECTED_GRACE_PERIOD) {
              Utils.log(
                `[监控] 任务 ${roomId} (已断开) 超过 ${SETTINGS.DISCONNECTED_GRACE_PERIOD / 1e3} 秒未重连，执行清理。`
              );
              delete state.tabs[roomId];
              stateModified = true;
              continue;
            }
            if (tab.status === "SWITCHING" && timeSinceLastUpdate > SETTINGS.SWITCHING_CLEANUP_TIMEOUT) {
              Utils.log(`[监控] 任务 ${roomId} (切换中) 已超时，判定为已关闭，执行清理。`);
              delete state.tabs[roomId];
              stateModified = true;
              continue;
            }
            if (timeSinceLastUpdate > SETTINGS.UNRESPONSIVE_TIMEOUT && tab.status !== "UNRESPONSIVE") {
              Utils.log(`[监控] 任务 ${roomId} 已失联超过 ${SETTINGS.UNRESPONSIVE_TIMEOUT / 6e4} 分钟，标记为无响应。`);
              tab.status = "UNRESPONSIVE";
              tab.statusText = "心跳失联，请点击激活或关闭此标签页";
              stateModified = true;
            }
          }
          if (stateModified) {
            GlobalState.set(state);
          }
        },
bindEvents() {
          Utils.log("为UI元素绑定事件...");
          const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
          const modalContainer = document.getElementById("qmx-modal-container");
          const modalBackdrop = document.getElementById("qmx-modal-backdrop");
          const statsToggle = document.getElementById("qmx-stats-toggle");
          const statsContent = document.getElementById("qmx-stats-content");
          if (statsToggle && statsContent) {
            statsToggle.addEventListener("click", () => {
              const isExpanded = statsToggle.classList.contains("expanded");
              if (isExpanded) {
                statsToggle.classList.remove("expanded");
                statsContent.classList.remove("expanded");
              } else {
                statsToggle.classList.add("expanded");
                statsContent.classList.add("expanded");
              }
            });
          }
          this.setupDrag(mainButton, SETTINGS.BUTTON_POS_STORAGE_KEY, () => this.showPanel());
          if (SETTINGS.MODAL_DISPLAY_MODE === "floating") {
            const modalHeader = modalContainer.querySelector(".qmx-modal-header");
            this.setupDrag(modalContainer, "douyu_qmx_modal_position", null, modalHeader);
          }
          document.getElementById("qmx-modal-close-btn").onclick = () => this.hidePanel();
          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modalContainer.classList.contains("visible")) {
              this.hidePanel();
            }
          });
          if (SETTINGS.MODAL_DISPLAY_MODE !== "inject-rank-list") {
            modalBackdrop.onclick = () => this.hidePanel();
          }
          document.getElementById("qmx-modal-open-btn").onclick = () => this.openOneNewTab();
          document.getElementById("qmx-modal-settings-btn").onclick = () => SettingsPanel.show();
          document.getElementById("qmx-modal-close-all-btn").onclick = async () => {
            if (confirm("确定要关闭所有工作标签页吗？")) {
              Utils.log("用户请求关闭所有标签页。");
              Utils.log("通过 BroadcastChannel 发出 CLOSE_ALL 指令...");
              this.commandChannel.postMessage({ action: "CLOSE_ALL", target: "*" });
              await new Promise((resolve) => setTimeout(resolve, 500));
              Utils.log("强制清空全局状态中的标签页列表...");
              let state = GlobalState.get();
              if (Object.keys(state.tabs).length > 0) {
                Utils.log(`清理前还有 ${Object.keys(state.tabs).length} 个标签页残留`);
                state.tabs = {};
                GlobalState.set(state);
              }
              this.renderDashboard();
              setTimeout(() => {
                state = GlobalState.get();
                if (Object.keys(state.tabs).length > 0) {
                  Utils.log("检测到残留标签页，执行二次清理...");
                  state.tabs = {};
                  GlobalState.set(state);
                  this.renderDashboard();
                }
              }, 1e3);
            }
          };
          document.getElementById("qmx-tab-list").addEventListener("click", (e) => {
            const closeButton = e.target.closest(".qmx-tab-close-btn");
            if (!closeButton) return;
            const roomItem = e.target.closest("[data-room-id]");
            const roomId = roomItem?.dataset.roomId;
            if (!roomId) return;
            Utils.log(`[控制中心] 用户请求关闭房间: ${roomId}。`);
            const state = GlobalState.get();
            delete state.tabs[roomId];
            GlobalState.set(state);
            Utils.log(`通过 BroadcastChannel 向 ${roomId} 发出 CLOSE 指令...`);
            this.commandChannel.postMessage({ action: "CLOSE", target: roomId });
            roomItem.style.opacity = "0";
            roomItem.style.transform = "scale(0.8)";
            roomItem.style.transition = "all 0.3s ease";
            setTimeout(() => roomItem.remove(), 300);
          });
        },
renderDashboard() {
          const state = GlobalState.get();
          const tabList = document.getElementById("qmx-tab-list");
          if (!tabList) return;
          const tabIds = Object.keys(state.tabs);
          document.getElementById("qmx-active-tabs-count").textContent = tabIds.length;
          const statusDisplayMap = {
            OPENING: "加载中",
            WAITING: "等待中",
            CLAIMING: "领取中",
            SWITCHING: "切换中",
            DORMANT: "休眠中",
            ERROR: "出错了",
            UNRESPONSIVE: "无响应",
            DISCONNECTED: "已断开",
            STALLED: "UI节流"
          };
          const existingRoomIds = new Set(
            Array.from(tabList.children).map((node) => node.dataset.roomId).filter(Boolean)
          );
          tabIds.forEach((roomId) => {
            const tabData = state.tabs[roomId];
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
              const nicknameEl = existingItem.querySelector(".qmx-tab-nickname");
              const statusNameEl = existingItem.querySelector(".qmx-tab-status-name");
              const statusTextEl = existingItem.querySelector(".qmx-tab-status-text");
              const dotEl = existingItem.querySelector(".qmx-tab-status-dot");
              if (tabData.nickname && nicknameEl.textContent !== tabData.nickname) {
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
            if (!state.tabs[roomId]) {
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
          let limitMessageEl = document.getElementById("qmx-limit-message");
          const openBtn = document.getElementById("qmx-modal-open-btn");
          if (limitState?.reached && Utils.formatDateAsBeijing(new Date(limitState.timestamp)) !== Utils.formatDateAsBeijing( new Date())) {
            Utils.log("[控制中心] 新的一天，重置每日上限旗标。");
            GlobalState.setDailyLimit(false);
            limitState = null;
          }
          if (limitState?.reached) {
            if (!limitMessageEl) {
              limitMessageEl = document.createElement("div");
              limitMessageEl.id = "qmx-limit-message";
              limitMessageEl.style.cssText = "padding: 10px 24px; background-color: var(--status-color-error); color: white; font-weight: 500; text-align: center;";
              const header = document.querySelector(".qmx-modal-header");
              header.parentNode.insertBefore(limitMessageEl, header.nextSibling);
              document.querySelector(".qmx-modal-header").after(limitMessageEl);
            }
            if (SETTINGS.DAILY_LIMIT_ACTION === "CONTINUE_DORMANT") {
              limitMessageEl.textContent = "今日已达上限。任务休眠中，可新增标签页为明日准备。";
              openBtn.disabled = false;
              openBtn.textContent = "新增休眠标签页";
            } else {
              limitMessageEl.textContent = "今日已达上限。任务已全部停止。";
              openBtn.disabled = true;
              openBtn.textContent = "今日已达上限";
            }
          } else {
            if (limitMessageEl) limitMessageEl.remove();
            openBtn.disabled = false;
            openBtn.textContent = "打开新房间";
          }
        },
async openOneNewTab() {
          const openBtn = document.getElementById("qmx-modal-open-btn");
          if (openBtn.disabled) return;
          const state = GlobalState.get();
          const openedCount = Object.keys(state.tabs).length;
          if (openedCount >= SETTINGS.MAX_WORKER_TABS) {
            Utils.log(`已达到最大标签页数量 (${SETTINGS.MAX_WORKER_TABS})。`);
            return;
          }
          openBtn.disabled = true;
          openBtn.textContent = "正在查找...";
          try {
            const openedRoomIds = new Set(Object.keys(state.tabs));
            const apiRoomUrls = await DouyuAPI.getRooms(SETTINGS.API_ROOM_FETCH_COUNT, SETTINGS.CONTROL_ROOM_ID);
            const newUrl = apiRoomUrls.find((url) => {
              const rid = url.match(/\/(\d+)/)?.[1];
              return rid && !openedRoomIds.has(rid);
            });
            if (newUrl) {
              const newRoomId = newUrl.match(/\/(\d+)/)[1];
              const pendingWorkers = GM_getValue("qmx_pending_workers", []);
              pendingWorkers.push(newRoomId);
              GM_setValue("qmx_pending_workers", pendingWorkers);
              Utils.log(`已将房间 ${newRoomId} 加入待处理列表。`);
              GlobalState.updateWorker(newRoomId, "OPENING", "正在打开...");
              if (window.location.href.includes("/beta") || localStorage.getItem("newWebLive") !== "A") {
                localStorage.setItem("newWebLive", "A");
              }
              GM_openInTab(newUrl, { active: false, setParent: true });
              Utils.log(`打开指令已发送: ${newUrl}`);
            } else {
              Utils.log("未能找到新的、未打开的房间。");
              openBtn.textContent = "无新房间";
              await Utils.sleep(SETTINGS.UI_FEEDBACK_DELAY);
            }
          } catch (error) {
            Utils.log(`查找或打开房间时出错: ${error.message}`);
            openBtn.textContent = "查找出错";
            await Utils.sleep(SETTINGS.UI_FEEDBACK_DELAY);
          } finally {
            openBtn.disabled = false;
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
          const savedPos = GM_getValue(storageKey);
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
              GM_setValue(storageKey, currentRatio);
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
              GM_setValue(storageKey, { ratioX, ratioY });
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
            this.injectionTarget.classList.add("qmx-hidden");
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
            if (this.injectionTarget) {
              this.injectionTarget.classList.remove("qmx-hidden");
            }
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
          const statusColor = `var(--status-color-${tabData.status.toLowerCase()}, #9E9E9E)`;
          const nickname = tabData.nickname || "加载中...";
          const statusName = statusMap[tabData.status] || tabData.status;
          newItem.innerHTML = `
                <div class="qmx-tab-status-dot" style="background-color: ${statusColor};"></div>
                <div class="qmx-tab-info">
                    <div class="qmx-tab-header">
                        <span class="qmx-tab-nickname">${nickname}</span>
                        <span class="qmx-tab-room-id">${roomId}</span>
                    </div>
                    <div class="qmx-tab-details">
                        <span class="qmx-tab-status-name">[${statusName}]</span>
                        <span class="qmx-tab-status-text">${statusText}</span>
                    </div>
                </div>
                <button class="qmx-tab-close-btn" title="关闭该标签页">×</button>
            `;
          return newItem;
        },
applyModalMode() {
          const modalContainer = document.getElementById("qmx-modal-container");
          if (!modalContainer) return;
          const mode = SETTINGS.MODAL_DISPLAY_MODE;
          Utils.log(`尝试应用模态框模式: ${mode}`);
          if (mode === "inject-rank-list") {
            const waitForTarget = (retries = SETTINGS.INJECT_TARGET_RETRIES, interval = SETTINGS.INJECT_TARGET_INTERVAL) => {
              const target = document.querySelector(SETTINGS.SELECTORS.rankListContainer);
              if (target) {
                Utils.log("注入目标已找到，开始注入...");
                this.injectionTarget = target;
                this.isPanelInjected = true;
                target.parentNode.insertBefore(modalContainer, target.nextSibling);
                modalContainer.classList.add("mode-inject-rank-list", "qmx-hidden");
              } else if (retries > 0) {
                setTimeout(() => waitForTarget(retries - 1, interval), interval);
              } else {
                Utils.log(`[注入失败] 未找到目标元素 "${SETTINGS.SELECTORS.rankListContainer}"。`);
                Utils.log("[降级] 自动切换到 'floating' 备用模式。");
                SETTINGS.MODAL_DISPLAY_MODE = "floating";
                this.applyModalMode();
                SETTINGS.MODAL_DISPLAY_MODE = "inject-rank-list";
              }
            };
            waitForTarget();
            return;
          }
          this.isPanelInjected = false;
          modalContainer.classList.remove("mode-inject-rank-list", "qmx-hidden");
          modalContainer.classList.add(`mode-${mode}`);
        },
correctButtonPosition() {
          const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
          const storageKey = SETTINGS.BUTTON_POS_STORAGE_KEY;
          if (!mainButton) return;
          const savedPos = GM_getValue(storageKey);
          if (savedPos && typeof savedPos.ratioX === "number" && typeof savedPos.ratioY === "number") {
            const newX = savedPos.ratioX * (window.innerWidth - mainButton.offsetWidth);
            const newY = savedPos.ratioY * (window.innerHeight - mainButton.offsetHeight);
            mainButton.style.setProperty("--tx", `${newX}px`);
            mainButton.style.setProperty("--ty", `${newY}px`);
          }
        }
      };
      const DOM = {
async findElement(selector, timeout = SETTINGS.PANEL_WAIT_TIMEOUT, parent = document) {
          const startTime = Date.now();
          while (Date.now() - startTime < timeout) {
            const element = parent.querySelector(selector);
            if (element && window.getComputedStyle(element).display !== "none") {
              return element;
            }
            await Utils.sleep(300);
          }
          Utils.log(`查找元素超时: ${selector}`);
          return null;
        },
async safeClick(element, description) {
          if (!element) {
            return false;
          }
          try {
            if (window.getComputedStyle(element).display === "none") {
              return false;
            }
            await Utils.sleep(Utils.getRandomDelay(SETTINGS.MIN_DELAY / 2, SETTINGS.MAX_DELAY / 2));
            element.click();
            await Utils.sleep(Utils.getRandomDelay());
            return true;
          } catch (error) {
            Utils.log(`[点击异常] ${description} 时发生错误: ${error.message}`);
            return false;
          }
        },
async checkForLimitPopup() {
          const limitPopup = await this.findElement(SETTINGS.SELECTORS.limitReachedPopup, 3e3);
          if (limitPopup && limitPopup.textContent.includes("已达上限")) {
            Utils.log("捕获到“已达上限”弹窗！");
            return true;
          }
          return false;
        }
      };
      const WorkerPage = {
healthCheckTimeoutId: null,
        currentTaskEndTime: null,
        lastHealthCheckTime: null,
        lastPageCountdown: null,
        stallLevel: 0,
remainingTimeMap: new Map(),
consecutiveStallCount: 0,
        previousDeviation: 0,
async init() {
          Utils.log("混合模式工作单元初始化...");
          const roomId = Utils.getCurrentRoomId();
          if (!roomId) {
            Utils.log("无法识别当前房间ID，脚本停止。");
            return;
          }
          GlobalState.updateWorker(roomId, "OPENING", "页面加载中...", { countdown: null, nickname: null });
          await Utils.sleep(1e3);
          this.startCommandListener(roomId);
          window.addEventListener("beforeunload", () => {
            GlobalState.updateWorker(Utils.getCurrentRoomId(), "DISCONNECTED", "连接已断开...");
            if (this.pauseSentinelInterval) {
              clearInterval(this.pauseSentinelInterval);
            }
          });
          Utils.log("正在等待页面关键元素 (#js-player-video) 加载...");
          const criticalElement = await DOM.findElement(SETTINGS.SELECTORS.criticalElement, SETTINGS.ELEMENT_WAIT_TIMEOUT);
          if (!criticalElement) {
            Utils.log("页面关键元素加载超时，此标签页可能无法正常工作，即将关闭。");
            await this.selfClose(roomId);
            return;
          }
          Utils.log("页面关键元素已加载。");
          Utils.log("开始检测 UI 版本 和红包活动...");
          if (window.location.href.includes("/beta")) {
            GlobalState.updateWorker(roomId, "OPENING", "切换旧版UI...");
            localStorage.setItem("newWebLive", "A");
            window.location.href = window.location.href.replace("/beta", "");
          }
          Utils.log("确认进入稳定工作状态，执行身份核销。");
          const pendingWorkers = GM_getValue("qmx_pending_workers", []);
          const myIndex = pendingWorkers.indexOf(roomId);
          if (myIndex > -1) {
            pendingWorkers.splice(myIndex, 1);
            GM_setValue("qmx_pending_workers", pendingWorkers);
            Utils.log(`房间 ${roomId} 已从待处理列表中移除。`);
          }
          const anchorNameElement = document.querySelector(SETTINGS.SELECTORS.anchorName);
          const nickname = anchorNameElement ? anchorNameElement.textContent.trim() : `房间${roomId}`;
          GlobalState.updateWorker(roomId, "WAITING", "寻找任务中...", { nickname, countdown: null });
          const limitState = GlobalState.getDailyLimit();
          if (limitState?.reached) {
            Utils.log("初始化检查：检测到全局上限旗标。");
            if (SETTINGS.DAILY_LIMIT_ACTION === "CONTINUE_DORMANT") {
              await this.enterDormantMode();
            } else {
              await this.selfClose(roomId);
            }
            return;
          }
          this.findAndExecuteNextTask(roomId);
          if (SETTINGS.AUTO_PAUSE_ENABLED) {
            this.pauseSentinelInterval = setInterval(() => this.autoPauseVideo(), 8e3);
          }
        },
        async findAndExecuteNextTask(roomId) {
          if (this.healthCheckTimeoutId) {
            clearTimeout(this.healthCheckTimeoutId);
            this.healthCheckTimeoutId = null;
          }
          this.stallLevel = 0;
          const limitState = GlobalState.getDailyLimit();
          if (limitState?.reached) {
            Utils.log(`[上限检查] 房间 ${roomId} 检测到已达每日上限。`);
            if (SETTINGS.DAILY_LIMIT_ACTION === "CONTINUE_DORMANT") {
              await this.enterDormantMode();
            } else {
              await this.selfClose(roomId);
            }
            return;
          }
          if (SETTINGS.AUTO_PAUSE_ENABLED) this.autoPauseVideo();
          const redEnvelopeDiv = await DOM.findElement(SETTINGS.SELECTORS.redEnvelopeContainer, SETTINGS.RED_ENVELOPE_LOAD_TIMEOUT);
          if (!redEnvelopeDiv) {
            GlobalState.updateWorker(roomId, "SWITCHING", "无活动, 切换中", { countdown: null });
            await this.switchRoom();
            return;
          }
          const statusSpan = redEnvelopeDiv.querySelector(SETTINGS.SELECTORS.countdownTimer);
          const statusText = statusSpan ? statusSpan.textContent.trim() : "";
          if (statusText.includes(":")) {
            const [minutes, seconds] = statusText.split(":").map(Number);
            const remainingSeconds = minutes * 60 + seconds;
            const currentCount = this.remainingTimeMap.get(remainingSeconds) || 0;
            this.remainingTimeMap.set(remainingSeconds, currentCount + 1);
            if (Array.from(this.remainingTimeMap.values()).some((value) => value > 3)) {
              GlobalState.updateWorker(roomId, "SWITCHING", "倒计时卡死, 切换中", { countdown: null });
              await this.switchRoom();
              return;
            }
            this.currentTaskEndTime = Date.now() + remainingSeconds * 1e3;
            this.lastHealthCheckTime = Date.now();
            this.lastPageCountdown = remainingSeconds;
            Utils.log(`发现新任务：倒计时 ${statusText}。`);
            GlobalState.updateWorker(roomId, "WAITING", `倒计时 ${statusText}`, {
              countdown: { endTime: this.currentTaskEndTime }
            });
            const wakeUpDelay = Math.max(0, remainingSeconds * 1e3 - 1500);
            Utils.log(`本单元将在约 ${Math.round(wakeUpDelay / 1e3)} 秒后唤醒执行任务。`);
            setTimeout(() => this.claimAndRecheck(roomId), wakeUpDelay);
            this.startHealthChecks(roomId, redEnvelopeDiv);
          } else if (statusText.includes("抢") || statusText.includes("领")) {
            GlobalState.updateWorker(roomId, "CLAIMING", "立即领取中...");
            await this.claimAndRecheck(roomId);
          } else {
            GlobalState.updateWorker(roomId, "WAITING", `状态未知, 稍后重试`, { countdown: null });
            setTimeout(() => this.findAndExecuteNextTask(roomId), 3e4);
          }
        },
startHealthChecks(roomId, redEnvelopeDiv) {
          const CHECK_INTERVAL = SETTINGS.HEALTHCHECK_INTERVAL;
          const STALL_THRESHOLD = 4;
          const check = () => {
            const currentPageStatus = redEnvelopeDiv.querySelector(SETTINGS.SELECTORS.countdownTimer)?.textContent.trim();
            if (!currentPageStatus || !currentPageStatus.includes(":")) {
              return;
            }
            const scriptRemainingSeconds = (this.currentTaskEndTime - Date.now()) / 1e3;
            const [pMin, pSec] = currentPageStatus.split(":").map(Number);
            const pageRemainingSeconds = pMin * 60 + pSec;
            const deviation = Math.abs(scriptRemainingSeconds - pageRemainingSeconds);
            const currentFormattedTime = Utils.formatTime(scriptRemainingSeconds);
            const pageFormattedTime = Utils.formatTime(pageRemainingSeconds);
            Utils.log(
              `[哨兵] 脚本倒计时: ${currentFormattedTime} | UI显示: ${pageFormattedTime} | 差值: ${deviation.toFixed(2)}秒`
            );
            Utils.log(`校准模式开启状态为 ${SETTINGS.CALIBRATION_MODE_ENABLED ? "开启" : "关闭"}`);
            if (SETTINGS.CALIBRATION_MODE_ENABLED) {
              if (deviation <= STALL_THRESHOLD) {
                const difference = scriptRemainingSeconds - pageRemainingSeconds;
                this.currentTaskEndTime = Date.now() + pageRemainingSeconds * 1e3;
                if (deviation > 0.1) {
                  const direction = difference > 0 ? "慢" : "快";
                  const calibrationMessage = `${direction}${deviation.toFixed(1)}秒, 已校准`;
                  Utils.log(`[校准] ${calibrationMessage}。新倒计时: ${pageFormattedTime}`);
                  GlobalState.updateWorker(roomId, "WAITING", calibrationMessage, {
                    countdown: { endTime: this.currentTaskEndTime }
                  });
                  setTimeout(() => {
                    if (this.currentTaskEndTime > Date.now()) {
                      GlobalState.updateWorker(roomId, "WAITING", `倒计时...`, {
                        countdown: { endTime: this.currentTaskEndTime }
                      });
                    }
                  }, 2500);
                } else {
                  GlobalState.updateWorker(roomId, "WAITING", `倒计时...`, {
                    countdown: { endTime: this.currentTaskEndTime }
                  });
                }
                this.consecutiveStallCount = 0;
                this.previousDeviation = 0;
                this.stallLevel = 0;
              } else {
                const deviationIncreasing = deviation > this.previousDeviation;
                this.previousDeviation = deviation;
                if (deviationIncreasing) {
                  this.consecutiveStallCount++;
                  Utils.log(`[警告] 检测到UI卡顿第 ${this.consecutiveStallCount} 次，差值: ${deviation.toFixed(2)}秒`);
                } else {
                  this.consecutiveStallCount = Math.max(0, this.consecutiveStallCount - 1);
                }
                if (this.consecutiveStallCount >= 3) {
                  Utils.log(`[严重] 连续检测到卡顿且差值增大，判定为卡死状态。`);
                  GlobalState.updateWorker(roomId, "SWITCHING", "倒计时卡死, 切换中", { countdown: null });
                  clearTimeout(this.healthCheckTimeoutId);
                  this.switchRoom();
                  return;
                }
                this.stallLevel = 1;
                GlobalState.updateWorker(roomId, "ERROR", `UI卡顿 (${deviation.toFixed(1)}秒)`, {
                  countdown: { endTime: this.currentTaskEndTime }
                });
              }
            } else {
              if (deviation > STALL_THRESHOLD) {
                if (this.stallLevel === 0) {
                  Utils.log(`[哨兵] 检测到UI节流。脚本精确倒计时: ${currentFormattedTime} | UI显示: ${pageFormattedTime}`);
                }
                this.stallLevel = 1;
                GlobalState.updateWorker(roomId, "STALLED", `UI节流中...`, {
                  countdown: { endTime: this.currentTaskEndTime }
                });
              } else {
                if (this.stallLevel > 0) {
                  Utils.log("[哨兵] UI已从节流中恢复。");
                  this.stallLevel = 0;
                }
                GlobalState.updateWorker(roomId, "WAITING", `倒计时 ${currentFormattedTime}`, {
                  countdown: { endTime: this.currentTaskEndTime }
                });
              }
            }
            if (scriptRemainingSeconds > CHECK_INTERVAL / 1e3 + 1) {
              this.healthCheckTimeoutId = setTimeout(check, CHECK_INTERVAL);
            }
          };
          this.healthCheckTimeoutId = setTimeout(check, CHECK_INTERVAL);
        },
async claimAndRecheck(roomId) {
          if (this.healthCheckTimeoutId) {
            clearTimeout(this.healthCheckTimeoutId);
            this.healthCheckTimeoutId = null;
          }
          Utils.log("开始执行领取流程...");
          GlobalState.updateWorker(roomId, "CLAIMING", "尝试打开红包...", { countdown: null });
          const redEnvelopeDiv = document.querySelector(SETTINGS.SELECTORS.redEnvelopeContainer);
          if (!await DOM.safeClick(redEnvelopeDiv, "右下角红包区域")) {
            Utils.log("点击红包区域失败，重新寻找任务。");
            await Utils.sleep(2e3);
            this.findAndExecuteNextTask(roomId);
            return;
          }
          const popup = await DOM.findElement(SETTINGS.SELECTORS.popupModal, SETTINGS.POPUP_WAIT_TIMEOUT);
          if (!popup) {
            Utils.log("等待红包弹窗超时，重新寻找任务。");
            await Utils.sleep(2e3);
            this.findAndExecuteNextTask(roomId);
            return;
          }
          const openBtn = popup.querySelector(SETTINGS.SELECTORS.openButton);
          if (await DOM.safeClick(openBtn, "红包弹窗的打开按钮")) {
            if (await DOM.checkForLimitPopup()) {
              GlobalState.setDailyLimit(true);
              Utils.log("检测到每日上限！");
              if (SETTINGS.DAILY_LIMIT_ACTION === "CONTINUE_DORMANT") {
                await this.enterDormantMode();
              } else {
                await this.selfClose(roomId);
              }
              return;
            }
            await Utils.sleep(1500);
            const successIndicator = await DOM.findElement(SETTINGS.SELECTORS.rewardSuccessIndicator, 3e3, popup);
            const reward = successIndicator ? "领取成功 " : "空包或失败";
            Utils.log(`领取操作完成，结果: ${reward}`);
            GlobalState.updateWorker(roomId, "WAITING", `领取到: ${reward}`, { countdown: null });
            const closeBtn = document.querySelector(SETTINGS.SELECTORS.closeButton);
            await DOM.safeClick(closeBtn, "领取结果弹窗的关闭按钮");
          } else {
            Utils.log("点击打开按钮失败。");
          }
          STATE.lastActionTime = Date.now();
          Utils.log("操作完成，2秒后在本房间内寻找下一个任务...");
          await Utils.sleep(2e3);
          this.findAndExecuteNextTask(roomId);
        },
async autoPauseVideo() {
          if (STATE.isSwitchingRoom || Date.now() - STATE.lastActionTime < SETTINGS.AUTO_PAUSE_DELAY_AFTER_ACTION) {
            return;
          }
          Utils.log("正在寻找暂停按钮...");
          const pauseBtn = await DOM.findElement(SETTINGS.SELECTORS.pauseButton, 5e3);
          if (pauseBtn) {
            if (await DOM.safeClick(pauseBtn, "暂停按钮")) {
              Utils.log("视频已通过脚本暂停。");
            }
          }
        },
async switchRoom() {
          if (this.healthCheckTimeoutId) {
            clearTimeout(this.healthCheckTimeoutId);
            this.healthCheckTimeoutId = null;
          }
          if (STATE.isSwitchingRoom) return;
          STATE.isSwitchingRoom = true;
          Utils.log("开始执行切换房间流程...");
          const currentRoomId = Utils.getCurrentRoomId();
          GlobalState.updateWorker(currentRoomId, "SWITCHING", "查找新房间...");
          try {
            const apiRoomUrls = await DouyuAPI.getRooms(SETTINGS.API_ROOM_FETCH_COUNT, currentRoomId);
            const currentState = GlobalState.get();
            const openedRoomIds = new Set(Object.keys(currentState.tabs));
            const nextUrl = apiRoomUrls.find((url) => {
              const rid = url.match(/\/(\d+)/)?.[1];
              return rid && !openedRoomIds.has(rid);
            });
            if (nextUrl) {
              Utils.log(`确定下一个房间链接: ${nextUrl}`);
              const nextRoomId = nextUrl.match(/\/(\d+)/)[1];
              const pendingWorkers = GM_getValue("qmx_pending_workers", []);
              pendingWorkers.push(nextRoomId);
              GM_setValue("qmx_pending_workers", pendingWorkers);
              Utils.log(`已将房间 ${nextRoomId} 加入待处理列表。`);
              if (window.location.href.includes("/beta") || localStorage.getItem("newWebLive") !== "A") {
                localStorage.setItem("newWebLive", "A");
              }
              GM_openInTab(nextUrl, { active: false, setParent: true });
              await Utils.sleep(SETTINGS.CLOSE_TAB_DELAY);
              await this.selfClose(currentRoomId);
            } else {
              Utils.log("API未能返回任何新的、未打开的房间，将关闭当前页。");
              await this.selfClose(currentRoomId);
            }
          } catch (error) {
            Utils.log(`切换房间时发生严重错误: ${error.message}`);
            await this.selfClose(currentRoomId);
          }
        },
async enterDormantMode() {
          const roomId = Utils.getCurrentRoomId();
          Utils.log(`[上限处理] 房间 ${roomId} 进入休眠模式。`);
          GlobalState.updateWorker(roomId, "DORMANT", "休眠中 (等待北京时间0点)", { countdown: null });
          const now = Utils.getBeijingTime();
          const tomorrow = new Date(now.getTime());
          tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
          tomorrow.setUTCHours(0, 0, 30, 0);
          const msUntilMidnight = tomorrow.getTime() - now.getTime();
          Utils.log(`将在 ${Math.round(msUntilMidnight / 1e3 / 60)} 分钟后自动刷新页面 (基于北京时间)。`);
          setTimeout(() => window.location.reload(), msUntilMidnight);
        },
async selfClose(roomId, fromCloseAll = false) {
          Utils.log(`本单元任务结束 (房间: ${roomId})，尝试更新状态并关闭。`);
          if (this.pauseSentinelInterval) {
            clearInterval(this.pauseSentinelInterval);
          }
          if (fromCloseAll) {
            Utils.log(`[关闭所有] 跳过状态更新，直接关闭标签页 (房间: ${roomId})`);
            GlobalState.removeWorker(roomId);
            await Utils.sleep(100);
            this.closeTab();
            return;
          }
          GlobalState.updateWorker(roomId, "SWITCHING", "任务结束，关闭中...");
          await Utils.sleep(100);
          GlobalState.removeWorker(roomId);
          await Utils.sleep(300);
          this.closeTab();
        },
closeTab() {
          try {
            window.close();
          } catch (e) {
            window.location.replace("about:blank");
            Utils.log(`关闭失败，故障为: ${e.message}`);
          }
        },
startCommandListener(roomId) {
          this.commandChannel = new BroadcastChannel("douyu_qmx_commands");
          Utils.log(`工作页 ${roomId} 已连接到指令广播频道。`);
          this.commandChannel.onmessage = (event) => {
            const { action, target } = event.data;
            if (target === roomId || target === "*") {
              Utils.log(`接收到广播指令: ${action} for target ${target}`);
              if (action === "CLOSE") {
                this.selfClose(roomId, false);
              } else if (action === "CLOSE_ALL") {
                this.selfClose(roomId, true);
              }
            }
          };
          window.addEventListener("beforeunload", () => {
            if (this.commandChannel) {
              this.commandChannel.close();
            }
          });
        }
      };
      const scriptRel = (function detectScriptRel() {
        const relList = typeof document !== "undefined" && document.createElement("link").relList;
        return relList && relList.supports && relList.supports("modulepreload") ? "modulepreload" : "preload";
      })();
      const assetsURL = function(dep) {
        return "/" + dep;
      };
      const seen = {};
      const __vitePreload = function preload(baseModule, deps, importerUrl) {
        let promise = Promise.resolve();
        if (deps && deps.length > 0) {
          let allSettled = function(promises$2) {
            return Promise.all(promises$2.map((p) => Promise.resolve(p).then((value$1) => ({
              status: "fulfilled",
              value: value$1
            }), (reason) => ({
              status: "rejected",
              reason
            }))));
          };
          document.getElementsByTagName("link");
          const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
          const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
          promise = allSettled(deps.map((dep) => {
            dep = assetsURL(dep);
            if (dep in seen) return;
            seen[dep] = true;
            const isCss = dep.endsWith(".css");
            const cssSelector = isCss ? '[rel="stylesheet"]' : "";
            if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
            const link = document.createElement("link");
            link.rel = isCss ? "stylesheet" : scriptRel;
            if (!isCss) link.as = "script";
            link.crossOrigin = "";
            link.href = dep;
            if (cspNonce) link.setAttribute("nonce", cspNonce);
            document.head.appendChild(link);
            if (isCss) return new Promise((res, rej) => {
              link.addEventListener("load", res);
              link.addEventListener("error", () => rej( new Error(`Unable to preload CSS for ${dep}`)));
            });
          }));
        }
        function handlePreloadError(err$2) {
          const e$1 = new Event("vite:preloadError", { cancelable: true });
          e$1.payload = err$2;
          window.dispatchEvent(e$1);
          if (!e$1.defaultPrevented) throw err$2;
        }
        return promise.then((res) => {
          for (const item of res || []) {
            if (item.status !== "rejected") continue;
            handlePreloadError(item.reason);
          }
          return baseModule().catch(handlePreloadError);
        });
      };
      var w;
      function H(a, c, b) {
        const e = typeof b, d = typeof a;
        if (e !== "undefined") {
          if (d !== "undefined") {
            if (b) {
              if (d === "function" && e === d) return function(k) {
                return a(b(k));
              };
              c = a.constructor;
              if (c === b.constructor) {
                if (c === Array) return b.concat(a);
                if (c === Map) {
                  var f = new Map(b);
                  for (var g of a) f.set(g[0], g[1]);
                  return f;
                }
                if (c === Set) {
                  g = new Set(b);
                  for (f of a.values()) g.add(f);
                  return g;
                }
              }
            }
            return a;
          }
          return b;
        }
        return d === "undefined" ? c : a;
      }
      function aa(a, c) {
        return typeof a === "undefined" ? c : a;
      }
      function I() {
        return Object.create(null);
      }
      function M(a) {
        return typeof a === "string";
      }
      function ba(a) {
        return typeof a === "object";
      }
      function ca(a, c) {
        if (M(c)) a = a[c];
        else for (let b = 0; a && b < c.length; b++) a = a[c[b]];
        return a;
      }
      const ea = /[^\p{L}\p{N}]+/u, fa = /(\d{3})/g, ha = /(\D)(\d{3})/g, ia = /(\d{3})(\D)/g, ja = /[\u0300-\u036f]/g;
      function ka(a = {}) {
        if (!this || this.constructor !== ka) return new ka(...arguments);
        if (arguments.length) for (a = 0; a < arguments.length; a++) this.assign(arguments[a]);
        else this.assign(a);
      }
      w = ka.prototype;
      w.assign = function(a) {
        this.normalize = H(a.normalize, true, this.normalize);
        let c = a.include, b = c || a.exclude || a.split, e;
        if (b || b === "") {
          if (typeof b === "object" && b.constructor !== RegExp) {
            let d = "";
            e = !c;
            c || (d += "\\p{Z}");
            b.letter && (d += "\\p{L}");
            b.number && (d += "\\p{N}", e = !!c);
            b.symbol && (d += "\\p{S}");
            b.punctuation && (d += "\\p{P}");
            b.control && (d += "\\p{C}");
            if (b = b.char) d += typeof b === "object" ? b.join("") : b;
            try {
              this.split = new RegExp("[" + (c ? "^" : "") + d + "]+", "u");
            } catch (f) {
              this.split = /\s+/;
            }
          } else this.split = b, e = b === false || "a1a".split(b).length < 2;
          this.numeric = H(a.numeric, e);
        } else {
          try {
            this.split = H(this.split, ea);
          } catch (d) {
            this.split = /\s+/;
          }
          this.numeric = H(a.numeric, H(this.numeric, true));
        }
        this.prepare = H(a.prepare, null, this.prepare);
        this.finalize = H(a.finalize, null, this.finalize);
        b = a.filter;
        this.filter = typeof b === "function" ? b : H(b && new Set(b), null, this.filter);
        this.dedupe = H(a.dedupe, true, this.dedupe);
        this.matcher = H((b = a.matcher) && new Map(b), null, this.matcher);
        this.mapper = H((b = a.mapper) && new Map(b), null, this.mapper);
        this.stemmer = H(
          (b = a.stemmer) && new Map(b),
          null,
          this.stemmer
        );
        this.replacer = H(a.replacer, null, this.replacer);
        this.minlength = H(a.minlength, 1, this.minlength);
        this.maxlength = H(a.maxlength, 1024, this.maxlength);
        this.rtl = H(a.rtl, false, this.rtl);
        if (this.cache = b = H(a.cache, true, this.cache)) this.F = null, this.L = typeof b === "number" ? b : 2e5, this.B = new Map(), this.D = new Map(), this.I = this.H = 128;
        this.h = "";
        this.J = null;
        this.A = "";
        this.K = null;
        if (this.matcher) for (const d of this.matcher.keys()) this.h += (this.h ? "|" : "") + d;
        if (this.stemmer) for (const d of this.stemmer.keys()) this.A += (this.A ? "|" : "") + d;
        return this;
      };
      w.addStemmer = function(a, c) {
        this.stemmer || (this.stemmer = new Map());
        this.stemmer.set(a, c);
        this.A += (this.A ? "|" : "") + a;
        this.K = null;
        this.cache && Q(this);
        return this;
      };
      w.addFilter = function(a) {
        typeof a === "function" ? this.filter = a : (this.filter || (this.filter = new Set()), this.filter.add(a));
        this.cache && Q(this);
        return this;
      };
      w.addMapper = function(a, c) {
        if (typeof a === "object") return this.addReplacer(a, c);
        if (a.length > 1) return this.addMatcher(a, c);
        this.mapper || (this.mapper = new Map());
        this.mapper.set(a, c);
        this.cache && Q(this);
        return this;
      };
      w.addMatcher = function(a, c) {
        if (typeof a === "object") return this.addReplacer(a, c);
        if (a.length < 2 && (this.dedupe || this.mapper)) return this.addMapper(a, c);
        this.matcher || (this.matcher = new Map());
        this.matcher.set(a, c);
        this.h += (this.h ? "|" : "") + a;
        this.J = null;
        this.cache && Q(this);
        return this;
      };
      w.addReplacer = function(a, c) {
        if (typeof a === "string") return this.addMatcher(a, c);
        this.replacer || (this.replacer = []);
        this.replacer.push(a, c);
        this.cache && Q(this);
        return this;
      };
      w.encode = function(a, c) {
        if (this.cache && a.length <= this.H) if (this.F) {
          if (this.B.has(a)) return this.B.get(a);
        } else this.F = setTimeout(Q, 50, this);
        this.normalize && (typeof this.normalize === "function" ? a = this.normalize(a) : a = ja ? a.normalize("NFKD").replace(ja, "").toLowerCase() : a.toLowerCase());
        this.prepare && (a = this.prepare(a));
        this.numeric && a.length > 3 && (a = a.replace(ha, "$1 $2").replace(ia, "$1 $2").replace(fa, "$1 "));
        const b = !(this.dedupe || this.mapper || this.filter || this.matcher || this.stemmer || this.replacer);
        let e = [], d = I(), f, g, k = this.split || this.split === "" ? a.split(this.split) : [a];
        for (let l = 0, m, p; l < k.length; l++) if ((m = p = k[l]) && !(m.length < this.minlength || m.length > this.maxlength)) {
          if (c) {
            if (d[m]) continue;
            d[m] = 1;
          } else {
            if (f === m) continue;
            f = m;
          }
          if (b) e.push(m);
          else if (!this.filter || (typeof this.filter === "function" ? this.filter(m) : !this.filter.has(m))) {
            if (this.cache && m.length <= this.I) if (this.F) {
              var h = this.D.get(m);
              if (h || h === "") {
                h && e.push(h);
                continue;
              }
            } else this.F = setTimeout(Q, 50, this);
            if (this.stemmer) {
              this.K || (this.K = new RegExp("(?!^)(" + this.A + ")$"));
              let u;
              for (; u !== m && m.length > 2; ) u = m, m = m.replace(this.K, (r) => this.stemmer.get(r));
            }
            if (m && (this.mapper || this.dedupe && m.length > 1)) {
              h = "";
              for (let u = 0, r = "", t, n; u < m.length; u++) t = m.charAt(u), t === r && this.dedupe || ((n = this.mapper && this.mapper.get(t)) || n === "" ? n === r && this.dedupe || !(r = n) || (h += n) : h += r = t);
              m = h;
            }
            this.matcher && m.length > 1 && (this.J || (this.J = new RegExp("(" + this.h + ")", "g")), m = m.replace(this.J, (u) => this.matcher.get(u)));
            if (m && this.replacer) for (h = 0; m && h < this.replacer.length; h += 2) m = m.replace(
              this.replacer[h],
              this.replacer[h + 1]
            );
            this.cache && p.length <= this.I && (this.D.set(p, m), this.D.size > this.L && (this.D.clear(), this.I = this.I / 1.1 | 0));
            if (m) {
              if (m !== p) if (c) {
                if (d[m]) continue;
                d[m] = 1;
              } else {
                if (g === m) continue;
                g = m;
              }
              e.push(m);
            }
          }
        }
        this.finalize && (e = this.finalize(e) || e);
        this.cache && a.length <= this.H && (this.B.set(a, e), this.B.size > this.L && (this.B.clear(), this.H = this.H / 1.1 | 0));
        return e;
      };
      function Q(a) {
        a.F = null;
        a.B.clear();
        a.D.clear();
      }
      function la(a, c, b) {
        b || (c || typeof a !== "object" ? typeof c === "object" && (b = c, c = 0) : b = a);
        b && (a = b.query || a, c = b.limit || c);
        let e = "" + (c || 0);
        b && (e += (b.offset || 0) + !!b.context + !!b.suggest + (b.resolve !== false) + (b.resolution || this.resolution) + (b.boost || 0));
        a = ("" + a).toLowerCase();
        this.cache || (this.cache = new ma());
        let d = this.cache.get(a + e);
        if (!d) {
          const f = b && b.cache;
          f && (b.cache = false);
          d = this.search(a, c, b);
          f && (b.cache = f);
          this.cache.set(a + e, d);
        }
        return d;
      }
      function ma(a) {
        this.limit = a && a !== true ? a : 1e3;
        this.cache = new Map();
        this.h = "";
      }
      ma.prototype.set = function(a, c) {
        this.cache.set(this.h = a, c);
        this.cache.size > this.limit && this.cache.delete(this.cache.keys().next().value);
      };
      ma.prototype.get = function(a) {
        const c = this.cache.get(a);
        c && this.h !== a && (this.cache.delete(a), this.cache.set(this.h = a, c));
        return c;
      };
      ma.prototype.remove = function(a) {
        for (const c of this.cache) {
          const b = c[0];
          c[1].includes(a) && this.cache.delete(b);
        }
      };
      ma.prototype.clear = function() {
        this.cache.clear();
        this.h = "";
      };
      const na = { normalize: false, numeric: false, dedupe: false };
      const oa = {};
      const ra = new Map([["b", "p"], ["v", "f"], ["w", "f"], ["z", "s"], ["x", "s"], ["d", "t"], ["n", "m"], ["c", "k"], ["g", "k"], ["j", "k"], ["q", "k"], ["i", "e"], ["y", "e"], ["u", "o"]]);
      const sa = new Map([["ae", "a"], ["oe", "o"], ["sh", "s"], ["kh", "k"], ["th", "t"], ["ph", "f"], ["pf", "f"]]), ta = [/([^aeo])h(.)/g, "$1$2", /([aeo])h([^aeo]|$)/g, "$1$2", /(.)\1+/g, "$1"];
      const ua = { a: "", e: "", i: "", o: "", u: "", y: "", b: 1, f: 1, p: 1, v: 1, c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2, "ß": 2, d: 3, t: 3, l: 4, m: 5, n: 5, r: 6 };
      var va = { Exact: na, Default: oa, Normalize: oa, LatinBalance: { mapper: ra }, LatinAdvanced: { mapper: ra, matcher: sa, replacer: ta }, LatinExtra: { mapper: ra, replacer: ta.concat([/(?!^)[aeo]/g, ""]), matcher: sa }, LatinSoundex: { dedupe: false, include: { letter: true }, finalize: function(a) {
        for (let b = 0; b < a.length; b++) {
          var c = a[b];
          let e = c.charAt(0), d = ua[e];
          for (let f = 1, g; f < c.length && (g = c.charAt(f), g === "h" || g === "w" || !(g = ua[g]) || g === d || (e += g, d = g, e.length !== 4)); f++) ;
          a[b] = e;
        }
      } }, CJK: { split: "" }, LatinExact: na, LatinDefault: oa, LatinSimple: oa };
      function wa(a, c, b, e) {
        let d = [];
        for (let f = 0, g; f < a.index.length; f++) if (g = a.index[f], c >= g.length) c -= g.length;
        else {
          c = g[e ? "splice" : "slice"](c, b);
          const k = c.length;
          if (k && (d = d.length ? d.concat(c) : c, b -= k, e && (a.length -= k), !b)) break;
          c = 0;
        }
        return d;
      }
      function xa(a) {
        if (!this || this.constructor !== xa) return new xa(a);
        this.index = a ? [a] : [];
        this.length = a ? a.length : 0;
        const c = this;
        return new Proxy([], { get(b, e) {
          if (e === "length") return c.length;
          if (e === "push") return function(d) {
            c.index[c.index.length - 1].push(d);
            c.length++;
          };
          if (e === "pop") return function() {
            if (c.length) return c.length--, c.index[c.index.length - 1].pop();
          };
          if (e === "indexOf") return function(d) {
            let f = 0;
            for (let g = 0, k, h; g < c.index.length; g++) {
              k = c.index[g];
              h = k.indexOf(d);
              if (h >= 0) return f + h;
              f += k.length;
            }
            return -1;
          };
          if (e === "includes") return function(d) {
            for (let f = 0; f < c.index.length; f++) if (c.index[f].includes(d)) return true;
            return false;
          };
          if (e === "slice") return function(d, f) {
            return wa(c, d || 0, f || c.length, false);
          };
          if (e === "splice") return function(d, f) {
            return wa(c, d || 0, f || c.length, true);
          };
          if (e === "constructor") return Array;
          if (typeof e !== "symbol") return (b = c.index[e / 2 ** 31 | 0]) && b[e];
        }, set(b, e, d) {
          b = e / 2 ** 31 | 0;
          (c.index[b] || (c.index[b] = []))[e] = d;
          c.length++;
          return true;
        } });
      }
      xa.prototype.clear = function() {
        this.index.length = 0;
      };
      xa.prototype.push = function() {
      };
      function R(a = 8) {
        if (!this || this.constructor !== R) return new R(a);
        this.index = I();
        this.h = [];
        this.size = 0;
        a > 32 ? (this.B = Aa, this.A = BigInt(a)) : (this.B = Ba, this.A = a);
      }
      R.prototype.get = function(a) {
        const c = this.index[this.B(a)];
        return c && c.get(a);
      };
      R.prototype.set = function(a, c) {
        var b = this.B(a);
        let e = this.index[b];
        e ? (b = e.size, e.set(a, c), (b -= e.size) && this.size++) : (this.index[b] = e = new Map([[a, c]]), this.h.push(e), this.size++);
      };
      function S(a = 8) {
        if (!this || this.constructor !== S) return new S(a);
        this.index = I();
        this.h = [];
        this.size = 0;
        a > 32 ? (this.B = Aa, this.A = BigInt(a)) : (this.B = Ba, this.A = a);
      }
      S.prototype.add = function(a) {
        var c = this.B(a);
        let b = this.index[c];
        b ? (c = b.size, b.add(a), (c -= b.size) && this.size++) : (this.index[c] = b = new Set([a]), this.h.push(b), this.size++);
      };
      w = R.prototype;
      w.has = S.prototype.has = function(a) {
        const c = this.index[this.B(a)];
        return c && c.has(a);
      };
      w.delete = S.prototype.delete = function(a) {
        const c = this.index[this.B(a)];
        c && c.delete(a) && this.size--;
      };
      w.clear = S.prototype.clear = function() {
        this.index = I();
        this.h = [];
        this.size = 0;
      };
      w.values = S.prototype.values = function* () {
        for (let a = 0; a < this.h.length; a++) for (let c of this.h[a].values()) yield c;
      };
      w.keys = S.prototype.keys = function* () {
        for (let a = 0; a < this.h.length; a++) for (let c of this.h[a].keys()) yield c;
      };
      w.entries = S.prototype.entries = function* () {
        for (let a = 0; a < this.h.length; a++) for (let c of this.h[a].entries()) yield c;
      };
      function Ba(a) {
        let c = 2 ** this.A - 1;
        if (typeof a == "number") return a & c;
        let b = 0, e = this.A + 1;
        for (let d = 0; d < a.length; d++) b = (b * e ^ a.charCodeAt(d)) & c;
        return this.A === 32 ? b + 2 ** 31 : b;
      }
      function Aa(a) {
        let c = BigInt(2) ** this.A - BigInt(1);
        var b = typeof a;
        if (b === "bigint") return a & c;
        if (b === "number") return BigInt(a) & c;
        b = BigInt(0);
        let e = this.A + BigInt(1);
        for (let d = 0; d < a.length; d++) b = (b * e ^ BigInt(a.charCodeAt(d))) & c;
        return b;
      }
      let Ca, Da;
      async function Ea(a) {
        a = a.data;
        var c = a.task;
        const b = a.id;
        let e = a.args;
        switch (c) {
          case "init":
            Da = a.options || {};
            (c = a.factory) ? (Function("return " + c)()(self), Ca = new self.FlexSearch.Index(Da), delete self.FlexSearch) : Ca = new T(Da);
            postMessage({ id: b });
            break;
          default:
            let d;
            c === "export" && (e[1] ? (e[0] = Da.export, e[2] = 0, e[3] = 1) : e = null);
            c === "import" ? e[0] && (a = await Da.import.call(Ca, e[0]), Ca.import(e[0], a)) : ((d = e && Ca[c].apply(Ca, e)) && d.then && (d = await d), d && d.await && (d = await d.await), c === "search" && d.result && (d = d.result));
            postMessage(c === "search" ? { id: b, msg: d } : { id: b });
        }
      }
      function Fa(a) {
        Ga.call(a, "add");
        Ga.call(a, "append");
        Ga.call(a, "search");
        Ga.call(a, "update");
        Ga.call(a, "remove");
        Ga.call(a, "searchCache");
      }
      let Ha, Ia, Ja;
      function Ka() {
        Ha = Ja = 0;
      }
      function Ga(a) {
        this[a + "Async"] = function() {
          const c = arguments;
          var b = c[c.length - 1];
          let e;
          typeof b === "function" && (e = b, delete c[c.length - 1]);
          Ha ? Ja || (Ja = Date.now() - Ia >= this.priority * this.priority * 3) : (Ha = setTimeout(Ka, 0), Ia = Date.now());
          if (Ja) {
            const f = this;
            return new Promise((g) => {
              setTimeout(function() {
                g(f[a + "Async"].apply(f, c));
              }, 0);
            });
          }
          const d = this[a].apply(this, c);
          b = d.then ? d : new Promise((f) => f(d));
          e && b.then(e);
          return b;
        };
      }
      let V = 0;
      function La(a = {}, c) {
        function b(k) {
          function h(l) {
            l = l.data || l;
            const m = l.id, p = m && f.h[m];
            p && (p(l.msg), delete f.h[m]);
          }
          this.worker = k;
          this.h = I();
          if (this.worker) {
            d ? this.worker.on("message", h) : this.worker.onmessage = h;
            if (a.config) return new Promise(function(l) {
              V > 1e9 && (V = 0);
              f.h[++V] = function() {
                l(f);
              };
              f.worker.postMessage({ id: V, task: "init", factory: e, options: a });
            });
            this.priority = a.priority || 4;
            this.encoder = c || null;
            this.worker.postMessage({ task: "init", factory: e, options: a });
            return this;
          }
        }
        if (!this || this.constructor !== La) return new La(a);
        let e = typeof self !== "undefined" ? self._factory : typeof window !== "undefined" ? window._factory : null;
        e && (e = e.toString());
        const d = typeof window === "undefined", f = this, g = Ma(e, d, a.worker);
        return g.then ? g.then(function(k) {
          return b.call(f, k);
        }) : b.call(this, g);
      }
      W("add");
      W("append");
      W("search");
      W("update");
      W("remove");
      W("clear");
      W("export");
      W("import");
      La.prototype.searchCache = la;
      Fa(La.prototype);
      function W(a) {
        La.prototype[a] = function() {
          const c = this, b = [].slice.call(arguments);
          var e = b[b.length - 1];
          let d;
          typeof e === "function" && (d = e, b.pop());
          e = new Promise(function(f) {
            a === "export" && typeof b[0] === "function" && (b[0] = null);
            V > 1e9 && (V = 0);
            c.h[++V] = f;
            c.worker.postMessage({ task: a, id: V, args: b });
          });
          return d ? (e.then(d), this) : e;
        };
      }
      function Ma(a, c, b) {
        return c ? typeof module !== "undefined" ? new (require("worker_threads"))["Worker"](__dirname + "/worker/node.js") : __vitePreload(() => module.import('./__vite-browser-external-2Ng8QIWW-Xya9USxv.js'), void 0 ).then(function(worker) {
          return new worker["Worker"](module.meta.dirname + "/node/node.mjs");
        }) : a ? new window.Worker(URL.createObjectURL(new Blob(["onmessage=" + Ea.toString()], { type: "text/javascript" }))) : new window.Worker(typeof b === "string" ? b : module.meta.url.replace("/worker.js", "/worker/worker.js").replace(
          "flexsearch.bundle.module.min.js",
          "module/worker/worker.js"
        ).replace("flexsearch.bundle.module.min.mjs", "module/worker/worker.js"), { type: "module" });
      }
      Na.prototype.add = function(a, c, b) {
        ba(a) && (c = a, a = ca(c, this.key));
        if (c && (a || a === 0)) {
          if (!b && this.reg.has(a)) return this.update(a, c);
          for (let k = 0, h; k < this.field.length; k++) {
            h = this.B[k];
            var e = this.index.get(this.field[k]);
            if (typeof h === "function") {
              var d = h(c);
              d && e.add(a, d, b, true);
            } else if (d = h.G, !d || d(c)) h.constructor === String ? h = ["" + h] : M(h) && (h = [h]), Qa(c, h, this.D, 0, e, a, h[0], b);
          }
          if (this.tag) for (e = 0; e < this.A.length; e++) {
            var f = this.A[e];
            d = this.tag.get(this.F[e]);
            let k = I();
            if (typeof f === "function") {
              if (f = f(c), !f) continue;
            } else {
              var g = f.G;
              if (g && !g(c)) continue;
              f.constructor === String && (f = "" + f);
              f = ca(c, f);
            }
            if (d && f) {
              M(f) && (f = [f]);
              for (let h = 0, l, m; h < f.length; h++) if (l = f[h], !k[l] && (k[l] = 1, (g = d.get(l)) ? m = g : d.set(l, m = []), !b || !m.includes(a))) {
                if (m.length === 2 ** 31 - 1) {
                  g = new xa(m);
                  if (this.fastupdate) for (let p of this.reg.values()) p.includes(m) && (p[p.indexOf(m)] = g);
                  d.set(l, m = g);
                }
                m.push(a);
                this.fastupdate && ((g = this.reg.get(a)) ? g.push(m) : this.reg.set(a, [m]));
              }
            }
          }
          if (this.store && (!b || !this.store.has(a))) {
            let k;
            if (this.h) {
              k = I();
              for (let h = 0, l; h < this.h.length; h++) {
                l = this.h[h];
                if ((b = l.G) && !b(c)) continue;
                let m;
                if (typeof l === "function") {
                  m = l(c);
                  if (!m) continue;
                  l = [l.O];
                } else if (M(l) || l.constructor === String) {
                  k[l] = c[l];
                  continue;
                }
                Ra(c, k, l, 0, l[0], m);
              }
            }
            this.store.set(a, k || c);
          }
          this.worker && (this.fastupdate || this.reg.add(a));
        }
        return this;
      };
      function Ra(a, c, b, e, d, f) {
        a = a[d];
        if (e === b.length - 1) c[d] = f || a;
        else if (a) if (a.constructor === Array) for (c = c[d] = Array(a.length), d = 0; d < a.length; d++) Ra(a, c, b, e, d);
        else c = c[d] || (c[d] = I()), d = b[++e], Ra(a, c, b, e, d);
      }
      function Qa(a, c, b, e, d, f, g, k) {
        if (a = a[g]) if (e === c.length - 1) {
          if (a.constructor === Array) {
            if (b[e]) {
              for (c = 0; c < a.length; c++) d.add(f, a[c], true, true);
              return;
            }
            a = a.join(" ");
          }
          d.add(f, a, k, true);
        } else if (a.constructor === Array) for (g = 0; g < a.length; g++) Qa(a, c, b, e, d, f, g, k);
        else g = c[++e], Qa(a, c, b, e, d, f, g, k);
      }
      function Sa(a, c, b, e) {
        if (!a.length) return a;
        if (a.length === 1) return a = a[0], a = b || a.length > c ? a.slice(b, b + c) : a, e ? Ta.call(this, a) : a;
        let d = [];
        for (let f = 0, g, k; f < a.length; f++) if ((g = a[f]) && (k = g.length)) {
          if (b) {
            if (b >= k) {
              b -= k;
              continue;
            }
            g = g.slice(b, b + c);
            k = g.length;
            b = 0;
          }
          k > c && (g = g.slice(0, c), k = c);
          if (!d.length && k >= c) return e ? Ta.call(this, g) : g;
          d.push(g);
          c -= k;
          if (!c) break;
        }
        d = d.length > 1 ? [].concat.apply([], d) : d[0];
        return e ? Ta.call(this, d) : d;
      }
      function Ua(a, c, b, e) {
        var d = e[0];
        if (d[0] && d[0].query) return a[c].apply(a, d);
        if (!(c !== "and" && c !== "not" || a.result.length || a.await || d.suggest)) return e.length > 1 && (d = e[e.length - 1]), (e = d.resolve) ? a.await || a.result : a;
        let f = [], g = 0, k = 0, h, l, m, p, u;
        for (c = 0; c < e.length; c++) if (d = e[c]) {
          var r = void 0;
          if (d.constructor === X) r = d.await || d.result;
          else if (d.then || d.constructor === Array) r = d;
          else {
            g = d.limit || 0;
            k = d.offset || 0;
            m = d.suggest;
            l = d.resolve;
            h = ((p = d.highlight || a.highlight) || d.enrich) && l;
            r = d.queue;
            let t = d.async || r, n = d.index, q = d.query;
            n ? a.index || (a.index = n) : n = a.index;
            if (q || d.tag) {
              const x = d.field || d.pluck;
              x && (!q || a.query && !p || (a.query = q, a.field = x, a.highlight = p), n = n.index.get(x));
              if (r && (u || a.await)) {
                u = 1;
                let v;
                const A = a.C.length, D = new Promise(function(F) {
                  v = F;
                });
                (function(F, E) {
                  D.h = function() {
                    E.index = null;
                    E.resolve = false;
                    let B = t ? F.searchAsync(E) : F.search(E);
                    if (B.then) return B.then(function(z) {
                      a.C[A] = z = z.result || z;
                      v(z);
                      return z;
                    });
                    B = B.result || B;
                    v(B);
                    return B;
                  };
                })(n, Object.assign({}, d));
                a.C.push(D);
                f[c] = D;
                continue;
              } else d.resolve = false, d.index = null, r = t ? n.searchAsync(d) : n.search(d), d.resolve = l, d.index = n;
            } else if (d.and) r = Va(d, "and", n);
            else if (d.or) r = Va(d, "or", n);
            else if (d.not) r = Va(d, "not", n);
            else if (d.xor) r = Va(d, "xor", n);
            else continue;
          }
          r.await ? (u = 1, r = r.await) : r.then ? (u = 1, r = r.then(function(t) {
            return t.result || t;
          })) : r = r.result || r;
          f[c] = r;
        }
        u && !a.await && (a.await = new Promise(function(t) {
          a.return = t;
        }));
        if (u) {
          const t = Promise.all(f).then(function(n) {
            for (let q = 0; q < a.C.length; q++) if (a.C[q] === t) {
              a.C[q] = function() {
                return b.call(a, n, g, k, h, l, m, p);
              };
              break;
            }
            Wa(a);
          });
          a.C.push(t);
        } else if (a.await) a.C.push(function() {
          return b.call(a, f, g, k, h, l, m, p);
        });
        else return b.call(a, f, g, k, h, l, m, p);
        return l ? a.await || a.result : a;
      }
      function Va(a, c, b) {
        a = a[c];
        const e = a[0] || a;
        e.index || (e.index = b);
        b = new X(e);
        a.length > 1 && (b = b[c].apply(b, a.slice(1)));
        return b;
      }
      X.prototype.or = function() {
        return Ua(this, "or", Xa, arguments);
      };
      function Xa(a, c, b, e, d, f, g) {
        a.length && (this.result.length && a.push(this.result), a.length < 2 ? this.result = a[0] : (this.result = Ya(a, c, b, false, this.h), b = 0));
        d && (this.await = null);
        return d ? this.resolve(c, b, e, g) : this;
      }
      X.prototype.and = function() {
        return Ua(this, "and", Za, arguments);
      };
      function Za(a, c, b, e, d, f, g) {
        if (!f && !this.result.length) return d ? this.result : this;
        let k;
        if (a.length) if (this.result.length && a.unshift(this.result), a.length < 2) this.result = a[0];
        else {
          let h = 0;
          for (let l = 0, m, p; l < a.length; l++) if ((m = a[l]) && (p = m.length)) h < p && (h = p);
          else if (!f) {
            h = 0;
            break;
          }
          h ? (this.result = $a(a, h, c, b, f, this.h, d), k = true) : this.result = [];
        }
        else f || (this.result = a);
        d && (this.await = null);
        return d ? this.resolve(c, b, e, g, k) : this;
      }
      X.prototype.xor = function() {
        return Ua(this, "xor", ab, arguments);
      };
      function ab(a, c, b, e, d, f, g) {
        if (a.length) if (this.result.length && a.unshift(this.result), a.length < 2) this.result = a[0];
        else {
          a: {
            f = b;
            var k = this.h;
            const h = [], l = I();
            let m = 0;
            for (let p = 0, u; p < a.length; p++) if (u = a[p]) {
              m < u.length && (m = u.length);
              for (let r = 0, t; r < u.length; r++) if (t = u[r]) for (let n = 0, q; n < t.length; n++) q = t[n], l[q] = l[q] ? 2 : 1;
            }
            for (let p = 0, u, r = 0; p < m; p++) for (let t = 0, n; t < a.length; t++) if (n = a[t]) {
              if (u = n[p]) {
                for (let q = 0, x; q < u.length; q++) if (x = u[q], l[x] === 1) if (f) f--;
                else if (d) {
                  if (h.push(x), h.length === c) {
                    a = h;
                    break a;
                  }
                } else {
                  const v = p + (t ? k : 0);
                  h[v] || (h[v] = []);
                  h[v].push(x);
                  if (++r === c) {
                    a = h;
                    break a;
                  }
                }
              }
            }
            a = h;
          }
          this.result = a;
          k = true;
        }
        else f || (this.result = a);
        d && (this.await = null);
        return d ? this.resolve(c, b, e, g, k) : this;
      }
      X.prototype.not = function() {
        return Ua(this, "not", bb, arguments);
      };
      function bb(a, c, b, e, d, f, g) {
        if (!f && !this.result.length) return d ? this.result : this;
        if (a.length && this.result.length) {
          a: {
            f = b;
            var k = [];
            a = new Set(a.flat().flat());
            for (let h = 0, l, m = 0; h < this.result.length; h++) if (l = this.result[h]) {
              for (let p = 0, u; p < l.length; p++) if (u = l[p], !a.has(u)) {
                if (f) f--;
                else if (d) {
                  if (k.push(u), k.length === c) {
                    a = k;
                    break a;
                  }
                } else if (k[h] || (k[h] = []), k[h].push(u), ++m === c) {
                  a = k;
                  break a;
                }
              }
            }
            a = k;
          }
          this.result = a;
          k = true;
        }
        d && (this.await = null);
        return d ? this.resolve(c, b, e, g, k) : this;
      }
      function cb(a, c, b, e, d) {
        let f, g, k;
        typeof d === "string" ? (f = d, d = "") : f = d.template;
        g = f.indexOf("$1");
        k = f.substring(g + 2);
        g = f.substring(0, g);
        let h = d && d.boundary, l = !d || d.clip !== false, m = d && d.merge && k && g && new RegExp(k + " " + g, "g");
        d = d && d.ellipsis;
        var p = 0;
        if (typeof d === "object") {
          var u = d.template;
          p = u.length - 2;
          d = d.pattern;
        }
        typeof d !== "string" && (d = d === false ? "" : "...");
        p && (d = u.replace("$1", d));
        u = d.length - p;
        let r, t;
        typeof h === "object" && (r = h.before, r === 0 && (r = -1), t = h.after, t === 0 && (t = -1), h = h.total || 9e5);
        p = new Map();
        for (let Oa = 0, da, db, pa; Oa < c.length; Oa++) {
          let qa;
          if (e) qa = c, pa = e;
          else {
            var n = c[Oa];
            pa = n.field;
            if (!pa) continue;
            qa = n.result;
          }
          db = b.get(pa);
          da = db.encoder;
          n = p.get(da);
          typeof n !== "string" && (n = da.encode(a), p.set(da, n));
          for (let ya = 0; ya < qa.length; ya++) {
            var q = qa[ya].doc;
            if (!q) continue;
            q = ca(q, pa);
            if (!q) continue;
            var x = q.trim().split(/\s+/);
            if (!x.length) continue;
            q = "";
            var v = [];
            let za = [];
            var A = -1, D = -1, F = 0;
            for (var E = 0; E < x.length; E++) {
              var B = x[E], z = da.encode(B);
              z = z.length > 1 ? z.join(" ") : z[0];
              let y;
              if (z && B) {
                var C = B.length, J = (da.split ? B.replace(da.split, "") : B).length - z.length, G = "", N = 0;
                for (var O = 0; O < n.length; O++) {
                  var P = n[O];
                  if (P) {
                    var L = P.length;
                    L += J < 0 ? 0 : J;
                    N && L <= N || (P = z.indexOf(P), P > -1 && (G = (P ? B.substring(0, P) : "") + g + B.substring(P, P + L) + k + (P + L < C ? B.substring(P + L) : ""), N = L, y = true));
                  }
                }
                G && (h && (A < 0 && (A = q.length + (q ? 1 : 0)), D = q.length + (q ? 1 : 0) + G.length, F += C, za.push(v.length), v.push({ match: G })), q += (q ? " " : "") + G);
              }
              if (!y) B = x[E], q += (q ? " " : "") + B, h && v.push({ text: B });
              else if (h && F >= h) break;
            }
            F = za.length * (f.length - 2);
            if (r || t || h && q.length - F > h) if (F = h + F - u * 2, E = D - A, r > 0 && (E += r), t > 0 && (E += t), E <= F) x = r ? A - (r > 0 ? r : 0) : A - ((F - E) / 2 | 0), v = t ? D + (t > 0 ? t : 0) : x + F, l || (x > 0 && q.charAt(x) !== " " && q.charAt(x - 1) !== " " && (x = q.indexOf(" ", x), x < 0 && (x = 0)), v < q.length && q.charAt(v - 1) !== " " && q.charAt(v) !== " " && (v = q.lastIndexOf(" ", v), v < D ? v = D : ++v)), q = (x ? d : "") + q.substring(x, v) + (v < q.length ? d : "");
            else {
              D = [];
              A = {};
              F = {};
              E = {};
              B = {};
              z = {};
              G = J = C = 0;
              for (O = N = 1; ; ) {
                var U = void 0;
                for (let y = 0, K; y < za.length; y++) {
                  K = za[y];
                  if (G) if (J !== G) {
                    if (E[y + 1]) continue;
                    K += G;
                    if (A[K]) {
                      C -= u;
                      F[y + 1] = 1;
                      E[y + 1] = 1;
                      continue;
                    }
                    if (K >= v.length - 1) {
                      if (K >= v.length) {
                        E[y + 1] = 1;
                        K >= x.length && (F[y + 1] = 1);
                        continue;
                      }
                      C -= u;
                    }
                    q = v[K].text;
                    if (L = t && z[y]) if (L > 0) {
                      if (q.length > L) if (E[y + 1] = 1, l) q = q.substring(0, L);
                      else continue;
                      (L -= q.length) || (L = -1);
                      z[y] = L;
                    } else {
                      E[y + 1] = 1;
                      continue;
                    }
                    if (C + q.length + 1 <= h) q = " " + q, D[y] += q;
                    else if (l) U = h - C - 1, U > 0 && (q = " " + q.substring(0, U), D[y] += q), E[y + 1] = 1;
                    else {
                      E[y + 1] = 1;
                      continue;
                    }
                  } else {
                    if (E[y]) continue;
                    K -= J;
                    if (A[K]) {
                      C -= u;
                      E[y] = 1;
                      F[y] = 1;
                      continue;
                    }
                    if (K <= 0) {
                      if (K < 0) {
                        E[y] = 1;
                        F[y] = 1;
                        continue;
                      }
                      C -= u;
                    }
                    q = v[K].text;
                    if (L = r && B[y]) if (L > 0) {
                      if (q.length > L) if (E[y] = 1, l) q = q.substring(q.length - L);
                      else continue;
                      (L -= q.length) || (L = -1);
                      B[y] = L;
                    } else {
                      E[y] = 1;
                      continue;
                    }
                    if (C + q.length + 1 <= h) q += " ", D[y] = q + D[y];
                    else if (l) U = q.length + 1 - (h - C), U >= 0 && U < q.length && (q = q.substring(U) + " ", D[y] = q + D[y]), E[y] = 1;
                    else {
                      E[y] = 1;
                      continue;
                    }
                  }
                  else {
                    q = v[K].match;
                    r && (B[y] = r);
                    t && (z[y] = t);
                    y && C++;
                    let Pa;
                    K ? !y && u && (C += u) : (F[y] = 1, E[y] = 1);
                    K >= x.length - 1 ? Pa = 1 : K < v.length - 1 && v[K + 1].match ? Pa = 1 : u && (C += u);
                    C -= f.length - 2;
                    if (!y || C + q.length <= h) D[y] = q;
                    else {
                      U = N = O = F[y] = 0;
                      break;
                    }
                    Pa && (F[y + 1] = 1, E[y + 1] = 1);
                  }
                  C += q.length;
                  U = A[K] = 1;
                }
                if (U) J === G ? G++ : J++;
                else {
                  J === G ? N = 0 : O = 0;
                  if (!N && !O) break;
                  N ? (J++, G = J) : G++;
                }
              }
              q = "";
              for (let y = 0, K; y < D.length; y++) K = (F[y] ? y ? " " : "" : (y && !d ? " " : "") + d) + D[y], q += K;
              d && !F[D.length] && (q += d);
            }
            m && (q = q.replace(m, " "));
            qa[ya].highlight = q;
          }
          if (e) break;
        }
        return c;
      }
      function X(a, c) {
        if (!this || this.constructor !== X) return new X(a, c);
        let b = 0, e, d, f, g, k, h;
        if (a && a.index) {
          const l = a;
          c = l.index;
          b = l.boost || 0;
          if (d = l.query) {
            f = l.field || l.pluck;
            g = l.highlight;
            const m = l.resolve;
            a = l.async || l.queue;
            l.resolve = false;
            l.index = null;
            a = a ? c.searchAsync(l) : c.search(l);
            l.resolve = m;
            l.index = c;
            a = a.result || a;
          } else a = [];
        }
        if (a && a.then) {
          const l = this;
          a = a.then(function(m) {
            l.C[0] = l.result = m.result || m;
            Wa(l);
          });
          e = [a];
          a = [];
          k = new Promise(function(m) {
            h = m;
          });
        }
        this.index = c || null;
        this.result = a || [];
        this.h = b;
        this.C = e || [];
        this.await = k || null;
        this.return = h || null;
        this.highlight = g || null;
        this.query = d || "";
        this.field = f || "";
      }
      w = X.prototype;
      w.limit = function(a) {
        if (this.await) {
          const c = this;
          this.C.push(function() {
            return c.limit(a).result;
          });
        } else if (this.result.length) {
          const c = [];
          for (let b = 0, e; b < this.result.length; b++) if (e = this.result[b]) if (e.length <= a) {
            if (c[b] = e, a -= e.length, !a) break;
          } else {
            c[b] = e.slice(0, a);
            break;
          }
          this.result = c;
        }
        return this;
      };
      w.offset = function(a) {
        if (this.await) {
          const c = this;
          this.C.push(function() {
            return c.offset(a).result;
          });
        } else if (this.result.length) {
          const c = [];
          for (let b = 0, e; b < this.result.length; b++) if (e = this.result[b]) e.length <= a ? a -= e.length : (c[b] = e.slice(a), a = 0);
          this.result = c;
        }
        return this;
      };
      w.boost = function(a) {
        if (this.await) {
          const c = this;
          this.C.push(function() {
            return c.boost(a).result;
          });
        } else this.h += a;
        return this;
      };
      function Wa(a, c) {
        let b = a.result;
        var e = a.await;
        a.await = null;
        for (let d = 0, f; d < a.C.length; d++) if (f = a.C[d]) {
          if (typeof f === "function") b = f(), a.C[d] = b = b.result || b, d--;
          else if (f.h) b = f.h(), a.C[d] = b = b.result || b, d--;
          else if (f.then) return a.await = e;
        }
        e = a.return;
        a.C = [];
        a.return = null;
        c || e(b);
        return b;
      }
      w.resolve = function(a, c, b, e, d) {
        let f = this.await ? Wa(this, true) : this.result;
        if (f.then) {
          const g = this;
          return f.then(function() {
            return g.resolve(a, c, b, e, d);
          });
        }
        f.length && (typeof a === "object" ? (e = a.highlight || this.highlight, b = !!e || a.enrich, c = a.offset, a = a.limit) : (e = e || this.highlight, b = !!e || b), f = d ? b ? Ta.call(this.index, f) : f : Sa.call(this.index, f, a || 100, c, b));
        return this.finalize(f, e);
      };
      w.finalize = function(a, c) {
        if (a.then) {
          const e = this;
          return a.then(function(d) {
            return e.finalize(d, c);
          });
        }
        c && a.length && this.query && (a = cb(this.query, a, this.index.index, this.field, c));
        const b = this.return;
        this.highlight = this.index = this.result = this.C = this.await = this.return = null;
        this.query = this.field = "";
        b && b(a);
        return a;
      };
      function $a(a, c, b, e, d, f, g) {
        const k = a.length;
        let h = [], l, m;
        l = I();
        for (let p = 0, u, r, t, n; p < c; p++) for (let q = 0; q < k; q++) if (t = a[q], p < t.length && (u = t[p])) for (let x = 0; x < u.length; x++) {
          r = u[x];
          (m = l[r]) ? l[r]++ : (m = 0, l[r] = 1);
          n = h[m] || (h[m] = []);
          if (!g) {
            let v = p + (q || !d ? 0 : f || 0);
            n = n[v] || (n[v] = []);
          }
          n.push(r);
          if (g && b && m === k - 1 && n.length - e === b) return e ? n.slice(e) : n;
        }
        if (a = h.length) if (d) h = h.length > 1 ? Ya(h, b, e, g, f) : (h = h[0]) && b && h.length > b || e ? h.slice(e, b + e) : h;
        else {
          if (a < k) return [];
          h = h[a - 1];
          if (b || e) if (g) {
            if (h.length > b || e) h = h.slice(e, b + e);
          } else {
            d = [];
            for (let p = 0, u; p < h.length; p++) if (u = h[p]) if (e && u.length > e) e -= u.length;
            else {
              if (b && u.length > b || e) u = u.slice(e, b + e), b -= u.length, e && (e -= u.length);
              d.push(u);
              if (!b) break;
            }
            h = d;
          }
        }
        return h;
      }
      function Ya(a, c, b, e, d) {
        const f = [], g = I();
        let k;
        var h = a.length;
        let l;
        if (e) for (d = h - 1; d >= 0; d--) {
          if (l = (e = a[d]) && e.length) {
            for (h = 0; h < l; h++) if (k = e[h], !g[k]) {
              if (g[k] = 1, b) b--;
              else if (f.push(k), f.length === c) return f;
            }
          }
        }
        else for (let m = h - 1, p, u = 0; m >= 0; m--) {
          p = a[m];
          for (let r = 0; r < p.length; r++) if (l = (e = p[r]) && e.length) {
            for (let t = 0; t < l; t++) if (k = e[t], !g[k]) if (g[k] = 1, b) b--;
            else {
              let n = (r + (m < h - 1 ? d || 0 : 0)) / (m + 1) | 0;
              (f[n] || (f[n] = [])).push(k);
              if (++u === c) return f;
            }
          }
        }
        return f;
      }
      function eb(a, c, b, e, d) {
        const f = I(), g = [];
        for (let k = 0, h; k < c.length; k++) {
          h = c[k];
          for (let l = 0; l < h.length; l++) f[h[l]] = 1;
        }
        if (d) for (let k = 0, h; k < a.length; k++) {
          if (h = a[k], f[h]) {
            if (e) e--;
            else if (g.push(h), f[h] = 0, b && --b === 0) break;
          }
        }
        else for (let k = 0, h, l; k < a.result.length; k++) for (h = a.result[k], c = 0; c < h.length; c++) l = h[c], f[l] && ((g[k] || (g[k] = [])).push(l), f[l] = 0);
        return g;
      }
      Na.prototype.search = function(a, c, b, e) {
        b || (!c && ba(a) ? (b = a, a = "") : ba(c) && (b = c, c = 0));
        let d = [];
        var f = [];
        let g;
        let k, h, l, m, p;
        let u = 0, r = true, t;
        if (b) {
          b.constructor === Array && (b = { index: b });
          a = b.query || a;
          g = b.pluck;
          k = b.merge;
          l = b.boost;
          p = g || b.field || (p = b.index) && (p.index ? null : p);
          var n = this.tag && b.tag;
          h = b.suggest;
          r = b.resolve !== false;
          m = b.cache;
          t = r && this.store && b.highlight;
          var q = !!t || r && this.store && b.enrich;
          c = b.limit || c;
          var x = b.offset || 0;
          c || (c = r ? 100 : 0);
          if (n && (!this.db || !e)) {
            n.constructor !== Array && (n = [n]);
            var v = [];
            for (let B = 0, z; B < n.length; B++) if (z = n[B], z.field && z.tag) {
              var A = z.tag;
              if (A.constructor === Array) for (var D = 0; D < A.length; D++) v.push(z.field, A[D]);
              else v.push(z.field, A);
            } else {
              A = Object.keys(z);
              for (let C = 0, J, G; C < A.length; C++) if (J = A[C], G = z[J], G.constructor === Array) for (D = 0; D < G.length; D++) v.push(J, G[D]);
              else v.push(J, G);
            }
            n = v;
            if (!a) {
              f = [];
              if (v.length) for (n = 0; n < v.length; n += 2) {
                if (this.db) {
                  e = this.index.get(v[n]);
                  if (!e) continue;
                  f.push(e = e.db.tag(v[n + 1], c, x, q));
                } else e = fb.call(this, v[n], v[n + 1], c, x, q);
                d.push(r ? { field: v[n], tag: v[n + 1], result: e } : [e]);
              }
              if (f.length) {
                const B = this;
                return Promise.all(f).then(function(z) {
                  for (let C = 0; C < z.length; C++) r ? d[C].result = z[C] : d[C] = z[C];
                  return r ? d : new X(d.length > 1 ? $a(d, 1, 0, 0, h, l) : d[0], B);
                });
              }
              return r ? d : new X(d.length > 1 ? $a(d, 1, 0, 0, h, l) : d[0], this);
            }
          }
          r || g || !(p = p || this.field) || (M(p) ? g = p : (p.constructor === Array && p.length === 1 && (p = p[0]), g = p.field || p.index));
          p && p.constructor !== Array && (p = [p]);
        }
        p || (p = this.field);
        let F;
        v = (this.worker || this.db) && !e && [];
        for (let B = 0, z, C, J; B < p.length; B++) {
          C = p[B];
          if (this.db && this.tag && !this.B[B]) continue;
          let G;
          M(C) || (G = C, C = G.field, a = G.query || a, c = aa(G.limit, c), x = aa(G.offset, x), h = aa(G.suggest, h), t = r && this.store && aa(G.highlight, t), q = !!t || r && this.store && aa(G.enrich, q), m = aa(G.cache, m));
          if (e) z = e[B];
          else {
            A = G || b || {};
            D = A.enrich;
            var E = this.index.get(C);
            n && (this.db && (A.tag = n, A.field = p, F = E.db.support_tag_search), !F && D && (A.enrich = false), F || (A.limit = 0, A.offset = 0));
            z = m ? E.searchCache(a, n && !F ? 0 : c, A) : E.search(a, n && !F ? 0 : c, A);
            n && !F && (A.limit = c, A.offset = x);
            D && (A.enrich = D);
            if (v) {
              v[B] = z;
              continue;
            }
          }
          J = (z = z.result || z) && z.length;
          if (n && J) {
            A = [];
            D = 0;
            if (this.db && e) {
              if (!F) for (E = p.length; E < e.length; E++) {
                let N = e[E];
                if (N && N.length) D++, A.push(N);
                else if (!h) return r ? d : new X(d, this);
              }
            } else for (let N = 0, O, P; N < n.length; N += 2) {
              O = this.tag.get(n[N]);
              if (!O) if (h) continue;
              else return r ? d : new X(d, this);
              if (P = (O = O && O.get(n[N + 1])) && O.length) D++, A.push(O);
              else if (!h) return r ? d : new X(d, this);
            }
            if (D) {
              z = eb(z, A, c, x, r);
              J = z.length;
              if (!J && !h) return r ? z : new X(z, this);
              D--;
            }
          }
          if (J) f[u] = C, d.push(z), u++;
          else if (p.length === 1) return r ? d : new X(
            d,
            this
          );
        }
        if (v) {
          if (this.db && n && n.length && !F) for (q = 0; q < n.length; q += 2) {
            f = this.index.get(n[q]);
            if (!f) if (h) continue;
            else return r ? d : new X(d, this);
            v.push(f.db.tag(n[q + 1], c, x, false));
          }
          const B = this;
          return Promise.all(v).then(function(z) {
            b && (b.resolve = r);
            z.length && (z = B.search(a, c, b, z));
            return z;
          });
        }
        if (!u) return r ? d : new X(d, this);
        if (g && (!q || !this.store)) return d = d[0], r ? d : new X(d, this);
        v = [];
        for (x = 0; x < f.length; x++) {
          n = d[x];
          q && n.length && typeof n[0].doc === "undefined" && (this.db ? v.push(n = this.index.get(this.field[0]).db.enrich(n)) : n = Ta.call(this, n));
          if (g) return r ? t ? cb(a, n, this.index, g, t) : n : new X(n, this);
          d[x] = { field: f[x], result: n };
        }
        if (q && this.db && v.length) {
          const B = this;
          return Promise.all(v).then(function(z) {
            for (let C = 0; C < z.length; C++) d[C].result = z[C];
            t && (d = cb(a, d, B.index, g, t));
            return k ? gb(d) : d;
          });
        }
        t && (d = cb(a, d, this.index, g, t));
        return k ? gb(d) : d;
      };
      function gb(a) {
        const c = [], b = I(), e = I();
        for (let d = 0, f, g, k, h, l, m, p; d < a.length; d++) {
          f = a[d];
          g = f.field;
          k = f.result;
          for (let u = 0; u < k.length; u++) if (l = k[u], typeof l !== "object" ? l = { id: h = l } : h = l.id, (m = b[h]) ? m.push(g) : (l.field = b[h] = [g], c.push(l)), p = l.highlight) m = e[h], m || (e[h] = m = {}, l.highlight = m), m[g] = p;
        }
        return c;
      }
      function fb(a, c, b, e, d) {
        a = this.tag.get(a);
        if (!a) return [];
        a = a.get(c);
        if (!a) return [];
        c = a.length - e;
        if (c > 0) {
          if (b && c > b || e) a = a.slice(e, e + b);
          d && (a = Ta.call(this, a));
        }
        return a;
      }
      function Ta(a) {
        if (!this || !this.store) return a;
        if (this.db) return this.index.get(this.field[0]).db.enrich(a);
        const c = Array(a.length);
        for (let b = 0, e; b < a.length; b++) e = a[b], c[b] = { id: e, doc: this.store.get(e) };
        return c;
      }
      function Na(a) {
        if (!this || this.constructor !== Na) return new Na(a);
        const c = a.document || a.doc || a;
        let b, e;
        this.B = [];
        this.field = [];
        this.D = [];
        this.key = (b = c.key || c.id) && hb(b, this.D) || "id";
        (e = a.keystore || 0) && (this.keystore = e);
        this.fastupdate = !!a.fastupdate;
        this.reg = !this.fastupdate || a.worker || a.db ? e ? new S(e) : new Set() : e ? new R(e) : new Map();
        this.h = (b = c.store || null) && b && b !== true && [];
        this.store = b ? e ? new R(e) : new Map() : null;
        this.cache = (b = a.cache || null) && new ma(b);
        a.cache = false;
        this.worker = a.worker || false;
        this.priority = a.priority || 4;
        this.index = ib.call(this, a, c);
        this.tag = null;
        if (b = c.tag) {
          if (typeof b === "string" && (b = [b]), b.length) {
            this.tag = new Map();
            this.A = [];
            this.F = [];
            for (let d = 0, f, g; d < b.length; d++) {
              f = b[d];
              g = f.field || f;
              if (!g) throw Error("The tag field from the document descriptor is undefined.");
              f.custom ? this.A[d] = f.custom : (this.A[d] = hb(g, this.D), f.filter && (typeof this.A[d] === "string" && (this.A[d] = new String(this.A[d])), this.A[d].G = f.filter));
              this.F[d] = g;
              this.tag.set(g, new Map());
            }
          }
        }
        if (this.worker) {
          this.fastupdate = false;
          a = [];
          for (const d of this.index.values()) d.then && a.push(d);
          if (a.length) {
            const d = this;
            return Promise.all(a).then(function(f) {
              let g = 0;
              for (const k of d.index.entries()) {
                const h = k[0];
                let l = k[1];
                l.then && (l = f[g], d.index.set(h, l), g++);
              }
              return d;
            });
          }
        } else a.db && (this.fastupdate = false, this.mount(a.db));
      }
      w = Na.prototype;
      w.mount = function(a) {
        let c = this.field;
        if (this.tag) for (let f = 0, g; f < this.F.length; f++) {
          g = this.F[f];
          var b = void 0;
          this.index.set(g, b = new T({}, this.reg));
          c === this.field && (c = c.slice(0));
          c.push(g);
          b.tag = this.tag.get(g);
        }
        b = [];
        const e = { db: a.db, type: a.type, fastupdate: a.fastupdate };
        for (let f = 0, g, k; f < c.length; f++) {
          e.field = k = c[f];
          g = this.index.get(k);
          const h = new a.constructor(a.id, e);
          h.id = a.id;
          b[f] = h.mount(g);
          g.document = true;
          f ? g.bypass = true : g.store = this.store;
        }
        const d = this;
        return this.db = Promise.all(b).then(function() {
          d.db = true;
        });
      };
      w.commit = async function() {
        const a = [];
        for (const c of this.index.values()) a.push(c.commit());
        await Promise.all(a);
        this.reg.clear();
      };
      w.destroy = function() {
        const a = [];
        for (const c of this.index.values()) a.push(c.destroy());
        return Promise.all(a);
      };
      function ib(a, c) {
        const b = new Map();
        let e = c.index || c.field || c;
        M(e) && (e = [e]);
        for (let f = 0, g, k; f < e.length; f++) {
          g = e[f];
          M(g) || (k = g, g = g.field);
          k = ba(k) ? Object.assign({}, a, k) : a;
          if (this.worker) {
            var d = void 0;
            d = (d = k.encoder) && d.encode ? d : new ka(typeof d === "string" ? va[d] : d || {});
            d = new La(k, d);
            b.set(g, d);
          }
          this.worker || b.set(g, new T(k, this.reg));
          k.custom ? this.B[f] = k.custom : (this.B[f] = hb(g, this.D), k.filter && (typeof this.B[f] === "string" && (this.B[f] = new String(this.B[f])), this.B[f].G = k.filter));
          this.field[f] = g;
        }
        if (this.h) {
          a = c.store;
          M(a) && (a = [a]);
          for (let f = 0, g, k; f < a.length; f++) g = a[f], k = g.field || g, g.custom ? (this.h[f] = g.custom, g.custom.O = k) : (this.h[f] = hb(k, this.D), g.filter && (typeof this.h[f] === "string" && (this.h[f] = new String(this.h[f])), this.h[f].G = g.filter));
        }
        return b;
      }
      function hb(a, c) {
        const b = a.split(":");
        let e = 0;
        for (let d = 0; d < b.length; d++) a = b[d], a[a.length - 1] === "]" && (a = a.substring(0, a.length - 2)) && (c[e] = true), a && (b[e++] = a);
        e < b.length && (b.length = e);
        return e > 1 ? b : b[0];
      }
      w.append = function(a, c) {
        return this.add(a, c, true);
      };
      w.update = function(a, c) {
        return this.remove(a).add(a, c);
      };
      w.remove = function(a) {
        ba(a) && (a = ca(a, this.key));
        for (var c of this.index.values()) c.remove(a, true);
        if (this.reg.has(a)) {
          if (this.tag && !this.fastupdate) for (let b of this.tag.values()) for (let e of b) {
            c = e[0];
            const d = e[1], f = d.indexOf(a);
            f > -1 && (d.length > 1 ? d.splice(f, 1) : b.delete(c));
          }
          this.store && this.store.delete(a);
          this.reg.delete(a);
        }
        this.cache && this.cache.remove(a);
        return this;
      };
      w.clear = function() {
        const a = [];
        for (const c of this.index.values()) {
          const b = c.clear();
          b.then && a.push(b);
        }
        if (this.tag) for (const c of this.tag.values()) c.clear();
        this.store && this.store.clear();
        this.cache && this.cache.clear();
        return a.length ? Promise.all(a) : this;
      };
      w.contain = function(a) {
        return this.db ? this.index.get(this.field[0]).db.has(a) : this.reg.has(a);
      };
      w.cleanup = function() {
        for (const a of this.index.values()) a.cleanup();
        return this;
      };
      w.get = function(a) {
        return this.db ? this.index.get(this.field[0]).db.enrich(a).then(function(c) {
          return c[0] && c[0].doc || null;
        }) : this.store.get(a) || null;
      };
      w.set = function(a, c) {
        typeof a === "object" && (c = a, a = ca(c, this.key));
        this.store.set(a, c);
        return this;
      };
      w.searchCache = la;
      w.export = jb;
      w.import = kb;
      Fa(Na.prototype);
      function lb(a, c = 0) {
        let b = [], e = [];
        c && (c = 25e4 / c * 5e3 | 0);
        for (const d of a.entries()) e.push(d), e.length === c && (b.push(e), e = []);
        e.length && b.push(e);
        return b;
      }
      function mb(a, c) {
        c || (c = new Map());
        for (let b = 0, e; b < a.length; b++) e = a[b], c.set(e[0], e[1]);
        return c;
      }
      function nb(a, c = 0) {
        let b = [], e = [];
        c && (c = 25e4 / c * 1e3 | 0);
        for (const d of a.entries()) e.push([d[0], lb(d[1])[0] || []]), e.length === c && (b.push(e), e = []);
        e.length && b.push(e);
        return b;
      }
      function ob(a, c) {
        c || (c = new Map());
        for (let b = 0, e, d; b < a.length; b++) e = a[b], d = c.get(e[0]), c.set(e[0], mb(e[1], d));
        return c;
      }
      function pb(a) {
        let c = [], b = [];
        for (const e of a.keys()) b.push(e), b.length === 25e4 && (c.push(b), b = []);
        b.length && c.push(b);
        return c;
      }
      function qb(a, c) {
        c || (c = new Set());
        for (let b = 0; b < a.length; b++) c.add(a[b]);
        return c;
      }
      function rb(a, c, b, e, d, f, g = 0) {
        const k = e && e.constructor === Array;
        var h = k ? e.shift() : e;
        if (!h) return this.export(a, c, d, f + 1);
        if ((h = a((c ? c + "." : "") + (g + 1) + "." + b, JSON.stringify(h))) && h.then) {
          const l = this;
          return h.then(function() {
            return rb.call(l, a, c, b, k ? e : null, d, f, g + 1);
          });
        }
        return rb.call(this, a, c, b, k ? e : null, d, f, g + 1);
      }
      function jb(a, c, b = 0, e = 0) {
        if (b < this.field.length) {
          const g = this.field[b];
          if ((c = this.index.get(g).export(a, g, b, e = 1)) && c.then) {
            const k = this;
            return c.then(function() {
              return k.export(a, g, b + 1);
            });
          }
          return this.export(a, g, b + 1);
        }
        let d, f;
        switch (e) {
          case 0:
            d = "reg";
            f = pb(this.reg);
            c = null;
            break;
          case 1:
            d = "tag";
            f = this.tag && nb(this.tag, this.reg.size);
            c = null;
            break;
          case 2:
            d = "doc";
            f = this.store && lb(this.store);
            c = null;
            break;
          default:
            return;
        }
        return rb.call(this, a, c, d, f || null, b, e);
      }
      function kb(a, c) {
        var b = a.split(".");
        b[b.length - 1] === "json" && b.pop();
        const e = b.length > 2 ? b[0] : "";
        b = b.length > 2 ? b[2] : b[1];
        if (this.worker && e) return this.index.get(e).import(a);
        if (c) {
          typeof c === "string" && (c = JSON.parse(c));
          if (e) return this.index.get(e).import(b, c);
          switch (b) {
            case "reg":
              this.fastupdate = false;
              this.reg = qb(c, this.reg);
              for (let d = 0, f; d < this.field.length; d++) f = this.index.get(this.field[d]), f.fastupdate = false, f.reg = this.reg;
              if (this.worker) {
                c = [];
                for (const d of this.index.values()) c.push(d.import(a));
                return Promise.all(c);
              }
              break;
            case "tag":
              this.tag = ob(c, this.tag);
              break;
            case "doc":
              this.store = mb(c, this.store);
          }
        }
      }
      function sb(a, c) {
        let b = "";
        for (const e of a.entries()) {
          a = e[0];
          const d = e[1];
          let f = "";
          for (let g = 0, k; g < d.length; g++) {
            k = d[g] || [""];
            let h = "";
            for (let l = 0; l < k.length; l++) h += (h ? "," : "") + (c === "string" ? '"' + k[l] + '"' : k[l]);
            h = "[" + h + "]";
            f += (f ? "," : "") + h;
          }
          f = '["' + a + '",[' + f + "]]";
          b += (b ? "," : "") + f;
        }
        return b;
      }
      T.prototype.remove = function(a, c) {
        const b = this.reg.size && (this.fastupdate ? this.reg.get(a) : this.reg.has(a));
        if (b) {
          if (this.fastupdate) for (let e = 0, d, f; e < b.length; e++) {
            if ((d = b[e]) && (f = d.length)) if (d[f - 1] === a) d.pop();
            else {
              const g = d.indexOf(a);
              g >= 0 && d.splice(g, 1);
            }
          }
          else tb(this.map, a), this.depth && tb(this.ctx, a);
          c || this.reg.delete(a);
        }
        this.db && (this.commit_task.push({ del: a }), this.M && ub(this));
        this.cache && this.cache.remove(a);
        return this;
      };
      function tb(a, c) {
        let b = 0;
        var e = typeof c === "undefined";
        if (a.constructor === Array) for (let d = 0, f, g, k; d < a.length; d++) {
          if ((f = a[d]) && f.length) {
            if (e) return 1;
            g = f.indexOf(c);
            if (g >= 0) {
              if (f.length > 1) return f.splice(g, 1), 1;
              delete a[d];
              if (b) return 1;
              k = 1;
            } else {
              if (k) return 1;
              b++;
            }
          }
        }
        else for (let d of a.entries()) e = d[0], tb(d[1], c) ? b++ : a.delete(e);
        return b;
      }
      const vb = { memory: { resolution: 1 }, performance: { resolution: 3, fastupdate: true, context: { depth: 1, resolution: 1 } }, match: { tokenize: "forward" }, score: { resolution: 9, context: { depth: 2, resolution: 3 } } };
      T.prototype.add = function(a, c, b, e) {
        if (c && (a || a === 0)) {
          if (!e && !b && this.reg.has(a)) return this.update(a, c);
          e = this.depth;
          c = this.encoder.encode(c, !e);
          const l = c.length;
          if (l) {
            const m = I(), p = I(), u = this.resolution;
            for (let r = 0; r < l; r++) {
              let t = c[this.rtl ? l - 1 - r : r];
              var d = t.length;
              if (d && (e || !p[t])) {
                var f = this.score ? this.score(c, t, r, null, 0) : wb(u, l, r), g = "";
                switch (this.tokenize) {
                  case "tolerant":
                    Y(this, p, t, f, a, b);
                    if (d > 2) {
                      for (let n = 1, q, x, v, A; n < d - 1; n++) q = t.charAt(n), x = t.charAt(n + 1), v = t.substring(0, n) + x, A = t.substring(n + 2), g = v + q + A, Y(this, p, g, f, a, b), g = v + A, Y(this, p, g, f, a, b);
                      Y(this, p, t.substring(0, t.length - 1), f, a, b);
                    }
                    break;
                  case "full":
                    if (d > 2) {
                      for (let n = 0, q; n < d; n++) for (f = d; f > n; f--) {
                        g = t.substring(n, f);
                        q = this.rtl ? d - 1 - n : n;
                        var k = this.score ? this.score(c, t, r, g, q) : wb(u, l, r, d, q);
                        Y(this, p, g, k, a, b);
                      }
                      break;
                    }
                  case "bidirectional":
                  case "reverse":
                    if (d > 1) {
                      for (k = d - 1; k > 0; k--) {
                        g = t[this.rtl ? d - 1 - k : k] + g;
                        var h = this.score ? this.score(c, t, r, g, k) : wb(u, l, r, d, k);
                        Y(this, p, g, h, a, b);
                      }
                      g = "";
                    }
                  case "forward":
                    if (d > 1) {
                      for (k = 0; k < d; k++) g += t[this.rtl ? d - 1 - k : k], Y(
                        this,
                        p,
                        g,
                        f,
                        a,
                        b
                      );
                      break;
                    }
                  default:
                    if (Y(this, p, t, f, a, b), e && l > 1 && r < l - 1) for (d = this.N, g = t, f = Math.min(e + 1, this.rtl ? r + 1 : l - r), k = 1; k < f; k++) {
                      t = c[this.rtl ? l - 1 - r - k : r + k];
                      h = this.bidirectional && t > g;
                      const n = this.score ? this.score(c, g, r, t, k - 1) : wb(d + (l / 2 > d ? 0 : 1), l, r, f - 1, k - 1);
                      Y(this, m, h ? g : t, n, a, b, h ? t : g);
                    }
                }
              }
            }
            this.fastupdate || this.reg.add(a);
          }
        }
        this.db && (this.commit_task.push(b ? { ins: a } : { del: a }), this.M && ub(this));
        return this;
      };
      function Y(a, c, b, e, d, f, g) {
        let k, h;
        if (!(k = c[b]) || g && !k[g]) {
          g ? (c = k || (c[b] = I()), c[g] = 1, h = a.ctx, (k = h.get(g)) ? h = k : h.set(g, h = a.keystore ? new R(a.keystore) : new Map())) : (h = a.map, c[b] = 1);
          (k = h.get(b)) ? h = k : h.set(b, h = k = []);
          if (f) {
            for (let l = 0, m; l < k.length; l++) if ((m = k[l]) && m.includes(d)) {
              if (l <= e) return;
              m.splice(m.indexOf(d), 1);
              a.fastupdate && (c = a.reg.get(d)) && c.splice(c.indexOf(m), 1);
              break;
            }
          }
          h = h[e] || (h[e] = []);
          h.push(d);
          if (h.length === 2 ** 31 - 1) {
            c = new xa(h);
            if (a.fastupdate) for (let l of a.reg.values()) l.includes(h) && (l[l.indexOf(h)] = c);
            k[e] = h = c;
          }
          a.fastupdate && ((e = a.reg.get(d)) ? e.push(h) : a.reg.set(d, [h]));
        }
      }
      function wb(a, c, b, e, d) {
        return b && a > 1 ? c + (e || 0) <= a ? b + (d || 0) : (a - 1) / (c + (e || 0)) * (b + (d || 0)) + 1 | 0 : 0;
      }
      T.prototype.search = function(a, c, b) {
        b || (c || typeof a !== "object" ? typeof c === "object" && (b = c, c = 0) : (b = a, a = ""));
        if (b && b.cache) return b.cache = false, a = this.searchCache(a, c, b), b.cache = true, a;
        let e = [], d, f, g, k = 0, h, l, m, p, u;
        b && (a = b.query || a, c = b.limit || c, k = b.offset || 0, f = b.context, g = b.suggest, u = (h = b.resolve) && b.enrich, m = b.boost, p = b.resolution, l = this.db && b.tag);
        typeof h === "undefined" && (h = this.resolve);
        f = this.depth && f !== false;
        let r = this.encoder.encode(a, !f);
        d = r.length;
        c = c || (h ? 100 : 0);
        if (d === 1) return xb.call(
          this,
          r[0],
          "",
          c,
          k,
          h,
          u,
          l
        );
        if (d === 2 && f && !g) return xb.call(this, r[1], r[0], c, k, h, u, l);
        let t = I(), n = 0, q;
        f && (q = r[0], n = 1);
        p || p === 0 || (p = q ? this.N : this.resolution);
        if (this.db) {
          if (this.db.search && (b = this.db.search(this, r, c, k, g, h, u, l), b !== false)) return b;
          const x = this;
          return (async function() {
            for (let v, A; n < d; n++) {
              if ((A = r[n]) && !t[A]) {
                t[A] = 1;
                v = await yb(x, A, q, 0, 0, false, false);
                if (v = zb(v, e, g, p)) {
                  e = v;
                  break;
                }
                q && (g && v && e.length || (q = A));
              }
              g && q && n === d - 1 && !e.length && (p = x.resolution, q = "", n = -1, t = I());
            }
            return Ab(e, p, c, k, g, m, h);
          })();
        }
        for (let x, v; n < d; n++) {
          if ((v = r[n]) && !t[v]) {
            t[v] = 1;
            x = yb(this, v, q, 0, 0, false, false);
            if (x = zb(x, e, g, p)) {
              e = x;
              break;
            }
            q && (g && x && e.length || (q = v));
          }
          g && q && n === d - 1 && !e.length && (p = this.resolution, q = "", n = -1, t = I());
        }
        return Ab(e, p, c, k, g, m, h);
      };
      function Ab(a, c, b, e, d, f, g) {
        let k = a.length, h = a;
        if (k > 1) h = $a(a, c, b, e, d, f, g);
        else if (k === 1) return g ? Sa.call(null, a[0], b, e) : new X(a[0], this);
        return g ? h : new X(h, this);
      }
      function xb(a, c, b, e, d, f, g) {
        a = yb(this, a, c, b, e, d, f, g);
        return this.db ? a.then(function(k) {
          return d ? k || [] : new X(k, this);
        }) : a && a.length ? d ? Sa.call(this, a, b, e) : new X(a, this) : d ? [] : new X([], this);
      }
      function zb(a, c, b, e) {
        let d = [];
        if (a && a.length) {
          if (a.length <= e) {
            c.push(a);
            return;
          }
          for (let f = 0, g; f < e; f++) if (g = a[f]) d[f] = g;
          if (d.length) {
            c.push(d);
            return;
          }
        }
        if (!b) return d;
      }
      function yb(a, c, b, e, d, f, g, k) {
        let h;
        b && (h = a.bidirectional && c > b) && (h = b, b = c, c = h);
        if (a.db) return a.db.get(c, b, e, d, f, g, k);
        a = b ? (a = a.ctx.get(b)) && a.get(c) : a.map.get(c);
        return a;
      }
      function T(a, c) {
        if (!this || this.constructor !== T) return new T(a);
        if (a) {
          var b = M(a) ? a : a.preset;
          b && (a = Object.assign({}, vb[b], a));
        } else a = {};
        b = a.context;
        const e = b === true ? { depth: 1 } : b || {}, d = M(a.encoder) ? va[a.encoder] : a.encode || a.encoder || {};
        this.encoder = d.encode ? d : typeof d === "object" ? new ka(d) : { encode: d };
        this.resolution = a.resolution || 9;
        this.tokenize = b = (b = a.tokenize) && b !== "default" && b !== "exact" && b || "strict";
        this.depth = b === "strict" && e.depth || 0;
        this.bidirectional = e.bidirectional !== false;
        this.fastupdate = !!a.fastupdate;
        this.score = a.score || null;
        (b = a.keystore || 0) && (this.keystore = b);
        this.map = b ? new R(b) : new Map();
        this.ctx = b ? new R(b) : new Map();
        this.reg = c || (this.fastupdate ? b ? new R(b) : new Map() : b ? new S(b) : new Set());
        this.N = e.resolution || 3;
        this.rtl = d.rtl || a.rtl || false;
        this.cache = (b = a.cache || null) && new ma(b);
        this.resolve = a.resolve !== false;
        if (b = a.db) this.db = this.mount(b);
        this.M = a.commit !== false;
        this.commit_task = [];
        this.commit_timer = null;
        this.priority = a.priority || 4;
      }
      w = T.prototype;
      w.mount = function(a) {
        this.commit_timer && (clearTimeout(this.commit_timer), this.commit_timer = null);
        return a.mount(this);
      };
      w.commit = function() {
        this.commit_timer && (clearTimeout(this.commit_timer), this.commit_timer = null);
        return this.db.commit(this);
      };
      w.destroy = function() {
        this.commit_timer && (clearTimeout(this.commit_timer), this.commit_timer = null);
        return this.db.destroy();
      };
      function ub(a) {
        a.commit_timer || (a.commit_timer = setTimeout(function() {
          a.commit_timer = null;
          a.db.commit(a);
        }, 1));
      }
      w.clear = function() {
        this.map.clear();
        this.ctx.clear();
        this.reg.clear();
        this.cache && this.cache.clear();
        return this.db ? (this.commit_timer && clearTimeout(this.commit_timer), this.commit_timer = null, this.commit_task = [], this.db.clear()) : this;
      };
      w.append = function(a, c) {
        return this.add(a, c, true);
      };
      w.contain = function(a) {
        return this.db ? this.db.has(a) : this.reg.has(a);
      };
      w.update = function(a, c) {
        const b = this, e = this.remove(a);
        return e && e.then ? e.then(() => b.add(a, c)) : this.add(a, c);
      };
      w.cleanup = function() {
        if (!this.fastupdate) return this;
        tb(this.map);
        this.depth && tb(this.ctx);
        return this;
      };
      w.searchCache = la;
      w.export = function(a, c, b = 0, e = 0) {
        let d, f;
        switch (e) {
          case 0:
            d = "reg";
            f = pb(this.reg);
            break;
          case 1:
            d = "cfg";
            f = null;
            break;
          case 2:
            d = "map";
            f = lb(this.map, this.reg.size);
            break;
          case 3:
            d = "ctx";
            f = nb(this.ctx, this.reg.size);
            break;
          default:
            return;
        }
        return rb.call(this, a, c, d, f, b, e);
      };
      w.import = function(a, c) {
        if (c) switch (typeof c === "string" && (c = JSON.parse(c)), a = a.split("."), a[a.length - 1] === "json" && a.pop(), a.length === 3 && a.shift(), a = a.length > 1 ? a[1] : a[0], a) {
          case "reg":
            this.fastupdate = false;
            this.reg = qb(c, this.reg);
            break;
          case "map":
            this.map = mb(c, this.map);
            break;
          case "ctx":
            this.ctx = ob(c, this.ctx);
        }
      };
      w.serialize = function(a = true) {
        let c = "", b = "", e = "";
        if (this.reg.size) {
          let f;
          for (var d of this.reg.keys()) f || (f = typeof d), c += (c ? "," : "") + (f === "string" ? '"' + d + '"' : d);
          c = "index.reg=new Set([" + c + "]);";
          b = sb(this.map, f);
          b = "index.map=new Map([" + b + "]);";
          for (const g of this.ctx.entries()) {
            d = g[0];
            let k = sb(g[1], f);
            k = "new Map([" + k + "])";
            k = '["' + d + '",' + k + "]";
            e += (e ? "," : "") + k;
          }
          e = "index.ctx=new Map([" + e + "]);";
        }
        return a ? "function inject(index){" + c + b + e + "}" : c + b + e;
      };
      Fa(T.prototype);
      const Bb = typeof window !== "undefined" && (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB), Cb = ["map", "ctx", "tag", "reg", "cfg"], Db = I();
      function Eb(a, c = {}) {
        if (!this || this.constructor !== Eb) return new Eb(a, c);
        typeof a === "object" && (c = a, a = a.name);
        a || console.info("Default storage space was used, because a name was not passed.");
        this.id = "flexsearch" + (a ? ":" + a.toLowerCase().replace(/[^a-z0-9_\-]/g, "") : "");
        this.field = c.field ? c.field.toLowerCase().replace(/[^a-z0-9_\-]/g, "") : "";
        this.type = c.type;
        this.fastupdate = this.support_tag_search = false;
        this.db = null;
        this.h = {};
      }
      w = Eb.prototype;
      w.mount = function(a) {
        if (a.index) return a.mount(this);
        a.db = this;
        return this.open();
      };
      w.open = function() {
        if (this.db) return this.db;
        let a = this;
        navigator.storage && navigator.storage.persist && navigator.storage.persist();
        Db[a.id] || (Db[a.id] = []);
        Db[a.id].push(a.field);
        const c = Bb.open(a.id, 1);
        c.onupgradeneeded = function() {
          const b = a.db = this.result;
          for (let e = 0, d; e < Cb.length; e++) {
            d = Cb[e];
            for (let f = 0, g; f < Db[a.id].length; f++) g = Db[a.id][f], b.objectStoreNames.contains(d + (d !== "reg" ? g ? ":" + g : "" : "")) || b.createObjectStore(d + (d !== "reg" ? g ? ":" + g : "" : ""));
          }
        };
        return a.db = Z(c, function(b) {
          a.db = b;
          a.db.onversionchange = function() {
            a.close();
          };
        });
      };
      w.close = function() {
        this.db && this.db.close();
        this.db = null;
      };
      w.destroy = function() {
        const a = Bb.deleteDatabase(this.id);
        return Z(a);
      };
      w.clear = function() {
        const a = [];
        for (let b = 0, e; b < Cb.length; b++) {
          e = Cb[b];
          for (let d = 0, f; d < Db[this.id].length; d++) f = Db[this.id][d], a.push(e + (e !== "reg" ? f ? ":" + f : "" : ""));
        }
        const c = this.db.transaction(a, "readwrite");
        for (let b = 0; b < a.length; b++) c.objectStore(a[b]).clear();
        return Z(c);
      };
      w.get = function(a, c, b = 0, e = 0, d = true, f = false) {
        a = this.db.transaction((c ? "ctx" : "map") + (this.field ? ":" + this.field : ""), "readonly").objectStore((c ? "ctx" : "map") + (this.field ? ":" + this.field : "")).get(c ? c + ":" + a : a);
        const g = this;
        return Z(a).then(function(k) {
          let h = [];
          if (!k || !k.length) return h;
          if (d) {
            if (!b && !e && k.length === 1) return k[0];
            for (let l = 0, m; l < k.length; l++) if ((m = k[l]) && m.length) {
              if (e >= m.length) {
                e -= m.length;
                continue;
              }
              const p = b ? e + Math.min(m.length - e, b) : m.length;
              for (let u = e; u < p; u++) h.push(m[u]);
              e = 0;
              if (h.length === b) break;
            }
            return f ? g.enrich(h) : h;
          }
          return k;
        });
      };
      w.tag = function(a, c = 0, b = 0, e = false) {
        a = this.db.transaction("tag" + (this.field ? ":" + this.field : ""), "readonly").objectStore("tag" + (this.field ? ":" + this.field : "")).get(a);
        const d = this;
        return Z(a).then(function(f) {
          if (!f || !f.length || b >= f.length) return [];
          if (!c && !b) return f;
          f = f.slice(b, b + c);
          return e ? d.enrich(f) : f;
        });
      };
      w.enrich = function(a) {
        typeof a !== "object" && (a = [a]);
        const c = this.db.transaction("reg", "readonly").objectStore("reg"), b = [];
        for (let e = 0; e < a.length; e++) b[e] = Z(c.get(a[e]));
        return Promise.all(b).then(function(e) {
          for (let d = 0; d < e.length; d++) e[d] = { id: a[d], doc: e[d] ? JSON.parse(e[d]) : null };
          return e;
        });
      };
      w.has = function(a) {
        a = this.db.transaction("reg", "readonly").objectStore("reg").getKey(a);
        return Z(a).then(function(c) {
          return !!c;
        });
      };
      w.search = null;
      w.info = function() {
      };
      w.transaction = function(a, c, b) {
        a += a !== "reg" ? this.field ? ":" + this.field : "" : "";
        let e = this.h[a + ":" + c];
        if (e) return b.call(this, e);
        let d = this.db.transaction(a, c);
        this.h[a + ":" + c] = e = d.objectStore(a);
        const f = b.call(this, e);
        this.h[a + ":" + c] = null;
        return Z(d).finally(function() {
          return f;
        });
      };
      w.commit = async function(a) {
        let c = a.commit_task, b = [];
        a.commit_task = [];
        for (let e = 0, d; e < c.length; e++) d = c[e], d.del && b.push(d.del);
        b.length && await this.remove(b);
        a.reg.size && (await this.transaction("map", "readwrite", function(e) {
          for (const d of a.map) {
            const f = d[0], g = d[1];
            g.length && (e.get(f).onsuccess = function() {
              let k = this.result;
              var h;
              if (k && k.length) {
                const l = Math.max(k.length, g.length);
                for (let m = 0, p, u; m < l; m++) if ((u = g[m]) && u.length) {
                  if ((p = k[m]) && p.length) for (h = 0; h < u.length; h++) p.push(u[h]);
                  else k[m] = u;
                  h = 1;
                }
              } else k = g, h = 1;
              h && e.put(k, f);
            });
          }
        }), await this.transaction("ctx", "readwrite", function(e) {
          for (const d of a.ctx) {
            const f = d[0], g = d[1];
            for (const k of g) {
              const h = k[0], l = k[1];
              l.length && (e.get(f + ":" + h).onsuccess = function() {
                let m = this.result;
                var p;
                if (m && m.length) {
                  const u = Math.max(m.length, l.length);
                  for (let r = 0, t, n; r < u; r++) if ((n = l[r]) && n.length) {
                    if ((t = m[r]) && t.length) for (p = 0; p < n.length; p++) t.push(n[p]);
                    else m[r] = n;
                    p = 1;
                  }
                } else m = l, p = 1;
                p && e.put(m, f + ":" + h);
              });
            }
          }
        }), a.store ? await this.transaction(
          "reg",
          "readwrite",
          function(e) {
            for (const d of a.store) {
              const f = d[0], g = d[1];
              e.put(typeof g === "object" ? JSON.stringify(g) : 1, f);
            }
          }
        ) : a.bypass || await this.transaction("reg", "readwrite", function(e) {
          for (const d of a.reg.keys()) e.put(1, d);
        }), a.tag && await this.transaction("tag", "readwrite", function(e) {
          for (const d of a.tag) {
            const f = d[0], g = d[1];
            g.length && (e.get(f).onsuccess = function() {
              let k = this.result;
              k = k && k.length ? k.concat(g) : g;
              e.put(k, f);
            });
          }
        }), a.map.clear(), a.ctx.clear(), a.tag && a.tag.clear(), a.store && a.store.clear(), a.document || a.reg.clear());
      };
      function Fb(a, c, b) {
        const e = a.value;
        let d, f = 0;
        for (let g = 0, k; g < e.length; g++) {
          if (k = b ? e : e[g]) {
            for (let h = 0, l, m; h < c.length; h++) if (m = c[h], l = k.indexOf(m), l >= 0) if (d = 1, k.length > 1) k.splice(l, 1);
            else {
              e[g] = [];
              break;
            }
            f += k.length;
          }
          if (b) break;
        }
        f ? d && a.update(e) : a.delete();
        a.continue();
      }
      w.remove = function(a) {
        typeof a !== "object" && (a = [a]);
        return Promise.all([this.transaction("map", "readwrite", function(c) {
          c.openCursor().onsuccess = function() {
            const b = this.result;
            b && Fb(b, a);
          };
        }), this.transaction("ctx", "readwrite", function(c) {
          c.openCursor().onsuccess = function() {
            const b = this.result;
            b && Fb(b, a);
          };
        }), this.transaction("tag", "readwrite", function(c) {
          c.openCursor().onsuccess = function() {
            const b = this.result;
            b && Fb(b, a, true);
          };
        }), this.transaction("reg", "readwrite", function(c) {
          for (let b = 0; b < a.length; b++) c.delete(a[b]);
        })]);
      };
      function Z(a, c) {
        return new Promise((b, e) => {
          a.onsuccess = a.oncomplete = function() {
            c && c(this.result);
            c = null;
            b(this.result);
          };
          a.onerror = a.onblocked = e;
          a = null;
        });
      }
      const Index = T;
      const DanmukuDB = {
db: null,
initialized: false,
memoryCache: new Map(),
searchIndex: null,
indexBuilt: false,
async init() {
          if (this.initialized) {
            return true;
          }
          try {
            this.db = await this._openDatabase();
            this.initialized = true;
            await this._buildMemoryIndex();
            Utils.log("弹幕数据库初始化成功");
            return true;
          } catch (error) {
            Utils.log(`弹幕数据库初始化失败: ${error.message}`, "error");
            return false;
          }
        },
_openDatabase() {
          return new Promise((resolve, reject) => {
            const request = indexedDB.open(SETTINGS.DB_NAME, SETTINGS.DB_VERSION);
            request.onerror = () => {
              reject(new Error("数据库打开失败"));
            };
            request.onsuccess = (event) => {
              resolve(event.target.result);
            };
            request.onupgradeneeded = (event) => {
              const db = event.target.result;
              if (!db.objectStoreNames.contains(SETTINGS.DB_STORE_NAME)) {
                const store = db.createObjectStore(SETTINGS.DB_STORE_NAME, {
                  keyPath: "id",
                  autoIncrement: true
                });
                store.createIndex("text", "text", { unique: false });
                store.createIndex("tags", "tags", { unique: false, multiEntry: true });
                store.createIndex("syncState", "syncState", { unique: false });
                store.createIndex("lastUsed", "lastUsed", { unique: false });
                store.createIndex("useCount", "useCount", { unique: false });
                store.createIndex("popularity", "popularity", { unique: false });
                store.createIndex("originalId", "originalId", { unique: false });
                store.createIndex("category", "category", { unique: false });
              }
              if (!db.objectStoreNames.contains("tag_dictionary")) {
                const tagStore = db.createObjectStore("tag_dictionary", {
                  keyPath: "dictValue"
                });
                tagStore.createIndex("dictLabel", "dictLabel", { unique: false });
                tagStore.createIndex("dictType", "dictType", { unique: false });
              }
              if (!db.objectStoreNames.contains("import_logs")) {
                const logStore = db.createObjectStore("import_logs", {
                  keyPath: "id",
                  autoIncrement: true
                });
                logStore.createIndex("timestamp", "timestamp", { unique: false });
                logStore.createIndex("status", "status", { unique: false });
              }
            };
          });
        },
async add(text, tags = []) {
          if (!this.initialized) {
            Utils.log("数据库未初始化", "error");
            return null;
          }
          try {
            const danmukuData = {
              text: text.trim(),
              tags: tags.filter((tag) => tag.trim()),
              syncState: "pending",
createdAt: Date.now(),
              lastUsed: Date.now(),
              useCount: 1
            };
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], "readwrite");
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const request = store.add(danmukuData);
            return new Promise((resolve, reject) => {
              request.onsuccess = (event) => {
                const id = event.target.result;
                const newData = { ...danmukuData, id };
                this.memoryCache.set(id, newData);
                if (this.searchIndex) {
                  const searchContent = [newData.text, ...newData.tags].join(" ");
                  this.searchIndex.add(newData.id, searchContent);
                }
                Utils.log(`弹幕模板添加成功: ${text}`);
                resolve(id);
              };
              request.onerror = () => {
                reject(new Error("添加弹幕模板失败"));
              };
            });
          } catch (error) {
            Utils.log(`添加弹幕模板异常: ${error.message}`, "error");
            return null;
          }
        },
async search(query, limit = SETTINGS.maxSuggestions, sortBy = "relevance") {
          if (!this.initialized || !query) {
            Utils.log("搜索条件无效: 数据库未初始化或查询为空");
            return [];
          }
          try {
            if (!this.indexBuilt) {
              await this._buildMemoryIndex();
            }
            const searchIds = this.searchIndex.search(query, limit * 2);
            let matchedDanmuku = searchIds.map((id) => this.memoryCache.get(id)).filter((item) => item);
            switch (sortBy) {
              case "popularity":
                matchedDanmuku.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                break;
              case "recent":
                matchedDanmuku.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                break;
              case "usage":
                matchedDanmuku.sort((a, b) => {
                  if (b.useCount !== a.useCount) {
                    return (b.useCount || 0) - (a.useCount || 0);
                  }
                  return (b.lastUsed || 0) - (a.lastUsed || 0);
                });
                break;
              default:
                matchedDanmuku.sort((a, b) => {
                  const scoreA = (a.useCount || 0) * 0.4 + (a.popularity || 0) * 0.3 + (a.lastUsed || 0) / 1e6 * 0.3;
                  const scoreB = (b.useCount || 0) * 0.4 + (b.popularity || 0) * 0.3 + (b.lastUsed || 0) / 1e6 * 0.3;
                  return scoreB - scoreA;
                });
                break;
            }
            const finalResults = matchedDanmuku.slice(0, limit);
            Utils.log(`搜索 "${query}" (${sortBy}) 返回 ${finalResults.length} 条结果`);
            return finalResults;
          } catch (error) {
            Utils.log(`搜索弹幕模板异常: ${error.message}`, "error");
            return [];
          }
        },
async updateUsage(id) {
          if (!this.initialized) {
            return false;
          }
          try {
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], "readwrite");
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const getRequest = store.get(id);
            return new Promise((resolve) => {
              getRequest.onsuccess = (event) => {
                const data = event.target.result;
                if (data) {
                  data.useCount = (data.useCount || 0) + 1;
                  data.lastUsed = Date.now();
                  const putRequest = store.put(data);
                  putRequest.onsuccess = () => {
                    this.memoryCache.set(id, data);
                    if (this.searchIndex) {
                      const searchContent = [data.text, ...data.tags].join(" ");
                      this.searchIndex.update(data.id, searchContent);
                    }
                    resolve(true);
                  };
                  putRequest.onerror = () => resolve(false);
                } else {
                  resolve(false);
                }
              };
              getRequest.onerror = () => resolve(false);
            });
          } catch (error) {
            Utils.log(`更新使用统计异常: ${error.message}`, "error");
            return false;
          }
        },
async delete(id) {
          if (!this.initialized) {
            return false;
          }
          try {
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], "readwrite");
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const request = store.delete(id);
            return new Promise((resolve) => {
              request.onsuccess = () => {
                this.memoryCache.delete(id);
                if (this.searchIndex) {
                  this.searchIndex.remove(id);
                }
                Utils.log(`弹幕模板删除成功: ID ${id}`);
                resolve(true);
              };
              request.onerror = () => {
                Utils.log(`弹幕模板删除失败: ID ${id}`, "error");
                resolve(false);
              };
            });
          } catch (error) {
            Utils.log(`删除弹幕模板异常: ${error.message}`, "error");
            return false;
          }
        },
async getAll() {
          if (!this.initialized) {
            return [];
          }
          try {
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], "readonly");
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const request = store.getAll();
            return new Promise((resolve) => {
              request.onsuccess = (event) => {
                resolve(event.target.result || []);
              };
              request.onerror = () => {
                Utils.log("获取所有弹幕模板失败", "error");
                resolve([]);
              };
            });
          } catch (error) {
            Utils.log(`获取所有弹幕模板异常: ${error.message}`, "error");
            return [];
          }
        },
async clear() {
          if (!this.initialized) {
            return false;
          }
          try {
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], "readwrite");
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const request = store.clear();
            return new Promise((resolve) => {
              request.onsuccess = () => {
                this.memoryCache.clear();
                if (this.searchIndex) {
                  this.searchIndex = null;
                  this.indexBuilt = false;
                }
                Utils.log("弹幕数据库已清空");
                resolve(true);
              };
              request.onerror = () => {
                Utils.log("清空弹幕数据库失败", "error");
                resolve(false);
              };
            });
          } catch (error) {
            Utils.log(`清空数据库异常: ${error.message}`, "error");
            return false;
          }
        },
async initTagDictionary() {
          try {
            const response = await fetch("https://hguofichp.cn:10086/machine/dictList");
            const result = await response.json();
            if (result.code === 200 && result.data) {
              const transaction = this.db.transaction(["tag_dictionary"], "readwrite");
              const store = transaction.objectStore("tag_dictionary");
              await new Promise((resolve, reject) => {
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => resolve();
                clearRequest.onerror = () => reject(new Error("清空标签字典失败"));
              });
              for (const tag of result.data) {
                await new Promise((resolve, reject) => {
                  const addRequest = store.add(tag);
                  addRequest.onsuccess = () => resolve();
                  addRequest.onerror = () => reject(new Error("添加标签失败"));
                });
              }
              Utils.log(`标签字典初始化完成，共 ${result.data.length} 个标签`);
              return true;
            }
            return false;
          } catch (error) {
            Utils.log(`标签字典初始化失败: ${error.message}`, "error");
            return false;
          }
        },
async getTagDictionary() {
          try {
            const transaction = this.db.transaction(["tag_dictionary"], "readonly");
            const store = transaction.objectStore("tag_dictionary");
            const request = store.getAll();
            return new Promise((resolve) => {
              request.onsuccess = (event) => {
                resolve(event.target.result || []);
              };
              request.onerror = () => resolve([]);
            });
          } catch (error) {
            Utils.log(`获取标签字典失败: ${error.message}`, "error");
            return [];
          }
        },
async importFromUrl(url) {
          Utils.log(`开始从 URL 下载弹幕数据: ${url}`);
          try {
            const response = await fetch(url, {
              method: "GET",
              headers: {
                "Accept": "application/json"
              }
            });
            if (!response.ok) {
              throw new Error(`网络响应错误: ${response.status} ${response.statusText}`);
            }
            const jsonData = await response.json();
            Utils.log(`数据下载成功，共 ${jsonData.length} 条。开始导入数据库...`);
            return await this.importFromJson(jsonData);
          } catch (error) {
            Utils.log(`从 URL 导入数据失败: ${error.message}`, "error");
            return null;
          }
        },
async importFromJson(jsonData) {
          const startTime = Date.now();
          const importLog = {
            timestamp: startTime,
            source: "json_data",
            status: "running",
            totalProcessed: 0,
            successCount: 0,
            failCount: 0,
            duplicateCount: 0,
            errors: []
          };
          try {
            const tagDict = await this.getTagDictionary();
            const tagMap = new Map(tagDict.map((tag) => [tag.dictValue, tag.dictLabel]));
            const existingData = await this.getAll();
            const existingTexts = new Set(existingData.map((item) => item.text));
            importLog.totalProcessed = jsonData.length;
            for (const item of jsonData) {
              try {
                if (existingTexts.has(item.barrage)) {
                  importLog.duplicateCount++;
                  continue;
                }
                const tagValues = item.tags ? String(item.tags).split(",").map((t) => t.trim()) : [];
                const tagLabels = tagValues.map((value) => tagMap.get(value) || value).filter(Boolean);
                const danmakuData = {
                  text: item.barrage.trim(),
                  tags: tagLabels,
                  originalId: item.id,
                  popularity: parseInt(item.cnt) || 0,
                  category: "imported",
                  syncState: "synced",
                  createdAt: new Date(item.submitTime).getTime(),
                  lastUsed: 0,
                  useCount: 0,
                  source: "json_import",
                  importBatch: startTime
                };
                const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], "readwrite");
                const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
                await new Promise((resolve, reject) => {
                  const addRequest = store.add(danmakuData);
                  addRequest.onsuccess = () => resolve();
                  addRequest.onerror = (e) => reject(new Error(`数据库添加失败: ${e.target.error}`));
                });
                existingTexts.add(item.barrage);
                importLog.successCount++;
              } catch (error) {
                importLog.failCount++;
                importLog.errors.push(`处理弹幕 (ID: ${item.id}) 失败: ${error.message}`);
              }
            }
            importLog.status = "completed";
            importLog.duration = Date.now() - startTime;
            await this._saveImportLog(importLog);
            await this._buildMemoryIndex();
            Utils.log(`JSON数据导入完成！成功 ${importLog.successCount}, 失败 ${importLog.failCount}, 重复 ${importLog.duplicateCount}`);
            return importLog;
          } catch (error) {
            importLog.status = "failed";
            importLog.duration = Date.now() - startTime;
            importLog.errors.push(`导入过程异常: ${error.message}`);
            await this._saveImportLog(importLog);
            Utils.log(`从JSON导入数据失败: ${error.message}`, "error");
            return importLog;
          }
        },
async autoImportData() {
          const startTime = Date.now();
          const importLog = {
            timestamp: startTime,
            source: "url_import",
            status: "running",
            errors: []
          };
          try {
            await this.initTagDictionary();
            const dataUrl = "https://data.ienone.top/danmuku/danmuku_v0.json";
            const result = await this.importFromUrl(dataUrl);
            if (result) {
              Utils.log(`弹幕数据导入完成！`);
              return result;
            } else {
              throw new Error("从URL导入返回了null");
            }
          } catch (error) {
            importLog.status = "failed";
            importLog.duration = Date.now() - startTime;
            importLog.errors.push(`导入过程异常: ${error.message}`);
            await this._saveImportLog(importLog);
            Utils.log(`弹幕数据导入失败: ${error.message}`, "error");
            return importLog;
          }
        },
async _saveImportLog(logData) {
          try {
            const transaction = this.db.transaction(["import_logs"], "readwrite");
            const store = transaction.objectStore("import_logs");
            await new Promise((resolve, reject) => {
              const addRequest = store.add(logData);
              addRequest.onsuccess = () => resolve();
              addRequest.onerror = () => reject(new Error("保存日志失败"));
            });
          } catch (error) {
            Utils.log(`保存导入日志失败: ${error.message}`, "error");
          }
        },
async getImportLogs(limit = 10) {
          try {
            const transaction = this.db.transaction(["import_logs"], "readonly");
            const store = transaction.objectStore("import_logs");
            const index = store.index("timestamp");
            const request = index.openCursor(null, "prev");
            return new Promise((resolve) => {
              const logs = [];
              let count = 0;
              request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && count < limit) {
                  logs.push(cursor.value);
                  count++;
                  cursor.continue();
                } else {
                  resolve(logs);
                }
              };
              request.onerror = () => resolve([]);
            });
          } catch (error) {
            Utils.log(`获取导入日志失败: ${error.message}`, "error");
            return [];
          }
        },
async _buildMemoryIndex() {
          if (this.indexBuilt || !this.initialized) {
            return;
          }
          try {
            const allData = await this.getAll();
            this.memoryCache.clear();
            allData.forEach((item) => {
              this.memoryCache.set(item.id, item);
            });
            this.searchIndex = new Index({
              tokenize: "forward",
              resolution: 9,
depth: 3,
encode: false,
cache: true
});
            allData.forEach((item) => {
              const searchContent = [item.text, ...item.tags].join(" ");
              this.searchIndex.add(item.id, searchContent);
            });
            this.indexBuilt = true;
            Utils.log(`内存索引构建完成，缓存 ${allData.length} 条弹幕模板`);
          } catch (error) {
            Utils.log(`构建内存索引异常: ${error.message}`, "error");
          }
        },
async testAutoImport() {
          Utils.log(`=== 开始测试自动导入功能 ===`);
          const result = await this.autoImportData();
          Utils.log("=== 导入测试完成，结果统计 ===");
          Utils.log(`导入状态: ${result.status}`);
          Utils.log(`总处理数量: ${result.totalProcessed}`);
          Utils.log(`成功导入: ${result.successCount}`);
          Utils.log(`失败数量: ${result.failCount}`);
          Utils.log(`重复跳过: ${result.duplicateCount}`);
          Utils.log(`耗时: ${(result.duration / 1e3).toFixed(2)} 秒`);
          if (result.errors.length > 0) {
            Utils.log("错误详情:", "warn");
            result.errors.forEach((error, index) => {
              Utils.log(`${index + 1}. ${error}`, "warn");
            });
          }
          const totalCount = await this.getDataCount();
          Utils.log(`当前数据库总数据量: ${totalCount}`);
          return result;
        },
async getDataCount() {
          try {
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], "readonly");
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const request = store.count();
            return new Promise((resolve) => {
              request.onsuccess = (event) => {
                resolve(event.target.result || 0);
              };
              request.onerror = () => resolve(0);
            });
          } catch (error) {
            Utils.log(`获取数据总量失败: ${error.message}`, "error");
            return 0;
          }
        },
async getStatistics() {
          try {
            const allData = await this.getAll();
            const imported = allData.filter((item) => item.category === "imported");
            const userCreated = allData.filter((item) => item.category !== "imported");
            const stats = {
              total: allData.length,
              imported: imported.length,
              userCreated: userCreated.length,
              avgPopularity: imported.length > 0 ? (imported.reduce((sum, item) => sum + (item.popularity || 0), 0) / imported.length).toFixed(1) : 0,
              topUsed: allData.sort((a, b) => (b.useCount || 0) - (a.useCount || 0)).slice(0, 5).map((item) => ({ text: item.text, useCount: item.useCount || 0 }))
            };
            Utils.log("=== 数据库统计信息 ===");
            Utils.log(`总数据量: ${stats.total}`);
            Utils.log(`导入数据: ${stats.imported}`);
            Utils.log(`用户创建: ${stats.userCreated}`);
            Utils.log(`平均人气: ${stats.avgPopularity}`);
            Utils.log("最常用弹幕:");
            stats.topUsed.forEach((item, index) => {
              Utils.log(`${index + 1}. "${item.text}" (使用${item.useCount}次)`);
            });
            return stats;
          } catch (error) {
            Utils.log(`获取统计信息失败: ${error.message}`, "error");
            return {};
          }
        }
      };
      const CandidateItem = {
createCandidateItem(candidate, index, isActive = false) {
          const item = document.createElement("div");
          item.className = SETTINGS.CSS_CLASSES.POPUP_ITEM;
          item.dataset.index = index;
          if (isActive) {
            item.classList.add(SETTINGS.CSS_CLASSES.POPUP_ITEM_ACTIVE);
          }
          const textElement = document.createElement("div");
          textElement.className = SETTINGS.CSS_CLASSES.POPUP_ITEM_TEXT;
          textElement.textContent = candidate.getDisplayText ? candidate.getDisplayText() : candidate.text;
          if (candidate.useCount > 0) {
            textElement.title = `使用次数: ${candidate.useCount}`;
          }
          item.appendChild(textElement);
          this.bindItemEvents(item, candidate, index);
          return item;
        },
bindItemEvents(itemEl, candidate, index) {
          this.bindItemClick(itemEl, candidate, index);
          this.bindItemHover(itemEl, index);
        },
bindItemClick(itemEl, candidate, index) {
          itemEl.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            this._emitSelectEvent(candidate, index, "click");
          });
        },
bindItemHover(itemEl, index) {
          let previewTimer = null;
          itemEl.addEventListener("mouseenter", () => {
            this._emitHoverEvent(index);
            previewTimer = setTimeout(() => {
              this._showPreview(itemEl);
            }, SETTINGS.capsule?.preview?.showDelay || 500);
          });
          itemEl.addEventListener("mouseleave", () => {
            if (previewTimer) {
              clearTimeout(previewTimer);
              previewTimer = null;
            }
            this._hidePreview();
          });
        },
updateActiveState(itemEl, isActive) {
          if (isActive) {
            itemEl.classList.add(SETTINGS.CSS_CLASSES.POPUP_ITEM_ACTIVE);
          } else {
            itemEl.classList.remove(SETTINGS.CSS_CLASSES.POPUP_ITEM_ACTIVE);
          }
        },
updateActiveStates(container, activeIndex) {
          const items = container.querySelectorAll(`.${SETTINGS.CSS_CLASSES.POPUP_ITEM}`);
          items.forEach((item, index) => {
            this.updateActiveState(item, index === activeIndex);
          });
        },
_emitSelectEvent(candidate, index, trigger) {
          const event = new CustomEvent("candidateSelected", {
            detail: { candidate, index, trigger }
          });
          document.dispatchEvent(event);
        },
_emitHoverEvent(index) {
          const event = new CustomEvent("candidateHovered", {
            detail: { index }
          });
          document.dispatchEvent(event);
        },
_showPreview(itemEl) {
          const previewElement = document.createElement("div");
          previewElement.className = SETTINGS.CSS_CLASSES.PREVIEW_POPUP;
          previewElement.textContent = itemEl.textContent;
          document.body.appendChild(previewElement);
          const itemRect = itemEl.getBoundingClientRect();
          const previewWidth = 200;
          const previewHeight = 100;
          const verticalOffset = SETTINGS.capsule?.preview?.verticalOffset || 8;
          let left = itemRect.left + window.scrollX;
          let top = itemRect.top + window.scrollY - previewHeight - verticalOffset;
          const rightEdge = left + previewWidth;
          if (rightEdge > window.innerWidth) {
            left = window.innerWidth - previewWidth - 10;
          }
          if (top < window.scrollY) {
            top = itemRect.bottom + window.scrollY + verticalOffset;
          }
          previewElement.style.left = `${left}px`;
          previewElement.style.top = `${top}px`;
          previewElement.classList.add("fade-in");
        },
_hidePreview() {
          const previewElement = document.querySelector(`.${SETTINGS.CSS_CLASSES.PREVIEW_POPUP}`);
          if (previewElement) {
            previewElement.classList.add("fade-out");
            previewElement.addEventListener("animationend", () => {
              previewElement.remove();
            }, { once: true });
          }
        },
getItemHeight() {
          return SETTINGS.ITEM_HEIGHT;
        }
      };
      const CandidatePanel = {
panelElement: null,
contentElement: null,
currentCandidates: [],
currentActiveIndex: -1,
showTimer: null,
        hideTimer: null,
init() {
          this.createPanelDOM();
          this.bindPanelEvents();
          console.log("CandidatePanel initialized");
        },
createPanelDOM() {
          this.panelElement = document.createElement("div");
          this.panelElement.className = SETTINGS.CSS_CLASSES.POPUP;
          this.panelElement.style.display = "none";
          console.log("创建弹窗元素:", this.panelElement);
          console.log("弹窗CSS类名:", SETTINGS.CSS_CLASSES.POPUP);
          this.contentElement = document.createElement("div");
          this.contentElement.className = SETTINGS.CSS_CLASSES.POPUP_CONTENT;
          this.panelElement.appendChild(this.contentElement);
          document.body.appendChild(this.panelElement);
          const addedElement = document.querySelector(`.${SETTINGS.CSS_CLASSES.POPUP}`);
          console.log("弹窗是否成功添加到DOM:", !!addedElement);
          console.log("添加的弹窗元素:", addedElement);
        },
renderCandidatePanel(candidates, activeIndex = 0) {
          this.currentCandidates = candidates || [];
          this.currentActiveIndex = activeIndex;
          this.contentElement.innerHTML = "";
          if (this.currentCandidates.length === 0) {
            this._renderEmptyState();
            return;
          }
          this.currentCandidates.forEach((candidate, index) => {
            const isActive = index === activeIndex;
            const itemElement = CandidateItem.createCandidateItem(candidate, index, isActive);
            this.contentElement.appendChild(itemElement);
          });
          this._updatePanelHeight();
        },
showPanel(targetInput) {
          if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
          }
          this.showTimer = setTimeout(() => {
            this._positionPanel(targetInput);
            this.panelElement.style.display = "block";
            requestAnimationFrame(() => {
              this.panelElement.classList.add(SETTINGS.CSS_CLASSES.POPUP_SHOW);
            });
            this._emitPanelEvent("panelShown");
          }, SETTINGS.POPUP_SHOW_DELAY);
        },
hidePanel() {
          if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
          }
          this.hideTimer = setTimeout(() => {
            this.panelElement.classList.remove(SETTINGS.CSS_CLASSES.POPUP_SHOW);
            setTimeout(() => {
              this.panelElement.style.display = "none";
            }, SETTINGS.ANIMATION_DURATION);
            this._emitPanelEvent("panelHidden");
          }, SETTINGS.POPUP_HIDE_DELAY);
        },
setActiveIndex(newActiveIndex) {
          if (newActiveIndex === this.currentActiveIndex) return;
          this.currentActiveIndex = newActiveIndex;
          CandidateItem.updateActiveStates(this.contentElement, newActiveIndex);
          this._emitPanelEvent("activeIndexChanged", {
            activeIndex: newActiveIndex,
            candidate: this.currentCandidates[newActiveIndex] || null
          });
        },
getActiveCandidate() {
          if (this.currentActiveIndex >= 0 && this.currentActiveIndex < this.currentCandidates.length) {
            return this.currentCandidates[this.currentActiveIndex];
          }
          return null;
        },
isVisible() {
          return this.panelElement.style.display !== "none" && this.panelElement.classList.contains(SETTINGS.CSS_CLASSES.POPUP_SHOW);
        },
bindPanelEvents() {
          document.addEventListener("candidateSelected", (event) => {
            const { candidate, index } = event.detail;
            this._handleCandidateSelected(candidate, index);
          });
          document.addEventListener("candidateHovered", (event) => {
            const { index } = event.detail;
            this.setActiveIndex(index);
          });
          this.panelElement.addEventListener("click", (event) => {
            event.stopPropagation();
          });
        },
_renderEmptyState() {
          this.contentElement.innerHTML = "";
          this.panelElement.classList.add(SETTINGS.CSS_CLASSES.POPUP_EMPTY);
          const emptyElement = document.createElement("div");
          emptyElement.className = SETTINGS.CSS_CLASSES.EMPTY_MESSAGE;
          emptyElement.textContent = "暂无匹配的弹幕模板";
          this.contentElement.appendChild(emptyElement);
          this.contentElement.style.maxHeight = "60px";
        },
_positionPanel(targetInput) {
          if (!targetInput) return;
          const inputRect = targetInput.getBoundingClientRect();
          const panelRect = this.panelElement.getBoundingClientRect();
          let left = inputRect.left;
          let top = inputRect.bottom + 5;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          if (left + panelRect.width > windowWidth - 20) {
            left = windowWidth - panelRect.width - 20;
          }
          if (left < 20) {
            left = 20;
          }
          if (top + panelRect.height > windowHeight - 20) {
            top = inputRect.top - panelRect.height - 5;
          }
          this.panelElement.style.left = `${left}px`;
          this.panelElement.style.top = `${top}px`;
        },
_updatePanelHeight() {
          const itemCount = this.currentCandidates.length;
          const itemHeight = CandidateItem.getItemHeight();
          const maxHeight = SETTINGS.MAX_POPUP_HEIGHT;
          let height = Math.min(itemCount * itemHeight, maxHeight);
          this.contentElement.style.maxHeight = `${height}px`;
          this.panelElement.classList.remove(SETTINGS.CSS_CLASSES.POPUP_EMPTY);
        },
_handleCandidateSelected(candidate, index) {
          this._emitPanelEvent("candidateSelected", { candidate, index });
        },
_emitPanelEvent(eventName, detail = {}) {
          const event = new CustomEvent(eventName, { detail });
          document.dispatchEvent(event);
        },
destroy() {
          if (this.showTimer) {
            clearTimeout(this.showTimer);
          }
          if (this.hideTimer) {
            clearTimeout(this.hideTimer);
          }
          if (this.panelElement && this.panelElement.parentNode) {
            this.panelElement.parentNode.removeChild(this.panelElement);
          }
          this.panelElement = null;
          this.contentElement = null;
          this.currentCandidates = [];
          this.currentActiveIndex = -1;
        }
      };
      const NativeSetter = {
inputValueDescriptor: null,
        textareaValueDescriptor: null,
init() {
          this.inputValueDescriptor = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
          );
          this.textareaValueDescriptor = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype,
            "value"
          );
          console.log("NativeSetter initialized");
        },
setValue(element, value) {
          if (!element) return false;
          try {
            let descriptor = null;
            if (element.tagName === "INPUT") {
              descriptor = this.inputValueDescriptor;
            } else if (element.tagName === "TEXTAREA") {
              descriptor = this.textareaValueDescriptor;
            }
            if (!descriptor || !descriptor.set) {
              element.value = value;
              return true;
            }
            descriptor.set.call(element, value);
            this.dispatchInputEvent(element);
            return true;
          } catch (error) {
            console.warn("NativeSetter failed, falling back to direct assignment:", error);
            element.value = value;
            this.dispatchInputEvent(element);
            return false;
          }
        },
dispatchInputEvent(element) {
          try {
            const inputEvent = new Event("input", {
              bubbles: true,
              cancelable: true
            });
            element.dispatchEvent(inputEvent);
            const changeEvent = new Event("change", {
              bubbles: true,
              cancelable: true
            });
            element.dispatchEvent(changeEvent);
          } catch (error) {
            console.warn("Failed to dispatch input event:", error);
          }
        },
isFrameworkManaged(element) {
          return element && (element.dataset.frameworkManaged === "true" || element.hasAttribute("v-model") ||
element.hasAttribute("ng-model") ||
element._valueTracker ||
element.__reactInternalFiber ||
element.__reactInternalInstance);
        },
smartSetValue(element, value, options = {}) {
          const {
            forceNative = false,
skipEvents = false
} = options;
          if (!element) return false;
          try {
            if (forceNative || this.isFrameworkManaged(element)) {
              const result = this.setValue(element, value);
              if (!skipEvents && result) {
                this.dispatchAdditionalEvents(element);
              }
              return result;
            } else {
              element.value = value;
              if (!skipEvents) {
                this.dispatchInputEvent(element);
              }
              return true;
            }
          } catch (error) {
            console.error("SmartSetValue failed:", error);
            return false;
          }
        },
dispatchAdditionalEvents(element) {
          try {
            ["keydown", "keyup"].forEach((eventType) => {
              const keyEvent = new KeyboardEvent(eventType, {
                bubbles: true,
                cancelable: true,
                key: "Unidentified"
              });
              element.dispatchEvent(keyEvent);
            });
            if (document.activeElement !== element) {
              const focusEvent = new FocusEvent("focus", {
                bubbles: true,
                cancelable: true
              });
              element.dispatchEvent(focusEvent);
            }
          } catch (error) {
            console.warn("Failed to dispatch additional events:", error);
          }
        },
getValue(element) {
          if (!element) return "";
          try {
            let descriptor = null;
            if (element.tagName === "INPUT") {
              descriptor = this.inputValueDescriptor;
            } else if (element.tagName === "TEXTAREA") {
              descriptor = this.textareaValueDescriptor;
            }
            if (descriptor && descriptor.get) {
              return descriptor.get.call(element) || "";
            }
            return element.value || "";
          } catch (error) {
            console.warn("Failed to get value using native getter:", error);
            return element.value || "";
          }
        }
      };
      const InputInteraction = {
activeInput: null,
inputListeners: new Map(),
init() {
          this.bindGlobalEvents();
          console.log("InputInteraction initialized");
        },
bindInputEvents(inputEl) {
          if (!inputEl || this.inputListeners.has(inputEl)) {
            return;
          }
          const listeners = {
            focus: (event) => this._handleInputFocus(event, inputEl),
            blur: (event) => this._handleInputBlur(event, inputEl),
            input: (event) => this._handleInputChange(event, inputEl),
            keydown: (event) => this._handleInputKeyDown(event, inputEl)
          };
          Object.entries(listeners).forEach(([eventName, listener]) => {
            inputEl.addEventListener(eventName, listener);
          });
          this.inputListeners.set(inputEl, listeners);
        },
unbindInputEvents(inputEl) {
          if (!this.inputListeners.has(inputEl)) return;
          const listeners = this.inputListeners.get(inputEl);
          Object.entries(listeners).forEach(([eventName, listener]) => {
            inputEl.removeEventListener(eventName, listener);
          });
          this.inputListeners.delete(inputEl);
        },
replaceInputWithText(inputEl, text) {
          if (!inputEl) return;
          NativeSetter.setValue(inputEl, text);
          this._setCursorToEnd(inputEl);
          this._triggerInputEvent(inputEl);
        },
getActiveInput() {
          return this.activeInput;
        },
bindGlobalEvents() {
          document.addEventListener("candidateSelected", (event) => {
            const { candidate } = event.detail;
            this._handleCandidateSelected(candidate);
          });
        },
_handleInputFocus(event, inputEl) {
          this.activeInput = inputEl;
          this._emitInputEvent("inputFocused", { inputEl, event });
        },
_handleInputBlur(event, inputEl) {
          setTimeout(() => {
            if (this.activeInput === inputEl) {
              this.activeInput = null;
              this._emitInputEvent("inputBlurred", { inputEl, event });
            }
          }, 200);
        },
_handleInputChange(event, inputEl) {
          this._emitInputEvent("inputChanged", {
            inputEl,
            value: inputEl.value,
            event
          });
        },
_handleInputKeyDown(event, inputEl) {
          this._emitInputEvent("inputKeyDown", {
            inputEl,
            key: event.key,
            event
          });
        },
_handleCandidateSelected(candidate) {
          if (this.activeInput && candidate) {
            const text = candidate.getDisplayText ? candidate.getDisplayText() : candidate.text;
            this.replaceInputWithText(this.activeInput, text);
          }
        },
_emitInputEvent(eventName, detail) {
          const event = new CustomEvent(eventName, { detail });
          document.dispatchEvent(event);
        },
_triggerInputEvent(inputEl) {
          const inputEvent = new Event("input", { bubbles: true });
          inputEl.dispatchEvent(inputEvent);
        },
_setCursorToEnd(inputEl) {
          if (inputEl.setSelectionRange) {
            const len = inputEl.value.length;
            inputEl.setSelectionRange(len, len);
          }
        },
cleanup() {
          for (const inputEl of this.inputListeners.keys()) {
            this.unbindInputEvents(inputEl);
          }
          this.activeInput = null;
        }
      };
      const PanelState = {
        HIDDEN: "hidden",
VISIBLE: "visible"
      };
      const SelectionMode = {
        KEYBOARD: "keyboard",
MOUSE: "mouse"
};
      const CandidatePanelState = {
currentState: PanelState.HIDDEN,
candidates: [],
activeIndex: 0,
selectionMode: SelectionMode.KEYBOARD,
panelElement: null,
targetInput: null,
listeners: new Map(),
getPanelState() {
          return {
            state: this.currentState,
            activeIndex: this.activeIndex,
            candidateCount: this.candidates.length,
            isVisible: this.currentState === PanelState.VISIBLE,
            hasSelection: this.activeIndex >= 0 && this.activeIndex < this.candidates.length
          };
        },
setCandidates(candidates) {
          this.candidates = candidates || [];
          this.activeIndex = this.candidates.length > 0 ? 0 : -1;
        },
navigateLeft() {
          if (this.candidates.length === 0) return;
          this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : this.candidates.length - 1;
          this.selectionMode = SelectionMode.KEYBOARD;
          this._updateActiveItem();
          this._emitNavigationEvent("left");
        },
navigateRight() {
          if (this.candidates.length === 0) return;
          this.activeIndex = this.activeIndex < this.candidates.length - 1 ? this.activeIndex + 1 : 0;
          this.selectionMode = SelectionMode.KEYBOARD;
          this._updateActiveItem();
          this._emitNavigationEvent("right");
        },
navigateUp() {
          this.navigateLeft();
          this._emitNavigationEvent("up");
        },
navigateDown() {
          this.navigateRight();
          this._emitNavigationEvent("down");
        },
selectActiveCandidate() {
          if (this.activeIndex >= 0 && this.activeIndex < this.candidates.length) {
            const selected = this.candidates[this.activeIndex];
            if (selected && typeof selected.updateUsage === "function") {
              selected.updateUsage();
            }
            return selected;
          }
          return null;
        },
setActiveByMouse(index) {
          if (index >= 0 && index < this.candidates.length) {
            this.activeIndex = index;
            this.selectionMode = SelectionMode.MOUSE;
            this._updateActiveItem();
          }
        },
resetSelection() {
          this.activeIndex = this.candidates.length > 0 ? 0 : -1;
          this.selectionMode = SelectionMode.KEYBOARD;
          this._updateActiveItem();
        },
setState(newState) {
          const oldState = this.currentState;
          this.currentState = newState;
          this._onStateChange(oldState, newState);
        },
setPanelElement(element) {
          this.panelElement = element;
        },
setTargetInput(input) {
          this.targetInput = input;
        },
addEventListener(event, callback) {
          if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
          }
          this.listeners.get(event).push(callback);
        },
removeEventListener(event, callback) {
          if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
              callbacks.splice(index, 1);
            }
          }
        },
_emit(event, data) {
          if (this.listeners.has(event)) {
            this.listeners.get(event).forEach((callback) => {
              try {
                callback(data);
              } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
              }
            });
          }
        },
_updateActiveItem() {
          this._emit("activeIndexChanged", {
            activeIndex: this.activeIndex,
            selectionMode: this.selectionMode,
            candidate: this.candidates[this.activeIndex] || null
          });
        },
_onStateChange(oldState, newState) {
          this._emit("stateChanged", {
            oldState,
            newState,
            panelState: this.getPanelState()
          });
        },
_emitNavigationEvent(direction) {
          this._emit("navigation", {
            direction,
            activeIndex: this.activeIndex,
            candidate: this.candidates[this.activeIndex] || null
          });
        }
      };
      const CapsulePreview = {
previewElement: null,
currentCapsule: null,
showTimer: null,
        hideTimer: null,
currentTriggerSource: null,
isInSelectionMode: false,
initialized: false,
enterSelectionMode() {
          this.isInSelectionMode = true;
          Utils.log("预览框进入选择模式，将持续显示");
        },
exitSelectionMode() {
          this.isInSelectionMode = false;
          this.hidePreview(0, "keyboard");
          Utils.log("预览框退出选择模式");
        },
updateSelectionModePreview(capsule, text) {
          if (!this.isInSelectionMode || !capsule || !text) return;
          if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
          }
          if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
          }
          this.currentCapsule = capsule;
          this.currentTriggerSource = "keyboard";
          this.previewElement.textContent = text;
          this.previewElement.classList.add("active");
          this.positionPreview(capsule);
          if (this.previewElement.style.display !== "block") {
            this.previewElement.style.display = "block";
            requestAnimationFrame(() => {
              this.previewElement.classList.add("show");
            });
          }
          Utils.log(`选择模式预览已更新: ${text.substring(0, 20)}...`);
        },
init() {
          if (this.initialized) return;
          this.createPreviewElement();
          this.bindGlobalEvents();
          this.initialized = true;
          Utils.log("胶囊悬浮框预览组件已初始化");
        },
createPreviewElement() {
          this.previewElement = document.createElement("div");
          this.previewElement.className = "ddp-capsule-preview";
          this.previewElement.style.display = "none";
          document.body.appendChild(this.previewElement);
          Utils.log("预览框 DOM 元素已创建");
        },
showPreview(capsule, text, isActive = false, triggerSource = "mouse") {
          Utils.log(`调用 showPreview: 触发源=${triggerSource}, 文本=${text}`);
          if (!this.initialized || !text || text.length <= 15) {
            return;
          }
          if (this.currentTriggerSource === "keyboard" && triggerSource === "mouse") {
            Utils.log("键盘预览活跃中，忽略鼠标悬停事件");
            return;
          }
          if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
          }
          const config = SETTINGS.capsule.preview;
          const delay = triggerSource === "keyboard" ? 0 : config.showDelay;
          Utils.log(`显示预览框: 触发源=${triggerSource}, 文本=${text.substring(0, 20)}...`);
          this.showTimer = setTimeout(() => {
            this.currentCapsule = capsule;
            this.currentTriggerSource = triggerSource;
            this.previewElement.textContent = text;
            if (isActive || triggerSource === "keyboard") {
              this.previewElement.classList.add("active");
            } else {
              this.previewElement.classList.remove("active");
            }
            this.positionPreview(capsule);
            this.previewElement.style.display = "block";
            requestAnimationFrame(() => {
              this.previewElement.classList.add("show");
            });
            Utils.log(`悬浮框预览已显示 (${triggerSource}): ${text.substring(0, 20)}...`);
          }, delay);
        },
hidePreview(delay = null, triggerSource = "mouse") {
          if (!this.initialized) return;
          if (this.currentTriggerSource === "keyboard" && triggerSource === "mouse") {
            Utils.log("键盘预览活跃中，忽略鼠标离开事件");
            return;
          }
          if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
          }
          const config = SETTINGS.capsule.preview;
          const hideDelay = delay !== null ? delay : config.hideDelay;
          this.hideTimer = setTimeout(() => {
            this.previewElement.classList.remove("show");
            setTimeout(() => {
              this.previewElement.style.display = "none";
              this.previewElement.classList.remove("active");
              this.previewElement.classList.remove("show-below");
              this.currentCapsule = null;
              this.currentTriggerSource = null;
            }, config.animationDuration);
          }, hideDelay);
        },
positionPreview(capsule) {
          const capsuleRect = capsule.getBoundingClientRect();
          Utils.log(`=== 预览框定位(强制上方) ===`);
          Utils.log(`胶囊位置: top=${capsuleRect.top}px, left=${capsuleRect.left}px, width=${capsuleRect.width}px`);
          this.previewElement.style.visibility = "hidden";
          this.previewElement.style.display = "block";
          const previewRect = this.previewElement.getBoundingClientRect();
          const previewWidth = previewRect.width || 300;
          const previewHeight = previewRect.height || 40;
          this.previewElement.style.visibility = "";
          Utils.log(`预览框尺寸: width=${previewWidth}px, height=${previewHeight}px`);
          let left = capsuleRect.left + capsuleRect.width / 2 - previewWidth / 2;
          const verticalGap = 8;
          let top = capsuleRect.top - previewHeight - verticalGap;
          Utils.log(`强制上方显示: top=${top}px (胶囊顶部${capsuleRect.top} - 预览框高度${previewHeight} - 间距${verticalGap})`);
          const windowWidth = window.innerWidth;
          const horizontalPadding = 10;
          if (left < horizontalPadding) {
            left = horizontalPadding;
          } else if (left + previewWidth > windowWidth - horizontalPadding) {
            left = windowWidth - previewWidth - horizontalPadding;
          }
          this.previewElement.classList.remove("show-below");
          this.previewElement.style.left = `${left}px`;
          this.previewElement.style.top = `${top}px`;
          Utils.log(`最终位置: left=${left}px, top=${top}px, 显示位置: 上方`);
          Utils.log(`=== 预览框定位完成 ===`);
        },
updateActiveState(isActive) {
          if (!this.initialized || !this.currentCapsule) return;
          if (isActive) {
            this.previewElement.classList.add("active");
          } else {
            this.previewElement.classList.remove("active");
          }
        },
bindGlobalEvents() {
          document.addEventListener("scroll", () => {
            this.hidePreview(0);
          }, true);
          window.addEventListener("resize", () => {
            if (this.currentCapsule) {
              this.positionPreview(this.currentCapsule);
            }
          });
        },
bindCapsuleEvents(capsule, text) {
          if (!capsule || !text) return;
          Utils.log(`绑定预览事件: ${text}`);
          capsule.addEventListener("mouseenter", () => {
            this.showPreview(capsule, text, false, "mouse");
          });
          capsule.addEventListener("mouseleave", () => {
            this.hidePreview(null, "mouse");
          });
        },
destroy() {
          if (!this.initialized) return;
          if (this.showTimer) {
            clearTimeout(this.showTimer);
          }
          if (this.hideTimer) {
            clearTimeout(this.hideTimer);
          }
          if (this.previewElement && this.previewElement.parentNode) {
            this.previewElement.parentNode.removeChild(this.previewElement);
          }
          this.previewElement = null;
          this.currentCapsule = null;
          this.currentTriggerSource = null;
          this.isInSelectionMode = false;
          this.initialized = false;
          Utils.log("胶囊悬浮框预览组件已销毁");
        }
      };
      const UIManager = {
initialized: false,
currentState: "idle",
currentTargetInput: null,
currentSuggestions: [],
activeIndex: 0,
isSelectionModeActive: false,
async init() {
          if (this.initialized) {
            return true;
          }
          try {
            CandidatePanel.init();
            InputInteraction.init();
            CapsulePreview.init();
            this.bindComponentEvents();
            this.initialized = true;
            Utils.log("UI管理器初始化成功");
            return true;
          } catch (error) {
            Utils.log(`UI管理器初始化失败: ${error.message}`, "error");
            return false;
          }
        },
showPopup(suggestions, targetInput) {
          if (!this.initialized) {
            Utils.log("UIManager未初始化", "warn");
            return;
          }
          this.currentSuggestions = suggestions || [];
          this.currentTargetInput = targetInput;
          this.activeIndex = -1;
          if (this.currentSuggestions.length === 0) {
            this.hidePopup();
            return;
          }
          this.currentState = "showing";
          CandidatePanelState.setCandidates(this.currentSuggestions);
          CandidatePanelState.setTargetInput(targetInput);
          CandidatePanelState.resetSelection();
          const isChatInput = targetInput && targetInput.closest(".ChatSend");
          if (isChatInput) {
            this.showChatCandidateList(this.currentSuggestions, targetInput);
          } else {
            CandidatePanel.renderCandidatePanel(this.currentSuggestions, this.activeIndex);
            CandidatePanel.showPanel(targetInput);
          }
          if (targetInput) {
            InputInteraction.bindInputEvents(targetInput);
          }
          setTimeout(() => {
            if (this.currentState === "showing") {
              this.currentState = "selecting";
            }
          }, 100);
          Utils.log(`弹窗已显示，包含 ${this.currentSuggestions.length} 个候选项`);
        },
showChatCandidateList(suggestions, targetInput, multiRow = false) {
          const capsuleConfig = SETTINGS.capsule;
          document.documentElement.style.setProperty("--ddp-capsule-item-height", `${capsuleConfig.height}px`);
          document.documentElement.style.setProperty("--ddp-capsule-padding", "8px");
          document.documentElement.style.setProperty("--ddp-capsule-margin", "8px");
          document.documentElement.style.setProperty("--ddp-capsule-item-padding", "3px");
          Utils.log(`CSS变量已设置 (margin会计入高度):`);
          Utils.log(`--ddp-capsule-item-height: 24px (胶囊高度)`);
          Utils.log(`--ddp-capsule-padding: 8px (容器padding，计入高度)`);
          Utils.log(`--ddp-capsule-margin: 8px (容器margin，计入高度)`);
          Utils.log(`--ddp-capsule-item-padding: 3px (胶囊内padding)`);
          Utils.log(`预期测量高度: 24px + 3*2 + 8*2 + 8*2 = 62px (margin计入高度)`);
          const chat = document.querySelector(".layout-Player-chat .Chat");
          if (!chat) {
            Utils.log("未找到 Chat 容器，回退到普通弹窗模式");
            CandidatePanel.renderCandidatePanel(suggestions, this.activeIndex);
            CandidatePanel.showPanel(targetInput);
            return;
          }
          chat.style.paddingBottom = "";
          this.applyChatLayoutFix();
          const existingList = document.querySelector(".ddp-candidate-capsules");
          if (existingList) {
            if (existingList._dynamicStyle) {
              existingList._dynamicStyle.remove();
            }
            existingList.remove();
          }
          const candidateList = document.createElement("div");
          candidateList.className = `ddp-candidate-capsules ${multiRow ? "multi-row" : ""}`;
          const maxItems = multiRow ? suggestions.length : (
Math.min(suggestions.length, SETTINGS?.capsule?.singleRowMaxItems || 8)
          );
          const displaySuggestions = suggestions.slice(0, maxItems);
          displaySuggestions.forEach((suggestion, index) => {
            const capsule = document.createElement("div");
            capsule.className = `ddp-candidate-capsule ${index === this.activeIndex ? "active" : ""}`;
            capsule.dataset.index = index;
            const text = suggestion.getDisplayText ? suggestion.getDisplayText() : suggestion.text;
            capsule.textContent = text;
            this.bindCapsulePreviewEvents(capsule, suggestion, text);
            capsule.addEventListener("click", () => {
              this.selectCandidate(suggestion);
            });
            candidateList.appendChild(capsule);
          });
          const chatSpeak = chat.querySelector(".ChatSpeak");
          if (chatSpeak) {
            chatSpeak.parentNode.insertBefore(candidateList, chatSpeak);
          } else {
            chat.appendChild(candidateList);
          }
          this.updateChatLayoutForCandidates(candidateList);
          this.currentCandidateMode = multiRow ? "multi-row" : "single-row";
          Utils.log(`胶囊候选列表已显示 (${this.currentCandidateMode})，包含 ${displaySuggestions.length}/${suggestions.length} 个候选项，布局已调整`);
          Utils.log(`DOM结构: Chat > [ChatToolBar, ddp-candidate-capsules, ChatSpeak]`);
        },
hidePopup() {
          if (!this.initialized) return;
          console.log("=== HIDEOPOPUP 被调用 ===");
          console.log(`当前状态: ${this.currentState}`);
          console.log("完整调用栈:");
          console.trace("hidePopup调用追踪");
          Utils.log(`隐藏弹窗，当前状态: ${this.currentState}`);
          CapsulePreview.hidePreview(0, "keyboard");
          CapsulePreview.hidePreview(0, "mouse");
          CandidatePanel.hidePanel();
          const existingList = document.querySelector(".ddp-candidate-capsules");
          if (existingList) {
            if (existingList._dynamicStyle) {
              existingList._dynamicStyle.remove();
            }
            existingList.remove();
          }
          this.removeChatLayoutFix();
          this.currentSuggestions = [];
          this.currentTargetInput = null;
          this.activeIndex = -1;
          this.currentState = "idle";
          this.currentCandidateMode = null;
          Utils.log("弹窗已隐藏，布局已恢复");
        },
applyChatLayoutFix() {
          Utils.log("=== 应用CSS布局修复 ===");
          const chatArea = document.querySelector(".layout-Player-chat");
          if (!chatArea) {
            Utils.log("未找到聊天区域，跳过布局修复");
            return;
          }
          chatArea.classList.add("ddp-candidates-visible");
          Utils.log("已添加 ddp-candidates-visible 类，CSS样式将控制布局");
          Utils.log("=== CSS布局修复完成 ===");
        },
updateChatLayoutForCandidates(candidateList) {
          const chat = document.querySelector(".layout-Player-chat .Chat");
          if (!chat || !candidateList) {
            Utils.log("缺少必要元素，跳过padding更新");
            return;
          }
          chat.style.paddingBottom = "";
          const beforeHeight = chat.getBoundingClientRect().height;
          const currentPadding = getComputedStyle(chat).paddingBottom;
          const initialPaddingValue = parseFloat(currentPadding) || 0;
          Utils.log(`=== 更新候选框布局开始 ===`);
          Utils.log(`Chat当前高度: ${beforeHeight}px`);
          Utils.log(`Chat初始paddingBottom: ${initialPaddingValue}px (必须保留)`);
          const configuredHeight = SETTINGS.capsule.totalHeight;
          const marginTop = parseFloat(getComputedStyle(candidateList).marginTop) || 0;
          const marginBottom = parseFloat(getComputedStyle(candidateList).marginBottom) || 0;
          const totalMargin = marginTop + marginBottom;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const actualHeight = Math.round(candidateList.getBoundingClientRect().height);
              const candidateHeightWithMargin = actualHeight + totalMargin;
              const heightDifference = Math.abs(candidateHeightWithMargin - configuredHeight);
              const candidateHeight = heightDifference <= 2 ? configuredHeight : candidateHeightWithMargin;
              const finalPadding = initialPaddingValue + candidateHeight;
              document.documentElement.style.setProperty("--ddp-candidate-height", `${candidateHeight}px`);
              chat.style.paddingBottom = `${finalPadding}px`;
              const afterHeight = chat.getBoundingClientRect().height;
              const actualPaddingBottom = getComputedStyle(chat).paddingBottom;
              const heightIncrease = afterHeight - beforeHeight;
              Utils.log(`候选项所需高度(含margin): ${candidateHeight}px`);
              Utils.log(`最终设置padding: ${finalPadding}px (初始${initialPaddingValue}px + 候选项${candidateHeight}px)`);
              Utils.log(`transform向上移动距离: ${candidateHeight}px`);
              Utils.log(`实际应用padding: ${actualPaddingBottom}`);
              Utils.log(`Chat更新后高度: ${afterHeight}px`);
              Utils.log(`实际高度增加: ${heightIncrease}px (应约等于${candidateHeight}px)`);
              Utils.log(`=== 候选框布局更新完成 ===`);
            });
          });
        },
removeChatLayoutFix() {
          Utils.log("=== 移除CSS布局修复 ===");
          const chatArea = document.querySelector(".layout-Player-chat");
          const chat = chatArea ? chatArea.querySelector(".Chat") : null;
          if (!chatArea) {
            Utils.log("未找到聊天区域，跳过布局恢复");
            return;
          }
          chatArea.classList.remove("ddp-candidates-visible");
          document.documentElement.style.removeProperty("--ddp-candidate-height");
          document.documentElement.style.removeProperty("--ddp-capsule-item-height");
          document.documentElement.style.removeProperty("--ddp-capsule-padding");
          document.documentElement.style.removeProperty("--ddp-capsule-margin");
          document.documentElement.style.removeProperty("--ddp-capsule-total-height");
          document.documentElement.style.removeProperty("--ddp-capsule-item-padding");
          if (chat) {
            chat.style.paddingBottom = "";
          }
          Utils.log("已移除 ddp-candidates-visible 类，清理所有CSS变量和padding，布局已恢复");
          Utils.log("=== CSS布局恢复完成 ===");
        },
setActiveIndex(index) {
          if (!this.initialized || index < 0 || index >= this.currentSuggestions.length) {
            return;
          }
          const oldIndex = this.activeIndex;
          this.activeIndex = index;
          const isChatInput = this.currentTargetInput && this.currentTargetInput.closest(".ChatSend");
          if (isChatInput) {
            this.updateChatCandidateStyles(oldIndex, index);
          } else {
            CandidatePanel.setActiveIndex(index);
            CandidatePanelState.setActiveByMouse(index);
          }
        },
updateChatCandidateStyles(oldIndex, newIndex) {
          const candidateList = document.querySelector(".ddp-candidate-capsules");
          if (!candidateList) return;
          Utils.log(`=== 更新胶囊样式 ===`);
          Utils.log(`从索引 ${oldIndex} 切换到索引 ${newIndex}`);
          if (oldIndex >= 0) {
            const oldCapsule = candidateList.querySelector(`[data-index="${oldIndex}"]`);
            if (oldCapsule) {
              oldCapsule.classList.remove("active");
              Utils.log(`已移除旧胶囊 ${oldIndex} 的活跃状态`);
            }
          }
          const newCapsule = candidateList.querySelector(`[data-index="${newIndex}"]`);
          if (newCapsule) {
            newCapsule.classList.add("active");
            Utils.log(`已设置新胶囊 ${newIndex} 为活跃状态`);
            if (!candidateList.classList.contains("multi-row")) {
              this.scrollCapsuleIntoView(candidateList, newCapsule);
              setTimeout(() => {
                this.showPreviewForCapsule(newCapsule, newIndex);
              }, 400);
            } else {
              newCapsule.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
              });
              setTimeout(() => {
                this.showPreviewForCapsule(newCapsule, newIndex);
              }, 150);
            }
          } else {
            Utils.log(`未找到索引为 ${newIndex} 的胶囊元素，隐藏预览框`);
            CapsulePreview.hidePreview(0, "keyboard");
          }
          Utils.log(`=== 胶囊样式更新完成 ===`);
        },
scrollCapsuleIntoView(candidateList, capsule) {
          if (!candidateList || !capsule) {
            Utils.log("scrollCapsuleIntoView: 缺少必要元素");
            return;
          }
          try {
            const scrollLeft = candidateList.scrollLeft;
            const capsuleRelativeLeft = capsule.offsetLeft;
            const capsuleWidth = capsule.offsetWidth;
            const listWidth = candidateList.offsetWidth;
            const capsuleIndex = parseInt(capsule.dataset.index) || 0;
            Utils.log(`滚动检查: 胶囊索引=${capsuleIndex}, 位置=${capsuleRelativeLeft}px, 宽度=${capsuleWidth}px, 容器宽度=${listWidth}px, 当前滚动=${scrollLeft}px`);
            const isCircularNavigation = capsuleIndex === 0 && scrollLeft > listWidth || capsuleIndex === this.currentSuggestions.length - 1 && scrollLeft === 0;
            const scrollBehavior = isCircularNavigation ? "instant" : "smooth";
            Utils.log(`循环导航检测: ${isCircularNavigation}, 滚动行为: ${scrollBehavior}`);
            if (capsuleRelativeLeft + capsuleWidth > scrollLeft + listWidth) {
              const newScrollLeft = capsuleRelativeLeft + capsuleWidth - listWidth + 20;
              Utils.log(`向右滚动到: ${newScrollLeft}px`);
              candidateList.scrollTo({
                left: newScrollLeft,
                behavior: scrollBehavior
              });
            } else if (capsuleRelativeLeft < scrollLeft) {
              const newScrollLeft = Math.max(0, capsuleRelativeLeft - 20);
              Utils.log(`向左滚动到: ${newScrollLeft}px`);
              candidateList.scrollTo({
                left: newScrollLeft,
                behavior: scrollBehavior
              });
            } else {
              Utils.log("胶囊已在可见区域，无需滚动");
            }
          } catch (error) {
            Utils.log(`滚动出错: ${error.message}`, "error");
            console.error("scrollCapsuleIntoView error:", error);
          }
        },
bindCapsulePreviewEvents(capsule, suggestion, text) {
          capsule.removeAttribute("title");
          Object.defineProperty(capsule, "title", {
            set: function() {
              Utils.log("阻止设置title属性，避免双重预览");
            },
            get: function() {
              return "";
            },
            configurable: true
          });
          CapsulePreview.bindCapsuleEvents(capsule, text);
        },
showPreviewForCapsule(capsule, index) {
          if (!capsule || index < 0 || index >= this.currentSuggestions.length) {
            Utils.log(`无法为胶囊显示预览: 胶囊=${!!capsule}, 索引=${index}, 总数=${this.currentSuggestions.length}`);
            return;
          }
          const candidate = this.currentSuggestions[index];
          const text = candidate ? candidate.getDisplayText ? candidate.getDisplayText() : candidate.text : capsule.textContent;
          Utils.log(`胶囊文本: "${text}", 长度: ${text ? text.length : 0}`);
          const capsuleRect = capsule.getBoundingClientRect();
          Utils.log(`滚动后胶囊位置: left=${capsuleRect.left}px, top=${capsuleRect.top}px, 可见=${capsuleRect.left >= 0 && capsuleRect.left < window.innerWidth}`);
          if (text && text.length > 8) {
            Utils.log(`键盘选中胶囊，显示预览: ${text.substring(0, 20)}...`);
            CapsulePreview.showPreview(capsule, text, true, "keyboard");
          } else {
            Utils.log(`文本过短或不存在，隐藏预览框`);
            CapsulePreview.hidePreview(0, "keyboard");
          }
        },
navigateUp() {
          if (!this.initialized || this.currentSuggestions.length === 0) return;
          const isChatInput = this.currentTargetInput && this.currentTargetInput.closest(".ChatSend");
          if (isChatInput) {
            this.navigateLeft();
          } else {
            if (!this.isSelectionModeActive) {
              this.setSelectionModeActive(true);
            }
            CandidatePanelState.navigateUp();
            const newIndex = CandidatePanelState.activeIndex;
            this.setActiveIndex(newIndex);
          }
        },
navigateDown() {
          if (!this.initialized || this.currentSuggestions.length === 0) return;
          const isChatInput = this.currentTargetInput && this.currentTargetInput.closest(".ChatSend");
          if (isChatInput) {
            this.navigateRight();
          } else {
            if (!this.isSelectionModeActive) {
              this.setSelectionModeActive(true);
            }
            CandidatePanelState.navigateDown();
            const newIndex = CandidatePanelState.activeIndex;
            this.setActiveIndex(newIndex);
          }
        },
navigateLeft() {
          if (!this.initialized || this.currentSuggestions.length === 0) return;
          if (!this.isSelectionModeActive) {
            this.setSelectionModeActive(true);
          }
          let newIndex = this.activeIndex - 1;
          if (newIndex < 0) {
            newIndex = this.currentSuggestions.length - 1;
          }
          this.setActiveIndex(newIndex);
        },
navigateRight() {
          if (!this.initialized || this.currentSuggestions.length === 0) return;
          if (!this.isSelectionModeActive) {
            this.setSelectionModeActive(true);
          }
          let newIndex = this.activeIndex + 1;
          if (newIndex >= this.currentSuggestions.length) {
            newIndex = 0;
          }
          this.setActiveIndex(newIndex);
        },
selectActiveCandidate() {
          if (!this.initialized || this.activeIndex < 0 || this.activeIndex >= this.currentSuggestions.length) {
            return;
          }
          const selectedCandidate = this.currentSuggestions[this.activeIndex];
          this.selectCandidate(selectedCandidate);
        },
selectCandidate(candidate) {
          if (!candidate || !this.currentTargetInput) return;
          const text = candidate.getDisplayText ? candidate.getDisplayText() : candidate.text;
          if (typeof candidate.updateUsage === "function") {
            candidate.updateUsage();
          }
          InputInteraction.replaceInputWithText(this.currentTargetInput, text);
          this.hidePopup();
          this.currentState = "idle";
          Utils.log(`候选项已选择并填入输入框: ${text}`);
        },
isPopupVisible() {
          const chatCandidateList = document.querySelector(".ddp-candidate-capsules");
          if (chatCandidateList && chatCandidateList.style.display !== "none") {
            return true;
          }
          return this.initialized && CandidatePanel.isVisible();
        },
clearActiveIndex() {
          this.activeIndex = -1;
          if (this.isSelectionModeActive) {
            this.setSelectionModeActive(false);
          }
          const chatCandidateList = document.querySelector(".ddp-candidate-capsules");
          if (chatCandidateList) {
            const capsules = chatCandidateList.querySelectorAll(".ddp-candidate-capsule");
            capsules.forEach((capsule) => {
              capsule.classList.remove("active");
            });
          }
          if (CandidatePanel.panelElement) {
            const items = CandidatePanel.panelElement.querySelectorAll(".dda-popup-item");
            items.forEach((item) => {
              item.classList.remove("dda-popup-item-active");
            });
          }
        },
setSelectionModeActive(active) {
          this.isSelectionModeActive = active;
          if (active) {
            CapsulePreview.enterSelectionMode();
            if (this.activeIndex === -1 && this.currentSuggestions.length > 0) {
              this.setActiveIndex(0);
            }
          } else {
            CapsulePreview.exitSelectionMode();
            this.clearActiveIndex();
          }
          const chatCandidateList = document.querySelector(".ddp-candidate-capsules");
          if (chatCandidateList) {
            if (active) {
              chatCandidateList.classList.add("selection-mode-active");
            } else {
              chatCandidateList.classList.remove("selection-mode-active");
            }
          }
          if (CandidatePanel.panelElement) {
            if (active) {
              CandidatePanel.panelElement.classList.add("selection-mode-active");
            } else {
              CandidatePanel.panelElement.classList.remove("selection-mode-active");
            }
          }
          Utils.log(`选择模式: ${active ? "激活" : "关闭"}`);
        },
updateCandidates(suggestions) {
          this.currentSuggestions = suggestions;
          if (this.currentTargetInput) {
            const isChatInput = this.currentTargetInput.closest(".ChatSend");
            if (isChatInput) {
              this.showChatCandidateList(suggestions, this.currentTargetInput);
            } else {
              CandidatePanel.renderCandidatePanel(suggestions, this.activeIndex);
            }
          }
        },
getCurrentState() {
          return this.currentState;
        },
bindComponentEvents() {
          document.addEventListener("blur", (event) => {
            if (event.target && event.target.matches && event.target.matches("input, textarea")) {
              console.log("🔍 全局检测到输入框失焦:", event.target.className, "value:", event.target.value);
            }
          }, true);
          const originalDispatchEvent = document.dispatchEvent;
          document.dispatchEvent = function(event) {
            if (event.type.includes("input") || event.type.includes("blur") || event.type.includes("focus")) {
              console.log("🎯 自定义事件被触发:", event.type, event.detail);
            }
            return originalDispatchEvent.call(this, event);
          };
          document.addEventListener("candidateSelected", (event) => {
            const { candidate } = event.detail;
            this.selectCandidate(candidate);
          });
          document.addEventListener("candidateHovered", (event) => {
            const { index } = event.detail;
            this.setActiveIndex(index);
          });
          document.addEventListener("inputFocused", (event) => {
            const { inputEl } = event.detail;
            this.currentTargetInput = inputEl;
          });
          document.addEventListener("inputBlurred", () => {
            Utils.log("=== 输入框失焦事件触发（已完全禁用隐藏逻辑） ===");
            return;
          });
          document.addEventListener("panelShown", () => {
            this.currentState = "selecting";
          });
          document.addEventListener("panelHidden", () => {
            this.currentState = "idle";
          });
        },
destroy() {
          if (!this.initialized) return;
          CandidatePanel.destroy();
          InputInteraction.cleanup();
          CapsulePreview.destroy();
          this.initialized = false;
          this.currentState = "idle";
          this.currentTargetInput = null;
          this.currentSuggestions = [];
          this.activeIndex = 0;
          Utils.log("UI管理器已销毁");
        },
calculateCandidateListHeight(suggestions) {
          const baseHeight = 12;
          const capsuleHeight = 32;
          const maxCapsulesPerRow = Math.floor(window.innerWidth * 0.6 / 120);
          const rows = Math.ceil(suggestions.length / maxCapsulesPerRow);
          const calculatedHeight = baseHeight + rows * capsuleHeight;
          Utils.log(`计算候选列表高度:`);
          Utils.log(`- 建议数量: ${suggestions.length}`);
          Utils.log(`- 窗口宽度: ${window.innerWidth}px`);
          Utils.log(`- 每行最大胶囊数: ${maxCapsulesPerRow}`);
          Utils.log(`- 计算行数: ${rows}`);
          Utils.log(`- 基础高度: ${baseHeight}px`);
          Utils.log(`- 胶囊高度: ${capsuleHeight}px`);
          Utils.log(`- 计算总高度: ${calculatedHeight}px`);
          return calculatedHeight;
        }
      };
      const INPUT_TYPES = {
        MAIN_CHAT: "main_chat",
FULLSCREEN_FLOAT: "fullscreen",
UNKNOWN: "unknown"
};
      const InputDetector = {
mutationObserver: null,
detectedInputs: new WeakSet(),
onInputDetected: null,
        onInputRemoved: null,
init(callbacks = {}) {
          this.onInputDetected = callbacks.onInputDetected || (() => {
          });
          this.onInputRemoved = callbacks.onInputRemoved || (() => {
          });
          this.detectExistingInputs();
          this.startMutationObserver();
          console.log("InputDetector initialized");
        },
detectExistingInputs() {
          this.detectMainChatInput();
          this.detectFullscreenInput();
        },
detectMainChatInput() {
          const checkMainInput = () => {
            const mainInput = document.querySelector(".ChatSend-txt");
            if (mainInput && !this.detectedInputs.has(mainInput)) {
              this.handleInputDetected(mainInput, INPUT_TYPES.MAIN_CHAT);
              return true;
            }
            return false;
          };
          if (!checkMainInput()) {
            let attempts = 0;
            const maxAttempts = 50;
            const pollInterval = setInterval(() => {
              attempts++;
              if (checkMainInput() || attempts >= maxAttempts) {
                clearInterval(pollInterval);
              }
            }, 200);
          }
        },
detectFullscreenInput() {
          const fullscreenInput = document.querySelector(".inputView-2a65aa");
          if (fullscreenInput && !this.detectedInputs.has(fullscreenInput)) {
            this.handleInputDetected(fullscreenInput, INPUT_TYPES.FULLSCREEN_FLOAT);
          }
        },
startMutationObserver() {
          if (this.mutationObserver) {
            this.mutationObserver.disconnect();
          }
          this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  this.checkNodeForInputs(node, true);
                }
              });
              mutation.removedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  this.checkNodeForInputs(node, false);
                }
              });
            });
          });
          const playerContainer = document.querySelector("#js-player-video-case") || document.body;
          this.mutationObserver.observe(playerContainer, {
            childList: true,
            subtree: true
          });
        },
checkNodeForInputs(node, isAdded) {
          const inputType = this.getInputType(node);
          if (inputType !== INPUT_TYPES.UNKNOWN) {
            if (isAdded) {
              this.handleInputDetected(node, inputType);
            } else {
              this.handleInputRemoved(node, inputType);
            }
            return;
          }
          const selectors = [
            ".ChatSend-txt",
".inputView-2a65aa"
];
          selectors.forEach((selector) => {
            const inputs = node.querySelectorAll(selector);
            inputs.forEach((input) => {
              const type = this.getInputType(input);
              if (type !== INPUT_TYPES.UNKNOWN) {
                if (isAdded) {
                  this.handleInputDetected(input, type);
                } else {
                  this.handleInputRemoved(input, type);
                }
              }
            });
          });
        },
handleInputDetected(input, type) {
          if (this.detectedInputs.has(input)) return;
          this.detectedInputs.add(input);
          console.log(`Detected ${type} input:`, input);
          this.setupInputSpecialHandling(input, type);
          this.onInputDetected(input, type);
        },
handleInputRemoved(input, type) {
          if (!this.detectedInputs.has(input)) return;
          this.detectedInputs.delete(input);
          console.log(`Removed ${type} input:`, input);
          this.onInputRemoved(input, type);
        },
setupInputSpecialHandling(input, type) {
          switch (type) {
            case INPUT_TYPES.MAIN_CHAT:
              this.setupMainChatInput(input);
              break;
            case INPUT_TYPES.FULLSCREEN_FLOAT:
              this.setupFullscreenInput(input);
              break;
          }
        },
setupMainChatInput(input) {
          let hasSetupFocusHandler = false;
          const setupFocusHandler = () => {
            if (hasSetupFocusHandler) return;
            hasSetupFocusHandler = true;
            input.addEventListener("focus", () => {
              console.log("Main chat input focused");
              input.dataset.frameworkManaged = "true";
            }, { once: true });
          };
          if (document.readyState === "complete") {
            setupFocusHandler();
          } else {
            document.addEventListener("DOMContentLoaded", setupFocusHandler);
          }
        },
setupFullscreenInput(input) {
          console.log("Fullscreen input detected and ready");
          input.dataset.frameworkManaged = "true";
          input.dataset.dynamicCreated = "true";
        },
getInputType(element) {
          if (!element || element.tagName !== "INPUT" && element.tagName !== "TEXTAREA") {
            return INPUT_TYPES.UNKNOWN;
          }
          if (element.classList.contains("ChatSend-txt")) {
            return INPUT_TYPES.MAIN_CHAT;
          }
          return INPUT_TYPES.UNKNOWN;
        },
isChatInput(element) {
          return this.getInputType(element) !== INPUT_TYPES.UNKNOWN;
        },
getSendButton(input) {
          const type = this.getInputType(input);
          switch (type) {
            case INPUT_TYPES.MAIN_CHAT: {
              const chatSend = input.closest(".ChatSend");
              return chatSend ? chatSend.querySelector(".ChatSend-button") : null;
            }
            case INPUT_TYPES.FULLSCREEN_FLOAT: {
              const fullscreenSendor = input.closest('[class*="fullScreenSendor-"]');
              return fullscreenSendor ? fullscreenSendor.querySelector('.sendDanmu-592760, [class*="sendDanmu-"]') : null;
            }
            default:
              return null;
          }
        },
destroy() {
          if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
          }
          this.detectedInputs = new WeakSet();
          this.onInputDetected = null;
          this.onInputRemoved = null;
          console.log("InputDetector destroyed");
        }
      };
      const APP_STATES = {
        IDLE: "idle",
TYPING: "typing",
SELECTING: "selecting"
};
      const InputManager = {
currentState: APP_STATES.IDLE,
currentInput: null,
currentSuggestions: [],
activeIndex: -1,
isInSelectionMode: false,
debounceTimer: null,
processedInputs: new WeakSet(),
async init() {
          NativeSetter.init();
          await UIManager.init();
          InputDetector.init({
            onInputDetected: this.handleInputDetected.bind(this),
            onInputRemoved: this.handleInputRemoved.bind(this)
          });
          this.bindInputEvents();
          console.log("InputManager initialized");
        },
bindInputEvents() {
          document.addEventListener("focusin", this.handleFocusIn.bind(this));
          document.addEventListener("focusout", this.handleFocusOut.bind(this));
          document.addEventListener("keydown", this.handleKeyDown.bind(this), true);
          document.addEventListener("input", this.handleInput.bind(this));
          this.startInputValueWatcher();
        },
startInputValueWatcher() {
          setInterval(() => {
            if (this.currentInput && this.currentSuggestions.length > 0) {
              const currentValue = this.currentInput.value;
              if (currentValue.length === 0) {
                this.hidePopup();
                this.setState(APP_STATES.IDLE);
                this.isInSelectionMode = false;
                this.activeIndex = -1;
              }
            }
          }, 100);
        },
handleInputDetected(input, type) {
          if (this.processedInputs.has(input)) return;
          this.processedInputs.add(input);
          console.log(`Processing detected input of type: ${type}`);
          this.setupInputByType(input, type);
        },
handleInputRemoved(input, type) {
          if (!this.processedInputs.has(input)) return;
          this.processedInputs.delete(input);
          if (this.currentInput === input) {
            this.currentInput = null;
            this.setState(APP_STATES.IDLE);
            UIManager.hidePopup();
          }
          console.log(`Removed input of type: ${type}`);
        },
setupInputByType(input, type) {
          switch (type) {
            case INPUT_TYPES.MAIN_CHAT:
              this.setupMainChatInput(input);
              break;
            case INPUT_TYPES.FULLSCREEN_FLOAT:
              this.setupFullscreenInput(input);
              break;
          }
        },
setupMainChatInput(input) {
          const focusHandler = () => {
            this.currentInput = input;
            this.setState(APP_STATES.IDLE);
            console.log("Main chat input focused and activated");
          };
          input.addEventListener("focus", focusHandler, { once: true });
          input.addEventListener("blur", () => {
            setTimeout(() => {
              input.addEventListener("focus", focusHandler, { once: true });
            }, 100);
          });
        },
setupFullscreenInput(input) {
          console.log("Fullscreen input setup completed");
          const focusHandler = () => {
            this.currentInput = input;
            this.setState(APP_STATES.IDLE);
            console.log("Fullscreen input focused and activated");
          };
          input.addEventListener("focus", focusHandler);
        },
handleFocusIn(event) {
          const target = event.target;
          if (InputDetector.isChatInput(target)) {
            this.currentInput = target;
            this.setState(APP_STATES.IDLE);
          }
        },
handleFocusOut(event) {
          console.log("=== InputManager.handleFocusOut 被调用 ===");
          console.log("失焦的元素:", event.target.className, "value:", event.target.value);
          if (event.target === this.currentInput) {
            console.log("当前输入框失焦，检查焦点转移目标...");
            const related = event.relatedTarget;
            const isPluginUI = related && (related.closest(".dda-popup") || related.closest(".ddp-candidate-capsules"));
            if (!isPluginUI) {
              setTimeout(() => {
                const hasContent = this.currentInput && this.currentInput.value && this.currentInput.value.trim().length > 0;
                console.log("焦点转移到非插件UI，输入框有内容:", hasContent);
                this.setState(APP_STATES.IDLE);
                this.currentInput = null;
                if (!hasContent) {
                  console.log("输入框为空，隐藏候选项");
                  this.hidePopup();
                } else {
                  console.log("输入框有内容，保持候选项显示");
                }
              }, 150);
            } else {
              console.log("焦点转移到插件UI内，保持候选项显示");
            }
          }
        },
handleInput(event) {
          if (event.target !== this.currentInput) return;
          const inputValue = event.target.value;
          Utils.log("输入事件，当前值:", inputValue);
          if (inputValue.length === 0) {
            this.hidePopup();
            this.setState(APP_STATES.IDLE);
            this.isInSelectionMode = false;
            this.activeIndex = -1;
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            return;
          }
          this.debounceProcessInput(inputValue);
        },
debounceProcessInput(inputValue) {
          if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
          }
          this.debounceTimer = setTimeout(() => {
            this.processInput(inputValue);
          }, SETTINGS.debounceDelay);
        },
handleKeyDown(event) {
          if (event.target !== this.currentInput) return;
          const key = event.key;
          const hasVisibleCandidates = UIManager.isPopupVisible();
          if (hasVisibleCandidates) {
            if (this.isInSelectionMode) {
              if (key === SETTINGS.KEYBOARD.ARROW_UP) {
                event.preventDefault();
                this.navigateUp();
              } else if (key === SETTINGS.KEYBOARD.ARROW_DOWN) {
                event.preventDefault();
                this.exitSelectionMode();
              } else if (key === SETTINGS.KEYBOARD.ARROW_LEFT) {
                event.preventDefault();
                this.navigateLeft();
              } else if (key === SETTINGS.KEYBOARD.ARROW_RIGHT) {
                event.preventDefault();
                this.navigateRight();
              } else if (key === SETTINGS.KEYBOARD.ENTER && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();
                this.selectActiveCandidate();
                this.exitSelectionMode();
              } else if (key === SETTINGS.KEYBOARD.ESCAPE) {
                event.preventDefault();
                this.exitSelectionMode();
                this.hidePopup();
              }
            } else {
              if (key === SETTINGS.KEYBOARD.ARROW_UP) {
                event.preventDefault();
                event.stopPropagation();
                this.enterSelectionMode();
              }
            }
          }
        },
enterSelectionMode() {
          this.isInSelectionMode = true;
          this.setState(APP_STATES.SELECTING);
          UIManager.setSelectionModeActive(true);
          if (this.currentSuggestions.length > 0) {
            this.setActiveIndex(0);
          }
          Utils.log("进入候选项选择模式");
        },
exitSelectionMode() {
          this.isInSelectionMode = false;
          this.setState(APP_STATES.TYPING);
          UIManager.setSelectionModeActive(false);
          this.setActiveIndex(-1);
          Utils.log("退出候选项选择模式");
        },
navigateUp() {
          if (this.currentSuggestions.length === 0) return;
          let newIndex = this.activeIndex - 1;
          if (newIndex < 0) {
            newIndex = this.currentSuggestions.length - 1;
          }
          this.setActiveIndex(newIndex);
        },
navigateDown() {
          if (this.currentSuggestions.length === 0) return;
          let newIndex = this.activeIndex + 1;
          if (newIndex >= this.currentSuggestions.length) {
            newIndex = 0;
          }
          this.setActiveIndex(newIndex);
        },
navigateLeft() {
          this.navigateUp();
        },
navigateRight() {
          this.navigateDown();
        },
setActiveIndex(index) {
          if (index < -1 || index >= this.currentSuggestions.length && index !== -1) {
            return;
          }
          this.activeIndex = index;
          UIManager.setActiveIndex(index);
        },
selectActiveCandidate() {
          if (this.activeIndex >= 0 && this.activeIndex < this.currentSuggestions.length) {
            const selectedCandidate = this.currentSuggestions[this.activeIndex];
            this.selectCandidate(selectedCandidate);
          }
        },
selectCandidate(candidate) {
          if (!candidate || !this.currentInput) return;
          const text = candidate.getDisplayText ? candidate.getDisplayText() : candidate.text;
          if (typeof candidate.updateUsage === "function") {
            candidate.updateUsage();
          } else if (candidate.id) {
            DanmukuDB.updateUsage(candidate.id);
          }
          NativeSetter.setValue(this.currentInput, text);
          this.hidePopup();
          this.setState(APP_STATES.IDLE);
          this.isInSelectionMode = false;
          this.activeIndex = -1;
          Utils.log(`候选项已选择并填入输入框: ${text}`);
        },
hidePopup() {
          UIManager.hidePopup();
          this.currentSuggestions = [];
          this.activeIndex = -1;
        },
async processInput(inputValue) {
          if (inputValue.length < SETTINGS.minSearchLength) {
            this.setState(APP_STATES.IDLE);
            this.isInSelectionMode = false;
            this.activeIndex = -1;
            this.hidePopup();
            return;
          }
          let suggestions = await DanmukuDB.search(inputValue, SETTINGS.maxSuggestions, SETTINGS.sortBy);
          this.currentSuggestions = suggestions;
          if (suggestions.length > 0) {
            this.setState(APP_STATES.TYPING);
            this.isInSelectionMode = false;
            UIManager.showPopup(suggestions, this.currentInput);
          } else {
            this.setState(APP_STATES.IDLE);
            this.isInSelectionMode = false;
            this.hidePopup();
          }
        },
setState(newState) {
          const oldState = this.currentState;
          this.currentState = newState;
          console.log(`State changed: ${oldState} -> ${newState}`);
          this.onStateChange(oldState, newState);
        },
onStateChange(oldState, newState) {
          console.log(`=== onStateChange: ${oldState} -> ${newState} ===`);
          switch (newState) {
            case APP_STATES.IDLE:
              console.log("状态变为IDLE，但不自动隐藏弹窗");
              break;
            case APP_STATES.TYPING:
              console.log("状态变为TYPING");
              break;
            case APP_STATES.SELECTING:
              console.log("状态变为SELECTING，设置活跃索引");
              if (this.activeIndex === -1 && this.currentSuggestions.length > 0) {
                this.setActiveIndex(0);
              }
              break;
          }
        },
isChatInput(element) {
          return InputDetector.isChatInput(element);
        }
      };
      const KeyboardController = {
activeIndex: 0,
enabled: true,
init() {
          console.log("KeyboardController initialized");
        },
handleKeyDown(event, currentState) {
          if (!this.enabled) return;
          const key = event.code || event.key;
          switch (currentState) {
            case APP_STATES.IDLE:
              this.handleIdleState(event, key);
              break;
            case APP_STATES.TYPING:
              this.handleTypingState(event, key);
              break;
            case APP_STATES.SELECTING:
              this.handleSelectingState(event, key);
              break;
          }
        },
handleIdleState(event, key) {
          if (this.isTriggerKey(key)) {
            event.preventDefault();
          }
        },
handleTypingState(event, key) {
          if (this.isTriggerKey(key)) {
            event.preventDefault();
          } else if (this.isCancelKey(key)) {
            event.preventDefault();
          }
        },
handleSelectingState(event, key) {
          if (this.isNavigationKey(key)) {
            this.handleNavigation(event, key);
          } else if (this.isSelectKey(key)) {
            this.handleSelection(event);
          } else if (this.isCancelKey(key)) {
            this.handleCancel(event);
          }
        },
handleNavigation(event, key) {
          event.preventDefault();
          const direction = this.getNavigationDirection(key);
          if (direction === "up") {
            this.moveSelection(-1);
          } else if (direction === "down") {
            this.moveSelection(1);
          }
        },
handleSelection(event) {
          event.preventDefault();
          if (UIManager) {
            UIManager.selectActiveCandidate();
          }
        },
handleCancel(event) {
          event.preventDefault();
          if (UIManager) {
            UIManager.hidePopup();
          }
        },
moveSelection(delta) {
          if (UIManager) {
            if (delta < 0) {
              UIManager.navigateUp();
            } else {
              UIManager.navigateDown();
            }
          }
        },
resetSelection() {
          this.activeIndex = 0;
        },
isTriggerKey(key) {
          return SETTINGS.TRIGGER_KEYS.includes(key) || key === "Tab" && SETTINGS.TRIGGER_KEYS.includes("Tab");
        },
isNavigationKey(key) {
          return SETTINGS.NAVIGATION_KEYS.includes(key) || ["ArrowUp", "ArrowDown", "KeyW", "KeyS"].includes(key);
        },
isSelectKey(key) {
          return SETTINGS.SELECT_KEYS.includes(key) || ["Enter", "Tab"].includes(key);
        },
isCancelKey(key) {
          return SETTINGS.CANCEL_KEYS.includes(key) || key === "Escape";
        },
getNavigationDirection(key) {
          switch (key) {
            case "ArrowUp":
            case "KeyW":
              return "up";
            case "ArrowDown":
            case "KeyS":
              return "down";
            default:
              return null;
          }
        },
enable() {
          this.enabled = true;
        },
disable() {
          this.enabled = false;
        }
      };
      const _danmukuPopupCss = ".dda-popup{position:fixed;z-index:9999;background:var(--md-sys-color-surface-container);border:1px solid var(--md-sys-color-outline);transition:all .3s var(--motion-easing),box-shadow .3s var(--motion-easing);border-radius:12px;box-shadow:0 4px 8px 3px #00000026,0 1px 3px #0000004d;max-width:400px;max-height:300px;overflow:hidden;opacity:0;transform:translateY(-10px)}.dda-popup.show{opacity:1;transform:translateY(0)}.dda-popup.selection-mode-active{border-color:var(--md-sys-color-primary);box-shadow:0 6px 16px 4px #0003,0 2px 6px #0006,0 0 0 1px var(--md-sys-color-primary);background:var(--md-sys-color-surface-bright)}.dda-popup-content{max-height:300px;overflow-y:auto;padding:4px 0}.dda-popup-item{padding:8px 16px;cursor:pointer;border-bottom:1px solid var(--md-sys-color-outline);transition:all .25s cubic-bezier(.4,0,.2,1);min-height:40px;display:flex;flex-direction:column;justify-content:center;position:relative;border-left:6px solid transparent;will-change:transform}.dda-popup-item-active{background-color:var(--md-sys-color-tertiary-container);border-left-color:var(--md-sys-color-tertiary);transform:translate(2px);box-shadow:0 4px 12px #0003,inset 0 0 0 2px rgba(var(--md-sys-color-tertiary-rgb),.3);z-index:10}.dda-popup-item:last-child{border-bottom:none}.dda-popup-item:hover{background-color:var(--md-sys-color-surface-bright);transform:translate(4px)}.dda-preview-tooltip{position:fixed;z-index:10000;background:var(--md-sys-color-surface-bright);border:1px solid var(--md-sys-color-outline);border-radius:8px;padding:12px 16px;box-shadow:0 8px 24px #0000004d;max-width:400px;word-wrap:break-word;font-size:14px;color:var(--md-sys-color-on-surface);opacity:0;transform:translateY(-10px);transition:opacity .2s cubic-bezier(.4,0,.2,1),transform .2s cubic-bezier(.4,0,.2,1);pointer-events:none}.dda-preview-tooltip.show{opacity:1;transform:translateY(0)}.dda-popup-item-text{font-size:14px;color:var(--md-sys-color-on-surface);line-height:1.4;margin-bottom:4px}.dda-popup-item-active .dda-popup-item-text{color:var(--md-sys-color-on-tertiary-container);font-weight:600}.dda-popup-item-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.dda-popup-tag{display:inline-block;padding:2px 6px;background-color:var(--md-sys-color-tertiary);color:var(--md-sys-color-on-primary);font-size:11px;border-radius:12px;line-height:1.2}.dda-popup-item-active .dda-popup-tag{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary)}.dda-popup-empty{max-height:60px}.dda-empty-message{padding:16px;text-align:center;color:var(--md-sys-color-on-surface-variant);font-size:13px}@media (max-width: 480px){.dda-popup{max-width:90vw;left:5vw!important;right:5vw!important}}@keyframes fadeInUp{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.dda-popup.animate-in{animation:fadeInUp .2s var(--motion-easing)}.send-button:hover{background:var(--md-sys-color-primary-container);color:var(--md-sys-color-on-primary-container)}.send-button:active{transform:scale(.98)}";
      importCSS(_danmukuPopupCss);
      const _candidateCapsulesCss = '.ddp-candidate-capsules{display:flex;flex-wrap:nowrap;gap:6px;padding:var(--ddp-capsule-padding, 8px) 12px;background:var(--md-sys-color-surface-container);border-radius:8px;margin:var(--ddp-capsule-margin, 8px) 12px;max-width:calc(100% - 24px);overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;position:relative;z-index:1000}.ddp-candidate-capsules::-webkit-scrollbar{display:none}.ddp-candidate-capsules.multi-row{flex-wrap:wrap;max-height:120px;overflow-y:auto;mask:none;-webkit-mask:none}.ddp-candidate-capsule{flex-shrink:0;padding:var(--ddp-capsule-item-padding, 3px) 8px;background:var(--md-sys-color-surface-container);border:1px solid var(--md-sys-color-outline);border-radius:12px;color:var(--md-sys-color-on-surface);font-size:12px;line-height:1.3;cursor:pointer;transition:all .25s cubic-bezier(.4,0,.2,1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr;text-align:left;max-width:150px;min-width:30px;height:var(--ddp-capsule-item-height, 24px);display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box;-webkit-user-select:none;user-select:none;position:relative}.ddp-candidate-capsules.multi-row .ddp-candidate-capsule{flex:0 0 calc(25% - 5px);max-width:calc(25% - 5px);min-width:60px}.ddp-candidate-capsule:hover{background:#fff3;border-color:#fff6;transform:translateY(-1px);box-shadow:0 2px 4px #0003}.ddp-candidate-capsule.active{background:#f60;border-color:#f83;color:#fff;font-weight:500;box-shadow:0 2px 6px #ff66004d}.ddp-candidate-capsules.selection-mode-active{box-shadow:0 0 0 2px #f60;background:var(--md-sys-color-surface-container)}.ddp-candidate-capsule[title]{position:relative}.ddp-capsule-preview{position:fixed;z-index:10000;background:var(--md-sys-color-surface-container);border:1px solid var(--md-sys-color-outline);border-radius:8px;padding:8px 12px;box-shadow:0 4px 8px 3px #0000004d,0 1px 3px #0006;max-width:300px;min-width:100px;word-wrap:break-word;white-space:normal;opacity:0;transform:translateY(-5px);transition:opacity .2s cubic-bezier(.4,0,.2,1),transform .2s cubic-bezier(.4,0,.2,1);pointer-events:none;font-size:13px;line-height:1.4;color:var(--md-sys-color-on-surface)}.ddp-capsule-preview.show{opacity:1;transform:translateY(0)}.ddp-capsule-preview:before{content:"";position:absolute;bottom:-5px;left:50%;transform:translate(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--md-sys-color-surface-container)}.ddp-capsule-preview.show-below:before{bottom:auto;top:-5px;border-top:none;border-bottom:5px solid var(--md-sys-color-surface-container)}.ddp-capsule-preview.active{border-color:#f60;background:var(--surface-container-highest);box-shadow:0 4px 8px 3px #0000004d,0 1px 3px #0006,0 0 0 1px #f60}.ddp-capsule-preview.active:before{border-top-color:var(--surface-container-highest)}.ddp-capsule-preview.active.show-below:before{border-bottom-color:var(--surface-container-highest)}.layout-Player-chat .Chat .ddp-candidate-capsules{z-index:1000;position:relative}.Chat{background-color:var(--md-sys-color-surface-container)}@media (max-width: 768px){.ddp-candidate-capsules{gap:6px;padding:6px 8px}.ddp-candidate-capsule{padding:4px 8px;font-size:12px;max-width:150px}}@media (prefers-color-scheme: dark){.ddp-candidate-capsules{box-shadow:0 2px 8px #00000040}.ddp-candidate-capsule:hover{box-shadow:0 2px 8px #0000004d}}@keyframes ddp-capsule-appear{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.ddp-candidate-capsules{animation:ddp-capsule-appear .2s var(--motion-easing)}.ddp-candidate-capsule{animation:ddp-capsule-appear .3s var(--motion-easing) backwards}.ddp-candidate-capsule:nth-child(1){animation-delay:.05s}.ddp-candidate-capsule:nth-child(2){animation-delay:.1s}.ddp-candidate-capsule:nth-child(3){animation-delay:.15s}.ddp-candidate-capsule:nth-child(4){animation-delay:.2s}.ddp-candidate-capsule:nth-child(5){animation-delay:.25s}';
      importCSS(_candidateCapsulesCss);
      const DanmuPro = {
        initialized: false,
async init() {
          if (this.initialized) {
            Utils.log("弹幕助手已经初始化，跳过。", "warn");
            return;
          }
          try {
            Utils.log("[弹幕助手] 模块开始初始化...");
            const dbSuccess = await DanmukuDB.init();
            if (!dbSuccess) {
              Utils.log("[弹幕助手] 数据库初始化失败，功能可能受限。", "warn");
            }
            await this.firstTimeImport();
            KeyboardController.init();
            await InputManager.init();
            this.initialized = true;
            Utils.log("[弹幕助手] 模块初始化完成！");
          } catch (error) {
            Utils.log(`[弹幕助手] 初始化失败: ${error.message}`, "error");
          }
        },
async firstTimeImport() {
          try {
            const dataCount = await DanmukuDB.getDataCount();
            if (dataCount === 0) {
              Utils.log("[弹幕助手] 数据库为空，开始首次数据导入...");
              const result = await DanmukuDB.autoImportData();
              if (result && result.successCount > 0) {
                Utils.log(`[弹幕助手] 首次数据导入成功 ${result.successCount} 条。`);
              } else {
                Utils.log("[弹幕助手] 首次数据导入失败。", "warn");
              }
            }
          } catch (error) {
            Utils.log(`[弹幕助手] 检查首次导入时发生错误: ${error.message}`, "error");
          }
        }
      };
      (function() {
        function main() {
          initHackTimer("HackTimerWorker.js");
          const currentUrl = window.location.href;
          const controlIds = [SETTINGS.CONTROL_ROOM_ID, SETTINGS.TEMP_CONTROL_ROOM_RID].filter(Boolean);
          Utils.log(`控制页识别ID列表: ${controlIds.join(", ")}`);
          Utils.log(`当前页面URL: ${currentUrl}`);
          const isControlRoom = controlIds.some(
            (id) => currentUrl.includes(`/${id}`) || currentUrl.includes(`/topic/`) && currentUrl.includes(`rid=${id}`)
          );
          if (isControlRoom) {
            ControlPage.init();
            if (SETTINGS.ENABLE_DANMU_PRO) {
              DanmuPro.init();
            }
            return;
          }
          const roomId = Utils.getCurrentRoomId();
          if (roomId && (currentUrl.match(/douyu\.com\/(?:beta\/)?(\d+)/) || currentUrl.match(/douyu\.com\/(?:beta\/)?topic\/.*rid=(\d+)/))) {
            const globalTabs = GlobalState.get().tabs;
            const pendingWorkers = GM_getValue("qmx_pending_workers", []);
            if (Object.hasOwn(globalTabs, roomId) || pendingWorkers.includes(roomId)) {
              Utils.log(`[身份验证] 房间 ${roomId} 身份合法，授权初始化。`);
              const pendingIndex = pendingWorkers.indexOf(roomId);
              if (Object.hasOwn(globalTabs, roomId) && pendingIndex > -1) {
                pendingWorkers.splice(pendingIndex, 1);
                GM_setValue("qmx_pending_workers", pendingWorkers);
                Utils.log(`[身份清理] 房间 ${roomId} 已是激活状态，清理残留的待处理标记。`);
              }
              WorkerPage.init();
            } else {
              Utils.log(`[身份验证] 房间 ${roomId} 未在全局状态或待处理列表中，脚本不活动。`);
            }
          } else {
            Utils.log("当前页面非控制页或工作页，脚本不活动。");
          }
        }
        Utils.log(`脚本将在 ${SETTINGS.INITIAL_SCRIPT_DELAY / 1e3} 秒后开始初始化...`);
        setTimeout(main, SETTINGS.INITIAL_SCRIPT_DELAY);
      })();
    })
  };
}));
System.register("./__vite-browser-external-2Ng8QIWW-Xya9USxv.js", [], (function (exports, module) {
  'use strict';
  return {
    execute: (function () {
      const __viteBrowserExternal = exports("default", {});
    })
  };
}));
System.import("./__entry.js", "./");