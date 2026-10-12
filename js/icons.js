(function () {
    'use strict';

    var D = MG.draw;

    // Значки микроигр для экрана коллекции. Рисуются вокруг точки (0, 0), s — примерный радиус.
    var I = MG.icons = {};

    function poly(g, pts, fill, lw) {
        g.beginPath();
        g.moveTo(pts[0], pts[1]);
        for (var i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
        g.closePath();
        if (fill) { g.fillStyle = fill; g.fill(); }
        if (lw) { g.lineWidth = lw; g.lineJoin = 'round'; g.strokeStyle = MG.INK; g.stroke(); }
    }

    I.catch = function (g, s) {
        D.box(g, -s * 0.62, -s * 0.62, s * 1.24, s * 1.24, s * 0.3, '#D98A3D', s * 0.1);
        D.box(g, -s * 0.4, -s * 0.4, s * 0.8, s * 0.8, s * 0.16, '#FFE2A8', 0);
        D.box(g, -s * 0.16, -s * 0.16, s * 0.32, s * 0.32, s * 0.06, '#FFD23F', s * 0.06);
    };

    I.stop = function (g, s) {
        D.box(g, -s * 0.48, -s * 0.36, s * 0.96, s * 0.72, s * 0.14, MG.GOLD, s * 0.1);
        poly(g, [-s * 0.26, -s * 0.56, 0, -s * 0.9, s * 0.26, -s * 0.56], MG.WHITE, s * 0.08);
        poly(g, [-s * 0.26, s * 0.56, 0, s * 0.9, s * 0.26, s * 0.56], MG.WHITE, s * 0.08);
    };

    I.swat = function (g, s) {
        D.ellipse(g, -s * 0.2, -s * 0.36, s * 0.42, s * 0.3, 'rgba(255,255,255,0.85)', s * 0.06);
        D.ellipse(g, s * 0.22, -s * 0.36, s * 0.36, s * 0.26, 'rgba(255,255,255,0.85)', s * 0.06);
        D.ellipse(g, -s * 0.12, s * 0.1, s * 0.52, s * 0.24, MG.INK);
        D.ellipse(g, s * 0.5, s * 0.04, s * 0.24, s * 0.24, MG.INK);
        g.lineWidth = s * 0.08; g.lineCap = 'round'; g.strokeStyle = MG.INK;
        g.beginPath(); g.moveTo(s * 0.7, s * 0.1); g.lineTo(s * 1.02, s * 0.3); g.stroke();
    };

    I.pour = function (g, s) {
        var glass = [-s * 0.56, -s * 0.74, -s * 0.42, s * 0.74, s * 0.42, s * 0.74, s * 0.56, -s * 0.74];
        poly(g, glass, 'rgba(255,255,255,0.5)');
        poly(g, [-s * 0.5, -s * 0.06, -s * 0.42, s * 0.74, s * 0.42, s * 0.74, s * 0.5, -s * 0.06], '#3FA9F5');
        g.beginPath();
        g.moveTo(glass[0], glass[1]); g.lineTo(glass[2], glass[3]); g.lineTo(glass[4], glass[5]); g.lineTo(glass[6], glass[7]);
        g.lineWidth = s * 0.1; g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = MG.INK; g.stroke();
    };

    I.jump = function (g, s) {
        D.ellipse(g, 0, s * 0.56, s * 0.78, s * 0.2, '#4DABF7', s * 0.08);
        g.beginPath();
        g.arc(0, s * 0.3, s * 0.72, Math.PI * 1.12, Math.PI * 1.88);
        g.lineWidth = s * 0.12; g.lineCap = 'round'; g.strokeStyle = MG.WHITE;
        g.setLineDash([s * 0.2, s * 0.22]); g.stroke(); g.setLineDash([]);
        D.ellipse(g, 0, -s * 0.46, s * 0.26, s * 0.26, MG.WHITE, s * 0.08);
    };

    I.find = function (g, s) {
        g.lineWidth = s * 0.2; g.lineCap = 'round'; g.strokeStyle = MG.INK;
        g.beginPath(); g.moveTo(s * 0.3, s * 0.3); g.lineTo(s * 0.8, s * 0.8); g.stroke();
        D.ellipse(g, -s * 0.14, -s * 0.14, s * 0.58, s * 0.58, 'rgba(255,255,255,0.75)', s * 0.12);
    };

    I.wait = function (g, s) {
        D.box(g, -s * 0.7, s * 0.14, s * 1.4, s * 0.52, s * 0.14, '#C9CCD9', s * 0.1);
        D.ellipse(g, 0, s * 0.02, s * 0.56, s * 0.46, MG.BAD, s * 0.1);
        D.ellipse(g, -s * 0.16, -s * 0.2, s * 0.18, s * 0.09, 'rgba(255,255,255,0.5)');
    };

    I.cups = function (g, s) {
        poly(g, [-s * 0.42, -s * 0.66, s * 0.42, -s * 0.66, s * 0.68, s * 0.66, -s * 0.68, s * 0.66], '#FF6B6B', s * 0.1);
        g.fillStyle = MG.WHITE;
        g.fillRect(-s * 0.56, s * 0.28, s * 1.12, s * 0.14);
    };

    I.pop = function (g, s) {
        g.lineWidth = s * 0.07; g.strokeStyle = MG.INK; g.lineCap = 'round';
        g.beginPath(); g.moveTo(0, s * 0.42); g.quadraticCurveTo(s * 0.18, s * 0.66, -s * 0.04, s * 0.92); g.stroke();
        D.ellipse(g, 0, -s * 0.2, s * 0.56, s * 0.66, '#FF6B6B', s * 0.1);
        D.ellipse(g, -s * 0.2, -s * 0.46, s * 0.13, s * 0.19, 'rgba(255,255,255,0.55)');
    };

    I.aim = function (g, s) {
        D.ellipse(g, 0, 0, s * 0.82, s * 0.82, MG.BAD, s * 0.1);
        D.ellipse(g, 0, 0, s * 0.54, s * 0.54, MG.WHITE);
        D.ellipse(g, 0, 0, s * 0.26, s * 0.26, MG.BAD);
    };

    I.cut = function (g, s) {
        D.box(g, -s * 0.86, -s * 0.36, s * 1.72, s * 0.72, s * 0.3, '#D98A3D', s * 0.1);
        g.lineWidth = s * 0.1; g.strokeStyle = MG.WHITE; g.lineCap = 'round';
        g.setLineDash([s * 0.16, s * 0.2]);
        g.beginPath(); g.moveTo(0, -s * 0.8); g.lineTo(0, s * 0.8); g.stroke();
        g.setLineDash([]);
    };

    I.assemble = function (g, s) {
        var q = s * 0.6;
        D.box(g, -q, -q, q, q, s * 0.08, MG.GOLD, s * 0.09);
        D.box(g, -q, 0, q, q, s * 0.08, MG.GOLD, s * 0.09);
        D.box(g, 0, 0, q, q, s * 0.08, MG.GOLD, s * 0.09);
        D.box(g, s * 0.2, -q - s * 0.24, q, q, s * 0.08, MG.WHITE, s * 0.09);
    };

    I.more = function (g, s) {
        var apples = [[-s * 0.52, -s * 0.1], [-s * 0.14, s * 0.4], [-s * 0.5, s * 0.52], [s * 0.56, s * 0.24]];
        for (var i = 0; i < apples.length; i++) {
            D.ellipse(g, apples[i][0], apples[i][1], s * 0.27, s * 0.26, '#FF6B6B', s * 0.08);
        }
        g.fillStyle = MG.INK;
        g.fillRect(s * 0.12, -s * 0.7, s * 0.07, s * 1.5);
    };

    I.close = function (g, s) {
        D.box(g, -s * 0.62, -s * 0.74, s * 1.24, s * 1.48, s * 0.1, '#5C7CFA', s * 0.1);
        g.fillStyle = '#8D99AE';
        g.fillRect(-s * 0.57, -s * 0.69, s * 1.14, s * 0.62);
        D.box(g, -s * 0.72, -s * 0.16, s * 1.44, s * 0.24, s * 0.1, MG.GOLD, s * 0.08);
    };

    I.tap = function (g, s) {
        D.coin(g, 0, 0, s * 0.8);
    };

    I.spin = function (g, s) {
        D.ellipse(g, 0, 0, s * 0.74, s * 0.74, MG.WHITE, s * 0.1);
        g.lineWidth = s * 0.09; g.strokeStyle = MG.INK;
        g.beginPath(); g.moveTo(-s * 0.74, 0); g.lineTo(s * 0.74, 0); g.moveTo(0, -s * 0.74); g.lineTo(0, s * 0.74); g.stroke();
        D.ellipse(g, s * 0.5, -s * 0.5, s * 0.22, s * 0.22, MG.BAD, s * 0.08);
    };

    I.wipe = function (g, s) {
        D.ellipse(g, -s * 0.3, s * 0.3, s * 0.5, s * 0.36, '#8D6E53');
        g.save();
        g.rotate(-0.3);
        D.box(g, -s * 0.2, -s * 0.72, s * 0.96, s * 0.66, s * 0.14, MG.WHITE, s * 0.09);
        g.restore();
    };

    I.simon = function (g, s) {
        var c = ['#FF6B6B', '#4DABF7', '#FFD43B', '#69DB7C'], q = s * 0.66;
        for (var i = 0; i < 4; i++) {
            D.box(g, i % 2 ? s * 0.06 : -q - s * 0.06, i < 2 ? -q - s * 0.06 : s * 0.06, q, q, s * 0.14, c[i], s * 0.08);
        }
    };

    I.math = function (g, s) {
        D.box(g, -s * 0.8, -s * 0.6, s * 1.6, s * 1.2, s * 0.14, '#2F4F3F', s * 0.1);
        g.lineWidth = s * 0.16; g.lineCap = 'round'; g.strokeStyle = MG.WHITE;
        g.beginPath(); g.moveTo(-s * 0.36, 0); g.lineTo(s * 0.36, 0); g.moveTo(0, -s * 0.36); g.lineTo(0, s * 0.36); g.stroke();
    };

    I.dodge = function (g, s) {
        D.ellipse(g, -s * 0.24, -s * 0.5, s * 0.26, s * 0.15, '#51CF66', s * 0.06);
        D.ellipse(g, s * 0.24, -s * 0.52, s * 0.26, s * 0.15, '#51CF66', s * 0.06);
        poly(g, [-s * 0.5, -s * 0.3, s * 0.5, -s * 0.3, s * 0.36, s * 0.66, -s * 0.36, s * 0.66], '#E8590C', s * 0.09);
        D.box(g, -s * 0.6, -s * 0.42, s * 1.2, s * 0.26, s * 0.08, '#F76707', s * 0.08);
    };

    I.fly = function (g, s) {
        D.ellipse(g, -s * 0.62, -s * 0.1, s * 0.4, s * 0.2, MG.WHITE, s * 0.08);
        D.ellipse(g, s * 0.62, -s * 0.1, s * 0.4, s * 0.2, MG.WHITE, s * 0.08);
        D.ellipse(g, 0, 0, s * 0.5, s * 0.5, MG.WHITE, s * 0.1);
        D.ellipse(g, -s * 0.16, -s * 0.06, s * 0.07, s * 0.09, MG.INK);
        D.ellipse(g, s * 0.16, -s * 0.06, s * 0.07, s * 0.09, MG.INK);
    };

    I.sort = function (g, s) {
        D.ellipse(g, -s * 0.5, -s * 0.34, s * 0.3, s * 0.28, '#FF6B6B', s * 0.08);
        D.ellipse(g, s * 0.5, -s * 0.34, s * 0.38, s * 0.24, '#FFE066', s * 0.08);
        poly(g, [-s * 0.9, s * 0.2, -s * 0.1, s * 0.2, -s * 0.24, s * 0.78, -s * 0.76, s * 0.78], '#B08968', s * 0.08);
        poly(g, [s * 0.1, s * 0.2, s * 0.9, s * 0.2, s * 0.76, s * 0.78, s * 0.24, s * 0.78], '#B08968', s * 0.08);
    };

    I.walk = function (g, s) {
        D.box(g, -s * 0.36, -s * 0.84, s * 0.72, s * 1.68, s * 0.2, '#343A40', s * 0.1);
        D.ellipse(g, 0, -s * 0.5, s * 0.2, s * 0.2, MG.BAD);
        D.ellipse(g, 0, 0, s * 0.2, s * 0.2, '#FFD43B');
        D.ellipse(g, 0, s * 0.5, s * 0.2, s * 0.2, MG.GOOD);
    };

    I.lock = function (g, s) {
        g.beginPath();
        g.arc(0, -s * 0.22, s * 0.42, Math.PI, 0);
        g.lineWidth = s * 0.3; g.strokeStyle = MG.INK; g.stroke();
        g.lineWidth = s * 0.14; g.strokeStyle = '#C9CCD9'; g.stroke();
        D.box(g, -s * 0.7, -s * 0.22, s * 1.4, s * 1.1, s * 0.2, MG.GOLD, s * 0.1);
        D.ellipse(g, 0, s * 0.28, s * 0.15, s * 0.2, MG.INK);
    };
})();
