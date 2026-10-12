(function () {
    'use strict';

    var D = MG.draw;
    var XS = [140, 360, 580], BTN_R = 100;
    var SHIFTS = [-3, -2, -1, 1, 2, 3, 10, -10];

    MG.games.push({
        id: 'math',
        bg: '#F06595',
        dur: 5.2,
        cmd: { ru: 'Реши!', en: 'Solve!' },
        hint: { ru: 'выбери верный ответ', en: 'pick the right answer' },

        make: function (api) {
            var hard = api.speed >= 1.4;
            var kind = MG.randInt(0, hard ? 2 : 1);
            var a, b, sign, answer;
            if (kind === 0) {
                a = MG.randInt(hard ? 6 : 2, hard ? 19 : 9);
                b = MG.randInt(hard ? 5 : 1, hard ? 15 : 9);
                sign = '+'; answer = a + b;
            } else if (kind === 1) {
                a = MG.randInt(hard ? 11 : 4, hard ? 25 : 12);
                b = MG.randInt(1, Math.min(a - 1, hard ? 14 : 8));
                sign = '−'; answer = a - b;
            } else {
                a = MG.randInt(2, 6);
                b = MG.randInt(2, 6);
                sign = '×'; answer = a * b;
            }

            var options = [answer];
            while (options.length < 3) {
                var v = answer + SHIFTS[MG.randInt(0, SHIFTS.length - 1)];
                if (v >= 0 && options.indexOf(v) < 0) options.push(v);
            }
            MG.shuffle(options);
            var picked = -1, t = 0;

            function btnY() { return MG.H * 0.7; }

            return {
                update: function (dt) { t += dt; },

                down: function (x, y) {
                    for (var i = 0; i < 3; i++) {
                        var dx = x - XS[i], dy = y - btnY();
                        if (dx * dx + dy * dy > (BTN_R + 10) * (BTN_R + 10)) continue;
                        picked = i;
                        if (options[i] === answer) { api.sfx('ding'); api.win(); } else api.lose();
                        return;
                    }
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var by = MG.H * 0.43;
                    D.box(g, 50, by - 150, 620, 300, 30, '#B08968', 8);
                    D.box(g, 74, by - 126, 572, 252, 18, '#2F4F3F', 0);
                    var line = a + ' ' + sign + ' ' + b + ' = ' + (api.done ? answer : '?');
                    D.text(g, line, 360, by + 4, 120, MG.WHITE, { stroke: false, maxW: 520 });

                    for (var i = 0; i < 3; i++) {
                        var fill = MG.WHITE;
                        if (api.done && options[i] === answer) fill = MG.GOOD;
                        else if (i === picked) fill = MG.BAD;
                        var bob = api.done ? 0 : Math.sin(t * 5 + i * 1.3) * 6;
                        D.ellipse(g, XS[i], btnY() + 12, BTN_R, BTN_R, MG.INK);
                        D.ellipse(g, XS[i], btnY() + bob, BTN_R, BTN_R, fill, 8);
                        D.text(g, String(options[i]), XS[i], btnY() + bob + 4, 84, MG.INK, { stroke: false, maxW: 150 });
                    }

                    var mood = api.done ? (picked >= 0 && options[picked] === answer ? 'happy' : 'sad') : 'wow';
                    MG.drawMig(g, 360, MG.H - 110, 56, mood, t, { lookY: -1 });
                }
            };
        }
    });
})();
