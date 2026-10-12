(function () {
    'use strict';

    var D = MG.draw, E = MG.engine;
    var MX = 110, MW = 500, MH = 620;
    var RUB = 170;      // сколько пикселей надо протереть по одному пятну

    MG.games.push({
        id: 'wipe',
        bg: '#74C0FC',
        dur: 5.2,
        cmd: { ru: 'Протри!', en: 'Wipe!' },
        hint: { ru: 'три пальцем по пятнам', en: 'rub the stains off' },

        make: function (api) {
            var n = Math.min(8, 5 + Math.floor((api.speed - 1) / 0.4));
            var spots = [], minDist = 150, left = n, prev = null, t = 0;

            // Координаты пятен — относительно верхнего края зеркала, чтобы пережить смену высоты экрана.
            for (var tries = 0; spots.length < n; tries++) {
                var x = MG.rand(MX + 80, MX + MW - 80), y = MG.rand(80, MH - 80), ok = true;
                for (var j = 0; j < spots.length; j++) {
                    var dx = spots[j].x - x, dy = spots[j].y - y;
                    if (dx * dx + dy * dy < minDist * minDist) { ok = false; break; }
                }
                if (ok) spots.push({ x: x, y: y, r: MG.rand(58, 76), hp: 1, rot: MG.rand(0, 3) });
                else if (tries % 40 === 39) minDist -= 12;
            }

            function top() { return (300 + MG.H - 150) / 2 - MH / 2; }

            return {
                update: function (dt) {
                    t += dt;
                    var p = E.pointer;
                    if (!p.down || api.done) { prev = null; return; }
                    if (prev) {
                        var moved = Math.sqrt((p.x - prev.x) * (p.x - prev.x) + (p.y - prev.y) * (p.y - prev.y));
                        var py = p.y - top();
                        for (var i = 0; i < spots.length; i++) {
                            var s = spots[i];
                            if (s.hp <= 0) continue;
                            var dx = p.x - s.x, dy = py - s.y, reach = s.r + 40;
                            if (dx * dx + dy * dy > reach * reach) continue;
                            s.hp -= moved / RUB;
                            if (s.hp <= 0) {
                                s.hp = 0;
                                api.sfx('pop');
                                api.burst(s.x, s.y + top(), MG.WHITE, 8, 300);
                                if (--left === 0) api.win();
                            }
                        }
                    }
                    prev = { x: p.x, y: p.y };
                },

                timeout: function () { return left === 0; },

                draw: function (g) {
                    var ty = top(), p = E.pointer;
                    D.box(g, MX - 20, ty - 20, MW + 40, MH + 40, 34, MG.GOLD, 8);
                    D.box(g, MX, ty, MW, MH, 18, '#E7F5FF', 7);
                    MG.drawMig(g, 360, ty + MH * 0.5, 140, left === 0 ? 'happy' : 'idle', t);

                    for (var i = 0; i < spots.length; i++) {
                        var s = spots[i];
                        if (s.hp <= 0) continue;
                        g.save();
                        g.translate(s.x, s.y + ty);
                        g.rotate(s.rot);
                        g.globalAlpha = 0.3 + 0.7 * s.hp;
                        D.ellipse(g, 0, 0, s.r, s.r * 0.78, '#8D6E53');
                        D.ellipse(g, s.r * 0.55, -s.r * 0.3, s.r * 0.5, s.r * 0.42, '#8D6E53');
                        D.ellipse(g, -s.r * 0.5, s.r * 0.35, s.r * 0.46, s.r * 0.36, '#7A5C44');
                        g.restore();
                    }

                    if (p.down && !api.done) {
                        g.save();
                        g.translate(p.x, p.y);
                        g.rotate(-0.2);
                        D.box(g, -56, -38, 112, 76, 18, MG.WHITE, 7);
                        g.restore();
                    }
                }
            };
        }
    });
})();
