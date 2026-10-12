(function () {
    'use strict';

    var D = MG.draw, E = MG.engine;
    var S = 200, PX = 160, PY = 340;    // размер детали и левый верхний угол картинки 2×2

    function drawPicture(g, ox, oy, t) {
        g.fillStyle = '#FFD166';
        g.fillRect(ox, oy, S * 2, S * 2);
        g.save();
        g.beginPath();
        g.rect(ox, oy, S * 2, S * 2);
        g.clip();
        D.rays(g, ox + S, oy + S, t, '#FFE39A', 12);
        g.restore();
        MG.drawMig(g, ox + S, oy + S + 6, 128, 'happy', 0.4);
    }

    MG.games.push({
        id: 'assemble',
        bg: '#DA77F2',
        dur: 5.6,
        cmd: { ru: 'Собери!', en: 'Fix it!' },
        hint: { ru: 'перетащи кусочек на место', en: 'drag the piece into place' },

        make: function (api) {
            var missing = api.speed >= 1.5 ? 2 : 1;
            var quads = MG.shuffle([0, 1, 2, 3]).slice(0, missing);
            var pieces = quads.map(function (q, i) {
                var col = q % 2, row = Math.floor(q / 2);
                return {
                    col: col, row: row,
                    tx: PX + col * S + S / 2, ty: PY + row * S + S / 2,
                    x: 360 + (i - (missing - 1) / 2) * 280 + MG.rand(-30, 30),
                    y: MG.H - 250,
                    placed: false
                };
            });
            var held = null, ox = 0, oy = 0, placed = 0, t = 0;

            return {
                update: function (dt) {
                    t += dt;
                    if (!held) return;
                    if (E.pointer.down && !api.done) {
                        held.x = MG.clamp(E.pointer.x - ox, 100, 620);
                        held.y = MG.clamp(E.pointer.y - oy, 300, MG.H - 110);
                        return;
                    }
                    var dx = held.x - held.tx, dy = held.y - held.ty;
                    if (!api.done && dx * dx + dy * dy < 95 * 95) {
                        held.placed = true;
                        held.x = held.tx;
                        held.y = held.ty;
                        api.sfx('pop');
                        api.burst(held.tx, held.ty, MG.GOLD, 14);
                        if (++placed === missing) api.win();
                    }
                    held = null;
                },

                down: function (x, y) {
                    for (var i = 0; i < pieces.length; i++) {
                        var p = pieces[i];
                        if (!p.placed && Math.abs(x - p.x) < 125 && Math.abs(y - p.y) < 125) {
                            held = p;
                            ox = x - p.x;
                            oy = y - p.y;
                            return;
                        }
                    }
                },

                timeout: function () { return false; },

                draw: function (g) {
                    var i, p;
                    D.box(g, PX - 16, PY - 16, S * 2 + 32, S * 2 + 32, 26, MG.WHITE, 8);
                    drawPicture(g, PX, PY, t);

                    for (i = 0; i < pieces.length; i++) {
                        p = pieces[i];
                        if (p.placed) continue;
                        g.fillStyle = '#39406B';
                        g.fillRect(p.tx - S / 2, p.ty - S / 2, S, S);
                        g.strokeStyle = MG.WHITE;
                        g.lineWidth = 6;
                        g.setLineDash([18, 14]);
                        g.lineDashOffset = -t * 50;
                        g.strokeRect(p.tx - S / 2 + 12, p.ty - S / 2 + 12, S - 24, S - 24);
                        g.setLineDash([]);
                    }
                    g.strokeStyle = MG.INK;
                    g.lineWidth = 8;
                    g.strokeRect(PX, PY, S * 2, S * 2);

                    for (i = 0; i < pieces.length; i++) {
                        p = pieces[i];
                        if (p.placed) continue;
                        var lift = p === held ? 1.08 : 1 + 0.03 * Math.sin(t * 6 + i);
                        g.save();
                        g.translate(p.x, p.y);
                        g.scale(lift, lift);
                        g.save();
                        g.beginPath();
                        g.rect(-S / 2, -S / 2, S, S);
                        g.clip();
                        drawPicture(g, -S / 2 - p.col * S, -S / 2 - p.row * S, t);
                        g.restore();
                        g.strokeStyle = MG.INK;
                        g.lineWidth = 8;
                        g.lineJoin = 'round';
                        g.strokeRect(-S / 2, -S / 2, S, S);
                        g.restore();
                    }
                }
            };
        }
    });
})();
