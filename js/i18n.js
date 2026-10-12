(function () {
    'use strict';

    var STRINGS = {
        ru: {
            title: 'Мигом!',
            tagline: 'Успей за пару секунд',
            play: 'Играть',
            again: 'Ещё раз',
            score: 'Счёт',
            best: 'Рекорд',
            newBest: 'Новый рекорд!',
            faster: 'Быстрее!',
            forAd: 'за просмотр рекламы',
            pause: 'Пауза',
            collection: 'Коллекция',
            nextGame: 'До новой игры',
            canUnlock: 'Можно открыть новую игру!',
            pickOne: 'Монет хватает — выбирай любую',
            needMore: 'Не хватает монет',
            unlocked: 'открыто!',
            allOpen: 'Все игры открыты',
            bonus: 'бонус',
            games: 'Игры',
            skins: 'Облики',
            wear: 'надеть',
            worn: 'надет',
            pickSkin: 'Монет хватает — выбирай облик',
            nextSkin: 'До нового облика',
            allSkins: 'Все облики твои',
            canSkin: 'Можно купить новый облик!',
            needPrev: 'Сначала купи предыдущие облики',
            cleared: 'пройдено!',
            continueTitle: 'Ещё шанс?',
            continueBtn: 'Продолжить',
            giveUp: 'Закончить',
            toReward: 'Ещё {n} — и награда'
        },
        en: {
            title: 'In a Blink!',
            tagline: 'Beat it in seconds',
            play: 'Play',
            again: 'Play again',
            score: 'Score',
            best: 'Best',
            newBest: 'New best!',
            faster: 'Faster!',
            forAd: 'watch an ad',
            pause: 'Paused',
            collection: 'Collection',
            nextGame: 'Next game',
            canUnlock: 'You can unlock a new game!',
            pickOne: 'Enough coins — pick any game',
            needMore: 'Coins short',
            unlocked: 'unlocked!',
            allOpen: 'All games unlocked',
            bonus: 'bonus',
            games: 'Games',
            skins: 'Skins',
            wear: 'wear',
            worn: 'on',
            pickSkin: 'Enough coins — pick a skin',
            nextSkin: 'Next skin',
            allSkins: 'You own every skin',
            canSkin: 'You can get a new skin!',
            needPrev: 'Buy the previous skins first',
            cleared: 'cleared!',
            continueTitle: 'One more chance?',
            continueBtn: 'Continue',
            giveUp: 'Finish',
            toReward: '{n} more for a reward'
        }
    };

    // Языки, для которых показываем русскую версию.
    var RU_FAMILY = ['ru', 'be', 'kk', 'uk', 'uz'];

    MG.lang = 'ru';

    MG.setLang = function (code) {
        code = String(code || '').toLowerCase().slice(0, 2);
        MG.lang = RU_FAMILY.indexOf(code) >= 0 ? 'ru' : 'en';
        document.documentElement.lang = MG.lang;
    };

    MG.t = function (key) {
        return STRINGS[MG.lang][key] || STRINGS.en[key] || key;
    };

    // Для объектов вида { ru: '...', en: '...' } в описаниях микроигр.
    MG.tr = function (obj) {
        return obj ? (obj[MG.lang] || obj.en) : '';
    };
})();
