-- 1. RESET COMPLETO DEL DATABASE
DROP DATABASE IF EXISTS vallauristore;
CREATE DATABASE vallauristore;
USE vallauristore;

-- 2. CREAZIONE STRUTTURA TABELLE (Senza la tabella classe)
CREATE TABLE categorie (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nomeCategoria VARCHAR(50) NOT NULL,
    descrizione VARCHAR(255)
);

CREATE TABLE tag (
    id_tag INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE utente (
    id_utente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    cognome VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255),
    email VARCHAR(100) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE
);

CREATE TABLE prodotto (
    id_prodotto INT AUTO_INCREMENT PRIMARY KEY,
    id_venditore INT NOT NULL,
    id_categoria INT NOT NULL,
    nome VARCHAR(100) NOT NULL, -- Nuovo campo per la ricerca veloce
    descrizione TEXT NOT NULL,  -- Testo lungo per i dettagli
    prezzo DECIMAL(10,2) NOT NULL,
    data_pubblicazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_venditore) REFERENCES utente(id_utente) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorie(id_categoria)
);

CREATE TABLE lezione (
    id_prodotto INT PRIMARY KEY,
    materia VARCHAR(100) NOT NULL,
    durata INT NOT NULL, -- in minuti
    tipo ENUM('online', 'vivo') NOT NULL,
    link_url VARCHAR(255),
    FOREIGN KEY (id_prodotto) REFERENCES prodotto(id_prodotto) ON DELETE CASCADE
);

CREATE TABLE immagini_prodotto (
    id_prodotto INT,
    url_img VARCHAR(255) NOT NULL,
    PRIMARY KEY (id_prodotto, url_img),
    FOREIGN KEY (id_prodotto) REFERENCES prodotto(id_prodotto) ON DELETE CASCADE
);

CREATE TABLE tag_prodotto (
    id_tag INT,
    id_prodotto INT,
    PRIMARY KEY (id_tag, id_prodotto),
    FOREIGN KEY (id_tag) REFERENCES tag(id_tag) ON DELETE CASCADE,
    FOREIGN KEY (id_prodotto) REFERENCES prodotto(id_prodotto) ON DELETE CASCADE
);

CREATE TABLE preferiti (
    id_utente INT,
    id_prodotto INT,
    PRIMARY KEY (id_utente, id_prodotto),
    FOREIGN KEY (id_utente) REFERENCES utente(id_utente) ON DELETE CASCADE,
    FOREIGN KEY (id_prodotto) REFERENCES prodotto(id_prodotto) ON DELETE CASCADE
);

CREATE TABLE venduto (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_acquirente INT NOT NULL,
    id_prodotto INT NOT NULL,
    data_vendita TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_acquirente) REFERENCES utente(id_utente) ON DELETE CASCADE,
    FOREIGN KEY (id_prodotto) REFERENCES prodotto(id_prodotto) ON DELETE CASCADE
);

CREATE TABLE messaggi (
    id_mess INT AUTO_INCREMENT PRIMARY KEY,
    id_mittente INT NOT NULL,
    id_destinatario INT NOT NULL,
    id_prodotto INT NOT NULL,
    testo_messaggio TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_mittente) REFERENCES utente(id_utente) ON DELETE CASCADE,
    FOREIGN KEY (id_destinatario) REFERENCES utente(id_utente) ON DELETE CASCADE,
    FOREIGN KEY (id_prodotto) REFERENCES prodotto(id_prodotto) ON DELETE CASCADE
);

CREATE TABLE recensioni (
    id_rec INT AUTO_INCREMENT PRIMARY KEY,
    id_mittente INT NOT NULL,
    id_destinatario INT NOT NULL,
    voto INT NOT NULL CHECK (voto >= 1 AND voto <= 5),
    commento TEXT,
    FOREIGN KEY (id_mittente) REFERENCES utente(id_utente) ON DELETE CASCADE,
    FOREIGN KEY (id_destinatario) REFERENCES utente(id_utente) ON DELETE CASCADE
);

CREATE TABLE segnalazioni (
    id_segn INT AUTO_INCREMENT PRIMARY KEY,
    id_segnalatore INT NOT NULL,
    id_segnalato INT NOT NULL,
    commento TEXT NOT NULL,
    FOREIGN KEY (id_segnalatore) REFERENCES utente(id_utente) ON DELETE CASCADE,
    FOREIGN KEY (id_segnalato) REFERENCES utente(id_utente) ON DELETE CASCADE
);


