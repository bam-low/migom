(function () {
    'use strict';

    var canvas, g;
    var dpr = 1, scale = 1, ox = 0, oy = 0, cw = 0, ch = 0, lastW = 0, lastH = 0;
    var FONT = '"Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif';

    var E = MG.engine = {
        g: null,
        pointer: { x: MG.W / 2, y: 640, down: false },
        handlers: null,
        particles: [],
        shakeT: 0,
        shakeDur: 1,
        shakeAmp: 0
    };

    function toVirtual(e) {
        return { x: (e.clientX - ox) / scale, y: (e.clientY - oy) / scale };
    }

    function onDown(e) {
        e.preventDefault();
        if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* не критично */ } }
        var p = toVirtual(e);
        E.pointer.x = p.x; E.pointer.y = p.y; E.pointer.down = true;
        // Фактический способ ввода важнее заявленного типа устройства (ноутбук с тачскрином, телефон с мышью).
        if (e.pointerType) MG.touch = e.pointerType !== 'mouse';
        if (E.onAnyDown) E.onAnyDown();
        if (!MG.paused && E.handlers && E.handlers.down) E.handlers.down(p.x, p.y);
    }

    function onMove(e) {
        var p = toVirtual(e);
        E.pointer.x = p.x; E.pointer.y = p.y;
        if (!MG.paused && E.handlers && E.handlers.move) E.handlers.move(p.x, p.y);
    }

    function onUp(e) {
        var p = toVirtual(e);
        var wasDown = E.pointer.down;
        E.pointer.down = false;
        if (wasDown && !MG.paused && E.handlers && E.handlers.up) E.handlers.up(p.x, p.y);
    }

    E.init = function (el) {
        canvas = el;
        g = E.g = canvas.getContext('2d');
        window.addEventListener('resize', E.resize);
        window.addEventListener('orientationchange', E.resize);
        E.resize();

        if (window.PointerEvent) {
            canvas.addEventListener('pointerdown', onDown);
            canvas.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);
        } else {
            // Старые браузеры (iOS до 13) не знают Pointer Events — слушаем касания и мышь напрямую.
            var wrap = function (handler, type) {
                return function (ev) {
                    var src = ev.changedTouches ? ev.changedTouches[0] : ev;
                    handler({
                        clientX: src.clientX, clientY: src.clientY, pointerType: type,
                        preventDefault: function () { ev.preventDefault(); }
                    });
                };
            };
            canvas.addEventListener('touchstart', wrap(onDown, 'touch'), { passive: false });
            canvas.addEventListener('touchmove', wrap(onMove, 'touch'), { passive: false });
            window.addEventListener('touchend', wrap(onUp, 'touch'));
            window.addEventListener('touchcancel', wrap(onUp, 'touch'));
            canvas.addEventListener('mousedown', wrap(onDown, 'mouse'));
            canvas.addEventListener('mousemove', wrap(onMove, 'mouse'));
            window.addEventListener('mouseup', wrap(onUp, 'mouse'));
        }

        // Требования 1.6.1.8, 1.6.2.7 и 1.10.2: без контекстного меню, выделения и прокрутки страницы.
        ['contextmenu', 'selectstart', 'dragstart', 'gesturestart'].forEach(function (name) {
            document.addEventListener(name, function (e) { e.preventDefault(); });
        });
        document.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    };

    E.resize = function () {
        // Размер берём у самого холста: в некоторых WebView window.innerWidth запаздывает или не совпадает с вёрсткой.
        var w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        lastW = w;
        lastH = h;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cw = Math.round(w * dpr);
        ch = Math.round(h * dpr);
        canvas.width = cw;
        canvas.height = ch;
        // На вытянутых телефонах поле растёт в высоту, на широких экранах остаётся 9:16 по центру.
        MG.H = MG.clamp(Math.round(MG.W * h / w), 1280, MG.maxH);
        scale = Math.min(w / MG.W, h / MG.H);
        ox = (w - MG.W * scale) / 2;
        oy = (h - MG.H * scale) / 2;
    };

    E.begin = function (bg) {
        // Событие resize приходит не всегда (поворот экрана, появление баннера), поэтому сверяемся каждый кадр.
        if (canvas.clientWidth !== lastW || canvas.clientHeight !== lastH) E.resize();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = MG.shade(bg, 0.7);
        g.fillRect(0, 0, cw, ch);
        var s = scale * dpr;
        g.setTransform(s, 0, 0, s, ox * dpr, oy * dpr);
        g.save();
        g.beginPath();
        g.rect(0, 0, MG.W, MG.H);
        g.clip();
        if (E.shakeT > 0) {
            var a = E.shakeAmp * (E.shakeT / E.shakeDur);
            g.translate(MG.rand(-a, a), MG.rand(-a, a));
        }
        g.fillStyle = bg;
        g.fillRect(-60, -60, MG.W + 120, MG.H + 120);
    };

    E.end = function () {
        g.restore();
    };

    E.shake = function (amp, dur) {
        E.shakeAmp = amp;
        E.shakeDur = E.shakeT = dur || 0.3;
    };

    E.burst = function (x, y, color, n, power) {
        n = n || 14;
        power = power || 520;
        for (var i = 0; i < n; i++) {
            var a = MG.rand(0, Math.PI * 2), v = MG.rand(0.35, 1) * power;
            E.particles.push({
                x: x, y: y,
                vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.3,
                life: 0, max: MG.rand(0.35, 0.7),
                size: MG.rand(8, 20), color: color
            });
        }
    };

    E.clearFx = function () {
        E.particles.length = 0;
        E.shakeT = 0;
    };

    E.updateFx = function (dt) {
        if (E.shakeT > 0) E.shakeT -= dt;
        for (var i = E.particles.length - 1; i >= 0; i--) {
            var p = E.particles[i];
            p.life += dt;
            if (p.life >= p.max) { E.particles.splice(i, 1); continue; }
            p.vy += 1500 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }
    };

    E.drawFx = function () {
        for (var i = 0; i < E.particles.length; i++) {
            var p = E.particles[i], k = 1 - p.life / p.max;
            g.fillStyle = p.color;
            g.beginPath();
            g.arc(p.x, p.y, p.size * k * 0.5 + 1, 0, Math.PI * 2);
            g.fill();
        }
    };

    // ---- Примитивы рисования ----

    var D = MG.draw = {};

    D.rr = function (g, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        g.beginPath();
        g.moveTo(x + r, y);
        g.arcTo(x + w, y, x + w, y + h, r);
        g.arcTo(x + w, y + h, x, y + h, r);
        g.arcTo(x, y + h, x, y, r);
        g.arcTo(x, y, x + w, y, r);
        g.closePath();
    };

    D.box = function (g, x, y, w, h, r, fill, lw) {
        D.rr(g, x, y, w, h, r);
        g.fillStyle = fill;
        g.fill();
        if (lw !== 0) {
            g.lineWidth = lw || 7;
            g.strokeStyle = MG.INK;
            g.stroke();
        }
    };

    D.ellipse = function (g, x, y, rx, ry, fill, lw) {
        g.beginPath();
        g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
        if (fill) { g.fillStyle = fill; g.fill(); }
        if (lw) { g.lineWidth = lw; g.strokeStyle = MG.INK; g.stroke(); }
    };

    D.font = function (g, size) {
        g.font = '900 ' + Math.round(size) + 'px ' + FONT;
    };

    // Подбирает размер шрифта, при котором строка помещается в maxW.
    D.fit = function (g, s, size, maxW) {
        D.font(g, size);
        var w = g.measureText(s).width;
        return w > maxW ? size * maxW / w : size;
    };

    // o: { align, base, stroke (цвет или false), lw, maxW }
    D.text = function (g, s, x, y, size, fill, o) {
        o = o || {};
        if (o.maxW) size = D.fit(g, s, size, o.maxW);
        D.font(g, size);
        g.textAlign = o.align || 'center';
        g.textBaseline = o.base || 'middle';
        if (o.stroke !== false) {
            g.lineJoin = 'round';
            g.lineWidth = o.lw || size * 0.22;
            g.strokeStyle = o.stroke || MG.INK;
            g.strokeText(s, x, y);
        }
        g.fillStyle = fill;
        g.fillText(s, x, y);
    };

    D.heart = function (g, x, y, s, fill) {
        g.beginPath();
        g.moveTo(x, y + s * 0.9);
        g.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.8, y - s * 1.2, x, y - s * 0.35);
        g.bezierCurveTo(x + s * 0.8, y - s * 1.2, x + s * 1.5, y - s * 0.1, x, y + s * 0.9);
        g.closePath();
        g.fillStyle = fill;
        g.fill();
        g.lineJoin = 'round';
        g.lineWidth = 6;
        g.strokeStyle = MG.INK;
        g.stroke();
    };

    D.coin = function (g, x, y, r) {
        D.ellipse(g, x, y, r, r, MG.GOLD, Math.max(4, r * 0.18));
        g.beginPath();
        g.arc(x, y, r * 0.55, 0, Math.PI * 2);
        g.lineWidth = Math.max(3, r * 0.12);
        g.strokeStyle = MG.shade(MG.GOLD, 0.75);
        g.stroke();
    };

    function strokePath(g, pts, color, lw) {
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.beginPath();
        for (var i = 0; i < pts.length; i++) {
            if (pts[i] === null) continue;
            if (i === 0 || pts[i - 1] === null) g.moveTo(pts[i][0], pts[i][1]); else g.lineTo(pts[i][0], pts[i][1]);
        }
        g.lineWidth = lw * 1.7;
        g.strokeStyle = MG.INK;
        g.stroke();
        g.lineWidth = lw;
        g.strokeStyle = color;
        g.stroke();
    }

    D.check = function (g, x, y, s) {
        strokePath(g, [[x - s * 0.5, y], [x - s * 0.12, y + s * 0.38], [x + s * 0.55, y - s * 0.4]], MG.GOOD, s * 0.22);
    };

    D.cross = function (g, x, y, s) {
        strokePath(g, [[x - s * 0.4, y - s * 0.4], [x + s * 0.4, y + s * 0.4], null, [x + s * 0.4, y - s * 0.4], [x - s * 0.4, y + s * 0.4]], MG.BAD, s * 0.22);
    };

    // Вращающиеся лучи для фона экранов меню.
    D.rays = function (g, cx, cy, t, color, n) {
        var R = 1800, step = Math.PI * 2 / n;
        g.fillStyle = color;
        for (var i = 0; i < n; i += 2) {
            var a = t * 0.25 + i * step;
            g.beginPath();
            g.moveTo(cx, cy);
            g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
            g.lineTo(cx + Math.cos(a + step) * R, cy + Math.sin(a + step) * R);
            g.closePath();
            g.fill();
        }
    };
})();
