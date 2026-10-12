(function () {
    'use strict';

    var D = MG.draw, E = MG.engine;
    var START_X = 90, GOAL_X = 630;
    var GRACE = 0.18;       // столько можно «не успеть отпустить» после красного

    MG.games.push({
        id: 'walk',
        bg: '#868E96',
        dur: 6.0,
        cmd: { ru: 'Иди!', en: 'Walk!' },
        hint: { ru: 'держи — идёшь, на красный стой', en: 'hold to walk, stop on red' },

        make: function (api) {
            var k = Math.pow(api.speed, 0.4);
            var walkV = 300 * Math.pow(api.speed, 0.35);
            var t = 0, x = START_X, phase = 'green', left = MG.rand(0.8, 1.2) / k;
            var onRed = 0, walking = false, caught = false;

            function nextPhase() {
                if (phase === 'green') { phase = 'yellow'; left = 0.35 / k; }
                else if (phase === 'yellow') { phase = 'red'; left = MG.rand(0.7, 1.0) / k; }
                else { phase = 'green'; left = MG.rand(0.8, 1.2) / k; }
            }

            return {
                update: function (dt) {
                    t += dt;
                    if (api.done) { walking = false; return; }
                    left -= dt;
                    if (left <= 0) nextPhase();
                    walking = E.pointer.down;
                    if (!walking) { onRed = 0; return; }
                    if (phase === 'red') {
                        onRed += dt;
                        walking = false;
                        if (onRed > GRACE) { caught = true; api.shake(14, 0.3); api.lose(); }
                        return;
                    }
                    onRed = 0;
                    x += walkV * dt;
                    if (x >= GOAL_X) { x = GOAL_X; api.win(); }
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var roadTop = MG.H * 0.56, roadH = 250, i;

                    // Дорога и «зебра»
                    g.fillStyle = '#495057';
                    g.fillRect(0, roadTop, MG.W, roadH);
                    g.fillStyle = MG.WHITE;
                    for (i = 0; i < 7; i++) g.fillRect(150 + i * 64, roadTop + 26, 36, roadH - 52);
                    g.fillStyle = '#CED4DA';
                    g.fillRect(0, roadTop, 40, roadH);
                    g.fillRect(MG.W - 40, roadTop, 40, roadH);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, roadTop - 4, MG.W, 8);
                    g.fillRect(0, roadTop + roadH - 4, MG.W, 8);

                    // Финиш
                    D.box(g, GOAL_X + 46, roadTop - 150, 12, 220, 6, MG.INK, 0);
                    g.beginPath();
                    g.moveTo(GOAL_X + 58, roadTop - 146); g.lineTo(GOAL_X + 4, roadTop - 116); g.lineTo(GOAL_X + 58, roadTop - 86);
                    g.closePath();
                    g.fillStyle = MG.GOOD; g.fill();
                    g.lineWidth = 6; g.lineJoin = 'round'; g.strokeStyle = MG.INK; g.stroke();

                    // Светофор
                    var ly = roadTop - 330;
                    D.box(g, 344, ly + 280, 32, 60, 8, MG.INK, 0);
                    D.box(g, 290, ly - 20, 140, 310, 30, '#343A40', 8);
                    var lamps = [['red', MG.BAD], ['yellow', '#FFD43B'], ['green', MG.GOOD]];
                    for (i = 0; i < 3; i++) {
                        var on = phase === lamps[i][0];
                        D.ellipse(g, 360, ly + 38 + i * 96, 40, 40, on ? lamps[i][1] : 'rgba(255,255,255,0.12)', 6);
                        if (on) D.ellipse(g, 348, ly + 26 + i * 96, 13, 9, 'rgba(255,255,255,0.55)');
                    }

                    var mood = caught ? 'sad' : (x >= GOAL_X ? 'happy' : (phase === 'red' ? 'wow' : 'idle'));
                    MG.drawMig(g, x, roadTop + roadH / 2 - 30, 62, mood, walking ? t * 3 : t, { lookX: 1 });
                }
            };
        }
    });
})();
