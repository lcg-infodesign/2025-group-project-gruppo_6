// --- VARIABILI GLOBALI E DATI ---
let table; 
let NUM_SPECIE_INIZIALI; 
let NUM_SPECIE_MINACCIATE; 
let NUM_SPECIE_FINALI; 

let NUM_PALLINI_A_RISCHIO = 0; 
let RAGGIO_PALLINO = 3; 

// animazione di 7 secondi
let tempoInizioAnimazione; 
const DURATA_ANIMAZIONE_TOTALE_MS = 7000; 

let specieMinacciateApparse = []; 
let indiceProssimaSpecie = 0; 
let isCountdownAnimating = false; 
let isPhraseTwoDisplayed = true; 
let animationComplete = false;

// transizione colore
let isColorTransitioning = false;
let colorTransitionStartTime;
const COLOR_TRANSITION_DURATION_MS = 1500;
const R_FINAL_PALLINI = 176;
const G_FINAL_PALLINI = 165; 
const B_FINAL_PALLINI = 141; 

// elementi
let h1Element; 
let backgroundElement; 
let arrowNext;
let arrowPrev;
let textOverlay;
let skipButton;

// testo
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


// P5.JS


function preload() {
    table = loadTable('data_main.csv', 'csv', 'header');
}

function powerEasing(t) {
    return t * t * t * t * t; 
}

function setup() {
    const lastRowIndex = table.getRowCount() - 1; 
    let totalStudiedString = table.getString(lastRowIndex, 'Total'); 
    NUM_SPECIE_INIZIALI = parseInt(totalStudiedString.replace(/\./g, ''));
    
    let threatenedString = table.getString(lastRowIndex, 'Subtotal (threatened spp.)');
    NUM_SPECIE_MINACCIATE = parseInt(threatenedString.replace(/\./g, ''));
    
    NUM_SPECIE_FINALI = NUM_SPECIE_INIZIALI - NUM_SPECIE_MINACCIATE;
    
    frasi[1] = `<div class='content-block'><span id='descriptive-text'>Tra queste, finora è stato possibile<br>studiarne e catalogarne</span><div id='animated-number'>${NUM_SPECIE_INIZIALI.toLocaleString('it-IT')}</div></div>`;
    
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('z-index', '20'); 
    canvas.position(0, 0); 
    canvas.elt.style.display = 'none'; 
    
    const areaSchermo = windowWidth * windowHeight;
    const percentuale = 0.1983;
    const areaTotalePALLINI = areaSchermo * percentuale;
    const raggioBaseDensita = 4; 
    const areaSingoloBase = Math.PI * raggioBaseDensita * raggioBaseDensita;
    const numBase = Math.floor(areaTotalePALLINI / areaSingoloBase);
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

// PALLINI


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
        
        this.R_INIT = 216;
        this.G_INIT = 207;
        this.B_INIT = 192;
        this.fillColor = color(this.R_INIT, this.G_INIT, this.B_INIT);
    }
    
    setFillColor(r, g, b) {
        this.fillColor = color(r, g, b);
    }

    display() {
        if (this.alpha < this.targetAlpha) {
            this.alpha += this.fadeSpeed;
            this.alpha = min(this.alpha, this.targetAlpha);
        }
        
        if (isColorTransitioning) {
            let timeElapsed = millis() - colorTransitionStartTime;
            let t = constrain(timeElapsed / COLOR_TRANSITION_DURATION_MS, 0, 1);
            
            let R = lerp(this.R_INIT, R_FINAL_PALLINI, t);
            let G = lerp(this.G_INIT, G_FINAL_PALLINI, t);
            let B = lerp(this.B_INIT, B_FINAL_PALLINI, t);

            this.fillColor = color(R, G, B);
        }

        noStroke();
        this.fillColor.setAlpha(this.alpha);
        fill(this.fillColor);
        ellipse(this.x, this.y, this.r * 2);
    }
}


// ELEMENTI


