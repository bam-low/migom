(function () {
    'use strict';

    var D = MG.draw;
    var COLORS = ['#FF6B6B', '#FFD43B', '#4DABF7', '#DA77F2', '#FFA94D', '#F783AC', '#63E6BE'];

    MG.games.push({
        id: 'pop',
        bg: '#A9E34B',
        dur: 5.0,
        cmd: { ru: 'Лопни!', en: 'Pop!' },
        hint: { ru: 'все до одного', en: 'every last one' },

        make: function (api) {
            // Мышью лопать медленнее, чем пальцами, поэтому на компьютере шариков меньше.
            var n = MG.touch ? Math.min(7, 4 + Math.floor((api.speed - 1) / 0.3))
                : Math.min(5, 3 + Math.floor((api.speed - 1) / 0.45));
            var balloons = [], left = n, t = 0;

            // Расставляем шарики без наложений; если места мало, постепенно ослабляем требование.
            var minDist = 180;
            for (var tries = 0; balloons.length < n; tries++) {
                var x = MG.rand(110, 610), y = MG.rand(380, MG.H - 330), ok = true;
                for (var j = 0; j < balloons.length; j++) {
                    var dx = balloons[j].x - x, dy = balloons[j].y - y;
                    if (dx * dx + dy * dy < minDist * minDist) { ok = false; break; }
                }
                if (ok) balloons.push({ x: x, y: y, phase: MG.rand(0, 6.28), color: COLORS[balloons.length % COLORS.length], popped: false });
                else if (tries % 40 === 39) minDist -= 15;
            }

            function bob(b) { return b.y + Math.sin(t * 2.2 + b.phase) * 14; }

            return {
                update: function (dt) { t += dt; },

                down: function (x, y) {
                    for (var i = balloons.length - 1; i >= 0; i--) {
                        var b = balloons[i];
                        if (b.popped) continue;
                        var dx = x - b.x, dy = y - bob(b);
                        if (dx * dx + dy * dy < 96 * 96) {
                            b.popped = true;
                            api.sfx('pop');
                            api.burst(b.x, bob(b), b.color, 14);
                            if (--left === 0) api.win();
                            return;
                        }
                    }
                },

                timeout: function () { return left === 0; },

                draw: function (g) {
                    var fy = MG.H - 150;
                    g.fillStyle = MG.shade('#A9E34B', 0.85);
                    g.fillRect(0, fy, MG.W, MG.H - fy);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, fy - 4, MG.W, 8);
                    MG.drawMig(g, 360, fy - 76, 68, left === 0 ? 'happy' : (api.done ? 'sad' : 'wow'), t, { lookY: -1 });

                    for (var i = 0; i < balloons.length; i++) {
                        var b = balloons[i];
                        if (b.popped) continue;
                        var y = bob(b);
                        g.beginPath();
                        g.moveTo(b.x, y + 90);
                        g.quadraticCurveTo(b.x + 18, y + 140, b.x - 6, y + 190);
                        g.lineWidth = 5;
                        g.strokeStyle = MG.INK;
                        g.stroke();
                        g.beginPath();
                        g.moveTo(b.x - 14, y + 96); g.lineTo(b.x, y + 78); g.lineTo(b.x + 14, y + 96);
                        g.closePath();
                        g.fillStyle = b.color; g.fill();
                        g.lineWidth = 6; g.lineJoin = 'round'; g.stroke();
                        D.ellipse(g, b.x, y, 72, 86, b.color, 7);
                        D.ellipse(g, b.x - 26, y - 34, 16, 24, 'rgba(255,255,255,0.55)');
                    }
                }
            };
        }
    });
})();
