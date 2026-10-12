(function () {
    'use strict';

    var D = MG.draw, E = MG.engine, C = MG.collection, S = MG.skins;

    // ---- Кнопка ----

    function Button(o) {
        this.w = 440; this.h = 124; this.size = 60;
        this.color = MG.CORAL;
        this.visible = true;
        this.down = false;
        for (var k in o) this[k] = o[k];
    }

    Button.prototype.hit = function (x, y) {
        return this.visible && Math.abs(x - this.x) <= this.w / 2 && Math.abs(y - this.y) <= this.h / 2 + 8;
    };

    // coin: true — после подписи рисуется монета («+30 ◎»), чтобы не склонять слово «монета».
    Button.prototype.drawLabel = function (g, y) {
        if (!this.coin) {
            D.text(g, this.label, 0, y, this.size, MG.WHITE, { maxW: this.w - 60 });
            return;
        }
        D.font(g, this.size);
        var tw = g.measureText(this.label).width, cr = this.size * 0.42, gap = this.size * 0.2;
        var x0 = -(tw + gap + cr * 2) / 2;
        D.text(g, this.label, x0, y, this.size, MG.WHITE, { align: 'left' });
        D.coin(g, x0 + tw + gap + cr, y - 2, cr);
    };

    Button.prototype.draw = function (g, t) {
        if (!this.visible) return;
        var w = this.w, h = this.h, r = this.round ? h / 2 : 30;
        var off = this.down ? 9 : 0;
        var pulse = this.pulse && !this.down ? 1 + 0.03 * Math.sin(t * 5) : 1;
        g.save();
        g.translate(this.x, this.y);
        g.scale(pulse, pulse);
        D.box(g, -w / 2, -h / 2 + 12, w, h, r, MG.INK, 0);
        D.box(g, -w / 2, -h / 2 + off, w, h, r, this.color, 7);
        if (this.drawIcon) {
            this.drawIcon(g, 0, off);
        } else if (this.sub) {
            this.drawLabel(g, off - h * 0.14);
            D.text(g, this.sub, 0, off + h * 0.26, this.size * 0.42, MG.INK, { maxW: w - 60, stroke: false });
        } else {
            this.drawLabel(g, off + 2);
        }
        // Красная метка «!» — есть что открыть
        if (this.badge) {
            var by = -h / 2 + off + 6 + Math.sin(t * 8) * 4;
            D.ellipse(g, w / 2 - 14, by, 26, 26, MG.BAD, 6);
            D.text(g, '!', w / 2 - 14, by + 2, 36, MG.WHITE, { stroke: false });
        }
        g.restore();
    };

    // Общая обработка нажатий для экранов с кнопками.
    function bindButtons(screen) {
        var active = null;
        return {
            down: function (x, y) {
                for (var i = 0; i < screen.buttons.length; i++) {
                    if (screen.buttons[i].hit(x, y)) {
                        active = screen.buttons[i];
                        active.down = true;
                        return true;
                    }
                }
                return false;
            },
            up: function (x, y) {
                if (!active) return;
                var b = active;
                active = null;
                b.down = false;
                if (b.hit(x, y)) {
                    MG.audio.sfx('click');
                    b.onClick();
                }
            }
        };
    }

    function soundButton() {
        return new Button({
            x: MG.W - 76, y: 76, w: 96, h: 96, round: true, color: MG.WHITE,
            onClick: function () { MG.app.toggleMute(); },
            drawIcon: function (g, x, y) {
                g.fillStyle = MG.INK;
                g.beginPath();
                g.moveTo(x - 26, y - 10); g.lineTo(x - 12, y - 10); g.lineTo(x + 4, y - 24);
                g.lineTo(x + 4, y + 24); g.lineTo(x - 12, y + 10); g.lineTo(x - 26, y + 10);
                g.closePath();
                g.fill();
                g.strokeStyle = MG.INK;
                g.lineWidth = 6;
                g.lineCap = 'round';
                if (MG.save.mute) {
                    g.beginPath();
                    g.moveTo(x + 14, y - 12); g.lineTo(x + 32, y + 12);
                    g.moveTo(x + 32, y - 12); g.lineTo(x + 14, y + 12);
                    g.stroke();
                } else {
                    g.beginPath(); g.arc(x + 6, y, 14, -0.9, 0.9); g.stroke();
                    g.beginPath(); g.arc(x + 6, y, 26, -0.9, 0.9); g.stroke();
                }
            }
        });
    }

    // Пара кнопок под основной: игры слева, облики справа.
    function shopButtons(h, size) {
        return [
            new Button({
                x: MG.W / 2 - 122, y: 0, w: 228, h: h, size: size, color: '#5F5FC4',
                label: MG.t('games'),
                onClick: function () { MG.app.openShop('games'); }
            }),
            new Button({
                x: MG.W / 2 + 122, y: 0, w: 228, h: h, size: size, color: '#E64980',
                label: MG.t('skins'),
                onClick: function () { MG.app.openShop('skins'); }
            })
        ];
    }

    function drawShopButtons(g, pair, y, t) {
        pair[0].y = pair[1].y = y;
        pair[0].badge = C.canBuy();
        pair[1].badge = S.canBuy();
        pair[0].draw(g, t);
        pair[1].draw(g, t);
    }

    function drawCoins(g, x, y, amount) {
        D.coin(g, x, y, 30);
        D.text(g, String(amount), x + 46, y + 2, 50, MG.WHITE, { align: 'left' });
    }

    // ---- Стартовый экран ----

    function Title() {
        this.t = 0;
        this.play = new Button({
            x: MG.W / 2, y: 0, w: 460, h: 140, size: 72, pulse: true,
            label: MG.t('play'),
            onClick: function () { MG.app.startRun(false); }
        });
        this.shops = shopButtons(96, 38);
        this.sound = soundButton();
        this.buttons = [this.play, this.sound].concat(this.shops);
        this.handlers = bindButtons(this);
    }

    Title.prototype.update = function (dt) { this.t += dt; };

    Title.prototype.draw = function (g) {
        var bg = '#FFD166', t = this.t;
        E.begin(bg);
        D.rays(g, MG.W / 2, MG.H * 0.52, t, MG.shade(bg, 1.1), 16);

        g.save();
        g.translate(MG.W / 2, 290);
        g.rotate(-0.05);
        var s = 1 + 0.03 * Math.sin(t * 3);
        g.scale(s, s);
        D.text(g, MG.t('title'), 0, 0, 180, MG.WHITE, { maxW: 620 });
        g.restore();
        D.text(g, MG.t('tagline'), MG.W / 2, 416, 44, MG.INK, { stroke: false, maxW: 640 });

        var hop = Math.abs(Math.sin(t * 3)) * 36, my = MG.H * 0.52;
        D.ellipse(g, MG.W / 2, my + 158, 120 - hop * 0.6, 20 - hop * 0.15, 'rgba(35,35,59,0.2)');
        MG.drawMig(g, MG.W / 2, my - hop, 138, this.play.down ? 'happy' : 'idle', t);

        this.play.y = MG.H - 350;
        this.play.draw(g, t);
        drawShopButtons(g, this.shops, MG.H - 200, t);
        this.sound.draw(g, t);

        if (MG.save.best > 0) {
            D.text(g, MG.t('best') + ': ' + MG.save.best, MG.W / 2, MG.H - 96, 44, MG.INK, { stroke: false });
        }
        drawCoins(g, 62, 76, MG.save.coins);
        E.end();
    };

    // ---- Экран результата ----

    // За рекламу после забега игрок получает столько же, сколько заработал, но не меньше этой суммы:
    // иначе после слабого забега предложение не стоит просмотра.
    var MIN_AD_BONUS = 15;

    // info: { score, best, isBest, earned }
    function Result(info) {
        var self = this;
        this.t = 0;
        this.info = info;
        this.bonus = Math.max(info.earned, MIN_AD_BONUS);
        this.extra = 0;
        this.again = new Button({
            x: MG.W / 2, y: 0, w: 480, h: 130, size: 66, pulse: true,
            label: MG.t('again'),
            onClick: function () { MG.app.startRun(true); }
        });
        this.double = new Button({
            x: MG.W / 2, y: 0, w: 480, h: 120, size: 54, color: MG.GOOD,
            label: '+' + this.bonus, coin: true, sub: MG.t('forAd'),
            onClick: function () {
                MG.app.watchAd(function () {
                    MG.app.addCoins(self.bonus);
                    self.extra = self.bonus;
                    self.double.visible = false;
                });
            }
        });
        this.shops = shopButtons(84, 36);
        this.sound = soundButton();
        this.buttons = [this.again, this.double, this.sound].concat(this.shops);
        this.handlers = bindButtons(this);
    }

    Result.prototype.update = function (dt) { this.t += dt; };

    // Полоска «сколько осталось до следующей игры» — главный повод сыграть ещё раз.
    Result.prototype.drawProgress = function (g, y) {
        var games = C.locked().length > 0;
        if (!games && !S.locked().length) return;
        var price = games ? C.nextPrice() : S.nextPrice(), have = Math.min(MG.save.coins, price);
        if (have >= price) {
            // Размер шрифта округляется до пикселя, поэтому пульсацию делаем плавным масштабом.
            var k = 1 + 0.03 * Math.sin(this.t * 4);
            g.save();
            g.translate(MG.W / 2, y);
            g.scale(k, k);
            D.text(g, MG.t(games ? 'canUnlock' : 'canSkin'), 0, 0, 44, MG.GOLD, { maxW: 620 });
            g.restore();
            return;
        }
        D.text(g, MG.t(games ? 'nextGame' : 'nextSkin') + ': ' + have + ' / ' + price, MG.W / 2, y - 26, 38, MG.WHITE, { maxW: 600 });
        D.box(g, 140, y + 10, 440, 30, 15, 'rgba(35,35,59,0.4)', 6);
        if (have > 0) {
            D.rr(g, 144, y + 14, Math.max(22, 432 * have / price), 22, 11);
            g.fillStyle = MG.GOLD;
            g.fill();
        }
    };

    Result.prototype.draw = function (g) {
        var bg = '#7B5CFF', t = this.t, info = this.info;
        E.begin(bg);
        D.rays(g, MG.W / 2, 360, t, MG.shade(bg, 1.1), 16);

        D.text(g, MG.t('score'), MG.W / 2, 196, 56, MG.WHITE);
        var shown = Math.round(info.score * MG.ease.outCubic(MG.clamp(t / 0.6, 0, 1)));
        D.text(g, String(shown), MG.W / 2, 346, 220, MG.WHITE);

        if (info.isBest) {
            var k = MG.ease.outBack(MG.clamp((t - 0.6) / 0.3, 0, 1));
            if (k > 0.02) {
                g.save();
                g.translate(MG.W / 2, 500);
                g.rotate(-0.04);
                D.text(g, MG.t('newBest'), 0, 0, 62 * k, MG.GOLD, { maxW: 640 });
                g.restore();
            }
        } else {
            D.text(g, MG.t('best') + ': ' + info.best, MG.W / 2, 500, 48, MG.WHITE);
        }

        // Пространство между рекордом и кнопками делим между строкой монет и полоской прогресса.
        var top = 560, bottom = MG.H - 480;
        var rowY = top + (bottom - top) * 0.34, barY = top + (bottom - top) * 0.86;
        MG.drawMig(g, MG.W / 2 - 150, rowY, 70, info.isBest ? 'happy' : (info.score < 3 ? 'sad' : 'idle'), t);
        var earned = info.earned + this.extra;
        D.coin(g, MG.W / 2 + 30, rowY, 36);
        D.text(g, '+' + earned, MG.W / 2 + 82, rowY + 2, 70, MG.WHITE, { align: 'left' });
        this.drawProgress(g, barY);

        this.double.y = MG.H - 392;
        this.again.y = MG.H - 236;
        this.double.draw(g, t);
        this.again.draw(g, t);
        drawShopButtons(g, this.shops, MG.H - 84, t);
        this.sound.draw(g, t);
        drawCoins(g, 62, 76, MG.save.coins);
        E.end();
    };

    // ---- Вторая попытка ----

    var CONTINUE_TIME = 8;      // секунд на решение, потом забег заканчивается сам

    // Показывается один раз за забег, когда кончились жизни: реклама возвращает одну жизнь.
    function Continue(run, onAccept, onDecline) {
        var self = this;
        this.t = 0;
        this.run = run;
        this.onDecline = onDecline;
        this.closed = false;
        this.accept = new Button({
            x: MG.W / 2, y: 0, w: 520, h: 144, size: 62, color: MG.GOOD, pulse: true,
            label: MG.t('continueBtn'), sub: MG.t('forAd'),
            onClick: function () {
                MG.app.watchAd(function () {
                    self.closed = true;
                    onAccept();
                }, function () { self.close(); });
            }
        });
        this.decline = new Button({
            x: MG.W / 2, y: 0, w: 340, h: 88, size: 40, color: '#5F5FC4',
            label: MG.t('giveUp'),
            onClick: function () { self.close(); }
        });
        this.buttons = [this.accept, this.decline];
        this.handlers = bindButtons(this);
    }

    Continue.prototype.close = function () {
        if (this.closed) return;
        this.closed = true;
        this.onDecline();
    };

    Continue.prototype.update = function (dt) {
        this.t += dt;
        if (this.t >= CONTINUE_TIME) this.close();
    };

    Continue.prototype.draw = function (g) {
        var bg = '#3B3F6B', t = this.t, run = this.run;
        E.begin(bg);
        D.rays(g, MG.W / 2, MG.H * 0.46, t, MG.shade(bg, 1.15), 16);

        g.save();
        g.translate(MG.W / 2, 230);
        g.rotate(-0.04);
        D.text(g, MG.t('continueTitle'), 0, 0, 104, MG.WHITE, { maxW: 640 });
        g.restore();
        D.text(g, MG.t('score') + ': ' + run.score, MG.W / 2, 350, 56, MG.WHITE);

        // Миг и жизнь, которую он получит
        var my = MG.H * 0.46;
        MG.drawMig(g, MG.W / 2 - 70, my, 104, 'wow', t, { lookX: 1 });
        var beat = 1 + 0.12 * Math.abs(Math.sin(t * 5));
        D.heart(g, MG.W / 2 + 120, my - 10, 44 * beat, MG.BAD);
        D.text(g, '+1', MG.W / 2 + 212, my - 4, 70, MG.WHITE);

        // Напоминание о ближайшей награде за длинный забег
        var goal = MG.Run.nextMilestone(run.score);
        var ty = my + 190;
        D.text(g, MG.t('toReward').replace('{n}', goal.at - run.score), MG.W / 2 - 60, ty, 40, MG.WHITE, { maxW: 480 });
        D.font(g, 40);
        var half = Math.min(480, g.measureText(MG.t('toReward').replace('{n}', goal.at - run.score)).width) / 2;
        D.coin(g, MG.W / 2 - 60 + half + 36, ty - 2, 20);
        D.text(g, '+' + goal.reward, MG.W / 2 - 60 + half + 64, ty, 44, MG.GOLD, { align: 'left' });

        // Время на решение
        var frac = MG.clamp(1 - t / CONTINUE_TIME, 0, 1), by = MG.H - 450;
        D.box(g, 140, by, 440, 26, 13, 'rgba(255,255,255,0.18)', 0);
        if (frac > 0.03) {
            D.rr(g, 140, by, 440 * frac, 26, 13);
            g.fillStyle = MG.WHITE;
            g.fill();
        }

        this.accept.y = MG.H - 330;
        this.decline.y = MG.H - 170;
        this.accept.draw(g, t);
        this.decline.draw(g, t);
        E.end();
    };

    // ---- Магазин: коллекция микроигр или облики Мига ----

    var MARGIN = 24, GAP = 14, GRID_TOP = 176;

    // Две витрины на одном экране: различаются товары и вид карточки.
    var SHOPS = {
        games: {
            title: 'collection', bg: '#4C6EF5', cols: 4, maxH: 220, store: C,
            items: function () { return MG.games; },
            owned: function (def) { return C.isOpen(def); },
            name: function (def) { return MG.tr(def.cmd); },
            lines: { canBuy: 'pickOne', next: 'nextGame', done: 'allOpen' }
        },
        skins: {
            title: 'skins', bg: '#E64980', cols: 3, maxH: 300, store: S,
            items: function () { return S.list; },
            owned: function (skin) { return S.owned(skin); },
            name: function (skin) { return MG.tr(skin.name); },
            lines: { canBuy: 'pickSkin', next: 'nextSkin', done: 'allSkins' }
        }
    };

    function drawPrice(g, cx, y, price, bright, size) {
        var label = String(price);
        D.font(g, size);
        var tw = g.measureText(label).width, cr = size * 0.47;
        D.coin(g, cx - tw / 2 - cr * 0.5, y - 2, cr);
        D.text(g, label, cx + cr, y, size, bright ? MG.GOLD : MG.WHITE, { lw: size * 0.2 });
    }

    function Shop(kind, onBack) {
        var self = this;
        this.kind = kind;
        this.cfg = SHOPS[kind];
        this.t = 0;
        this.msg = '';
        this.msgT = 0;
        this.shakeItem = null;
        this.shakeT = 0;
        this.pressed = null;
        this.back = new Button({
            x: 76, y: 76, w: 96, h: 96, round: true, color: MG.WHITE,
            onClick: onBack,
            drawIcon: function (g, x, y) {
                g.beginPath();
                g.moveTo(x + 14, y - 24); g.lineTo(x - 14, y); g.lineTo(x + 14, y + 24);
                g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round';
                g.strokeStyle = MG.INK; g.stroke();
            }
        });
        // Немного монет за рекламу — когда на покупку не хватает. Число раз в день ограничено.
        this.adBtn = new Button({
            x: MG.W / 2, y: 0, w: 420, h: 96, size: 48, color: MG.GOOD, coin: true, visible: false,
            label: '+' + MG.adCoins.AMOUNT, sub: MG.t('forAd'),
            onClick: function () {
                MG.app.watchAd(function () {
                    MG.adCoins.claim();
                    MG.app.addCoins(MG.adCoins.AMOUNT);
                    self.msg = '+' + MG.adCoins.AMOUNT;
                    self.msgT = 2.2;
                });
            }
        });
        this.buttons = [this.back, this.adBtn];
        var btn = bindButtons(this);
        this.handlers = {
            down: function (x, y) {
                if (!btn.down(x, y)) self.pressed = self.itemAt(x, y);
            },
            up: function (x, y) {
                btn.up(x, y);
                var item = self.itemAt(x, y);
                if (item && item === self.pressed) self.tap(item);
                self.pressed = null;
            }
        };
    }

    Shop.prototype.rect = function (i) {
        var cols = this.cfg.cols;
        var rows = Math.ceil(this.cfg.items().length / cols);
        var w = (MG.W - MARGIN * 2 - GAP * (cols - 1)) / cols;
        var h = Math.min(this.cfg.maxH, (MG.H - GRID_TOP - 210 - GAP * (rows - 1)) / rows);
        return {
            x: MARGIN + (i % cols) * (w + GAP),
            y: GRID_TOP + Math.floor(i / cols) * (h + GAP),
            w: w, h: h
        };
    };

    Shop.prototype.itemAt = function (x, y) {
        var items = this.cfg.items();
        for (var i = 0; i < items.length; i++) {
            var r = this.rect(i);
            if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return items[i];
        }
        return null;
    };

    Shop.prototype.refuse = function (item, text) {
        MG.audio.sfx('miss');
        this.shakeItem = item;
        this.shakeT = 0.3;
        this.msg = text;
        this.msgT = 2.2;
    };

    Shop.prototype.tap = function (item) {
        var cfg = this.cfg, store = cfg.store;
        if (cfg.owned(item)) {
            if (this.kind === 'skins' && MG.save.skin !== item.id) {
                S.select(item);
                MG.app.persist();
                MG.audio.sfx('pop');
            }
            return;
        }
        if (!store.available(item)) { this.refuse(item, MG.t('needPrev')); return; }
        var price = store.priceOf(item);
        if (!store.buy(item)) { this.refuse(item, MG.t('needMore') + ': ' + (price - MG.save.coins)); return; }
        MG.app.persist();
        MG.audio.sfx('ding');
        var r = this.rect(cfg.items().indexOf(item));
        E.burst(r.x + r.w / 2, r.y + r.h / 2, MG.GOLD, 26, 700);
        this.msg = cfg.name(item) + ' — ' + MG.t('unlocked');
        this.msgT = 2.2;
    };

    Shop.prototype.update = function (dt) {
        this.t += dt;
        if (this.msgT > 0) this.msgT -= dt;
        if (this.shakeT > 0) this.shakeT -= dt;
    };

    Shop.prototype.drawGame = function (g, def, r, buyable) {
        var open = C.isOpen(def), cx = r.x + r.w / 2;
        var icon = MG.icons[def.id], s = Math.min(r.w, r.h) * 0.25;
        D.box(g, r.x, r.y, r.w, r.h, 22, open ? def.bg : '#2E3154', 7);
        if (icon) {
            g.save();
            g.translate(cx, r.y + r.h * (open ? 0.4 : 0.34));
            if (!open) g.globalAlpha = 0.22;
            icon(g, s);
            g.restore();
        }
        if (open) {
            D.text(g, MG.tr(def.cmd), cx, r.y + r.h - 28, 28, MG.WHITE, { maxW: r.w - 18 });
            if (def.bonus) D.text(g, MG.t('bonus'), cx, r.y + 22, 22, MG.INK, { stroke: false });
            return;
        }
        g.save();
        g.translate(cx, r.y + r.h * 0.32);
        MG.icons.lock(g, s * 0.6);
        g.restore();
        D.text(g, MG.tr(def.cmd), cx, r.y + r.h * 0.62, 22, 'rgba(255,248,240,0.7)', { stroke: false, maxW: r.w - 16 });
        drawPrice(g, cx, r.y + r.h - 26, C.priceOf(def), buyable, 30);
    };

    Shop.prototype.drawSkin = function (g, skin, r, buyable) {
        var owned = S.owned(skin), worn = MG.save.skin === skin.id, cx = r.x + r.w / 2;
        var special = !!skin.price;
        D.box(g, r.x, r.y, r.w, r.h, 26, owned ? '#FFF3BF' : (special ? '#45206B' : '#2E3154'), 7);
        if (worn || (special && !owned)) {
            D.rr(g, r.x + 9, r.y + 9, r.w - 18, r.h - 18, 19);
            g.lineWidth = worn ? 9 : 5;
            g.strokeStyle = worn ? MG.GOOD : MG.GOLD;
            g.stroke();
        }
        var mr = Math.min(r.w * 0.27, r.h * 0.19);
        var blocked = !owned && !S.available(skin);
        if (blocked) g.globalAlpha = 0.45;
        MG.drawMig(g, cx, r.y + r.h * 0.44, mr, worn ? 'happy' : 'idle', this.t + r.x * 0.01, { skin: skin });
        g.globalAlpha = 1;
        D.text(g, MG.tr(skin.name), cx, r.y + r.h - 64, 26, owned ? MG.INK : 'rgba(255,248,240,0.85)', { stroke: false, maxW: r.w - 24 });
        if (worn) D.text(g, MG.t('worn'), cx, r.y + r.h - 30, 30, MG.GOOD, { lw: 7 });
        else if (owned) D.text(g, MG.t('wear'), cx, r.y + r.h - 30, 30, MG.WHITE, { lw: 7 });
        else {
            drawPrice(g, cx, r.y + r.h - 28, S.priceOf(skin), buyable, 32);
            if (blocked) {
                g.save();
                g.translate(r.x + r.w - 40, r.y + 44);
                MG.icons.lock(g, 22);
                g.restore();
            }
        }
    };

    Shop.prototype.draw = function (g) {
        var cfg = this.cfg, store = cfg.store, items = cfg.items(), t = this.t, i;
        E.begin(cfg.bg);
        D.rays(g, MG.W / 2, MG.H / 2, t * 0.6, MG.shade(cfg.bg, 1.08), 16);

        var left = store.locked().length;
        D.text(g, MG.t(cfg.title), MG.W / 2 - 20, 70, 50, MG.WHITE, { maxW: 280 });
        D.text(g, (items.length - left) + ' / ' + items.length, MG.W / 2 - 20, 124, 32, MG.WHITE, { lw: 7 });
        D.font(g, 50);
        drawCoins(g, MG.W - 86 - g.measureText(String(MG.save.coins)).width, 76, MG.save.coins);
        this.back.draw(g, t);

        for (i = 0; i < items.length; i++) {
            var item = items[i], r = this.rect(i), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
            var buyable = store.buyable(item);
            g.save();
            if (this.shakeT > 0 && this.shakeItem === item) g.translate(Math.sin(this.shakeT * 60) * 8, 0);
            if (buyable) {
                var k = 1 + 0.025 * Math.sin(t * 6);
                g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy);
            }
            if (this.kind === 'games') this.drawGame(g, item, r, buyable); else this.drawSkin(g, item, r, buyable);
            g.restore();
        }
        E.drawFx();

        var canBuy = store.canBuy();
        var line = this.msgT > 0 ? this.msg
            : (!left ? MG.t(cfg.lines.done)
                : (canBuy ? MG.t(cfg.lines.canBuy) : MG.t(cfg.lines.next) + ': ' + MG.save.coins + ' / ' + store.nextPrice()));
        this.adBtn.visible = left > 0 && !canBuy && MG.adCoins.left() > 0;
        this.adBtn.y = MG.H - 82;
        this.adBtn.draw(g, t);
        D.text(g, line, MG.W / 2, this.adBtn.visible ? MG.H - 172 : MG.H - 104, 40, canBuy || this.msgT > 0 ? MG.GOLD : MG.WHITE, { maxW: 660 });
        E.end();
    };

    MG.screens = { Title: Title, Result: Result, Continue: Continue, Shop: Shop };
})();
