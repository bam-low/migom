(function () {
    'use strict';

    var D = MG.draw;
    var BASKET_X = [170, 550];

    function drawFruit(g, kind, x, y, s) {
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        if (kind === 'apple') {
            g.strokeStyle = MG.INK; g.lineWidth = 5; g.lineCap = 'round';
            g.beginPath(); g.moveTo(0, -24); g.lineTo(5, -38); g.stroke();
            D.ellipse(g, 16, -34, 11, 6, '#69DB7C', 4);
            D.ellipse(g, 0, 0, 30, 28, '#FF6B6B', 6);
            D.ellipse(g, -11, -10, 7, 5, 'rgba(255,255,255,0.6)');
        } else {
            g.beginPath();
            g.moveTo(-44, 0);
            g.quadraticCurveTo(-22, -34, 0, -30);
            g.quadraticCurveTo(22, -34, 44, 0);
            g.quadraticCurveTo(22, 34, 0, 30);
            g.quadraticCurveTo(-22, 34, -44, 0);
            g.closePath();
            g.fillStyle = '#FFE066'; g.fill();
            g.lineWidth = 6; g.lineJoin = 'round'; g.strokeStyle = MG.INK; g.stroke();
            D.ellipse(g, -12, -10, 9, 5, 'rgba(255,255,255,0.6)');
        }
        g.restore();
    }

    MG.games.push({
        id: 'sort',
        bg: '#B2F2BB',
        dur: 5.0,
        cmd: { ru: 'Разложи!', en: 'Sort!' },
        hint: { ru: 'жми на нужную корзину', en: 'tap the matching basket' },

        make: function (api) {
            var n = Math.min(5, 3 + Math.floor((api.speed - 1) / 0.45));
            // Какая корзина для яблок, решается заново в каждом раунде — на автомате не пройти.
            var kinds = Math.random() < 0.5 ? ['apple', 'lemon'] : ['lemon', 'apple'];
            var queue = [];
            for (var i = 0; i < n; i++) queue.push(Math.random() < 0.5 ? 'apple' : 'lemon');
            var cur = 0, t = 0, moving = null, wrongSide = -1, counts = [0, 0];

            function basketY() { return MG.H - 330; }
            function itemY() { return MG.H * 0.42; }

            return {
                update: function (dt) {
                    t += dt;
                    if (moving) {
                        moving.t += dt;
                        if (moving.t >= 0.2) { counts[moving.side]++; moving = null; }
                    }
                },

                down: function (x) {
                    if (cur >= n) return;
                    var side = x < MG.W / 2 ? 0 : 1, kind = queue[cur];
                    if (moving) counts[moving.side]++;
                    moving = { kind: kind, side: side, t: 0 };
                    cur++;
                    if (kinds[side] !== kind) {
                        wrongSide = side;
                        api.lose();
                        return;
                    }
                    api.sfx('pop');
                    if (cur === n) api.win();
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var by = basketY(), iy = itemY(), i;
                    var fy = MG.H - 150;
                    g.fillStyle = MG.shade('#B2F2BB', 0.85);
                    g.fillRect(0, fy, MG.W, MG.H - fy);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, fy - 4, MG.W, 8);

                    for (var side = 0; side < 2; side++) {
                        var bx = BASKET_X[side];
                        // Табличка с фруктом над корзиной
                        D.ellipse(g, bx, by - 150, 62, 62, side === wrongSide ? MG.BAD : MG.WHITE, 7);
                        drawFruit(g, kinds[side], bx, by - 146, 1.05);
                        g.beginPath();
                        g.moveTo(bx - 130, by - 60); g.lineTo(bx + 130, by - 60);
                        g.lineTo(bx + 100, by + 110); g.lineTo(bx - 100, by + 110);
                        g.closePath();
                        g.fillStyle = '#B08968'; g.fill();
                        g.lineWidth = 8; g.lineJoin = 'round'; g.strokeStyle = MG.INK; g.stroke();
                        D.box(g, bx - 142, by - 82, 284, 40, 16, '#C9A27E', 8);
                        D.text(g, String(counts[side]), bx, by + 34, 60, MG.WHITE);
                    }

                    // Очередь: сколько фруктов ещё осталось
                    for (i = cur; i < n; i++) {
                        D.ellipse(g, 360 + (i - cur - (n - cur - 1) / 2) * 44, iy - 130, 13, 13, 'rgba(35,35,59,0.35)');
                    }

                    if (cur < n) {
                        drawFruit(g, queue[cur], 360, iy + Math.sin(t * 6) * 10, 2.3);
                    }
                    if (moving) {
                        var k = MG.ease.outCubic(Math.min(1, moving.t / 0.2));
                        drawFruit(g, moving.kind, MG.lerp(360, BASKET_X[moving.side], k), MG.lerp(iy, by - 40, k), MG.lerp(2.3, 1.1, k));
                    }

                    var mood = api.done ? (wrongSide < 0 ? 'happy' : 'sad') : 'idle';
                    MG.drawMig(g, 360, MG.H - 100, 50, mood, t, { lookY: -1 });
                }
            };
        }
    });
})();
