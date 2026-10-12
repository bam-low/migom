(function () {
    'use strict';

    var D = MG.draw;

    // Талисман игры. mood: 'idle' | 'happy' | 'sad' | 'wow'.
    // o: { lookX, lookY (-1..1), squash, color, skin } — без skin рисуется выбранный игроком облик.
    MG.drawMig = function (g, x, y, r, mood, t, o) {
        o = o || {};
        var skin = o.skin || MG.skins.current();
        var bob = Math.sin(t * 5) * 0.035 + (o.squash || 0);
        var lw = Math.max(4, r * 0.1);
        var lx = (o.lookX || 0) * r * 0.1, ly = (o.lookY || 0) * r * 0.1;

        g.save();
        g.translate(x, y + r);
        g.scale(1 + bob, 1 - bob);
        g.translate(0, -r);

        if (skin.back) skin.back(g, r, lw);

        // Ноги и тело
        D.ellipse(g, -r * 0.4, r * 0.95, r * 0.26, r * 0.13, MG.INK);
        D.ellipse(g, r * 0.4, r * 0.95, r * 0.26, r * 0.13, MG.INK);
        D.ellipse(g, 0, 0, r, r, o.color || skin.color || MG.WHITE, lw);

        if (skin.mid) skin.mid(g, r, lw);

        // Щёки
        D.ellipse(g, -r * 0.58, r * 0.2, r * 0.17, r * 0.1, 'rgba(255,110,135,0.55)');
        D.ellipse(g, r * 0.58, r * 0.2, r * 0.17, r * 0.1, 'rgba(255,110,135,0.55)');

        var ex = r * 0.33, ey = -r * 0.14, er = r * 0.13;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.strokeStyle = MG.INK;
        g.lineWidth = lw * 0.9;

        if (mood === 'happy') {
            for (var s = -1; s <= 1; s += 2) {
                g.beginPath();
                g.arc(s * ex, ey + er * 0.5, er * 1.15, Math.PI * 1.12, Math.PI * 1.88);
                g.stroke();
            }
            g.beginPath();
            g.arc(0, r * 0.2, r * 0.32, 0, Math.PI);
            g.closePath();
            g.fillStyle = MG.INK;
            g.fill();
            D.ellipse(g, 0, r * 0.4, r * 0.16, r * 0.08, '#FF7A8A');
        } else if (mood === 'sad') {
            for (var q = -1; q <= 1; q += 2) {
                D.ellipse(g, q * ex + lx, ey + er * 0.4 + ly, er * 0.9, er * 1.1, MG.INK);
                g.beginPath();
                g.moveTo(q * (ex - er * 1.3), ey - er * 1.9);
                g.lineTo(q * (ex + er * 1.2), ey - er * 1.1);
                g.stroke();
            }
            g.beginPath();
            g.arc(0, r * 0.55, r * 0.22, Math.PI * 1.15, Math.PI * 1.85);
            g.stroke();
        } else if (mood === 'wow') {
            for (var w = -1; w <= 1; w += 2) {
                D.ellipse(g, w * ex, ey, er * 1.7, er * 1.9, '#FFFFFF', lw * 0.6);
                D.ellipse(g, w * ex + lx * 1.6, ey + ly * 1.6, er * 0.8, er * 0.9, MG.INK);
            }
            D.ellipse(g, 0, r * 0.4, r * 0.1, r * 0.14, MG.INK);
        } else {
            var blink = (t % 3.4) < 0.12;
            for (var i = -1; i <= 1; i += 2) {
                if (blink) {
                    g.beginPath();
                    g.moveTo(i * ex - er, ey);
                    g.lineTo(i * ex + er, ey);
                    g.stroke();
                } else {
                    D.ellipse(g, i * ex + lx, ey + ly, er, er * 1.3, MG.INK);
                    D.ellipse(g, i * ex + lx + er * 0.3, ey + ly - er * 0.45, er * 0.3, er * 0.3, '#FFFFFF');
                }
            }
            g.beginPath();
            g.arc(0, r * 0.18, r * 0.22, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
        }

        if (skin.front) skin.front(g, r, lw);
        g.restore();
    };
})();
