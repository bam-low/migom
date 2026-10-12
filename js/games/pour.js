(function () {
    'use strict';

    var D = MG.draw, E = MG.engine;
    var WATER = '#3FA9F5';

    MG.games.push({
        id: 'pour',
        bg: '#FF8FAB',
        dur: 5.4,
        cmd: { ru: 'Налей!', en: 'Pour!' },
        hint: { ru: 'держи и отпусти у черты', en: 'hold, release at the line' },

        make: function (api) {
            var center = MG.rand(0.5, 0.8);
            var half = Math.max(0.055, 0.085 - 0.03 * (api.speed - 1));
            var rate = 0.58 * Math.pow(api.speed, 0.6);
            var level = 0, t = 0, pouring = false, wasDown = false, mood = 'idle';

            function layout() {
                var bottom = MG.H - 230, h = 470;
                return { bottom: bottom, top: bottom - h, h: h };
            }

            function glassPath(g, L) {
                g.beginPath();
                g.moveTo(360 - 135, L.top);
                g.lineTo(360 - 108, L.bottom);
                g.lineTo(360 + 108, L.bottom);
                g.lineTo(360 + 135, L.top);
            }

            return {
                update: function (dt) {
                    t += dt;
                    if (api.done) { pouring = false; return; }
                    var down = E.pointer.down;
                    if (down) {
                        pouring = true;
                        level += rate * dt;
                        if (level > center + half + 0.015) {
                            var L = layout();
                            mood = 'sad';
                            pouring = false;
                            api.burst(360, L.bottom - L.h * level, WATER, 18);
                            api.lose();
                        }
                    } else {
                        pouring = false;
                        if (wasDown && level >= center - half && level <= center + half) {
                            mood = 'happy';
                            api.sfx('ding');
                            api.burst(360, layout().top, MG.GOLD, 14);
                            api.win();
                        }
                    }
                    wasDown = down;
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var L = layout();
                    var surface = L.bottom - L.h * Math.min(level, 1.02);

                    // Стол
                    g.fillStyle = MG.shade('#FF8FAB', 0.84);
                    g.fillRect(0, L.bottom, MG.W, MG.H - L.bottom);
                    g.fillStyle = MG.INK;
                    g.fillRect(0, L.bottom - 4, MG.W, 8);

                    // Кран
                    D.box(g, 400, 300, 340, 46, 14, '#C9CCD9', 7);
                    D.box(g, 330, 300, 80, 46, 14, '#C9CCD9', 7);
                    D.box(g, 338, 336, 44, 54, 10, '#C9CCD9', 7);

                    // Струя
                    if (pouring) {
                        var wob = Math.sin(t * 40) * 3;
                        g.fillStyle = WATER;
                        g.fillRect(348 + wob, 390, 24, surface - 390);
                    }

                    // Стакан: фон, вода и зона цели обрезаются по контуру
                    g.save();
                    glassPath(g, L);
                    g.closePath();
                    g.clip();
                    g.fillStyle = 'rgba(255,255,255,0.38)';
                    g.fillRect(200, L.top, 320, L.h);
                    g.fillStyle = WATER;
                    g.fillRect(200, surface, 320, L.bottom - surface);
                    var y1 = L.bottom - L.h * (center + half), y2 = L.bottom - L.h * (center - half);
                    g.fillStyle = 'rgba(61,220,132,' + (0.5 + 0.2 * Math.sin(t * 9)) + ')';
                    g.fillRect(200, y1, 320, y2 - y1);
                    g.restore();

                    glassPath(g, L);
                    g.lineWidth = 9;
                    g.lineJoin = 'round';
                    g.lineCap = 'round';
                    g.strokeStyle = MG.INK;
                    g.stroke();

                    // Стрелки по бокам показывают нужный уровень
                    var cy = (y1 + y2) / 2, bobX = Math.sin(t * 9) * 8;
                    for (var s = -1; s <= 1; s += 2) {
                        var ax = 360 + s * (190 + bobX);
                        g.beginPath();
                        g.moveTo(ax + s * 46, cy - 30);
                        g.lineTo(ax, cy);
                        g.lineTo(ax + s * 46, cy + 30);
                        g.closePath();
                        g.fillStyle = MG.GOOD;
                        g.fill();
                        g.lineWidth = 7;
                        g.strokeStyle = MG.INK;
                        g.stroke();
                    }

                    MG.drawMig(g, 610, L.bottom + 96, 62, mood, t, { lookX: -1, lookY: -0.3 });
                }
            };
        }
    });
})();
