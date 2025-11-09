import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { PdfService } from '../../../services/pdf.service';
import { Order, PendingOrder, ValidatedOrder } from '../../../models/order';
import { FormatFcfaPipe } from '../../../pipes/format-fcfa.pipe';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FormatFcfaPipe],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private pdfService = inject(PdfService);

  order: Order | null = null;
  showRejectionModal = false;
  rejectionReason = '';

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.order = this.orderService.getOrderById(orderId);
      if (!this.order) {
        this.router.navigate(['/admin/dashboard']);
      }
    }
  }

  validateOrder(): void {
    if (!this.order || this.order.status !== 'pending') return;

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const validated = this.orderService.validateOrder(this.order.id, user.name);
    if (validated) {
      this.order = validated;
      this.router.navigate(['/admin/dashboard']);
    }
  }

  openRejectionModal(): void {
    this.rejectionReason = '';
    this.showRejectionModal = true;
  }

  closeRejectionModal(): void {
    this.showRejectionModal = false;
    this.rejectionReason = '';
  }

  rejectOrder(): void {
    if (!this.order || this.order.status !== 'pending' || !this.rejectionReason.trim()) {
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const rejected = this.orderService.rejectOrder(this.order.id, user.name, this.rejectionReason.trim());
    if (rejected) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  async downloadReceipt(): Promise<void> {
    if (this.order && this.order.status === 'validated') {
      try {
        await this.pdfService.generateOrderReceipt(this.order as ValidatedOrder);
      } catch (error) {
        console.error('Erreur lors du téléchargement du PDF:', error);
      }
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  copyWhatsAppMessage(): void {
    if (this.order) {
      navigator.clipboard.writeText(this.order.whatsappMessage).then(() => {
        alert('Message WhatsApp copié dans le presse-papier');
      });
    }
  }

  openWhatsApp(): void {
    if (this.order && this.order.phone) {
      const phone = this.order.phone.replace(/\D/g, '');
      const message = encodeURIComponent(this.order.whatsappMessage);
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  }
}

