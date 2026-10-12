(function () {
    'use strict';

    var D = MG.draw;

    // [настроение толпы, настроение того, кого ищем]
    var PAIRS = [['happy', 'wow'], ['idle', 'wow'], ['happy', 'sad'], ['sad', 'happy'], ['wow', 'idle']];

    MG.games.push({
        id: 'find',
        bg: '#B197FC',
        dur: 5.0,
        cmd: { ru: 'Найди!', en: 'Spot it!' },
        hint: { ru: 'кто тут не как все?', en: 'who is the odd one?' },

        make: function (api) {
            var n = api.speed >= 1.45 ? 4 : 3;
            var pair = PAIRS[MG.randInt(0, PAIRS.length - 1)];
            var odd = MG.randInt(0, n * n - 1);
            var picked = -1, t = 0;

            function cell(i) {
                var size = n === 3 ? 200 : 165;
                var cy = (300 + MG.H - 120) / 2;
                return {
                    x: 360 - size * n / 2 + size / 2 + (i % n) * size,
                    y: cy - size * n / 2 + size / 2 + Math.floor(i / n) * size,
                    r: n === 3 ? 74 : 60
                };
            }

            return {
                update: function (dt) { t += dt; },

                down: function (x, y) {
                    for (var i = 0; i < n * n; i++) {
                        var c = cell(i);
                        if (Math.abs(x - c.x) < c.r + 18 && Math.abs(y - c.y) < c.r + 18) {
                            picked = i;
                            if (i === odd) {
                                api.sfx('ding');
                                api.burst(c.x, c.y, MG.GOLD, 16);
                                api.win();
                            } else {
                                api.lose();
                            }
                            return;
                        }
                    }
                },

                timeout: function () { return false; },

                draw: function (g) {
                    for (var i = 0; i < n * n; i++) {
                        var c = cell(i);
                        if (api.done && i === odd) D.ellipse(g, c.x, c.y, c.r + 20, c.r + 20, MG.GOOD, 7);
                        else if (i === picked) D.ellipse(g, c.x, c.y, c.r + 20, c.r + 20, MG.BAD, 7);
                        MG.drawMig(g, c.x, c.y - 4, c.r, i === odd ? pair[1] : pair[0], t + i * 0.37);
                    }
                }
            };
        }
    });
})();
