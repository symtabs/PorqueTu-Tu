
/* =========================================================
   NOSSA HISTÓRIA — BIBLIOTECA, LIVROS 3D, ÁLBUM E CONTADOR
   Dados externos: data/cartas.txt e data/dados.json
   ========================================================= */

const $ = (id) => document.getElementById(id);

/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */

let photosData = [];
let lettersData = [];
let spineVariants = [];

let START_DATE = new Date(2026, 4, 5, 0, 0, 0);

let currentLetterIndex = 0;
let currentPhotoIndex = 0;

let openingBookTimeout = null;
let closeBookTimeout = null;

let touchStartX = 0;
let appInitialized = false;

function pad(n) {
    return String(n).padStart(2, "0");
}

/* =========================================================
   CARREGAMENTO DOS ARQUIVOS EXTERNOS
   ========================================================= */

async function loadExternalData() {
    try {
        const [lettersResponse, dataResponse] = await Promise.all([
            fetch("data/cartas.txt"),
            fetch("data/dados.json")
        ]);

        if (!lettersResponse.ok) {
            throw new Error(
                `Erro ao carregar cartas.txt: HTTP ${lettersResponse.status}`
            );
        }

        if (!dataResponse.ok) {
            throw new Error(
                `Erro ao carregar dados.json: HTTP ${dataResponse.status}`
            );
        }

        const [lettersText, config] = await Promise.all([
            lettersResponse.text(),
            dataResponse.json()
        ]);

        lettersData = parseLettersTXT(lettersText);

        photosData = Array.isArray(config.photos)
            ? config.photos
            : [];

        spineVariants = Array.isArray(config.spineVariants)
            ? config.spineVariants
            : [];

        if (config.startDate) {
            const parsedDate = new Date(config.startDate);

            if (!Number.isNaN(parsedDate.getTime())) {
                START_DATE = parsedDate;
            } else {
                console.warn("[Contador] Data inicial inválida. Usando padrão.");
            }
        }

        console.info(
            `[Biblioteca] ${lettersData.length} carta(s) carregada(s).`
        );

        console.info(
            `[Álbum] ${photosData.length} fotografia(s) carregada(s).`
        );

        return true;

    } catch (error) {
        console.error("[Inicialização] Falha ao carregar dados:", error);
        return false;
    }
}

/* =========================================================
   INTERPRETADOR DO TXT
   Formato:
   
   ---CARTA---
   id: identificador
   category: Cartas
   title: Título
   subtitle: Subtítulo
   date: Data
   signature: Assinatura

   Conteúdo da carta...

   ---FIM---
   ========================================================= */

function parseLettersTXT(text) {
    return text
        .split("---CARTA---")
        .map(block => block.trim())
        .filter(block => block.includes("---FIM---"))
        .map(block => {
            const content = block.split("---FIM---")[0].trim();

            const separator = content.search(/\r?\n\s*\r?\n/);

            if (separator === -1) {
                console.warn(
                    "[Cartas] Carta ignorada: cabeçalho sem separação do conteúdo."
                );

                return null;
            }

            const header = content.slice(0, separator);
            const body = content.slice(separator).trim();

            const metadata = {};

            header.split(/\r?\n/).forEach(line => {
                const separatorIndex = line.indexOf(":");

                if (separatorIndex === -1) return;

                const key = line
                    .slice(0, separatorIndex)
                    .trim()
                    .toLowerCase();

                const value = line
                    .slice(separatorIndex + 1)
                    .trim();

                metadata[key] = value;
            });

            if (!metadata.id || !metadata.title || !body) {
                console.warn(
                    "[Cartas] Carta ignorada: ID, título ou conteúdo ausente."
                );

                return null;
            }

            return {
                id: metadata.id,
                category: metadata.category || "Cartas",
                title: metadata.title,
                subtitle: metadata.subtitle || "",
                date: metadata.date || "",
                signature: metadata.signature || "",
                content: body
            };
        })
        .filter(Boolean);
}

