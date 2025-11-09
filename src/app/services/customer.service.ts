import { Injectable } from '@angular/core';
import { Customer, DEPARTMENTS, Department, City } from '../models/customer';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private customerInfo = new BehaviorSubject<Customer | null>(null);
    
    constructor() {
        // Initialiser avec les données stockées si elles existent
        const storedCustomer = localStorage.getItem('customerInfo');
        if (storedCustomer) {
            this.customerInfo.next(JSON.parse(storedCustomer));
        }
    }

    getDepartments(): Department[] {
        return DEPARTMENTS;
    }

    getCitiesByDepartment(departmentId: string): City[] {
        const department = DEPARTMENTS.find(d => d.id === departmentId);
        return department ? department.cities : [];
    }

    getDistrictsByCity(departmentId: string, cityId: string): string[] {
        const department = DEPARTMENTS.find(d => d.id === departmentId);
        if (!department) return [];
        
        const city = department.cities.find(c => c.id === cityId);
        return city ? city.districts : [];
    }

    setCustomerInfo(customer: Customer): void {
        this.customerInfo.next(customer);
        localStorage.setItem('customerInfo', JSON.stringify(customer));
    }

    getCustomerInfo(): Observable<Customer | null> {
        return this.customerInfo.asObservable();
    }

    /**
     * Obtenir les informations client de manière synchrone
     * Utile pour créer une commande sans avoir à souscrire à l'Observable
     */
    getCustomerInfoValue(): Customer | null {
        return this.customerInfo.value;
    }

    hasRequiredInfo(): boolean {
        const customer = this.customerInfo.value;
        return customer !== null &&
            !!customer.firstName &&
            !!customer.lastName &&
            !!customer.address &&
            !!customer.department &&
            !!customer.city &&
            !!customer.district &&
            !!customer.phone; // Ajouter la vérification du téléphone
    }

    clearCustomerInfo(): void {
        this.customerInfo.next(null);
        localStorage.removeItem('customerInfo');
    }

    generateOrderId(): string {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        return `ADH-${timestamp}-${random}`;
    }

    formatWhatsAppMessage(orderData: { items: any[], subtotal: number, shippingCost: number, total: number }): string {
        const customer = this.customerInfo.value;
        if (!customer) return '';

        const orderId = this.generateOrderId();
        const formatFCFA = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
        
        // Construire la liste des articles
        let articlesText = '';
        orderData.items.forEach((item, index) => {
            if (index > 0) articlesText += '\n\n';
            articlesText += `Article : ${item.name}\n`;
            articlesText += `Taille : ${item.size || 'N/A'}\n`;
            articlesText += `Couleur : ${item.color || 'N/A'}\n`;
            articlesText += `Quantité : ${item.quantity}\n`;
            articlesText += `Prix unitaire : ${formatFCFA(item.price)}`;
        });
        
        // Récupérer les noms de département et ville
        const deptName = this.getDepartmentName(customer.department);
        const cityName = this.getCityName(customer.department, customer.city);
        
        const message = `Je confirme ma commande :

${articlesText}

---

Récapitulatif du prix :
Sous-total : ${formatFCFA(orderData.subtotal)}
Frais de livraison : ${formatFCFA(orderData.shippingCost)}
Total : ${formatFCFA(orderData.total)}

---

Informations pour la livraison
ID Commande : ${orderId}
Nom : ${customer.lastName}
Prénom : ${customer.firstName}
Adresse complète : ${customer.address}
Département : ${deptName}
Ville : ${cityName}
Quartier : ${customer.district}

Félicitations d'avoir décidé de porter bien plus qu'un vêtement, mais une aura.`;

        return message;
    }

    getWhatsAppLink(message: string): string {
        const phoneNumber = '242066060029'; // Format international sans +
        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    }

    private getDepartmentName(departmentId: string): string {
        const dept = DEPARTMENTS.find(d => d.id === departmentId);
        return dept ? dept.name : departmentId;
    }

    private getCityName(departmentId: string, cityId: string): string {
        const dept = DEPARTMENTS.find(d => d.id === departmentId);
        if (!dept) return cityId;
        const city = dept.cities.find(c => c.id === cityId);
        return city ? city.name : cityId;
    }
}