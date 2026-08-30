const particles =
document.getElementById("particles");

for (let i = 0; i < 45; i++) {

const particle =
    document.createElement("div");

particle.className = "particle";

particle.style.left =
    Math.random() * 100 + "%";

particle.style.top =
    Math.random() * 100 + "%";

particle.style.animationDuration =
    (6 + Math.random() * 10) + "s";

particle.style.animationDelay =
    (Math.random() * 8) + "s";

particle.style.opacity =
    0.15 + Math.random() * 0.5;

particles.appendChild(particle);

}

const cardsData = [

{
    img: "img/1.png",
    caption: "Se eu pedir com educação, você morre?"
},

{
    img: "img/2.jpg",
    caption: "O dia do cinema"
},

{
    img: "img/3.jpg",
    caption: "Qnd comemos aborgue no shopping"
},

{
    img: "img/4.jpg",
    caption: "O dia que vc conheceu meus pais"
},

{
    img: "img/5.jpg",
    caption: "Brutus, aborgue top"
},

{
    img: "img/6.jpg",
    caption: "Esfiha, filme e coisax..."
},

{
    img: "img/7.jpg",
    caption: "O gay bundudo do jacomarkkkkkk"
},

{
    img: "img/8.jpg",
    caption: "Só vc dormindo no meu colo msm"
},

{
    img: "img/9.jpg",
    caption: "Vc deitada no meu pé e eu deitado no seu, troca justa!"
},

{
    img: "img/10.jpg",
    caption: "Essa foto ficou linda, pq há seu sorriso nela"
},

{
    img: "img/11.jpg",
    caption: "Única mulher que receberá flores de mim."
},

{
    img: "img/12.jpg",
    caption: "Esse dia foi inesquecível <3"
},

{
    img: "img/13.jpg",
    caption: "Só de olhar para essa flor, eu lembro de vc"
},

{
    img: "img/14.jpg",
    caption: "A NOSSA CALÇA SWAG!"
},

{
    img: "img/15.jpg",
    caption: "Chicão smpr entrosando"
},

{
    img: "img/16.jpg",
    caption: "Nesse dia, vc estava absurdamente linda"
},

{
    img: "img/17.jpg",
    caption: "Essa camisa já virou sua marca registrada kkkk"
},

{
    img: "img/18.jpg",
    caption: "Foi um trampo expandir essa foto, mas ficou linda"
},

{
    img: "img/19.jpg",
    caption: "KKKKKKKKKKKKKKKKKKKKKKKKKKKKK"
},

{
    img: "img/20.jpg",
    caption: "Minha total versão feminina"
},

{
    img: "img/21.jpg",
    caption: "😡😡😡"
},

{
    img: "img/22.jpg",
    caption: "SKJDAOSDAO eu te amo amor!"
},

];

let currentIndex = 0;

const stack =
document.getElementById(
"card-stack"
);

const finalScreen =
document.getElementById(
"final-screen"
);

const timerReveal =
document.getElementById(
"timer-reveal"
);

function createCard(data, index, photoIndex) {

const card =
    document.createElement("div");

card.className =
    "tinder-card";

card.dataset.index =
    index;

card.style.zIndex =
    100 - index;

card.style.transform =
    `scale(${1 - index * 0.035})
     translateY(${index * 7}px)`;

card.style.opacity = "1";


const img =
    document.createElement("img");

img.src = data.img;

img.alt = data.caption;

img.draggable = false;

card.appendChild(img);


const caption =
    document.createElement("div");

caption.className =
    "caption";

caption.innerHTML = `
    <small>memória ${photoIndex + 1}</small>
    <span>${data.caption}</span>
`;

card.appendChild(caption);


const likeBadge =
    document.createElement("div");

likeBadge.className =
    "badge like";

card.appendChild(likeBadge);


const nopeBadge =
    document.createElement("div");

nopeBadge.className =
    "badge nope";

card.appendChild(nopeBadge);


return card;

}

function renderCards() {

stack.innerHTML = "";

const remaining =
    cardsData.slice(
        currentIndex
    );


if (!remaining.length) {

    showFinalScreen();

    return;
}


remaining.forEach(
    (data, index) => {

        const card =
    createCard(
        data,
        index,
        currentIndex + index
    );

stack.appendChild(card);
    }
);


const topCard =
    stack.querySelector(
        ".tinder-card:first-child"
    );


if (topCard) {

    initSwipe(topCard);
}

}

