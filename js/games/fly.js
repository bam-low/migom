(function () {
    'use strict';

    var D = MG.draw;
    var X = 220, R = 48, PIPE_W = 110, TOP = 290;
    var GRAVITY = 1800, FLAP = -620;

    MG.games.push({
        id: 'fly',
        bg: '#66D9E8',
        dur: 5.4,
        cmd: { ru: 'Лети!', en: 'Fly!' },
        hint: { ru: 'тапай, чтобы махать крыльями', en: 'tap to flap' },

        make: function (api) {
            var count = api.speed >= 1.5 ? 3 : 2;
            var gap = api.speed >= 1.5 ? 330 : 370;
            var v = 400 * Math.pow(api.speed, 0.5);
            var arrive = count === 2 ? [0.5, 0.84] : [0.4, 0.64, 0.88];
            var floor0 = MG.H - 150;
            var gates = [];
            for (var i = 0; i < count; i++) {
                gates.push({
                    x: X + v * arrive[i] * api.dur,
                    // Положение просвета — в долях высоты, чтобы пережить смену размера экрана.
                    k: MG.rand(0, 1),
                    passed: false
                });
            }
            var t = 0, y = (TOP + floor0) / 2, vy = -200, passed = 0, crashed = false, flapT = 0;

            function floorY() { return MG.H - 150; }
            function gateY(gate) {
                var lo = TOP + gap / 2 + 60, hi = floorY() - gap / 2 - 60;
                return lo + (hi - lo) * gate.k;
            }

            function crash() {
                crashed = true;
                api.sfx('slap');
                api.shake(12, 0.25);
                api.burst(X, y, MG.WHITE, 16);
                api.lose();
            }

            return {
                update: function (dt) {
                    t += dt;
                    if (flapT > 0) flapT -= dt;
                    var fy = floorY();
                    if (crashed) {
                        vy += GRAVITY * dt;
                        y = Math.min(fy - R, y + vy * dt);
                        return;
                    }
                    if (api.done) {
                        // После победы Миг плавно выравнивается, а не падает.
                        y += ((TOP + fy) / 2 - y) * Math.min(1, dt * 3);
                    } else {
                        vy += GRAVITY * dt;
                        y += vy * dt;
                        if (y < TOP + R) { y = TOP + R; vy = 0; }
                        if (y > fy - R) { y = fy - R; crash(); return; }
                    }
                    for (var i = 0; i < gates.length; i++) {
                        var gate = gates[i];
                        gate.x -= v * dt;
                        if (api.done || gate.passed) continue;
                        if (Math.abs(gate.x - X) < PIPE_W / 2 + R * 0.7 && Math.abs(y - gateY(gate)) > gap / 2 - R * 0.75) {
                            crash();
                            return;
                        }
                        if (gate.x < X - PIPE_W / 2 - R) {
                            gate.passed = true;
                            api.sfx('pop');
                            if (++passed === count) api.win();
                        }
                    }
                },

                down: function () {
                    if (crashed) return;
                    vy = FLAP;
                    flapT = 0.16;
                    api.sfx('whoosh');
                },

                timeout: function () { return passed === count; },

                draw: function (g) {
                    var fy = floorY(), i;
                    for (i = 0; i < 3; i++) {
                        var cx = (((i * 330 - t * 60) % 1000) + 1000) % 1000 - 140;
                        D.ellipse(g, cx, 380 + i * 160, 80, 30, 'rgba(255,255,255,0.7)');
                    }

                    for (i = 0; i < gates.length; i++) {
                        var gate = gates[i], gy = gateY(gate), px = gate.x - PIPE_W / 2;
                        var upper = gy - gap / 2, lower = gy + gap / 2;
                        D.box(g, px, TOP - 40, PIPE_W, upper - TOP + 40, 10, '#51CF66', 8);
                        D.box(g, px - 12, upper - 44, PIPE_W + 24, 44, 12, '#69DB7C', 8);
                        D.box(g, px, lower, PIPE_W, fy - lower + 20, 10, '#51CF66', 8);
                        D.box(g, px - 12, lower, PIPE_W + 24, 44, 12, '#69DB7C', 8);
                    }

                    g.fillStyle = MG.shade('#66D9E8', 0.8);
                    g.fillRect(0, fy, MG.W, MG.H - fy);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, fy - 4, MG.W, 8);

                    // Крылья
                    var wing = flapT > 0 ? -0.9 : 0.35 + Math.sin(t * 9) * 0.15;
                    for (var s = -1; s <= 1; s += 2) {
                        g.save();
                        g.translate(X + s * R * 0.8, y - 4);
                        g.rotate(s * wing);
                        D.ellipse(g, s * 26, 0, 34, 16, MG.WHITE, 6);
                        g.restore();
                    }
                    var mood = crashed ? 'sad' : (api.done ? 'happy' : 'idle');
                    MG.drawMig(g, X, y, R, mood, t, { lookX: 1 });
                }
            };
        }
    });
})();
