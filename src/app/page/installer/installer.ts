import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';


/* =====================================================
   TYPES
===================================================== */

export type ProjectAudience =
  | 'homeowner'
  | 'interior-designer'
  | 'contractor'
  | 'business';


/* =====================================================
   COMPONENT
===================================================== */

@Component({
  selector: 'app-installer',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './installer.html',

  styleUrl: './installer.scss'
})
export class Installer {

  /* ===================================================
     AUDIENCE
  =================================================== */

  selectedAudience:
    ProjectAudience | null = null;


  /* ===================================================
     CONSTRUCTOR
  =================================================== */

  constructor(
    private router: Router
  ) {}


  /* ===================================================
     SELECT AUDIENCE
  =================================================== */

  selectAudience(
    type: ProjectAudience
  ): void {

    this.selectedAudience = type;
  }


  /* ===================================================
     NEXT
  =================================================== */

  async nextStep(): Promise<void> {

    if (!this.selectedAudience) {
      return;
    }


    /*
     * Homeowner inicia su wizard propio.
     *
     * /installer/homeowner
     *
     * Luego la configuración de rutas
     * lo redirigirá a:
     *
     * /installer/homeowner/location
     */
    if (
      this.selectedAudience ===
      'homeowner'
    ) {

      await this.router.navigate([
        '/installer',
        'homeowner'
      ]);

      return;
    }


    /*
     * Dejamos preparada la navegación
     * para los demás perfiles.
     *
     * Más adelante cada uno tendrá su
     * propio wizard.
     *
     * /installer/interior-designer
     * /installer/contractor
     * /installer/business
     */
    await this.router.navigate([
      '/installer',
      this.selectedAudience
    ]);
  }


  /* ===================================================
     BACK
  =================================================== */

  async goBack(): Promise<void> {

    await this.router.navigate([
      '/'
    ]);


    /*
     * Esperamos a que Angular termine
     * la navegación antes de buscar
     * la sección de instaladores.
     */
    setTimeout(() => {

      document
        .getElementById(
          'installer-options'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

    }, 100);
  }
}