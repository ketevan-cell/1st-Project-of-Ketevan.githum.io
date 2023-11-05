const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let contextHeight = 0;
let contextWidth = 0;
let bgColor = "#c9cba3";
let animations = [];

const addClickListeners = () => {
    document.addEventListener("mousedown", handleEvent);
}

// Init color picker
const colorPicker = (() => {
    let colors = ["#c9cba3", "#ffe1a8", "#e26d5c", "#723d46"];
    let index = 0;
    const next = () => {
        index = index++ < colors.length-1 ? index : 0;
        return colors[index];
    }
    const current = () => {
        return colors[index]
    }
    return {
        next: next,
        current: current
    }
})();

const handleEvent = (e) => {
    if (e.target.className.includes('no-click')) {
        return;
    }
    const currentColor = colorPicker.current();
    const nextColor = colorPicker.next();
    const targetRadius = calcPageFillRadius(e.pageX, e.pageY);
    const rippleSize = Math.min(200, (contextWidth * .4));
    const minCoverDuration = 750;

    const pageFill = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: nextColor
    });
    const fillAnimation = anime({
        targets: pageFill,
        r: targetRadius,
        duration:  Math.max(targetRadius / 2 , minCoverDuration ),
        easing: "easeOutQuart",
        complete: function(){
            bgColor = pageFill.fill;
            removeAnimation(fillAnimation);
        }
    });

    const ripple = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: currentColor,
        stroke: {
            width: 3,
            color: currentColor
        },
        opacity: 1
    });
    const rippleAnimation = anime({
        targets: ripple,
        r: rippleSize,
        opacity: 0,
        easing: "easeOutExpo",
        duration: 900,
        complete: removeAnimation
    });

    const particles = [];
    for (let i=0; i < 32; i++) {
        const particle = new Circle({
            x: e.pageX,
            y: e.pageY,
            fill: currentColor,
            r: anime.random(24, 48)
        })
        particles.push(particle);
    }
    const particlesAnimation = anime({
        targets: particles,
        x: (particle) => {
            return particle.x + anime.random(rippleSize, -rippleSize);
        },
        y: (particle) => {
            return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
        },
        r: 0,
        easing: "easeOutExpo",
        duration: anime.random(1000,1300),
        complete: removeAnimation
    });
    animations.push(fillAnimation, rippleAnimation, particlesAnimation);
}

const removeAnimation = (animation) => {
    const animationIndex = animations.indexOf(animation);
    if (animationIndex > -1) {
        animations.splice(animationIndex, 1);
    }
}

const calcPageFillRadius = (x, y) => {
    const l = Math.max(x - 0, contextWidth - x);
    const h = Math.max(y - 0, contextHeight - y);
    return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
}

const extend = (a, b) => {
    for(let key in b) {
        if(b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }
    return a;
}
const Circle = function(opts) {
    extend(this, opts);
}

Circle.prototype.draw = function() {
    context.globalAlpha = this.opacity || 1;
    context.beginPath();
    context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    if (this.stroke) {
        context.strokeStyle = this.stroke.color;
        context.lineWidth = this.stroke.width;
        context.stroke();
    }
    if (this.fill) {
        context.fillStyle = this.fill;
        context.fill();
    }
    context.closePath();
    context.globalAlpha = 1;
}

anime({
    duration: Infinity,
    update: function() {
        context.fillStyle = bgColor;
        context.fillRect(0, 0, contextWidth, contextHeight);
        animations.forEach(function(anim) {
            anim.animatables.forEach(function(animatable) {
                animatable.target.draw();
            });
        });
    }
});

const resizeCanvas = () => {
    contextWidth = window.innerWidth;
    contextHeight = window.innerHeight;
    canvas.width = contextWidth * devicePixelRatio;
    canvas.height = contextHeight * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);
};

const init = () => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    addClickListeners();
};
init();

