import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private configService = inject(ConfigService);
  
  contactForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required]
  });
  
  formSubmitted = false;
  formSuccess = false;

  get phoneDisplay(): string {
    const phone = this.configService.getWhatsAppPhone();
    if (phone.length === 12) {
      return `+${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
    }
    return `+${phone}`;
  }
  
  get phoneE164(): string {
    return `+${this.configService.getWhatsAppPhone()}`;
  }
  
  get waMeUrl(): string {
    return `https://wa.me/${this.configService.getWhatsAppPhone()}`;
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.contactForm.valid) {
      console.log('Form Data:', this.contactForm.value);
      // Here you would typically send the data to a backend service
      this.formSuccess = true;
      this.contactForm.reset();
    }
  }
}
