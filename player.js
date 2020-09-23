var AudioContext = window.AudioContext || window.webkitAudioContext;
function formatSeconds(seconds) {
    var s = Math.floor(seconds % 60);
    var m = Math.floor((seconds / 60) % 60);
    var u = Math.floor(((seconds / 60) / 60 ) % 60);
    if (m < 10) {
        m = '0' + m;
    }
    if (s < 10) {
        s = '0' + s;
    }
    if (u < 1) {
        return (m + ':' + s);
    }
    else if (u >= 1) {
        return (u + ':' + m + ':' + s);
    }
}

var aPlayer = {
    initialized: false,
    cur: -1,
    dir: 1,

    init: function()
    {
        this.initialized = true;
        this.list = document.getElementsByClassName("ep");
        this.epamount = this.list.length;
        this.audio = new Audio();
        this.context = new AudioContext();
        this.track = this.context.createMediaElementSource(this.audio);
        this.track.connect(this.context.destination);
        this.times = document.getElementById("player-times");

        if ('mediaSession' in navigator)
        {
            navigator.mediaSession.metadata = new MediaMetadata({});
            navigator.mediaSession.setActionHandler('play', this.play);
            navigator.mediaSession.setActionHandler('pause', this.pause);
            navigator.mediaSession.setActionHandler('nexttrack', this.next);
            navigator.mediaSession.setActionHandler('previoustrack', this.previous);
            navigator.mediaSession.setActionHandler('seekto', function(details) {
                if (!details.fastSeek)
                    aPlayer.seekTo(details.seekTime);
            });
            navigator.mediaSession.setActionHandler('seekbackward', this.skipBack);
            navigator.mediaSession.setActionHandler('seekforward', this.skipForward);
            navigator.mediaSession.playbackState = "none";
        }

        setInterval(function() {
            if (aPlayer.cur != -1) {
                if (!progressBar.hovering)
                {
                    var ct = aPlayer.getCurrentTime();
                    var dur = aPlayer.getDuration();
                    if (dur)
                    {
                        progressBar.setValue(ct / dur * 100);
                        aPlayer.updateTimes(ct, dur);
                    }
                    else {
                        aPlayer.times.innerHTML = "";
                    }
                }
                if (aPlayer.audio.buffered.length > 0)
                {
                    progressBar.setValueBuffer(aPlayer.audio.buffered.end(aPlayer.audio.buffered.length-1) / aPlayer.audio.duration * 100);
                }
                else
                {
                    progressBar.setValueBuffer(0);
                }
            }
        }, 500);

        this.audio.addEventListener("ended", function(event) {
            aPlayer.next();
        });
    },

    open: function(num)
    {
        if (!aPlayer.initialized)
        {
            aPlayer.init();
        }

        var audioSrc = aPlayer.list[num].href;
        var mdTitle = aPlayer.list[num].getAttribute("data-epname");
        var mdShow = aPlayer.list[num].getAttribute("data-show");
        var mdArtwork = aPlayer.list[num].getAttribute("data-art");
        var mdArtworkSize = aPlayer.list[num].getAttribute("data-artsize");
        var mdDate = aPlayer.list[num].getAttribute("data-date");
        document.getElementById("play-pause").innerHTML = "play_circle_outline";
        aPlayer.times.innerHTML = "";

        progressBar.setValue(0);
        progressBar.setValueBuffer(0);
        document.getElementById("player-art").src = mdArtwork;
        document.getElementById("player-title").innerHTML = mdTitle;
        document.getElementById("player-show").innerHTML = mdShow;
        document.getElementById("player-extra").innerHTML = "Broadcasted on " + mdDate;
        if ('mediaSession' in navigator)
        {
            navigator.mediaSession.playbackState = "none";
            navigator.mediaSession.metadata = new MediaMetadata({
                title: mdTitle,
                artist: mdShow,
                artwork: [
                    {
                        sizes: mdArtworkSize,
                        src: mdArtwork,
                        type: "image/jpeg"
                    }
                ]
            });
        }

        aPlayer.cur = num;
        aPlayer.audio.src = audioSrc;
        aPlayer.play();
    },

    togglePlayPause: function()
    {
        if (aPlayer.cur == -1)
            return aPlayer.open(0);
        if (aPlayer.audio.paused)
            return aPlayer.play();
        return aPlayer.pause();
    },

    play: function()
    {
        if (aPlayer.cur == -1)
            return aPlayer.open(0);
        if (aPlayer.audio.paused)
        {
            aPlayer.audio.play();
            document.getElementById("play-pause").innerHTML = "pause_circle_outline";
            if ('mediaSession' in navigator)
            {
                navigator.mediaSession.playbackState = "playing";
            }
        }
    },

    pause: function()
    {
        if (!aPlayer.audio.paused)
        {
            aPlayer.audio.pause();
            document.getElementById("play-pause").innerHTML = "play_circle_outline";
            if ('mediaSession' in navigator)
            {
                navigator.mediaSession.playbackState = "paused";
            }
        }
    },

    next: function()
    {
        if (aPlayer.dir == 1) {
            if (aPlayer.cur > -1 && aPlayer.cur + 1 < aPlayer.epamount)
                aPlayer.open(aPlayer.cur + 1);
            else
                aPlayer.open(0);
        }
        else
        {
            if (aPlayer.cur > 0)
                aPlayer.open(aPlayer.cur - 1);
            else
                aPlayer.open(aPlayer.epamount - 1);
        }
    },

    previous: function()
    {
        if (aPlayer.dir == 1)
        {
            if (aPlayer.cur > 0)
                aPlayer.open(aPlayer.cur - 1);
            else
                aPlayer.open(aPlayer.epamount - 1);
        }
        else
        {
            if (aPlayer.cur > -1 && aPlayer.cur + 1 < aPlayer.epamount)
                aPlayer.open(aPlayer.cur + 1);
            else
                aPlayer.open(0);
        }
    },

    getDuration: function()
    {
        return Math.floor(aPlayer.audio.duration);
    },

    getCurrentTime: function() {
        return Math.floor(aPlayer.audio.currentTime);
    },

    updateTimes: function(time, dur)
    {
        aPlayer.times.innerHTML = formatSeconds(time) + " / " + formatSeconds(dur);
    },

    seekTo: function(time)
    {
        aPlayer.audio.currentTime = time;
    },

    skipBack: function()
    {
        var curTime = aPlayer.getCurrentTime();
        if (curTime > 10)
            aPlayer.seekTo(curTime - 10);
    },

    skipForward: function()
    {
        var curTime = aPlayer.getCurrentTime();
        if (curTime < aPlayer.getDuration() - 11)
            aPlayer.seekTo(curTime + 10);
    },

    volumeUp: function()
    {
        if (aPlayer.audio.volume < 0.9)
            aPlayer.audio.volume += 0.1;
        else
            aPlayer.audio.volume = 1;
    },

    volumeDown: function()
    {
        if (aPlayer.audio.volume > 0.1)
            aPlayer.audio.volume -= 0.1;
        else
            aPlayer.audio.volume = 0;
    },

    setVolume: function(vol)
    {
        aPlayer.audio.volume = vol;
    },

    mute: function()
    {
        if (aPlayer.audio.muted || aPlayer.audio.volume == 0)
        {
            aPlayer.audio.muted = false;
            if (aPlayer.audio.volume < 0.1)
                aPlayer.audio.volume = 0.1;
        }
        else
        {
            aPlayer.audio.muted = true;
        }
    }
};