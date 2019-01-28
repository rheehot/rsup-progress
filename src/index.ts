import { normalizeOptions, Options, UserOptions } from './helpers'

export class Progress {
    private _el: HTMLDivElement
    private _opts!: Options
    private _isProgress = false
    private _isHiding = false
    private _isScheduled = false
    private _tickId: number | null = null

    constructor (userOpts: UserOptions = {}) {
        this._el = document.createElement('div')
        this.setOptions(userOpts)
    }

    public setOptions (userOpts: UserOptions) {
        const opts = this._opts = normalizeOptions(userOpts)
        this._el.className = opts.className
        this._css({
            position: 'fixed',
            zIndex: opts.zIndex,
            opacity: '0',
            top: '0',
            left: '0',
            height: opts.height,
            background: opts.color
        })
    }

    private _css (style: Partial<CSSStyleDeclaration>) {
        Object.assign(this._el.style, style)
    }

    get isProgress () {
        return this._isProgress
    }

    public start () {
        if (this._isProgress) {
            if (this._isHiding) this._isScheduled = true
            return
        }

        this._isProgress = true

        this._css({
            width: '0',
            opacity: '1',
            transition: `width ${this._opts.maxDuration}ms cubic-bezier(0,1,0,1)`
        })

        document.body.appendChild(this._el)

        this._nextTick(() => {
            this._nextTick(() => {
                this._css({ width: this._opts.maxWidth })
                this._tickId = null
            })
        })
    }

    private _nextTick (fn: () => void) {
        this._tickId = (requestAnimationFrame || setTimeout)(fn)
    }

    private _clearTick () {
        if (this._tickId) {
            (cancelAnimationFrame || clearTimeout)(this._tickId)
            this._tickId = null
        }
    }

    public end (immediately = false) {
        if (this._isScheduled) this._isScheduled = false
        if (!this._isProgress || this._isHiding) return

        if (this._tickId || immediately) {
            this._isProgress = false
            document.body.removeChild(this._el)

            if (this._tickId) this._clearTick()
            return
        }

        this._isHiding = true
        const PERSIST_TIME = 100

        this._css({
            width: '100%',
            opacity: '0',
            transition: `opacity ${this._opts.hideDuration}ms ${PERSIST_TIME}ms`
        })

        setTimeout(() => {
            this._isHiding = false
            this._isProgress = false
            document.body.removeChild(this._el)

            if (this._isScheduled) {
                this._isScheduled = false
                this.start()
            }
        }, this._opts.hideDuration + PERSIST_TIME)
    }
}

export default Progress