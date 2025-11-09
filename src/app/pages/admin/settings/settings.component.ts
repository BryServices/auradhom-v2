import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService } from '../../../services/config.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private configService = inject(ConfigService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  adminForm: FormGroup;
  whatsappForm: FormGroup;
  
  successMessage = '';
  errorMessage = '';

  constructor() {
    // Initialiser les formulaires dans le constructeur pour satisfaire TypeScript strict mode
    const config = this.configService.getConfig();
    
    this.adminForm = this.fb.group({
      email: [config.admin.email, [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: (form: FormGroup) => this.passwordMatchValidator(form) });

    this.whatsappForm = this.fb.group({
      phone: [this.formatPhoneDisplay(config.whatsappPhone), [Validators.required, Validators.pattern(/^\+242\s\d{2}\s\d{3}\s\d{4}$/)]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    // Les formulaires sont déjà initialisés dans le constructor
    // On peut mettre à jour les valeurs si nécessaire
    const config = this.configService.getConfig();
    
    this.adminForm.patchValue({
      email: config.admin.email
    });

    this.whatsappForm.patchValue({
      phone: this.formatPhoneDisplay(config.whatsappPhone)
    });
  }

  isAdminFormDisabled(): boolean {
    const emailControl = this.adminForm.get('email');
    const passwordControl = this.adminForm.get('password');
    if (!emailControl) return true;
    const emailInvalid = emailControl.invalid;
    const emailPristine = emailControl.pristine;
    const hasPassword = passwordControl && passwordControl.value;
    return emailInvalid || (emailPristine && !hasPassword);
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    // Si un mot de passe est saisi, la confirmation est requise
    if (password && password.value && confirmPassword) {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }
      if (confirmPassword.value && !password.value) {
        password.setErrors({ required: true });
        return { passwordRequired: true };
      }
    }
    
    // Réinitialiser les erreurs si les mots de passe correspondent
    if (password && confirmPassword && password.value === confirmPassword.value) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  formatPhoneDisplay(phone: string): string {
    // Formater : +242 05 072 8339
    if (phone.length === 12) {
      return `+${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
    }
    return phone;
  }

  formatPhoneInput(phone: string): string {
    // Supprimer tous les caractères sauf les chiffres
    return phone.replace(/\D/g, '');
  }

  updateAdminCredentials(): void {
    const emailControl = this.adminForm.get('email');
    if (emailControl && emailControl.invalid) {
      this.markFormGroupTouched(this.adminForm);
      return;
    }

    const { email, password } = this.adminForm.value;
    const config = this.configService.getConfig();
    
    // Si un nouveau mot de passe est fourni, l'utiliser, sinon garder l'ancien
    const newPassword = password && password.trim() ? password : config.admin.password;
    
    // Valider le mot de passe seulement s'il est fourni
    if (password && password.trim()) {
      if (password.length < 6) {
        this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
        this.successMessage = '';
        return;
      }
      if (password !== this.adminForm.value.confirmPassword) {
        this.errorMessage = 'Les mots de passe ne correspondent pas';
        this.successMessage = '';
        return;
      }
    }
    
    try {
      this.configService.updateAdminCredentials(email, newPassword);
      this.successMessage = 'Identifiants administrateur mis à jour avec succès';
      this.errorMessage = '';
      
      // Réinitialiser les champs de mot de passe
      this.adminForm.patchValue({
        password: '',
        confirmPassword: ''
      });
      this.adminForm.markAsPristine();
      
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    } catch (error) {
      this.errorMessage = 'Erreur lors de la mise à jour des identifiants';
      this.successMessage = '';
    }
  }

  updateWhatsAppPhone(): void {
    if (this.whatsappForm.invalid) {
      this.markFormGroupTouched(this.whatsappForm);
      return;
    }

    const phone = this.formatPhoneInput(this.whatsappForm.value.phone);
    
    if (phone.length !== 12) {
      this.errorMessage = 'Le numéro de téléphone doit contenir 12 chiffres (format: +242XXXXXXXXX)';
      this.successMessage = '';
      return;
    }

    try {
      this.configService.updateWhatsAppPhone(phone);
      this.successMessage = 'Numéro WhatsApp mis à jour avec succès';
      this.errorMessage = '';
      
      // Mettre à jour l'affichage
      this.whatsappForm.patchValue({
        phone: this.formatPhoneDisplay(phone)
      });
      this.whatsappForm.markAsPristine();
      
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    } catch (error) {
      this.errorMessage = 'Erreur lors de la mise à jour du numéro WhatsApp';
      this.successMessage = '';
    }
  }

  resetToDefault(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les configurations aux valeurs par défaut ?')) {
      this.configService.resetToDefault();
      const config = this.configService.getConfig();
      
      this.adminForm.patchValue({
        email: config.admin.email,
        password: '',
        confirmPassword: ''
      });
      
      this.whatsappForm.patchValue({
        phone: this.formatPhoneDisplay(config.whatsappPhone)
      });
      
      this.successMessage = 'Configuration réinitialisée aux valeurs par défaut';
      this.errorMessage = '';
      
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}

