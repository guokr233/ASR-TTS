/*
录音
https://github.com/xiangyuecn/Recorder
src: recorder-core.js,engine/wav.js
*/
!function (a) {
    "use strict";
    a.RecorderLM = "2019-4-23 15:23:07";
    var w = function () {
    };

    function o(e) {
        return new t(e)
    }

    function t(e) {
        var t = {type: "mp3", bitRate: 16, sampleRate: 16e3, bufferSize: 4096, onProcess: w};
        for (var a in e) t[a] = e[a];
        this.set = t
    }

    o.IsOpen = function () {
        var e = o.Stream;
        if (e) {
            var t = e.getTracks();
            if (0 < t.length) return "live" == t[0].readyState
        }
        return !1
    }, o.Support = function () {
        var e = a.AudioContext;
        if (e || (e = a.webkitAudioContext), !e) return !1;
        var t = navigator.mediaDevices || {};
        return t.getUserMedia || (t = navigator).getUserMedia || (t.getUserMedia = t.webkitGetUserMedia || t.mozGetUserMedia || t.msGetUserMedia), !!t.getUserMedia && (o.Scope = t, o.Ctx && "closed" != o.Ctx.state || (o.Ctx = new e), !0)
    }, o.prototype = t.prototype = {
        open: function (t, r) {
            if (t = t || w, r = r || w, o.IsOpen()) t(); else if (o.Support()) {
                var e = function (e) {
                    o.Stream = e, setTimeout(function () {
                        o.IsOpen() ? t() : r("录音功能无效：无音频流")
                    }, 100)
                }, a = function (e) {
                    var t = e.name || e.message || "";
                    console.error(e);
                    var a = /Permission|Allow/i.test(t);
                    r(a ? "用户拒绝了录音权限" : "无法录音：" + t, a)
                }, n = o.Scope.getUserMedia({audio: !0}, e, a);
                n && n.then && n.then(e).catch(a)
            } else r("此浏览器不支持录音", !1)
        }, close: function (e) {
            e = e || w;
            this._stop();
            var t = o.Stream;
            if (t) for (var a = t.getTracks(), r = 0; r < a.length; r++) a[r].stop();
            o.Stream = 0, e()
        }, start: function () {
            var e = this, t = o.Ctx;
            e.buffer = [];
            e.recSize = 0, e._stop(), e.state = 0, o.IsOpen() && (console.log("[" + Date.now() + "]Start"), e.srcSampleRate = t.sampleRate, e.isMock = 0, "suspended" == t.state ? t.resume().then(function () {
                console.log("ctx resume"), e._start()
            }) : e._start())
        }, _start: function () {
            var f, p = this, l = p.set, v = p.buffer, e = o.Ctx, t = p.media = e.createMediaStreamSource(o.Stream),
                a = p.process = (e.createScriptProcessor || e.createJavaScriptNode).call(e, l.bufferSize, 1, 1);
            a.onaudioprocess = function (e) {
                if (1 == p.state) {
                    var t = e.inputBuffer.getChannelData(0), a = t.length;
                    p.recSize += a;
                    for (var r, n = new Int16Array(a), o = 0, s = 0; s < a; s++) {
                        var i = Math.max(-1, Math.min(1, t[s]));
                        i = i < 0 ? 32768 * i : 32767 * i, n[s] = i, o += Math.abs(i)
                    }
                    v.push(n), r = (o /= a) < 1251 ? Math.round(o / 1250 * 10) : Math.round(Math.min(100, Math.max(0, 100 * (1 + Math.log(o / 1e4) / Math.log(10)))));
                    var c = p.srcSampleRate, u = Math.round(p.recSize / c * 1e3);
                    clearTimeout(f), f = setTimeout(function () {
                        l.onProcess(v, r, u, c)
                    })
                }
            }, t.connect(a), a.connect(e.destination), p.state = 1
        }, _stop: function () {
            var e = this;
            e.state && (e.state = 0, e.media.disconnect(), e.process.disconnect())
        }, pause: function (e) {
            this.state && (this.state = e || 2)
        }, resume: function () {
            this.pause(1)
        }, mock: function (e, t) {
            var a = this;
            return a.isMock = 1, a.buffer = [e], a.recSize = e.length, a.srcSampleRate = t, a
        }, stop: function (a, r) {
            console.log("[" + Date.now() + "]Stop"), a = a || w, r = r || w;
            var e = this, n = e.set;
            if (!e.isMock) {
                if (!e.state) return void r("未开始录音");
                e._stop()
            }
            var t = e.recSize;
            if (t) if (e[n.type]) {
                var o = n.sampleRate, s = e.srcSampleRate, i = s / o;
                1 < i ? t = Math.floor(t / i) : (i = 1, o = s, n.sampleRate = o);
                for (var c = new Int16Array(t), u = 0, f = 0, p = 0, l = e.buffer.length; p < l; p++) {
                    for (var v = e.buffer[p], h = u, d = v.length; h < d;) {
                        var m = Math.floor(h), M = Math.ceil(h), S = h - m;
                        c[f] = v[m] + (v[M] - v[m]) * S, f++, h += i
                    }
                    u = h - d
                }
                var g = Math.round(t / o * 1e3);
                setTimeout(function () {
                    var t = Date.now();
                    e[n.type](c, function (e) {
                        console.log("[" + Date.now() + "]End", g, "编码耗时:" + (Date.now() - t), e), e.size < 500 ? r("生成的" + n.type + "无效") : a(e, g)
                    }, function (e) {
                        r(e)
                    })
                })
            } else r("未加载" + n.type + "编码器"); else r("未采集到录音")
        }
    }, a.Recorder = o
}(window), function () {
    "use strict";
    Recorder.prototype.enc_wav = {stable: !0, testmsg: "比特率取值范围8位、16位"}, Recorder.prototype.wav = function (e, t, a) {
        var r = this.set, n = e.length, o = r.sampleRate, s = 8 == r.bitRate ? 8 : 16, i = n * (s / 8),
            c = new ArrayBuffer(44 + i), u = new DataView(c), f = 0, p = function (e) {
                for (var t = 0; t < e.length; t++, f++) u.setUint8(f, e.charCodeAt(t))
            }, l = function (e) {
                u.setUint16(f, e, !0), f += 2
            }, v = function (e) {
                u.setUint32(f, e, !0), f += 4
            };
        if (p("RIFF"), v(36 + i), p("WAVE"), p("fmt "), v(16), l(1), l(1), v(o), v(o * (s / 8)), l(s / 8), l(s), p("data"), v(i), 8 == s) for (var h = 0; h < n; h++, f++) {
            var d = e[h];
            d = parseInt(255 / (65535 / (d + 32768))), u.setInt8(f, d, !0)
        } else for (h = 0; h < n; h++, f += 2) u.setInt16(f, e[h], !0);
        t(new Blob([u], {type: "audio/wav"}))
    }
}();