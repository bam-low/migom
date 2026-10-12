(function () {
    'use strict';

    var D = MG.draw;
    var PANELS = [{ x: 30, w: 315 }, { x: 375, w: 315 }];

    function drawApple(g, x, y) {
        g.strokeStyle = MG.INK;
        g.lineWidth = 5;
        g.lineCap = 'round';
        g.beginPath(); g.moveTo(x, y - 24); g.lineTo(x + 5, y - 38); g.stroke();
        D.ellipse(g, x + 16, y - 34, 11, 6, '#69DB7C', 4);
        D.ellipse(g, x, y, 28, 27, '#FF6B6B', 6);
        D.ellipse(g, x - 10, y - 9, 7, 5, 'rgba(255,255,255,0.6)');
    }

    MG.games.push({
        id: 'more',
        bg: '#96F2D7',
        dur: 4.6,
        cmd: { ru: 'Больше!', en: 'More!' },
        hint: { ru: 'где яблок больше?', en: 'which side has more?' },

        make: function (api) {
            var hard = api.speed >= 1.4;
            var small = MG.randInt(hard ? 5 : 3, hard ? 9 : 6);
            var big = small + (hard ? MG.randInt(1, 2) : MG.randInt(2, 3));
            var bigSide = Math.random() < 0.5 ? 0 : 1;
            var top = 330, bottom = MG.H - 250;
            var picked = -1, t = 0;

            var piles = PANELS.map(function (panel, side) {
                var n = side === bigSide ? big : small, pts = [], minDist = 74;
                for (var tries = 0; pts.length < n; tries++) {
                    var x = MG.rand(panel.x + 50, panel.x + panel.w - 50);
                    var y = MG.rand(top + 60, bottom - 50), ok = true;
                    for (var j = 0; j < pts.length; j++) {
                        var dx = pts[j].x - x, dy = pts[j].y - y;
                        if (dx * dx + dy * dy < minDist * minDist) { ok = false; break; }
                    }
                    if (ok) pts.push({ x: x, y: y });
                    else if (tries % 40 === 39) minDist -= 6;
                }
                return pts;
            });

            return {
                update: function (dt) { t += dt; },

                down: function (x, y) {
                    if (y < top - 20) return;
                    picked = x < MG.W / 2 ? 0 : 1;
                    if (picked === bigSide) { api.sfx('ding'); api.win(); } else api.lose();
                },

                timeout: function () { return false; },

                draw: function (g) {
                    for (var side = 0; side < 2; side++) {
                        var panel = PANELS[side];
                        D.box(g, panel.x, top, panel.w, bottom - top, 34, MG.WHITE, 8);
                        if (api.done && side === bigSide) {
                            D.rr(g, panel.x, top, panel.w, bottom - top, 34);
                            g.lineWidth = 16;
                            g.strokeStyle = MG.GOOD;
                            g.stroke();
                        }
                        for (var i = 0; i < piles[side].length; i++) {
                            drawApple(g, piles[side][i].x, piles[side][i].y);
                        }
                    }
                    var mood = api.done ? (picked === bigSide ? 'happy' : 'sad') : 'wow';
                    MG.drawMig(g, 360, MG.H - 130, 62, mood, t, { lookX: Math.sin(t * 3) });
                }
            };
        }
    });
})();