-- 3. INSERIMENTO CATEGORIE
INSERT INTO categorie (nomeCategoria, descrizione) VALUES
('Abbigliamento Uomo', 'Magliette, felpe, pantaloni, giacche per ragazzo/uomo'),
('Abbigliamento Donna', 'Vestiti, gonne, top, jeans per ragazza/donna'),
('Scarpe', 'Sneakers, stivali, scarpe eleganti, scarpe da calcio'),
('Accessori', 'Borse, zaini, occhiali da sole, cinture, cappelli'),
('Libri e Appunti', 'Libri scolastici usati, riassunti, mappe concettuali'),
('Elettronica', 'Smartphone, cuffie, calcolatrici scientifiche, pc'),
('Ripetizioni', 'Lezioni private, aiuto compiti e tutoraggio');


-- 4. INSERIMENTO TAG
INSERT INTO tag (nome) VALUES
('vintage'), ('nuovo con cartellino'), ('usato in ottime condizioni'), 
('streetwear'), ('elegante'), ('sport'), ('casual'), 
('nike'), ('zara'), ('apple'), 
('matematica'), ('informatica'), ('inglese'), ('scuola'), ('sconti');


-- 5. INSERIMENTO UTENTI (20 Utenti)
INSERT INTO utente (nome, cognome, email, password_hash) VALUES
('Mario', 'Rossi', 'mario.rossi@email.com', 'hash123'),
('Luigi', 'Bianchi', 'luigi.bianchi@email.com', 'hash123'),
('Giulia', 'Verdi', 'giulia.verdi@email.com', 'hash123'),
('Francesca', 'Neri', 'francesca.neri@email.com', 'hash123'),
('Alessandro', 'Gialli', 'alessandro.gialli@email.com', 'hash123'),
('Martina', 'Marrone', 'martina.marrone@email.com', 'hash123'),
('Lorenzo', 'Viola', 'lorenzo.viola@email.com', 'hash123'),
('Chiara', 'Blu', 'chiara.blu@email.com', 'hash123'),
('Matteo', 'Rosa', 'matteo.rosa@email.com', 'hash123'),
('Sara', 'Azzurri', 'sara.azzurri@email.com', 'hash123'),
('Davide', 'Gallo', 'davide.gallo@email.com', 'hash123'),
('Valentina', 'Costa', 'valentina.costa@email.com', 'hash123'),
('Federico', 'Fontana', 'federico.fontana@email.com', 'hash123'),
('Elena', 'Rizzo', 'elena.rizzo@email.com', 'hash123'),
('Andrea', 'Moretti', 'andrea.moretti@email.com', 'hash123'),
('Laura', 'Barbieri', 'laura.barbieri@email.com', 'hash123'),
('Marco', 'Lombardi', 'marco.lombardi@email.com', 'hash123'),
('Elisa', 'Caruso', 'elisa.caruso@email.com', 'hash123'),
('Luca', 'Ferraro', 'luca.ferraro@email.com', 'hash123'),
('Anna', 'Gatti', 'anna.gatti@email.com', 'hash123');


