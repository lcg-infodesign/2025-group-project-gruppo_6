let table;
let areas = [];
const kingdoms = ["animalia", "plantae", "fungi", "chromista"];

const popupData = {
  animalia: {
    title: "Regno Animalia",
    description_part1: "Il regno Animalia comprende milioni di specie, dalle forme più semplici come spugne e meduse fino agli organismi altamente complessi come uccelli e mammiferi. Questa diversità sostiene gli equilibri ecologici di ogni ambiente del pianeta: gli animali impollinano, regolano popolazioni, mantengono suoli sani e trasportano nutrienti.",
    description_part2: "Si stima che 45.242 di 147.240 specie risultano attualmente minacciate. Quando una specie animale si estingue, l’effetto non è isolato: intere reti ecologiche possono indebolirsi o collassare. La perdita di biodiversità nel regno animale è oggi una delle emergenze più serie per la stabilità degli ecosistemi globali."
  },
  plantae: {
    title: "Regno Plantae",
    description_part1: "Il regno delle piante comprende tutto, dai minuscoli muschi alle gigantesche sequoie. Le piante producono ossigeno, stabilizzano gli ecosistemi terrestri e costituiscono la base della maggior parte delle catene alimentari. Molte specie vegetali sono fondamentali anche per impollinatori, animali e perfino per la regolazione delle risorse idriche.",
    description_part2: "Su 24.064 specie di piante valutate, ben 29.623 sono classificate come minacciate, evidenziando una pressione ecologica notevole, specialmente sulla classe Magnoliopsida. Quando una pianta scompare, spesso scompaiono con lei funghi, insetti e animali che da essa dipendono. La perdita di specie vegetali rappresenta una minaccia diretta alla resilienza del pianeta."
  },
  fungi: {
    title: "Regno Fungi",
    description_part1: "I funghi formano un regno estremamente vasto, con oltre due milioni di specie stimate, molte delle quali non ancora descritte. Sono indispensabili per la decomposizione, la fertilità dei suoli e la simbiosi con la maggior parte delle piante attraverso le reti micorriziche. Alcuni funghi regolano persino cicli biogeochimici planetari.",
    description_part2: "Su 1.298 specie fungine valutate, 399 sono state classificate come minacciate. L’estinzione di specie fungine è particolarmente allarmante perché spesso passa inosservata, ma può compromettere la rigenerazione degli habitat e il funzionamento di interi ecosistemi. Proteggerli significa proteggere i sistemi naturali alla loro base."
  },
  chromista: {
    title: "Regno Chromista",
    description_part1: "Il regno Chromista include organismi molto diversi tra loro: dalle diatomee microscopiche che producono una grande percentuale dell’ossigeno globale, alle alghe brune giganti che formano vere foreste marine. Questi organismi non solo sostengono le catene alimentari oceaniche, ma regolano l’assorbimento di carbonio, influenzando direttamente il clima.",
    description_part2: "Sebbene le specie valutate siano solo 18, ben 6 di queste, principalmente alghe brune, risultano già minacciate. La perdita di specie all’interno dei chromisti ha ripercussioni profonde sulla salute dei mari e sulla capacità del pianeta di mantenere gli equilibri climatici."
  }
};

const palette = {
  fungi:    "#A59382",
  plantae:  "#A6C3A0",
  animalia: "#B96A82",
  chromista:"#95A6B7"
};

const bgColor   = "#F2F0E5";
const textColor = "#4f4838";
const neutralColor = "#E0E0E0"; 

let outerRadius, wedgeAngles = [];
let maxTotal = 0;
let cartaSfondo; 
let cartaPopup;  

let imgAnimali1, imgAnimali2; 
let imgPiante1, imgPiante2;
let imgFunghi1, imgFunghi2;
let imgChromisti1, imgChromisti2;

const INNER_FIXED_RADIUS = 40; 
const MIN_SEGMENT_THICKNESS = 8; 

const REFERENCE_1 = 1000;
const REFERENCE_2 = 5000; 
const REFERENCE_3 = 10000;
const REFERENCE_VALUES = [REFERENCE_1, REFERENCE_2, REFERENCE_3];

let wheelCenterX;
let wheelCenterY; 

let hoveredAreaIndex = -1; 
let isPopupOpen = false;
let infoIconBounds = []; 
let currentPopupContent = null;
let isMouseOverClickable = false;

