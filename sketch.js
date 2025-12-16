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

// Riferimenti DOM
let h1Element; 
let backgroundElement; 
let arrowNext;
let arrowPrev;
let textOverlay;

// Frasi visualizzate: (Frase 1 verrà aggiornata in setup)
const frasi = [
    "Le specie viventi<br>conosciute nel mondo sono<br>2.140.000",
    `<div class='content-block'><span id='descriptive-text'>Tra queste, finora è stato possibile<br>studiarne e catalogarne</span><div id='animated-number'>[Placeholder]</div></div>`,
    "Placeholder per stato finale", 
    `<div class='content-block final-block'>
       <div id='info-text'>Vuoi saperne di più sulle<br>48.646 specie a rischio?</div>
       <a id='link-button' href='../visione_insieme/index.html' target='_blank'>Scopri</a>
     </div>`
];

let indiceFrase = 0;

// --------------------------------------------------------------------------------
// SEZIONE P5.JS (Caricamento Dati e Funzioni di base)
// --------------------------------------------------------------------------------

function preload() {
    table = loadTable('data_main.csv', 'csv', 'header');
}

function powerEasing(t) {
    return t * t * t * t * t; 
}

function setup() {
    // 1. ESTRAZIONE E PULIZIA DEI DATI DAL CSV
    const lastRowIndex = table.getRowCount() - 1; 
    let totalStudiedString = table.getString(lastRowIndex, 'Total'); 
    NUM_SPECIE_INIZIALI = parseInt(totalStudiedString.replace(/\./g, ''));
    
    let threatenedString = table.getString(lastRowIndex, 'Subtotal (threatened spp.)');
    NUM_SPECIE_MINACCIATE = parseInt(threatenedString.replace(/\./g, ''));
    
    // 2. CALCOLO DEI DATI FINALI
    NUM_SPECIE_FINALI = NUM_SPECIE_INIZIALI - NUM_SPECIE_MINACCIATE;
    
    // 3. AGGIORNAMENTO DEL TESTO INIZIALE (Frase indice 1)
    frasi[1] = `<div class='content-block'><span id='descriptive-text'>Tra queste, finora è stato possibile<br>studiarne e catalogarne</span><div id='animated-number'>${NUM_SPECIE_INIZIALI.toLocaleString('it-IT')}</div></div>`;
    
    // --- Creazione Canvas e Calcolo Pallini ---
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('z-index', '2'); 
    canvas.position(0, 0); 
    canvas.elt.style.display = 'none'; 
    
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
                  numSpan.innerHTML = NUM_SPECIE_FINALI.toLocaleString('it-IT');
              }
              arrowNext.classList.add('visible');
        }

        if (h1Element) {
            const numSpan = h1Element.querySelector('#animated-number');
            if (numSpan) {
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
// SEZIONE LOGICA PARTICELLE/SPECIE (Invariata)
// --------------------------------------------------------------------------------

function aggiungiSpecieMinacciata() {
    const raggio = RAGGIO_PALLINO;
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

        const x_rel = x - CENTER_X;
        const y_rel = y - CENTER_Y;
        const isInsideSafetyZone = ( (x_rel * x_rel) / (SAFETY_ZONE_WIDTH / 2 * SAFETY_ZONE_WIDTH / 2) ) + 
                                   ( (y_rel * y_rel) / (SAFETY_ZONE_HEIGHT / 2 * SAFETY_ZONE_HEIGHT / 2) ) < 1;

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
    }
    
    display() {
        if (this.alpha < this.targetAlpha) {
            this.alpha += this.fadeSpeed;
            this.alpha = min(this.alpha, this.targetAlpha);
        }

        noStroke();
        fill(216, 207, 192, this.alpha);
        ellipse(this.x, this.y, this.r * 2);
    }
}


// --------------------------------------------------------------------------------
// SEZIONE DOM (Gestione Interfaccia e Navigazione)
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
        backgroundElement.classList.add('blurred');
        
        setTimeout(function() {
            h1Element.innerHTML = frasi[indiceFrase]; 
            textOverlay.classList.add('visible');
            updateArrowsVisibility(); 
        }, 500); 
        
    }, 3000); 

    // --- FUNZIONI DI SUPPORTO ---

    /**
     * Gestisce la navigazione lenta (1.5s di fade-out/fade-in).
     */
    function updateContent(newIndex) {
        // Rimuove la classe 'visible' -> Inizia il fade-out lento
        textOverlay.classList.remove('visible');
        
        isCountdownAnimating = false;
        animationComplete = false;
        
        const canvasElement = document.querySelector('canvas');
        if (canvasElement) canvasElement.style.display = 'none'; 
        
        specieMinacciateApparse = [];
        indiceProssimaSpecie = 0; 
        
        backgroundElement.style.opacity = 1; 

        indiceFrase = newIndex;
        
        isPhraseTwoDisplayed = (indiceFrase === 1);
        
        const extraSentence = h1Element.querySelector('#extra-sentence');
        if (extraSentence) {
            extraSentence.remove();
        }
        
        // Visualizza il nuovo contenuto DOPO IL RITARDO (1.5s)
        setTimeout(() => {
            h1Element.innerHTML = frasi[indiceFrase];

            // Reset classi di animazione del numero
            const numElement = h1Element.querySelector('#animated-number');
            if(numElement) {
                numElement.classList.remove('final-animation');
                numElement.classList.remove('centered-number');
            }
            const descriptiveText = h1Element.querySelector('#descriptive-text');
            if(descriptiveText) {
                descriptiveText.classList.remove('hidden-text');
            }
            // Aggiunge la classe 'visible' -> Inizia il fade-in lento
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
        if(descriptiveText) {
            descriptiveText.classList.add('hidden-text');
        }

        arrowNext.classList.remove('visible'); 
        arrowPrev.classList.remove('visible'); 

        setTimeout(function() {
            if(descriptiveText) {
                descriptiveText.remove();
            }
            const numElement = h1Element.querySelector('#animated-number');
            
            setTimeout(function() {
                if(numElement) {
                    numElement.classList.add('final-animation'); 
                }
                const canvasElement = document.querySelector('canvas');
                if (canvasElement) canvasElement.style.display = 'block'; 
                
                specieMinacciateApparse = [];
                indiceProssimaSpecie = 0;
                animationComplete = false;
                tempoInizioAnimazione = millis(); 
                isCountdownAnimating = true; 
                isPhraseTwoDisplayed = false; 
            }, 100); 
        }, 500); 
    }
    
arrowNext.addEventListener('click', function() {
        if (isCountdownAnimating) return; 

        if (indiceFrase === 0) { 
            updateContent(1); 
            
        } else if (indiceFrase === 1 && isPhraseTwoDisplayed) {
            startAnimationCountdown();
            
        } else if (indiceFrase === 1 && animationComplete) { 
            
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
            /* ------------------------------------------------------------- */
            /* FIX: TRANSITIONE FINALE (SPARIZIONE IMMEDIATA + RIAPPARIZIONE LENTA) */
            /* ------------------------------------------------------------- */
            
            // 1. Rimuovo la frase aggiunta dinamicamente
            const extraSentence = h1Element.querySelector('#extra-sentence');
            if (extraSentence) {
                extraSentence.remove(); 
            }
            
            // 2. FORZA IL FADE-OUT ISTANTANEO
            // Rimuoviamo la classe 'visible' (avviando il fade-out lento)
            textOverlay.classList.remove('visible');
            // Sovrascriviamo la transizione CSS per far sì che diventi opacità: 0 INSTANTANEAMENTE
            textOverlay.style.transition = 'none'; 
            textOverlay.style.opacity = '0';
            
            // 3. SOSTITUISCO IL CONTENUTO MENTRE È INVISIBILE
            indiceFrase = 3;
            h1Element.innerHTML = frasi[indiceFrase]; 

            // 4. RIABILITA E AVVIA IL FADE-IN LENTO (dopo un piccolo momento)
            setTimeout(() => {
                // Rimuovo l'override per ripristinare la transizione lenta definita nel CSS
                textOverlay.style.transition = ''; 
                textOverlay.style.opacity = ''; 
                
                // Avvia il fade-in lento di 1.5s
                textOverlay.classList.add('visible'); 
                updateArrowsVisibility();
            }, 50); // Piccolo ritardo per l'esecuzione sincrona
            
        } else if (indiceFrase === 3) {
            console.log("Fine presentazione. L'utente cliccherà sul link.");
        }
    });
    
    arrowPrev.addEventListener('click', function() {
        if (isCountdownAnimating) return; 

        if (indiceFrase > 0) { 
            if (indiceFrase === 3) {
                updateContent(1); 
            } else {
                updateContent(indiceFrase - 1);
            }
        }
    });
});