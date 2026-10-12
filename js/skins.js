(function () {
    'use strict';

    var D = MG.draw;

    // Первый облик стоит START, каждый следующий купленный — на STEP дороже, но не дороже MAX.
    // Какой именно брать, игрок решает сам.
    var PRICE_START = 80, PRICE_STEP = 60, PRICE_MAX = 250;

    function ink(g, lw) {
        g.lineWidth = lw;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.strokeStyle = MG.INK;
    }

    function poly(g, pts, fill, lw) {
        g.beginPath();
        g.moveTo(pts[0], pts[1]);
        for (var i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
        g.closePath();
        g.fillStyle = fill;
        g.fill();
        if (lw) { ink(g, lw); g.stroke(); }
    }

    function star(g, x, y, rad, fill) {
        var pts = [];
        for (var i = 0; i < 10; i++) {
            var a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? rad * 0.45 : rad;
            pts.push(x + Math.cos(a) * d, y + Math.sin(a) * d);
        }
        poly(g, pts, fill);
    }

    // back рисуется до тела (уши, плащ), mid — между телом и лицом (маска), front — поверх лица.
    // Координаты от центра тела, r — радиус.
    var LIST = [
        { id: 'classic', name: { ru: 'Классика', en: 'Classic' } },

        {
            id: 'sprout', name: { ru: 'Росток', en: 'Sprout' }, color: '#C3FAE8',
            front: function (g, r, lw) {
                ink(g, lw * 0.8);
                g.beginPath(); g.moveTo(0, -r * 0.96); g.lineTo(0, -r * 1.3); g.stroke();
                g.save(); g.translate(-r * 0.2, -r * 1.36); g.rotate(-0.5);
                D.ellipse(g, 0, 0, r * 0.24, r * 0.12, '#51CF66', lw * 0.6);
                g.restore();
                g.save(); g.translate(r * 0.2, -r * 1.36); g.rotate(0.5);
                D.ellipse(g, 0, 0, r * 0.24, r * 0.12, '#51CF66', lw * 0.6);
                g.restore();
            }
        },

        {
            id: 'cat', name: { ru: 'Котик', en: 'Kitty' }, color: '#FFE0B8',
            back: function (g, r, lw) {
                for (var s = -1; s <= 1; s += 2) {
                    poly(g, [s * r * 0.86, -r * 0.42, s * r * 0.7, -r * 1.24, s * r * 0.16, -r * 0.9], '#FFE0B8', lw);
                    poly(g, [s * r * 0.7, -r * 0.62, s * r * 0.64, -r * 1.02, s * r * 0.38, -r * 0.86], '#FF9EB5');
                }
            },
            front: function (g, r, lw) {
                D.ellipse(g, 0, r * 0.06, r * 0.07, r * 0.05, '#FF7A9A');
                ink(g, lw * 0.45);
                for (var s = -1; s <= 1; s += 2) {
                    g.beginPath();
                    g.moveTo(s * r * 0.68, r * 0.08); g.lineTo(s * r * 1.18, -r * 0.02);
                    g.moveTo(s * r * 0.68, r * 0.24); g.lineTo(s * r * 1.16, r * 0.34);
                    g.stroke();
                }
            }
        },

        {
            id: 'glasses', name: { ru: 'Умник', en: 'Brainy' },
            front: function (g, r, lw) {
                for (var s = -1; s <= 1; s += 2) {
                    D.ellipse(g, s * r * 0.34, -r * 0.14, r * 0.28, r * 0.28, 'rgba(120,190,255,0.22)', lw * 0.7);
                }
                ink(g, lw * 0.7);
                g.beginPath(); g.moveTo(-r * 0.07, -r * 0.16); g.lineTo(r * 0.07, -r * 0.16); g.stroke();
            }
        },

        {
            id: 'bow', name: { ru: 'Бантик', en: 'Bow' }, color: '#FFE3EC',
            front: function (g, r, lw) {
                g.save();
                g.translate(r * 0.46, -r * 0.86);
                g.rotate(0.35);
                poly(g, [0, 0, -r * 0.44, -r * 0.26, -r * 0.44, r * 0.26], '#FF6B9D', lw * 0.8);
                poly(g, [0, 0, r * 0.44, -r * 0.26, r * 0.44, r * 0.26], '#FF6B9D', lw * 0.8);
                D.ellipse(g, 0, 0, r * 0.13, r * 0.13, '#FF8FB4', lw * 0.7);
                g.restore();
            }
        },

        {
            id: 'ninja', name: { ru: 'Ниндзя', en: 'Ninja' },
            back: function (g, r, lw) {
                poly(g, [r * 0.8, -r * 0.5, r * 1.42, -r * 0.82, r * 1.3, -r * 0.5], MG.BAD, lw * 0.7);
                poly(g, [r * 0.8, -r * 0.44, r * 1.36, -r * 0.3, r * 1.18, -r * 0.12], MG.BAD, lw * 0.7);
            },
            front: function (g, r, lw) {
                g.save();
                g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
                g.fillStyle = MG.BAD;
                g.fillRect(-r, -r * 0.62, r * 2, r * 0.24);
                g.fillStyle = MG.INK;
                g.fillRect(-r, -r * 0.62 - lw * 0.3, r * 2, lw * 0.6);
                g.fillRect(-r, -r * 0.38 - lw * 0.3, r * 2, lw * 0.6);
                g.restore();
                g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2);
                ink(g, lw); g.stroke();
            }
        },

        {
            id: 'dj', name: { ru: 'Диджей', en: 'DJ' }, color: '#E5DBFF',
            back: function (g, r, lw) {
                g.beginPath();
                g.arc(0, 0, r * 1.1, Math.PI * 1.08, Math.PI * 1.92);
                ink(g, lw * 2.2); g.stroke();
                g.lineWidth = lw * 0.9; g.strokeStyle = '#7B5CFF'; g.stroke();
            },
            front: function (g, r, lw) {
                D.box(g, -r * 1.2, -r * 0.34, r * 0.34, r * 0.68, r * 0.14, '#7B5CFF', lw * 0.8);
                D.box(g, r * 0.86, -r * 0.34, r * 0.34, r * 0.68, r * 0.14, '#7B5CFF', lw * 0.8);
            }
        },

        {
            id: 'gent', name: { ru: 'Джентльмен', en: 'Gentleman' },
            front: function (g, r, lw) {
                D.box(g, -r * 0.46, -r * 1.58, r * 0.92, r * 0.72, r * 0.08, '#3B3F6B', lw * 0.9);
                g.fillStyle = MG.BAD;
                g.fillRect(-r * 0.42, -r * 1.08, r * 0.84, r * 0.14);
                D.box(g, -r * 0.8, -r * 0.94, r * 1.6, r * 0.18, r * 0.09, '#3B3F6B', lw * 0.9);
            }
        },

        {
            id: 'king', name: { ru: 'Король', en: 'King' }, color: '#FFF3BF',
            front: function (g, r, lw) {
                poly(g, [
                    -r * 0.56, -r * 0.8, -r * 0.62, -r * 1.34, -r * 0.3, -r * 1.06, 0, -r * 1.44,
                    r * 0.3, -r * 1.06, r * 0.62, -r * 1.34, r * 0.56, -r * 0.8
                ], MG.GOLD, lw * 0.9);
                D.ellipse(g, 0, -r * 0.98, r * 0.08, r * 0.08, MG.BAD);
                D.ellipse(g, -r * 0.3, -r * 0.92, r * 0.06, r * 0.06, '#4DABF7');
                D.ellipse(g, r * 0.3, -r * 0.92, r * 0.06, r * 0.06, '#4DABF7');
            }
        },

        // ---- Особые облики: фиксированная цена, покупаются по порядку после всех обычных ----

        {
            id: 'punk', price: 300, name: { ru: 'Панк', en: 'Punk' },
            back: function (g, r, lw) {
                for (var i = -2; i <= 2; i++) {
                    var x = i * r * 0.2;
                    poly(g, [x - r * 0.17, -r * 0.84, x, -r * (1.56 - Math.abs(i) * 0.13), x + r * 0.17, -r * 0.84], '#FF3EA5', lw * 0.8);
                }
            },
            front: function (g, r, lw) {
                g.beginPath();
                g.arc(-r * 0.98, r * 0.22, r * 0.13, 0, Math.PI * 2);
                ink(g, lw * 1.1); g.stroke();
                g.lineWidth = lw * 0.5; g.strokeStyle = MG.GOLD; g.stroke();
                star(g, r * 0.66, -r * 0.04, r * 0.13, MG.INK);
            }
        },

        {
            id: 'diva', price: 600, name: { ru: 'Дива', en: 'Diva' }, color: '#FFE3EC',
            back: function (g, r, lw) {
                D.ellipse(g, 0, r * 0.12, r * 1.3, r * 1.22, '#9C36B5', lw);
                D.ellipse(g, -r * 1.04, r * 0.88, r * 0.34, r * 0.3, '#9C36B5', lw);
                D.ellipse(g, r * 1.04, r * 0.88, r * 0.34, r * 0.3, '#9C36B5', lw);
            },
            front: function (g, r, lw) {
                // Чёлка обрезается по контуру головы
                g.save();
                g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
                D.ellipse(g, -r * 0.32, -r * 1.04, r * 1.0, r * 0.54, '#9C36B5', lw * 0.8);
                D.ellipse(g, r * 0.66, -r * 1.02, r * 0.6, r * 0.46, '#9C36B5', lw * 0.8);
                g.restore();
                g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2);
                ink(g, lw); g.stroke();
                // Ресницы
                ink(g, lw * 0.45);
                for (var s = -1; s <= 1; s += 2) {
                    for (var j = -1; j <= 1; j++) {
                        g.beginPath();
                        g.moveTo(s * r * 0.33 + j * r * 0.1, -r * 0.31);
                        g.lineTo(s * r * 0.33 + j * r * 0.17, -r * 0.43);
                        g.stroke();
                    }
                }
                // Цветок в волосах
                for (var k = 0; k < 5; k++) {
                    var a = k * Math.PI * 2 / 5;
                    D.ellipse(g, -r * 0.66 + Math.cos(a) * r * 0.14, -r * 0.72 + Math.sin(a) * r * 0.14, r * 0.11, r * 0.11, '#FF8FB4', lw * 0.4);
                }
                D.ellipse(g, -r * 0.66, -r * 0.72, r * 0.08, r * 0.08, MG.GOLD);
            }
        },

        {
            id: 'hero', price: 800, name: { ru: 'Супергерой', en: 'Superhero' },
            back: function (g, r, lw) {
                poly(g, [
                    -r * 0.72, -r * 0.5, r * 0.72, -r * 0.5, r * 1.36, r * 1.08,
                    r * 0.5, r * 0.9, 0, r * 1.12, -r * 0.5, r * 0.9, -r * 1.36, r * 1.08
                ], MG.BAD, lw);
            },
            mid: function (g, r) {
                g.save();
                g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
                g.fillStyle = '#7048E8';
                g.fillRect(-r, -r * 0.46, r * 2, r * 0.54);
                g.restore();
                D.ellipse(g, -r * 0.33, -r * 0.14, r * 0.22, r * 0.25, '#FFFFFF');
                D.ellipse(g, r * 0.33, -r * 0.14, r * 0.22, r * 0.25, '#FFFFFF');
            },
            front: function (g, r, lw) {
                g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2);
                ink(g, lw); g.stroke();
                // Вихор
                g.beginPath();
                g.moveTo(-r * 0.34, -r * 0.9);
                g.quadraticCurveTo(-r * 0.1, -r * 1.56, r * 0.56, -r * 1.14);
                g.quadraticCurveTo(r * 0.12, -r * 1.12, r * 0.24, -r * 0.88);
                g.closePath();
                g.fillStyle = '#3B3F6B'; g.fill();
                ink(g, lw * 0.8); g.stroke();
                star(g, 0, r * 0.74, r * 0.17, MG.GOLD);
            }
        }
    ];

    var S = MG.skins = { list: LIST };

    S.get = function (id) {
        for (var i = 0; i < LIST.length; i++) if (LIST[i].id === id) return LIST[i];
        return LIST[0];
    };

    S.current = function () { return S.get(MG.save.skin); };

    S.owned = function (skin) {
        return skin.id === 'classic' || MG.save.skins.indexOf(skin.id) >= 0;
    };

    S.locked = function () {
        return LIST.filter(function (s) { return !S.owned(s); });
    };

    S.priceOf = function (skin) {
        if (skin.price) return skin.price;
        var basic = MG.save.skins.filter(function (id) { return !S.get(id).price; }).length;
        return Math.min(PRICE_MAX, PRICE_START + PRICE_STEP * basic);
    };

    // Обычные облики доступны сразу; особый — когда куплены все, что стоят в списке перед ним.
    S.available = function (skin) {
        if (!skin.price) return true;
        for (var i = 0; i < LIST.length && LIST[i] !== skin; i++) {
            if (!S.owned(LIST[i])) return false;
        }
        return true;
    };

    S.buyable = function (skin) {
        return !S.owned(skin) && S.available(skin) && MG.save.coins >= S.priceOf(skin);
    };

    S.canBuy = function () { return LIST.some(S.buyable); };

    // Цена ближайшей доступной покупки или null, если всё куплено.
    S.nextPrice = function () {
        var best = null;
        LIST.forEach(function (s) {
            if (S.owned(s) || !S.available(s)) return;
            var p = S.priceOf(s);
            if (best === null || p < best) best = p;
        });
        return best;
    };

    // Покупка сразу надевает облик.
    S.buy = function (skin) {
        if (!S.buyable(skin)) return false;
        MG.save.coins -= S.priceOf(skin);
        MG.save.skins.push(skin.id);
        MG.save.skin = skin.id;
        return true;
    };

    S.select = function (skin) {
        if (S.owned(skin)) MG.save.skin = skin.id;
    };
})();
