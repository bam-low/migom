(function () {
    'use strict';

    var D = MG.draw;
    var GRASS = '#69DB7C';

    function cloud(g, x, y) {
        D.ellipse(g, x, y, 70, 34, '#FFFFFF');
        D.ellipse(g, x - 50, y + 14, 46, 26, '#FFFFFF');
        D.ellipse(g, x + 54, y + 12, 50, 28, '#FFFFFF');
    }

    MG.games.push({
        id: 'jump',
        bg: '#9BD0FF',
        dur: 4.6,
        cmd: { ru: 'Прыгай!', en: 'Jump!' },
        hint: { ru: 'нажми перед лужей', en: 'tap before the puddle' },

        make: function (api) {
            var count = api.speed >= 1.4 ? 2 : 1;
            var migX = 210, jumpH = 250;
            var airT = 0.62 / Math.pow(api.speed, 0.35);
            var v = 640 * Math.pow(api.speed, 0.6);
            var puddles = [];
            for (var i = 0; i < count; i++) {
                var arrive = (count === 1 ? 0.6 : 0.42 + i * 0.4) * api.dur;
                puddles.push({ x: migX + v * arrive, passed: false });
            }
            var t = 0, jt = -1, scroll = 0, passed = 0, mood = 'idle', wet = false;

            function height() {
                if (jt < 0) return 0;
                var k = jt / airT;
                return jumpH * 4 * k * (1 - k);
            }

            return {
                update: function (dt) {
                    t += dt;
                    if (jt >= 0) { jt += dt; if (jt >= airT) jt = -1; }
                    if (wet) return;
                    scroll += v * dt;
                    for (var i = 0; i < puddles.length; i++) {
                        var p = puddles[i];
                        p.x -= v * dt;
                        if (api.done || p.passed) continue;
                        if (Math.abs(p.x - migX) < 70 && height() < 45) {
                            wet = true;
                            mood = 'sad';
                            api.sfx('splash');
                            api.burst(migX, MG.H - 200, '#4DABF7', 20);
                            api.lose();
                        } else if (p.x < migX - 150) {
                            p.passed = true;
                            if (++passed === count) { mood = 'happy'; api.win(); }
                        }
                    }
                },

                down: function () {
                    if (jt < 0 && !wet) { jt = 0; api.sfx('jump'); }
                },

                timeout: function () { return passed === count; },

                draw: function (g) {
                    var fy = MG.H - 200, i;
                    D.ellipse(g, 590, 390, 66, 66, '#FFE066', 7);
                    for (i = 0; i < 3; i++) {
                        var cx = (((i * 340 - scroll * 0.2) % 1040) + 1040) % 1040 - 160;
                        cloud(g, cx, 470 + i * 110);
                    }

                    g.fillStyle = GRASS;
                    g.fillRect(0, fy, MG.W, MG.H - fy);
                    g.fillStyle = MG.shade(GRASS, 0.84);
                    for (var x = -(scroll % 170); x < MG.W; x += 170) g.fillRect(x, fy + 70, 86, 16);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, fy - 4, MG.W, 8);

                    for (i = 0; i < puddles.length; i++) {
                        D.ellipse(g, puddles[i].x, fy + 18, 88, 20, '#4DABF7', 6);
                        D.ellipse(g, puddles[i].x - 24, fy + 13, 26, 5, '#A5D8FF');
                    }

                    var h = height(), shrink = 1 - h / 520;
                    D.ellipse(g, migX, fy + 6, 62 * shrink, 12 * shrink, 'rgba(35,35,59,0.25)');
                    MG.drawMig(g, migX, fy - 70 - h + (wet ? 22 : 0), 66, mood, t * 2.2, { lookX: 1 });
                }
            };
        }
    });
})();