/* =========================================================
   PARTÍCULAS
   ========================================================= */

function initializeParticles() {
    const particles = $("particles");

    if (!particles) return;

    particles.innerHTML = "";

    for (let i = 0; i < 45; i++) {
        const p = document.createElement("div");

        p.className = "particle";

        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;

        p.style.animationDuration =
            `${6 + Math.random() * 10}s`;

        p.style.animationDelay =
            `${Math.random() * 8}s`;

        p.style.opacity =
            String(0.15 + Math.random() * 0.5);

        particles.appendChild(p);
    }
}

/* =========================================================
   BIBLIOTECA — ELEMENTOS
   ========================================================= */

const libraryCategories = $("library-categories");
const libraryCount = $("library-count");
const categoryCount = $("category-count");
const libraryEmpty = $("library-empty");

/* =========================================================
   BIBLIOTECA — RENDERIZA LIVROS
   ========================================================= */

function renderLibrary() {
    if (!libraryCategories) {
        console.warn("[Biblioteca] Elemento #library-categories não encontrado.");
        return;
    }

    libraryCategories.innerHTML = "";

    const groups = new Map();

    lettersData.forEach(letter => {
        if (!groups.has(letter.category)) {
            groups.set(letter.category, []);
        }

        groups.get(letter.category).push(letter);
    });

    if (libraryCount) {
        libraryCount.textContent =
            `${lettersData.length} ${
                lettersData.length === 1 ? "carta" : "cartas"
            }`;
    }

    if (categoryCount) {
        categoryCount.textContent =
            `${groups.size} ${
                groups.size === 1 ? "categoria" : "categorias"
            }`;
    }

    if (libraryEmpty) {
        libraryEmpty.hidden = lettersData.length !== 0;
    }

    groups.forEach((letters, categoryName) => {
        const section = document.createElement("section");

        section.className = "library-category";

        const heading = document.createElement("div");

        heading.className = "category-heading";

        const title = document.createElement("h3");

        title.textContent = categoryName;

        const amount = document.createElement("span");

        amount.textContent =
            `${String(letters.length).padStart(2, "0")} ${
                letters.length === 1 ? "carta" : "cartas"
            }`;

        heading.append(title, amount);

        const shelf = document.createElement("div");

        shelf.className = "shelf";

        const shelfBooks = document.createElement("div");

        shelfBooks.className = "shelf-books";

        letters.forEach((letter, index) => {
            const variant = spineVariants.length
                ? spineVariants[index % spineVariants.length]
                : {
                    w: 40,
                    h: 180,
                    a: "var(--spine-1a)",
                    b: "var(--spine-1b)"
                };

            const book = document.createElement("button");

            book.type = "button";
            book.className = "book-spine";

            book.dataset.letterId = letter.id;

            book.setAttribute(
                "aria-label",
                `Abrir o livro: ${letter.title}`
            );

            book.style.setProperty("--w", `${variant.w}px`);
            book.style.setProperty("--h", `${variant.h}px`);
            book.style.setProperty("--t", variant.a);
            book.style.setProperty("--b", variant.b);

            const ornament = document.createElement("span");

            ornament.className = "spine-ornament";
            ornament.textContent = "✦";

            const spineTitle = document.createElement("span");

            spineTitle.className = "spine-title";
            spineTitle.textContent = letter.title;

            const number = document.createElement("span");

            number.className = "spine-number";
            number.textContent = String(index + 1).padStart(2, "0");

            book.append(ornament, spineTitle, number);

            shelfBooks.appendChild(book);
        });

        shelf.appendChild(shelfBooks);

        section.append(heading, shelf);

        libraryCategories.appendChild(section);
    });
}

/* =========================================================
   LEITOR DE LIVRO 3D — ELEMENTOS
   ========================================================= */

const bookModal = $("bookModal");
const bookElement = $("bookElement");
const bookCover = $("bookCover");
const pageInner = $("pageInner");