-- 6. INSERIMENTO 100 PRODOTTI (Con Nome e Descrizione dettagliata)
INSERT INTO prodotto (id_venditore, id_categoria, nome, descrizione, prezzo) VALUES
-- Categoria 1: Abbigliamento Uomo (1-15)
(1, 1, 'T-shirt Bianca Basic H&M', 'T-shirt in cotone organico 100%, vestibilità slim fit. È stata lavata solo un paio di volte, non presenta macchie né buchi. Ideale come sotto-giacca o per un look casual estivo.', 5.00),
(2, 1, 'Felpa Nera con Cappuccio Nike', 'Felpa originale Nike in ottime condizioni. Il tessuto interno è ancora molto morbido. Presenta una leggera scoloritura sui polsini dovuta ai lavaggi, ma il colore generale è ancora un nero intenso.', 15.00),
(3, 1, 'Jeans Levi’s 511 Taglia 44', 'Modello slim stretch, colore blu denim classico. Presenta un effetto vissuto naturale sulle ginocchia. L’orlo è originale e non è mai stato accorciato. Ottimo affare per chi cerca un jeans resistente.', 20.00),
(4, 1, 'Camicia a Quadri Flanella', 'Camicia pesante ideale per l’autunno o l’inverno. Marca Zara, taglia L. I bottoni sono tutti originali e presenti. Molto calda e comoda da indossare sopra una maglietta.', 12.00),
(5, 1, 'Giacca a Vento The North Face', 'Modello vintage anni 90, perfettamente impermeabile. Ha una piccola scucitura interna nella tasca sinistra, ma esternamente è immacolata. Colore giallo e nero molto acceso.', 45.00),
(6, 1, 'Pantaloncini Adidas Running', 'Shorts sportivi con slip interno integrato. Colore blu elettrico con strisce bianche laterali. Usati solo per una stagione di atletica, elastico in via ancora perfetto.', 10.00),
(7, 1, 'Maglione Lana Merino Grigio', 'Marca Benetton, lana molto pregiata che non punge. Scollo a V, ideale da mettere sopra una camicia per andare a scuola o in ufficio. Non presenta pallini di lana.', 25.00),
(8, 1, 'Polo Lacoste Vintage', 'Polo originale colore bordeaux. Taglia 4 (corrisponde a una M/L). Il colletto è leggermente rigido come da modello classico. Un pezzo intramontabile per ogni guardaroba.', 18.00),
(9, 1, 'Pantaloni Chino Grigi', 'Marca Pull&Bear, tessuto leggero estivo. Vestibilità tapered (larghi sulla coscia e stretti alla caviglia). Senza segni di usura, sembrano appena usciti dal negozio.', 22.00),
(10, 1, 'T-shirt Pink Floyd Vintage', 'Maglietta con stampa Dark Side of the Moon. Effetto slavato voluto dal produttore. Il tessuto è molto sottile e fresco, perfetta per i concerti o il tempo libero.', 8.00),
(11, 1, 'Felpa Champion Grigia', 'Modello Reverse Weave, molto pesante e resistente. Il logo sul petto è ricamato perfettamente. Ha una piccola macchia di candeggina quasi invisibile vicino all’orlo inferiore.', 14.00),
(12, 1, 'Jeans Neri Skinny Jack & Jones', 'Jeans molto elasticizzati, si adattano bene alla gamba. Il colore nero non è sbiadito. Chiusura con bottoni invece della zip. Taglia W32 L32.', 16.00),
(13, 1, 'Giacca Ecopelle Rock', 'Giacca stile biker con molte zip e fibbie. L’ecopelle è di alta qualità e non si screpola. Molto aggressiva, ideale per chi ama lo stile motociclista.', 30.00),
(14, 1, 'Canotta Basket Jordan', 'Maglia da basket traspirante, numero 23. Colore rosso Bulls. Usata solo per giocare al parchetto un paio di volte. Nessun filo tirato.', 15.00),
(15, 1, 'Tuta Acetato Anni 2000', 'Completo giacca e pantalone marca Lotto. Stile molto retrò, bande laterali bianche su fondo blu scuro. Comoda per lo sport o come outfit streetwear.', 20.00),

