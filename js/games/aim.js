(function () {
    'use strict';

    var D = MG.draw;
    var FLIGHT = 0.32;      // время полёта стрелы — мишень надо брать с упреждением

    function drawArrow(g, x, y) {
        g.strokeStyle = MG.INK;
        g.lineCap = 'round';
        g.lineWidth = 12;
        g.beginPath(); g.moveTo(x, y + 110); g.lineTo(x, y); g.stroke();
        g.beginPath();
        g.moveTo(x - 26, y + 6); g.lineTo(x, y - 40); g.lineTo(x + 26, y + 6);
        g.closePath();
        g.fillStyle = '#C9CCD9'; g.fill();
        g.lineWidth = 7; g.lineJoin = 'round'; g.stroke();
        g.beginPath();
        g.moveTo(x - 22, y + 128); g.lineTo(x, y + 96); g.lineTo(x + 22, y + 128);
        g.lineWidth = 9; g.stroke();
    }

    MG.games.push({
        id: 'aim',
        bg: '#FF8787',
        dur: 5.0,
        cmd: { ru: 'Целься!', en: 'Aim!' },
        hint: { ru: 'один выстрел, бей на опережение', en: 'one shot — lead the target' },

        make: function (api) {
            var period = 3.2 / Math.pow(api.speed, 0.6);
            var phase = MG.rand(0, 1);
            var t = 0, shot = -1, result = null, tx = 360;

            function targetX(time) {
                var u = (phase + time / period) % 1;
                return 110 + 500 * (1 - Math.abs(2 * u - 1));
            }

            return {
                update: function (dt) {
                    t += dt;
                    if (result !== 'hit') tx = targetX(t);
                    if (shot < 0) return;
                    shot += dt;
                    if (result === null && shot >= FLIGHT) {
                        if (Math.abs(tx - 360) < 70) {
                            result = 'hit';
                            api.sfx('ding');
                            api.burst(360, 440, MG.WHITE, 18);
                            api.shake(8, 0.15);
                            api.win();
                        } else {
                            result = 'miss';
                            api.lose();
                        }
                    }
                },

                down: function () {
                    if (shot < 0) { shot = 0; api.sfx('whoosh'); }
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var ty = 440, fy = MG.H - 150, startY = fy - 290;
                    g.fillStyle = MG.shade('#FF8787', 0.85);
                    g.fillRect(0, fy, MG.W, MG.H - fy);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, fy - 4, MG.W, 8);

                    // Рельс, по которому ездит мишень, и линия выстрела
                    g.strokeStyle = 'rgba(35,35,59,0.3)';
                    g.lineWidth = 8;
                    g.setLineDash([22, 18]);
                    g.beginPath(); g.moveTo(60, ty); g.lineTo(660, ty); g.stroke();
                    g.beginPath(); g.moveTo(360, ty + 110); g.lineTo(360, startY - 60); g.stroke();
                    g.setLineDash([]);

                    D.ellipse(g, tx, ty, 82, 82, MG.BAD, 8);
                    D.ellipse(g, tx, ty, 56, 56, MG.WHITE);
                    D.ellipse(g, tx, ty, 30, 30, MG.BAD);

                    var ay = startY;
                    if (shot >= 0) {
                        var k = shot / FLIGHT;
                        ay = result === 'hit' ? ty + 20 : MG.lerp(startY, ty + 20, k);
                    }
                    drawArrow(g, 360, ay);

                    var mood = result === 'hit' ? 'happy' : (result === 'miss' ? 'sad' : 'idle');
                    MG.drawMig(g, 360, fy - 80, 72, mood, t, { lookY: -1 });
                }
            };
        }
    });
})();
