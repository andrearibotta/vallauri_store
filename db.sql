CREATE DATABASE IF NOT EXISTS vallauristore;
USE vallauristore;

CREATE TABLE classe (
    id_classe INT AUTO_INCREMENT PRIMARY KEY,
    classe VARCHAR(10) NOT NULL,
    indirizzo VARCHAR(50) NOT NULL
);

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
    google_id VARCHAR(255) UNIQUE,
    id_classe INT,
    FOREIGN KEY (id_classe) REFERENCES classe(id_classe) ON DELETE SET NULL
);

CREATE TABLE prodotto (
    id_prodotto INT AUTO_INCREMENT PRIMARY KEY,
    id_venditore INT NOT NULL,
    id_categoria INT NOT NULL,
    descrizione TEXT NOT NULL,
    prezzo DECIMAL(10,2) NOT NULL,
    data_pubblicazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_venditore) REFERENCES utente(id_utente) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorie(id_categoria)
);

CREATE TABLE lezione (
    id_prodotto INT PRIMARY KEY,
    materia VARCHAR(100) NOT NULL,
    durata INT NOT NULL, -- minuti
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
    id_vendita INT AUTO_INCREMENT PRIMARY KEY,
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