import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeServiceService {
  constructor() { }
  private theme = 'dark-theme';

  setTheme(theme: string) {
    this.theme = theme;
    document.body.className = theme;
  }

  getTheme(): string {
    return this.theme;
  }
}
