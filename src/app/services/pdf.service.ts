import { Injectable, inject } from '@angular/core';
import { ValidatedOrder } from '../models/order';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private customerService = inject(CustomerService);
  private jsPDFModule: any = null;

  // Couleurs de la marque AURADHOM
  private readonly COLORS = {
    black: [0, 0, 0],
    white: [255, 255, 255],
    grayDark: [28, 28, 28],
    sand: [216, 210, 201],
    grayLight: [240, 240, 240]
  };

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
   * Dessiner un rectangle avec couleur de fond
   */
  private drawRect(doc: any, x: number, y: number, width: number, height: number, color: number[]): void {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y, width, height, 'F');
  }

  /**
   * Dessiner une ligne (horizontale ou verticale)
   */
  private drawLine(doc: any, x1: number, y1: number, x2: number, y2: number, width: number = 0.5, color?: number[]): void {
    if (color) {
      doc.setDrawColor(color[0], color[1], color[2]);
    } else {
      doc.setDrawColor(this.COLORS.black[0], this.COLORS.black[1], this.COLORS.black[2]);
    }
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
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
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // ============================================
      // EN-TÊTE AVEC BARRE DE COULEUR
      // ============================================
      // Barre noire en haut
      this.drawRect(doc, 0, 0, pageWidth, 50, this.COLORS.black);
      
      // Logo AURADHOM en blanc
      doc.setTextColor(this.COLORS.white[0], this.COLORS.white[1], this.COLORS.white[2]);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('AURADHOM', margin, 32);
      
      // Sous-titre
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Reçu de Commande', margin + 70, 32);
      
      // Réinitialiser la couleur du texte
      doc.setTextColor(this.COLORS.black[0], this.COLORS.black[1], this.COLORS.black[2]);
      yPosition = 60;

      // ============================================
      // INFORMATIONS DE COMMANDE
      // ============================================
      // Section avec fond gris clair
      this.drawRect(doc, margin, yPosition, contentWidth, 35, this.COLORS.grayLight);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DÉTAILS DE LA COMMANDE', margin + 5, yPosition + 10);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nº Commande: ${order.orderId}`, margin + 5, yPosition + 18);
      doc.text(`Date: ${this.formatDate(order.validatedAt)}`, margin + 5, yPosition + 25);
      doc.text(`Validée par: ${order.validatedBy}`, margin + 100, yPosition + 25);
      
      yPosition += 45;

      // ============================================
      // INFORMATIONS CLIENT
      // ============================================
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMATIONS CLIENT', margin, yPosition);
      
      yPosition += 8;
      this.drawLine(doc, margin, yPosition, pageWidth - margin, yPosition, 0.5);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Nom complet
      doc.setFont('helvetica', 'bold');
      doc.text(`${order.customer.firstName} ${order.customer.lastName}`, margin, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      // Adresse
      doc.text(`Adresse: ${order.customer.address}`, margin, yPosition);
      yPosition += 6;
      
      // Localisation
      const deptName = this.getDepartmentName(order.customer.department);
      const cityName = this.getCityName(order.customer.department, order.customer.city);
      doc.text(`${order.customer.district}, ${cityName}, ${deptName}`, margin, yPosition);
      yPosition += 6;
      
      // Téléphone
      if (order.customer.phone) {
        doc.text(`Téléphone: ${order.customer.phone}`, margin, yPosition);
        yPosition += 6;
      }
      
      yPosition += 10;

      // ============================================
      // ARTICLES - TABLEAU PROFESSIONNEL
      // ============================================
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ARTICLES COMMANDÉS', margin, yPosition);
      
      yPosition += 8;
      this.drawLine(doc, margin, yPosition, pageWidth - margin, yPosition, 0.5);
      yPosition += 8;

      // En-tête du tableau avec fond gris foncé
      const tableHeaderY = yPosition;
      this.drawRect(doc, margin, tableHeaderY, contentWidth, 12, this.COLORS.grayDark);
      
      doc.setTextColor(this.COLORS.white[0], this.COLORS.white[1], this.COLORS.white[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Article', margin + 3, tableHeaderY + 8);
      doc.text('Taille', margin + 70, tableHeaderY + 8);
      doc.text('Couleur', margin + 90, tableHeaderY + 8);
      doc.text('Qté', margin + 115, tableHeaderY + 8);
      doc.text('Prix unit.', margin + 130, tableHeaderY + 8);
      doc.text('Total', margin + 165, tableHeaderY + 8);
      
      doc.setTextColor(this.COLORS.black[0], this.COLORS.black[1], this.COLORS.black[2]);
      yPosition += 15;

      // Lignes du tableau
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      order.items.forEach((item, index) => {
        // Vérifier si on dépasse la page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }

        // Fond alterné pour les lignes
        if (index % 2 === 0) {
          this.drawRect(doc, margin, yPosition - 5, contentWidth, 10, this.COLORS.grayLight);
        }
        
        // Bordures verticales
        this.drawLine(doc, margin + 65, yPosition - 5, margin + 65, yPosition + 5, 0.1);
        this.drawLine(doc, margin + 88, yPosition - 5, margin + 88, yPosition + 5, 0.1);
        this.drawLine(doc, margin + 112, yPosition - 5, margin + 112, yPosition + 5, 0.1);
        this.drawLine(doc, margin + 128, yPosition - 5, margin + 128, yPosition + 5, 0.1);
        this.drawLine(doc, margin + 162, yPosition - 5, margin + 162, yPosition + 5, 0.1);

        // Nom de l'article (tronqué si trop long)
        const itemName = item.name.length > 28 ? item.name.substring(0, 25) + '...' : item.name;
        doc.text(itemName, margin + 3, yPosition);
        doc.text(item.size || '-', margin + 70, yPosition);
        doc.text(item.color || '-', margin + 90, yPosition);
        doc.text(item.quantity.toString(), margin + 115, yPosition);
        doc.text(this.formatPrice(item.price), margin + 130, yPosition);
        
        // Total de la ligne en gras
        doc.setFont('helvetica', 'bold');
        doc.text(this.formatPrice(item.price * item.quantity), margin + 165, yPosition);
        doc.setFont('helvetica', 'normal');
        
        yPosition += 10;
      });

      // Ligne de séparation avant les totaux
      yPosition += 5;
      this.drawLine(doc, margin, yPosition, pageWidth - margin, yPosition, 1);
      yPosition += 10;

      // ============================================
      // TOTAUX - DESIGN PROÉMINENT
      // ============================================
      const totalsStartY = yPosition;
      const totalsWidth = 80;
      const totalsX = pageWidth - margin - totalsWidth;

      // Fond gris clair pour les totaux
      this.drawRect(doc, totalsX, totalsStartY, totalsWidth, 35, this.COLORS.grayLight);
      
      // Bordure noire
      doc.setDrawColor(this.COLORS.black[0], this.COLORS.black[1], this.COLORS.black[2]);
      doc.setLineWidth(1);
      doc.rect(totalsX, totalsStartY, totalsWidth, 35);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Sous-total:', totalsX + 5, totalsStartY + 8);
      doc.text(this.formatPrice(order.subtotal), totalsX + 50, totalsStartY + 8);
      
      doc.text('Livraison:', totalsX + 5, totalsStartY + 15);
      doc.text(this.formatPrice(order.shippingCost), totalsX + 50, totalsStartY + 15);
      
      // Ligne de séparation
      this.drawLine(doc, totalsX + 2, totalsStartY + 20, totalsX + totalsWidth - 2, totalsStartY + 20, 0.5);
      
      // TOTAL en gras et plus grand
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', totalsX + 5, totalsStartY + 29);
      doc.text(this.formatPrice(order.total), totalsX + 50, totalsStartY + 29);
      
      yPosition = totalsStartY + 45;

      // ============================================
      // MESSAGE DE REMERCIEMENT
      // ============================================
      yPosition += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      const thankYouText = 'Merci pour votre commande !';
      const thankYouWidth = doc.getTextWidth(thankYouText);
      doc.text(thankYouText, (pageWidth - thankYouWidth) / 2, yPosition);
      
      yPosition += 8;
      doc.setFontSize(9);
      const tagline = 'Ne dis rien. Sois.';
      const taglineWidth = doc.getTextWidth(tagline);
      doc.text(tagline, (pageWidth - taglineWidth) / 2, yPosition);

      // ============================================
      // PIED DE PAGE
      // ============================================
      const footerY = pageHeight - 30;
      this.drawLine(doc, margin, footerY, pageWidth - margin, footerY, 0.5);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.COLORS.grayDark[0], this.COLORS.grayDark[1], this.COLORS.grayDark[2]);
      
      const footerText = 'AURADHOM - Streetwear haut de gamme. Silence = Puissance.';
      const footerWidth = doc.getTextWidth(footerText);
      doc.text(footerText, (pageWidth - footerWidth) / 2, footerY + 8);
      
      // Numéro de page
      const pageNum = doc.internal.pages.length - 1;
      doc.text(`Page ${pageNum}`, pageWidth - margin - 15, footerY + 8);

      // Réinitialiser la couleur
      doc.setTextColor(this.COLORS.black[0], this.COLORS.black[1], this.COLORS.black[2]);

      // ============================================
      // TÉLÉCHARGER LE PDF
      // ============================================
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
