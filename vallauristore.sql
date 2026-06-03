-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Giu 02, 2026 alle 17:54
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vallauristore`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `categorie`
--

CREATE TABLE `categorie` (
  `id_categoria` int(11) NOT NULL,
  `nomeCategoria` varchar(50) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `categorie`
--

INSERT INTO `categorie` (`id_categoria`, `nomeCategoria`, `descrizione`) VALUES
(1, 'Abbigliamento Uomo', 'Magliette, felpe, pantaloni, giacche per ragazzo/uomo'),
(2, 'Abbigliamento Donna', 'Vestiti, gonne, top, jeans per ragazza/donna'),
(3, 'Scarpe', 'Sneakers, stivali, scarpe eleganti, scarpe da calcio'),
(4, 'Accessori', 'Borse, zaini, occhiali da sole, cinture, cappelli'),
(5, 'Libri e Appunti', 'Libri scolastici usati, riassunti, mappe concettuali'),
(6, 'Elettronica', 'Smartphone, cuffie, calcolatrici scientifiche, pc'),
(7, 'Ripetizioni', 'Lezioni private, aiuto compiti e tutoraggio');

-- --------------------------------------------------------

--
-- Struttura della tabella `immagini_prodotto`
--

CREATE TABLE `immagini_prodotto` (
  `id_prodotto` int(11) NOT NULL,
  `url_img` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `lezione`
--

CREATE TABLE `lezione` (
  `id_prodotto` int(11) NOT NULL,
  `materia` varchar(100) NOT NULL,
  `durata` int(11) NOT NULL,
  `tipo` enum('online','vivo') NOT NULL,
  `link_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `lezione`
--

INSERT INTO `lezione` (`id_prodotto`, `materia`, `durata`, `tipo`, `link_url`) VALUES
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

-- --------------------------------------------------------

--
-- Struttura della tabella `messaggi`
--

