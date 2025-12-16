// --- VARIABILI GLOBALI E DATI ---
let table; 
let NUM_SPECIE_INIZIALI; 
let NUM_SPECIE_MINACCIATE; 
let NUM_SPECIE_FINALI; 

let NUM_PALLINI_A_RISCHIO = 0; 
let RAGGIO_PALLINO = 3; 

// --- Dati per l'Animazione Graduale (7 secondi) ---
let tempoInizioAnimazione; 
const DURATA_ANIMAZIONE_TOTALE_MS = 7000; 

let specieMinacciateApparse = []; 
let indiceProssimaSpecie = 0; 
let isCountdownAnimating = false; 
let isPhraseTwoDisplayed = true; 
let animationComplete = false;

// NUOVI: Variabili per la transizione di colore dei pallini
let isColorTransitioning = false;
let colorTransitionStartTime;
const COLOR_TRANSITION_DURATION_MS = 1500; // Sincronizzato con il cross-fade CSS (1.5s)
const R_FINAL_PALLINI = 176; // #cbbeb6ff (Più chiaro del testo finale #1c1a1a)
const G_FINAL_PALLINI = 165; 
const B_FINAL_PALLINI = 141; 

// Riferimenti DOM
let h1Element; 
let backgroundElement; 
let arrowNext;
let arrowPrev;
let textOverlay;

// Frasi visualizzate
const frasi = [
    "Le specie viventi<br>conosciute nel mondo sono<br>2.140.000",
    `<div class='content-block'><span id='descriptive-text'>Tra queste, finora è stato possibile<br>studiarne e catalogarne</span><div id='animated-number'>[Placeholder]</div></div>`,
    "Placeholder per stato finale", 
    `<div class='content-block final-block'>
       <div id='info-text'>Vuoi sapere di più sulle<br>48.646 specie a rischio?</div>
       <a id='link-button' href='../visione_insieme/index.html' target='_blank'>Scopri</a>
     </div>`
];

let indiceFrase = 0;

// --------------------------------------------------------------------------------
// SEZIONE P5.JS
// --------------------------------------------------------------------------------

function preload() {
    // Assicurati che 'data_main.csv' sia nella stessa cartella
    table = loadTable('data_main.csv', 'csv', 'header');
}

function powerEasing(t) {
    // Curva di accelerazione usata per l'animazione
    return t * t * t * t * t; 
}

function setup() {
    const lastRowIndex = table.getRowCount() - 1; 
    let totalStudiedString = table.getString(lastRowIndex, 'Total'); 
    NUM_SPECIE_INIZIALI = parseInt(totalStudiedString.replace(/\./g, ''));
    
    let threatenedString = table.getString(lastRowIndex, 'Subtotal (threatened spp.)');
    NUM_SPECIE_MINACCIATE = parseInt(threatenedString.replace(/\./g, ''));
    
    NUM_SPECIE_FINALI = NUM_SPECIE_INIZIALI - NUM_SPECIE_MINACCIATE;
    
    // Aggiorna la frase 1 con il numero iniziale
    frasi[1] = `<div class='content-block'><span id='descriptive-text'>Tra queste, finora è stato possibile<br>studiarne e catalogarne</span><div id='animated-number'>${NUM_SPECIE_INIZIALI.toLocaleString('it-IT')}</div></div>`;
    
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('z-index', '20'); 
    canvas.position(0, 0); 
    canvas.elt.style.display = 'none'; 
    
    // Calcolo del numero di pallini (Particelle) da disegnare
    const areaSchermo = windowWidth * windowHeight;
    const percentuale = 0.1983;
    const areaTotalePallini = areaSchermo * percentuale;
    const raggioBaseDensita = 4; 
    const areaSingoloBase = Math.PI * raggioBaseDensita * raggioBaseDensita;
    const numBase = Math.floor(areaTotalePallini / areaSingoloBase);
    NUM_PALLINI_A_RISCHIO = Math.floor(numBase / 2);
}

