(function () {
    'use strict';

    var D = MG.draw;
    var HIT_R = 105;

    function drawMosquito(g, x, y, dir, t, dead) {
        g.save();
        g.translate(x, y);
        g.scale(dir * 1.7, 1.7);
        g.strokeStyle = MG.INK;
        g.lineCap = 'round';
        g.lineWidth = 3;
        // Ноги
        for (var i = -1; i <= 1; i++) {
            g.beginPath();
            g.moveTo(i * 9, 6);
            g.lineTo(i * 14 - 4, 24);
            g.stroke();
        }
        // Крылья
        var flap = dead ? 4 : 9 + 9 * Math.abs(Math.sin(t * 45));
        D.ellipse(g, -8, -14, 20, flap, 'rgba(255,255,255,0.8)', 2.5);
        D.ellipse(g, 6, -14, 18, flap * 0.8, 'rgba(255,255,255,0.8)', 2.5);
        // Тело, голова, хоботок
        D.ellipse(g, -8, 0, 22, 10, MG.INK);
        D.ellipse(g, 18, -2, 11, 11, MG.INK);
        g.lineWidth = 3.5;
        g.beginPath(); g.moveTo(27, 0); g.lineTo(46, 8); g.stroke();
        if (dead) {
            g.strokeStyle = '#FFFFFF';
            g.lineWidth = 2.5;
            g.beginPath();
            g.moveTo(14, -6); g.lineTo(22, 2);
            g.moveTo(22, -6); g.lineTo(14, 2);
            g.stroke();
        } else {
            D.ellipse(g, 21, -4, 4, 4, '#FFFFFF');
        }
        g.restore();
    }

    MG.games.push({
        id: 'swat',
        bg: '#8CE99A',
        dur: 5.0,
        cmd: { ru: 'Хлоп!', en: 'Swat!' },
        hint: { ru: 'прихлопни всех', en: 'swat them all' },

        make: function (api) {
            // Пальцами по экрану бить быстрее, чем целиться мышью: на телефоне комаров несколько, на компьютере один.
            var count = MG.touch ? Math.min(5, 3 + Math.floor((api.speed - 1) / 0.45)) : 1;
            var f = 0.75 * Math.pow(api.speed, 0.6) * (count > 1 ? 0.85 : 1);
            var bugs = [];
            for (var i = 0; i < count; i++) {
                bugs.push({
                    a: 2.3 * f * MG.rand(0.8, 1.2), b: 3.1 * f * MG.rand(0.8, 1.2),
                    p1: MG.rand(0, 6.28), p2: MG.rand(0, 6.28),
                    dead: false, x: 0, y: 0, fall: 0, prevX: 0, dir: 1
                });
            }
            var t = 0, left = count, fled = 0, slaps = [];

            function place(bug) {
                if (bug.dead) return;
                var top = 330, bottom = MG.H - 330;
                var cy = (top + bottom) / 2, ay = (bottom - top) / 2;
                bug.x = 360 + 250 * Math.sin(bug.a * t + bug.p1) + 35 * Math.sin(7.3 * t + bug.p2);
                bug.y = cy + ay * Math.sin(bug.b * t + bug.p2) + 28 * Math.cos(9.1 * t + bug.p1);
            }
            bugs.forEach(place);

            return {
                update: function (dt) {
                    t += dt;
                    if (api.done && left > 0) fled += 1400 * dt;
                    for (var i = 0; i < bugs.length; i++) {
                        var bug = bugs[i];
                        if (bug.dead) { bug.fall += 500 * dt; continue; }
                        place(bug);
                        if (Math.abs(bug.x - bug.prevX) > 0.5) bug.dir = bug.x > bug.prevX ? 1 : -1;
                        bug.prevX = bug.x;
                    }
                    for (var j = slaps.length - 1; j >= 0; j--) {
                        slaps[j].t += dt;
                        if (slaps[j].t > 0.3) slaps.splice(j, 1);
                    }
                },

                down: function (x, y) {
                    var best = null, bestD = HIT_R * HIT_R;
                    for (var i = 0; i < bugs.length; i++) {
                        if (bugs[i].dead) continue;
                        var dx = x - bugs[i].x, dy = y - bugs[i].y, d = dx * dx + dy * dy;
                        if (d < bestD) { bestD = d; best = bugs[i]; }
                    }
                    slaps.push({ x: x, y: y, t: 0, hit: !!best });
                    if (!best) { api.sfx('miss'); return; }
                    best.dead = true;
                    api.sfx('slap');
                    api.burst(best.x, best.y, MG.WHITE, 14);
                    api.shake(10, 0.2);
                    if (--left === 0) api.win();
                },

                timeout: function () { return left === 0; },

                draw: function (g) {
                    var fy = MG.H - 150, i;
                    g.fillStyle = MG.shade('#8CE99A', 0.85);
                    g.fillRect(0, fy, MG.W, MG.H - fy);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, fy - 4, MG.W, 8);

                    // Миг следит за первым живым комаром
                    var watch = null;
                    for (i = 0; i < bugs.length; i++) if (!bugs[i].dead) { watch = bugs[i]; break; }
                    var mood = left === 0 ? 'happy' : (api.done ? 'sad' : 'wow');
                    MG.drawMig(g, 360, fy - 88, 80, mood, t, {
                        lookX: watch ? MG.clamp((watch.x - 360) / 250, -1, 1) : 0,
                        lookY: -0.8
                    });

                    for (i = 0; i < slaps.length; i++) {
                        var s = slaps[i], k = s.t / 0.3;
                        g.globalAlpha = 1 - k;
                        D.ellipse(g, s.x, s.y, 50 + 50 * k, 50 + 50 * k, s.hit ? MG.GOLD : 'rgba(255,255,255,0.7)', 6);
                        g.globalAlpha = 1;
                    }

                    for (i = 0; i < bugs.length; i++) {
                        var bug = bugs[i];
                        drawMosquito(g, bug.x, bug.y + bug.fall - (bug.dead ? 0 : fled), bug.dir, t + i, bug.dead);
                    }
                }
            };
        }
    });
})();
