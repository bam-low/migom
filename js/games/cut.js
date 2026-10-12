(function () {
    'use strict';

    var D = MG.draw, E = MG.engine;
    var LEFT = 130, RIGHT = 590, LOAF_H = 150;

    MG.games.push({
        id: 'cut',
        bg: '#FFC078',
        dur: 4.8,
        cmd: { ru: 'Режь!', en: 'Slice!' },
        hint: { ru: 'проведи поперёк батона', en: 'swipe across the loaf' },

        make: function (api) {
            var need = api.speed >= 1.5 ? 3 : 2;
            var cuts = [], trail = [], prev = null, t = 0;

            function midY() { return MG.H * 0.55; }

            function farFromCuts(x) {
                for (var i = 0; i < cuts.length; i++) if (Math.abs(cuts[i] - x) < 46) return false;
                return true;
            }

            return {
                update: function (dt) {
                    t += dt;
                    var p = E.pointer, cy = midY();
                    if (p.down && !api.done) {
                        // Разрез засчитывается, когда палец пересёк середину батона сверху вниз или снизу вверх.
                        if (prev && (prev.y < cy) !== (p.y < cy)) {
                            var k = (cy - prev.y) / (p.y - prev.y);
                            var x = prev.x + (p.x - prev.x) * k;
                            if (x > LEFT + 30 && x < RIGHT - 30 && farFromCuts(x)) {
                                cuts.push(x);
                                api.sfx('slice');
                                api.burst(x, cy, '#FFE2A8', 10, 380);
                                api.shake(6, 0.12);
                                if (cuts.length >= need) api.win();
                            }
                        }
                        prev = { x: p.x, y: p.y };
                        trail.push({ x: p.x, y: p.y, age: 0 });
                    } else {
                        prev = null;
                    }
                    for (var i = trail.length - 1; i >= 0; i--) {
                        trail[i].age += dt;
                        if (trail[i].age > 0.22) trail.splice(i, 1);
                    }
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var cy = midY(), i;
                    D.box(g, 70, cy - 140, 580, 300, 40, '#B08968', 8);
                    D.ellipse(g, 600, cy + 110, 16, 16, MG.shade('#B08968', 0.7));

                    // Куски батона слегка разъезжаются после каждого разреза
                    var edges = [LEFT].concat(cuts.slice().sort(function (a, b) { return a - b; }), [RIGHT]);
                    var pieces = edges.length - 1;
                    for (i = 0; i < pieces; i++) {
                        var shift = (i - (pieces - 1) / 2) * 20;
                        var x = edges[i] + shift, w = edges[i + 1] - edges[i];
                        D.box(g, x, cy - LOAF_H / 2, w, LOAF_H, 34, '#D98A3D', 8);
                        if (w > 50) D.box(g, x + 16, cy - LOAF_H / 2 + 18, w - 32, 34, 17, '#F2B66B', 0);
                    }

                    // Пунктир подсказывает, сколько разрезов осталось
                    var remaining = need - cuts.length;
                    if (remaining > 0 && !api.done) {
                        g.strokeStyle = MG.WHITE;
                        g.lineWidth = 7;
                        g.setLineDash([16, 14]);
                        g.lineDashOffset = -t * 60;
                        for (i = 1; i <= need; i++) {
                            var gx = LEFT + (RIGHT - LEFT) * i / (need + 1);
                            if (!farFromCuts(gx)) continue;
                            g.beginPath(); g.moveTo(gx, cy - 190); g.lineTo(gx, cy + 190); g.stroke();
                        }
                        g.setLineDash([]);
                    }

                    if (trail.length > 1) {
                        g.lineCap = 'round';
                        g.lineJoin = 'round';
                        g.strokeStyle = MG.WHITE;
                        g.lineWidth = 12;
                        g.beginPath();
                        g.moveTo(trail[0].x, trail[0].y);
                        for (i = 1; i < trail.length; i++) g.lineTo(trail[i].x, trail[i].y);
                        g.stroke();
                    }

                    var mood = cuts.length >= need ? 'happy' : (api.done ? 'sad' : 'idle');
                    MG.drawMig(g, 360, MG.H - 150, 66, mood, t, { lookY: -1 });
                }
            };
        }
    });
})();
