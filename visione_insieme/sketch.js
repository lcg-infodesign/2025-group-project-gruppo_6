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
    description_part2: "Sebbene le specie valutate siano 18, 6 di queste, principalmente alghe brune, risultano già minacciate. La perdita di specie all’interno dei chromisti ha ripercussioni profonde sulla salute dei mari e sulla capacità del pianeta di mantenere gli equilibri climatici."
  }
};

const palette = {
  fungi:    "#A59382",
  plantae:  "#A6C3A0",
  animalia: "#B96A82",
  chromista:"#95A6B7"
};

const bgColor   = "#F2F0E5";
const textColor = "#333333";
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
// Variabile per tracciare se il mouse è sopra un elemento cliccabile
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
  
  table = loadTable("regni_aree.csv", "csv", "header");
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
  isMouseOverClickable = false; // Reset dello stato click ogni frame

  // 1. Controllo PULSANTE DI CHIUSURA se il popup è aperto
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
    return; // Se il popup è aperto, non controlliamo altro
  }

  // Se l'animazione non è finita, usciamo
  if (wheelProgress < 0.99) return;

  // 2. Controllo ICONE INFO (Legend)
  for (let b of infoIconBounds) {
    if (dist(mouseX, mouseY, b.x, b.y) < 15) {
      isMouseOverClickable = true;
      // Non facciamo return qui perché potremmo volere l'hover anche sugli spicchi 
      // (anche se le icone sono in un'altra zona)
    }
  }

  // 3. Controllo SPICCHI DEL GRAFICO
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
        isMouseOverClickable = true; // È uno spicchio cliccabile
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

  // *** GESTIONE CURSORE ***
  if (isMouseOverClickable) {
    cursor(HAND); // Manina
  } else {
    cursor(ARROW); // Freccia normale
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
  
  textSize(constrain(width * 0.012, 10, 15));
  
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
    textSize(constrain(width * 0.012, 10, 15) * scaleFactor);
    text(ch, 0, 0);
    pop();
    
    currentAngle += ca * angleStep;
  }
}

function drawTooltip(index) {
  const area = areas[index];
  const padding = 12;
  const lineHeight = 20;
  
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

  textSize(14);
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
      isPopupOpen = false;
      return;
    }
    return;
  }
  
  if (!isPopupOpen && wheelProgress >= 1.0) {
    for (let b of infoIconBounds) {
      if (dist(mouseX, mouseY, b.x, b.y) < 15) {
        currentPopupContent = popupData[b.k];
        isPopupOpen = true;
        return;
      }
    }
  }

  // NAVIGAZIONE AL CLICK DELLO SPICCHIO
  if (!isPopupOpen && wheelProgress >= 1.0 && hoveredAreaIndex !== -1) {
    window.location.href = "../dettaglio/index.html";
  }
}

function drawTitle() {
  push();
  fill(textColor);
  noStroke();
  textAlign(LEFT, TOP);
  textStyle(NORMAL); 
  
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
  if (wheelProgress >= 1.0) infoIconBounds = []; 

  const sz = constrain(width * 0.05, 30, 60); 
  const legendX = 60; 
  
  const title_sz_custom = constrain(width * 0.09375, 56, 225);
  const title_sz_base = constrain(width * 0.03375, 22.5, 81); 
  
  let currentY = 20 + title_sz_custom * 1.0 + title_sz_base * 1.0 + 40; 

  const rowH = 30;
  const legendWidth = 220; 
  const legendHeight = rowH * (kingdoms.length + 1) + 30;

  const lx = legendX - 15;
  const ly = currentY - 15;
  const lw = legendWidth;
  const lh = legendHeight;

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
  
  textSize(18); 
  textAlign(LEFT, CENTER);
  fill(textColor);
  textStyle(BOLD);
  text("Regni", legendX, currentY); 
  textStyle(NORMAL);
  currentY += rowH;

  kingdoms.forEach(k => { 
    fill(palette[k]);
    rect(legendX, currentY - 9, 18, 18, 4); 
    fill(textColor);
    text(capitalize(k), legendX + 26, currentY);
    const iconX = legendX + 26 + textWidth(capitalize(k)) + 15;
    drawInfoIconText(iconX, currentY);
    
    if (wheelProgress >= 1.0) {
      infoIconBounds.push({x: iconX, y: currentY, size: 16, k: k});
    }
    currentY += rowH;
  });
  pop();
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
        
        fill(textColor); 
        noStroke(); 
        textSize(10);
        textAlign(LEFT, CENTER);
        text(val, r + 5, 0); 
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computeLayout(); 
  redraw(); 
}