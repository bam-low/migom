(function () {
    'use strict';

    var D = MG.draw, E = MG.engine, P = MG.platform;

    var state = 'loading';      // loading | title | run | continue | result
    var screen = null, run = null;
    var busy = false;           // идёт показ рекламы — кнопки не реагируют
    var platformPause = false, hidden = false, adOpen = false;
    var last = 0;

    MG.save = { v: 1, best: 0, coins: 0, runs: 0, mute: false, seen: {}, unlocked: [], skins: [], skin: 'classic', adDay: '', adCount: 0 };

    function persist() { P.save(MG.save); }

    function refreshPause() {
        var p = platformPause || hidden || adOpen;
        if (p === MG.paused) return;
        MG.paused = p;
        MG.audio.hold(p);
        // Разметка геймплея: пауза посреди забега — это остановка игрового процесса.
        if (state === 'run') { if (p) P.gameplayStop(); else P.gameplayStart(); }
    }

    // Требование 4.7: на время рекламы звук и игра останавливаются, даже если платформа не прислала паузу.
    function setAd(open) {
        adOpen = busy = open;
        refreshPause();
    }

    function showScreen(s) {
        screen = s;
        E.handlers = s.handlers;
        E.clearFx();
    }

    function bindRun() {
        E.handlers = {
            down: function (x, y) { run.down(x, y); },
            up: function (x, y) { run.up(x, y); }
        };
    }

    // Жизни кончились. Один раз за забег предлагаем вторую попытку за рекламу.
    function onRunOver(r) {
        P.gameplayStop();
        MG.audio.stopBeat();
        if (r.revived) { finishRun(r); return; }
        state = 'continue';
        showScreen(new MG.screens.Continue(r, function () { reviveRun(r); }, function () { finishRun(r); }));
    }

    function reviveRun(r) {
        state = 'run';
        screen = null;
        r.revive();
        bindRun();
        MG.audio.startBeat(r.speed);
        P.gameplayStart();
    }

    function finishRun(r) {
        MG.audio.sfx('over');
        var isBest = r.score > MG.save.best;
        if (isBest) MG.save.best = r.score;
        var earned = r.score + r.bonusCoins;
        MG.save.coins += earned;
        MG.save.runs++;
        persist();
        run = null;
        state = 'result';
        showScreen(new MG.screens.Result({ score: r.score, best: MG.save.best, isBest: isBest, earned: earned }));
    }

    function beginRun() {
        state = 'run';
        screen = null;
        run = MG.app.run = new MG.Run(onRunOver);
        bindRun();
        MG.audio.startBeat(1);
        P.gameplayStart();
    }

    MG.app = {
        // withAd: показать полноэкранную рекламу перед забегом (кнопка «Ещё раз»).
        startRun: function (withAd) {
            if (busy) return;
            if (!withAd) { beginRun(); return; }
            setAd(true);
            P.fullscreen().then(function () {
                setAd(false);
                beginRun();
            });
        },

        // Реклама за вознаграждение. onReward — просмотр засчитан; onSkip — закрыта раньше или не показалась.
        watchAd: function (onReward, onSkip) {
            if (busy) return;
            setAd(true);
            P.rewarded().then(function (rewarded) {
                setAd(false);
                if (rewarded) onReward(); else if (onSkip) onSkip();
            });
        },

        addCoins: function (amount) {
            MG.save.coins += amount;
            persist();
            MG.audio.sfx('coin');
        },

        persist: persist,

        // Магазин ('games' или 'skins') открывается поверх текущего экрана и возвращает на него же.
        openShop: function (kind) {
            if (busy) return;
            var prev = screen;
            showScreen(new MG.screens.Shop(kind, function () { showScreen(prev); }));
        },

        toggleMute: function () {
            MG.save.mute = !MG.save.mute;
            MG.audio.setMuted(MG.save.mute);
            persist();
        }
    };

    function drawPause(g) {
        g.fillStyle = 'rgba(35,35,59,0.94)';
        g.fillRect(0, 0, MG.W, MG.H);
        D.text(g, MG.t('pause'), MG.W / 2, MG.H / 2, 90, MG.WHITE);
    }

    function frame(ts) {
        var dt = Math.min(0.05, (ts - last) / 1000 || 0);
        last = ts;
        var g = E.g;

        if (!MG.paused && !MG.freeze) {
            E.updateFx(dt);
            if (state === 'run' && run) run.update(dt);
            else if (screen) screen.update(dt);
        }

        if (state === 'run' && run) {
            run.draw(g);
            // Во время забега на паузе сцену закрываем, чтобы нельзя было «подглядеть» решение.
            if (MG.paused) drawPause(g);
        } else if (screen) {
            screen.draw(g);
        } else {
            E.begin(MG.INK);
            E.end();
        }
        requestAnimationFrame(frame);
    }

    function boot() {
        E.init(document.getElementById('game'));
        E.onAnyDown = function () {
            MG.audio.unlock();
            // Страховка на случай, если браузер не прислал событие возврата фокуса.
            if (hidden && !document.hidden) { hidden = false; refreshPause(); }
        };

        document.addEventListener('visibilitychange', function () {
            hidden = document.hidden;
            refreshPause();
        });

        P.onPause = function () { platformPause = true; refreshPause(); };
        P.onResume = function () { platformPause = false; refreshPause(); };

        requestAnimationFrame(frame);

        P.init().then(function () {
            MG.setLang(P.lang || navigator.language);
            var touch = P.touchDevice();
            MG.touch = touch !== null ? touch : !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
            // Требование 1.6.2.2: на компьютере длинная сторона поля не больше двух коротких.
            if (P.isDesktop() || (touch === null && !MG.touch)) MG.maxH = 1440;
            E.resize();
            return P.load();
        }).then(function (data) {
            if (data && data.v) {
                for (var k in MG.save) if (data[k] !== undefined) MG.save[k] = data[k];
            }
            MG.audio.setMuted(MG.save.mute);
            state = 'title';
            showScreen(new MG.screens.Title());
            P.ready();
        });
    }

    boot();
})();
