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
   * Vérifier si un saut de page est nécessaire
   */
  private checkPageBreak(doc: any, yPosition: number, requiredSpace: number, pageHeight: number, margin: number): number {
    if (yPosition + requiredSpace > pageHeight - margin - 20) {
      doc.addPage();
      return margin + 10;
    }
    return yPosition;
  }

  /**
   * Ajouter du texte avec gestion du retour à la ligne automatique
   */
  private addText(doc: any, text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.35);
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
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      const footerHeight = 25;
      const minBottomMargin = footerHeight + 10;
      let yPosition = margin;

      // ============================================
      // EN-TÊTE AVEC BARRE DE COULEUR
      // ============================================
      // Barre noire en haut
      this.drawRect(doc, 0, 0, pageWidth, 45, this.COLORS.black);
      
      // Logo AURADHOM en blanc
      doc.setTextColor(this.COLORS.white[0], this.COLORS.white[1], this.COLORS.white[2]);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('AURADHOM', margin, 28);
      
      // Sous-titre
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Reçu de Commande', margin + 65, 28);
      
      // Réinitialiser la couleur du texte
      doc.setTextColor(this.COLORS.black[0], this.COLORS.black[1], this.COLORS.black[2]);
      yPosition = 55;

      // ============================================
      // INFORMATIONS DE COMMANDE
      // ============================================
      yPosition = this.checkPageBreak(doc, yPosition, 35, pageHeight, minBottomMargin);
      
      // Section avec fond gris clair
      this.drawRect(doc, margin, yPosition, contentWidth, 30, this.COLORS.grayLight);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DÉTAILS DE LA COMMANDE', margin + 5, yPosition + 8);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nº Commande: ${order.orderId}`, margin + 5, yPosition + 15);
      doc.text(`Date: ${this.formatDate(order.validatedAt)}`, margin + 5, yPosition + 21);
      
      // Validée par sur une nouvelle ligne si nécessaire
      const validatedByText = `Validée par: ${order.validatedBy}`;
      const validatedByWidth = doc.getTextWidth(validatedByText);
      if (validatedByWidth < contentWidth - 10) {
        doc.text(validatedByText, margin + 5, yPosition + 27);
      } else {
        doc.text(`Par: ${order.validatedBy}`, margin + 5, yPosition + 27);
      }
      
      yPosition += 38;

      // ============================================
      // INFORMATIONS CLIENT
      // ============================================
      yPosition = this.checkPageBreak(doc, yPosition, 40, pageHeight, minBottomMargin);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMATIONS CLIENT', margin, yPosition);
      
      yPosition += 7;
      this.drawLine(doc, margin, yPosition, pageWidth - margin, yPosition, 0.5);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Nom complet
      doc.setFont('helvetica', 'bold');
      doc.text(`${order.customer.firstName} ${order.customer.lastName}`, margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      
      // Adresse avec gestion du texte long
      const addressText = `Adresse: ${order.customer.address}`;
      const addressLines = doc.splitTextToSize(addressText, contentWidth - 5);
      doc.text(addressLines, margin, yPosition);
      yPosition += addressLines.length * 4;
      
      // Localisation
      const deptName = this.getDepartmentName(order.customer.department);
      const cityName = this.getCityName(order.customer.department, order.customer.city);
      const locationText = `${order.customer.district}, ${cityName}, ${deptName}`;
      doc.text(locationText, margin, yPosition);
      yPosition += 5;
      
      // Téléphone
      if (order.customer.phone) {
        doc.text(`Téléphone: ${order.customer.phone}`, margin, yPosition);
        yPosition += 5;
      }
      
      yPosition += 8;

      // ============================================
      // ARTICLES - TABLEAU PROFESSIONNEL
      // ============================================
      yPosition = this.checkPageBreak(doc, yPosition, 15, pageHeight, minBottomMargin);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('ARTICLES COMMANDÉS', margin, yPosition);
      
      yPosition += 7;
      this.drawLine(doc, margin, yPosition, pageWidth - margin, yPosition, 0.5);
      yPosition += 7;

      // En-tête du tableau avec fond gris foncé
      yPosition = this.checkPageBreak(doc, yPosition, 12, pageHeight, minBottomMargin);
      const tableHeaderY = yPosition;
      this.drawRect(doc, margin, tableHeaderY, contentWidth, 10, this.COLORS.grayDark);
      
      doc.setTextColor(this.COLORS.white[0], this.COLORS.white[1], this.COLORS.white[2]);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('Article', margin + 2, tableHeaderY + 7);
      doc.text('Taille', margin + 52, tableHeaderY + 7);
      doc.text('Couleur', margin + 65, tableHeaderY + 7);
      doc.text('Qté', margin + 82, tableHeaderY + 7);
      doc.text('Prix', margin + 92, tableHeaderY + 7);
      doc.text('Total', margin + 128, tableHeaderY + 7);
      
      doc.setTextColor(this.COLORS.black[0], this.COLORS.black[1], this.COLORS.black[2]);
      yPosition += 12;

      // Lignes du tableau
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      order.items.forEach((item, index) => {
        // Vérifier si on a assez d'espace pour une ligne (8px de hauteur)
        yPosition = this.checkPageBreak(doc, yPosition, 8, pageHeight, minBottomMargin);
        
        // Si on a changé de page, redessiner l'en-tête du tableau
        if (yPosition === margin + 10) {
          const newTableHeaderY = yPosition;
          this.drawRect(doc, margin, newTableHeaderY, contentWidth, 10, this.COLORS.grayDark);
          
          doc.setTextColor(this.COLORS.white[0], this.COLORS.white[1], this.COLORS.white[2]);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('Article', margin + 2, newTableHeaderY + 7);
          doc.text('Taille', margin + 52, newTableHeaderY + 7);
          doc.text('Couleur', margin + 65, newTableHeaderY + 7);
          doc.text('Qté', margin + 82, newTableHeaderY + 7);
          doc.text('Prix', margin + 92, newTableHeaderY + 7);
          doc.text('Total', margin + 128, newTableHeaderY + 7);
          
          doc.setTextColor(this.COLORS.black[0], this.COLORS.black[1], this.COLORS.black[2]);
          yPosition += 12;
        }

        // Fond alterné pour les lignes
        if (index % 2 === 0) {
          this.drawRect(doc, margin, yPosition - 4, contentWidth, 8, this.COLORS.grayLight);
        }

        // Nom de l'article (tronqué si trop long)
        const maxNameWidth = 48;
        let itemName = item.name;
        if (doc.getTextWidth(itemName) > maxNameWidth) {
          const lines = doc.splitTextToSize(itemName, maxNameWidth);
          itemName = lines[0];
          if (lines.length > 1) {
            itemName = itemName.substring(0, Math.min(itemName.length, 20)) + '...';
          }
        }
        doc.text(itemName, margin + 2, yPosition);
        doc.text(item.size || '-', margin + 52, yPosition);
        doc.text(item.color || '-', margin + 65, yPosition);
        doc.text(item.quantity.toString(), margin + 82, yPosition);
        
        // Prix unitaire (formaté court)
        const priceText = this.formatPriceShort(item.price);
        doc.text(priceText, margin + 92, yPosition);
        
        // Total de la ligne en gras
        doc.setFont('helvetica', 'bold');
        const totalText = this.formatPriceShort(item.price * item.quantity);
        doc.text(totalText, margin + 128, yPosition);
        doc.setFont('helvetica', 'normal');
        
        yPosition += 8;
      });

      // Ligne de séparation avant les totaux
      yPosition = this.checkPageBreak(doc, yPosition, 35, pageHeight, minBottomMargin);
      yPosition += 4;
      this.drawLine(doc, margin, yPosition, pageWidth - margin, yPosition, 0.8);
      yPosition += 8;

      // ============================================
      // TOTAUX - DESIGN PROÉMINENT
      // ============================================
      const totalsStartY = yPosition;
      const totalsWidth = 75;
      const totalsX = pageWidth - margin - totalsWidth;

      // Fond gris clair pour les totaux
      this.drawRect(doc, totalsX, totalsStartY, totalsWidth, 28, this.COLORS.grayLight);
      
      // Bordure noire
      doc.setDrawColor(this.COLORS.black[0], this.COLORS.black[1], this.COLORS.black[2]);
      doc.setLineWidth(1);
      doc.rect(totalsX, totalsStartY, totalsWidth, 28);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Sous-total:', totalsX + 3, totalsStartY + 7);
      doc.text(this.formatPriceShort(order.subtotal) + ' FCFA', totalsX + 45, totalsStartY + 7);
      
      doc.text('Livraison:', totalsX + 3, totalsStartY + 13);
      doc.text(this.formatPriceShort(order.shippingCost) + ' FCFA', totalsX + 45, totalsStartY + 13);
      
      // Ligne de séparation
      this.drawLine(doc, totalsX + 2, totalsStartY + 18, totalsX + totalsWidth - 2, totalsStartY + 18, 0.5);
      
      // TOTAL en gras et plus grand
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', totalsX + 3, totalsStartY + 24);
      doc.text(this.formatPriceShort(order.total) + ' FCFA', totalsX + 45, totalsStartY + 24);
      
      yPosition = totalsStartY + 32;

      // ============================================
      // MESSAGE DE REMERCIEMENT
      // ============================================
      yPosition = this.checkPageBreak(doc, yPosition, 20, pageHeight, minBottomMargin);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const thankYouText = 'Merci pour votre commande !';
      const thankYouWidth = doc.getTextWidth(thankYouText);
      doc.text(thankYouText, (pageWidth - thankYouWidth) / 2, yPosition);
      
      yPosition += 6;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      const tagline = 'Ne dis rien. Sois.';
      const taglineWidth = doc.getTextWidth(tagline);
      doc.text(tagline, (pageWidth - taglineWidth) / 2, yPosition);

      // ============================================
      // PIED DE PAGE SUR CHAQUE PAGE
      // ============================================
      const pageCount = doc.internal.pages.length - 1;
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footerY = pageHeight - footerHeight;
        
        this.drawLine(doc, margin, footerY, pageWidth - margin, footerY, 0.3);
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(this.COLORS.grayDark[0], this.COLORS.grayDark[1], this.COLORS.grayDark[2]);
        
        const footerText = 'AURADHOM - Streetwear haut de gamme. Silence = Puissance.';
        const footerWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (pageWidth - footerWidth) / 2, footerY + 6);
        
        // Numéro de page
        doc.text(`Page ${i}/${pageCount}`, pageWidth - margin - 20, footerY + 6);
      }

      // Revenir à la dernière page
      doc.setPage(pageCount);
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

  /**
   * Formater un prix de manière courte pour le PDF (sans "FCFA" pour économiser l'espace)
   */
  private formatPriceShort(price: number): string {
    return price.toLocaleString('fr-FR');
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