CREATE TABLE `messaggi` (
  `id_mess` int(11) NOT NULL,
  `id_mittente` int(11) NOT NULL,
  `id_destinatario` int(11) NOT NULL,
  `id_prodotto` int(11) NOT NULL,
  `testo_messaggio` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `preferiti`
--

CREATE TABLE `preferiti` (
  `id_utente` int(11) NOT NULL,
  `id_prodotto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `preferiti`
--

INSERT INTO `preferiti` (`id_utente`, `id_prodotto`) VALUES
(1, 16),
(1, 36),
(1, 81),
(2, 5),
(2, 11),
(2, 66),
(3, 1),
(3, 4),
(3, 51),
(4, 84),
(4, 91),
(5, 21),
(5, 38),
(10, 7),
(10, 93),
(10, 100),
(19, 12),
(19, 13),
(19, 81);

-- --------------------------------------------------------

--
-- Struttura della tabella `prodotto`
--

CREATE TABLE `prodotto` (
  `id_prodotto` int(11) NOT NULL,
  `id_venditore` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descrizione` text NOT NULL,
  `prezzo` decimal(10,2) NOT NULL,
  `data_pubblicazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `prodotto`
--

INSERT INTO `prodotto` (`id_prodotto`, `id_venditore`, `id_categoria`, `nome`, `descrizione`, `prezzo`, `data_pubblicazione`) VALUES
(1, 1, 1, 'T-shirt Bianca Basic H&M', 'T-shirt in cotone organico 100%, vestibilità slim fit. È stata lavata solo un paio di volte, non presenta macchie né buchi. Ideale come sotto-giacca o per un look casual estivo.', 5.00, '2026-05-19 20:57:41'),
(2, 2, 1, 'Felpa Nera con Cappuccio Nike', 'Felpa originale Nike in ottime condizioni. Il tessuto interno è ancora molto morbido. Presenta una leggera scoloritura sui polsini dovuta ai lavaggi, ma il colore generale è ancora un nero intenso.', 15.00, '2026-05-19 20:57:41'),
(3, 3, 1, 'Jeans Levi’s 511 Taglia 44', 'Modello slim stretch, colore blu denim classico. Presenta un effetto vissuto naturale sulle ginocchia. L’orlo è originale e non è mai stato accorciato. Ottimo affare per chi cerca un jeans resistente.', 20.00, '2026-05-19 20:57:41'),
(4, 4, 1, 'Camicia a Quadri Flanella', 'Camicia pesante ideale per l’autunno o l’inverno. Marca Zara, taglia L. I bottoni sono tutti originali e presenti. Molto calda e comoda da indossare sopra una maglietta.', 12.00, '2026-05-19 20:57:41'),
(5, 5, 1, 'Giacca a Vento The North Face', 'Modello vintage anni 90, perfettamente impermeabile. Ha una piccola scucitura interna nella tasca sinistra, ma esternamente è immacolata. Colore giallo e nero molto acceso.', 45.00, '2026-05-19 20:57:41'),
(6, 6, 1, 'Pantaloncini Adidas Running', 'Shorts sportivi con slip interno integrato. Colore blu elettrico con strisce bianche laterali. Usati solo per una stagione di atletica, elastico in via ancora perfetto.', 10.00, '2026-05-19 20:57:41'),
(7, 7, 1, 'Maglione Lana Merino Grigio', 'Marca Benetton, lana molto pregiata che non punge. Scollo a V, ideale da mettere sopra una camicia per andare a scuola o in ufficio. Non presenta pallini di lana.', 25.00, '2026-05-19 20:57:41'),
(8, 8, 1, 'Polo Lacoste Vintage', 'Polo originale colore bordeaux. Taglia 4 (corrisponde a una M/L). Il colletto è leggermente rigido come da modello classico. Un pezzo intramontabile per ogni guardaroba.', 18.00, '2026-05-19 20:57:41'),
(9, 9, 1, 'Pantaloni Chino Grigi', 'Marca Pull&Bear, tessuto leggero estivo. Vestibilità tapered (larghi sulla coscia e stretti alla caviglia). Senza segni di usura, sembrano appena usciti dal negozio.', 22.00, '2026-05-19 20:57:41'),
(10, 10, 1, 'T-shirt Pink Floyd Vintage', 'Maglietta con stampa Dark Side of the Moon. Effetto slavato voluto dal produttore. Il tessuto è molto sottile e fresco, perfetta per i concerti o il tempo libero.', 8.00, '2026-05-19 20:57:41'),
(11, 11, 1, 'Felpa Champion Grigia', 'Modello Reverse Weave, molto pesante e resistente. Il logo sul petto è ricamato perfettamente. Ha una piccola macchia di candeggina quasi invisibile vicino all’orlo inferiore.', 14.00, '2026-05-19 20:57:41'),
(12, 12, 1, 'Jeans Neri Skinny Jack & Jones', 'Jeans molto elasticizzati, si adattano bene alla gamba. Il colore nero non è sbiadito. Chiusura con bottoni invece della zip. Taglia W32 L32.', 16.00, '2026-05-19 20:57:41'),
(13, 13, 1, 'Giacca Ecopelle Rock', 'Giacca stile biker con molte zip e fibbie. L’ecopelle è di alta qualità e non si screpola. Molto aggressiva, ideale per chi ama lo stile motociclista.', 30.00, '2026-05-19 20:57:41'),
(14, 14, 1, 'Canotta Basket Jordan', 'Maglia da basket traspirante, numero 23. Colore rosso Bulls. Usata solo per giocare al parchetto un paio di volte. Nessun filo tirato.', 15.00, '2026-05-19 20:57:41'),
(15, 15, 1, 'Tuta Acetato Anni 2000', 'Completo giacca e pantalone marca Lotto. Stile molto retrò, bande laterali bianche su fondo blu scuro. Comoda per lo sport o come outfit streetwear.', 20.00, '2026-05-19 20:57:41'),
(16, 16, 2, 'Vestito Estivo a Fiori', 'Abito leggero in viscosa, marca Bershka. Fantasia floreale su fondo bianco. Lunghezza sopra il ginocchio, molto fresco per le giornate calde di luglio.', 18.00, '2026-05-19 20:57:41'),
(17, 17, 2, 'Gonna di Jeans Levis', 'Gonna corta ottenuta dal riciclo di un paio di jeans vintage. Orlo a vivo sfrangiato. Molto stilosa, perfetta con un paio di anfibi.', 12.00, '2026-05-19 20:57:41'),
(18, 18, 2, 'Crop Top Nero Zara', 'Top corto con spalline sottili regolabili. Tessuto a costine molto elastico. Mai usato, ancora con l’etichetta attaccata. Taglia S.', 5.00, '2026-05-19 20:57:41'),
(19, 19, 2, 'Mom Jeans a Vita Alta', 'Marca Stradivarius, vestibilità comoda sui fianchi. Colore azzurro chiaro slavato. Non presenta difetti, le tasche sono integre e la cerniera scorre bene.', 20.00, '2026-05-19 20:57:41'),
(20, 20, 2, 'Cardigan Beige Oversize', 'Lavorazione a maglia grossa, molto caldo e avvolgente. Non ha bottoni, si porta aperto. Ideale da usare sopra un vestitino nelle serate fresche.', 15.00, '2026-05-19 20:57:41'),
(21, 1, 2, 'Giacca Jeans Custom', 'Giacca di jeans con patch ricamate sulla schiena (fiori e scritte). Un pezzo unico fatto a mano. Il denim è di quelli pesanti di una volta.', 25.00, '2026-05-19 20:57:41'),
(22, 2, 2, 'Leggings Nike Pro', 'Leggings tecnici per palestra o corsa. Tessuto traspirante Dri-Fit. Hanno la fascia elastica alta in vita che modella la figura. Usati pochissimo.', 14.00, '2026-05-19 20:57:41'),
(23, 3, 2, 'Maglia Righe Stile Parigino', 'Maglietta a maniche lunghe con righe bianche e blu. Scollo a barchetta. Molto elegante nella sua semplicità, marca Petit Bateau.', 8.00, '2026-05-19 20:57:41'),
(24, 4, 2, 'Abito da Sera Elegante', 'Vestito lungo rosso in satin, ideale per una diciottesima o un evento formale. Scollo a cuore e spacco laterale. Indossato solo per una serata.', 35.00, '2026-05-19 20:57:41'),
(25, 5, 2, 'Pantaloni Palazzo Neri', 'Pantaloni eleganti a gamba larga in tessuto fluido. Non si stropicciano mai, ottimi per chi viaggia o per la scuola. Taglia M.', 18.00, '2026-05-19 20:57:41'),
(26, 6, 2, 'Cappotto Invernale Cammello', 'Cappotto lungo in misto lana, colore cammello classico. Molto caldo e foderato internamente. Presenta tutti i bottoni originali. Un classico intramontabile.', 40.00, '2026-05-19 20:57:41'),
(27, 7, 2, 'Camicetta Seta Verde', 'Vera seta 100%, colore verde smeraldo. Molto delicata, richiede lavaggio a mano. Ha un... bottone di ricambio cucito all’interno.', 22.00, '2026-05-19 20:57:41'),
(28, 8, 2, 'Shorts Denim Strappati', 'Pantaloncini corti con strappi decorativi e borchie sulle tasche posteriori. Ideali per festival estivi. Marca Tally Weijl.', 10.00, '2026-05-19 20:57:41'),
(29, 9, 2, 'Felpa Rosa con Cappuccio', 'Marca H&M, interno felpato. Colore rosa pastello. Molto comoda per stare in casa o per andare a scuola. Non presenta macchie.', 16.00, '2026-05-19 20:57:41'),
(30, 10, 2, 'Gonna Plissettata Midi', 'Gonna a pieghe colore argento metallizzato. Molto particolare, attira l’attenzione. Elastico in vita molto morbido, veste dalla S alla L.', 15.00, '2026-05-19 20:57:41'),
(31, 11, 2, 'Body Pizzo Nero Intimissimi', 'Body elegante con dettagli in pizzo trasparente sulle maniche. Chiusura con gancetti sul fondo. Usato solo per un set fotografico.', 12.00, '2026-05-19 20:57:41'),
(32, 12, 2, 'Salopette Velluto Marrone', 'Salopette a gonnellina in velluto a coste fini. Colore marrone cioccolato. Sta benissimo sopra un dolcevita bianco o nero.', 25.00, '2026-05-19 20:57:41'),
(33, 13, 2, 'T-shirt Oversize Grafica', 'Maglia molto larga con stampa di un anime giapponese. Il cotone è pesante e di qualità. Perfetta per amanti del genere urban/otaku.', 10.00, '2026-05-19 20:57:41'),
(34, 14, 2, 'Maglione Natalizio Funny', 'Classico maglione di Natale con una renna che ha il naso 3D. Usato solo per il pranzo di Natale dell’anno scorso. Fa molta simpatia.', 8.00, '2026-05-19 20:57:41'),
(35, 15, 2, 'Piumino Corto Bianco', 'Giaccone imbottito stile puffer jacket. Molto caldo nonostante sia corto. Il colore bianco è ancora brillante, trattato sempre in tintoria.', 30.00, '2026-05-19 20:57:41'),
(36, 16, 3, 'Nike Air Force 1 42', 'Le iconiche sneakers bianche. Sono state usate, quindi presentano le classiche pieghe sulla punta, ma sono state interamente igienizzate e pulite a fondo.', 50.00, '2026-05-19 20:57:41'),
(37, 17, 3, 'Dr. Martens 1460 Neri', 'Anfibi a 8 buchi in pelle Smooth. Sono ancora un po’ rigidi perché usati pochissimo, devono ancora prendere la forma del piede. Taglia 38.', 70.00, '2026-05-19 20:57:41'),
(38, 18, 3, 'Vans Old Skool', 'Le classiche scarpe da skate con la striscia laterale bianca. La suola è leggermente consumata sul tallone, ma hanno ancora molta vita davanti. Taglia 40.', 25.00, '2026-05-19 20:57:41'),
(39, 19, 3, 'Scarpe Calcetto Puma', 'Modello Future per campi sintetici. I tacchetti sono praticamente nuovi. Colore arancione fluo per non passare inosservati in campo. Taglia 43.', 30.00, '2026-05-19 20:57:41'),
(40, 20, 3, 'Stivaletti Pelle Marroni', 'Stivaletti tipo Chelsea con elastico laterale. Vera pelle, marca Timberland. Molto comodi per camminare tutto il giorno. Taglia 39.', 40.00, '2026-05-19 20:57:41'),
(41, 1, 3, 'Converse All Star Alte', 'Colore bianco ottico. Presentano i classici segni neri sulla gomma tipici delle Converse usate, che le rendono ancora più affascinanti. Taglia 41.', 35.00, '2026-05-19 20:57:41'),
(42, 2, 3, 'Sandali Zeppa Estivi', 'Sandali con zeppa in corda (stile espadrillas). Molto leggeri, allacciatura alla caviglia con cinturino in cuoio. Ideali per il mare.', 15.00, '2026-05-19 20:57:41'),
(43, 3, 3, 'Mocassini Neri Pelle', 'Scarpa classica da cerimonia o per esami. Pelle lucida nera, suola in cuoio. Indossati solo tre volte. Marca Geox (traspiranti). Taglia 44.', 45.00, '2026-05-19 20:57:41'),
(44, 4, 3, 'Asics Gel Kayano', 'Scarpe da running professionali per chi ha problemi di pronazione. Ammortizzazione eccezionale. Hanno percorso circa 50km, praticamente nuove. Taglia 42.', 30.00, '2026-05-19 20:57:41'),
(45, 5, 3, 'Ciabatte Adidas Adilette', 'Le classiche ciabatte da piscina o doccia. Colore blu con strisce bianche. Indistruttibili e facilissime da pulire. Taglia 45.', 10.00, '2026-05-19 20:57:41'),
(46, 6, 3, 'Tacchi Neri Decollete', 'Scarpe con tacco a spillo 10cm. Punta sfilata, scamosciate. Ideali per un colloquio o una cena elegante. Nessun graffio sul tacco. Taglia 38.', 25.00, '2026-05-19 20:57:41'),
(47, 7, 3, 'Scarponcini Timberland 43', 'Modello classico giallo ocra. Impermeabili (Waterproof). La pelle è leggermente segnata dal tempo ma non ha tagli. Suola a carrarmato perfetta.', 60.00, '2026-05-19 20:57:41'),
(48, 8, 3, 'Jordan 1 Mid Grey', 'Sneakers da collezione colore grigio e bianco. La scatola originale è inclusa nel prezzo. Usate solo in interni, la suola è pulitissima. Taglia 40.', 80.00, '2026-05-19 20:57:41'),
(49, 9, 3, 'Scarpe Antinfortunistiche', 'Scarpe da lavoro con punta in acciaio e suola anti-perforazione. Marca U-Power, molto leggere rispetto alla media. Usate per un mese di stage. Taglia 42.', 20.00, '2026-05-19 20:57:41'),
(50, 10, 3, 'Ballerine Rosse Vernice', 'Scarpe basse molto femminili. Colore rosso acceso lucido. Piccola decorazione a fiocco sulla punta. Comode per le giornate a scuola. Taglia 39.', 12.00, '2026-05-19 20:57:41'),
(51, 11, 4, 'Zaino Eastpak Nero', 'Lo zaino scolastico per eccellenza. Cerniere perfettamente funzionanti, spallacci non sfilacciati. Ha solo una piccola scritta a pennarello all’interno.', 20.00, '2026-05-19 20:57:41'),
(52, 12, 4, 'Borsa Michael Kors', 'Borsa a mano originale in pelle saffiano nera. Include la tracolla rimovibile. L’interno è pulito e senza macchie di trucco. Un vero affare.', 50.00, '2026-05-19 20:57:41'),
(53, 13, 4, 'Ray-Ban Wayfarer', 'Occhiali da sole iconici. Montatura nera lucida, lenti verdi G-15. Non presentano graffi sulle lenti. Custodia originale inclusa.', 45.00, '2026-05-19 20:57:41'),
(54, 14, 4, 'Cintura Pelle Nera', 'Cintura artigianale in vera pelle bovina. Fibbia in metallo satinato. Lunghezza 110cm, fori aggiuntivi fatti con la fustellatrice professionale.', 15.00, '2026-05-19 20:57:41'),
(55, 15, 4, 'Cappellino New Era NY', 'Berretto con visiera piatta (Snapback). Colore blu navy con logo NY bianco ricamato in rilievo. Adesivo originale sulla visiera ancora presente.', 10.00, '2026-05-19 20:57:41'),
(56, 16, 4, 'Casio Vintage Digital', 'Orologio digitale color oro. Funzione cronometro, sveglia e luce notturna. Cinturino regolabile senza bisogno di attrezzi. Batteria appena cambiata.', 25.00, '2026-05-19 20:57:41'),
(57, 17, 4, 'Sciarpa Lana Tartan', 'Sciarpa molto lunga con fantasia a quadri scozzesi. Misto lana/acrilico per evitare prurito sul collo. Caldissima e colorata.', 12.00, '2026-05-19 20:57:41'),
(58, 18, 4, 'Portafoglio Pelle Uomo', 'Marca Piquadro, con protezione RFID per le carte di credito. Molti scomparti per tessere e portamonete con clip. Segni minimi di usura.', 18.00, '2026-05-19 20:57:41'),
(59, 19, 4, 'Borsone Palestra Nike', 'Capienza 40 litri, scomparto separato per le scarpe sporche. Tracolla imbottita per un trasporto confortevole. Colore grigio scuro.', 22.00, '2026-05-19 20:57:41'),
(60, 20, 4, 'Collana Acciaio Croce', 'Catenina in acciaio inossidabile che non annerisce con l’acqua. Pendente a forma di croce stilizzata. Chiusura a moschettone molto sicura.', 8.00, '2026-05-19 20:57:41'),
(61, 1, 4, 'Bracciale Cuoio Intrecciato', 'Bracciale maschile fatto a mano in Italia. Chiusura magnetica in acciaio. Stile etnico/boho, perfetto per la stagione estiva.', 5.00, '2026-05-19 20:57:41'),
(62, 2, 4, 'Zainetto Ecopelle Donna', 'Zaino piccolo da passeggio, non adatto per i libri di scuola ma perfetto per uscire. Colore rosa cipria con nappina decorativa sulla zip.', 16.00, '2026-05-19 20:57:41'),
(63, 3, 4, 'Ombrello Compatto Perletti', 'Ombrello da borsa molto resistente al vento. Apertura automatica tramite pulsante. Fantasia a pois bianchi su fondo nero. Custodia inclusa.', 6.00, '2026-05-19 20:57:41'),
(64, 4, 4, 'Guanti Touch Invernali', 'Guanti neri con inserti sulle dita per usare lo smartphone senza toglierli. Palmo antiscivolo per guidare meglio lo scooter.', 10.00, '2026-05-19 20:57:41'),
(65, 5, 4, 'Cravatta Seta Blu Navy', 'Cravatta classica da uomo, larghezza 8cm. Pura seta jacquard. Ideale per esami di stato o matrimoni. Senza macchie né pieghe.', 12.00, '2026-05-19 20:57:41'),
(66, 6, 5, 'Matematica Blu 2.0 Vol 3', 'Manuale per liceo scientifico. Il libro è tenuto bene, ma ci sono diverse sottolineature con evidenziatore giallo nei primi capitoli. Esercizi non svolti.', 15.00, '2026-05-19 20:57:41'),
(67, 7, 5, 'Appunti Informatica C++', 'Oltre 50 pagine di appunti presi al computer e stampati. Coprono puntatori, classi, ereditarietà e gestione file. Includono esempi di codice pronti.', 5.00, '2026-05-19 20:57:41'),
(68, 8, 5, 'Libro Storia Contemporanea', 'Volume per il quinto anno. Copertina leggermente rovinata sugli angoli ma pagine interne perfette. Include mappe concettuali fatte da me.', 12.00, '2026-05-19 20:57:41'),
(69, 9, 5, 'Riassunti Filosofia Kant', 'Riassunti schematici della Critica della Ragion Pura e Pratica. Molto utili per il ripasso pre-interrogazione. Scrittura chiara e leggibile.', 3.00, '2026-05-19 20:57:41'),
(70, 10, 5, 'Dizionario Latino Castiglioni', 'Il mitico vocabolario IL. È la versione con CD-ROM. Esternamente è vissuto, ma non mancano pagine e la rilegatura tiene ancora bene.', 40.00, '2026-05-19 20:57:41'),
(71, 11, 5, 'Fisica di Amaldi Biennio', 'Libro di testo per il primo e secondo anno delle superiori. Spiegazioni semplici ed esercizi guidati. Tenuto in modo manuale.', 14.00, '2026-05-19 20:57:41'),
(72, 12, 5, 'Appunti Sistemi e Reti 5a', 'Tutto il programma di quinta: protocollo TCP/IP, livelli ISO/OSI e configurazione router. Molto dettagliati con diagrammi disegnati a mano.', 5.00, '2026-05-19 20:57:41'),
(73, 13, 5, 'Libro Inglese B2 Cambridge', 'Preparazione per la certificazione First (FCE). Alcuni esercizi sono scritti a matita (facilmente cancellabili). Include il CD audio.', 18.00, '2026-05-19 20:57:41'),
(74, 14, 5, 'Mappe Diritto Pubblico', 'Mappe concettuali colorate su Costituzione e organi dello Stato. Ideali per chi ha memoria visiva e deve preparare l’esame di maturità.', 4.00, '2026-05-19 20:57:41'),
(75, 15, 5, 'Divina Commedia Commentata', 'Edizione scolastica dell’Inferno. Ogni canto ha un’introduzione e note a piè di pagina molto profonde per capire ogni metafora di Dante.', 20.00, '2026-05-19 20:57:41'),
(76, 16, 5, 'Appunti Elettronica Analogica', 'Schemi di circuiti con amplificatori operazionali, transistor e filtri. Appunti presi durante le ore di laboratorio al Vallauri.', 6.00, '2026-05-19 20:57:41'),
(77, 17, 5, 'Vocabolario Zanichelli ITA', 'Il classico vocabolario della lingua italiana. Edizione di qualche anno fa ma le parole sono sempre quelle! Peso considerevole, spedizione raccomandata.', 35.00, '2026-05-19 20:57:41'),
(78, 18, 5, 'Scienze della Terra Libro', 'Libro su minerali, vulcani e tettonica delle placche. Molte illustrazioni a colori. Non ha scritte né sottolineature, come nuovo.', 10.00, '2026-05-19 20:57:41'),
(79, 19, 5, 'Promessi Sposi Riassunti', 'Riassunto capitolo per capitolo del romanzo di Manzoni. Analisi dei personaggi principali e dei temi cristiani. Salva-vita per i compiti in classe.', 2.00, '2026-05-19 20:57:41'),
(80, 20, 5, 'Guida Test Medicina 2024', 'Manuale Alpha Test aggiornato alle ultime modalità di ammissione. Include centinaia di quiz commentati e simulazioni d’esame complessive.', 22.00, '2026-05-19 20:57:41'),
(81, 1, 6, 'iPhone 11 64GB Black', 'Telefono usato per due anni. Lo schermo è originale e non ha graffi (sempre usato con pellicola). La batteria è all’85%. Fornisco solo il cavetto USB.', 150.00, '2026-05-19 20:57:41'),
(82, 2, 6, 'Cuffie Sony Bluetooth', 'Modello noise cancelling (cancellazione del rumore). Batteria infinita (fino a 30 ore). I cuscinetti sono stati appena sostituiti con ricambi nuovi.', 35.00, '2026-05-19 20:57:41'),
(83, 3, 6, 'Calcolatrice Casio FX', 'Calcolatrice scientifica non programmabile ammessa agli esami di maturità. Alimentazione solare e a batteria. Molto affidabile nei calcoli complessi.', 12.00, '2026-05-19 20:57:41'),
(84, 4, 6, 'Cover iPhone 13 Pro', 'Cover originale Apple in silicone colore Blu Abisso. Presenta una piccola crepa nell’angolo inferiore destro che non pregiudica la protezione.', 5.00, '2026-05-19 20:57:41'),
(85, 5, 6, 'Mouse Wireless Logitech', 'Mouse silenzioso ideale per l’università o la biblioteca. Connessione tramite ricevitore USB incluso. Molto ergonomico e leggero.', 10.00, '2026-05-19 20:57:41'),
(86, 6, 6, 'Tastiera Meccanica RGB', 'Switch Blue (fanno molto rumore, stile macchina da scrivere). Retroilluminazione personalizzabile con mille colori. Layout interamente in italiano.', 40.00, '2026-05-19 20:57:41'),
(87, 7, 6, 'Powerbank 20000mAh', 'Batteria esterna enorme, permette di caricare il telefono 4-5 volte. Ha due porte USB e una Type-C. Abbastanza pesante da portare in zaino.', 15.00, '2026-05-19 20:57:41'),
(88, 8, 6, 'Cavo USB-C Anker 2m', 'Cavo di ricarica molto lungo e rinforzato in nylon. Supporta la ricarica rapida Power Delivery. Indistruttibile rispetto ai cavi originali.', 4.00, '2026-05-19 20:57:41'),
(89, 9, 6, 'Monitor Samsung 24\" HD', 'Schermo per PC con ingresso HDMI e VGA. Nessun pixel bruciato. Ideale come secondo monitor per studiare o per giocare con la console di casa.', 60.00, '2026-05-19 20:57:41'),
(90, 10, 6, 'Xiaomi Mi Band 6', 'Smartwatch per il fitness. Conta passi, battito cardiaco e ossigenazione del sangue. Cinturino nero originale + uno di ricambio rosso.', 18.00, '2026-05-19 20:57:41'),
(91, 11, 7, 'Ripetizioni Matematica', 'Studente del quarto anno offre aiuto per recuperare debiti o preparare verifiche su limiti, derivate e integrali. Massima pazienza garantita.', 15.00, '2026-05-19 20:57:41'),
(92, 12, 7, 'Lezioni Inglese B2', 'Ragazzo certificato Cambridge offre conversazione e aiuto per la grammatica inglese. Posso aiutare anche con la letteratura per il liceo.', 12.00, '2026-05-19 20:57:41'),
(93, 13, 7, 'Corso Base C++ / Java', 'Ti insegno a programmare da zero o ti aiuto con i progetti scolastici. Spiegazione chiara di cicli, array e programmazione a oggetti.', 20.00, '2026-05-19 20:57:41'),
(94, 14, 7, 'Fisica Biennio Aiuto', 'Problemi con i vettori, le forze o l’energia? Contattami! Spiego la teoria applicandola subito agli esercizi del tuo libro di testo.', 15.00, '2026-05-19 20:57:41'),
(95, 15, 7, 'Preparazione Verifica Storia', 'Ti aiuto a creare schemi e mappe per memorizzare date e concetti storici importanti. Metodo di studio rapido ed efficace per le interrogazioni.', 10.00, '2026-05-19 20:57:41'),
(96, 16, 7, 'Chimica Organica/Inorg.', 'Lezioni private per istituti tecnici. Bilanciamento reazioni, moli e configurazione elettronica spiegati in modo estremamente semplice.', 15.00, '2026-05-19 20:57:41'),
(97, 17, 7, 'Conversazione Spagnolo', 'Madrelingua spagnola disponibile per fare conversazione via webcam per migliorare la tua fluidità e pronuncia. Orari flessibili da concordare.', 12.00, '2026-05-19 20:57:41'),
(98, 18, 7, 'Photoshop per Principianti', 'Ti insegno le basi del fotoritocco: livelli, maschere e scontornamento oggetti. Utile per chi vuole iniziare nel mondo della grafica.', 18.00, '2026-05-19 20:57:41'),
(99, 19, 7, 'Supporto Tesina Maturità', 'Aiuto nella stesura dei testi e nei collegamenti tra le materie per la tua tesina o presentazione orale. Revisione testi complessiva inclusa.', 25.00, '2026-05-19 20:57:41'),
(100, 20, 7, 'Diritto ed Economia Politica', 'Spiegazione del funzionamento dello Stato, dei contratti e dei mercati economici. Supporto specifico per ragazzi di ragioneria.', 15.00, '2026-05-19 20:57:41');

-- --------------------------------------------------------

--
-- Struttura della tabella `recensioni`
--

CREATE TABLE `recensioni` (
  `id_rec` int(11) NOT NULL,
  `id_mittente` int(11) NOT NULL,
  `id_destinatario` int(11) NOT NULL,
  `voto` int(11) NOT NULL CHECK (`voto` >= 1 and `voto` <= 5),
  `commento` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `segnalazioni`
--

CREATE TABLE `segnalazioni` (
  `id_segn` int(11) NOT NULL,
  `id_segnalatore` int(11) NOT NULL,
  `id_segnalato` int(11) NOT NULL,
  `commento` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `tag`
--

CREATE TABLE `tag` (
  `id_tag` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `tag`
--

INSERT INTO `tag` (`id_tag`, `nome`) VALUES
(10, 'apple'),
(7, 'casual'),
(5, 'elegante'),
(12, 'informatica'),
(13, 'inglese'),
(11, 'matematica'),
(8, 'nike'),
(2, 'nuovo con cartellino'),
(15, 'sconti'),
(14, 'scuola'),
(6, 'sport'),
(4, 'streetwear'),
(3, 'usato in ottime condizioni'),
(1, 'vintage'),
(9, 'zara');

-- --------------------------------------------------------

--
-- Struttura della tabella `tag_prodotto`
--

CREATE TABLE `tag_prodotto` (
  `id_tag` int(11) NOT NULL,
  `id_prodotto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `tag_prodotto`
--

INSERT INTO `tag_prodotto` (`id_tag`, `id_prodotto`) VALUES
(1, 5),
(1, 8),
(1, 10),
(1, 15),
(1, 17),
(1, 21),
(1, 56),
(2, 18),
(2, 43),
(2, 88),
(3, 1),
(3, 2),
(3, 7),
(3, 11),
(3, 36),
(3, 81),
(3, 89),
(4, 2),
(4, 11),
(4, 13),
(4, 15),
(6, 6),
(6, 14),
(6, 22),
(6, 39),
(6, 44),
(6, 59),
(8, 2),
(8, 22),
(8, 36),
(8, 59),
(9, 4),
(9, 18),
(10, 81),
(10, 84),
(11, 66),
(11, 91),
(12, 7),
(12, 72),
(12, 93),
(14, 7),
(14, 66),
(14, 68),
(14, 70),
(14, 83),
(14, 95);

-- --------------------------------------------------------

--
-- Struttura della tabella `utente`
--

CREATE TABLE `utente` (
  `id_utente` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `cognome` varchar(50) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `reset_code` char(6) DEFAULT NULL,
  `reset_code_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utente`
--

INSERT INTO `utente` (`id_utente`, `nome`, `cognome`, `password_hash`, `email`, `google_id`, `reset_code`, `reset_code_expiry`) VALUES
(1, 'Mario', 'Rossi', 'hash123', 'mario.rossi@email.com', NULL, NULL, NULL),
(2, 'Luigi', 'Bianchi', 'hash123', 'luigi.bianchi@email.com', NULL, NULL, NULL),
(3, 'Giulia', 'Verdi', 'hash123', 'giulia.verdi@email.com', NULL, NULL, NULL),
(4, 'Francesca', 'Neri', 'hash123', 'francesca.neri@email.com', NULL, NULL, NULL),
(5, 'Alessandro', 'Gialli', 'hash123', 'alessandro.gialli@email.com', NULL, NULL, NULL),
(6, 'Martina', 'Marrone', 'hash123', 'martina.marrone@email.com', NULL, NULL, NULL),
(7, 'Lorenzo', 'Viola', 'hash123', 'lorenzo.viola@email.com', NULL, NULL, NULL),
(8, 'Chiara', 'Blu', 'hash123', 'chiara.blu@email.com', NULL, NULL, NULL),
(9, 'Matteo', 'Rosa', 'hash123', 'matteo.rosa@email.com', NULL, NULL, NULL),
(10, 'Sara', 'Azzurri', 'hash123', 'sara.azzurri@email.com', NULL, NULL, NULL),
(11, 'Davide', 'Gallo', 'hash123', 'davide.gallo@email.com', NULL, NULL, NULL),
(12, 'Valentina', 'Costa', 'hash123', 'valentina.costa@email.com', NULL, NULL, NULL),
(13, 'Federico', 'Fontana', 'hash123', 'federico.fontana@email.com', NULL, NULL, NULL),
(14, 'Elena', 'Rizzo', 'hash123', 'elena.rizzo@email.com', NULL, NULL, NULL),
(15, 'Andrea', 'Moretti', 'hash123', 'andrea.moretti@email.com', NULL, NULL, NULL),
(16, 'Laura', 'Barbieri', 'hash123', 'laura.barbieri@email.com', NULL, NULL, NULL),
(17, 'Marco', 'Lombardi', 'hash123', 'marco.lombardi@email.com', NULL, NULL, NULL),
(18, 'Elisa', 'Caruso', 'hash123', 'elisa.caruso@email.com', NULL, NULL, NULL),
(19, 'Luca', 'Ferraro', 'hash123', 'luca.ferraro@email.com', NULL, NULL, NULL),
(20, 'Anna', 'Gatti', 'hash123', 'anna.gatti@email.com', NULL, NULL, NULL),
(46, 'Lorenzo', 'Vissio', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'lollovissio7@gmail.com', '106129038419682085813', NULL, NULL),
(53, 'VISSIO', 'LORENZO', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'l.vissio.3345@vallauri.edu', '103472573668188922996', NULL, NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `venduto`
--

CREATE TABLE `venduto` (
  `id_venda` int(11) NOT NULL,
  `id_acquirente` int(11) NOT NULL,
  `id_prodotto` int(11) NOT NULL,
  `data_vendita` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `categorie`
--
ALTER TABLE `categorie`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indici per le tabelle `immagini_prodotto`
--
ALTER TABLE `immagini_prodotto`
  ADD PRIMARY KEY (`id_prodotto`,`url_img`);

--
-- Indici per le tabelle `lezione`
--
ALTER TABLE `lezione`
  ADD PRIMARY KEY (`id_prodotto`);

--
-- Indici per le tabelle `messaggi`
--
ALTER TABLE `messaggi`
  ADD PRIMARY KEY (`id_mess`),
  ADD KEY `id_mittente` (`id_mittente`),
  ADD KEY `id_destinatario` (`id_destinatario`),
  ADD KEY `id_prodotto` (`id_prodotto`);

--
-- Indici per le tabelle `preferiti`
--
ALTER TABLE `preferiti`
  ADD PRIMARY KEY (`id_utente`,`id_prodotto`),
  ADD KEY `id_prodotto` (`id_prodotto`);

--
-- Indici per le tabelle `prodotto`
--
ALTER TABLE `prodotto`
  ADD PRIMARY KEY (`id_prodotto`),
  ADD KEY `id_venditore` (`id_venditore`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indici per le tabelle `recensioni`
--
ALTER TABLE `recensioni`
  ADD PRIMARY KEY (`id_rec`),
  ADD KEY `id_mittente` (`id_mittente`),
  ADD KEY `id_destinatario` (`id_destinatario`);

--
-- Indici per le tabelle `segnalazioni`
--
ALTER TABLE `segnalazioni`
  ADD PRIMARY KEY (`id_segn`),
  ADD KEY `id_segnalatore` (`id_segnalatore`),
  ADD KEY `id_segnalato` (`id_segnalato`);

--
-- Indici per le tabelle `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`id_tag`),
  ADD UNIQUE KEY `nome` (`nome`);

--
-- Indici per le tabelle `tag_prodotto`
--
ALTER TABLE `tag_prodotto`
  ADD PRIMARY KEY (`id_tag`,`id_prodotto`),
  ADD KEY `id_prodotto` (`id_prodotto`);

--
-- Indici per le tabelle `utente`
--
ALTER TABLE `utente`
  ADD PRIMARY KEY (`id_utente`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`);

--
-- Indici per le tabelle `venduto`
--
ALTER TABLE `venduto`
  ADD PRIMARY KEY (`id_venda`),
  ADD KEY `id_acquirente` (`id_acquirente`),
  ADD KEY `id_prodotto` (`id_prodotto`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT per la tabella `messaggi`
--
ALTER TABLE `messaggi`
  MODIFY `id_mess` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `prodotto`
--
ALTER TABLE `prodotto`
  MODIFY `id_prodotto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT per la tabella `recensioni`
--
ALTER TABLE `recensioni`
  MODIFY `id_rec` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `segnalazioni`
--
ALTER TABLE `segnalazioni`
  MODIFY `id_segn` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `tag`
--
ALTER TABLE `tag`
  MODIFY `id_tag` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT per la tabella `utente`
--
ALTER TABLE `utente`
  MODIFY `id_utente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT per la tabella `venduto`
--
ALTER TABLE `venduto`
  MODIFY `id_venda` int(11) NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `immagini_prodotto`
--
ALTER TABLE `immagini_prodotto`
  ADD CONSTRAINT `immagini_prodotto_ibfk_1` FOREIGN KEY (`id_prodotto`) REFERENCES `prodotto` (`id_prodotto`) ON DELETE CASCADE;

--
-- Limiti per la tabella `lezione`
--
ALTER TABLE `lezione`
  ADD CONSTRAINT `lezione_ibfk_1` FOREIGN KEY (`id_prodotto`) REFERENCES `prodotto` (`id_prodotto`) ON DELETE CASCADE;

--
-- Limiti per la tabella `messaggi`
--
ALTER TABLE `messaggi`
  ADD CONSTRAINT `messaggi_ibfk_1` FOREIGN KEY (`id_mittente`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE,
  ADD CONSTRAINT `messaggi_ibfk_2` FOREIGN KEY (`id_destinatario`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE,
  ADD CONSTRAINT `messaggi_ibfk_3` FOREIGN KEY (`id_prodotto`) REFERENCES `prodotto` (`id_prodotto`) ON DELETE CASCADE;

--
-- Limiti per la tabella `preferiti`
--
ALTER TABLE `preferiti`
  ADD CONSTRAINT `preferiti_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE,
  ADD CONSTRAINT `preferiti_ibfk_2` FOREIGN KEY (`id_prodotto`) REFERENCES `prodotto` (`id_prodotto`) ON DELETE CASCADE;

--
-- Limiti per la tabella `prodotto`
--
ALTER TABLE `prodotto`
  ADD CONSTRAINT `prodotto_ibfk_1` FOREIGN KEY (`id_venditore`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE,
  ADD CONSTRAINT `prodotto_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorie` (`id_categoria`);

--
-- Limiti per la tabella `recensioni`
--
ALTER TABLE `recensioni`
  ADD CONSTRAINT `recensioni_ibfk_1` FOREIGN KEY (`id_mittente`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE,
  ADD CONSTRAINT `recensioni_ibfk_2` FOREIGN KEY (`id_destinatario`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE;

--
-- Limiti per la tabella `segnalazioni`
--
ALTER TABLE `segnalazioni`
  ADD CONSTRAINT `segnalazioni_ibfk_1` FOREIGN KEY (`id_segnalatore`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE,
  ADD CONSTRAINT `segnalazioni_ibfk_2` FOREIGN KEY (`id_segnalato`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE;

--
-- Limiti per la tabella `tag_prodotto`
--
ALTER TABLE `tag_prodotto`
  ADD CONSTRAINT `tag_prodotto_ibfk_1` FOREIGN KEY (`id_tag`) REFERENCES `tag` (`id_tag`) ON DELETE CASCADE,
  ADD CONSTRAINT `tag_prodotto_ibfk_2` FOREIGN KEY (`id_prodotto`) REFERENCES `prodotto` (`id_prodotto`) ON DELETE CASCADE;

--
-- Limiti per la tabella `venduto`
--
ALTER TABLE `venduto`
  ADD CONSTRAINT `venduto_ibfk_1` FOREIGN KEY (`id_acquirente`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE,
  ADD CONSTRAINT `venduto_ibfk_2` FOREIGN KEY (`id_prodotto`) REFERENCES `prodotto` (`id_prodotto`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