const closeBookBtn = $("closeBook");

const bookCategory = $("bookCategory");
const bookTitle = $("bookTitle");
const bookSubtitle = $("bookSubtitle");
const bookDate = $("bookDate");
const bookContent = $("bookContent");
const bookSignature = $("bookSignature");

const coverTitle = $("coverTitle");
const coverCategory = $("coverCategory");

const bookPosition = $("bookPosition");

const prevBookBtn = $("previousBook");
const nextBookBtn = $("nextBook");

/* =========================================================
   LEITOR — ABRIR LIVRO
   ========================================================= */

function openBook(index) {
    if (!lettersData.length || !bookModal || !bookElement) {
        return;
    }
    const readerWasOpen = bookModal.classList.contains("active");
    clearTimeout(closeBookTimeout);
    clearTimeout(openingBookTimeout);

    currentLetterIndex =
        (index + lettersData.length) % lettersData.length;

    const letter = lettersData[currentLetterIndex];

    /* Conteúdo da página */

    if (bookCategory) {
        bookCategory.textContent = letter.category.toUpperCase();
    }

    if (bookTitle) {
        bookTitle.textContent = letter.title;
    }

    if (bookSubtitle) {
        bookSubtitle.textContent = letter.subtitle || "";
    }

    if (bookDate) {
        bookDate.textContent = letter.date || "";
    }

    if (bookContent) {
        bookContent.textContent = letter.content;
    }

    if (bookSignature) {
        bookSignature.textContent = letter.signature || "";

        bookSignature.style.display =
            letter.signature ? "block" : "none";
    }

    /* Conteúdo da capa */

    if (coverTitle) {
        coverTitle.textContent = letter.title;
    }

    if (coverCategory) {
        coverCategory.textContent = letter.category.toUpperCase();
    }

    /* Navegação */

    if (bookPosition) {
        bookPosition.textContent =
            `${pad(currentLetterIndex + 1)} / ${pad(lettersData.length)}`;
    }

    if (prevBookBtn) {
        prevBookBtn.disabled = lettersData.length < 2;
    }

    if (nextBookBtn) {
        nextBookBtn.disabled = lettersData.length < 2;
    }

    /* Reset de scroll */

    if (pageInner) {
        pageInner.scrollTop = 0;
    }

    /* Reset da capa somente na abertura inicial */

    if (!readerWasOpen) {
        bookElement.classList.remove("opened");
    }

    /* Abrir modal */

    bookModal.classList.add("active");

    bookModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("reader-open");

    if (closeBookBtn) {
        closeBookBtn.focus();
    }

    /* Abrir a capa somente na primeira abertura */

    if (!readerWasOpen) {
        openingBookTimeout = setTimeout(() => {
            bookElement.classList.add("opened");
        }, 500);
    }
}

/* =========================================================
   LEITOR — FECHAR LIVRO
   ========================================================= */

function closeBook() {
    if (!bookModal || !bookElement) return;

    clearTimeout(openingBookTimeout);

    bookElement.classList.remove("opened");

    clearTimeout(closeBookTimeout);

    closeBookTimeout = setTimeout(() => {
        bookModal.classList.remove("active");

        bookModal.setAttribute("aria-hidden", "true");

        document.body.classList.remove("reader-open");
    }, 750);
}

/* =========================================================
   LEITOR — EVENTOS
   ========================================================= */

if (libraryCategories) {
    libraryCategories.addEventListener("click", event => {
        const book = event.target.closest("[data-letter-id]");

        if (!book) return;

        book.classList.add("lifting");

        setTimeout(() => {
            book.classList.remove("lifting");

            const index = lettersData.findIndex(
                letter => letter.id === book.dataset.letterId
            );

            if (index !== -1) {
                openBook(index);
            }
        }, 400);
    });
}

if (closeBookBtn) {
    closeBookBtn.addEventListener("click", closeBook);
}

if (bookModal) {
    bookModal.addEventListener("click", event => {
        if (event.target === bookModal) {
            closeBook();
        }
    });
}