function draw() {
    clear(); 
    
    if (isCountdownAnimating) {
        const tempoCorrente = millis();
        const tempoTrascorso = tempoCorrente - tempoInizioAnimazione;
        let tempoNormalizzato = constrain(tempoTrascorso / DURATA_ANIMAZIONE_TOTALE_MS, 0, 1);
        const curvaEasing = powerEasing(tempoNormalizzato);
        const targetCount = floor(NUM_PALLINI_A_RISCHIO * curvaEasing);
        let numToRelease = targetCount - indiceProssimaSpecie;

        if (tempoTrascorso >= DURATA_ANIMAZIONE_TOTALE_MS) {
            numToRelease = NUM_PALLINI_A_RISCHIO - indiceProssimaSpecie;
            isCountdownAnimating = false; 
            animationComplete = true;
        }

        for (let i = 0; i < numToRelease; i++) {
            if (indiceProssimaSpecie < NUM_PALLINI_A_RISCHIO) {
                aggiungiSpecieMinacciata();
            }
        }

        if (animationComplete && specieMinacciateApparse.length === NUM_PALLINI_A_RISCHIO) {
              const numSpan = h1Element.querySelector('#animated-number');
              if (numSpan) {
                  // Imposta il valore finale (specie rimanenti)
                  numSpan.innerHTML = NUM_SPECIE_FINALI.toLocaleString('it-IT');
              }
              arrowNext.classList.add('visible');
        }

        if (h1Element) {
            const numSpan = h1Element.querySelector('#animated-number');
            if (numSpan) {
                // Calcola il numero in tempo reale (da NUM_SPECIE_INIZIALI a NUM_SPECIE_FINALI)
                const currentDisplayedCount = NUM_SPECIE_INIZIALI - Math.round(NUM_SPECIE_MINACCIATE * (specieMinacciateApparse.length / NUM_PALLINI_A_RISCHIO));
                
                if (currentDisplayedCount >= NUM_SPECIE_FINALI) {
                    numSpan.innerHTML = currentDisplayedCount.toLocaleString('it-IT');
                }
            }
        }
    }

    for (let i = 0; i < specieMinacciateApparse.length; i++) {
        specieMinacciateApparse[i].display();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// --------------------------------------------------------------------------------
// PARTICELLE
// --------------------------------------------------------------------------------

function aggiungiSpecieMinacciata() {
    const raggio = RAGGIO_PALLINO;
    // Zona di sicurezza centrale (ellisse)
    const SAFETY_ZONE_WIDTH = width * 0.40; 
    const SAFETY_ZONE_HEIGHT = height * 0.40; 
    const CENTER_X = width / 2;
    const CENTER_Y = height / 2;

    let x, y;
    let attempts = 0;
    let positionOK = false;

    while(!positionOK && attempts < 200) {
        x = random(width); 
        y = random(height); 

        // Controllo se il punto è dentro l'ellisse centrale (dove c'è il testo)
        const x_rel = x - CENTER_X;
        const y_rel = y - CENTER_Y;
        const isInsideSafetyZone = ( (x_rel * x_rel) / (SAFETY_ZONE_WIDTH / 2 * SAFETY_ZONE_WIDTH / 2) ) + 
                                   ( (y_rel * y_rel) / (SAFETY_ZONE_HEIGHT / 2 * SAFETY_ZONE_HEIGHT / 2) ) < 1;

        // Controllo se il punto si sovrappone ad altre particelle
        let overlap = false;
        const distanzaMinima = raggio * 2.5;
        for (let i = 0; i < specieMinacciateApparse.length; i++) {
            const p = specieMinacciateApparse[i];
            const dist = Math.hypot(x - p.x, y - p.y);
            if (dist < distanzaMinima) {
                overlap = true;
                break;
            }
        }

        if (!isInsideSafetyZone && !overlap) {
            positionOK = true;
        }
        attempts++;
    }

    if (positionOK) {
        specieMinacciateApparse.push(new SpeciesParticle(x, y, raggio));
        indiceProssimaSpecie++;
    }
}

class SpeciesParticle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.alpha = 0; 
        this.targetAlpha = 255;
        this.fadeSpeed = 10; 
        
        // Colore iniziale #d8cfc0 (216, 207, 192)
        this.R_INIT = 216;
        this.G_INIT = 207;
        this.B_INIT = 192;
        this.fillColor = color(this.R_INIT, this.G_INIT, this.B_INIT);
    }
    
    // Metodo per settare il colore (usato per reset o per il set finale)
    setFillColor(r, g, b) {
        this.fillColor = color(r, g, b);
    }

    display() {
        if (this.alpha < this.targetAlpha) {
            this.alpha += this.fadeSpeed;
            this.alpha = min(this.alpha, this.targetAlpha);
        }
        
        // Logica per la transizione di colore graduale
        if (isColorTransitioning) {
            let timeElapsed = millis() - colorTransitionStartTime;
            let t = constrain(timeElapsed / COLOR_TRANSITION_DURATION_MS, 0, 1);
            
            // Dissolvenza dei componenti RGB dal colore iniziale al colore finale (#444444)
            let R = lerp(this.R_INIT, R_FINAL_PALLINI, t);
            let G = lerp(this.G_INIT, G_FINAL_PALLINI, t);
            let B = lerp(this.B_INIT, B_FINAL_PALLINI, t);

            this.fillColor = color(R, G, B);
        }

        noStroke();
        // Usa il colore attuale, mantenendo l'alpha
        this.fillColor.setAlpha(this.alpha);
        fill(this.fillColor);
        ellipse(this.x, this.y, this.r * 2);
    }
}

