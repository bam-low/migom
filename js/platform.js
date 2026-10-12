(function () {
    'use strict';

    // Обёртка над SDK Яндекс Игр. Без SDK (локальный запуск файла) всё работает на заглушках.
    var KEY = 'migom_save_v1';

    var P = MG.platform = {
        ysdk: null,
        player: null,
        lang: null,
        onPause: null,
        onResume: null
    };

    P.init = function () {
        if (!window.YaGames) return Promise.resolve();
        return YaGames.init().then(function (ysdk) {
            P.ysdk = ysdk;
            try { P.lang = ysdk.environment.i18n.lang; } catch (e) { /* язык возьмём из браузера */ }
            // Платформа просит паузу при рекламе (в том числе стартовой), покупках и сворачивании вкладки.
            ysdk.on('game_api_pause', function () { if (P.onPause) P.onPause(); });
            ysdk.on('game_api_resume', function () { if (P.onResume) P.onResume(); });
            return ysdk.getPlayer().then(function (player) { P.player = player; }, function () { });
        }).catch(function (e) {
            console.warn('Yandex SDK init failed', e);
        });
    };

    // true — телефон или планшет, false — компьютер или ТВ, null — SDK недоступен.
    P.touchDevice = function () {
        var d = P.ysdk && P.ysdk.deviceInfo;
        if (!d || !d.type) return null;
        return d.type === 'mobile' || d.type === 'tablet';
    };

    P.isDesktop = function () {
        var d = P.ysdk && P.ysdk.deviceInfo;
        return !!(d && d.type === 'desktop');
    };

    P.ready = function () {
        var f = P.ysdk && P.ysdk.features;
        if (f && f.LoadingAPI) f.LoadingAPI.ready();
    };

    P.gameplayStart = function () {
        var f = P.ysdk && P.ysdk.features;
        if (f && f.GameplayAPI) f.GameplayAPI.start();
    };

    P.gameplayStop = function () {
        var f = P.ysdk && P.ysdk.features;
        if (f && f.GameplayAPI) f.GameplayAPI.stop();
    };

    // Полноэкранная реклама. Промис выполняется, когда можно продолжать игру.
    P.fullscreen = function () {
        return new Promise(function (resolve) {
            if (!P.ysdk) { resolve(false); return; }
            var done = false, opened = false;
            function finish(shown) { if (!done) { done = true; resolve(shown); } }
            try {
                P.ysdk.adv.showFullscreenAdv({
                    callbacks: {
                        onOpen: function () { opened = true; },
                        onClose: function (wasShown) { finish(!!wasShown); },
                        onError: function () { finish(false); }
                    }
                });
            } catch (e) { finish(false); }
            // Страховка: если SDK не ответил, игрок не должен застрять на экране результата.
            setTimeout(function () { if (!opened) finish(false); }, 3000);
        });
    };

    // Реклама за вознаграждение. Промис возвращает true, если просмотр засчитан.
    P.rewarded = function () {
        return new Promise(function (resolve) {
            if (!P.ysdk) { resolve(true); return; }
            var done = false, rewarded = false;
            function finish() { if (!done) { done = true; resolve(rewarded); } }
            try {
                P.ysdk.adv.showRewardedVideo({
                    callbacks: {
                        onRewarded: function () { rewarded = true; },
                        onClose: finish,
                        onError: finish
                    }
                });
            } catch (e) { finish(); }
        });
    };

    function readLocal() {
        try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
    }

    P.load = function () {
        var local = readLocal();
        if (!P.player) return Promise.resolve(local);
        return P.player.getData().then(function (cloud) {
            if (!cloud || !cloud.v) return local;
            if (!local) return cloud;
            return (cloud.runs || 0) >= (local.runs || 0) ? cloud : local;
        }, function () { return local; });
    };

    P.save = function (data) {
        try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* хранилище недоступно */ }
        if (P.player) P.player.setData(data, true).catch(function () { });
    };
})();
