(function () {
    'use strict';

    var D = MG.draw, E = MG.engine;

    var LIVES = 3;
    var SPEED_STEP = 0.15;      // прибавка темпа каждые SPEED_EVERY микроигр
    var SPEED_EVERY = 5;
    var SPEED_MAX = 2.4;
    var HINT_TIMES = 3;         // сколько раз показывать подсказку по управлению
    var BONUS_EVERY = 7;        // после стольких обычных микроигр идёт бонусная

    // Награды за длинный забег: [сколько микроигр пройдено, сколько монет]. Чем дальше, тем щедрее,
    // потому что темп к этому моменту уже высокий. После последней ступени — награда каждые 10 микроигр.
    var MILESTONES = [[10, 5], [20, 25], [30, 50], [40, 80], [50, 120]];
    var MILESTONE_AFTER = 150;

    function milestoneReward(score) {
        for (var i = 0; i < MILESTONES.length; i++) if (MILESTONES[i][0] === score) return MILESTONES[i][1];
        var last = MILESTONES[MILESTONES.length - 1][0];
        return score > last && score % 10 === 0 ? MILESTONE_AFTER : 0;
    }

    // Ближайшая ещё не взятая ступень: { at, reward }.
    function nextMilestone(score) {
        for (var i = 0; i < MILESTONES.length; i++) {
            if (MILESTONES[i][0] > score) return { at: MILESTONES[i][0], reward: MILESTONES[i][1] };
        }
        return { at: (Math.floor(score / 10) + 1) * 10, reward: MILESTONE_AFTER };
    }

    // Один забег: лента микроигр до потери всех жизней.
    function Run(onOver) {
        this.onOver = onOver;
        this.lives = LIVES;
        this.score = 0;
        this.count = 0;
        this.speed = 1;
        this.bag = [];
        this.lastId = null;
        this.t = 0;
        this.sinceBonus = 0;
        this.revived = false;       // вторая попытка уже использована
        this.bonusCoins = 0;
        this.roundCoins = 0;
        this.next();
    }

    // Мешок без повторов: все микроигры по разу, затем заново; одна и та же не идёт дважды подряд.
    Run.prototype.pickDef = function () {
        var bonus = MG.games.filter(function (d) { return d.bonus; });
        if (bonus.length && this.sinceBonus >= BONUS_EVERY) {
            this.sinceBonus = 0;
            return bonus[Math.floor(Math.random() * bonus.length)];
        }
        this.sinceBonus++;
        if (!this.bag.length) {
            this.bag = MG.shuffle(MG.games.filter(function (d) { return !d.bonus && MG.collection.isOpen(d); }));
            var last = this.bag.length - 1;
            if (last > 0 && this.bag[last].id === this.lastId) {
                var tmp = this.bag[0]; this.bag[0] = this.bag[last]; this.bag[last] = tmp;
            }
        }
        // Только что купленную игру показываем первой, чтобы покупка сразу ощущалась.
        var fresh = MG.collection.fresh;
        if (fresh) {
            MG.collection.fresh = null;
            for (var i = 0; i < this.bag.length; i++) {
                if (this.bag[i].id === fresh) { this.bag.push(this.bag.splice(i, 1)[0]); break; }
            }
        }
        var def = this.bag.pop();
        this.lastId = def.id;
        return def;
    };

    Run.prototype.next = function () {
        var self = this;
        var def = this.def = this.pickDef();
        this.done = false;
        this.won = false;
        this.phase = 'intro';
        this.phaseT = 0;
        this.playT = 0;
        this.introDur = 0.85 / Math.sqrt(this.speed);
        this.dur = def.dur / Math.pow(this.speed, 0.7);

        var seen = MG.save.seen[def.id] || 0;
        this.showHint = seen < HINT_TIMES;
        MG.save.seen[def.id] = seen + 1;

        MG.audio.setSpeed(this.speed);
        E.clearFx();
        this.roundCoins = 0;
        this.milestone = null;
        this.api = {
            speed: this.speed,
            dur: this.dur,
            done: false,
            win: function () { self.finish(true); },
            lose: function () { self.finish(false); },
            coins: function (n) { self.roundCoins += n; self.bonusCoins += n; },
            sfx: MG.audio.sfx,
            burst: E.burst,
            shake: E.shake
        };
        this.game = def.make(this.api);
    };

    Run.prototype.finish = function (win) {
        if (this.done) return;
        this.done = this.api.done = true;
        this.won = win;
        this.phase = 'outcome';
        this.phaseT = 0;
        // Бонусная микроигра не влияет на счёт и жизни — только даёт монеты.
        if (this.def.bonus) {
            this.won = true;
            this.outDur = 0.9;
            MG.audio.sfx('coin');
            return;
        }
        this.count++;
        if (win) {
            this.score++;
            this.outDur = 0.7 / Math.sqrt(this.speed);
            MG.audio.sfx('win');
            var reward = milestoneReward(this.score);
            if (reward) {
                this.milestone = { at: this.score, reward: reward };
                this.bonusCoins += reward;
                this.outDur = 1.4;      // даём время прочитать поздравление
                MG.audio.sfx('coin');
            }
        } else {
            this.lives--;
            this.outDur = 0.95;
            // После ошибки темп немного падает, чтобы игрок успел собраться.
            this.speed = Math.max(1, this.speed - 0.06);
            MG.audio.sfx('lose');
            E.shake(18, 0.35);
        }
    };

    Run.prototype.afterOutcome = function () {
        if (this.lives <= 0) {
            this.phase = 'over';
            this.onOver(this);
        } else if (!this.def.bonus && this.count % SPEED_EVERY === 0 && this.speed < SPEED_MAX) {
            this.speed = Math.min(SPEED_MAX, this.speed + SPEED_STEP);
            this.phase = 'speedup';
            this.phaseT = 0;
            MG.audio.sfx('speedup');
            MG.audio.setSpeed(this.speed);
        } else {
            this.next();
        }
    };

    Run.prototype.update = function (dt) {
        this.t += dt;
        this.phaseT += dt;
        if (this.phase === 'intro') {
            if (this.phaseT >= this.introDur) { this.phase = 'play'; this.phaseT = 0; }
        } else if (this.phase === 'play') {
            this.playT += dt;
            this.game.update(dt);
            if (!this.done && this.playT >= this.dur) {
                this.finish(this.game.timeout ? !!this.game.timeout() : false);
            }
        } else if (this.phase === 'outcome') {
            this.game.update(dt);
            if (this.phaseT >= this.outDur) this.afterOutcome();
        } else if (this.phase === 'speedup') {
            if (this.phaseT >= 0.95) this.next();
        }
    };

    Run.prototype.down = function (x, y) {
        if (this.phase === 'play' && !this.done && this.game.down) this.game.down(x, y);
    };

    Run.prototype.up = function (x, y) {
        if (this.phase === 'play' && !this.done && this.game.up) this.game.up(x, y);
    };

    Run.prototype.drawHud = function (g) {
        var i;
        for (i = 0; i < LIVES; i++) {
            var alive = i < this.lives;
            var justLost = !alive && i === this.lives && this.phase === 'outcome' && !this.won;
            var s = 24;
            if (justLost) s *= 1 + 0.6 * Math.max(0, 1 - this.phaseT / 0.3);
            D.heart(g, 62 + i * 66, 62, s, alive ? MG.BAD : 'rgba(35,35,59,0.35)');
        }
        var pop = this.phase === 'outcome' && this.won && !this.def.bonus ? 1 + 0.35 * Math.max(0, 1 - this.phaseT / 0.25) : 1;
        D.text(g, String(this.score), MG.W - 44, 64, 72 * pop, MG.WHITE, { align: 'right' });

        // Ближайшая награда за длинный забег: «20 ▸ монета 25»
        var goal = nextMilestone(this.score);
        D.box(g, 262, 36, 196, 54, 27, 'rgba(35,35,59,0.35)', 0);
        D.text(g, String(goal.at), 318, 64, 34, MG.WHITE, { align: 'right', lw: 7 });
        g.beginPath();
        g.moveTo(330, 53); g.lineTo(346, 63); g.lineTo(330, 73);
        g.closePath();
        g.fillStyle = MG.WHITE;
        g.fill();
        D.coin(g, 372, 63, 16);
        D.text(g, String(goal.reward), 394, 64, 34, MG.GOLD, { align: 'left', lw: 7 });

        // Таймер микроигры
        var frac = this.phase === 'intro' ? 1 : MG.clamp(1 - this.playT / this.dur, 0, 1);
        D.box(g, 40, 112, 640, 28, 14, 'rgba(35,35,59,0.35)', 6);
        if (frac > 0.02) {
            D.rr(g, 44, 116, 632 * frac, 20, 10);
            g.fillStyle = frac < 0.3 ? MG.BAD : MG.WHITE;
            g.fill();
        }
    };

    Run.prototype.drawCommand = function (g) {
        if (this.phase !== 'intro' && this.phase !== 'play') return;
        var cmd = MG.tr(this.def.cmd), hint = this.showHint ? MG.tr(this.def.hint) : '';
        var bigY = MG.H * 0.4, size, y, rot;
        if (this.phase === 'intro') {
            size = 136 * MG.ease.outBack(MG.clamp(this.phaseT / 0.25, 0, 1));
            y = bigY;
            rot = -0.06;
        } else {
            var m = MG.ease.outCubic(MG.clamp(this.phaseT / 0.18, 0, 1));
            size = MG.lerp(136, 60, m);
            y = MG.lerp(bigY, 198, m);
            rot = MG.lerp(-0.06, 0, m);
        }
        if (size < 4) return;
        g.save();
        g.translate(MG.W / 2, y);
        g.rotate(rot);
        D.text(g, cmd, 0, 0, size, MG.WHITE, { maxW: 640 });
        if (hint) {
            var hs = Math.max(38, size * 0.36);
            D.text(g, hint, 0, size * 0.5 + hs * 0.85, hs, MG.WHITE, { maxW: 640, lw: hs * 0.26 });
        }
        g.restore();
    };

    Run.prototype.drawOutcome = function (g) {
        if (this.phase !== 'outcome') return;
        var k = MG.ease.outBack(MG.clamp(this.phaseT / 0.2, 0, 1));
        var y = MG.H * 0.36;
        if (this.def.bonus) {
            D.coin(g, MG.W / 2 - 110, y, 64 * k);
            D.text(g, '+' + this.roundCoins, MG.W / 2 - 20, y + 4, 130 * k, MG.WHITE, { align: 'left' });
        } else if (this.won) {
            var ring = MG.clamp(this.phaseT / 0.4, 0, 1);
            g.globalAlpha = 1 - ring;
            g.beginPath();
            g.arc(MG.W / 2, y, 90 + 260 * ring, 0, Math.PI * 2);
            g.lineWidth = 26;
            g.strokeStyle = MG.GOOD;
            g.stroke();
            g.globalAlpha = 1;
            D.check(g, MG.W / 2, y, 170 * k);
            if (this.milestone) {
                var m = MG.ease.outBack(MG.clamp((this.phaseT - 0.15) / 0.25, 0, 1));
                if (m > 0.02) {
                    g.save();
                    g.translate(MG.W / 2, y + 190);
                    g.scale(m, m);
                    D.text(g, this.milestone.at + ' ' + MG.t('cleared'), 0, 0, 76, MG.GOLD, { maxW: 640 });
                    D.coin(g, -70, 106, 44);
                    D.text(g, '+' + this.milestone.reward, -10, 110, 90, MG.WHITE, { align: 'left' });
                    g.restore();
                }
            }
        } else {
            g.fillStyle = 'rgba(255,77,94,' + (0.3 * Math.max(0, 1 - this.phaseT / this.outDur)) + ')';
            g.fillRect(-60, -60, MG.W + 120, MG.H + 120);
            D.cross(g, MG.W / 2, y, 170 * k);
        }
    };

    Run.prototype.drawSpeedup = function (g) {
        E.begin(MG.GOLD);
        D.rays(g, MG.W / 2, MG.H / 2, this.t * 6, MG.shade(MG.GOLD, 1.12), 16);
        var k = MG.ease.outBack(MG.clamp(this.phaseT / 0.25, 0, 1));
        g.save();
        g.translate(MG.W / 2, MG.H * 0.36);
        g.rotate(-0.06);
        D.text(g, MG.t('faster'), 0, 0, 130 * k, MG.WHITE, { maxW: 640 });
        g.restore();
        MG.drawMig(g, MG.W / 2, MG.H * 0.6, 130, 'wow', this.t * 2);
        this.drawHud(g);
        E.end();
    };

    Run.prototype.draw = function (g) {
        if (this.phase === 'speedup') { this.drawSpeedup(g); return; }
        E.begin(this.def.bg);
        this.game.draw(g);
        E.drawFx();
        this.drawHud(g);
        this.drawCommand(g);
        this.drawOutcome(g);
        // Короткая вспышка при смене микроигры
        if (this.phase === 'intro' && this.phaseT < 0.15) {
            g.fillStyle = 'rgba(255,255,255,' + (0.7 * (1 - this.phaseT / 0.15)) + ')';
            g.fillRect(-60, -60, MG.W + 120, MG.H + 120);
        }
        E.end();
    };

    // Вторая попытка: одна жизнь, счёт и темп сохраняются.
    Run.prototype.revive = function () {
        this.revived = true;
        this.lives = 1;
        this.next();
    };

    Run.nextMilestone = nextMilestone;
    MG.Run = Run;
})();
