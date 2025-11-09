import { Component, inject } from '@angular/core';
import { OFFICIAL_PHONE_DISPLAY, OFFICIAL_PHONE_E164, OFFICIAL_WA_ME_URL } from '../../shared/constants';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  contactForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required]
  });
  
  formSubmitted = false;
  formSuccess = false;

  phoneDisplay = OFFICIAL_PHONE_DISPLAY;
  phoneE164 = OFFICIAL_PHONE_E164;
  waMeUrl = OFFICIAL_WA_ME_URL;

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