-- Categoria 2: Abbigliamento Donna (16-35)
(16, 2, 'Vestito Estivo a Fiori', 'Abito leggero in viscosa, marca Bershka. Fantasia floreale su fondo bianco. Lunghezza sopra il ginocchio, molto fresco per le giornate calde di luglio.', 18.00),
(17, 2, 'Gonna di Jeans Levis', 'Gonna corta ottenuta dal riciclo di un paio di jeans vintage. Orlo a vivo sfrangiato. Molto stilosa, perfetta con un paio di anfibi.', 12.00),
(18, 2, 'Crop Top Nero Zara', 'Top corto con spalline sottili regolabili. Tessuto a costine molto elastico. Mai usato, ancora con l’etichetta attaccata. Taglia S.', 5.00),
(19, 2, 'Mom Jeans a Vita Alta', 'Marca Stradivarius, vestibilità comoda sui fianchi. Colore azzurro chiaro slavato. Non presenta difetti, le tasche sono integre e la cerniera scorre bene.', 20.00),
(20, 2, 'Cardigan Beige Oversize', 'Lavorazione a maglia grossa, molto caldo e avvolgente. Non ha bottoni, si porta aperto. Ideale da usare sopra un vestitino nelle serate fresche.', 15.00),
(1, 2, 'Giacca Jeans Custom', 'Giacca di jeans con patch ricamate sulla schiena (fiori e scritte). Un pezzo unico fatto a mano. Il denim è di quelli pesanti di una volta.', 25.00),
(2, 2, 'Leggings Nike Pro', 'Leggings tecnici per palestra o corsa. Tessuto traspirante Dri-Fit. Hanno la fascia elastica alta in vita che modella la figura. Usati pochissimo.', 14.00),
(3, 2, 'Maglia Righe Stile Parigino', 'Maglietta a maniche lunghe con righe bianche e blu. Scollo a barchetta. Molto elegante nella sua semplicità, marca Petit Bateau.', 8.00),
(4, 2, 'Abito da Sera Elegante', 'Vestito lungo rosso in satin, ideale per una diciottesima o un evento formale. Scollo a cuore e spacco laterale. Indossato solo per una serata.', 35.00),
(5, 2, 'Pantaloni Palazzo Neri', 'Pantaloni eleganti a gamba larga in tessuto fluido. Non si stropicciano mai, ottimi per chi viaggia o per la scuola. Taglia M.', 18.00),
(6, 2, 'Cappotto Invernale Cammello', 'Cappotto lungo in misto lana, colore cammello classico. Molto caldo e foderato internamente. Presenta tutti i bottoni originali. Un classico intramontabile.', 40.00),
(7, 2, 'Camicetta Seta Verde', 'Vera seta 100%, colore verde smeraldo. Molto delicata, richiede lavaggio a mano. Ha un... bottone di ricambio cucito all’interno.', 22.00),
(8, 2, 'Shorts Denim Strappati', 'Pantaloncini corti con strappi decorativi e borchie sulle tasche posteriori. Ideali per festival estivi. Marca Tally Weijl.', 10.00),
(9, 2, 'Felpa Rosa con Cappuccio', 'Marca H&M, interno felpato. Colore rosa pastello. Molto comoda per stare in casa o per andare a scuola. Non presenta macchie.', 16.00),
(10, 2, 'Gonna Plissettata Midi', 'Gonna a pieghe colore argento metallizzato. Molto particolare, attira l’attenzione. Elastico in vita molto morbido, veste dalla S alla L.', 15.00),
(11, 2, 'Body Pizzo Nero Intimissimi', 'Body elegante con dettagli in pizzo trasparente sulle maniche. Chiusura con gancetti sul fondo. Usato solo per un set fotografico.', 12.00),
(12, 2, 'Salopette Velluto Marrone', 'Salopette a gonnellina in velluto a coste fini. Colore marrone cioccolato. Sta benissimo sopra un dolcevita bianco o nero.', 25.00),
(13, 2, 'T-shirt Oversize Grafica', 'Maglia molto larga con stampa di un anime giapponese. Il cotone è pesante e di qualità. Perfetta per amanti del genere urban/otaku.', 10.00),
(14, 2, 'Maglione Natalizio Funny', 'Classico maglione di Natale con una renna che ha il naso 3D. Usato solo per il pranzo di Natale dell’anno scorso. Fa molta simpatia.', 8.00),
(15, 2, 'Piumino Corto Bianco', 'Giaccone imbottito stile puffer jacket. Molto caldo nonostante sia corto. Il colore bianco è ancora brillante, trattato sempre in tintoria.', 30.00),

