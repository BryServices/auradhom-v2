import { Injectable, inject } from '@angular/core';
import { ValidatedOrder } from '../models/order';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private customerService = inject(CustomerService);
  private jsPDFModule: any = null;

  /**
   * Charger jsPDF dynamiquement
   */
  private async loadJsPDF(): Promise<any> {
    if (this.jsPDFModule) {
      return this.jsPDFModule;
    }

    try {
      // Import dynamique de jsPDF
      const module = await import('jspdf');
      // jsPDF peut être exporté différemment selon la version
      this.jsPDFModule = module.jsPDF || (module as any).default || module;
      return this.jsPDFModule;
    } catch (error) {
      console.error('Erreur lors du chargement de jsPDF:', error);
      throw new Error(
        'jsPDF n\'est pas installé. Veuillez exécuter: npm install jspdf\n' +
        'Puis redémarrer l\'application.'
      );
    }
  }

  /**
   * Générer et télécharger le reçu PDF d'une commande validée
   */
  async generateOrderReceipt(order: ValidatedOrder): Promise<void> {
    try {
      // Charger jsPDF
      const JsPDF = await this.loadJsPDF();
      const doc = new JsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Fonction pour ajouter du texte avec gestion de la pagination
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        const maxWidth = options.maxWidth || contentWidth;
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * (options.lineHeight || 7);
      };

      // Logo et en-tête
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      yPosition += addText('AURADHOM', margin, yPosition, { maxWidth: contentWidth });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPosition += 5;
      yPosition += addText('Reçu de Commande', margin, yPosition);

      // Ligne de séparation
      yPosition += 10;
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Informations de commande
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      yPosition += addText(`Commande Nº: ${order.orderId}`, margin, yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      yPosition += 7;
      yPosition += addText(`Date: ${this.formatDate(order.validatedAt)}`, margin, yPosition);
      yPosition += 7;
      yPosition += addText(`Validée par: ${order.validatedBy}`, margin, yPosition);

      yPosition += 10;

      // Informations client
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      yPosition += addText('Informations Client', margin, yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      yPosition += 7;
      yPosition += addText(`${order.customer.firstName} ${order.customer.lastName}`, margin, yPosition);
      yPosition += 7;
      yPosition += addText(`Adresse: ${order.customer.address}`, margin, yPosition);
      yPosition += 7;
      
      // Récupérer les noms de département et ville
      const deptName = this.getDepartmentName(order.customer.department);
      const cityName = this.getCityName(order.customer.department, order.customer.city);
      yPosition += addText(`${order.customer.district}, ${cityName}, ${deptName}`, margin, yPosition);
      
      if (order.customer.phone) {
        yPosition += 7;
        yPosition += addText(`Téléphone: ${order.customer.phone}`, margin, yPosition);
      }

      yPosition += 10;

      // Articles
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      yPosition += addText('Articles', margin, yPosition);
      yPosition += 5;

      // Tableau des articles
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Article', margin, yPosition);
      doc.text('Taille', margin + 60, yPosition);
      doc.text('Couleur', margin + 85, yPosition);
      doc.text('Qté', margin + 115, yPosition);
      doc.text('Prix', margin + 135, yPosition);
      doc.text('Total', margin + 165, yPosition);

      yPosition += 7;
      doc.setLineWidth(0.2);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      order.items.forEach(item => {
        // Vérifier si on dépasse la page
        if (yPosition > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPosition = margin;
        }

        const itemName = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name;
        doc.text(itemName, margin, yPosition);
        doc.text(item.size || '-', margin + 60, yPosition);
        doc.text(item.color || '-', margin + 85, yPosition);
        doc.text(item.quantity.toString(), margin + 115, yPosition);
        doc.text(this.formatPrice(item.price), margin + 135, yPosition);
        doc.text(this.formatPrice(item.price * item.quantity), margin + 165, yPosition);
        yPosition += 7;
      });

      yPosition += 5;
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Totaux
      doc.setFont('helvetica', 'bold');
      doc.text('Sous-total:', margin + 100, yPosition);
      doc.text(this.formatPrice(order.subtotal), margin + 165, yPosition);
      yPosition += 7;

      doc.text('Frais de livraison:', margin + 100, yPosition);
      doc.text(this.formatPrice(order.shippingCost), margin + 165, yPosition);
      yPosition += 7;

      doc.setFontSize(12);
      doc.text('TOTAL:', margin + 100, yPosition);
      doc.text(this.formatPrice(order.total), margin + 165, yPosition);

      yPosition += 15;

      // Message de remerciement
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const thankYouText = 'Merci pour votre commande !';
      const thankYouWidth = doc.getTextWidth(thankYouText);
      doc.text(thankYouText, (pageWidth - thankYouWidth) / 2, yPosition);

      // Télécharger le PDF
      doc.save(`commande-${order.orderId}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur lors de la génération du PDF:\n\n${errorMessage}\n\nVeuillez installer jsPDF en exécutant: npm install jspdf`);
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private formatPrice(price: number): string {
    return `${price.toLocaleString('fr-FR')} FCFA`;
  }

  private getDepartmentName(departmentId: string): string {
    const departments = this.customerService.getDepartments();
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : departmentId;
  }

  private getCityName(departmentId: string, cityId: string): string {
    const cities = this.customerService.getCitiesByDepartment(departmentId);
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : cityId;
  }
}
