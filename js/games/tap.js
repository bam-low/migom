(function () {
    'use strict';

    var D = MG.draw;
    var TAPS_PER_COIN = 3, MAX_COINS = 12;

    // Бонусная микроигра: проиграть нельзя, чем чаще жмёшь — тем больше монет.
    MG.games.push({
        id: 'tap',
        bonus: true,
        bg: '#FFC93C',
        dur: 4.0,
        cmd: { ru: 'Тапай!', en: 'Tap!' },
        hint: { ru: 'жми быстрее, монеты сыплются', en: 'tap fast, coins are raining' },

        make: function (api) {
            var taps = 0, coins = 0, squash = 0, t = 0, flying = [];

            return {
                update: function (dt) {
                    t += dt;
                    squash = Math.max(0, squash - dt * 9);
                    for (var i = flying.length - 1; i >= 0; i--) {
                        var c = flying[i];
                        c.age += dt;
                        c.vy += 2400 * dt;
                        c.x += c.vx * dt;
                        c.y += c.vy * dt;
                        if (c.age > 0.9) flying.splice(i, 1);
                    }
                },

                down: function () {
                    taps++;
                    squash = 1;
                    api.sfx('click');
                    if (taps % TAPS_PER_COIN === 0 && coins < MAX_COINS) {
                        coins++;
                        api.coins(1);
                        api.sfx('coin');
                        flying.push({ x: 360, y: MG.H * 0.55 - 150, vx: MG.rand(-320, 320), vy: MG.rand(-1100, -750), age: 0 });
                    }
                },

                timeout: function () { return true; },

                draw: function (g) {
                    var cy = MG.H * 0.55;
                    D.rays(g, 360, cy, t * 3, MG.shade('#FFC93C', 1.12), 16);
                    D.ellipse(g, 360, cy + 215, 170, 26, 'rgba(35,35,59,0.2)');

                    g.save();
                    g.translate(360, cy + 190);
                    g.scale(1 + 0.1 * squash, 1 - 0.12 * squash);
                    D.ellipse(g, 0, -190, 190, 190, '#FFE680', 10);
                    g.beginPath();
                    g.arc(0, -190, 150, 0, Math.PI * 2);
                    g.lineWidth = 10;
                    g.strokeStyle = MG.shade('#FFC93C', 0.85);
                    g.stroke();
                    g.restore();
                    MG.drawMig(g, 360, cy + 10 + 8 * squash, 92, 'happy', t * 2);

                    for (var i = 0; i < flying.length; i++) D.coin(g, flying[i].x, flying[i].y, 30);

                    // Итог раунда показывает лента, поэтому после финиша свой счётчик убираем.
                    if (!api.done) {
                        D.coin(g, 300, 350, 38);
                        D.text(g, '+' + coins, 352, 354, 84, MG.WHITE, { align: 'left' });
                    }
                }
            };
        }
    });
})();
