/* @ds-bundle: {"format": 4, "namespace": "VEX", "components": [{"name": "Key"}, {"name": "Tag"}, {"name": "Tabs"}, {"name": "Chips"}, {"name": "Bubble"}, {"name": "Composer"}, {"name": "Reasoning"}, {"name": "OrderCard"}, {"name": "HistoryRow"}, {"name": "RiskArc"}, {"name": "Knob"}, {"name": "LimitSlider"}, {"name": "Toggle"}, {"name": "CurveEditor"}, {"name": "PanelHeader"}, {"name": "IndexTile"}, {"name": "StatBlock"}, {"name": "HatchProgress"}, {"name": "MeterBars"}, {"name": "AreaChart"}, {"name": "StatusTable"}, {"name": "Ledger"}, {"name": "HexGrid"}, {"name": "Scope"}, {"name": "Mark"}, {"name": "Icon"}]} */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var ICONS = {"book": "<path d=\"M3 5.2c2.8-1.2 5.7-1 8.2.8V20c-2.5-1.6-5.4-1.8-8.2-.8z\"/><path d=\"M21 5.2c-2.8-1.2-5.7-1-8.2.8V20c2.5-1.6 5.4-1.8 8.2-.8z\"/>", "bubble": "<path d=\"M4 3h16a2 2 0 012 2v11a2 2 0 01-2 2H9.5L4 22v-4a2 2 0 01-2-2V5a2 2 0 012-2z\"/>", "cells": "<path d=\"M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3z\"/><path opacity=\".45\" d=\"M13 13h8v8h-8z\"/>", "chain": "<path d=\"M3.9 12a3.1 3.1 0 013.1-3.1h4V7H7a5 5 0 000 10h4v-1.9H7A3.1 3.1 0 013.9 12zM8 13h8v-2H8zm9-6h-4v1.9h4a3.1 3.1 0 010 6.2h-4V17h4a5 5 0 000-10z\"/>", "cloud": "<path d=\"M7 19a5 5 0 01-.7-9.95A6.5 6.5 0 0118.6 9.5 4.75 4.75 0 0117.5 19z\"/>", "code": "<path d=\"M8.3 6.3l1.4 1.4L5.4 12l4.3 4.3-1.4 1.4L2.6 12zM15.7 6.3l5.7 5.7-5.7 5.7-1.4-1.4 4.3-4.3-4.3-4.3zM13.2 4l1.9.5-4.3 15.5-1.9-.5z\"/>", "cube": "<path d=\"M12 3l8 4.4-8 4.4-8-4.4z\"/><path opacity=\".7\" d=\"M4 8.6l7.3 4V21L4 16.8z\"/><path opacity=\".45\" d=\"M12.7 12.6l7.3-4v8.2L12.7 21z\"/>", "curve": "<path d=\"M3 17.5C9 17.5 10.5 4 21 4v2.4c-8.6 0-9.6 13.5-18 13.5z\"/><path opacity=\".45\" d=\"M3 21h18v-1.6H3z\"/>", "desktop": "<path d=\"M3 4h18a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM9 18h6v2H9z\"/>", "get": "<path d=\"M11 3h2v9.2l3.3-3.3 1.4 1.4L12 16l-5.7-5.7 1.4-1.4L11 12.2zM4 19h16v2H4z\"/>", "gh": "<path d=\"M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 015 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0012 2z\"/>", "hex": "<path fill-rule=\"evenodd\" d=\"M12 2l8.7 5v10L12 22l-8.7-5V7zM8.5 11.2h7v1.6h-7z\"/>", "layout": "<path fill-rule=\"evenodd\" d=\"M3 3h18v18H3zm2 2v4h14V5zm0 6v8h4v-8zm6 0v8h8v-8z\"/>", "list": "<path d=\"M3 6h12v2H3zm0 5h12v2H3zm0 5h7v2H3zm12.5 1.6l2-2 1.5 1.5 3.5-3.5 1.4 1.4-4.9 4.9z\"/>", "news": "<path fill-rule=\"evenodd\" d=\"M3 4h18v16H3zM6 8h7v2H6zm0 4h12v1.6H6zm0 3.6h9v1.6H6z\"/>", "palette": "<path fill-rule=\"evenodd\" d=\"M12 3a9 9 0 100 18c1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.7 1.8-1.7H17a4 4 0 004-4c0-4.6-4-8.2-9-8.2zM7 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm2.5-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm2.5 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z\"/>", "paper": "<path fill-rule=\"evenodd\" d=\"M6 2h8.5L19 6.5V22H6zM9 11h7v1.5H9zm0 3.5h7V16H9z\"/>", "people": "<path d=\"M9 4a3.5 3.5 0 110 7 3.5 3.5 0 010-7zM2 20c.4-3.9 3.3-6.3 7-6.3s6.6 2.4 7 6.3zM16.5 5.5a3 3 0 110 6 3 3 0 010-6zM17.6 13.8c2.6.4 4.2 2.6 4.4 6.2h-4.3c-.2-2.4-1-4.4-2.4-5.8.7-.3 1.5-.4 2.3-.4z\"/>", "person": "<path d=\"M12 3a4 4 0 110 8 4 4 0 010-8zM4 21c.5-4.6 3.7-7.5 8-7.5s7.5 2.9 8 7.5z\"/>", "rail-ask": "<path fill-rule=\"evenodd\" d=\"M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9.5L4 22v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\"/>", "rail-chart": "<path fill-rule=\"evenodd\" d=\"M3 13h4.5v8H3zM9.75 7h4.5v14h-4.5zM16.5 3H21v18h-4.5z\"/>", "rail-no": "<path fill-rule=\"evenodd\" d=\"M12 1.8 20.5 5v6.2c0 5.1-3.5 9.6-8.5 11-5-1.4-8.5-5.9-8.5-11V5zM8.8 8.2 7.4 9.6l3.2 3.2-3.2 3.2 1.4 1.4 3.2-3.2 3.2 3.2 1.4-1.4-3.2-3.2 3.2-3.2-1.4-1.4-3.2 3.2z\"/>", "rail-plus": "<path fill-rule=\"evenodd\" d=\"M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9.5L4 22v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM11 6.5v3H8v2h3v3h2v-3h3v-2h-3v-3z\"/>", "rail-side": "<path fill-rule=\"evenodd\" d=\"M13 3a9 9 0 0 0-9 9H1l3.9 3.9.1.1L9 12H6a7 7 0 1 1 2.05 4.95l-1.42 1.42A9 9 0 1 0 13 3zm-1 5v5.2l4.3 2.55.75-1.25-3.55-2.1V8z\"/>", "rail-swap": "<path fill-rule=\"evenodd\" d=\"M7 2.5 1.5 8H5v8h4V8h3.5zM17 21.5l5.5-5.5H19V8h-4v8h-3.5z\"/>", "shield": "<path d=\"M12 1.8l8.5 3.2v6.2c0 5.1-3.5 9.6-8.5 11-5-1.4-8.5-5.9-8.5-11V5z\"/>", "star": "<path d=\"M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3l-6.2 3.6 1.6-7L2 9.2l7.1-.6z\"/>", "tg": "<path d=\"M21.5 3.5L2.5 11l5.6 2 2 6.3 3.2-3.6 4.6 3.6z\"/>", "token": "<path fill-rule=\"evenodd\" d=\"M12 3a9 9 0 110 18 9 9 0 010-18zm0 4.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z\"/>", "type": "<path d=\"M4 4h16v4.5h-2.4V6.4h-4.4V18h2.6v2H8.2v-2h2.6V6.4H6.4v2.1H4z\"/>", "vault": "<path fill-rule=\"evenodd\" d=\"M3 5h18v15H3zM12 9a3.5 3.5 0 100 7 3.5 3.5 0 000-7z\"/>", "x": "<path d=\"M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2.2 3h6.2l4.3 5.7z\"/>", "send": "<circle cx=\"5\" cy=\"5\" r=\"1.6\"/><circle cx=\"12\" cy=\"5\" r=\"1.6\"/><circle cx=\"19\" cy=\"5\" r=\"2.6\"/><circle cx=\"5\" cy=\"12\" r=\"2.6\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/><circle cx=\"19\" cy=\"12\" r=\"1.6\"/><circle cx=\"5\" cy=\"19\" r=\"1.6\"/><circle cx=\"12\" cy=\"19\" r=\"2.6\"/><circle cx=\"19\" cy=\"19\" r=\"1.6\"/>", "stop": "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\"/>", "chev": "<path d=\"M9 6l7 6-7 6z\"/>", "balance": "<path d=\"M10.8 3h2.4v15.5H18V21H6v-2.5h4.8zM3 6.5h18v2.6H3z\"/><path d=\"M1.5 15.5L5 8.5l3.5 7a3.5 3.5 0 01-7 0zM15.5 15.5l3.5-7 3.5 7a3.5 3.5 0 01-7 0z\"/>", "flame": "<path d=\"M12.6 1c.8 4.3 6.4 6.6 6.4 12.6A7 7 0 015 14c0-3 1.5-5 3-6.4.1 2.6 1.4 4.1 2.8 4.5C10 8 11.1 4 12.6 1z\"/>", "guard": "<path fill-rule=\"evenodd\" d=\"M12 1.5l9 3.6v6.4c0 5.6-3.8 9.7-9 11.2-5.2-1.5-9-5.6-9-11.2V5.1zM10.4 16.2l-4.1-4.1 1.9-1.9 2.2 2.2 5.4-5.4 1.9 1.9z\"/>"};
  var MARK = "<path d=\"M162.102 0.0163772C156.94 0.0163772 152.986 2.25992 148.689 7.43481C145.11 11.9301 139.557 21.1827 133.662 32.253C129.504 40.0727 125.158 48.8094 121.195 57.4233C121.073 57.6771 120.959 57.9309 120.844 58.1848L118.782 13.1256C118.741 12.233 118.643 11.3733 118.496 10.5545C118.04 8.01617 117.069 5.84632 115.708 4.14319C113.596 1.5148 110.538 0.00818862 106.918 0.00818862C103.298 0.00818862 101.211 0.958011 98.5362 2.93135C96.2695 4.60172 94.0681 7.01722 91.8503 10.2106C91.3448 6.86983 90.1869 4.30695 88.4095 2.58745C86.6401 0.884317 84.2593 0 81.3077 0C78.3561 0 76.8232 0.900694 74.5891 2.58745C71.613 4.83099 68.6696 8.46652 65.8648 13.1992C54.7025 32.0565 45.7091 68.3462 45.0649 103.834C45.0405 105.193 45.0242 106.544 45.0242 107.895C45.0242 111.522 45.3666 114.797 46.0597 117.909C45.7743 118.228 45.4889 118.539 45.1954 118.851C38.9579 125.532 32.7367 129.479 27.3145 129.479C19.2343 129.479 14.2525 121.192 14.2525 107.723C14.2525 78.1965 31.3587 34.6603 54.6291 4.16775C55.0368 3.63553 55.4445 3.11149 55.8521 2.58745H30.7554C20.9547 2.58745 16.6578 2.4155 12.3608 1.72769L-1.14441e-05 47.663L4.46816 46.4512C13.4045 21.4201 19.5931 12.0939 27.3309 12.0939H41.5996C17.359 46.2792 1.7204 85.4676 1.7204 111.702C1.7204 137.937 10.1431 139.845 22.5202 139.845C34.8974 139.845 38.8274 134.596 47.0952 125.933C47.4458 125.573 47.7882 125.205 48.1388 124.828C48.8808 126.695 50.2751 129.569 52.8761 132.377C54.7351 134.392 58.7385 138.019 64.9353 139.427C69.0202 140.361 72.5426 139.976 74.8011 139.517C74.8093 139.509 74.8174 139.501 74.8256 139.493C78.4621 138.682 81.5849 136.43 84.9116 132.418C85.9389 131.149 87.1212 129.511 88.4013 127.579C94.6388 118.212 103.485 101.778 111.044 85.4594C111.672 99.2154 112.308 112.963 112.935 126.719C112.968 128.382 113.27 132.459 116.091 135.808C116.531 136.332 117.477 137.429 119.059 138.346C120.722 139.313 122.671 139.837 124.799 139.837C135.798 139.837 144.229 126.023 156.598 93.2299H151.959C141.644 116.885 134.249 127.931 128.925 127.931C123.6 127.931 123.943 126.032 123.772 121.192C122.973 104.046 122.165 86.9005 121.366 69.7464C123.535 64.768 126.136 59.2492 128.933 53.6322C137.005 37.4525 146.691 20.4703 152.309 13.2975C154.715 10.0141 157.12 8.29457 159.525 8.29457C161.93 8.29457 164.165 10.0223 164.165 13.2975C164.165 16.5728 162.102 18.1285 158.669 19.1684C159.696 22.4518 162.452 24.5152 166.056 24.5152C171.389 24.5152 175.343 19.8562 175.343 13.4695C175.343 7.08272 169.155 0.00818862 162.11 0.00818862L162.102 0.0163772ZM102.792 11.9219C105.336 11.9219 106.845 12.9618 107.522 15.4674C107.766 16.3435 107.905 17.4079 107.945 18.6607L108.687 34.6849L110.514 73.906C107.456 80.7267 103.763 88.2352 99.955 95.4735C96.0902 102.818 92.1194 109.893 88.5644 115.714C87.855 116.877 87.162 117.991 86.4852 119.047C84.1125 122.773 80.8185 125.868 76.8477 127.792C74.5565 128.897 72.3469 129.495 70.2514 129.495C63.6144 129.495 59.0728 123.903 57.6541 114.445C57.6541 114.429 57.6541 114.413 57.6541 114.396C57.5889 113.79 57.5807 113.438 57.5807 113.438C74.85 89.4061 89.6407 53.0672 91.8503 22.1161C96.1146 15.2463 99.6777 11.9301 102.784 11.9301L102.792 11.9219ZM74.4913 12.0939C76.5378 8.88411 78.617 7.09091 80.6228 7.09091C83.7211 7.09091 85.6046 10.7182 85.6046 16.933C85.6046 23.1478 85.5639 19.9381 85.4742 21.4856C85.4579 21.7067 85.4497 21.936 85.4334 22.1652C85.3845 22.9922 85.3192 23.8274 85.2459 24.6626C85.2214 24.9574 85.1969 25.2522 85.1725 25.5469C85.0991 26.3248 85.0176 27.1109 84.9279 27.9051C84.8871 28.249 84.8382 28.6011 84.7974 28.945C84.7566 29.3135 84.6996 29.6737 84.6588 30.0422C84.561 30.771 84.455 31.5079 84.3408 32.2448C84.3082 32.4741 84.2756 32.7033 84.2348 32.9326C84.2022 33.1455 84.1696 33.3666 84.1288 33.5795C83.8353 35.3563 83.5091 37.1577 83.1341 38.9754C78.6741 60.895 68.6451 84.9845 57.3524 102.72C57.1975 102.957 57.0426 103.203 56.8876 103.441C56.8876 85.5085 59.0402 66.1354 62.3343 49.4972C65.5957 32.9817 69.9823 19.1602 74.4831 12.1184L74.4913 12.0939Z\"></path>";

  ICONS.search = '<path fill-rule="evenodd" d="M10.5 3a7.5 7.5 0 015.96 12.05l4.74 4.74-1.41 1.41-4.74-4.74A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"/>';
  ICONS.down = '<path d="M6 9h12l-6 7z"/>';
  ICONS.check = '<path d="M9.5 16.2l-4.2-4.2-1.4 1.4 5.6 5.6L21 7.4 19.6 6z"/>';
  ICONS.close = '<path d="M6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/>';

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') for (var s in v) el.style.setProperty(s, v[s]);
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; }
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  function s(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) {
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'class') el.setAttribute('class', attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function f(n, d) { return Number(n).toFixed(d == null ? 1 : d); }
  function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function fade(id, c, x1, x2) {
    return s('linearGradient', { id: id, x1: x1 == null ? 0 : x1, x2: x2 == null ? 1 : x2, y1: 0, y2: 0 },
      s('stop', { offset: 0, style: 'stop-color:' + c + ';stop-opacity:0' }), s('stop', { offset: 0.06, style: 'stop-color:' + c }), s('stop', { offset: 0.94, style: 'stop-color:' + c }), s('stop', { offset: 1, style: 'stop-color:' + c + ';stop-opacity:0' }));
  }
  var uid = 0; function nid(p) { return (p || 'vx') + (++uid); }

  /* ---------- Icon, Mark ---------- */
  function Icon(p) {
    p = p || {};
    var el = s('svg', { viewBox: '0 0 24 24', width: p.size || 24, height: p.size || 24, 'aria-hidden': p.label ? null : 'true', role: p.label ? 'img' : null, 'aria-label': p.label || null, fill: 'currentColor' });
    el.innerHTML = ICONS[p.name] || '';
    return el;
  }
  function Mark(p) {
    p = p || {};
    var el = s('svg', { viewBox: '0 0 176 140', class: 'vl-mark', role: 'img', 'aria-label': p.label || 'VEX' });
    el.innerHTML = MARK;
    if (p.width) el.style.setProperty('--w', p.width + 'px');
    el.style.color = p.tone === 'dark' ? 'var(--page)' : 'var(--ink)';
    return el;
  }

  /* ---------- Actions ---------- */
  function Key(p) {
    p = p || {};
    var cls = 'vl-key' + (p.tone && p.tone !== 'quiet' ? ' vl-key--' + p.tone : '') + (p.size && p.size !== 'composer' ? ' vl-key--' + p.size : '') + (p.loading ? ' is-loading' : '') + (p.state ? ' is-' + p.state : '');
    return h('button', { type: 'button', class: cls, disabled: p.disabled || p.loading, 'aria-busy': p.loading ? 'true' : null, 'aria-label': p.label ? (p.loading ? p.label + ', working' : null) : p.ariaLabel, onclick: p.onClick },
      p.loading ? h('span', { class: 'vl-spin', 'aria-hidden': 'true' }) : null,
      p.icon ? Icon({ name: p.icon }) : null, p.label ? h('span', { class: 'vl-key-t', text: p.label }) : null);
  }
  function Tag(p) {
    p = p || {};
    return h('span', { class: 'vl-tag' + (p.tone ? ' vl-tag--' + p.tone : '') }, p.dot ? h('i') : null, p.label);
  }
  function Tabs(p) {
    p = p || {};
    var items = p.items || [], value = p.value != null ? p.value : (items[0] && items[0].id);
    var root = h('div', { class: 'vl-tabs', role: 'tablist', 'aria-label': p.label || null });
    var btns = items.map(function (it, i) {
      var b = h('button', { type: 'button', role: 'tab', class: 'vl-tab', 'aria-selected': String(it.id === value), tabindex: it.id === value ? '0' : '-1' }, it.label, it.count != null ? h('b', { text: String(it.count) }) : null);
      b.addEventListener('click', function () { pick(i); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); var j = (i + d + items.length) % items.length; pick(j); btns[j].focus(); }
      });
      return b;
    });
    function pick(i) {
      btns.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
      if (p.onChange) p.onChange(items[i].id);
    }
    add(root, btns);
    return root;
  }
  function Chips(p) {
    p = p || {};
    return h('div', { class: 'vl-chips' }, (p.items || []).map(function (it) {
      if (typeof it === 'string') it = { label: it };
      return h('button', { type: 'button', class: 'vl-chip' + (it.state ? ' is-' + it.state : ''), disabled: it.disabled, onclick: function () { if (p.onPick) p.onPick(it.label); } }, it.icon ? Icon({ name: it.icon }) : null, it.label);
    }));
  }

  /* ---------- Chat ---------- */
  function Bubble(p) {
    p = p || {};
    var from = p.from || 'vex';
    var text = h('p', { text: p.text || '' });
    if (from === 'vex' && p.wave) text.classList.add('vl-wave');
    var li = h('li', { class: 'vl-msg vl-msg--' + from }, from === 'you' ? [text, h('span', { class: 'vl-av', 'aria-hidden': 'true', text: p.initials || 'YOU' })] : text);
    return li;
  }
  function Thread(p) {
    return h('ol', { class: 'vl-thread', 'aria-label': 'Conversation with Vex' }, (p.messages || []).map(Bubble));
  }
  function Composer(p) {
    p = p || {};
    var input = h('input', { type: 'text', 'aria-label': 'Message Vex', placeholder: p.busy ? 'Vex is working. Enter hurries her' : (p.placeholder || 'Ask Vex to trade, bridge or check a price'), autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'send' });
    var send = Key({ tone: 'blue', icon: p.busy ? 'stop' : 'send', label: p.busy ? 'Stop' : 'Send', onClick: function () { if (p.onSend) p.onSend(input.value); input.value = ''; } });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send.click(); });
    return h('form', { class: 'vl-composer' + (p.busy ? ' is-busy' : ''), onsubmit: function (e) { e.preventDefault(); } },
      Key({ icon: 'rail-plus', label: 'New chat', onClick: p.onNew }), input, send);
  }

  var GLYPHS = 'VEX/<>\\_-=+#01';
  function decode(el, text, ms, done) {
    if (reduced()) { el.textContent = text; if (done) done(); return; }
    var t0 = performance.now();
    (function tick(now) {
      var k = Math.min(1, (now - t0) / ms), n = Math.floor(text.length * k), out = text.slice(0, n);
      for (var i = n; i < Math.min(text.length, n + 6); i++) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
      if (k < 1) requestAnimationFrame(tick); else { el.textContent = text; if (done) done(); }
    })(t0);
  }
  var KIND = { m: 'Model', t: 'Tool', r: 'Runtime' };
  function Reasoning(p) {
    p = p || {};
    var steps = p.steps || [];
    var sec = h('span', { class: 'vl-rz-sec', text: String(p.seconds || 0) + 's' });
    var spin = h('span', { class: 'vl-rz-spin', 'aria-hidden': 'true' });
    var label = h('span', null, 'Reasoned for ', sec);
    var head = h('button', { type: 'button', class: 'vl-rz-head', 'aria-expanded': 'true' }, Icon({ name: 'chev' }), label, spin);
    var list = h('ol', { class: 'vl-rz-list' });
    var body = h('div', { class: 'vl-rz-body' }, list);
    var root = h('section', { class: 'vl-rz is-open', 'aria-label': 'Vex reasoning' }, head, body);
    var rows = steps.map(function (st) {
      var x = h('span', { class: 'vl-rz-x', text: st.text });
      var r = h('li', { class: 'vl-rz-s vl-k-' + st.kind }, h('span', { class: 'vl-rz-k', text: KIND[st.kind] || st.kind }), x);
      r._x = x; r._t = st.text; return r;
    });
    add(list, rows);
    function fold(open) {
      root.classList.toggle('is-open', open); head.setAttribute('aria-expanded', String(open));
      var from = body.offsetHeight, to = open ? list.offsetHeight : 0;
      if (body.animate && !reduced()) body.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: 420, easing: 'cubic-bezier(0.625,0.05,0,1)', fill: 'forwards' }).onfinish = function () { body.style.height = open ? 'auto' : '0px'; };
      else body.style.height = open ? 'auto' : '0px';
    }
    head.addEventListener('click', function () { fold(!root.classList.contains('is-open')); });
    if (p.folded) { body.style.height = '0px'; root.classList.remove('is-open'); head.setAttribute('aria-expanded', 'false'); }
    root.play = function () {
      var t0 = performance.now(), i = 0, frames = ['▖', '▘', '▝', '▗'], f0 = 0, live = true;
      root.classList.add('is-open'); body.style.height = 'auto';
      label.firstChild.textContent = 'Reasoning ';
      rows.forEach(function (r) { r.classList.add('is-wait'); r.classList.remove('is-now'); });
      var clock = setInterval(function () {
        sec.textContent = f(((performance.now() - t0) / 1000), 1) + 's';
        spin.textContent = live ? frames[f0++ % 4] : '';
      }, 90);
      (function next() {
        if (i >= rows.length) {
          live = false; clearInterval(clock);
          var t = Math.max(1, Math.round((performance.now() - t0) / 1000));
          label.firstChild.textContent = 'Reasoned for '; sec.textContent = t + 's'; spin.textContent = '';
          rows.forEach(function (r) { r.classList.remove('is-now'); });
          if (p.foldAtEnd !== false) setTimeout(function () { fold(false); }, 700);
          if (p.onDone) p.onDone(t);
          return;
        }
        var r = rows[i++];
        rows.forEach(function (o) { o.classList.remove('is-now'); });
        r.classList.remove('is-wait'); r.classList.add('is-now');
        decode(r._x, r._t, Math.min(900, 260 + r._t.length * 12), function () { setTimeout(next, 240); });
      })();
    };
    if (p.autoplay) requestAnimationFrame(root.play);
    return root;
  }

  function OrderCard(p) {
    p = p || {};
    var status = p.status || 'Cleared';
    var tone = p.tone || (/block|refus|fail/i.test(status) ? 'err' : /sim|dev/i.test(status) ? 'dev' : 'ink');
    var rows = (p.rows || []).map(function (r) {
      var dd = h('dd'); if (Array.isArray(r[1])) { add(dd, r[1][0]); add(dd, h('s', { text: ' / ' + r[1][1] })); } else add(dd, r[1]);
      return h('div', { class: 'vl-row vl-scan' }, h('dt', { text: r[0] }), dd);
    });
    var checks = (p.checks || []).map(function (c) {
      return h('li', { class: 'vl-check vl-scan' + (c.ok === false ? ' is-fail' : '') }, Icon({ name: c.ok === false ? 'rail-no' : 'shield' }), h('span', { text: c.label }), h('b', { text: c.ok === false ? 'Fail' : 'Pass' }));
    });
    var root = h('article', { class: 'vl-card', 'aria-label': (p.kind || 'Order') + ': ' + (p.title || '') },
      h('div', { class: 'vl-card-top' }, h('span', { text: p.kind || 'Swap' }), Tag({ label: status, tone: tone })),
      h('p', { class: 'vl-card-title', text: p.title || '' }),
      h('dl', null, rows),
      checks.length ? h('ul', { class: 'vl-checks', 'aria-label': 'Runtime checks' }, checks) : null,
      p.note ? h('p', { class: 'vl-card-note', text: p.note }) : null);
    root.scan = function () {
      var all = rows.concat(checks);
      if (reduced()) { all.forEach(function (r) { r.classList.add('sc-done'); }); return; }
      all.forEach(function (r) { r.classList.remove('sc-go', 'sc-done'); void r.offsetWidth; });
      all.forEach(function (r, i) {
        setTimeout(function () {
          r.classList.add('sc-go');
          setTimeout(function () { r.classList.add('sc-done'); r.classList.remove('sc-go'); }, 960);
        }, 120 * i);
      });
    };
    if (p.scan === false) { rows.concat(checks).forEach(function (r) { r.classList.add('sc-done'); }); }
    else requestAnimationFrame(function () { root.scan(); });
    return root;
  }

  function HistoryRow(p) {
    p = p || {};
    return h('button', { type: 'button', class: 'vl-hrow', 'aria-current': p.current ? 'true' : null, onclick: p.onClick }, Icon({ name: p.icon || 'bubble' }), h('span', { text: p.title || '' }), p.time ? h('time', { text: p.time }) : h('i'));
  }
  function History(p) {
    p = p || {};
    var root = h('nav', { class: 'vl-hist', 'aria-label': 'History' });
    (p.groups || []).forEach(function (g) {
      add(root, h('div', { class: 'vl-hgroup', text: g.label }));
      g.items.forEach(function (it) { add(root, HistoryRow(it)); });
    });
    return root;
  }

  /* ---------- Controls ---------- */
  var RISK = [{ k: 'c', label: 'Conservative', icon: 'guard' }, { k: 'b', label: 'Balanced', icon: 'balance' }, { k: 'a', label: 'Aggressive', icon: 'flame' }];
  function RiskArc(p) {
    p = p || {};
    var W = 440, H = 150, cx = 220, cy = 420, R = 380, r = 318, val = p.value || 'b';
    var span = 19.2, gap = 1.8, a0 = -90 - span * 1.5 - gap;
    function pt(rad, deg) { var a = deg * Math.PI / 180; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; }
    function seg(d1, d2) {
      var A = pt(R, d1), B = pt(R, d2), C = pt(r, d2), D = pt(r, d1);
      return 'M' + f(A[0]) + ' ' + f(A[1]) + 'A' + R + ' ' + R + ' 0 0 1 ' + f(B[0]) + ' ' + f(B[1]) + 'L' + f(C[0]) + ' ' + f(C[1]) + 'A' + r + ' ' + r + ' 0 0 0 ' + f(D[0]) + ' ' + f(D[1]) + 'Z';
    }
    function arc(rad, d1, d2) { var A = pt(rad, d1), B = pt(rad, d2); return 'M' + f(A[0]) + ' ' + f(A[1]) + 'A' + rad + ' ' + rad + ' 0 0 1 ' + f(B[0]) + ' ' + f(B[1]); }
    var gid = nid('rk');
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: p.width || W, height: (p.width || W) * H / W, role: 'radiogroup', 'aria-label': 'Risk strategy' },
      s('defs', null, s('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: 0, x2: W, y1: 0, y2: 0 },
        s('stop', { offset: 0, style: 'stop-color:var(--ink);stop-opacity:0' }), s('stop', { offset: 0.5, style: 'stop-color:var(--ink);stop-opacity:0.24' }), s('stop', { offset: 1, style: 'stop-color:var(--ink);stop-opacity:0' }))));
    svg.style.color = 'var(--ink)';
    add(svg, s('path', { class: 'rk-orb', d: arc(R + 34, -90 - 34, -90 + 34), stroke: 'url(#' + gid + ')' }));
    var ticks = s('g', { 'aria-hidden': 'true' });
    for (var t = -34; t <= 34.01; t += 2) {
      var maj = Math.round((t + 34) / 2) % 5 === 0, A1 = pt(R + 6, -90 + t), B1 = pt(R + (maj ? 18 : 12), -90 + t);
      add(ticks, s('line', { class: 'rk-tick' + (maj ? ' maj' : ''), x1: f(A1[0]), y1: f(A1[1]), x2: f(B1[0]), y2: f(B1[1]) }));
    }
    add(svg, ticks);
    var vb = h('b', { text: '' });
    var segs = RISK.map(function (it, i) {
      var d1 = a0 + i * (span + gap), d2 = d1 + span, mid = (d1 + d2) / 2, c = pt((R + r) / 2, mid);
      var g = s('g', { class: 'rk-seg', role: 'radio', tabindex: '-1', 'aria-label': it.label, 'data-k': it.k },
        s('path', { class: 'rk-body', d: seg(d1, d2) }), s('path', { class: 'rk-edge', d: arc(R - 3, d1 + 0.5, d2 - 0.5) }));
      var ic = s('svg', { class: 'rk-ic', x: f(c[0] - 18), y: f(c[1] - 18), width: 36, height: 36, viewBox: '0 0 24 24' }); ic.innerHTML = ICONS[it.icon] || '';
      add(g, ic);
      g.addEventListener('click', function () { set(it.k, true); });
      g.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
        if (d) { e.preventDefault(); var j = Math.max(0, Math.min(2, i + d)); set(RISK[j].k, true); segs[j].focus(); }
      });
      add(svg, g); return g;
    });
    function set(k, user) {
      val = k;
      segs.forEach(function (g, i) { var on = RISK[i].k === k; g.classList.toggle('on', on); g.setAttribute('aria-checked', String(on)); g.setAttribute('tabindex', on ? '0' : '-1'); });
      vb.textContent = RISK.filter(function (x) { return x.k === k; })[0].label;
      if (user && p.onChange) p.onChange(k);
    }
    set(val);
    var root = h('div', { class: 'vl-risk' }, svg, h('span', { class: 'vl-risk-val', 'aria-live': 'polite' }, vb));
    root.set = set;
    return root;
  }

  function Knob(p) {
    p = p || {};
    var min = p.min || 0, max = p.max == null ? 100 : p.max, step = p.step || 1, v = p.value == null ? min : p.value, S = 132, c = S / 2;
    var A0 = 135, SW = 270;
    var svg = s('svg', { viewBox: '0 0 ' + S + ' ' + S, 'aria-hidden': 'true' });
    var ticks = [];
    for (var i = 0; i <= 40; i++) {
      var a = (A0 + SW * i / 40) * Math.PI / 180, maj = i % 10 === 0, r1 = 58, r2 = maj ? 66 : 63;
      var ln = s('line', { class: 'k-tick' + (maj ? ' maj' : ''), x1: f(c + r1 * Math.cos(a)), y1: f(c + r1 * Math.sin(a)), x2: f(c + r2 * Math.cos(a)), y2: f(c + r2 * Math.sin(a)) });
      ln._i = i; ticks.push(ln); add(svg, ln);
    }
    add(svg, s('circle', { class: 'k-face', cx: c, cy: c, r: 48 }));
    var ptr = s('line', { class: 'k-ptr', x1: c, y1: c - 30, x2: c, y2: c - 47 });
    var ptrD = s('rect', { class: 'k-ptr-d', x: c - 1.5, y: c - 48, width: 3, height: 3 });
    var pg = s('g', null, ptr, ptrD); add(svg, pg);
    var tv = s('text', { class: 'k-v', x: c, y: c + 6 }), tu = s('text', { class: 'k-u', x: c, y: c + 22, text: (p.unit || '').toUpperCase() });
    add(svg, tv); add(svg, tu);
    var root = h('div', { class: 'vl-knob', role: 'slider', tabindex: '0', 'aria-label': p.label || 'Value', 'aria-valuemin': min, 'aria-valuemax': max }, svg, p.label ? h('span', { class: 'vl-knob-l', text: p.label }) : null);
    if (p.size) root.style.setProperty('--size', p.size + 'px');
    function render() {
      var k = (v - min) / (max - min), deg = A0 + SW * k + 90;
      pg.setAttribute('transform', 'rotate(' + f(deg - 360) + ' ' + c + ' ' + c + ')');
      ticks.forEach(function (t) { t.classList.toggle('on', t._i / 40 <= k + 1e-6); });
      var dec = step < 1 ? String(step).split('.')[1].length : 0;
      tv.textContent = f(v, dec); root.setAttribute('aria-valuenow', v); root.setAttribute('aria-valuetext', f(v, dec) + ' ' + (p.unit || ''));
    }
    function set(nv) { nv = Math.round(Math.max(min, Math.min(max, nv)) / step) * step; nv = +nv.toFixed(6); if (nv !== v) { v = nv; render(); if (p.onChange) p.onChange(v); } }
    root.addEventListener('keydown', function (e) {
      var d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
      if (d) { e.preventDefault(); set(v + d * step); } else if (e.key === 'Home') set(min); else if (e.key === 'End') set(max);
    });
    root.addEventListener('pointerdown', function (e) {
      var y0 = e.clientY, v0 = v; root.setPointerCapture(e.pointerId);
      function mv(ev) { set(v0 + (y0 - ev.clientY) / 160 * (max - min)); }
      function up() { root.removeEventListener('pointermove', mv); root.removeEventListener('pointerup', up); }
      root.addEventListener('pointermove', mv); root.addEventListener('pointerup', up);
    });
    root.addEventListener('wheel', function (e) { e.preventDefault(); set(v - Math.sign(e.deltaY) * step); }, { passive: false });
    render();
    return root;
  }

  function LimitSlider(p) {
    p = p || {};
    var min = p.min || 0, max = p.max == null ? 100 : p.max, step = p.step || 1, v = p.value == null ? min : p.value, dec = step < 1 ? String(step).split('.')[1].length : 0;
    var vEl = h('span', { class: 'vl-slider-v' });
    var fill = h('div', { class: 'vl-slider-fill' }), thumb = h('div', { class: 'vl-slider-thumb' });
    var track = h('div', { class: 'vl-slider-track', role: 'slider', tabindex: '0', 'aria-label': p.label || 'Limit', 'aria-valuemin': min, 'aria-valuemax': max }, h('div', { class: 'vl-slider-rail' }), fill, h('div', { class: 'vl-slider-ticks' }), thumb);
    var scale = h('div', { class: 'vl-slider-scale' }, (p.scale || [min, (min + max) / 2, max]).map(function (x) { return h('span', { text: f(x, dec) + (p.unit === '%' ? '%' : '') }); }));
    function render() {
      var k = (v - min) / (max - min) * 100;
      fill.style.width = k + '%'; thumb.style.left = k + '%';
      vEl.textContent = ''; add(vEl, f(v, dec) + (p.unit === '%' ? '%' : ' ' + (p.unit || ''))); if (p.cap != null) add(vEl, h('s', { text: ' / ' + f(p.cap, dec) + (p.unit === '%' ? '%' : '') }));
      track.setAttribute('aria-valuenow', v);
    }
    function set(nv) { nv = Math.round(Math.max(min, Math.min(max, nv)) / step) * step; nv = +nv.toFixed(6); if (nv !== v) { v = nv; render(); if (p.onChange) p.onChange(v); } }
    function at(e) { var b = track.getBoundingClientRect(); set(min + (e.clientX - b.left) / b.width * (max - min)); }
    track.addEventListener('pointerdown', function (e) {
      track.setPointerCapture(e.pointerId); at(e);
      function mv(ev) { at(ev); } function up() { track.removeEventListener('pointermove', mv); track.removeEventListener('pointerup', up); }
      track.addEventListener('pointermove', mv); track.addEventListener('pointerup', up);
    });
    track.addEventListener('keydown', function (e) {
      var d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
      if (d) { e.preventDefault(); set(v + d * step); } else if (e.key === 'Home') set(min); else if (e.key === 'End') set(max);
    });
    render();
    return h('div', { class: 'vl-slider' }, h('div', { class: 'vl-slider-top' }, h('span', { class: 'vl-slider-l', text: p.label || '' }), vEl), track, scale);
  }

  function Toggle(p) {
    p = p || {};
    var on = !!p.on;
    var b = h('button', { type: 'button', role: 'switch', class: 'vl-toggle' + (p.state ? ' is-' + p.state : ''), disabled: p.disabled, 'aria-checked': String(on) }, h('span', { class: 'vl-toggle-box', 'aria-hidden': 'true' }, h('span', { text: 'OFF' }), h('span', { text: 'ON' })), p.label);
    b.addEventListener('click', function () { on = !on; b.setAttribute('aria-checked', String(on)); if (p.onChange) p.onChange(on); });
    return b;
  }

  function CurveEditor(p) {
    p = p || {};
    var W = 560, H = 260, L = 44, R = 12, T = 14, B = 30, pw = W - L - R, ph = H - T - B;
    var xs = p.x || [0, 25, 50, 75, 100], ymax = p.yMax || 3;
    var ys = (p.y || [0.3, 0.5, 0.8, 1.4, 2.4]).slice();
    var gid = nid('hatch');
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': p.label || 'Curve' },
      s('defs', null, s('pattern', { id: gid, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, s('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: 'var(--hatch)', 'stroke-width': 1 }))));
    function X(x) { return L + x / xs[xs.length - 1] * pw; } function Y(y) { return T + ph - y / ymax * ph; }
    for (var gx = 0; gx <= 10; gx++) add(svg, s('line', { class: 'g' + (gx % 5 === 0 ? ' maj' : ''), x1: L + pw * gx / 10, x2: L + pw * gx / 10, y1: T, y2: T + ph }));
    for (var gy = 0; gy <= 6; gy++) add(svg, s('line', { class: 'g' + (gy % 2 === 0 ? ' maj' : ''), x1: L, x2: L + pw, y1: T + ph * gy / 6, y2: T + ph * gy / 6 }));
    for (var ay = 0; ay <= 3; ay++) add(svg, s('text', { class: 'ax', x: L - 8, y: Y(ymax * ay / 3) + 3.5, 'text-anchor': 'end', text: f(ymax * ay / 3, 1) + '%' }));
    xs.forEach(function (x, i) { add(svg, s('text', { class: 'ax', x: X(x), y: H - 10, 'text-anchor': i === 0 ? 'start' : i === xs.length - 1 ? 'end' : 'middle', text: (p.xLabels || [])[i] || String(x) })); });
    var under = s('path', { fill: 'url(#' + gid + ')' }), curve = s('path', { class: 'c' });
    add(svg, under); add(svg, curve);
    var stems = [], handles = [], reads = [];
    xs.forEach(function (x, i) {
      var st = s('line', { class: 'stem' }), hd = s('rect', { class: 'h', width: 9, height: 9, tabindex: '0', role: 'slider', 'aria-label': ((p.xLabels || [])[i] || x) + ' point', 'aria-valuemin': 0, 'aria-valuemax': ymax }), rd = s('text', { class: 'read', 'text-anchor': 'middle' });
      stems.push(st); handles.push(hd); reads.push(rd); add(svg, st); add(svg, rd); add(svg, hd);
      hd.addEventListener('keydown', function (e) { var d = e.key === 'ArrowUp' ? 0.1 : e.key === 'ArrowDown' ? -0.1 : 0; if (d) { e.preventDefault(); setY(i, ys[i] + d); } });
      hd.addEventListener('pointerdown', function (e) {
        e.preventDefault(); hd.classList.add('is-drag'); svg.setPointerCapture(e.pointerId);
        function mv(ev) { var b = svg.getBoundingClientRect(), yy = (ev.clientY - b.top) / b.height * H; setY(i, (T + ph - yy) / ph * ymax); }
        function up() { hd.classList.remove('is-drag'); svg.removeEventListener('pointermove', mv); svg.removeEventListener('pointerup', up); }
        svg.addEventListener('pointermove', mv); svg.addEventListener('pointerup', up);
      });
    });
    function setY(i, y) { ys[i] = Math.max(0, Math.min(ymax, Math.round(y * 10) / 10)); render(); if (p.onChange) p.onChange(ys.slice()); }
    function path() {
      var P = xs.map(function (x, i) { return [X(x), Y(ys[i])]; }), d = 'M' + f(P[0][0]) + ' ' + f(P[0][1]);
      for (var i = 0; i < P.length - 1; i++) {
        var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
        d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
      }
      return d;
    }
    function render() {
      var d = path(); curve.setAttribute('d', d);
      under.setAttribute('d', d + 'L' + X(xs[xs.length - 1]) + ' ' + (T + ph) + 'L' + X(xs[0]) + ' ' + (T + ph) + 'Z');
      xs.forEach(function (x, i) {
        var px = X(x), py = Y(ys[i]);
        handles[i].setAttribute('x', f(px - 4.5)); handles[i].setAttribute('y', f(py - 4.5)); handles[i].setAttribute('aria-valuenow', ys[i]);
        stems[i].setAttribute('x1', px); stems[i].setAttribute('x2', px); stems[i].setAttribute('y1', py + 6); stems[i].setAttribute('y2', T + ph);
        reads[i].setAttribute('x', Math.max(L + 14, Math.min(L + pw - 14, px))); reads[i].setAttribute('y', py - 10); reads[i].textContent = f(ys[i], 1) + '%';
      });
    }
    render();
    return h('div', { class: 'vl-curve' }, svg);
  }

  /* ---------- Data ---------- */
  function PanelHeader(p) {
    p = p || {};
    return h('div', null, h('div', { class: 'vl-ph' }, h('span', { class: 'vl-ph-code', text: p.code || 'VEX' }), h('span', { class: 'vl-ph-title', text: p.title || '' }), h('span', { class: 'vl-ph-meta' }, (p.meta || []).map(function (m) { return h('span', { text: m }); }))), p.ruler !== false ? h('div', { class: 'vl-ph-ruler', 'aria-hidden': 'true' }) : null);
  }
  function Panel(p) {
    p = p || {};
    return h('section', { class: 'vl-panel', 'aria-label': p.title || null }, PanelHeader(p), h('div', { class: 'vl-pb' }, p.children || null));
  }
  function IndexTile(p) {
    p = p || {};
    var tag = p.onClick || p.pressed != null ? 'button' : 'div';
    return h(tag, { class: 'vl-tile', type: tag === 'button' ? 'button' : null, 'aria-pressed': p.pressed != null ? String(!!p.pressed) : null, onclick: p.onClick },
      h('span', { class: 'vl-tile-top' }, h('span', { text: p.label || '' }), h('span', { text: p.meta || '' })),
      h('span', { class: 'vl-tile-code', text: p.code || '' }),
      h('span', { class: 'vl-tile-foot' }, h('span', { text: p.value || '' }), h('i', { class: 'vl-tile-dot ' + (p.state || ''), 'aria-label': p.state || null })));
  }
  function IndexGrid(p) {
    var g = h('div', { class: 'vl-tiles' }, (p.tiles || []).map(IndexTile));
    g.style.setProperty('--cols', p.cols || 4);
    return g;
  }
  function spark(vals, w, hh) {
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    return vals.map(function (v, i) { return (i ? 'L' : 'M') + f(i / (vals.length - 1) * w) + ' ' + f(hh - 1 - (v - mn) / (mx - mn || 1) * (hh - 2)); }).join('');
  }
  function StatBlock(p) {
    p = p || {};
    var d = p.delta;
    return h('div', { class: 'vl-stat' },
      h('div', { class: 'vl-stat-code' }, h('span', { class: 'vl-micro', text: p.group || 'IDX' }), h('b', { text: p.code || '' })),
      h('div', { class: 'vl-stat-main' }, h('span', { class: 'vl-field', text: p.label || '' }),
        h('span', { class: 'vl-stat-v' }, p.value, p.unit ? h('small', { text: p.unit }) : null),
        h('span', { class: 'vl-stat-foot' }, d != null ? h('span', { class: 'vl-stat-d ' + (d > 0 ? 'up' : d < 0 ? 'down' : ''), text: (d > 0 ? '+' : d < 0 ? '−' : '') + Math.abs(d) + (p.deltaUnit || '%') }) : h('span'),
          p.spark ? (function () { var sv = s('svg', { class: 'vl-spark', viewBox: '0 0 120 28', 'aria-hidden': 'true' }, s('path', { d: spark(p.spark, 120, 28) })); return sv; })() : null)));
  }
  function HatchProgress(p) {
    p = p || {};
    var max = p.max || 100, v = p.value || 0, k = Math.min(1, v / max), dec = p.decimals || 0;
    var st = k >= 1 ? ' is-over' : k >= (p.warnAt || 0.85) ? ' is-near' : '';
    var fill = h('div', { class: 'vl-prog-fill' }); fill.style.width = (k * 100) + '%';
    return h('div', { class: 'vl-prog' + st, role: 'meter', 'aria-label': p.label || '', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': v },
      h('div', { class: 'vl-prog-top' }, h('span', { class: 'vl-field', text: p.label || '' }), h('span', { class: 'vl-prog-v' }, f(v, dec) + (p.unit ? ' ' + p.unit : ''), h('s', { text: ' / ' + f(max, dec) }))),
      h('div', { class: 'vl-prog-bar' }, fill),
      p.ruler !== false ? h('div', { class: 'vl-prog-scale' }, h('span', { text: '0' }), h('span', { text: f(max / 2, dec) }), h('span', { text: f(max, dec) })) : null);
  }
  function MeterBars(p) {
    p = p || {};
    var bars = p.bars || [], max = p.max || Math.max.apply(null, bars.map(function (b) { return b.value; })), hh = p.height || 160;
    var plot = h('div', { class: 'vl-meters-plot', role: 'img', 'aria-label': p.label || 'Bars' });
    bars.forEach(function (b, i) {
      var el = h('div', { class: 'vl-meter' + (b.now ? ' is-now' : '') + (p.cap != null && b.value > p.cap ? ' is-over' : ''), title: b.label + ': ' + b.value });
      el.style.setProperty('--v', Math.min(100, b.value / max * 100) + '%'); add(plot, el);
    });
    if (p.cap != null) { var cap = h('div', { class: 'vl-meters-cap' }, h('span', { text: p.capLabel || 'Cap ' + p.cap })); cap.style.bottom = (p.cap / max * 100) + '%'; add(plot, cap); }
    var root = h('div', { class: 'vl-meters' },
      h('div', { class: 'vl-meters-axis', 'aria-hidden': 'true' }, [4, 3, 2, 1, 0].map(function (i) { return h('span', { text: f(max * i / 4, 0) }); })),
      plot, h('div', { class: 'vl-meters-x', 'aria-hidden': 'true' }, bars.map(function (b) { return h('span', { text: b.label }); })));
    root.style.setProperty('--h', hh + 'px');
    return root;
  }
  function AreaChart(p) {
    p = p || {};
    var W = 640, H = 240, L = 44, R = 8, T = 12, B = 26, pw = W - L - R, ph = H - T - B;
    var a = p.series || [], b = p.compare || null, n = a.length, ymax = p.yMax || Math.max.apply(null, a.concat(b || [], [p.limit || 0])) * 1.15;
    function X(i) { return L + i / (n - 1) * pw; } function Y(v) { return T + ph - v / ymax * ph; }
    var gid = nid('ah'), fid = nid('af');
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': p.label || 'Chart' },
      s('defs', null,
        s('pattern', { id: gid, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, s('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: 'var(--hatch)', 'stroke-width': 1 })),
        fade(fid, 'var(--rule)'), fade(fid + 'e', 'var(--err)')));
    var grid = s('g');
    for (var g = 0; g <= 4; g++) add(grid, s('rect', { x: L, y: f(T + ph * g / 4), width: pw, height: 1, fill: 'url(#' + fid + ')' }));
    add(svg, grid);
    for (var t = 0; t <= 4; t++) add(svg, s('text', { class: 'ax', x: L - 8, y: f(Y(ymax * t / 4) + 3.5), 'text-anchor': 'end', text: (p.format || function (v) { return f(v, 0); })(ymax * t / 4) }));
    (p.labels || []).forEach(function (lb, i) { if (lb) add(svg, s('text', { class: 'ax', x: f(X(i)), y: H - 8, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle', text: lb })); });
    function line(vals) { return vals.map(function (v, i) { return (i ? 'L' : 'M') + f(X(i)) + ' ' + f(Y(v)); }).join(''); }
    add(svg, s('path', { d: line(a) + 'L' + f(X(n - 1)) + ' ' + f(T + ph) + 'L' + L + ' ' + f(T + ph) + 'Z', fill: 'url(#' + gid + ')' }));
    if (b) add(svg, s('path', { class: 'line2', d: line(b) }));
    add(svg, s('path', { class: 'line', d: line(a) }));
    if (p.limit != null) {
      var ly = f(Y(p.limit));
      var lg = s('g', null, s('rect', { x: L, y: ly, width: pw, height: 1, fill: 'url(#' + fid + 'e)' }));
      add(svg, lg);
      add(svg, s('text', { class: 'lim-t', x: L + pw - 4, y: ly - 6, 'text-anchor': 'end', text: (p.limitLabel || 'LIMIT').toUpperCase() }));
    }
    var cur = s('line', { class: 'vl-cur', y1: T, y2: T + ph, visibility: 'hidden' }), dot = s('rect', { class: 'dot', width: 5, height: 5, visibility: 'hidden' });
    var tip = s('g', { visibility: 'hidden' }), tipR = s('rect', { class: 'tip', height: 22, width: 80 }), tipT = s('text', { class: 'tip-t', y: 15 });
    add(tip, tipR); add(tip, tipT); add(svg, cur); add(svg, dot); add(svg, tip);
    function show(i) {
      var x = X(i), y = Y(a[i]); [cur, dot, tip].forEach(function (e) { e.setAttribute('visibility', 'visible'); });
      cur.setAttribute('x1', x); cur.setAttribute('x2', x); dot.setAttribute('x', f(x - 2.5)); dot.setAttribute('y', f(y - 2.5));
      tipT.textContent = ((p.labels || [])[i] || '#' + i) + '  ' + (p.format || function (v) { return f(v, 0); })(a[i]);
      var tw = tipT.getComputedTextLength ? tipT.getComputedTextLength() + 16 : 90; tipR.setAttribute('width', f(tw));
      tipT.setAttribute('x', 8); var tx = Math.min(L + pw - tw, Math.max(L, x + 8)); tip.setAttribute('transform', 'translate(' + f(tx) + ' ' + f(Math.max(T, y - 32)) + ')');
    }
    svg.addEventListener('pointermove', function (e) { var bb = svg.getBoundingClientRect(), x = (e.clientX - bb.left) / bb.width * W; show(Math.max(0, Math.min(n - 1, Math.round((x - L) / pw * (n - 1))))); });
    svg.addEventListener('pointerleave', function () { [cur, dot, tip].forEach(function (e) { e.setAttribute('visibility', 'hidden'); }); });
    var leg = h('div', { class: 'vl-legend' }, h('span', null, h('i'), p.seriesLabel || 'Series'), b ? h('span', null, h('i', { class: 'l2' }), p.compareLabel || 'Compare') : null, p.limit != null ? h('span', null, h('i', { class: 'lim' }), p.limitLabel || 'Limit') : null);
    var root = h('figure', { class: 'vl-area', style: { margin: '0' } }, svg, leg);
    if (p.hover != null) requestAnimationFrame(function () { show(p.hover); });
    return root;
  }
  function Pill(p) { return h('span', { class: 'vl-pill ' + (p.tone || 'quiet') }, h('i'), p.label); }
  function StatusTable(p) {
    p = p || {};
    var cols = p.columns || [];
    return h('table', { class: 'vl-table' },
      p.caption ? h('caption', { class: 'vl-micro', style: { 'text-align': 'left', 'padding-bottom': '8px' }, text: p.caption }) : null,
      h('thead', null, h('tr', null, cols.map(function (c) { return h('th', { class: c.align === 'right' ? 'n' : null, scope: 'col', text: c.label }); }))),
      h('tbody', null, (p.rows || []).map(function (r) {
        return h('tr', { class: r.fail ? 'is-fail' : null }, cols.map(function (c) {
          var v = r[c.key];
          return h('td', { class: c.align === 'right' ? 'n' : c.muted ? 'm' : null }, v && typeof v === 'object' && v.tone ? Pill(v) : v);
        }));
      })));
  }
  function Ledger(p) {
    p = p || {};
    return h('ul', { class: 'vl-ledger', 'aria-label': p.label || 'Addresses' }, (p.rows || []).map(function (r) {
      return h('li', { class: 'vl-lrow' }, h('span', { class: 'vl-lrow-ic' }, Icon({ name: r.icon || 'vault' })),
        h('span', { class: 'vl-lrow-name' }, h('b', { text: r.name }), h('code', { text: r.address })),
        h('span', { class: 'vl-lrow-amt', text: r.amount || '' }), r.state ? Pill(r.state) : h('span'));
    }));
  }
  function HexGrid(p) {
    p = p || {};
    var cells = p.cells || [], cols = p.cols || 6, rr = 30, w = Math.sqrt(3) * rr, rows = Math.ceil(cells.length / cols);
    var W = cols * w + w / 2 + 2, H = rows * rr * 1.5 + rr / 2 + 2;
    var svg = s('svg', { viewBox: '-1 -1 ' + f(W) + ' ' + f(H), role: 'img', 'aria-label': p.label || 'Coverage' });
    cells.forEach(function (c, i) {
      var row = Math.floor(i / cols), col = i % cols, cx = w / 2 + col * w + (row % 2 ? w / 2 : 0), cy = rr + row * rr * 1.5, pts = [];
      for (var k = 0; k < 6; k++) { var an = (60 * k - 30) * Math.PI / 180; pts.push(f(cx + (rr - 1) * Math.cos(an)) + ',' + f(cy + (rr - 1) * Math.sin(an))); }
      var g = s('g', null, s('title', { text: c.label + (c.note ? ': ' + c.note : '') }), s('polygon', { class: 'hx ' + (c.state || ''), points: pts.join(' ') }), s('text', { class: 'hx-t' + (c.state ? '' : ' off'), x: f(cx), y: f(cy), text: c.code }));
      add(svg, g);
    });
    return h('div', { class: 'vl-hexes' }, svg);
  }
  function Scope(p) {
    p = p || {};
    var S = 320, c = S / 2, R = 140;
    var gid = nid('sw');
    var svg = s('svg', { viewBox: '0 0 ' + S + ' ' + S, role: 'img', 'aria-label': p.label || 'Scope' },
      s('defs', null, s('linearGradient', { id: gid, x1: 0, x2: 1, y1: 0, y2: 0 }, s('stop', { offset: 0, style: 'stop-color:var(--ink-2);stop-opacity:0' }), s('stop', { offset: 1, style: 'stop-color:var(--ink-2)' }))));
    var g = s('g', { transform: 'translate(' + c + ' ' + c + ')' }); add(svg, g);
    [0.25, 0.5, 0.75, 1].forEach(function (k, i) { add(g, s('circle', { class: 'ring' + (k === 1 ? ' out' : ''), r: R * k })); add(g, s('text', { class: 'lab', x: 4, y: -R * k - 4, text: (p.ringLabels || [])[i] || '' })); });
    if (p.limit != null) add(g, s('circle', { class: 'ring lim', r: R * p.limit }));
    add(g, s('line', { class: 'cross', x1: -R, x2: R, y1: 0, y2: 0 })); add(g, s('line', { class: 'cross', x1: 0, x2: 0, y1: -R, y2: R }));
    for (var d = 0; d < 360; d += 5) { var a = d * Math.PI / 180, maj = d % 45 === 0, r2 = R + (maj ? 10 : 5); add(g, s('line', { class: 'deg' + (maj ? ' maj' : ''), x1: f(R * Math.cos(a)), y1: f(R * Math.sin(a)), x2: f(r2 * Math.cos(a)), y2: f(r2 * Math.sin(a)) })); }
    if (!reduced() && p.sweep !== false) { var sw = s('g', { class: 'sweep' }, s('rect', { x: 0, y: 0, width: R, height: 1, fill: 'url(#' + gid + ')' })); add(g, sw); }
    (p.blips || []).forEach(function (b) {
      var a = (b.angle - 90) * Math.PI / 180, x = b.r * R * Math.cos(a), y = b.r * R * Math.sin(a);
      add(g, s('rect', { class: 'blip ' + (b.tone || ''), x: f(x - 3), y: f(y - 3), width: 6, height: 6 }));
      add(g, s('text', { class: 'blip-t', x: f(x + 8), y: f(y + 4), text: b.label }));
    });
    return h('div', { class: 'vl-scope' }, svg);
  }

  function IconGrid(p) {
    p = p || {};
    var names = p.names || Object.keys(ICONS);
    return h('div', { class: 'vl-icons' }, names.map(function (n) { return h('div', { class: 'vl-icon-cell' }, Icon({ name: n }), h('span', { text: n })); }));
  }


  /* ---------- Base controls: the only components that follow --radius-base ---------- */
  function Field(p) {
    p = p || {};
    var id = nid('fld');
    var input = h('input', { id: id, class: 'vl-field-in', type: p.type || 'text', value: p.value || '', placeholder: p.placeholder || '', autocomplete: 'off', spellcheck: 'false', 'aria-invalid': p.error ? 'true' : null, 'aria-describedby': p.hint || p.error ? id + 'h' : null, disabled: p.disabled });
    if (p.onInput) input.addEventListener('input', function () { p.onInput(input.value); });
    var box = h('span', { class: 'vl-fbox' }, p.icon ? Icon({ name: p.icon }) : null, input, p.suffix ? h('span', { class: 'vl-fsuf', text: p.suffix }) : null);
    return h('div', { class: 'vl-fld' + (p.error ? ' is-err' : '') + (p.state ? ' is-' + p.state : '') + (p.disabled ? ' is-disabled' : '') },
      p.label ? h('label', { class: 'vl-flabel', for: id, text: p.label }) : null, box,
      p.error || p.hint ? h('span', { class: 'vl-fhint', id: id + 'h', text: p.error || p.hint }) : null);
  }

  function Search(p) {
    p = p || {};
    var items = p.items || [], act = -1, hits = [];
    var input = h('input', { type: 'search', class: 'vl-field-in', placeholder: p.placeholder || 'Search', 'aria-label': p.label || 'Search', autocomplete: 'off', spellcheck: 'false', role: 'combobox', 'aria-expanded': 'false', 'aria-autocomplete': 'list' });
    var clear = h('button', { type: 'button', class: 'vl-sclear', 'aria-label': 'Clear search', hidden: true }, Icon({ name: 'close' }));
    var kbd = h('kbd', { class: 'vl-kbd', text: p.shortcut || '/' });
    var list = h('ul', { class: 'vl-menu vl-sres', role: 'listbox', hidden: true });
    var lid = nid('sres'); list.id = lid; input.setAttribute('aria-controls', lid);
    var root = h('div', { class: 'vl-search' }, h('span', { class: 'vl-fbox' }, Icon({ name: 'search' }), input, clear, kbd), list);
    function render() {
      var q = input.value.trim().toLowerCase();
      clear.hidden = !q; kbd.hidden = !!q;
      hits = q ? items.filter(function (it) { return (it.label + ' ' + (it.meta || '')).toLowerCase().indexOf(q) > -1; }).slice(0, 6) : [];
      list.textContent = '';
      if (q && !hits.length) add(list, h('li', { class: 'vl-mempty', text: 'Nothing matches “' + input.value.trim() + '”' }));
      hits.forEach(function (it, i) {
        var li = h('li', { class: 'vl-mitem', role: 'option', id: lid + '-' + i, 'aria-selected': String(i === act) }, it.icon ? Icon({ name: it.icon }) : null, h('span', { text: it.label }), it.meta ? h('small', { text: it.meta }) : null);
        li.addEventListener('mousedown', function (e) { e.preventDefault(); pick(i); });
        add(list, li);
      });
      var open = !!q; list.hidden = !open; input.setAttribute('aria-expanded', String(open));
      input.setAttribute('aria-activedescendant', act > -1 && hits[act] ? lid + '-' + act : '');
    }
    function pick(i) { var it = hits[i]; if (!it) return; input.value = it.label; act = -1; hits = []; list.hidden = true; input.setAttribute('aria-expanded', 'false'); clear.hidden = false; kbd.hidden = true; if (p.onPick) p.onPick(it); }
    input.addEventListener('input', function () { act = -1; render(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && hits.length) { e.preventDefault(); act = (act + 1) % hits.length; render(); }
      else if (e.key === 'ArrowUp' && hits.length) { e.preventDefault(); act = (act - 1 + hits.length) % hits.length; render(); }
      else if (e.key === 'Enter' && act > -1) { e.preventDefault(); pick(act); }
      else if (e.key === 'Escape') { input.value = ''; act = -1; render(); }
    });
    input.addEventListener('blur', function () { setTimeout(function () { list.hidden = true; input.setAttribute('aria-expanded', 'false'); }, 120); });
    input.addEventListener('focus', function () { if (input.value.trim()) render(); });
    clear.addEventListener('click', function () { input.value = ''; act = -1; render(); input.focus(); });
    if (p.value) { input.value = p.value; render(); list.hidden = !p.open; }
    return root;
  }

  function Dropdown(p) {
    p = p || {};
    var opts = (p.options || []).map(function (o) { return typeof o === 'string' ? { value: o, label: o } : o; });
    var val = p.value != null ? p.value : (opts[0] && opts[0].value), act = 0, open = false;
    var lid = nid('dd');
    var lab = h('span', { class: 'vl-ddv' });
    var btn = h('button', { type: 'button', disabled: p.disabled, class: 'vl-ddbtn' + (p.state ? ' is-' + p.state : ''), 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-controls': lid, 'aria-label': p.label ? null : 'Choose' }, p.label ? h('span', { class: 'vl-ddl', text: p.label }) : null, lab, Icon({ name: 'down' }));
    var list = h('ul', { class: 'vl-menu', role: 'listbox', id: lid, tabindex: '-1', hidden: true, 'aria-label': p.label || null });
    var root = h('div', { class: 'vl-dd' + (p.block ? ' is-block' : '') }, btn, list);
    function cur() { return opts.filter(function (o) { return o.value === val; })[0]; }
    function render() {
      var c = cur(); lab.textContent = c ? c.label : (p.placeholder || 'Choose');
      list.textContent = '';
      opts.forEach(function (o, i) {
        var li = h('li', { class: 'vl-mitem', role: 'option', id: lid + '-' + i, 'aria-selected': String(o.value === val), 'data-act': i === act ? '1' : null }, o.icon ? Icon({ name: o.icon }) : null, h('span', { text: o.label }), o.meta ? h('small', { text: o.meta }) : null, o.value === val ? h('i', { class: 'vl-mcheck' }, Icon({ name: 'check' })) : null);
        li.addEventListener('mousedown', function (e) { e.preventDefault(); choose(i); });
        li.addEventListener('mousemove', function () { if (act !== i) { act = i; render(); } });
        add(list, li);
      });
      list.setAttribute('aria-activedescendant', lid + '-' + act);
    }
    function setOpen(v) {
      open = v; list.hidden = !v; btn.setAttribute('aria-expanded', String(v)); root.classList.toggle('is-open', v);
      if (v) { act = Math.max(0, opts.indexOf(cur())); render(); list.focus(); } else btn.focus();
    }
    function choose(i) { val = opts[i].value; render(); setOpen(false); if (p.onChange) p.onChange(val); }
    btn.addEventListener('click', function () { setOpen(!open); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); } });
    list.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(opts.length - 1, act + 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); render(); }
      else if (e.key === 'Home') { e.preventDefault(); act = 0; render(); }
      else if (e.key === 'End') { e.preventDefault(); act = opts.length - 1; render(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(act); }
      else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); }
    });
    list.addEventListener('blur', function () { setTimeout(function () { if (open && !root.contains(document.activeElement)) { open = false; list.hidden = true; btn.setAttribute('aria-expanded', 'false'); root.classList.remove('is-open'); } }, 0); });
    render();
    if (p.open) requestAnimationFrame(function () { open = true; list.hidden = false; btn.setAttribute('aria-expanded', 'true'); root.classList.add('is-open'); });
    return root;
  }

  /* the corner of every base control: 'square' | 'sm' | 'md' | 'pill'. Frames, cards, panels and data never round. */
  function setRadius(r, el) { (el || document.documentElement).setAttribute('data-radius', r || 'square'); }

  window.VEX = {
    Key: Key, Tag: Tag, Tabs: Tabs, Chips: Chips,
    Bubble: Bubble, Thread: Thread, Composer: Composer, Reasoning: Reasoning, OrderCard: OrderCard, HistoryRow: HistoryRow, History: History,
    RiskArc: RiskArc, Knob: Knob, LimitSlider: LimitSlider, Toggle: Toggle, CurveEditor: CurveEditor,
    PanelHeader: PanelHeader, Panel: Panel, IndexTile: IndexTile, IndexGrid: IndexGrid, StatBlock: StatBlock, HatchProgress: HatchProgress, MeterBars: MeterBars, AreaChart: AreaChart, StatusTable: StatusTable, Pill: Pill, Ledger: Ledger, HexGrid: HexGrid, Scope: Scope,
    Field: Field, Search: Search, Dropdown: Dropdown, setRadius: setRadius,
    Mark: Mark, Icon: Icon, IconGrid: IconGrid,
    icons: Object.keys(ICONS), h: h
  };
  /* the Tactical Design System: VEX is the first product on it, TDS the same library by its system name */
  window.TDS = window.VEX;
})();
