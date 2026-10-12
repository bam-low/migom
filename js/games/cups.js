(function () {
    'use strict';

    var D = MG.draw;
    var SLOTS = [150, 360, 570];

    function drawCup(g, x, y) {
        g.beginPath();
        g.moveTo(x - 62, y - 95);
        g.lineTo(x + 62, y - 95);
        g.lineTo(x + 96, y + 95);
        g.lineTo(x - 96, y + 95);
        g.closePath();
        g.fillStyle = '#FF6B6B';
        g.fill();
        g.lineWidth = 8;
        g.lineJoin = 'round';
        g.strokeStyle = MG.INK;
        g.stroke();
        g.fillStyle = MG.WHITE;
        g.fillRect(x - 86, y + 44, 172, 20);
    }

    MG.games.push({
        id: 'cups',
        bg: '#63E6BE',
        dur: 6.6,
        cmd: { ru: 'Следи!', en: 'Watch!' },
        hint: { ru: 'где шарик?', en: "where's the ball?" },

        make: function (api) {
            var cups = SLOTS.map(function (x) { return { x: x, lift: 0, depth: 0 }; });
            var ball = MG.randInt(0, 2);
            var swaps = Math.min(6, 3 + Math.floor((api.speed - 1) / 0.3));
            var swapDur = 0.44 / Math.pow(api.speed, 0.5);
            var showDur = 0.8 / Math.pow(api.speed, 0.4);
            var stage = 'show', st = 0, t = 0, made = 0, picked = -1, cur = null;

            function startSwap() {
                var a = MG.randInt(0, 2), b = (a + MG.randInt(1, 2)) % 3;
                cur = { a: a, b: b, ax: cups[a].x, bx: cups[b].x };
                api.sfx('whoosh');
            }

            return {
                update: function (dt) {
                    t += dt;
                    st += dt;
                    if (stage === 'show') {
                        var k = st / showDur;
                        cups[ball].lift = 1 - MG.clamp((k - 0.55) / 0.45, 0, 1);
                        if (k >= 1) { stage = 'shuffle'; st = 0; startSwap(); }
                    } else if (stage === 'shuffle') {
                        var s = Math.min(1, st / swapDur), e = s * s * (3 - 2 * s);
                        var A = cups[cur.a], B = cups[cur.b];
                        A.x = MG.lerp(cur.ax, cur.bx, e);
                        B.x = MG.lerp(cur.bx, cur.ax, e);
                        A.depth = Math.sin(Math.PI * s);
                        B.depth = -Math.sin(Math.PI * s);
                        if (s >= 1) {
                            A.depth = B.depth = 0;
                            st = 0;
                            if (++made >= swaps) stage = 'pick'; else startSwap();
                        }
                    } else if (stage === 'reveal') {
                        cups[picked].lift = Math.min(1, st / 0.18);
                        if (picked !== ball) cups[ball].lift = MG.clamp((st - 0.2) / 0.18, 0, 1);
                    }
                },

                down: function (x, y) {
                    if (stage !== 'pick') return;
                    var cy = MG.H * 0.56;
                    for (var i = 0; i < 3; i++) {
                        if (Math.abs(x - cups[i].x) < 105 && y > cy - 200 && y < cy + 150) {
                            picked = i;
                            stage = 'reveal';
                            st = 0;
                            if (i === ball) { api.sfx('ding'); api.win(); } else api.lose();
                            return;
                        }
                    }
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var cy = MG.H * 0.56, ty = cy + 96;
                    g.fillStyle = MG.shade('#63E6BE', 0.82);
                    g.fillRect(0, ty, MG.W, MG.H - ty);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, ty - 4, MG.W, 8);

                    if (stage === 'show' || stage === 'reveal') {
                        D.ellipse(g, cups[ball].x, cy + 58, 36, 36, MG.GOLD, 7);
                    }

                    // Дальний стакан рисуется первым
                    var order = [0, 1, 2].sort(function (a, b) { return cups[a].depth - cups[b].depth; });
                    for (var i = 0; i < 3; i++) {
                        var c = cups[order[i]];
                        drawCup(g, c.x, cy - c.lift * 160 + c.depth * 40);
                    }

                    if (stage === 'pick') {
                        for (var j = 0; j < 3; j++) {
                            D.text(g, '?', cups[j].x, cy - 170 + Math.sin(t * 8 + j) * 10, 90, MG.WHITE);
                        }
                    }

                    var mood = stage === 'reveal' ? (picked === ball ? 'happy' : 'sad') : 'wow';
                    MG.drawMig(g, 360, MG.H - 130, 66, mood, t, { lookY: -1 });
                }
            };
        }
    });
})();
