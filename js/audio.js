(function () {
    'use strict';

    // Все звуки синтезируются через WebAudio — аудиофайлов в сборке нет.
    var ctx = null, master = null, noiseBuf = null;
    var muted = false, held = false;
    var beatTimer = null, beatNext = 0, beatStep = 0, beatSpeed = 1;

    var A = MG.audio = {};

    function ensure() {
        if (ctx) return ctx;
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        ctx = new C();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.5;
        master.connect(ctx.destination);
        var len = Math.floor(ctx.sampleRate * 0.5);
        noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
        var d = noiseBuf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        if (held) ctx.suspend();
        return ctx;
    }

    // Браузеры разрешают звук только после первого жеста пользователя.
    A.unlock = function () {
        var c = ensure();
        if (c && c.state === 'suspended' && !held) c.resume();
    };

    A.setMuted = function (m) {
        muted = !!m;
        if (master) master.gain.value = muted ? 0 : 0.5;
    };

    // Полная остановка звука на время паузы, рекламы или потери фокуса.
    A.hold = function (on) {
        held = !!on;
        if (!ctx) return;
        if (held) ctx.suspend(); else ctx.resume();
    };

    function tone(freq, dur, type, vol, when, slideTo) {
        if (!ctx || held) return;
        var t = ctx.currentTime + (when || 0);
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, t);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + dur + 0.02);
    }

    function noise(dur, vol, when, hp) {
        if (!ctx || held) return;
        var t = ctx.currentTime + (when || 0);
        var s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        s.buffer = noiseBuf;
        f.type = 'highpass';
        f.frequency.value = hp || 1000;
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        s.connect(f); f.connect(g); g.connect(master);
        s.start(t); s.stop(t + dur + 0.02);
    }

    A.sfx = function (name) {
        if (!ensure()) return;
        switch (name) {
            case 'click': tone(520, 0.07, 'triangle', 0.3); break;
            case 'pop': tone(420, 0.12, 'sine', 0.5, 0, 880); break;
            case 'ding': tone(1175, 0.35, 'sine', 0.4); tone(1568, 0.4, 'sine', 0.3, 0.08); break;
            case 'slap': noise(0.09, 0.7, 0, 500); tone(160, 0.1, 'sine', 0.5, 0, 60); break;
            case 'miss': noise(0.06, 0.25, 0, 2500); break;
            case 'win':
                tone(659, 0.1, 'triangle', 0.35);
                tone(880, 0.1, 'triangle', 0.35, 0.08);
                tone(1319, 0.2, 'triangle', 0.35, 0.16);
                break;
            case 'lose':
                tone(220, 0.3, 'sawtooth', 0.3, 0, 70);
                noise(0.15, 0.2, 0, 300);
                break;
            case 'speedup':
                tone(330, 0.5, 'square', 0.15, 0, 1320);
                break;
            case 'coin': tone(988, 0.07, 'square', 0.2); tone(1319, 0.18, 'square', 0.2, 0.07); break;
            case 'jump': tone(300, 0.16, 'sine', 0.35, 0, 640); break;
            case 'whoosh': noise(0.12, 0.18, 0, 900); break;
            case 'slice': noise(0.08, 0.4, 0, 3000); tone(900, 0.09, 'triangle', 0.25, 0, 300); break;
            case 'splash': noise(0.25, 0.4, 0, 400); break;
            case 'boom': noise(0.45, 0.7, 0, 80); tone(110, 0.45, 'sawtooth', 0.4, 0, 35); break;
            case 'note0': tone(330, 0.24, 'triangle', 0.4); break;
            case 'note1': tone(415, 0.24, 'triangle', 0.4); break;
            case 'note2': tone(494, 0.24, 'triangle', 0.4); break;
            case 'note3': tone(659, 0.24, 'triangle', 0.4); break;
            case 'over':
                tone(392, 0.18, 'triangle', 0.35);
                tone(330, 0.18, 'triangle', 0.35, 0.18);
                tone(262, 0.4, 'triangle', 0.35, 0.36);
                break;
        }
    };

    // Простой ритм, темп которого растёт вместе со скоростью игры.
    var BASS = [110, 110, 146.83, 130.81];

    function scheduleStep(step, when, stepDur) {
        var s = step % 8;
        if (s === 0 || s === 4) tone(140, 0.13, 'sine', 0.45, when, 45);
        if (s === 2 || s === 6) noise(0.05, 0.12, when, 5000);
        else if (s % 2 === 1) noise(0.025, 0.05, when, 7000);
        if (s === 0 || s === 3 || s === 4 || s === 6) {
            var root = BASS[Math.floor(step / 8) % BASS.length];
            tone(root, stepDur * 0.9, 'triangle', 0.16, when);
        }
    }

    function beatTick() {
        if (!ctx || held) return;
        var stepDur = 60 / (112 * beatSpeed) / 2;
        if (beatNext < ctx.currentTime) beatNext = ctx.currentTime + 0.05;
        while (beatNext < ctx.currentTime + 0.12) {
            scheduleStep(beatStep, beatNext - ctx.currentTime, stepDur);
            beatNext += stepDur;
            beatStep++;
        }
    }

    A.startBeat = function (speed) {
        if (!ensure()) return;
        beatSpeed = speed || 1;
        beatStep = 0;
        beatNext = ctx.currentTime + 0.1;
        if (!beatTimer) beatTimer = setInterval(beatTick, 30);
    };

    A.setSpeed = function (speed) { beatSpeed = speed; };

    A.stopBeat = function () {
        if (beatTimer) { clearInterval(beatTimer); beatTimer = null; }
    };
})();