window.addEventListener('load', function() {

    backgroundElement = document.getElementById('foto_sfondo_inizio');
    textOverlay = document.getElementById('text-overlay');
    h1Element = textOverlay.querySelector('h1'); 
    arrowNext = document.getElementById('arrow-next');
    arrowPrev = document.getElementById('arrow-prev');
    skipButton = document.getElementById('skip-button');

    // INIZIALIZZAZIONE
    setTimeout(function() {
        backgroundElement.classList.add('blurred');
        setTimeout(function() {
            h1Element.innerHTML = frasi[indiceFrase]; 
            textOverlay.classList.add('visible');
            updateArrowsVisibility(); 
        }, 500);
    }, 3000);
    
    function changeBackgroundToCartaWithFade() {
        backgroundElement.classList.add('carta'); 
    }

    function restoreInitialBackgroundWithFade() {
        backgroundElement.classList.remove('carta'); 
    }

    function updateContent(newIndex) {

    // fade-out
    textOverlay.classList.remove('visible');
    textOverlay.classList.add('hidden');

    setTimeout(() => {

        // reset contenuto
        h1Element.innerHTML = '';

        isCountdownAnimating = false;
        animationComplete = false;
        isColorTransitioning = false;

        const canvasElement = document.querySelector('canvas');
        if (canvasElement && newIndex !== 3) canvasElement.style.display = 'none';

        if (specieMinacciateApparse.length > 0) {
            for (let p of specieMinacciateApparse) {
                p.setFillColor(216, 207, 192);
            }
        }

        if (newIndex < 1) {
            specieMinacciateApparse = [];
            indiceProssimaSpecie = 0;
        }

        backgroundElement.style.opacity = 1;
        indiceFrase = newIndex;
        isPhraseTwoDisplayed = (indiceFrase === 1);

        const extraSentence = h1Element.querySelector('#extra-sentence');
        if (extraSentence) extraSentence.remove();

        if (newIndex <= 2 && backgroundElement.classList.contains('carta')) {
            restoreInitialBackgroundWithFade();
        }

        // aggiorna contenuto
        h1Element.innerHTML = frasi[indiceFrase];

        // fade-in
        textOverlay.classList.remove('hidden');
        textOverlay.classList.add('visible');

        updateArrowsVisibility();

    }, 1000); // durata fade-out
}
    
    function updateArrowsVisibility() {

        // nella schermata finale niente freccia avanti
        if (indiceFrase === 3) {
            arrowNext.classList.remove('visible');
            arrowPrev.classList.add('visible');

            // nella schermata finale niente salta
             skipButton.style.display = "none";
            return;
        }

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

        arrowNext.classList.remove('visible'); 
        arrowPrev.classList.remove('visible'); 

        setTimeout(function() {
            if (descriptiveText) descriptiveText.remove();

            const numElement = h1Element.querySelector('#animated-number');
            setTimeout(function() {
                if (numElement) numElement.classList.add('final-animation');

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
    
    // FRECCE
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
            const extraSentence = h1Element.querySelector('#extra-sentence');
            if (extraSentence) extraSentence.remove(); 
            
            const canvasElement = document.querySelector('canvas');
            if (canvasElement) canvasElement.style.display = 'block'; 
            
            textOverlay.classList.remove('visible');
            h1Element.innerHTML = ''; 
            
            isColorTransitioning = true;
            colorTransitionStartTime = millis(); 
            
            changeBackgroundToCartaWithFade();
            
            setTimeout(() => {
                indiceFrase = 3;
                h1Element.innerHTML = frasi[indiceFrase]; 
                
                textOverlay.classList.add('visible'); 
                updateArrowsVisibility();
                
                setTimeout(() => {
                    isColorTransitioning = false;
                    for (let p of specieMinacciateApparse) {
                        p.setFillColor(R_FINAL_PALLINI, G_FINAL_PALLINI, B_FINAL_PALLINI);
                    }
                }, COLOR_TRANSITION_DURATION_MS + 100); 
                
            }, 1300);

        } else if (indiceFrase === 3) {
            console.log("Fine presentazione.");
        }
    });
    
    arrowPrev.addEventListener('click', function() {
        if (isCountdownAnimating) return; 
        if (indiceFrase > 0) updateContent(indiceFrase - 1);
    });


    // SKIP

    skipButton.addEventListener('click', function() {

        textOverlay.classList.remove('visible');
        h1Element.innerHTML = '';

        const canvasElement = document.querySelector('canvas');
        if (canvasElement) canvasElement.style.display = 'block';

        // CREA SUBITO TUTTI I PALLINI
        specieMinacciateApparse = [];
        indiceProssimaSpecie = 0;
        for (let i = 0; i < NUM_PALLINI_A_RISCHIO; i++) {
            aggiungiSpecieMinacciata();
        }

        // ATTIVA SUBITO LA SFUMATURA VERDE
        backgroundElement.classList.add('blurred');

        // DELAY CARTA
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                isColorTransitioning = true;
                colorTransitionStartTime = millis();
                backgroundElement.classList.add('carta');
            });
        });

        // TESTO FINALE
        setTimeout(() => {

            indiceFrase = 3;
            h1Element.innerHTML = frasi[3];
            textOverlay.classList.add('visible');
            updateArrowsVisibility();

            // NO SKIP
            skipButton.style.display = "none";

            setTimeout(() => {
                isColorTransitioning = false;
                for (let p of specieMinacciateApparse) {
                    p.setFillColor(R_FINAL_PALLINI, G_FINAL_PALLINI, B_FINAL_PALLINI);
                }
            }, COLOR_TRANSITION_DURATION_MS + 100);

        }, 1300);
    });


// NAVIGAZIONE CON TASTIERA

document.addEventListener('keydown', function(e) {
    if (isCountdownAnimating) return;

    // Freccia destra → avanti
    if (e.key === 'ArrowRight') {
        arrowNext.click();
    }

    // Freccia sinistra → indietro
    if (e.key === 'ArrowLeft') {
        arrowPrev.click();
    }
});
});