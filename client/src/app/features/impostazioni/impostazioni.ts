import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Httpcalls } from '../../services/httpcalls';

@Component({
  selector: 'impostazioni',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './impostazioni.html',
  styleUrl: './impostazioni.css',
})
export class Impostazioni implements OnInit {

  profiloForm!: FormGroup;
  datiUtente: any = {};

  pwForza      = 0;
  pwForzaClass = '';
  pwForzaLabel = '';

  constructor(
    private fb: FormBuilder,
    private http: Httpcalls,
    private router: Router
  ) {
    this.inizializzaForm();
  }

  ngOnInit() {
    this.datiUtente = history.state.utenteLoggato || {};
    console.log(this.datiUtente);

    if (this.datiUtente) {
      this.profiloForm.patchValue({
        nome: this.datiUtente.nome || '',
        cognome: this.datiUtente.cognome || '',
        email: this.datiUtente.email || ''
      });
    }
  }

  private inizializzaForm(): void {
    this.profiloForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      cognome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      pass_vecchia: ['', Validators.required],
      pass_nuova: ['', [Validators.required, Validators.minLength(6)]],
      pass_conferma: ['', Validators.required]
    }, {

      validators: this.collegaPasswordValidator
    });
  }

  private collegaPasswordValidator(group: FormGroup ){
    const nuova = group.get('pass_nuova')?.value;
    const conferma = group.get('pass_conferma')?.value;
    return nuova === conferma ? null : { passwordDiverse: true };
  }

  get f() { return this.profiloForm.controls; }

  togglePw(inputId: string, iconId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const icon  = document.getElementById(iconId)!;
    if (input.type === 'password') {
      input.type   = 'text';
      icon.className = 'bi bi-eye-slash';
    } else {
      input.type   = 'password';
      icon.className = 'bi bi-eye';
    }
  }

  aggiornaSicurezza(): void {
    const pw = this.profiloForm.get('pass_nuova')?.value || '';
    this.pwForza = this.calcolaForza(pw);

    const classi = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];
    const label  = ['', 'Debole', 'Discreta', 'Buona', 'Ottima'];
    this.pwForzaClass = classi[this.pwForza];
    this.pwForzaLabel = label[this.pwForza];
  }

  private calcolaForza(pw: string): number {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8)              score++;
    if (/[A-Z]/.test(pw))            score++;
    if (/[0-9]/.test(pw))            score++;
    if (/[^A-Za-z0-9]/.test(pw))     score++;
    return score;
  }

  inviaModifiche() {
    if (this.profiloForm.invalid) {
      this.profiloForm.markAllAsTouched();
      return;
    }

    const formValues = this.profiloForm.value;

    let data: any = {
      id_utente: this.datiUtente.id,
      nome: formValues.nome,
      cognome: formValues.cognome,
      email: formValues.email,
      passwordNuova: formValues.pass_nuova,
      passwordVecchia: formValues.pass_vecchia
    };

    console.log("dati modificati: ", data)
    this.http.Post('/private/modificaProfilo', data).subscribe({
      next: (res) => {
        console.log("modifica inviata: ", res);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error("Errore durante il salvataggio", err);
      }
    });
  }
}