const POPUP_WIDTH = 750;  
const POPUP_HEIGHT = 550; 
const MIN_POPUP_HEIGHT = 60; 
const IMAGE_WIDTH_MAX = 200; 

let animProgress = 1.0; 
const ANIM_SPEED = 1.0; 
let wheelProgress = 0.0; 
const WHEEL_SPEED = 0.015;

let finalGapAngle;
let finalWedgeAngle; 

function preload() {
  try { cartaSfondo = loadImage('immagini/cartagiustissima.jpg'); } catch(e) {}
  try { cartaPopup = loadImage('immagini/carta2.jpg'); } catch(e) {} 
  
  try { imgAnimali1 = loadImage('immagini/infoanimali1.png'); } catch(e) { console.error("Errore"); }
  try { imgAnimali2 = loadImage('immagini/infoanimali2.png'); } catch(e) { console.error("Errore"); }
  try { imgPiante1 = loadImage('immagini/infopiante1.png'); } catch(e) { console.error("Errore"); }
  try { imgPiante2 = loadImage('immagini/infopiante2.png'); } catch(e) { console.error("Errore"); }
  try { imgFunghi1 = loadImage('immagini/infofunghi1.png'); } catch(e) { console.error("Errore"); }
  try { imgFunghi2 = loadImage('immagini/infofunghi2.png'); } catch(e) { console.error("Errore"); }
  try { imgChromisti1 = loadImage('immagini/infocromisti1.png'); } catch(e) { console.error("Errore"); }
  try { imgChromisti2 = loadImage('immagini/infocromisti2.png'); } catch(e) { console.error("Errore"); }
  
  table = loadTable("data/regni_aree.csv", "csv", "header");
  tableTotal = loadTable("data/data_main.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2);
  angleMode(RADIANS);
  textFont("cormorant-garamond");

  parseData();
  sortAreasBySize(); 
  computeLayout();
  loop(); 
}

function sortAreasBySize() {
  areas.sort((a, b) => a.total - b.total);
}

function parseData() {
  areas = [];
  maxTotal = 0;
  for (let r = 0; r < table.getRowCount(); r++) {
    const label = table.getString(r, 0);
    if (!label || label.toLowerCase() === "total") continue; 

    const entry = { area: label, values: {}, total: 0 };
    kingdoms.forEach(k => { 
      const val = parseFloat(table.getString(r, k)) || 0;
      entry.values[k] = val;
      entry.total += val;
    });
    maxTotal = max(entry.total, maxTotal);
    areas.push(entry);
  }
}

function computeLayout() {
  const sizeMin = min(width, height);
  outerRadius = sizeMin * 0.40; 
  wheelCenterX = width * 0.7; 
  wheelCenterY = height * 0.45; 
  
  const n = areas.length;
  const full = TWO_PI;
  finalGapAngle = full * 0.004;
  finalWedgeAngle = (full - n * finalGapAngle) / n;
  
  wedgeAngles = [];
  let start = -HALF_PI;

  for (let i = 0; i < n; i++) {
    const s = start + i * (finalWedgeAngle + finalGapAngle);
    wedgeAngles.push({ start: s, end: s + finalWedgeAngle });
  }
}

function updateHoverState() {
  hoveredAreaIndex = -1;
  isMouseOverClickable = false; 

  if (isPopupOpen) {
    const popX = width / 2;
    const popY = height / 2;
    const margin = 30; 
    const boxLeft = popX - POPUP_WIDTH / 2;
    const boxTop = popY - POPUP_HEIGHT / 2;
    const closeBtnX = boxLeft + POPUP_WIDTH - margin;
    const closeBtnY = boxTop + margin;
    const btnSize = 30;

    if (dist(mouseX, mouseY, closeBtnX, closeBtnY) < btnSize) {
      isMouseOverClickable = true;
    }
    return; 
  }

  if (wheelProgress < 0.99) return;

  for (let b of infoIconBounds) {
    if (dist(mouseX, mouseY, b.x, b.y) < 15) {
      isMouseOverClickable = true;
    }
  }

  const relX = mouseX - wheelCenterX;
  const relY = mouseY - wheelCenterY; 
  const distMouse = sqrt(relX*relX + relY*relY);
  
  if (distMouse < INNER_FIXED_RADIUS || distMouse > outerRadius + 60) return;

  let mAng = atan2(relY, relX);
  if (mAng < 0) mAng += TWO_PI;

  for (let i = 0; i < areas.length; i++) {
    let s = wedgeAngles[i].start;
    let e = wedgeAngles[i].end;
    let sNorm = (s % TWO_PI + TWO_PI) % TWO_PI;
    let eNorm = (e % TWO_PI + TWO_PI) % TWO_PI;
    
    let hit = false;
    if (sNorm < eNorm) {
      if (mAng >= sNorm && mAng <= eNorm) hit = true;
    } else {
      if (mAng >= sNorm || mAng <= eNorm) hit = true;
    }

    if (hit) {
      const areaMaxR = map(areas[i].total, 0, maxTotal, INNER_FIXED_RADIUS + 20, outerRadius);
      if (distMouse <= areaMaxR + 5) {
        hoveredAreaIndex = i;
        isMouseOverClickable = true; 
        return;
      }
    }
  }
}

function draw() {
  if (!isPopupOpen && wheelProgress < 1.0) {
    wheelProgress = min(wheelProgress + WHEEL_SPEED, 1.0);
  }
  
  if (isPopupOpen) {
    animProgress = 1.0;
  } else {
    animProgress = 0.0;
  }

  updateHoverState();

  if (isMouseOverClickable) {
    cursor(HAND); 
  } else {
    cursor(ARROW); 
  }

  if (cartaSfondo) image(cartaSfondo, 0, 0, width, height);
  else background(bgColor);

  drawTitle(); 
  drawLegend();

  push(); 
  translate(wheelCenterX, wheelCenterY); 
  
  for (let i = 0; i < areas.length; i++) {
    drawAnimatedWedge(i); 
    if (wheelProgress > 0.8) drawCurvedLabel(i); 
  }
  
  if (wheelProgress > 0.8) drawReferenceCircles(); 

  pop(); 

  if (hoveredAreaIndex !== -1 && !isPopupOpen && animProgress <= 0) {
    drawTooltip(hoveredAreaIndex);
  }

  if (isPopupOpen) drawPopup();
}

function drawAnimatedWedge(i) {
  const N = areas.length;
  const startT = i / N;
  const endT = (i + 1) / N;
  
  if (wheelProgress < startT) return; 

  let localP = map(wheelProgress, startT, endT, 0, 1);
  localP = constrain(localP, 0, 1);

  const { start, end } = wedgeAngles[i];
  const currentEnd = map(localP, 0, 1, start, end);

  const area = areas[i];
  const total = area.total;
  
  const minRadius = INNER_FIXED_RADIUS; 
  const outerLimit = map(total, 0, maxTotal, minRadius + 20, outerRadius); 
  const currentRange = outerLimit - minRadius;

  const segments = kingdoms.map(k => ({ k, v: area.values[k] }));
  const relevant = segments.filter(s => s.v > 0);
  const sumVals = relevant.reduce((acc, o) => acc + o.v, 0);

  if (sumVals <= 0.0001) return;

  const minThicknessNeeded = relevant.length * MIN_SEGMENT_THICKNESS;
  const availRange = max(0, currentRange - minThicknessNeeded); 

  let rInner = minRadius; 
  const isDimmed = (hoveredAreaIndex !== -1 && hoveredAreaIndex !== i);

  for (const { k, v } of segments) {
    if (v <= 0) continue;
    let thick = MIN_SEGMENT_THICKNESS; 
    if (availRange > 0 && sumVals > 0) {
      thick += map(v, 0, sumVals, 0, availRange);
    }
    let rOuter = rInner + thick;
    if (rOuter > outerLimit) rOuter = outerLimit;

    let baseColor = color(palette[k]);
    baseColor.setAlpha(255); 
    
    let c = baseColor;
    if (isDimmed) c = lerpColor(c, color(225, 225, 220, 255), 0.7); 

    drawRingSegment(start, currentEnd, rInner, rOuter, c);
    rInner = rOuter;
  }
}

function drawRingSegment(start, end, rIn, rOut, col) {
  if (abs(end - start) < 0.0001) return;
  
  let solidColor = color(col);
  solidColor.setAlpha(255); 
  
  noStroke();
  fill(solidColor);

  const steps = 30;
  const da = (end - start) / steps;
  
  beginShape();
  
  for (let i = 0; i <= steps; i++) {
    let angle = start + i * da;
    vertex(cos(angle) * rOut, sin(angle) * rOut);
  }
  
  for (let i = steps; i >= 0; i--) {
    let angle = start + i * da;
    vertex(cos(angle) * rIn, sin(angle) * rIn);
  }
  endShape(CLOSE);
}


function drawCurvedLabel(i) {
  const { start, end } = wedgeAngles[i];
  const label = areas[i].area;
  const textR = outerRadius + 15; 
  
  textSize(constrain(width * 0.016, 10, 18));
  
  if (hoveredAreaIndex === i) {
      fill(0); textStyle(BOLD);
  } else if (hoveredAreaIndex !== -1) {
      fill(180, 180, 180, 180); textStyle(BOLD); 
  } else {
      fill(textColor); textStyle(BOLD); 
  }

  noStroke();
  textAlign(CENTER, CENTER);

  const arcLen = end - start;
  const totalW = textWidth(label);
  const desiredSpan = totalW / textR;
  let scaleFactor = 1;
  if (desiredSpan > arcLen * 0.9) scaleFactor = (arcLen * 0.9) / desiredSpan;

  let centerAngle = (start + end) / 2;
  let isBottom = sin(centerAngle) > 0.001; 

  let currentAngle = start + (arcLen - desiredSpan*scaleFactor)/2;
  let angleStep = 1; 
  let angleFlip = 0;

  if (isBottom) {
      angleFlip = PI; 
      currentAngle = end - (arcLen - desiredSpan*scaleFactor)/2;
      angleStep = -1;
  }

  for (let j = 0; j < label.length; j++) {
    const ch = label[j];
    const cw = textWidth(ch) * scaleFactor;
    const ca = cw / textR;
    
    let ang = currentAngle + (ca/2 * angleStep);
    let x = cos(ang) * textR;
    let y = sin(ang) * textR;
    
    push();
    translate(x, y);
    rotate(ang + HALF_PI + angleFlip);
    textSize(constrain(width * 0.016, 10, 18) * scaleFactor);
    text(ch, 0, 0);
    pop();
    
    currentAngle += ca * angleStep;
  }
}

function drawTooltip(index) {
  const area = areas[index];
  const padding = 12;
  const lineHeight = 24;
  
  let content = [];
  content.push({ t: area.area.toUpperCase(), b: true, c: textColor });
  content.push({ t: `Totale: ${area.total}`, b: false, c: textColor });
  
  kingdoms.forEach(k => {
    if (area.values[k] > 0) {
      content.push({ 
        t: `${capitalize(k)}: ${area.values[k]}`, 
        b: false, 
        c: textColor, 
        dotColor: palette[k] 
      });
    }
  });

  textSize(18);
  let maxW = 0;
  content.forEach(l => {
    textStyle(l.b ? BOLD : NORMAL);
    let w = textWidth(l.t) + (l.dotColor ? 15 : 0);
    if (w > maxW) maxW = w;
  });
  
  const boxW = maxW + padding*2;
  const boxH = content.length * lineHeight + padding*2;
  
  let tx = mouseX + 15;
  let ty = mouseY + 15;
  if (tx + boxW > width) tx = mouseX - boxW - 5;
  if (ty + boxH > height) ty = mouseY - boxH - 5;

  push();
  fill(255, 250);
  stroke(200);
  rect(tx, ty, boxW, boxH, 6);
  
  let cy = ty + padding;
  textAlign(LEFT, TOP);
  noStroke();
  
  content.forEach(l => {
    let cx = tx + padding;
    if (l.dotColor) {
      fill(l.dotColor);
      circle(cx + 4, cy + 7, 8);
      cx += 15;
    }
    fill(l.c);
    textStyle(l.b ? BOLD : NORMAL);
    text(l.t, cx, cy);
    cy += lineHeight;
  });
  pop();
}

function mouseClicked() {
  // CLICK SULLA X DEL POPUP
  if (isPopupOpen) {
    const popX = width / 2;
    const popY = height / 2;
    const margin = 30;
    const btnSize = 30;

    const boxLeft = popX - POPUP_WIDTH / 2;
    const boxTop = popY - POPUP_HEIGHT / 2;

    const closeBtnX = boxLeft + POPUP_WIDTH - margin;
    const closeBtnY = boxTop + margin;

    if (dist(mouseX, mouseY, closeBtnX, closeBtnY) < btnSize / 2) {
      isPopupOpen = false;
      currentPopupContent = null;
      return;
    }
  }
  
  // CLICK SULL’ICONA "i"
  for (let b of infoIconBounds) {
    if (dist(mouseX, mouseY, b.x, b.y) < b.size) {

      // APRI IL POPUP CON IL CONTENUTO CORRETTO
      currentPopupContent = popupData[b.k];
      isPopupOpen = true;

      return; // BLOCCA ALTRI CLICK
    }
  }

  // NAVIGAZIONE AL CLICK DELLO SPICCHIO
  if (hoveredAreaIndex !== -1 && !isPopupOpen && wheelProgress >= 0.98) {
    const areaName = areas[hoveredAreaIndex].area;
    const slug = areaName.toLowerCase().replace(/\s+/g, "-");

    window.location.href = `../dettaglio/index.html?area=${slug}`;
  }
}

function drawTitle() {
  push();
  fill(textColor);
  noStroke();
  textAlign(LEFT, TOP);
  textStyle(NORMAL); 
  
  // Font Sizes
  const sz_custom = constrain(width * 0.09375, 56, 225); 
  const sz_base = constrain(width * 0.03375, 22.5, 81); 
  
  const startX = 60; 
  let startY = 20; 
  
  textSize(sz_custom);
  text("Atlante", startX, startY);
  startY += sz_custom * 1.0; 
  
  textSize(sz_base);
  text("delle Specie a Rischio", startX, startY);
  pop();
}

function drawLegend() {
  push();
  textStyle(NORMAL); 
  if (wheelProgress >= 0.98) infoIconBounds = []; 

  const legendX = 60; 
  
  // *** CALCOLO DIMENSIONI TITOLO PER ALLINEAMENTO ***
  const sz_custom = constrain(width * 0.09375, 56, 225); 
  const sz_base = constrain(width * 0.03375, 22.5, 81); 
  
  // Misura la larghezza esatta dei due testi del titolo
  textSize(sz_custom);
  let w1 = textWidth("Atlante");
  textSize(sz_base);
  let w2 = textWidth("delle Specie a Rischio");
  
  // La larghezza base della legenda è uguale alla riga più lunga del titolo
  let baseLegendWidth = max(w1, w2);
  
  // Aggiungi padding laterale (15px a sx e 15px a dx del box)
  // Il testo inizia a legendX, il box inizia a legendX - 15.
  // Quindi larghezza totale box = baseLegendWidth + 30
  
  let currentY = 20 + sz_custom * 1.0 + sz_base * 1.0 + 40; 

  const innerPaddingY = 24; // margine sopra e sotto la box
  const itemSpacing  = 34; // distanza tra Regni e i vari regni
  // Altezza box con padding superiore e inferiori uguali
  const legendHeight =
    innerPaddingY * 2 +
    itemSpacing * (kingdoms.length); // Regni + regni, SENZA spazio extra sotto

  const lx = legendX - 15;
  const ly = currentY - 15;
  const lw = baseLegendWidth + 30; // Larghezza dinamica allineata al titolo
  const lh = legendHeight;

  // Disegno Sfondo Legenda
  push();
  drawingContext.save();
  drawingContext.beginPath();
  const r = 10;
  const x = lx, y = ly, w = lw, h = lh;
  drawingContext.moveTo(x + r, y);
  drawingContext.arcTo(x + w, y, x + w, y + h, r);
  drawingContext.arcTo(x + w, y + h, x, y + h, r);
  drawingContext.arcTo(x, y + h, x, y, r);
  drawingContext.arcTo(x, y, x + w, y, r);
  drawingContext.closePath();
  drawingContext.clip();

  if (cartaPopup && cartaPopup.width > 1) {
     image(cartaPopup, lx, ly, lw, lh);
     fill(255, 180); 
     noStroke();
     rect(lx, ly, lw, lh);
  } else {
     fill(255, 240);
     noStroke();
     rect(lx, ly, lw, lh);
  }
  drawingContext.restore();
  pop();
  
  // CONTENUTO LEGENDA
  textSize(22); // dimensione aumentata dei titoli Regni, Animalia...
  textAlign(LEFT, CENTER);
  fill(textColor);
  // Posizione iniziale: margine superiore della box
  let yCursor = ly + innerPaddingY;
  // Titolo "Regni"
  textStyle(BOLD);
  text("Regni", legendX, yCursor); 
  textStyle(NORMAL);
  // Spazio dopo "Regni"
  yCursor += itemSpacing;
  // Lista dei regni
  kingdoms.forEach((k, index) => {
    fill(palette[k]);
    rect(legendX, yCursor - 9, 18, 18, 4);

    fill(textColor);
    text(capitalize(k), legendX + 26, yCursor);

    const iconX = legendX + 26 + textWidth(capitalize(k)) + 15;
    drawInfoIconText(iconX, yCursor);
    if (wheelProgress >= 1.0) {
      infoIconBounds.push({ x: iconX, y: yCursor, size: 16, k: k });
    }
    // Aggiunge spazio SOLO se non è l’ultimo elemento
    if (index < kingdoms.length - 1) {
     yCursor += itemSpacing;
    }
  });
  pop();

  drawStatsSection(lx, ly, lw, lh);
}

function drawStatsSection (lx, ly, lw, lh) {
  // BOX STATISTICHE (TOTALI ↔ AREA)
  const globalTotals = getTotalsFromCSV();

  let boxLeftTitle, boxLeftValue;
  let boxRightTitle, boxRightValue;
  let headerText;

  // Se c'è hover → Dati area e % sul mondo
  if (hoveredAreaIndex !== -1) {
    const areaName = areas[hoveredAreaIndex].area;
    const areaTotal = getAreaTotalSpecies(areaName);

    boxLeftTitle = "Percentuale sul totale mondiale";
    boxLeftValue = globalTotals.totalSpecies > 0
      ? ((areaTotal / globalTotals.totalSpecies) * 100).toFixed(1) + "%"
      : "—";

    boxRightTitle = "Specie a rischio nell’area";
    boxRightValue = areaTotal;

    headerText = areaName;
  }
  // Altrimenti → Dati globali
  else {
    boxLeftTitle = "Specie totali nel mondo";
    boxLeftValue = globalTotals.totalSpecies;

    boxRightTitle = "Specie a rischio nel mondo";
    boxRightValue = globalTotals.threatenedSpecies;

    headerText = "Fai hover sul grafico per vedere le specie a rischio per area \n e la loro percentuale sul totale mondiale. \n Clicca per scoprire le cause.";
  }

  const boxGap = 12;
  //const statBoxH = 60;
  const statBoxW = (lw - boxGap) / 2;
  const statY = ly + lh + 15;
  // CALCOLO ALTEZZA DINAMICA BOX STATISTICHE
  const statPaddingTop = 10;      // margine superiore interno
  const statPaddingBottom = 12;   // margine inferiore interno
  const statGap = 4;              // spazio tra titolo e valore

  const statTitleSize = 16;       // dimensione titolo
  const statValueSize = 50;       // dimensione valore numerico

  // Altezza box adattiva al contenuto
  const statBoxH =
    statPaddingTop +
    statTitleSize +
    statGap +
    statValueSize +
    statPaddingBottom;

  // Box sinistro: specie totali
  drawStatBox(lx, statY, statBoxW, statBoxH, boxLeftTitle, boxLeftValue, statPaddingTop, statGap, statTitleSize, statValueSize);

  // Box destro: specie a rischio
  drawStatBox(lx + statBoxW + boxGap, statY, statBoxW, statBoxH, boxRightTitle, boxRightValue, statPaddingTop, statGap, statTitleSize, statValueSize);

  // TESTO SOTTO IL BOX / NOME AREA
  push();
    fill(textColor);
    noStroke();
    textAlign(LEFT, TOP);
    textStyle(NORMAL);

    const textX = lx + 12; // Allinea l'inizio del testo con il resto
    const textY = statY + statBoxH + 10;
    const textW = lw;

    if (hoveredAreaIndex !== -1) {
      // NOME AREA (hover)
      const areaName = capitalizeWords(headerText);
      // Dimensione grande ≈ due righe da 18px
      const areaTextSize = 36;
      textSize(areaTextSize);

      text(areaName, textX, textY, textW);
    } else {
    // TESTO ESPLICATIVO
      textSize(18);
      text(headerText, textX, textY, textW);
    }
  pop();  
}

function drawStatBox (x, y, w, h, title, value, statPaddingTop, statGap, statTitleSize, statValueSize) {
    push();
    drawingContext.save();
    drawingContext.beginPath();

    const r = 10;
    drawingContext.moveTo(x + r, y);
    drawingContext.arcTo(x + w, y, x + w, y + h, r);
    drawingContext.arcTo(x + w, y + h, x, y + h, r);
    drawingContext.arcTo(x, y + h, x, y, r);
    drawingContext.arcTo(x, y, x + w, y, r);
    drawingContext.closePath();
    drawingContext.clip();

    // Sfondo carta
    if (cartaPopup && cartaPopup.width > 1) {
      image(cartaPopup, x, y, w, h);
      fill(255, 180);
      noStroke();
      rect(x, y, w, h);
    } else {
      fill(255, 240);
      noStroke();
      rect(x, y, w, h);
    }

    drawingContext.restore();

    // Stato testo
    fill(textColor);
    noStroke();
    textAlign(LEFT, TOP);

    const textX = x + 12;
    let textY = y + statPaddingTop;

    textStyle(BOLD);
    textSize(statTitleSize);
    text(title, textX, textY);

    // Spazio tra titolo e valore
    textY += statTitleSize + statGap;

    textStyle(NORMAL);
    textSize(statValueSize);
    text(value.toLocaleString("it-IT"), textX, textY);
    pop();
}

function capitalizeWords(str) {
  // Funzione per mettere in maiuscolo la prima lettera di ogni parola
  return str
    .toLowerCase()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function drawInfoIconText(x, y) {
  push();
  const iconSize = 16; 
  noFill();
  stroke(textColor);
  strokeWeight(1);
  circle(x, y, iconSize);

  fill(textColor);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  textStyle(BOLD);
  text("i", x, y - 1); 
  pop();
}

function drawReferenceCircles() {
  push();
  noFill(); 
  stroke(150);
  strokeWeight(1);
  circle(0, 0, INNER_FIXED_RADIUS * 2);

  if (maxTotal > 0) {
    for (const val of REFERENCE_VALUES) {
        if (val > maxTotal * 1.5) continue; 
        const r = map(val, 0, maxTotal, INNER_FIXED_RADIUS, outerRadius);
        noFill(); 
        stroke(100); 
        strokeWeight(0.5); 
        drawingContext.setLineDash([4, 4]); 
        circle(0, 0, r * 2);
        drawingContext.setLineDash([]); 
        
        // TESTO CURVO ATTORNO AL CERCHIO
        const label = String(val); 
        const angle = -PI * 78 / 180; // posizione: sopra al cerchio (78 gradi)
        const textRadius = r + 10; // distanza dal cerchio

        push();
        translate(
          cos(angle) * textRadius,
          sin(angle) * textRadius
        );

        // Ruota il testo seguendo la tangente del cerchio
        rotate(angle + HALF_PI);

        fill(100); // stesso tono del cerchio
        noStroke();
        textSize(16);
        textAlign(CENTER, CENTER);
        text(label, 0, 0);
        pop();
    }
  }
  pop();
}

function drawScaledImage(img, slotX, slotW, slotY, slotH, scaleMultiplier) {
     if (img) {
        let naturalScale = max(slotW / img.width, slotH / img.height);
        const scaleFactor = naturalScale * scaleMultiplier;
        const w = img.width * scaleFactor;
        const h = img.height * scaleFactor;
        let drawX = slotX + (slotW - w) / 2;
        let drawY = slotY + (slotH - h) / 2;
        image(img, drawX, drawY, w, h); 
     }
}

function drawPopup() {
  if (!isPopupOpen) return; 
  
  fill(0, 100); 
  noStroke();
  rect(0, 0, width, height);

  const popX = width / 2;
  const popY = height / 2;
  
  const curH = POPUP_HEIGHT; 

  const boxLeft = popX - POPUP_WIDTH / 2;
  const boxTop = popY - curH / 2;
  const textMargin = 30; // Margine interno standard

  push();
  drawingContext.save();
  drawingContext.beginPath();
  const r = 10;
  const x = boxLeft, y = boxTop, w = POPUP_WIDTH, h = curH;
  drawingContext.moveTo(x + r, y);
  drawingContext.arcTo(x + w, y, x + w, y + h, r);
  drawingContext.arcTo(x + w, y + h, x, y + h, r);
  drawingContext.arcTo(x, y + h, x, y, r);
  drawingContext.arcTo(x, y, x + w, y, r);
  drawingContext.closePath();
  drawingContext.clip();

  const safetyMargin = 2; // Margine di sicurezza per coprire artefatti

  if (cartaPopup && cartaPopup.width > 1) {
     image(cartaPopup, 
           boxLeft - safetyMargin, 
           boxTop - safetyMargin, 
           POPUP_WIDTH + 2 * safetyMargin, 
           curH + 2 * safetyMargin);
  } else {
     fill(255, 250);
     noStroke();
     rectMode(CORNER);
     rect(boxLeft - safetyMargin, 
          boxTop - safetyMargin, 
          POPUP_WIDTH + 2 * safetyMargin, 
          curH + 2 * safetyMargin);
  }
  drawingContext.restore();
  
  {
    fill(textColor);
    noStroke();
    
    textAlign(LEFT, TOP); 
    textSize(64); 
    
    let t = currentPopupContent ? currentPopupContent.title : "Info";
    let titleX = boxLeft + textMargin; 
    text(t, titleX, boxTop + 18);

    const contentYStart = boxTop + 100; 
    const contentH = curH - 130; 
    
    const regno = currentPopupContent ? currentPopupContent.title.replace("Regno ", "").toLowerCase() : '';
    let img1, img2, part1, part2;

    if (regno === 'animalia') {
        img1 = imgAnimali2; 
        img2 = imgAnimali1; 
        part1 = popupData.animalia.description_part1;
        part2 = popupData.animalia.description_part2;
    } else if (regno === 'plantae') {
        img1 = imgPiante1; img2 = imgPiante2;
        part1 = popupData.plantae.description_part1;
        part2 = popupData.plantae.description_part2;
    } else if (regno === 'fungi') {
        img1 = imgFunghi2; 
        img2 = imgFunghi1; 
        part1 = popupData.fungi.description_part1;
        part2 = popupData.fungi.description_part2;
    } else if (regno === 'chromista') {
        img1 = imgChromisti1; img2 = imgChromisti2;
        part1 = popupData.chromista.description_part1;
        part2 = popupData.chromista.description_part2;
    }

    textStyle(NORMAL);
    textSize(16); 
    
    const Gutter = 20; 
    const fullContentW = POPUP_WIDTH - textMargin * 2;
    
    const BASE_SCALE = 1.0; 
    let scale1 = BASE_SCALE; 
    let scale2 = BASE_SCALE; 

    if (regno === 'fungi') {
        scale1 = 0.75; 
        scale2 = 0.4; 
    }
    
    if (regno === 'plantae') {
        scale1 = 0.5625; 
        scale2 = 0.5625; 
    }
    
    const ROW_HEIGHT = (contentH - Gutter) / 2; 
    const COL_BASE_W = (POPUP_WIDTH - 2 * textMargin - Gutter) / 2; 

    let text1X = boxLeft + textMargin;
    textAlign(LEFT, TOP);
    text(part1, 
            text1X, 
            contentYStart, 
            COL_BASE_W, 
            ROW_HEIGHT);
            
    let img1X = boxLeft + textMargin + COL_BASE_W + Gutter; 
    let img1W = COL_BASE_W + textMargin; 
    drawScaledImage(img1, img1X, img1W, contentYStart, ROW_HEIGHT, scale1);

    const row2YStart = contentYStart + ROW_HEIGHT + Gutter;
    
    let img2X = boxLeft; 
    let img2W = COL_BASE_W + textMargin; 
    drawScaledImage(img2, img2X, img2W, row2YStart, ROW_HEIGHT, scale2);

    let text2X = boxLeft + img2W + Gutter;
    textAlign(LEFT, TOP);
    text(part2, 
            text2X, 
            row2YStart, 
            COL_BASE_W, 
            ROW_HEIGHT);

    const btnSize = 30;
    const btnMargin = 30;
    const closeCx = boxLeft + POPUP_WIDTH - btnMargin;
    const closeCy = popY - POPUP_HEIGHT / 2 + btnMargin;
    
    rectMode(CENTER);
    stroke(textColor);
    strokeWeight(1.5);
    noFill();
    rect(closeCx, closeCy, btnSize, btnSize, 5);
    strokeWeight(2);
    line(closeCx - 6, closeCy - 6, closeCx + 6, closeCy + 6);
    line(closeCx + 6, closeCy - 6, closeCx - 6, closeCy + 6);
  }
  pop();
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getTotalsFromCSV() {
  // Estrae i valori dalla riga "Total" del CSV
  let result = {
    totalSpecies: 0,
    threatenedSpecies: 0
  };

  for (let r = 0; r < tableTotal.getRowCount(); r++) {
    const name = tableTotal.getString(r, "Name");
    if (name === "Total") {
      result.totalSpecies = int(
        tableTotal.getString(r, "Total").replace(/\./g, "")
      );
      result.threatenedSpecies = int(
        tableTotal.getString(r, "Subtotal (threatened spp.)").replace(/\./g, "")
      );
      break;
    }
  }

  return result;
}

function getAreaTotalSpecies(areaName) {
  for (let a of areas) {
    if (a.area === areaName) {
      return a.total;
    }
  }
  return 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computeLayout(); 
  redraw(); 
}