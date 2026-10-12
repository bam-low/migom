(function () {
    'use strict';

    var D = MG.draw, E = MG.engine;
    var TOP = 350;

    MG.games.push({
        id: 'close',
        bg: '#FFB085',
        dur: 5.0,
        cmd: { ru: 'Закрой!', en: 'Shut it!' },
        hint: { ru: 'тяни штору вниз, дождь идёт', en: "pull the blind down, it's raining" },

        make: function (api) {
            var two = api.speed >= 1.4;
            var layout = two ? [{ x: 50, w: 290 }, { x: 380, w: 290 }] : [{ x: 160, w: 400 }];
            var wins = layout.map(function (l) {
                return { x: l.x, w: l.w, c: 0.14, closed: false, held: false, off: 0 };
            });
            var t = 0, closed = 0;

            function winH() { return Math.min(560, MG.H - 250 - TOP - 40); }

            return {
                update: function (dt) {
                    t += dt;
                    var h = winH();
                    for (var i = 0; i < wins.length; i++) {
                        var w = wins[i];
                        if (!w.held) continue;
                        if (!E.pointer.down || api.done) { w.held = false; continue; }
                        w.c = MG.clamp((E.pointer.y - w.off - TOP) / h, 0.08, 1);
                        if (w.c >= 0.96) {
                            w.c = 1;
                            w.closed = true;
                            w.held = false;
                            api.sfx('slap');
                            api.shake(8, 0.15);
                            api.burst(w.x + w.w / 2, TOP + h, MG.WHITE, 10, 300);
                            if (++closed === wins.length) api.win();
                        }
                    }
                },

                down: function (x, y) {
                    var h = winH();
                    for (var i = 0; i < wins.length; i++) {
                        var w = wins[i], edge = TOP + w.c * h;
                        if (!w.closed && x > w.x - 20 && x < w.x + w.w + 20 && Math.abs(y - edge) < 130) {
                            w.held = true;
                            w.off = y - edge;
                            return;
                        }
                    }
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var h = winH(), fy = MG.H - 150, i;
                    g.fillStyle = MG.shade('#FFB085', 0.84);
                    g.fillRect(0, fy, MG.W, MG.H - fy);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, fy - 4, MG.W, 8);

                    for (i = 0; i < wins.length; i++) {
                        var w = wins[i], edge = TOP + w.c * h;
                        D.box(g, w.x - 18, TOP - 18, w.w + 36, h + 36, 22, MG.WHITE, 8);

                        // Небо с дождём за окном
                        g.save();
                        g.beginPath();
                        g.rect(w.x, TOP, w.w, h);
                        g.clip();
                        g.fillStyle = '#5C7CFA';
                        g.fillRect(w.x, TOP, w.w, h);
                        D.ellipse(g, w.x + w.w * 0.5, TOP + 120, w.w * 0.42, 60, '#DEE2FF');
                        D.ellipse(g, w.x + w.w * 0.28, TOP + 150, w.w * 0.26, 44, '#DEE2FF');
                        g.strokeStyle = '#C5F6FA';
                        g.lineWidth = 6;
                        g.lineCap = 'round';
                        for (var d = 0; d < 9; d++) {
                            var rx = w.x + ((d * 97 + i * 40) % w.w);
                            var ry = TOP + ((t * 900 + d * 173) % (h + 60)) - 30;
                            g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - 8, ry + 34); g.stroke();
                        }

                        // Штора
                        g.fillStyle = '#8D99AE';
                        g.fillRect(w.x, TOP, w.w, edge - TOP);
                        g.strokeStyle = MG.shade('#8D99AE', 0.75);
                        g.lineWidth = 5;
                        for (var sy = edge - 34; sy > TOP; sy -= 34) {
                            g.beginPath(); g.moveTo(w.x, sy); g.lineTo(w.x + w.w, sy); g.stroke();
                        }
                        g.restore();

                        g.strokeStyle = MG.INK;
                        g.lineWidth = 8;
                        g.strokeRect(w.x, TOP, w.w, h);
                        D.box(g, w.x - 10, edge - 24, w.w + 20, 48, 18, MG.GOLD, 7);
                        D.ellipse(g, w.x + w.w / 2, edge, 15, 15, MG.WHITE, 5);

                        if (!w.closed && !w.held && !api.done) {
                            var ay = edge + 70 + Math.sin(t * 8) * 14, ax = w.x + w.w / 2;
                            g.beginPath();
                            g.moveTo(ax - 34, ay); g.lineTo(ax + 34, ay); g.lineTo(ax, ay + 44);
                            g.closePath();
                            g.fillStyle = MG.WHITE; g.fill();
                            g.lineWidth = 7; g.lineJoin = 'round'; g.strokeStyle = MG.INK; g.stroke();
                        }
                    }

                    var mood = closed === wins.length ? 'happy' : (api.done ? 'sad' : 'wow');
                    MG.drawMig(g, 360, fy + 66, 56, mood, t, { lookY: -1 });
                }
            };
        }
    });
})();