if (bookCover) {
    bookCover.addEventListener("click", () => {
        if (
            bookElement &&
            !bookElement.classList.contains("opened")
        ) {
            bookElement.classList.add("opened");
        }
    });
}

if (prevBookBtn) {
    prevBookBtn.addEventListener("click", () => {
        openBook(currentLetterIndex - 1);
    });
}

if (nextBookBtn) {
    nextBookBtn.addEventListener("click", () => {
        openBook(currentLetterIndex + 1);
    });
}

/* =========================================================
   ÁLBUM DE FOTOGRAFIAS — ELEMENTOS
   ========================================================= */

const photoModal = $("photoModal");
const slideshowImage = $("slideshowImage");
const photoCaption = $("photoCaption");
const photoNumber = $("photoNumber");

const photoProgressBar = $("photoProgressBar");
const photoDots = $("photoDots");

const openAlbumButton = $("openAlbum");
const closeAlbumButton = $("closeAlbum");

const previousPhotoBtn = $("previousPhoto");
const nextPhotoBtn = $("nextPhoto");

const previousPhotoText = $("previousPhotoText");
const nextPhotoText = $("nextPhotoText");

/* =========================================================
   ÁLBUM — INDICADORES
   ========================================================= */

function renderPhotoDots() {
    if (!photoDots) return;

    photoDots.innerHTML = "";

    photosData.forEach((_, index) => {
        const dot = document.createElement("button");

        dot.type = "button";

        dot.className = "photo-dot";

        dot.setAttribute(
            "aria-label",
            `Ir para a foto ${index + 1}`
        );

        dot.addEventListener("click", () => {
            currentPhotoIndex = index;
            renderPhoto();
        });

        photoDots.appendChild(dot);
    });
}

/* =========================================================
   ÁLBUM — RENDERIZAR FOTOGRAFIA
   ========================================================= */

function renderPhoto() {
    if (!photosData.length) return;

    const photo = photosData[currentPhotoIndex];

    if (!photo) return;

    if (slideshowImage) {
        slideshowImage.style.opacity = "0";

        const newImage = new Image();

        newImage.onload = () => {
            slideshowImage.src = photo.img;
            slideshowImage.alt = photo.caption || "";
            slideshowImage.style.opacity = "1";
        };

        newImage.onerror = () => {
            slideshowImage.removeAttribute("src");
            slideshowImage.alt = "Imagem não encontrada";
            slideshowImage.style.opacity = "1";

            console.warn(
                `[Álbum] Não foi possível carregar: ${photo.img}`
            );
        };

        newImage.src = photo.img;
    }

    if (photoCaption) {
        photoCaption.textContent = photo.caption || "";
    }

    if (photoNumber) {
        photoNumber.textContent =
            `MEMÓRIA ${pad(currentPhotoIndex + 1)} / ${pad(photosData.length)}`;
    }

    if (photoProgressBar) {
        photoProgressBar.style.width =
            `${((currentPhotoIndex + 1) / photosData.length) * 100}%`;
    }

    if (photoDots) {
        [...photoDots.children].forEach((dot, index) => {
            dot.classList.toggle(
                "active",
                index === currentPhotoIndex
            );
        });
    }
}

/* =========================================================
   ÁLBUM — ABRIR E FECHAR
   ========================================================= */

function openAlbum() {
    if (!photoModal || !photosData.length) return;

    currentPhotoIndex = 0;

    renderPhotoDots();
    renderPhoto();

    photoModal.classList.add("active");

    photoModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("album-open");
}

function closeAlbum() {
    if (!photoModal) return;

    photoModal.classList.remove("active");

    photoModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("album-open");
}

/* =========================================================
   ÁLBUM — NAVEGAÇÃO
   ========================================================= */

function changePhoto(direction) {
    if (!photosData.length) return;

    currentPhotoIndex =
        (currentPhotoIndex + direction + photosData.length) %
        photosData.length;

    renderPhoto();
}

