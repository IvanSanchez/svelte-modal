!function(){"use strict";function t(){}function e(t,e){for(var n in e)t[n]=e[n];return t}function n(t,e){t.appendChild(e)}function i(t,e,n){t.insertBefore(e,n)}function o(t){t.parentNode.removeChild(t)}function s(t){return document.createElement(t)}function r(t){return document.createTextNode(t)}function a(t,e,n){t.addEventListener(e,n,!1)}function c(t,e,n){t.removeEventListener(e,n,!1)}function d(t,e,n){t.setAttribute(e,n)}function u(t,e){t.data=""+e}function l(){return Object.create(null)}function h(t){t._lock=!0,p(t._beforecreate),p(t._oncreate),p(t._aftercreate),t._lock=!1}function f(t,e){t._handlers=l(),t._slots=l(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function p(t){for(;t&&t.length;)t.shift()()}var g={destroy:function(e){this.destroy=t,this.fire("destroy"),this.set=t,this._fragment.d(!1!==e),this._fragment=null,this._state={}},get:function(){return this._state},fire:function(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var i=0;i<n.length;i+=1){var o=n[i];if(!o.__calling)try{o.__calling=!0,o.call(this,e)}finally{o.__calling=!1}}},on:function(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}},set:function(t){this._set(e({},t)),this.root._lock||h(this.root)},_recompute:t,_set:function(t){var n=this._state,i={},o=!1;for(var s in t=e(this._staged,t),this._staged={},t)this._differs(t[s],n[s])&&(i[s]=o=!0);o&&(this._state=e(e({},n),t),this._recompute(i,this._state),this._bind&&this._bind(i,this._state),this._fragment&&(this.fire("state",{changed:i,current:this._state,previous:n}),this._fragment.p(i,this._state),this.fire("update",{changed:i,current:this._state,previous:n})))},_stage:function(t){e(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:function(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}};function m(){}function v(t,e){for(var n in e)t[n]=e[n];return t}function _(t,e){t.appendChild(e)}function y(t){return document.createElement(t)}function b(t,e,n){t.style.setProperty(e,n)}function E(){return Object.create(null)}function k(t){t._lock=!0,x(t._beforecreate),x(t._oncreate),x(t._aftercreate),t._lock=!1}function x(t){for(;t&&t.length;)t.shift()()}var F={destroy:function(t){this.destroy=m,this.fire("destroy"),this.set=m,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:function(){return this._state},fire:function(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var i=0;i<n.length;i+=1){var o=n[i];if(!o.__calling)try{o.__calling=!0,o.call(this,e)}finally{o.__calling=!1}}},on:function(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}},set:function(t){this._set(v({},t)),this.root._lock||k(this.root)},_recompute:m,_set:function(t){var e=this._state,n={},i=!1;for(var o in t=v(this._staged,t),this._staged={},t)this._differs(t[o],e[o])&&(n[o]=i=!0);i&&(this._state=v(v({},e),t),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:e}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:e})))},_stage:function(t){v(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:function(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}};function w(t){return"[object Date]"===Object.prototype.toString.call(t)}var C={components:[],running:!1,add:function(t){~C.components.indexOf(t)||(C.components.push(t),C.running||(C.running=!0,requestAnimationFrame(C.next)))},next:function(){for(var t=!1,e=C.components.length;e--;){var n=C.components[e],i={},o=!1;for(var s in n._springs){n._springs[s].tick(i)?(o=!0,t=!0):(n._springCallbacks[s](),delete n._springs[s],delete n._springCallbacks[s])}n._springing=!0,n.set(i),n._springing=!1,o||C.components.splice(e,1)}t?requestAnimationFrame(C.next):C.running=!1}};function S(t,e,n,i){var o=0,s=i.stiffness,r=i.damping,a=.001*Math.abs(n-e),c=a;return{key:t,tick:function(i){return e+=o+=s*(n-e)-r*o,i[t]=e,o<c&&Math.abs(n-e)<a?(i[t]=n,!1):(i[t]=e,!0)},update:function(t,e){I(t,n),n=t,s=e.stiffness,r=e.damping}}}function I(t,e){var n=typeof t;if(n!==typeof e||Array.isArray(t)!==Array.isArray(e)||w(t)!==w(e))throw new Error("Cannot interpolate values of different type");if("object"===n){if(!t||!e)throw new Error("Object cannot be null");if(Array.isArray(t)){if(t.length!==e.length)throw new Error("Cannot interpolate arrays of different length")}else if(!function(t,e){var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(var o=0;o<n.length;o+=1)if(!(n[o]in e))return!1;return!0}(t,e))throw new Error("Cannot interpolate differently-shaped objects")}else if("number"!==n)throw new Error("Cannot interpolate "+n+" values")}function D(t,e,n,i){return e===n||e!=e?function(t,e,n,i){return{key:t,tick:function(e){return e[t]=n,!1},update:function(t,e){n=t}}}(t,0,n):(I(e,n),"object"==typeof e?Array.isArray(e)?function(t,e,n,i){for(var o=[],s=[],r=0;r<e.length;r+=1)s.push(D(r,e[r],n[r],i));return{key:t,tick:function(e){for(var i=!1,r=0;r<s.length;r+=1)s[r].tick(o)&&(i=!0);return i?(e[t]=o,!0):(e[t]=n,!1)},update:function(t,e){I(t,n);for(var i=0;i<t.length;i+=1)s[i].update(t[i],e);n=t}}}(t,e,n,i):w(e)?function(t,e,n,i){var o={},s=S(t,e.getTime(),n.getTime(),i);return{key:t,tick:function(e){return s.tick(o)?(e[t]=new Date(o[t]),!0):(e[t]=n,!1)},update:function(t,e){I(t,n),s.update(t.getTime(),e),n=t}}}(t,e,n,i):function(t,e,n,i){var o={},s=[];for(var r in e)s.push(D(r,e[r],n[r],i));return{key:t,tick:function(e){for(var i=!1,r=0;r<s.length;r+=1)s[r].tick(o)&&(i=!0);return i?(e[t]=o,!0):(e[t]=n,!1)},update:function(t,e){I(t,n);for(var i=0;i<s.length;i+=1)s[i].update(t[s[i].key],e);n=t}}}(t,e,n,i):S(t,e,n,i))}var O=function(t,e){e=e||{};var n,i,o,s=t.ownerDocument||t,r=[],a=[],c=function(t){var e=[];return function(n){if(n===t.documentElement)return!1;var i=t.defaultView.getComputedStyle(n);return!!function n(i,o){if(i===t.documentElement)return!1;for(var s=0,r=e.length;s<r;s++)if(e[s][0]===i)return e[s][1];o=o||t.defaultView.getComputedStyle(i);var a=!1;"none"===o.display?a=!0:i.parentNode&&(a=n(i.parentNode));e.push([i,a]);return a}(n,i)||"hidden"===i.visibility}}(s),d=["input","select","a[href]","textarea","button","[tabindex]"],u=t.querySelectorAll(d.join(","));if(e.includeContainer){var l=Element.prototype.matches||Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector;d.some(function(e){return l.call(t,e)})&&(u=Array.prototype.slice.apply(u)).unshift(t)}for(var h=0,f=u.length;h<f;h++)n=u[h],i=parseInt(n.getAttribute("tabindex"),10),(o=isNaN(i)?n.tabIndex:i)<0||"INPUT"===n.tagName&&"hidden"===n.type||n.disabled||c(n,s)||(0===o?r.push(n):a.push({index:h,tabIndex:o,node:n}));var p=a.sort(function(t,e){return t.tabIndex===e.tabIndex?t.index-e.index:t.tabIndex-e.tabIndex}).map(function(t){return t.node});return Array.prototype.push.apply(p,r),p};var A=null;function j(t){t&&t.focus&&t!==document.activeElement&&(t.focus(),"input"===t.tagName.toLowerCase()&&t.select())}var T=function(t,e){var n=[],i=null,o=null,s=null,r=!1,a=!1,c=null,d="string"==typeof t?document.querySelector(t):t,u=e||{};u.returnFocusOnDeactivate=!e||void 0===e.returnFocusOnDeactivate||e.returnFocusOnDeactivate,u.escapeDeactivates=!e||void 0===e.escapeDeactivates||e.escapeDeactivates;var l={activate:function(t){if(!r){var e={onActivate:t&&void 0!==t.onActivate?t.onActivate:u.onActivate};return r=!0,a=!1,s=document.activeElement,e.onActivate&&e.onActivate(),f(),l}},deactivate:h,pause:function(){!a&&r&&(a=!0,p())},unpause:function(){a&&r&&(a=!1,f())}};return l;function h(t){if(r){var e={returnFocus:t&&void 0!==t.returnFocus?t.returnFocus:u.returnFocusOnDeactivate,onDeactivate:t&&void 0!==t.onDeactivate?t.onDeactivate:u.onDeactivate};return p(),e.onDeactivate&&e.onDeactivate(),e.returnFocus&&setTimeout(function(){j(s)},0),r=!1,a=!1,this}}function f(){if(r)return A&&A.pause(),A=l,b(),setTimeout(function(){j(function(){var t;if(!(t=null!==g("initialFocus")?g("initialFocus"):d.contains(document.activeElement)?document.activeElement:n[0]||g("fallbackFocus")))throw new Error("You can't have a focus-trap without at least one focusable element");return t}())},0),document.addEventListener("focus",_,!0),document.addEventListener("click",v,!0),document.addEventListener("mousedown",m,!0),document.addEventListener("touchstart",m,!0),document.addEventListener("keydown",y,!0),l}function p(){if(r&&A===l)return document.removeEventListener("focus",_,!0),document.removeEventListener("click",v,!0),document.removeEventListener("mousedown",m,!0),document.removeEventListener("touchstart",m,!0),document.removeEventListener("keydown",y,!0),A=null,l}function g(t){var e=u[t],n=e;if(!e)return null;if("string"==typeof e&&!(n=document.querySelector(e)))throw new Error("`"+t+"` refers to no known node");if("function"==typeof e&&!(n=e()))throw new Error("`"+t+"` did not return a node");return n}function m(t){u.clickOutsideDeactivates&&!d.contains(t.target)&&h({returnFocus:!1})}function v(t){u.clickOutsideDeactivates||d.contains(t.target)||(t.preventDefault(),t.stopImmediatePropagation())}function _(t){d.contains(t.target)||(t.preventDefault(),t.stopImmediatePropagation(),"function"==typeof t.target.blur&&t.target.blur(),c&&function(t){if(t.shiftKey)return j(o);j(i)}(c))}function y(t){"Tab"!==t.key&&9!==t.keyCode||function(t){if(b(),t.target.hasAttribute("tabindex")&&Number(t.target.getAttribute("tabindex"))<0)return c=t;t.preventDefault();var e=n.indexOf(t.target);t.shiftKey?t.target===i||-1===n.indexOf(t.target)?j(o):j(n[e-1]):t.target===o?j(i):j(n[e+1])}(t),!1!==u.escapeDeactivates&&function(t){return"Escape"===t.key||"Esc"===t.key||27===t.keyCode}(t)&&h()}function b(){n=O(d),i=n[0],o=n[n.length-1]}};const M=[],z=t=>{t.on("opening",()=>{M.forEach(t=>t.background()),t.foreground(),M.push(t);const e=()=>{n.cancel(),i.cancel(),M.pop();const t=M[M.length-1];t&&setTimeout(()=>t.foreground())},n=t.on("hiding",e),i=t.on("destroy",e)})},L=({rootElement:t})=>T(t,{initialFocus:t,fallbackFocus:t,escapeDeactivates:!1,returnFocusOnDeactivate:!0,clickOutsideDeactivates:!1}),N={modal:{open:{opacity:1},hidden:{opacity:0}},content:{open:{scale:1},hidden:{scale:.9}}},q={initiallyHidden:!1,initialFocusElement:!1,center:!0,zIndexBase:1,pressScrimToDismiss:!0,escToDismiss:!0,trapFocus:!0};[N,q].forEach(Object.freeze);var B={spring(t,e,n){return function(t,e,n){var i=this;if(!this._springs){this._springs=Object.create(null),this._springCallbacks=Object.create(null),this._springing=!1;var o=this.set;this.set=function(t){if(!i._springing)for(var e in t)delete i._springs[e];o.call(i,t)}}if(this._springs[t])this._springs[t].update(e,n);else{var s=D(t,this.get()[t],e,n);this._springs[t]=s}var r=new Promise(function(e){i._springCallbacks[t]=e});return C.add(this),r}.call(this,t,e,n=n||{stiffness:.5,damping:1})},focusInitialFocusElement(){const t=this.get().initialFocusElement;t&&t.focus()},onKeyup(t){"escape"===t.key.toLowerCase()&&this.get().escToDismiss&&this.get().inForeground&&this.dismiss()},onScrimPress(){this.get("pressScrimToDismiss")&&this.dismiss()},open(){if(!this.get().open&&!this.get().opening)return this.set({opening:!0,hiding:!1,hidden:!1}),this.fire("opening"),Promise.all([this.spring("modalStyle",N.modal.open),this.spring("contentStyle",N.content.open)]).then(()=>{this.set({opening:!1}),this.fire("opened")}),this},hide(t,e){if(!this.get().hidden&&!this.get().hiding)return this.set({opening:!1,hiding:!0}),this.fire("result",e),this.fire(t,e),this.fire("hiding"),Promise.all([this.spring("modalStyle",N.modal.hidden),this.spring("contentStyle",N.content.hidden)]).then(()=>{this.set({hiding:!1,hidden:!0}),this.fire("hidden")}),this},close(t){return this.hide("closed",t)},dismiss(t){return this.hide("dismissed",t)},background(){this.focusTrap.pause(),this.set({inForeground:!1})},foreground(t){this.focusTrap.unpause(),this.focusInitialFocusElement(),this.set({inForeground:!0})}};function P(t,e){var n,i,o,s,r=t._slotted.default;function a(e){t.onKeyup(e)}function c(e){t.onScrimPress()}return window.addEventListener("keyup",a),{c(){var t,r,a;n=y("div"),i=y("div"),t="\n  ",o=document.createTextNode(t),s=y("div"),i.className="content svelte-1b0dvdd",b(i,"transform","scale("+e.contentStyle.scale+")"),r="click",a=c,s.addEventListener(r,a,!1),s.className="svelte-modal-scrim svelte-1b0dvdd",b(s,"z-index",e.zIndex-1),n.className="svelte-modal svelte-1b0dvdd",n.tabIndex="-1",n.dataset.center=e.center,n.dataset.hidden=e.hidden,b(n,"z-index",e.zIndex),b(n,"opacity",e.modalStyle.opacity)},m(e,a){!function(t,e,n){t.insertBefore(e,n)}(e,n,a),_(n,i),r&&_(i,r),t.refs.content=i,_(n,o),_(n,s),t.refs.scrim=s,t.refs.modal=n},p(t,e){t.contentStyle&&b(i,"transform","scale("+e.contentStyle.scale+")"),t.zIndex&&b(s,"z-index",e.zIndex-1),t.center&&(n.dataset.center=e.center),t.hidden&&(n.dataset.hidden=e.hidden),t.zIndex&&b(n,"z-index",e.zIndex),t.modalStyle&&b(n,"opacity",e.modalStyle.opacity)},d(e){var o;window.removeEventListener("keyup",a),e&&(o=n).parentNode.removeChild(o),r&&function(t,e){for(;t.firstChild;)e.appendChild(t.firstChild)}(i,r),t.refs.content===i&&(t.refs.content=null),function(t,e,n){t.removeEventListener(e,n,!1)}(s,"click",c),t.refs.scrim===s&&(t.refs.scrim=null),t.refs.modal===n&&(t.refs.modal=null)}}}function R(t){var e;!function(t,e){t._handlers=E(),t._slots=E(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}(this,t),this.refs={},this._state=v(Object.assign({hidden:!0,hiding:!1,opening:!1,inForeground:!1,modalStyle:N.modal.hidden,contentStyle:N.content.hidden},q),t.data),this._recompute({hiding:1,opening:1,hidden:1,transitioning:1,zIndexBase:1,inForeground:1},this._state),this._intro=!0,this._slotted=t.slots||{},document.getElementById("svelte-1b0dvdd-style")||((e=y("style")).id="svelte-1b0dvdd-style",e.textContent='.svelte-modal.svelte-1b0dvdd{position:fixed;top:0;left:0;right:0;height:100%;display:flex;align-items:flex-start;justify-content:center}.svelte-modal-scrim.svelte-1b0dvdd{background:rgba(0, 0, 0, 0.5);position:fixed;top:0;bottom:0;right:0;left:0}[data-center="true"].svelte-1b0dvdd{align-items:center}[data-hidden="true"].svelte-1b0dvdd{visibility:hidden}.content.svelte-1b0dvdd{max-width:100vw;max-height:100vh;overflow:visible;z-index:1}',_(document.head,e)),this._fragment=P(this,this._state),this.root._oncreate.push(()=>{(function(){this.on("open",()=>this.open()),this.on("dismiss",t=>this.dismiss(t)),this.on("close",t=>this.close(t));const t=this.refs.modal;this.focusTrap=L({rootElement:t}),this.on("hiding",()=>this.focusTrap.deactivate()),this.on("destroy",()=>this.focusTrap.deactivate()),z(this),this.on("opening",()=>{this.get().trapFocus&&this.focusTrap.activate(),setTimeout(()=>{this.focusInitialFocusElement()})}),console.log("looking for initiallyHidden",this),this.get().initiallyHidden||this.open()}).call(this),this.fire("update",{changed:function(t,e){for(var n in e)t[n]=1;return t}({},this._state),current:this._state})}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),k(this))}v(R.prototype,F),v(R.prototype,B),R.prototype._recompute=function(t,e){(t.hiding||t.opening)&&this._differs(e.transitioning,e.transitioning=function({hiding:t,opening:e}){return t||e}(e))&&(t.transitioning=!0),(t.hidden||t.transitioning)&&this._differs(e.open,e.open=function({hidden:t,transitioning:e}){return!t&&!e}(e))&&(t.open=!0),(t.zIndexBase||t.inForeground)&&this._differs(e.zIndex,e.zIndex=function({zIndexBase:t,inForeground:e}){return e?t:t-1}(e))&&(t.zIndex=!0)},function(t){Object.assign(t,{DEFAULTS:q})}(R);var H={closeModal(t,e){this.fire(`modal.${t}`,e)}};function K(d){var u;f(this,d),this.refs={},this._state=e({},d.data),this._intro=!0,document.getElementById("svelte-j5h5mq-style")||((u=s("style")).id="svelte-j5h5mq-style",u.textContent=".content.svelte-j5h5mq{background:white;padding:30px;border-radius:4px;margin:10px;max-height:calc(100vh - 20px);overflow-y:auto}",n(document.head,u)),this._fragment=function(e,d){var u,l,h,f,p,g,m,v;function _(t){e.closeModal("dismiss","It got dismissed.")}function y(t){e.closeModal("close","It's come to a close.")}return{c(){u=s("div"),(l=s("p")).textContent="Here is some modal content.",h=r("\n  "),(f=s("p")).textContent="It is interesting... or whatever.",p=r("\n  "),(g=s("button")).textContent="Dismiss Modal",m=r("\n  "),(v=s("button")).textContent="Close Modal",a(g,"click",_),a(v,"click",y),u.className="content svelte-j5h5mq"},m(t,o){i(t,u,o),n(u,l),n(u,h),n(u,f),n(u,p),n(u,g),e.refs.dismiss=g,n(u,m),n(u,v),e.refs.close=v},p:t,d(t){t&&o(u),c(g,"click",_),e.refs.dismiss===g&&(e.refs.dismiss=null),c(v,"click",y),e.refs.close===v&&(e.refs.close=null)}}}(this,this._state),this.root._oncreate.push(()=>{(function(){this.set({initialFocusElement:this.refs.close})}).call(this),this.fire("update",{changed:function(t,e){for(var n in e)t[n]=1;return t}({},this._state),current:this._state})}),d.target&&(this._fragment.c(),this._mount(d.target,d.anchor),h(this))}function U(t,e){var i,o,s={},a={},c={};void 0!==e.initialFocusElement&&(c.initialFocusElement=e.initialFocusElement,s.initialFocusElement=!0);var d=new K({root:t.root,store:t.store,data:c,_bind(e,n){var i={};!s.initialFocusElement&&e.initialFocusElement&&(i.initialFocusElement=n.initialFocusElement),t._set(i),s={}}});t.root._beforecreate.push(()=>{d._bind({initialFocusElement:1},d.get())}),d.on("modal.dismiss",function(e){t.refs.modal.dismiss(e)}),d.on("modal.close",function(e){t.refs.modal.close(e)}),t.refs.modalContent=d;var u={initialFocusElement:e.initialFocusElement,center:e.center,trapFocus:e.trapFocus};void 0!==e.opening&&(u.opening=e.opening,a.opening=!0),void 0!==e.hiding&&(u.hiding=e.hiding,a.hiding=!0);var l=new R({root:t.root,store:t.store,slots:{default:document.createDocumentFragment()},data:u,_bind(e,n){var i={};!a.opening&&e.opening&&(i.opening=n.opening),!a.hiding&&e.hiding&&(i.hiding=n.hiding),t._set(i),a={}}});return t.root._beforecreate.push(()=>{l._bind({opening:1,hiding:1},l.get())}),l.on("result",function(e){t.set({modalResult:e})}),l.on("hidden",function(e){t.set({shouldShowModal:!1})}),t.refs.modal=l,{c(){i=r("\n    "),d._fragment.c(),o=r("\n  "),l._fragment.c()},m(t,e){n(l._slotted.default,i),d._mount(l._slotted.default,null),n(l._slotted.default,o),l._mount(t,e)},p(t,n){e=n;var i={};!s.initialFocusElement&&t.initialFocusElement&&(i.initialFocusElement=e.initialFocusElement,s.initialFocusElement=void 0!==e.initialFocusElement),d._set(i),s={};var o={};t.initialFocusElement&&(o.initialFocusElement=e.initialFocusElement),t.center&&(o.center=e.center),t.trapFocus&&(o.trapFocus=e.trapFocus),!a.opening&&t.opening&&(o.opening=e.opening,a.opening=void 0!==e.opening),!a.hiding&&t.hiding&&(o.hiding=e.hiding,a.hiding=void 0!==e.hiding),l._set(o),a={}},d(e){d.destroy(),t.refs.modalContent===d&&(t.refs.modalContent=null),l.destroy(e),t.refs.modal===l&&(t.refs.modal=null)}}}function V(t){f(this,t),this.refs={},this._state=e({shouldShowModal:!1,modalResult:"None thus far.",showModalResult:!1},t.data),this._intro=!0,this._fragment=function(t,e){var l,h,f,p,g,m,v,_,y,b,E,k,x,F,w,C,S,I,D,O,A,j,T,M,z,L,N,q=e.modalResult||"";function B(){t.set({center:g.checked})}function P(){t.set({trapFocus:y.checked})}function R(e){t.set({shouldShowModal:!0,modalResult:""})}var H=e.shouldShowModal&&U(t,e);return{c(){(l=s("h1")).textContent="svelte-modal",h=r("\n\n"),f=s("label"),p=r("Center modal\n  "),g=s("input"),m=r("\n\n"),v=s("label"),_=r("Trap focus\n  "),y=s("input"),b=r("\n\n"),(E=s("button")).textContent="Open Modal",k=r("\n\n"),x=s("p"),(F=s("strong")).textContent="Modal result:",w=r("\n  "),C=r(q),S=r("\n\n"),H&&H.c(),I=r("\n"),D=s("p"),(O=s("strong")).textContent="Modal state:",A=r("\n  { opening: "),j=r(e.opening),T=r("\n  , hiding: "),M=r(e.hiding),z=r("\n  , shouldShowModal: "),L=r(e.shouldShowModal),N=r("\n  }"),a(g,"change",B),d(g,"type","checkbox"),a(y,"change",P),d(y,"type","checkbox"),a(E,"click",R)},m(t,o){i(t,l,o),i(t,h,o),i(t,f,o),n(f,p),n(f,g),g.checked=e.center,i(t,m,o),i(t,v,o),n(v,_),n(v,y),y.checked=e.trapFocus,i(t,b,o),i(t,E,o),i(t,k,o),i(t,x,o),n(x,F),n(x,w),n(x,C),i(t,S,o),H&&H.m(t,o),i(t,I,o),i(t,D,o),n(D,O),n(D,A),n(D,j),n(D,T),n(D,M),n(D,z),n(D,L),n(D,N)},p(e,n){e.center&&(g.checked=n.center),e.trapFocus&&(y.checked=n.trapFocus),e.modalResult&&q!==(q=n.modalResult||"")&&u(C,q),n.shouldShowModal?H?H.p(e,n):((H=U(t,n)).c(),H.m(I.parentNode,I)):H&&(H.d(1),H=null),e.opening&&u(j,n.opening),e.hiding&&u(M,n.hiding),e.shouldShowModal&&u(L,n.shouldShowModal)},d(t){t&&(o(l),o(h),o(f)),c(g,"change",B),t&&(o(m),o(v)),c(y,"change",P),t&&(o(b),o(E)),c(E,"click",R),t&&(o(k),o(x),o(S)),H&&H.d(t),t&&(o(I),o(D))}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),h(this))}e(K.prototype,g),e(K.prototype,H),e(V.prototype,g),window.app=new V({target:document.getElementById("app")})}();
//# sourceMappingURL=docs.js.map
