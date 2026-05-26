import { lerp } from '../utils/functions'

export class Path {
    constructor(d, { x, y, width, height, hide }) {
        this.d = d
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.pos = { x: 0, y: 0 }
        this.acc = { x: 0, y: 0 }
        this.vel = { x: 0, y: 0 }
        this.targetPos = { x: 0, y: 0 }

        this.delta = { x: 0, y: 0 }
        this.dist = 0

        this.springForce = { x: 0, y: 0 }
        this.dampingForce = { x: 0, y: 0 }
        this.force = { x: 0, y: 0 }

        this.alpha = 1
        this.strokeAlpha = 1
        this.fillColor = `hsla(0, 0%, 100%, ${this.alpha})`
        this.strokeColor = `hsla(0, 0%, 100%, ${this.strokeAlpha})`
        this.hide = hide
        this.moveRadius = -70
        this.maxDist = 50
    }

    draw(ctx) {
        const path1 = new Path2D(this.d)
        const path2 = new Path2D()
        ctx.fillStyle = this.fillColor
        ctx.strokeStyle = this.strokeColor
        path2.addPath(path1, new DOMMatrix(`translate(${this.pos.x}px, ${this.pos.y}px)`))
        ctx.fill(path2)
        ctx.stroke(path2)
    }

    // stiffness = 60, mass = 1.5, damping = 10 --- in project
    // stiffness = 60, mass = 1.8, damping = 20
    // stiffness = 60, mass = 3, damping = 20

    createSpringPosition(ctx, mouse, delta, { stiffness = 60, mass = 3, damping = 20 } = {}) {
        /**
         * F - Force
         * a - acceleration
         * k - Stiffnes
         * m - Mass
         * t - time interval (1/60 = 0.01666)
         *
         * F = -k*x
         * F = m*a
         *
         * m*a = -k*x
         * a = -k *x / m - Acceleration
         *
         * vel2 = vel1 + a*t - Velocity
         * pos2 =  pos1 + v*t - Position
         */

        // Stiffnes
        let k = -stiffness
        // Damping
        let d = -damping

        const dt = Math.max(Math.min(delta, 40), 1) / 1000

        this.delta.x = mouse.x - (this.x + this.width / 2)
        this.delta.y = mouse.y - (this.y + this.height / 2)

        this.dist = Math.sqrt(this.delta.x * this.delta.x + this.delta.y * this.delta.y)

        if (this.dist !== 0) {
            this.force.x = this.delta.x / this.dist
            this.force.y = this.delta.y / this.dist
        }

        this.targetPos.x = 0
        this.targetPos.y = 0

        if (Math.abs(this.pos.x) <= 5 && Math.abs(this.pos.y) <= 5) {
            if (this.hide) {
                this.alpha = lerp(this.alpha, 1, 0.1)
                this.strokeAlpha = lerp(this.strokeAlpha, 1, 0.01)
                this.fillColor = `hsla(0, 0%, 100%, ${this.alpha})`
                this.strokeColor = `hsla(0, 0%, 100%, ${this.strokeAlpha})`
            }
            // ctx.shadowColor = `hsla(0, 0%, 0%, 0)`
            // ctx.shadowBlur = 0
        }

        if (this.dist < this.maxDist) {
            this.targetPos.x = this.force.x * this.moveRadius
            this.targetPos.y = this.force.y * this.moveRadius
            if (this.hide) {
                this.alpha = 0
                this.strokeAlpha = 0
                this.fillColor = `hsla(0, 0%, 100%, ${this.alpha})`
                this.strokeColor = `hsla(0, 0%, 100%, ${this.strokeAlpha})`
            }
        }
        this.springForce.x = k * (this.pos.x - this.targetPos.x)
        this.springForce.y = k * (this.pos.y - this.targetPos.y)

        this.dampingForce.x = d * this.vel.x
        this.dampingForce.y = d * this.vel.y

        this.acc.x = (this.springForce.x + this.dampingForce.x) / mass
        this.acc.y = (this.springForce.y + this.dampingForce.y) / mass

        this.vel.x += this.acc.x * dt
        this.vel.y += this.acc.y * dt

        this.pos.x += this.vel.x * dt
        this.pos.y += this.vel.y * dt

        // if (distance < 30 && Math.abs(this.pos.x) >= 0.5 && Math.abs(this.pos.y) >= 0.5) {
        //     ctx.shadowColor = `hsla(0, 0%, 0%, 0.1)`
        //     ctx.shadowBlur = 3
        // }
    }
}
