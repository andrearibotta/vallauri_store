import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'carica',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './carica.html',
  styleUrl: './carica.css',
})
export class Carica implements OnInit {
  annuncioForm!: FormGroup;

  condizioni = [
    { value: 'nuovo',   label: 'Nuovo',    desc: 'Mai usato, con etichette',   colorClass: 'cond-nuovo'   },
    { value: 'ottimo',  label: 'Ottimo',   desc: 'Usato pochissimo',           colorClass: 'cond-ottimo'  },
    { value: 'buono',   label: 'Buono',    desc: 'Qualche segno di utilizzo',  colorClass: 'cond-buono'   },
    { value: 'discreto',label: 'Discreto', desc: 'Visibilmente usato',         colorClass: 'cond-discreto'},
  ];

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.annuncioForm = this.fb.group({
      immagini: this.fb.array([null, null, null, null, null]),
      categoria: ['', Validators.required],
      nome: ['', [Validators.required, Validators.maxLength(80)]],
      condizione: ['', Validators.required],
      descrizione: ['', [Validators.required, Validators.maxLength(600)]],
      prezzo: [null, [Validators.required, Validators.min(0)]],
      accettoTrattative: [false],
      disponibileScambio: [false]
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

  onSubmit(): void {
    if (this.annuncioForm.valid) {
      console.log('Pubblicazione in corso...', this.annuncioForm.value);
      // Logica di invio al server qui
      this.router.navigate(['/profilo']);
    } else {
      this.annuncioForm.markAllAsTouched();
    }
  }
}
