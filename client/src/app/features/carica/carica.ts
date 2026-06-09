import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Controllologin } from '../../services/controllologin';
import { effect } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Httpcalls } from '../../services/httpcalls';

@Component({
  selector: 'carica',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './carica.html',
  styleUrl: './carica.css',
})
export class Carica implements OnInit {
  annuncioForm!: FormGroup;
  lstCategorie: any;
  datiUtente: any = {};
  caricamento = false; // mostra uno stato di attesa sul bottone

  condizioni = [
    { value: 1, label: 'Nuovo',    desc: 'Mai usato, con etichette',  colorClass: 'cond-nuovo'   },
    { value: 2, label: 'Ottimo',   desc: 'Usato pochissimo',          colorClass: 'cond-ottimo'  },
    { value: 3, label: 'Buono',    desc: 'Qualche segno di utilizzo', colorClass: 'cond-buono'   },
    { value: 4, label: 'Discreto', desc: 'Visibilmente usato',        colorClass: 'cond-discreto'},
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: Httpcalls,
    private cdr: ChangeDetectorRef,
    private cl: Controllologin
  ) {
    effect(() =>{
      const dati = this.cl.currentData();
    if (dati && !this.datiUtente?.id) {
      this.datiUtente = dati;
    }
    })
  }

  

  ngOnInit(): void {
    this.datiUtente = history.state.utente?.id
    ? history.state.utente
    : (this.cl.currentData() || {});

    console.log(this.datiUtente)

    this.annuncioForm = this.fb.group({
      immagini: this.fb.array([null, null, null, null, null]),
      categoria: ['', Validators.required],
      nome: ['', [Validators.required, Validators.maxLength(80)]],
      condizione: ['', Validators.required],
      descrizione: ['', [Validators.required, Validators.maxLength(600)]],
      prezzo: [null, [Validators.required, Validators.min(0)]],
      accettoTrattative: [false],
      disponibileScambio: [false],
    });

    this.http.Get('/private/getallCategorie').subscribe({
      next: (response) => {
        this.lstCategorie = response.categorie;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel recupero delle categorie:', err);
      },
    });
  }

  select() {
    const idCategoriaSelezionata = this.annuncioForm.get('categoria')?.value;
    console.log('Categoria selezionata ID:', idCategoriaSelezionata);
  }

  InserisciProdotto() {
    if (this.annuncioForm.invalid) {
      this.annuncioForm.markAllAsTouched();
      return;
    }

    this.caricamento = true;

    const idCategoriaSelezionata = this.annuncioForm.get('categoria')?.value;
    const nome = this.annuncioForm.get('nome')?.value;
    const idVenditore = this.datiUtente.id;
    const idCondizione = this.annuncioForm.get('condizione')?.value;
    const descrizione = this.annuncioForm.get('descrizione')?.value;
    const prezzo = this.annuncioForm.get('prezzo')?.value;
    const data = new Date().toLocaleString('sv-SE');

    this.http
      .Post('/private/caricaProdotto', {
        id_venditore: idVenditore,
        id_categoria: idCategoriaSelezionata,
        id_condizione: idCondizione,
        nome: nome,
        descrizione: descrizione,
        prezzo: prezzo,
        data_pubblicazione: data,
      })
      .subscribe({
        next: (response) => {
          const idProdotto: number = response.id_prodotto;

          // Raccoglie solo gli slot che hanno un'immagine (base64)
          const immaginiBase64: string[] = this.immaginiFormArray.controls
            .map((c) => c.value as string | null)
            .filter((v): v is string => v !== null);

          // Se non ci sono foto, naviga subito
          if (immaginiBase64.length === 0) {
            this.caricamento = false;
            this.router.navigate(['/home']);
            return;
          }

          // Converti i dataURL base64 → Blob → FormData e invia
          this.uploadImmagini(idProdotto, immaginiBase64);
        },
        error: (err) => {
          console.error('Errore durante il caricamento del prodotto:', err);
          this.caricamento = false;
        },
      });
  }

  /**
   * Converte i dataURL in Blob, li impacchetta in un FormData
   * e chiama la route /caricaImmagini del server.
   */
  private uploadImmagini(idProdotto: number, immaginiBase64: string[]): void {
    // fetch() su un dataURL restituisce il Blob corrispondente
    const promises = immaginiBase64.map((dataUrl, i) =>
      fetch(dataUrl)
        .then((r) => r.blob())
        .then((blob) => ({ blob, index: i }))
    );

    Promise.all(promises)
      .then((risultati) => {
        const formData = new FormData();
        formData.append('id_prodotto', String(idProdotto));

        risultati.forEach(({ blob, index }) => {
          // Estrai l'estensione dal MIME type (es. image/jpeg → .jpg)
          const ext = blob.type.split('/')[1] ?? 'jpg';
          formData.append('immagini', blob, `foto_${index}.${ext}`);
        });

        this.http.PostFormData('/private/caricaImmagini', formData).subscribe({
          next: () => {
            this.caricamento = false;
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('Errore upload immagini:', err);
            // Il prodotto è già stato creato: naviga comunque
            this.caricamento = false;
            this.router.navigate(['/home']);
          },
        });
      })
      .catch((err) => {
        console.error('Errore nella conversione delle immagini:', err);
        this.caricamento = false;
        this.router.navigate(['/home']);
      });
  }

  get immaginiFormArray(): FormArray {
    return this.annuncioForm.get('immagini') as FormArray;
  }

  triggerUpload(inputElement: HTMLInputElement): void {
    inputElement.click();
  }

  onFileSelected(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file, index);
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) this.processFile(file, index);
  }

  private processFile(file: File, index: number): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.immaginiFormArray.at(index).setValue(e.target?.result as string);
	this.cdr.detectChanges(); 
    };
    reader.readAsDataURL(file);
  }

  rimuoviFoto(
    event: Event,
    index: number,
    inputElement: HTMLInputElement
  ): void {
    event.stopPropagation();
    this.immaginiFormArray.at(index).setValue(null);
    inputElement.value = '';
  }

  getCharCount(controlName: string): number {
    return this.annuncioForm.get(controlName)?.value?.length || 0;
  }
}