(function () {
    'use strict';

    var D = MG.draw;
    var COLORS = ['#FF6B6B', '#4DABF7', '#FFD43B', '#69DB7C'];
    var SIZE = 240, STEP = 135;

    MG.games.push({
        id: 'simon',
        bg: '#3B3F6B',
        dur: 7.0,
        cmd: { ru: 'Повтори!', en: 'Repeat!' },
        hint: { ru: 'запомни порядок и нажми так же', en: 'watch the order, then copy it' },

        make: function (api) {
            var n = Math.min(5, 3 + Math.floor((api.speed - 1) / 0.45));
            var seq = [];
            for (var i = 0; i < n; i++) seq.push(MG.randInt(0, 3));
            var stepDur = 0.52 / Math.pow(api.speed, 0.5), gap = 0.13, lead = 0.25;
            var t = 0, stage = 'show', lit = -1, shown = 0, entered = 0, flash = -1, flashT = 0;

            function pad(i) {
                return {
                    x: 360 + (i % 2 ? STEP : -STEP),
                    y: MG.H * 0.58 + (i < 2 ? -STEP : STEP)
                };
            }

            return {
                update: function (dt) {
                    t += dt;
                    if (flashT > 0) flashT -= dt;
                    if (stage !== 'show') return;
                    var k = Math.floor((t - lead) / stepDur);
                    if (t < lead) { lit = -1; return; }
                    if (k >= n) { stage = 'input'; lit = -1; shown = n; return; }
                    var on = (t - lead) - k * stepDur < stepDur - gap ? seq[k] : -1;
                    if (on !== lit && on >= 0) { api.sfx('note' + on); shown = k + 1; }
                    lit = on;
                },

                down: function (x, y) {
                    if (stage !== 'input') return;
                    for (var i = 0; i < 4; i++) {
                        var p = pad(i);
                        if (Math.abs(x - p.x) > SIZE / 2 + 8 || Math.abs(y - p.y) > SIZE / 2 + 8) continue;
                        flash = i;
                        flashT = 0.2;
                        if (i !== seq[entered]) { api.lose(); return; }
                        api.sfx('note' + i);
                        if (++entered === n) api.win();
                        return;
                    }
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var i;
                    for (i = 0; i < 4; i++) {
                        var p = pad(i);
                        var on = (stage === 'show' && lit === i) || (flashT > 0 && flash === i);
                        var s = on ? 1.06 : 1;
                        var color = on ? MG.shade(COLORS[i], 1.25) : MG.shade(COLORS[i], stage === 'show' ? 0.55 : 0.92);
                        g.save();
                        g.translate(p.x, p.y);
                        g.scale(s, s);
                        D.box(g, -SIZE / 2, -SIZE / 2, SIZE, SIZE, 44, color, 9);
                        if (on) D.ellipse(g, -50, -60, 46, 22, 'rgba(255,255,255,0.5)');
                        g.restore();
                    }

                    // Точки: сколько шагов показано, сколько уже повторено
                    var filled = stage === 'show' ? shown : entered;
                    for (i = 0; i < n; i++) {
                        D.ellipse(g, 360 + (i - (n - 1) / 2) * 56, MG.H * 0.58 - STEP - SIZE / 2 - 50, 17, 17,
                            i < filled ? (stage === 'show' ? MG.WHITE : MG.GOOD) : 'rgba(255,255,255,0.2)', 6);
                    }

                    var mood = api.done ? (entered === n ? 'happy' : 'sad') : (stage === 'show' ? 'wow' : 'idle');
                    MG.drawMig(g, 360, MG.H - 110, 56, mood, t, { lookY: -1 });
                }
            };
        }
    });
})();
