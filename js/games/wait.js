(function () {
    'use strict';

    var D = MG.draw;

    MG.games.push({
        id: 'wait',
        bg: '#5F5FC4',
        dur: 3.4,
        cmd: { ru: 'Не трогай!', en: "Don't touch!" },
        hint: { ru: 'руки прочь от кнопки', en: 'hands off the button' },

        make: function (api) {
            var t = 0, pressed = false;

            return {
                update: function (dt) { t += dt; },

                down: function () {
                    pressed = true;
                    api.sfx('boom');
                    api.burst(360, MG.H * 0.55, MG.GOLD, 34, 900);
                    api.shake(24, 0.45);
                    api.lose();
                },

                // Единственная микроигра, где победа — это дотерпеть до конца таймера.
                timeout: function () { return true; },

                draw: function (g) {
                    var by = MG.H * 0.55, fy = MG.H - 170;
                    g.fillStyle = MG.shade('#5F5FC4', 0.8);
                    g.fillRect(0, fy, MG.W, MG.H - fy);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, fy - 4, MG.W, 8);

                    // Манящее свечение
                    if (!api.done) {
                        for (var i = 0; i < 3; i++) {
                            var k = (t * 0.9 + i / 3) % 1;
                            g.globalAlpha = 0.35 * (1 - k);
                            D.ellipse(g, 360, by, 170 + 190 * k, 110 + 130 * k, '#FF6B6B');
                        }
                        g.globalAlpha = 1;
                    }

                    // Тумба и кнопка
                    D.box(g, 190, by + 40, 340, fy - by - 40, 26, '#C9CCD9', 8);
                    D.box(g, 170, by + 20, 380, 60, 24, '#E9ECF5', 8);
                    var pulse = pressed ? 1 : 1 + 0.05 * Math.sin(t * 10);
                    var ry = pressed ? 34 : 96 * pulse;
                    D.ellipse(g, 360, by + 26 - ry * 0.5, 150 * pulse, ry, MG.BAD, 9);
                    if (!pressed) D.ellipse(g, 318, by - 62, 46, 20, 'rgba(255,255,255,0.45)');

                    // Стрелка-искушение
                    if (!api.done) {
                        var ay = by - 250 + Math.sin(t * 8) * 16;
                        g.beginPath();
                        g.moveTo(330, ay - 70); g.lineTo(390, ay - 70); g.lineTo(390, ay);
                        g.lineTo(424, ay); g.lineTo(360, ay + 64); g.lineTo(296, ay); g.lineTo(330, ay);
                        g.closePath();
                        g.fillStyle = MG.WHITE; g.fill();
                        g.lineWidth = 8; g.lineJoin = 'round'; g.strokeStyle = MG.INK; g.stroke();
                    }

                    var mood = pressed ? 'sad' : (api.done ? 'happy' : 'wow');
                    MG.drawMig(g, 108, fy - 72, 64, mood, t, { lookX: 1 });
                }
            };
        }
    });
})();
