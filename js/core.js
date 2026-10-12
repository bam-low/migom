'use strict';

// Виртуальное поле: ширина фиксирована, высота подстраивается под экран (см. engine.resize).
var MG = window.MG = {
    W: 720,
    H: 1280,
    maxH: 1600,         // на компьютере снижается до 1440: там поле не должно быть вытянуто сильнее 2:1
    games: [],
    paused: false,
    touch: false,       // игрок нажимает пальцем, а не мышью
    INK: '#23233B',
    WHITE: '#FFF8F0',
    GOOD: '#3DDC84',
    BAD: '#FF4D5E',
    GOLD: '#FFC93C',
    CORAL: '#FF5A5F'
};

MG.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
MG.lerp = function (a, b, t) { return a + (b - a) * t; };
MG.rand = function (a, b) { return a + Math.random() * (b - a); };
MG.randInt = function (a, b) { return Math.floor(MG.rand(a, b + 1)); };

MG.shuffle = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
};

MG.ease = {
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    inCubic: function (t) { return t * t * t; },
    outBack: function (t) {
        var c1 = 1.70158, c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
};

// f < 1 затемняет цвет вида #RRGGBB, f > 1 осветляет.
MG.shade = function (hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var r = MG.clamp(Math.round(((n >> 16) & 255) * f), 0, 255);
    var g = MG.clamp(Math.round(((n >> 8) & 255) * f), 0, 255);
    var b = MG.clamp(Math.round((n & 255) * f), 0, 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
};
