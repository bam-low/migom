(function () {
    'use strict';

    var D = MG.draw, E = MG.engine;
    var WHEEL_R = 170;

    MG.games.push({
        id: 'spin',
        bg: '#FFA94D',
        dur: 5.2,
        cmd: { ru: 'Крути!', en: 'Spin!' },
        hint: { ru: 'води пальцем по кругу', en: 'drag in circles' },

        make: function (api) {
            var need = (api.speed >= 1.5 ? 3 : 2) * Math.PI * 2;
            var total = 0, prev = null, t = 0;

            function cy() { return MG.H * 0.6; }

            return {
                update: function (dt) {
                    t += dt;
                    var p = E.pointer, dx = p.x - 360, dy = p.y - cy();
                    // Возле самой оси угол скачет, поэтому центр колеса не считается.
                    if (!p.down || api.done || dx * dx + dy * dy < 50 * 50) { prev = null; return; }
                    var a = Math.atan2(dy, dx);
                    if (prev !== null) {
                        var d = a - prev;
                        if (d > Math.PI) d -= Math.PI * 2;
                        if (d < -Math.PI) d += Math.PI * 2;
                        total += d;
                        if (Math.abs(total) >= need) {
                            api.sfx('ding');
                            api.burst(360, cy() - 400, MG.GOLD, 20);
                            api.win();
                        }
                    }
                    prev = a;
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var c = cy(), k = Math.min(1, Math.abs(total) / need), i;

                    // Шкатулка: Миг поднимается из неё по мере вращения
                    var boxY = c - 330;
                    MG.drawMig(g, 360, boxY - 20 - k * 100, 62, k >= 1 ? 'happy' : 'idle', t);
                    D.box(g, 250, boxY, 220, 110, 20, '#7B5CFF', 8);
                    D.box(g, 236, boxY - 14, 248, 34, 14, '#9775FA', 8);

                    // Шкала прогресса вокруг колеса
                    g.lineCap = 'round';
                    g.beginPath(); g.arc(360, c, WHEEL_R + 34, 0, Math.PI * 2);
                    g.lineWidth = 22; g.strokeStyle = 'rgba(35,35,59,0.3)'; g.stroke();
                    if (k > 0.01) {
                        g.beginPath(); g.arc(360, c, WHEEL_R + 34, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2);
                        g.strokeStyle = MG.GOOD; g.stroke();
                    }

                    // Колесо с ручкой
                    D.ellipse(g, 360, c, WHEEL_R, WHEEL_R, MG.WHITE, 9);
                    g.strokeStyle = MG.INK;
                    g.lineWidth = 9;
                    for (i = 0; i < 4; i++) {
                        var a = total + i * Math.PI / 4;
                        g.beginPath();
                        g.moveTo(360 - Math.cos(a) * WHEEL_R, c - Math.sin(a) * WHEEL_R);
                        g.lineTo(360 + Math.cos(a) * WHEEL_R, c + Math.sin(a) * WHEEL_R);
                        g.stroke();
                    }
                    D.ellipse(g, 360, c, 34, 34, '#C9CCD9', 8);
                    D.ellipse(g, 360 + Math.cos(total) * 128, c + Math.sin(total) * 128, 38, 38, MG.BAD, 8);
                }
            };
        }
    });
})();
