// Dati usati dalla simulazione del tracciamento
const scenarios = {
  necessary: {
    title: "Solo necessari",
    copy: "Il sito salva solo ciò che serve alla navigazione: sessione, lingua o carrello.",
    risk: 22,
    label: "Basso",
    color: "#4f7d50",
    data: [
      "ID di sessione temporaneo",
      "Preferenza lingua o tema",
      "Eventuale carrello o stato del login"
    ]
  },
  analytics: {
    title: "Analytics minimizzati",
    copy: "Il sito misura visite e pagine consultate, idealmente in forma aggregata e con dati ridotti.",
    risk: 44,
    label: "Medio",
    color: "#e1a633",
    data: [
      "Pagine visitate e durata approssimativa",
      "Tipo di dispositivo e browser",
      "Area geografica stimata e dati aggregati"
    ]
  },
  profiling: {
    title: "Profilazione pubblicitaria",
    copy: "Le visite diventano segnali per inserire l'utente in categorie commerciali e mostrare annunci mirati.",
    risk: 72,
    label: "Alto",
    color: "#c84c36",
    data: [
      "Interessi dedotti dalle pagine visitate",
      "Cronologia di interazioni su siti diversi",
      "Segmenti pubblicitari e intenzioni di acquisto"
    ]
  },
  fingerprint: {
    title: "Fingerprinting",
    copy: "Il browser viene riconosciuto combinando caratteristiche tecniche, anche quando i cookie non sono disponibili.",
    risk: 88,
    label: "Molto alto",
    color: "#8f3d2d",
    data: [
      "Lingua, fuso orario e risoluzione schermo",
      "Sistema operativo, browser e impostazioni",
      "Combinazione di segnali usata come impronta"
    ]
  }
};

// Elementi principali presi dalla pagina
const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const progress = document.querySelector(".reading-progress");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const resultTitle = document.querySelector("[data-result-title]");
const resultCopy = document.querySelector("[data-result-copy]");
const riskFill = document.querySelector("[data-risk-fill]");
const riskLabel = document.querySelector("[data-risk-label]");
const dataList = document.querySelector("[data-data-list]");
const cookieState = document.querySelector("[data-cookie-state]");

const caseItems = Array.from(document.querySelectorAll(".case-item"));

// Aggiorna la barra di avanzamento in alto
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
}

// Evidenzia la voce del menu della sezione aperta
function setActiveLink(activeId) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
}

// Capisce quale sezione e visibile durante lo scroll
function updateActiveNav() {
  const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  const offset = window.scrollY + window.innerHeight * 0.35;
  let activeId = sections[0]?.id;

  if (isAtBottom && sections.length > 0) {
    activeId = sections[sections.length - 1].id;
  } else {
    sections.forEach((section) => {
      if (section.offsetTop <= offset) {
        activeId = section.id;
      }
    });
  }

  const hashId = window.location.hash.replace("#", "");
  const hashSection = sections.find((section) => section.id === hashId);

  if (hashSection) {
    const rect = hashSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.65 && rect.bottom > 0) {
      activeId = hashId;
    }
  }

  setActiveLink(activeId);
}

// Mostra il risultato scelto nel laboratorio
function renderScenario(key) {
  const scenario = scenarios[key];
  resultTitle.textContent = scenario.title;
  resultCopy.textContent = scenario.copy;
  riskFill.style.width = `${scenario.risk}%`;
  riskFill.style.background = scenario.color;
  riskLabel.textContent = scenario.label;

  dataList.replaceChildren(
    ...scenario.data.map((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      return li;
    })
  );
}

// Crea un cookie di prova nel browser
function setDemoCookie() {
  const selected = document.querySelector("input[name='tracking-level']:checked")?.value || "necessary";
  const value = `livello_${selected}`;
  document.cookie = `sir_tracking_demo=${value}; max-age=3600; path=/; SameSite=Lax`;
  cookieState.textContent = `Cookie demo creato: sir_tracking_demo=${value}. Scade tra circa un'ora.`;
}

// Cancella il cookie di prova
function clearDemoCookie() {
  document.cookie = "sir_tracking_demo=; max-age=0; path=/; SameSite=Lax";
  cookieState.textContent = "Cookie demo cancellato dal browser.";
}

// Mostra alcuni dati locali del browser
function showBrowserFacts() {
  const facts = [
    ["Lingua", navigator.language || "Non disponibile"],
    ["Fuso orario", Intl.DateTimeFormat().resolvedOptions().timeZone || "Non disponibile"],
    ["Schermo", `${window.screen.width} x ${window.screen.height}`],
    ["Viewport", `${window.innerWidth} x ${window.innerHeight}`],
    ["Piattaforma", navigator.platform || "Non disponibile"],
    ["Color depth", `${window.screen.colorDepth || "?"} bit`],
    ["Touch", navigator.maxTouchPoints > 0 ? "Presente" : "Non rilevato"],
    ["Cookie abilitati", navigator.cookieEnabled ? "Sì" : "No"]
  ];

  const list = document.querySelector("[data-browser-facts]");
  list.replaceChildren(
    ...facts.map(([term, description]) => {
      const wrapper = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = description;
      wrapper.append(dt, dd);
      return wrapper;
    })
  );
}

// Apre un caso concreto e chiude gli altri
function openCase(selectedItem) {
  caseItems.forEach((item) => {
    const isActive = item === selectedItem;
    item.classList.toggle("active", isActive);
  });
}

// Apre e chiude il menu su telefono
menuToggle?.addEventListener("click", () => {
  nav.classList.toggle("open");
});

// Gestisce i link del menu
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveLink(link.getAttribute("href").replace("#", ""));
    nav.classList.remove("open");
  });
});

// Aggiorna la simulazione quando cambia scelta
document.querySelectorAll("input[name='tracking-level']").forEach((input) => {
  input.addEventListener("change", (event) => renderScenario(event.target.value));
});

// Bottoni del laboratorio
document.querySelector("[data-cookie-save]")?.addEventListener("click", setDemoCookie);
document.querySelector("[data-cookie-clear]")?.addEventListener("click", clearDemoCookie);
document.querySelector("[data-fingerprint]")?.addEventListener("click", showBrowserFacts);

// Click sui casi concreti
caseItems.forEach((item) => {
  item.querySelector(".case-toggle")?.addEventListener("click", () => openCase(item));
});

// Eventi della finestra
window.addEventListener("scroll", () => {
  updateProgress();
  updateActiveNav();
}, { passive: true });

window.addEventListener("resize", updateProgress);
window.addEventListener("hashchange", updateActiveNav);

// Avvio della pagina
renderScenario("necessary");
updateProgress();
updateActiveNav();
setTimeout(() => {
  updateProgress();
  updateActiveNav();
}, 250);
