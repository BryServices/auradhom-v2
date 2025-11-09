import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent {
  private configService = inject(ConfigService);
  
  get phoneDisplay(): string {
    const phone = this.configService.getWhatsAppPhone();
    // Formater le numéro : +242 05 072 8339
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
}
