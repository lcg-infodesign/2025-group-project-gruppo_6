Biodiversità e specie a rischio
<br> di Emily Anazco, Ludovica De Marco, Rebecca Ditaranto, Isabella Lena, Aroa Lopez, Alessandro Polistena, Federica Travagnin
La biodiversità del nostro pianeta è in rapido declino. Oltre 48.600 specie su 172.620 valutate sono attualmente minacciate di estinzione, pari a circa il 28 % del totale. Questo sito offre una panoramica sulla crisi della biodiversità, rendendo il tema accessibile attraverso narrazioni visive e grafici interattivi, che permettono di osservare come le minacce variano tra diverse zone climatiche e gruppi tassonomici.
 
Questo sito ha lo scopo di:
Riconoscere la portata globale del rischio di estinzione: è importante comprendere che decine di migliaia di specie sono minacciate a livello mondiale. Questo implica confrontare il numero totale di specie conosciute con quello delle specie a rischio e trarre delle conclusioni sull’entità del fenomeno.
Analizzare la distribuzione del rischio per area geo-climatica: osservare come, per ciascuna area geo-climatica, il numero di specie minacciate varia tra i diversi regni.
Comprendere come le cause di estinzione variano tra regni e aree geografiche: studiare come variano le cause di estinzione su funghi, piante, animali e cromisti nelle varie aree geografiche.
 
Struttura del sito
·       Introduzione e impatto visivo
Il sito si apre con una narrazione di contesto, accompagnata da un countdown pensato per aiutare l’utente a percepire la scala del fenomeno e creare un impatto immediato.
·       Visione d’insieme
Tramite un pulsante, si accede a un grafico a raggiera che permette di confrontare i gruppi tassonomici a rischio in ciascuna area climatica. A supporto di essa si ha una legenda, informazioni aggiuntive per gruppo e una spiegazione sulla differenza tra specie totali e specie a rischio. Passando il cursore su ciascuno spicchio, si possono visualizzare le quantità specifiche per ogni regno, offrendo così una panoramica completa.
·       Visione dettagliata
Cliccando su uno spicchio, i gruppi tassonomici vengono rappresentati come fiori: ogni petalo indica una causa di estinzione, con spiegazioni dettagliate disponibili al click. L’obiettivo è evidenziare le cause per area climatica: la lunghezza dei singoli petali aumenta in relazione all'incidenza della causa in quella zona climatica, per mostrare l’importanza relativa di ciascuna minaccia in quella zona. 
·       Pagine di supporto
Sezioni come “Chi siamo” e “Dataset” contestualizzano il lavoro del team e l’origine dei dati

Ci siamo serviti dell’intelligenza artificiale in due fasi specifiche del progetto.
Abbiamo utilizzato Copilot per impostare la comparsa dei punti nell’animazione iniziale, calibrando la distribuzione in base alla percentuale di specie a rischio di estinzione rispetto al totale. In secondo luogo, abbiamo utilizzato Gemini per comprendere come integrare e utilizzare la libreria p5.js “Brush”, applicando uno stile acquarellato alla pagina About us.


Dataset
Il dataset IUCN Red List 2025 https://www.iucnredlist.org/statistics
La IUCN Red List of Threatened Species è gestita dall’International Union for Conservation of Nature (IUCN), un’organizzazione mondiale considerata lo standard scientifico globale per la valutazione del rischio di estinzione.
Contiene:
Numero totale di specie conosciute per paese (260 paesi)
Numero di specie in pericolo per area geo-climatica
Totale gruppi tassonomici (4 gruppi)
Numero di specie per gruppo tassonomico
Numero di specie a rischio estinzione per gruppo tassonomico
Numero di specie in pericolo in ciascun gruppo tassonomico per area geo-climatica
Numero di specie in pericolo in ciascun gruppo tassonomico per una determinata ragione
Numero di specie in pericolo in ciascun gruppo tassonomico per una determinata ragione, per area geo-climatica
Di queste informazioni, abbiamo utilizzato in particolare:
Per le specie: Numero di specie in pericolo per area geo-climatica
Per i gruppi tassonomici: Numero di specie a rischio estinzione per gruppo tassonomico
Per le aree climatiche e le cause: Numero di specie in pericolo in ciascun gruppo tassonomico per area climatica e Numero di specie in pericolo in ciascun gruppo tassonomico per una determinata ragione, per area climatica
Abbiamo utilizzato tutti i dati nella loro forma originale tranne quelli relativi alle cause di estinzione: abbiamo ritenuto più interessante istituire un livello di confronto più mirato tra le cause stesse. Riteniamo che attraverso l’utilizzo del dato in percentuale di una causa di estinzione per gruppo tassonomico e area geo-climatica l’utente possa riflettere più facilmente sui rapporti tra le cause e le aree geo-climatiche, più difficili da comprendere rispetto ai rapporti tra le cause e i regni.


Il team
Emily: Organizzazione dati; Content writer
Ludovica: Ricerca idee grafiche; Programmazione “About us” e “Dataset”; Ultimazione Introduzione
Rebecca: Ricerca e selezione dei dati; programmazione Visione d’insieme
Isabella: Programmazione Visione di dettaglio e “About us”
Aroa: Programmazione Visione d’insieme, Prototipi Figma
Alessandro: Organizzazione illustrazioni e grafica del sito; Ultimazione introduzione
Federica: Programmazione Introduzione; Illustrazioni; Content writer

Licenza
Specie a rischio © 2026 by Emily Anazco, Ludovica De Marco, Rebecca Ditaranto, Isabella Lena, Aroa Lopez Rabasseda, Alessandro Polistena, Federica Travagnin is licensed under CC BY 4.0. To view a copy of this license, visit https://creativecommons.org/licenses/by/4.0/

