(function () {
    'use strict';

    var D = MG.draw;
    var FLOORS = 5;

    MG.games.push({
        id: 'stop',
        bg: '#4CC9F0',
        dur: 5.2,
        cmd: { ru: 'Стой!', en: 'Stop!' },
        hint: { ru: 'нажми на нужном этаже', en: 'tap at the right floor' },

        make: function (api) {
            var target = MG.randInt(0, FLOORS - 1);
            var period = 3.0 / Math.pow(api.speed, 0.6);
            var tol = Math.max(0.26, 0.36 - 0.06 * (api.speed - 1));
            var phase = MG.rand(0, 1);
            var t = 0, pos = 0, stopped = false, mood = 'idle', snapT = 0;

            function cabinPos(time) {
                var u = (phase + time / period) % 1;
                return (FLOORS - 1) * (1 - Math.abs(2 * u - 1));
            }

            // Не начинаем прямо на нужном этаже — иначе первый же тап выигрывает.
            if (Math.abs(cabinPos(0) - target) < 1) phase = (phase + 0.25) % 1;
            pos = cabinPos(0);

            function layout() {
                var top = 320, bottom = MG.H - 170;
                return { top: top, bottom: bottom, fh: (bottom - top) / FLOORS };
            }

            return {
                update: function (dt) {
                    t += dt;
                    if (!stopped) {
                        pos = cabinPos(t);
                    } else if (mood === 'happy') {
                        snapT += dt;
                        pos += (target - pos) * Math.min(1, dt * 14);
                    }
                },

                down: function () {
                    if (stopped) return;
                    stopped = true;
                    if (Math.abs(pos - target) <= tol) {
                        mood = 'happy';
                        api.sfx('ding');
                        var L = layout();
                        api.burst(360, L.bottom - L.fh * (target + 0.5), MG.GOLD, 16);
                        api.win();
                    } else {
                        mood = 'sad';
                        api.lose();
                    }
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var L = layout(), i;
                    var bx = 210, bw = 300, sx = 250, sw = 220;

                    // Земля
                    g.fillStyle = MG.shade('#4CC9F0', 0.82);
                    g.fillRect(0, L.bottom, MG.W, MG.H - L.bottom);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, L.bottom - 4, MG.W, 8);

                    // Дом и шахта
                    D.box(g, bx, L.top - 40, bw, L.bottom - L.top + 40, 18, MG.WHITE, 8);
                    g.fillStyle = '#39406B';
                    g.fillRect(sx, L.top, sw, L.bottom - L.top);

                    // Нужный этаж
                    var ty = L.bottom - L.fh * (target + 1);
                    g.fillStyle = 'rgba(61,220,132,' + (0.45 + 0.2 * Math.sin(t * 9)) + ')';
                    g.fillRect(sx, ty, sw, L.fh);

                    g.strokeStyle = MG.INK;
                    g.lineWidth = 6;
                    for (i = 1; i < FLOORS; i++) {
                        var ly = L.bottom - L.fh * i;
                        g.beginPath(); g.moveTo(bx, ly); g.lineTo(bx + bw, ly); g.stroke();
                    }
                    g.lineWidth = 7;
                    g.strokeRect(sx, L.top, sw, L.bottom - L.top);

                    // Номера этажей слева
                    for (i = 0; i < FLOORS; i++) {
                        var cy = L.bottom - L.fh * (i + 0.5);
                        if (i === target) {
                            var pulse = 1 + 0.08 * Math.sin(t * 9);
                            D.ellipse(g, 110, cy, 54 * pulse, 54 * pulse, MG.GOOD, 7);
                            D.text(g, String(i + 1), 110, cy + 3, 64, MG.WHITE);
                            g.beginPath();
                            g.moveTo(176, cy - 20); g.lineTo(204, cy); g.lineTo(176, cy + 20);
                            g.closePath();
                            g.fillStyle = MG.GOOD; g.fill();
                            g.lineWidth = 6; g.strokeStyle = MG.INK; g.lineJoin = 'round'; g.stroke();
                        } else {
                            D.text(g, String(i + 1), 110, cy + 3, 50, 'rgba(255,248,240,0.75)', { stroke: false });
                        }
                    }

                    // Кабина с Мигом
                    var cyc = L.bottom - L.fh * (pos + 0.5), chh = L.fh * 0.84;
                    g.strokeStyle = MG.INK;
                    g.lineWidth = 6;
                    g.beginPath(); g.moveTo(360, L.top); g.lineTo(360, cyc - chh / 2); g.stroke();
                    D.box(g, sx + 12, cyc - chh / 2, sw - 24, chh, 14, MG.GOLD, 7);
                    var mr = Math.min(58, chh * 0.34);
                    MG.drawMig(g, 360, cyc + chh / 2 - mr - 14, mr, mood, t);
                }
            };
        }
    });
})();
