(function () {
    'use strict';

    var D = MG.draw, E = MG.engine;

    function drawToast(g, x, y, rot) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        D.box(g, -56, -56, 112, 112, 26, '#D98A3D', 7);
        D.box(g, -38, -38, 76, 76, 16, '#FFE2A8', 0);
        D.box(g, -17, -17, 34, 34, 7, '#FFD23F', 4);
        g.restore();
    }

    MG.games.push({
        id: 'catch',
        bg: '#FFD166',
        dur: 4.8,
        cmd: { ru: 'Лови!', en: 'Catch!' },
        hint: { ru: 'двигай пальцем', en: 'drag to move' },

        make: function (api) {
            var count = api.speed >= 1.4 ? 2 : 1;
            var toasts = [];
            for (var i = 0; i < count; i++) {
                toasts.push({
                    x0: MG.rand(130, 590),
                    t0: (count === 1 ? 0.05 : i * 0.42) * api.dur,
                    t1: (count === 1 ? 0.74 : 0.5 + i * 0.36) * api.dur,
                    phase: MG.rand(0, 6.28),
                    spin: MG.rand(-3, 3),
                    state: 'wait',
                    x: 0, y: -120, off: 0, slot: 0
                });
            }
            var t = 0, plateX = 360, caught = 0, mood = 'idle';

            function floorY() { return MG.H - 150; }
            function plateY() { return floorY() - 176; }

            return {
                update: function (dt) {
                    t += dt;
                    if (mood !== 'sad') {
                        var target = MG.clamp(E.pointer.x, 120, 600);
                        plateX += (target - plateX) * Math.min(1, dt * 16);
                    }
                    for (var i = 0; i < toasts.length; i++) {
                        var b = toasts[i];
                        if (b.state === 'wait' && t >= b.t0) b.state = 'fall';
                        if (b.state === 'fall') {
                            var k = (t - b.t0) / (b.t1 - b.t0);
                            b.x = b.x0 + Math.sin(k * 5 + b.phase) * 45 * (1 - k * 0.6);
                            b.y = MG.lerp(-80, plateY() - 30, Math.pow(Math.min(k, 1), 1.5));
                            if (k >= 1) {
                                if (Math.abs(b.x - plateX) < 140) {
                                    b.state = 'caught';
                                    b.off = MG.clamp(b.x - plateX, -60, 60);
                                    b.slot = caught++;
                                    api.sfx('pop');
                                    api.burst(b.x, b.y, '#FFE2A8', 12);
                                    if (caught === count) { mood = 'happy'; api.win(); }
                                } else {
                                    b.state = 'miss';
                                }
                            }
                        } else if (b.state === 'miss') {
                            b.y += 1500 * dt;
                            if (b.y >= floorY() - 30) {
                                b.y = floorY() - 30;
                                b.state = 'floor';
                                mood = 'sad';
                                api.burst(b.x, b.y, '#D98A3D', 10);
                                api.lose();
                            }
                        } else if (b.state === 'caught') {
                            b.x = plateX + b.off;
                            b.y = plateY() - 30 - b.slot * 34;
                        }
                    }
                },

                timeout: function () { return caught === count; },

                draw: function (g) {
                    var fy = floorY();
                    g.fillStyle = MG.shade('#FFD166', 0.86);
                    g.fillRect(0, fy, MG.W, MG.H - fy);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, fy - 4, MG.W, 8);

                    // Тень на полу подсказывает, куда упадёт тост.
                    for (var i = 0; i < toasts.length; i++) {
                        if (toasts[i].state === 'fall') D.ellipse(g, toasts[i].x, fy + 26, 60, 14, 'rgba(35,35,59,0.22)');
                    }

                    MG.drawMig(g, plateX, fy - 84, 74, mood, t, { lookY: -1 });
                    D.ellipse(g, plateX, plateY(), 128, 24, MG.WHITE, 7);
                    D.ellipse(g, plateX, plateY() - 3, 84, 12, MG.shade('#FFF8F0', 0.9));

                    for (var j = 0; j < toasts.length; j++) {
                        var b = toasts[j];
                        if (b.state === 'wait') continue;
                        var rot = b.state === 'fall' || b.state === 'miss' ? t * b.spin : (b.state === 'floor' ? 0.5 : 0);
                        drawToast(g, b.x, b.y, rot);
                    }
                }
            };
        }
    });
})();
