
const team = [
  { name: "Federica",     role: "Illustratrice Programmatrice",       
    description:"Fate, boschi, animaletti, musica folk... questo sito è per lei.", image: "fede.jpg" },
  
  { name: "Emily",   role: "Content writer Organizzazione dati",            
    description:"Fa sempre 200 mila cose ma in qualche modo è sempre sul pezzo, slay", image: "emily.jpg" },

  { name: "Alessandro", role: "Organizzazione contenuti Programmatore ",             
    description:"Creatore di meme del gruppo, ride sempre e a caso. È impossibile arrabbiarsi con lui.", image: "ale.jpg" },

  { name: "Rebecca",     role: "Ricerca database Programmatrice",     
    description:"'Ma come ti permetti?!?!' core. Super cute ma ha il cuore da dark princess.", image: "rebbi.jpg" },
  
  { name: "Isabella",     role: "Programmatrice",    
    description:"Un po' biscotti alla cannella, un po' trap. La + swag.", image: "isi.jpg" },
  
  { name: "Aroa",   role: "Prototipi Figma",    
    description:"La nostra componente spagnola. Non si sa come ma  capisce sempre tutto quello che diciamo.", image: "aroa.jpg" },
  
  { name: "Ludovica",     role: "Ricerca idee grafiche Programmatrice",      
    description:"da inserire", image: "ludo.jpg" }
];

const topMembers = team.slice(0, 4);
const bottomMembers = team.slice(4);

function createCard(member, index) {
  const card = document.createElement("article");
  card.className = `card c${(index % 7) + 1}`;
  card.setAttribute("role", "listitem");
  card.setAttribute("aria-label", `${member.name}, ${member.role}`);

  // Testo in alto
  const meta = document.createElement("div");
  meta.className = "meta";

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = member.name;

  const role = document.createElement("div");
  role.className = "role";
  role.textContent = member.role;

  // Descrizione sotto il ruolo, che compare con hover
  const description = document.createElement("div");
  description.className = "description";
  description.textContent = member.description;

  meta.appendChild(name);
  meta.appendChild(role);
  meta.appendChild(description);

 // Immagine in basso, dentro rettangolo interno quasi ovale
  const media = document.createElement("div");
  media.className = "media";

  const img = document.createElement("img");
  // CAMBIO CHIAVE: Usa member.image per il percorso dell'immagine
  img.src = member.image; 
  img.alt = `Ritratto di ${member.name}, ${member.role}`;
  media.appendChild(img);

  card.appendChild(meta);
  card.appendChild(media);

  return card;
}

const rowTop = document.getElementById("row-top");
const rowBottom = document.getElementById("row-bottom");

// Inserisce i membri nelle rispettive righe
topMembers.forEach((m, i) => rowTop.appendChild(createCard(m, i)));
bottomMembers.forEach((m, i) => rowBottom.appendChild(createCard(m, i + topMembers.length)));
