import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
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

  // Mappiamo 'value' con gli ID reali presenti sul Database (Tabella condizioni)
  condizioni = [
    { value: 1, label: 'Nuovo',    desc: 'Mai usato, con etichette',   colorClass: 'cond-nuovo'   },
    { value: 2, label: 'Ottimo',   desc: 'Usato pochissimo',           colorClass: 'cond-ottimo'  },
    { value: 3, label: 'Buono',    desc: 'Qualche segno di utilizzo',  colorClass: 'cond-buono'   },
    { value: 4, label: 'Discreto', desc: 'Visibilmente usato',         colorClass: 'cond-discreto'},
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: Httpcalls,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.datiUtente = history.state.utente || {};

    this.annuncioForm = this.fb.group({
      immagini: this.fb.array([null, null, null, null, null]),
      categoria: ['', Validators.required],
      nome: ['', [Validators.required, Validators.maxLength(80)]],
      condizione: ['', Validators.required], // Conterrà l'ID numerico (1, 2, 3, 4)
      descrizione: ['', [Validators.required, Validators.maxLength(600)]],
      prezzo: [null, [Validators.required, Validators.min(0)]],
      accettoTrattative: [false],
      disponibileScambio: [false]
    });

    this.http.Get('/private/getallCategorie').subscribe({
      next: (response) => {
        this.lstCategorie = response.categorie;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nel recupero delle categorie:", err);
      }
    });
  }

  select() {
    const idCategoriaSelezionata = this.annuncioForm.get('categoria')?.value;
    console.log("Categoria selezionata ID:", idCategoriaSelezionata);
  }

  InserisciProdotto() {
    // Se il form non è valido (es. nessuna condizione selezionata), marchiamo i campi per mostrare l'errore
    if (this.annuncioForm.invalid) {
      this.annuncioForm.markAllAsTouched();
      return;
    }

    const idCategoriaSelezionata = this.annuncioForm.get('categoria')?.value;
    const nome = this.annuncioForm.get('nome')?.value;
    const idVenditore = this.datiUtente.id;
    const idCondizione = this.annuncioForm.get('condizione')?.value; // Recuperiamo l'ID della condizione
    const descrizione = this.annuncioForm.get('descrizione')?.value;
    const prezzo = this.annuncioForm.get('prezzo')?.value;
    const data = new Date().toLocaleString('sv-SE'); // Formato: YYYY-MM-DD HH:MM:SS

    // Aggiunto id_condizione nel corpo della richiesta HTTP
    this.http.Post('/private/caricaProdotto', {
      id_venditore: idVenditore,
      id_categoria: idCategoriaSelezionata,
      id_condizione: idCondizione, // Passaggio chiave per il database
      nome: nome,
      descrizione: descrizione,
      prezzo: prezzo,
      data_pubblicazione: data
    }).subscribe({
      next: (response) => {
        console.log("Prodotto caricato con successo:", response);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error("Errore durante il caricamento del prodotto:", err);
      }
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
    };
    reader.readAsDataURL(file);
  }

  rimuoviFoto(event: Event, index: number, inputElement: HTMLInputElement): void {
    event.stopPropagation();
    this.immaginiFormArray.at(index).setValue(null);
    inputElement.value = '';
  }

  getCharCount(controlName: string): number {
    return this.annuncioForm.get(controlName)?.value?.length || 0;
  }
}
