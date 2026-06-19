import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-commercial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './commercial.html',
  styleUrl: './commercial.scss',
})
export class Commercial implements OnInit {
  form!: FormGroup;
  activeCard: string = 'Trade & Design'; // Valor por defecto

  // Opciones para los desplegables en inglés
  projectTypes = ['Trade & Design', 'Large Commercial'];
  
  timelineOptions = [
    '0 - 3 months', 
    '3 - 6 months', 
    '6 - 12 months', 
    'More than 12 months', 
    'Not sure yet'
  ];
  
  wallConditions = [
    'New construction (Drywall/Plaster)', 
    'Existing (Good condition)', 
    'Existing (Needs repair)', 
    'Exposed concrete / Brick'
  ];
  
  squareFootageOptions = [
    'Less than 1,000 sq ft', 
    '1,000 - 5,000 sq ft', 
    '5,000 - 10,000 sq ft', 
    '10,000+ sq ft'
  ];
  // Objeto para el resumen
  summaryData: any = {};

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Inicializamos el formulario reactivo
    this.form = this.fb.group({
      projectType: ['Trade & Design'],
      timeline: [''],
      wallConditions: [''],
      squareFootage: [''],
      additionalInfo: ['']
    });

    // Escuchamos los cambios del formulario para actualizar el resumen en tiempo real
    this.form.valueChanges.subscribe(value => {
      this.summaryData = { ...value };
    });
  }

  // Método para seleccionar la tarjeta y actualizar el formulario
  selectProjectType(type: string) {
    this.activeCard = type;
    this.form.patchValue({ projectType: type });
  }

  // Método para manejar el envío
  onSubmit() {
    if (this.form.valid) {
      console.log('Datos listos para enviar:', this.form.value);
      
      // AQUÍ IRÍA TU LÓGICA DE ENVÍO
      // this.commercialService.sendProjectData(this.form.value).subscribe(...)
      alert('¡Proyecto enviado con éxito! (Revisa la consola para ver los datos)');
    } else {
      alert('Por favor, completa los campos requeridos.');
      this.form.markAllAsTouched(); // Muestra errores si los hubiera
    }
  }
}