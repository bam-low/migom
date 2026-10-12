(function () {
    'use strict';

    // Эти микроигры открыты с первого запуска, остальные покупаются за монеты.
    var START = ['catch', 'stop', 'swat', 'pour', 'jump', 'pop', 'find', 'more', 'dodge', 'math', 'sort'];
    // Цена одна на все игры: монеты можно удваивать рекламой, поэтому она высокая.
    var PRICE = 220;

    var C = MG.collection = {
        fresh: null     // только что купленная игра — следующий забег начнётся с неё
    };

    C.isOpen = function (def) {
        return !!def.bonus || START.indexOf(def.id) >= 0 || MG.save.unlocked.indexOf(def.id) >= 0;
    };

    C.locked = function () {
        return MG.games.filter(function (d) { return !C.isOpen(d); });
    };

    C.priceOf = function () { return PRICE; };

    // Игры можно покупать в любом порядке.
    C.available = function () { return true; };

    C.buyable = function (def) {
        return !C.isOpen(def) && MG.save.coins >= PRICE;
    };

    C.canBuy = function () {
        return C.locked().length > 0 && MG.save.coins >= PRICE;
    };

    // Цена ближайшей покупки или null, если всё куплено.
    C.nextPrice = function () {
        return C.locked().length ? PRICE : null;
    };

    // Монеты за рекламу в магазине: небольшая сумма, ограниченное число раз в день.
    var A = MG.adCoins = { AMOUNT: 30, LIMIT: 5 };

    function today() {
        var d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    A.left = function () {
        return MG.save.adDay === today() ? Math.max(0, A.LIMIT - MG.save.adCount) : A.LIMIT;
    };

    A.claim = function () {
        if (MG.save.adDay !== today()) { MG.save.adDay = today(); MG.save.adCount = 0; }
        MG.save.adCount++;
    };

    C.buy = function (def) {
        if (!C.buyable(def)) return false;
        MG.save.coins -= PRICE;
        MG.save.unlocked.push(def.id);
        C.fresh = def.id;
        return true;
    };
})();