-- Categoria 3: Scarpe (36-50)
(16, 3, 'Nike Air Force 1 42', 'Le iconiche sneakers bianche. Sono state usate, quindi presentano le classiche pieghe sulla punta, ma sono state interamente igienizzate e pulite a fondo.', 50.00),
(17, 3, 'Dr. Martens 1460 Neri', 'Anfibi a 8 buchi in pelle Smooth. Sono ancora un po’ rigidi perché usati pochissimo, devono ancora prendere la forma del piede. Taglia 38.', 70.00),
(18, 3, 'Vans Old Skool', 'Le classiche scarpe da skate con la striscia laterale bianca. La suola è leggermente consumata sul tallone, ma hanno ancora molta vita davanti. Taglia 40.', 25.00),
(19, 3, 'Scarpe Calcetto Puma', 'Modello Future per campi sintetici. I tacchetti sono praticamente nuovi. Colore arancione fluo per non passare inosservati in campo. Taglia 43.', 30.00),
(20, 3, 'Stivaletti Pelle Marroni', 'Stivaletti tipo Chelsea con elastico laterale. Vera pelle, marca Timberland. Molto comodi per camminare tutto il giorno. Taglia 39.', 40.00),
(1, 3, 'Converse All Star Alte', 'Colore bianco ottico. Presentano i classici segni neri sulla gomma tipici delle Converse usate, che le rendono ancora più affascinanti. Taglia 41.', 35.00),
(2, 3, 'Sandali Zeppa Estivi', 'Sandali con zeppa in corda (stile espadrillas). Molto leggeri, allacciatura alla caviglia con cinturino in cuoio. Ideali per il mare.', 15.00),
(3, 3, 'Mocassini Neri Pelle', 'Scarpa classica da cerimonia o per esami. Pelle lucida nera, suola in cuoio. Indossati solo tre volte. Marca Geox (traspiranti). Taglia 44.', 45.00),
(4, 3, 'Asics Gel Kayano', 'Scarpe da running professionali per chi ha problemi di pronazione. Ammortizzazione eccezionale. Hanno percorso circa 50km, praticamente nuove. Taglia 42.', 30.00),
(5, 3, 'Ciabatte Adidas Adilette', 'Le classiche ciabatte da piscina o doccia. Colore blu con strisce bianche. Indistruttibili e facilissime da pulire. Taglia 45.', 10.00),
(6, 3, 'Tacchi Neri Decollete', 'Scarpe con tacco a spillo 10cm. Punta sfilata, scamosciate. Ideali per un colloquio o una cena elegante. Nessun graffio sul tacco. Taglia 38.', 25.00),
(7, 3, 'Scarponcini Timberland 43', 'Modello classico giallo ocra. Impermeabili (Waterproof). La pelle è leggermente segnata dal tempo ma non ha tagli. Suola a carrarmato perfetta.', 60.00),
(8, 3, 'Jordan 1 Mid Grey', 'Sneakers da collezione colore grigio e bianco. La scatola originale è inclusa nel prezzo. Usate solo in interni, la suola è pulitissima. Taglia 40.', 80.00),
(9, 3, 'Scarpe Antinfortunistiche', 'Scarpe da lavoro con punta in acciaio e suola anti-perforazione. Marca U-Power, molto leggere rispetto alla media. Usate per un mese di stage. Taglia 42.', 20.00),
(10, 3, 'Ballerine Rosse Vernice', 'Scarpe basse molto femminili. Colore rosso acceso lucido. Piccola decorazione a fiocco sulla punta. Comode per le giornate a scuola. Taglia 39.', 12.00),