function initSwipe(card) {

let startX = 0;
let startY = 0;

let dragging = false;


const likeBadge =
    card.querySelector(
        ".badge.like"
    );

const nopeBadge =
    card.querySelector(
        ".badge.nope"
    );


function start(event) {

    if (
        event.type === "mousedown" &&
        event.button !== 0
    ) {
        return;
    }


    dragging = true;

    startX =
        event.clientX;

    startY =
        event.clientY;


    card.style.transition =
        "none";
}


function move(event) {

    if (!dragging) return;


    const dx =
        event.clientX - startX;

    const dy =
        event.clientY - startY;


    const rotation =
        dx * 0.055;


    card.style.transform =
        `translate(${dx}px, ${dy * 0.25}px)
         rotate(${rotation}deg)`;


    const strength =
        Math.min(
            Math.abs(dx) / 120,
            1
        );


    if (dx > 0) {

        likeBadge.style.opacity =
            strength;

        nopeBadge.style.opacity =
            0;

    } else if (dx < 0) {

        nopeBadge.style.opacity =
            strength;

        likeBadge.style.opacity =
            0;

    } else {

        likeBadge.style.opacity = 0;
        nopeBadge.style.opacity = 0;
    }
}


function end(event) {

    if (!dragging) return;

    dragging = false;


    const dx =
        event.clientX - startX;


    const threshold = 105;


    card.style.transition =
        "transform .55s cubic-bezier(.16,1,.3,1), opacity .4s ease";


    if (dx > threshold) {

        card.style.transform =
            `translateX(${window.innerWidth * 1.25}px)
             rotate(20deg)`;

        card.style.opacity = "0";


        removeCard();

    } else if (dx < -threshold) {

        card.style.transform =
            `translateX(-${window.innerWidth * 1.25}px)
             rotate(-20deg)`;

        card.style.opacity = "0";


        removeCard();

    } else {

        const index =
            Number(card.dataset.index);


        card.style.transform =
            `scale(${1 - index * 0.035})
             translateY(${index * 7}px)`;


        card.style.opacity = "1";
    }


    likeBadge.style.opacity = 0;
    nopeBadge.style.opacity = 0;
}


function removeCard() {

    setTimeout(() => {

        currentIndex++;

        renderCards();

    }, 380);
}


card.addEventListener(
    "pointerdown",
    start
);

card.addEventListener(
    "pointermove",
    move
);

card.addEventListener(
    "pointerup",
    end
);

card.addEventListener(
    "pointercancel",
    end
);

}

function showFinalScreen() {

stack.style.display =
    "none";

finalScreen.style.display =
    "flex";

initEnvelope();

}


let envelopeInitialized =
false;

function initEnvelope() {

if (envelopeInitialized) {
    return;
}

envelopeInitialized = true;


const flap =
    document.getElementById(
        "envelopeFlap"
    );

const modal =
    document.getElementById(
        "letterModal"
    );


flap.addEventListener(
    "click",
    () => {

        /*
         * Primeiro abre somente
         * o envelope.
         *
         * Não existe carta dentro
         * do DOM visual do envelope.
         */

        flap.classList.add(
            "open"
        );


        /*
         * Depois da animação,
         * mostra a carta.
         */

        setTimeout(() => {

            modal.classList.add(
                "active"
            );

        }, 800);
    }
);

}

/* =========================================================
LETTER
========================================================= */

const modal =
document.getElementById(
"letterModal"
);

const closeModalBtn =
document.getElementById(
"closeModalBtn"
);

const timerBtn =
document.getElementById(
"timerBtn"
);

/* =========================================================
CLOSE LETTER
========================================================= */

if (closeModalBtn) {
    closeModalBtn.addEventListener(
    "click",
    () => {

        modal.classList.remove(
            "active"
        );
    }

    );
}

/* =========================================================
CLICK OUTSIDE
========================================================= */

modal.addEventListener(
"click",
(event) => {

    if (
        event.target === modal
    ) {

        modal.classList.remove(
            "active"
        );
    }
}

);

/* =========================================================
ESC
========================================================= */

document.addEventListener(
"keydown",
(event) => {

    if (
        event.key === "Escape"
    ) {

        modal.classList.remove(
            "active"
        );
    }
}

);

/* =========================================================
TIMER
========================================================= */

timerBtn.addEventListener(
"click",
() => {

    modal.classList.remove(
        "active"
    );


    setTimeout(() => {

        finalScreen.style.display =
            "none";

        timerReveal.style.display =
            "flex";

        showFinalTimer();

    }, 350);
}

);

/* =========================================================
TIMER CALCULATION
========================================================= */

function showFinalTimer() {
    const start = new Date(2026, 4, 5, 0, 0, 0);
    const end = new Date(2026, 7, 29, 16, 8, 56);

    let cursor = new Date(start);

    let years = 0;
    let months = 0;
    let days = 0;

    while (true) {
        const next = new Date(cursor);
        next.setMonth(next.getMonth() + 1);

        if (next <= end) {
            months++;
            cursor = next;
        } else {
            break;
        }
    }

    while (true) {
        const next = new Date(cursor);
        next.setDate(next.getDate() + 1);

        if (next <= end) {
            cursor = next;
            days++;
        } else {
            break;
        }
    }

    const remainingMs = end - cursor;

    const hours = Math.floor(
        remainingMs / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
        (remainingMs % (1000 * 60 * 60)) /
        (1000 * 60)
    );

    const seconds = Math.floor(
        (remainingMs % (1000 * 60)) /
        1000
    );

    const values = {
        months: months,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };

    Object.entries(values).forEach(([key, target]) => {
        const el = document.getElementById(`f-${key}`);

        let current = 0;
        const step = Math.max(1, Math.ceil(target / 25));

        const interval = setInterval(() => {
            current += step;

            if (current >= target) {
                current = target;
                clearInterval(interval);
            }

            el.textContent = String(current).padStart(2, '0');
        }, 25);
    });
}

/* =========================================================
TIMER ANIMATION
========================================================= */

function animateNumber(
id,
target
) {

const element =
    document.getElementById(
        id
    );


const duration = 700;

const startTime =
    performance.now();


function update(now) {

    const progress =
        Math.min(
            (now - startTime) /
            duration,
            1
        );


    const eased =
        1 -
        Math.pow(
            1 - progress,
            3
        );


    const value =
        Math.floor(
            target * eased
        );


    element.textContent =
        String(value)
            .padStart(2, "0");


    if (progress < 1) {

        requestAnimationFrame(
            update
        );

    } else {

        element.textContent =
            String(target)
                .padStart(2, "0");
    }
}


requestAnimationFrame(
    update
);

}

/* =========================================================
START
========================================================= */

renderCards();