// --------------------------------------------------------------------------------
// DOM
// --------------------------------------------------------------------------------

window.addEventListener('load', function() {
    // --- RIFERIMENTI DOM ---
    backgroundElement = document.getElementById('foto_sfondo_inizio');
    textOverlay = document.getElementById('text-overlay');
    h1Element = textOverlay.querySelector('h1'); 
    arrowNext = document.getElementById('arrow-next');
    arrowPrev = document.getElementById('arrow-prev');
    
    // --- INIZIALIZZAZIONE ---
    setTimeout(function() {
        // Applica sfocatura e overlay verde dopo 3s
        backgroundElement.classList.add('blurred');
        setTimeout(function() {
            h1Element.innerHTML = frasi[indiceFrase]; 
            textOverlay.classList.add('visible');
            updateArrowsVisibility(); 
        }, 500); // 0.5s dopo la sfocatura
    }, 3000); // Ritardo iniziale
    
    // --- HELPERS CAMBIO SFONDO (Cross-Fade) ---
    function changeBackgroundToCartaWithFade() {
        backgroundElement.classList.add('carta'); 
    }

    function restoreInitialBackgroundWithFade() {
        backgroundElement.classList.remove('carta'); 
    }

    // --- FUNZIONI DI SUPPORTO INTERFACCIA ---
    function updateContent(newIndex) {
        // 1. Fade-out del testo
        textOverlay.classList.remove('visible');
        
        // Clear il contenuto IMMEDIATAMENTE dopo l'inizio del fade-out (MIGLIORATO)
        h1Element.innerHTML = ''; 
        
        // 2. Reset animazione e stato
        isCountdownAnimating = false;
        animationComplete = false;
        // Spegni la transizione di colore
        isColorTransitioning = false; 

        // Nasconde canvas SOLO se NON si va alla frase 3 (finale)
        const canvasElement = document.querySelector('canvas');
        if (canvasElement && newIndex !== 3) canvasElement.style.display = 'none'; 
        
        // Reset particelle al colore iniziale #d8cfc0
        if (specieMinacciateApparse.length > 0) {
            for (let p of specieMinacciateApparse) {
               p.setFillColor(216, 207, 192); // #d8cfc0
            }
        }
        
        // Reset completo se si torna all'inizio
        if (newIndex < 1) {
            specieMinacciateApparse = [];
            indiceProssimaSpecie = 0; 
        }
        
        // Ripristina opacità sfondo a 1 
        backgroundElement.style.opacity = 1; 

        // Aggiorna indice frase
        indiceFrase = newIndex;
        
        // Flag per la frase 2
        isPhraseTwoDisplayed = (indiceFrase === 1);
        
        // Rimuove eventuale frase extra
        const extraSentence = h1Element.querySelector('#extra-sentence');
        if (extraSentence) extraSentence.remove();
        
        // Se si esce dalla schermata finale, ripristina lo sfondo iniziale
        if (newIndex <= 2 && backgroundElement.classList.contains('carta')) {
            restoreInitialBackgroundWithFade();
        }

        // 3. Dopo 1.5s (durata del cross-fade), aggiorna contenuto e rifà fade-in
        setTimeout(() => {
            h1Element.innerHTML = frasi[indiceFrase];

            // Reset classi di animazione del numero
            const numElement = h1Element.querySelector('#animated-number');
            if (numElement) {
                numElement.classList.remove('final-animation');
                numElement.classList.remove('centered-number');
            }
            const descriptiveText = h1Element.querySelector('#descriptive-text');
            if (descriptiveText) {
                descriptiveText.classList.remove('hidden-text');
            }

            // Fade-in del testo
            textOverlay.classList.add('visible');
            updateArrowsVisibility();
        }, 1500);
    }
    
    function updateArrowsVisibility() {
        if (indiceFrase > 0) {
            arrowPrev.classList.add('visible');
        } else {
            arrowPrev.classList.remove('visible');
        }
        
        if (indiceFrase < frasi.length - 1 || isPhraseTwoDisplayed || animationComplete) {
            arrowNext.classList.add('visible');
        } else {
            arrowNext.classList.remove('visible');
        }
    }
    
    function startAnimationCountdown() {
        const descriptiveText = h1Element.querySelector('#descriptive-text');
        if (descriptiveText) {
            descriptiveText.classList.add('hidden-text');
        }

        // Nasconde frecce durante l’animazione
        arrowNext.classList.remove('visible'); 
        arrowPrev.classList.remove('visible'); 

        // Ritardo per far scomparire il testo descrittivo
        setTimeout(function() {
            if (descriptiveText) descriptiveText.remove();

            const numElement = h1Element.querySelector('#animated-number');
            setTimeout(function() {
                if (numElement) numElement.classList.add('final-animation');

                const canvasElement = document.querySelector('canvas');
                if (canvasElement) canvasElement.style.display = 'block'; 
                
                // Reset animazione e avvio
                specieMinacciateApparse = [];
                indiceProssimaSpecie = 0;
                animationComplete = false;
                tempoInizioAnimazione = millis(); 
                isCountdownAnimating = true; 
                isPhraseTwoDisplayed = false; 
            }, 100); 
        }, 500); 
    }
    
    // --- EVENTI FRECCE ---
    arrowNext.addEventListener('click', function() {
        if (isCountdownAnimating) return; 

        if (indiceFrase === 0) { 
            updateContent(1); 
            
        } else if (indiceFrase === 1 && isPhraseTwoDisplayed) {
            startAnimationCountdown();
            
        } else if (indiceFrase === 1 && animationComplete) { 
            // Transizione da numero animato a frase 3 (con testo extra)
            const contentBlock = h1Element.querySelector('.content-block');
            const numberEl = h1Element.querySelector('#animated-number');

            if (contentBlock && numberEl) {
                numberEl.classList.remove('final-animation'); 
                
                const newSentence = document.createElement('div');
                newSentence.innerHTML = "Ma se tutte le specie <br>a rischio si estinguessero,<br> ne rimarrebbero";
                newSentence.id = "extra-sentence"; 
                newSentence.style.opacity = "0"; 
                newSentence.style.transition = "opacity 1s ease";

                contentBlock.insertBefore(newSentence, numberEl);

                setTimeout(() => {
                    newSentence.style.opacity = "1";
                }, 100);

                indiceFrase = 2; 
                updateArrowsVisibility();
            }

        } else if (indiceFrase === 2) { 
            // Transizione alla schermata finale (indice 3) con cambio sfondo fluido e colore pallini graduale
            const extraSentence = h1Element.querySelector('#extra-sentence');
            if (extraSentence) extraSentence.remove(); 
            
            const canvasElement = document.querySelector('canvas');
            if (canvasElement) canvasElement.style.display = 'block'; 
            
            // 1) Avvia il fade-out del testo (1s in CSS)
            textOverlay.classList.remove('visible');
            
            // Clear il contenuto IMMEDIATAMENTE
            h1Element.innerHTML = ''; 
            
            // 2) Avvia la transizione di colore dei pallini in modo graduale
            isColorTransitioning = true;
            colorTransitionStartTime = millis(); 
            
            // 3) Avvia il cambio sfondo cross-fade (dura 1.5s)
            changeBackgroundToCartaWithFade();
            
            // 4) Aggiorna il contenuto e mostra il testo (OVERLAP)
            setTimeout(() => {
                indiceFrase = 3;
                h1Element.innerHTML = frasi[indiceFrase]; 
                
                // 5) Fai il fade-in del testo
                textOverlay.classList.add('visible'); 
                updateArrowsVisibility();
                
                // 6) Fix finale: setta esplicitamente il colore finale dopo la fine della transizione
                setTimeout(() => {
                    isColorTransitioning = false;
                    for (let p of specieMinacciateApparse) {
                        p.setFillColor(R_FINAL_PALLINI, G_FINAL_PALLINI, B_FINAL_PALLINI);
                    }
                }, COLOR_TRANSITION_DURATION_MS + 100); 
                
            }, 1300); // RIDOTTO A 1300ms per un overlap più fluido

        } else if (indiceFrase === 3) {
            // Presentazione conclusa: l’utente cliccherà sul link "Scopri"
            console.log("Fine presentazione. L'utente cliccherà sul link.");
        }
    });
    
    arrowPrev.addEventListener('click', function() {
        if (isCountdownAnimating) return; 

        if (indiceFrase > 0) { 
            updateContent(indiceFrase - 1);
        }
    });
});