-- Categoria 4: Accessori (51-65)
(11, 4, 'Zaino Eastpak Nero', 'Lo zaino scolastico per eccellenza. Cerniere perfettamente funzionanti, spallacci non sfilacciati. Ha solo una piccola scritta a pennarello all’interno.', 20.00),
(12, 4, 'Borsa Michael Kors', 'Borsa a mano originale in pelle saffiano nera. Include la tracolla rimovibile. L’interno è pulito e senza macchie di trucco. Un vero affare.', 50.00),
(13, 4, 'Ray-Ban Wayfarer', 'Occhiali da sole iconici. Montatura nera lucida, lenti verdi G-15. Non presentano graffi sulle lenti. Custodia originale inclusa.', 45.00),
(14, 4, 'Cintura Pelle Nera', 'Cintura artigianale in vera pelle bovina. Fibbia in metallo satinato. Lunghezza 110cm, fori aggiuntivi fatti con la fustellatrice professionale.', 15.00),
(15, 4, 'Cappellino New Era NY', 'Berretto con visiera piatta (Snapback). Colore blu navy con logo NY bianco ricamato in rilievo. Adesivo originale sulla visiera ancora presente.', 10.00),
(16, 4, 'Casio Vintage Digital', 'Orologio digitale color oro. Funzione cronometro, sveglia e luce notturna. Cinturino regolabile senza bisogno di attrezzi. Batteria appena cambiata.', 25.00),
(17, 4, 'Sciarpa Lana Tartan', 'Sciarpa molto lunga con fantasia a quadri scozzesi. Misto lana/acrilico per evitare prurito sul collo. Caldissima e colorata.', 12.00),
(18, 4, 'Portafoglio Pelle Uomo', 'Marca Piquadro, con protezione RFID per le carte di credito. Molti scomparti per tessere e portamonete con clip. Segni minimi di usura.', 18.00),
(19, 4, 'Borsone Palestra Nike', 'Capienza 40 litri, scomparto separato per le scarpe sporche. Tracolla imbottita per un trasporto confortevole. Colore grigio scuro.', 22.00),
(20, 4, 'Collana Acciaio Croce', 'Catenina in acciaio inossidabile che non annerisce con l’acqua. Pendente a forma di croce stilizzata. Chiusura a moschettone molto sicura.', 8.00),
(1, 4, 'Bracciale Cuoio Intrecciato', 'Bracciale maschile fatto a mano in Italia. Chiusura magnetica in acciaio. Stile etnico/boho, perfetto per la stagione estiva.', 5.00),
(2, 4, 'Zainetto Ecopelle Donna', 'Zaino piccolo da passeggio, non adatto per i libri di scuola ma perfetto per uscire. Colore rosa cipria con nappina decorativa sulla zip.', 16.00),
(3, 4, 'Ombrello Compatto Perletti', 'Ombrello da borsa molto resistente al vento. Apertura automatica tramite pulsante. Fantasia a pois bianchi su fondo nero. Custodia inclusa.', 6.00),
(4, 4, 'Guanti Touch Invernali', 'Guanti neri con inserti sulle dita per usare lo smartphone senza toglierli. Palmo antiscivolo per guidare meglio lo scooter.', 10.00),
(5, 4, 'Cravatta Seta Blu Navy', 'Cravatta classica da uomo, larghezza 8cm. Pura seta jacquard. Ideale per esami di stato o matrimoni. Senza macchie né pieghe.', 12.00),

-- Categoria 5: Libri e Appunti (66-80)
(6, 5, 'Matematica Blu 2.0 Vol 3', 'Manuale per liceo scientifico. Il libro è tenuto bene, ma ci sono diverse sottolineature con evidenziatore giallo nei primi capitoli. Esercizi non svolti.', 15.00),
(7, 5, 'Appunti Informatica C++', 'Oltre 50 pagine di appunti presi al computer e stampati. Coprono puntatori, classi, ereditarietà e gestione file. Includono esempi di codice pronti.', 5.00),
(8, 5, 'Libro Storia Contemporanea', 'Volume per il quinto anno. Copertina leggermente rovinata sugli angoli ma pagine interne perfette. Include mappe concettuali fatte da me.', 12.00),
(9, 5, 'Riassunti Filosofia Kant', 'Riassunti schematici della Critica della Ragion Pura e Pratica. Molto utili per il ripasso pre-interrogazione. Scrittura chiara e leggibile.', 3.00),
(10, 5, 'Dizionario Latino Castiglioni', 'Il mitico vocabolario IL. È la versione con CD-ROM. Esternamente è vissuto, ma non mancano pagine e la rilegatura tiene ancora bene.', 40.00),
(11, 5, 'Fisica di Amaldi Biennio', 'Libro di testo per il primo e secondo anno delle superiori. Spiegazioni semplici ed esercizi guidati. Tenuto in modo manuale.', 14.00),
(12, 5, 'Appunti Sistemi e Reti 5a', 'Tutto il programma di quinta: protocollo TCP/IP, livelli ISO/OSI e configurazione router. Molto dettagliati con diagrammi disegnati a mano.', 5.00),
(13, 5, 'Libro Inglese B2 Cambridge', 'Preparazione per la certificazione First (FCE). Alcuni esercizi sono scritti a matita (facilmente cancellabili). Include il CD audio.', 18.00),
(14, 5, 'Mappe Diritto Pubblico', 'Mappe concettuali colorate su Costituzione e organi dello Stato. Ideali per chi ha memoria visiva e deve preparare l’esame di maturità.', 4.00),
(15, 5, 'Divina Commedia Commentata', 'Edizione scolastica dell’Inferno. Ogni canto ha un’introduzione e note a piè di pagina molto profonde per capire ogni metafora di Dante.', 20.00),
(16, 5, 'Appunti Elettronica Analogica', 'Schemi di circuiti con amplificatori operazionali, transistor e filtri. Appunti presi durante le ore di laboratorio al Vallauri.', 6.00),
(17, 5, 'Vocabolario Zanichelli ITA', 'Il classico vocabolario della lingua italiana. Edizione di qualche anno fa ma le parole sono sempre quelle! Peso considerevole, spedizione raccomandata.', 35.00),
(18, 5, 'Scienze della Terra Libro', 'Libro su minerali, vulcani e tettonica delle placche. Molte illustrazioni a colori. Non ha scritte né sottolineature, come nuovo.', 10.00),
(19, 5, 'Promessi Sposi Riassunti', 'Riassunto capitolo per capitolo del romanzo di Manzoni. Analisi dei personaggi principali e dei temi cristiani. Salva-vita per i compiti in classe.', 2.00),
(20, 5, 'Guida Test Medicina 2024', 'Manuale Alpha Test aggiornato alle ultime modalità di ammissione. Include centinaia di quiz commentati e simulazioni d’esame complessive.', 22.00),