if (openAlbumButton) {
    openAlbumButton.addEventListener("click", openAlbum);
}

if (closeAlbumButton) {
    closeAlbumButton.addEventListener("click", closeAlbum);
}

if (previousPhotoBtn) {
    previousPhotoBtn.addEventListener("click", () => {
        changePhoto(-1);
    });
}

if (nextPhotoBtn) {
    nextPhotoBtn.addEventListener("click", () => {
        changePhoto(1);
    });
}

if (previousPhotoText) {
    previousPhotoText.addEventListener("click", () => {
        changePhoto(-1);
    });
}

if (nextPhotoText) {
    nextPhotoText.addEventListener("click", () => {
        changePhoto(1);
    });
}

if (photoModal) {
    photoModal.addEventListener("click", event => {
        if (event.target === photoModal) {
            closeAlbum();
        }
    });
}

/* =========================================================
   ÁLBUM — DESLIZAR NO CELULAR
   ========================================================= */

const photoStage = document.querySelector(".photo-stage");

if (photoStage) {
    photoStage.addEventListener("touchstart", event => {
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    photoStage.addEventListener("touchend", event => {
        const diff =
            event.changedTouches[0].screenX - touchStartX;

        if (Math.abs(diff) > 50) {
            changePhoto(diff < 0 ? 1 : -1);
        }
    }, { passive: true });
}

/* =========================================================
   TECLADO
   ========================================================= */

document.addEventListener("keydown", event => {
    if (bookModal && bookModal.classList.contains("active")) {
        if (event.key === "Escape") {
            closeBook();
        }

        if (event.key === "ArrowLeft") {
            openBook(currentLetterIndex - 1);
        }

        if (event.key === "ArrowRight") {
            openBook(currentLetterIndex + 1);
        }

        return;
    }

    if (photoModal && photoModal.classList.contains("active")) {
        if (event.key === "Escape") {
            closeAlbum();
        }

        if (event.key === "ArrowLeft") {
            changePhoto(-1);
        }

        if (event.key === "ArrowRight") {
            changePhoto(1);
        }
    }
});

/* =========================================================
   CONTADOR AO VIVO
   Início configurável em data/dados.json
   ========================================================= */

function calculateElapsedParts(startDate, endDate) {
    if (endDate <= startDate) {
        return {
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }

    let cursor = new Date(startDate);

    let months = 0;
    let days = 0;

    while (true) {
        const nextMonth = new Date(cursor);

        nextMonth.setMonth(nextMonth.getMonth() + 1);

        if (nextMonth <= endDate) {
            cursor = nextMonth;
            months++;
        } else {
            break;
        }
    }

    while (true) {
        const nextDay = new Date(cursor);

        nextDay.setDate(nextDay.getDate() + 1);

        if (nextDay <= endDate) {
            cursor = nextDay;
            days++;
        } else {
            break;
        }
    }

    const remaining = Math.max(
        0,
        Math.floor((endDate - cursor) / 1000)
    );

    return {
        months,
        days,
        hours: Math.floor(remaining / 3600),
        minutes: Math.floor((remaining % 3600) / 60),
        seconds: remaining % 60
    };
}

function updateLiveCounter() {
    const values = calculateElapsedParts(
        START_DATE,
        new Date()
    );

    Object.entries(values).forEach(([unit, value]) => {
        const element = $(`f-${unit}`);

        if (element) {
            element.textContent = pad(value);
        }
    });
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

async function initializeApp() {
    if (appInitialized) return;

    appInitialized = true;

    initializeParticles();

    const loaded = await loadExternalData();

    if (!loaded) {
        console.error(
            "[Nossa História] A aplicação não conseguiu carregar os dados externos."
        );
    }

    renderLibrary();

    updateLiveCounter();

    setInterval(updateLiveCounter, 1000);

    console.info("[Nossa História] Inicialização concluída.");
}

initializeApp();
