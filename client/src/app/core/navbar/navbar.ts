import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {Controllologin} from '../../services/controllologin';
import {Httpcalls} from '../../services/httpcalls';

@Component({
  selector: 'navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit{
  prodotticercati: any = {}

  loggato: boolean = false;
  constructor(private cl: Controllologin, private router: Router, private http: Httpcalls) {
  }

  ngAfterViewInit(): void {
    // ── Dark mode ──
    const btn  = document.getElementById('themeToggle')!;
    const icon = document.getElementById('themeIcon')!;
    const html = document.documentElement;

    const saved = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', saved);
    this.updateIcon(icon, saved);

    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      this.updateIcon(icon, next);
    });

    // ── Ricerca ──
    const input = document.getElementById('navSearchInput') as HTMLInputElement;
    const btnSrch = document.getElementById('navSearchBtn')!;

    const doSearch = () => {

      const q = input.value.trim();
      if (q) this.router.navigate(['/ricerca'], { queryParams: { q } });
    };

    btnSrch.addEventListener('click', doSearch);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });
  }

  private updateIcon(icon: HTMLElement, theme: string): void {
    icon.className = theme === 'dark'
      ? 'bi bi-brightness-high-fill'
      : 'bi bi-moon-stars-fill';
  }

  ngOnInit() {
    this.cl.currentMessage.subscribe(msg => this.loggato = msg)
    console.log("loggato dalla navbar")
    console.log("cm: ", this.loggato)
  }
}