-- Categoria 6: Elettronica (81-90)
(1, 6, 'iPhone 11 64GB Black', 'Telefono usato per due anni. Lo schermo è originale e non ha graffi (sempre usato con pellicola). La batteria è all’85%. Fornisco solo il cavetto USB.', 150.00),
(2, 6, 'Cuffie Sony Bluetooth', 'Modello noise cancelling (cancellazione del rumore). Batteria infinita (fino a 30 ore). I cuscinetti sono stati appena sostituiti con ricambi nuovi.', 35.00),
(3, 6, 'Calcolatrice Casio FX', 'Calcolatrice scientifica non programmabile ammessa agli esami di maturità. Alimentazione solare e a batteria. Molto affidabile nei calcoli complessi.', 12.00),
(4, 6, 'Cover iPhone 13 Pro', 'Cover originale Apple in silicone colore Blu Abisso. Presenta una piccola crepa nell’angolo inferiore destro che non pregiudica la protezione.', 5.00),
(5, 6, 'Mouse Wireless Logitech', 'Mouse silenzioso ideale per l’università o la biblioteca. Connessione tramite ricevitore USB incluso. Molto ergonomico e leggero.', 10.00),
(6, 6, 'Tastiera Meccanica RGB', 'Switch Blue (fanno molto rumore, stile macchina da scrivere). Retroilluminazione personalizzabile con mille colori. Layout interamente in italiano.', 40.00),
(7, 6, 'Powerbank 20000mAh', 'Batteria esterna enorme, permette di caricare il telefono 4-5 volte. Ha due porte USB e una Type-C. Abbastanza pesante da portare in zaino.', 15.00),
(8, 6, 'Cavo USB-C Anker 2m', 'Cavo di ricarica molto lungo e rinforzato in nylon. Supporta la ricarica rapida Power Delivery. Indistruttibile rispetto ai cavi originali.', 4.00),
(9, 6, 'Monitor Samsung 24" HD', 'Schermo per PC con ingresso HDMI e VGA. Nessun pixel bruciato. Ideale come secondo monitor per studiare o per giocare con la console di casa.', 60.00),
(10, 6, 'Xiaomi Mi Band 6', 'Smartwatch per il fitness. Conta passi, battito cardiaco e ossigenazione del sangue. Cinturino nero originale + uno di ricambio rosso.', 18.00),

