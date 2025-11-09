import { Component } from '@angular/core';
import { OFFICIAL_PHONE_DISPLAY, OFFICIAL_PHONE_E164, OFFICIAL_WA_ME_URL } from '../../shared/constants';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent {
  phoneDisplay = OFFICIAL_PHONE_DISPLAY;
  phoneE164 = OFFICIAL_PHONE_E164;
  waMeUrl = OFFICIAL_WA_ME_URL;
}
