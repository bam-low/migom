(function () {
    'use strict';

    var D = MG.draw, E = MG.engine;

    function drawPot(g, x, y, rot) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        D.ellipse(g, -20, -42, 22, 13, '#51CF66', 5);
        D.ellipse(g, 20, -44, 22, 13, '#51CF66', 5);
        D.ellipse(g, 0, -56, 14, 22, '#69DB7C', 5);
        g.beginPath();
        g.moveTo(-44, -26); g.lineTo(44, -26); g.lineTo(32, 40); g.lineTo(-32, 40);
        g.closePath();
        g.fillStyle = '#E8590C';
        g.fill();
        g.lineWidth = 7; g.lineJoin = 'round'; g.strokeStyle = MG.INK; g.stroke();
        D.box(g, -52, -36, 104, 22, 8, '#F76707', 6);
        g.restore();
    }

    MG.games.push({
        id: 'dodge',
        bg: '#FFD8A8',
        dur: 4.6,
        cmd: { ru: 'Увернись!', en: 'Dodge!' },
        hint: { ru: 'двигайся, не стой на месте', en: "keep moving, don't stand still" },

        make: function (api) {
            var interval = 0.7 / Math.pow(api.speed, 0.5);
            var fall = 820 * Math.pow(api.speed, 0.45);
            var t = 0, next = 0.3, x = 360, pots = [], hit = false;

            function floorY() { return MG.H - 150; }

            return {
                update: function (dt) {
                    t += dt;
                    if (!hit) {
                        var target = MG.clamp(E.pointer.x, 90, 630);
                        x += (target - x) * Math.min(1, dt * 14);
                    }
                    if (!api.done && t >= next) {
                        next += interval;
                        // Большинство горшков летит прямо в Мига: стоять на месте нельзя.
                        var px = Math.random() < 0.55 ? MG.clamp(x + MG.rand(-40, 40), 70, 650) : MG.rand(70, 650);
                        pots.push({ x: px, y: -90, rot: MG.rand(-0.3, 0.3) });
                    }
                    var fy = floorY(), migY = fy - 78;
                    for (var i = pots.length - 1; i >= 0; i--) {
                        var p = pots[i];
                        p.y += fall * dt;
                        if (!api.done && Math.abs(p.x - x) < 82 && p.y > migY - 95 && p.y < migY + 40) {
                            hit = true;
                            api.sfx('slap');
                            api.burst(p.x, p.y, '#E8590C', 16);
                            pots.splice(i, 1);
                            api.lose();
                        } else if (p.y > fy - 34) {
                            api.burst(p.x, fy - 20, '#E8590C', 8, 320);
                            pots.splice(i, 1);
                        }
                    }
                },

                // Продержался до конца таймера — победа.
                timeout: function () { return true; },

                draw: function (g) {
                    var fy = floorY(), i;
                    g.fillStyle = MG.shade('#FFD8A8', 0.86);
                    g.fillRect(0, fy, MG.W, MG.H - fy);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, fy - 4, MG.W, 8);

                    // Тень показывает, куда упадёт горшок
                    for (i = 0; i < pots.length; i++) {
                        var k = MG.clamp(pots[i].y / (fy - 60), 0, 1);
                        D.ellipse(g, pots[i].x, fy + 24, 30 + 34 * k, 8 + 8 * k, 'rgba(35,35,59,' + (0.12 + 0.2 * k) + ')');
                    }

                    var mood = hit ? 'sad' : (api.done ? 'happy' : 'wow');
                    MG.drawMig(g, x, fy - 78, 70, mood, t * 1.6, { lookY: -1 });
                    for (i = 0; i < pots.length; i++) drawPot(g, pots[i].x, pots[i].y, pots[i].rot);
                }
            };
        }
    });
})();