-- Categoria 7: Ripetizioni (91-100)
(11, 7, 'Ripetizioni Matematica', 'Studente del quarto anno offre aiuto per recuperare debiti o preparare verifiche su limiti, derivate e integrali. Massima pazienza garantita.', 15.00),
(12, 7, 'Lezioni Inglese B2', 'Ragazzo certificato Cambridge offre conversazione e aiuto per la grammatica inglese. Posso aiutare anche con la letteratura per il liceo.', 12.00),
(13, 7, 'Corso Base C++ / Java', 'Ti insegno a programmare da zero o ti aiuto con i progetti scolastici. Spiegazione chiara di cicli, array e programmazione a oggetti.', 20.00),
(14, 7, 'Fisica Biennio Aiuto', 'Problemi con i vettori, le forze o l’energia? Contattami! Spiego la teoria applicandola subito agli esercizi del tuo libro di testo.', 15.00),
(15, 7, 'Preparazione Verifica Storia', 'Ti aiuto a creare schemi e mappe per memorizzare date e concetti storici importanti. Metodo di studio rapido ed efficace per le interrogazioni.', 10.00),
(16, 7, 'Chimica Organica/Inorg.', 'Lezioni private per istituti tecnici. Bilanciamento reazioni, moli e configurazione elettronica spiegati in modo estremamente semplice.', 15.00),
(17, 7, 'Conversazione Spagnolo', 'Madrelingua spagnola disponibile per fare conversazione via webcam per migliorare la tua fluidità e pronuncia. Orari flessibili da concordare.', 12.00),
(18, 7, 'Photoshop per Principianti', 'Ti insegno le basi del fotoritocco: livelli, maschere e scontornamento oggetti. Utile per chi vuole iniziare nel mondo della grafica.', 18.00),
(19, 7, 'Supporto Tesina Maturità', 'Aiuto nella stesura dei testi e nei collegamenti tra le materie per la tua tesina o presentazione orale. Revisione testi complessiva inclusa.', 25.00),
(20, 7, 'Diritto ed Economia Politica', 'Spiegazione del funzionamento dello Stato, dei contratti e dei mercati economici. Supporto specifico per ragazzi di ragioneria.', 15.00);


-- 7. POPOLAMENTO LEZIONI (Collegate ai prodotti da 91 a 100)
INSERT INTO lezione (id_prodotto, materia, durata, tipo, link_url) VALUES
(91, 'Matematica', 60, 'online', 'https://meet.google.com/xyz-math-abc'),
(92, 'Inglese', 60, 'vivo', NULL),
(93, 'Informatica', 90, 'online', 'https://meet.google.com/code-java-123'),
(94, 'Fisica', 60, 'vivo', NULL),
(95, 'Storia', 45, 'online', 'https://zoom.us/j/987654321'),
(96, 'Chimica', 60, 'vivo', NULL),
(97, 'Spagnolo', 60, 'online', 'https://meet.google.com/hola-amigos-456'),
(98, 'Grafica', 60, 'online', 'https://meet.google.com/design-tips-789'),
(99, 'Tutte', 120, 'vivo', NULL),
(100, 'Diritto', 60, 'online', 'https://meet.google.com/legis-study-321');


-- 8. COLLEGAMENTO TAG_PRODOTTO (Relazioni casuali ma sensate)
INSERT INTO tag_prodotto (id_tag, id_prodotto) VALUES
-- vintage (id_tag 1)
(1, 5), (1, 8), (1, 10), (1, 15), (1, 17), (1, 21), (1, 56),
-- nuovo con cartellino (id_tag 2)
(2, 18), (2, 43), (2, 88),
-- usato in ottime condizioni (id_tag 3)
(3, 1), (3, 2), (3, 7), (3, 11), (3, 36), (3, 81), (3, 89),
-- streetwear (id_tag 4) e sport (id_tag 6)
(4, 2), (4, 11), (4, 13), (4, 15), (6, 6), (6, 14), (6, 22), (6, 39), (6, 44), (6, 59),
-- nike (8), zara (9), apple (10)
(8, 2), (8, 22), (8, 36), (8, 59), (9, 4), (9, 18), (10, 81), (10, 84),
-- matematica (11), informatica (12), scuola (14)
(11, 66), (11, 91), (12, 7), (12, 72), (12, 93), (14, 7), (14, 66), (14, 68), (14, 70), (14, 83), (14, 95);


-- 9. INSERIMENTO PREFERITI
INSERT INTO preferiti (id_utente, id_prodotto) VALUES
(1, 16), (1, 36), (1, 81),   -- Mario ha tra i preferiti un vestito da donna, scarpe Nike e l'iPhone 11
(2, 5), (2, 11), (2, 66),     -- Luigi preferisce la giacca North face, la felpa Champion e il libro di matematica
(3, 1), (3, 4), (3, 51),      -- Giulia ha salvato maglietta, camicia e zaino Eastpak
(4, 84), (4, 91),             -- Francesca segue la cover Apple e le ripetizioni di matematica
(5, 21), (5, 38),             -- Alessandro osserva la giacca jeans custom e le Vans
(10, 7), (10, 93), (10, 100), -- Sara segue gli appunti di C++ e le lezioni di informatica e diritto
(19, 12), (19, 13), (19, 81); -- Luca segue jeans neri, giacca di pelle e l'iPhone
