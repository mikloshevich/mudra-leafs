export default class Sound {
    constructor(audioEl) {
        this.audioEl = audioEl
        // this.audioEl.volume = 1.0
        this.fftSize = 64
        this.audioCtx = new AudioContext()
        this.audioSource = this.audioCtx.createMediaElementSource(this.audioEl)
        this.analyser = new AnalyserNode(this.audioCtx, {
            fftSize: this.fftSize,
            smoothingTimeConstant: 0,
            // minDecibels: -90,
            // maxDecibels: -25,
        })
        this.gainNode = this.audioCtx.createGain()
        this.gainNode.connect(this.audioCtx.destination)
        this.analyser.connect(this.audioCtx.destination)
        this.audioSource.connect(this.gainNode).connect(this.analyser)

        this.bufferLength = this.analyser.frequencyBinCount
        this.dataArray = new Uint8Array(this.bufferLength)

        this.setVolume(0.0)

        this.mute = false
        this.timeoutId
        this.maxVolume = 1.0
    }

    volumeFadeOut(volume = 0.01, fadeTime = 1) {
        this.setVolume(this.gainNode.gain.value)
        this.mute = true
        this.gainNode.gain.exponentialRampToValueAtTime(volume, this.audioCtx.currentTime + fadeTime)
        this.timeoutId = setTimeout(() => {
            this.suspend()
        }, fadeTime * 1000)
    }
    volumeFadeIn(fadeTime = 1) {
        if (!this.mute) return

        this.mute = false

        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
        }

        this.setVolume(this.gainNode.gain.value)
        this.resume()
        this.gainNode.gain.exponentialRampToValueAtTime(this.maxVolume, this.audioCtx.currentTime + fadeTime)
    }

    setVolume(val) {
        this.gainNode.gain.setValueAtTime(val, this.audioCtx.currentTime)
    }

    suspend() {
        if (this.audioCtx.state === 'running') {
            this.audioCtx.suspend()
            this.audioEl.pause()
        }
    }

    resume() {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume()
            this.audioEl.play()
        }
    }

    getNormData() {
        this.analyser.getByteTimeDomainData(this.dataArray)
        let normalizedSamples = [...this.dataArray].map((sample) => sample / 128 - 1)
        return normalizedSamples
    }
    getData() {
        // this.analyser.getByteFrequencyData(this.dataArray)
        this.analyser.getByteTimeDomainData(this.dataArray)
        return this.dataArray
    }
}
