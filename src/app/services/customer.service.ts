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

    hasRequiredInfo(): boolean {
        const customer = this.customerInfo.value;
        return customer !== null &&
            !!customer.firstName &&
            !!customer.lastName &&
            !!customer.address &&
            !!customer.department &&
            !!customer.city &&
            !!customer.district &&
            !!customer.phone;
    }

    generateOrderId(): string {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        return `ADH-${timestamp}-${random}`;
    }

    formatWhatsAppMessage(orderData: any): string {
        const customer = this.customerInfo.value;
        if (!customer) return '';

        const orderId = this.generateOrderId();
        
        const message = `Je confirme ma commande :

Article : ${orderData.productName}
${orderData.size ? `Taille : ${orderData.size}` : ''}
${orderData.color ? `Couleur : ${orderData.color}` : ''}
Quantité : ${orderData.quantity}
Prix unitaire : ${orderData.price} FCFA

Récapitulatif du prix :
Sous-total : ${orderData.subtotal} FCFA
Frais de livraison : ${orderData.shippingCost} FCFA
Total : ${orderData.total} FCFA

Informations pour la livraison
ID Commande : ${orderId}
Nom : ${customer.lastName}
Prénom : ${customer.firstName}
Adresse complète : ${customer.address}
Département : ${customer.department}
Ville : ${customer.city}
Quartier : ${customer.district}

Bienvenue dans la famille, et merci pour votre commande.
Ne dis rien. Sois. AURADHOM`;

        return encodeURIComponent(message);
    }

    getWhatsAppLink(message: string): string {
        const phoneNumber = '242066060029'; // Format international sans +
        return `https://wa.me/${phoneNumber}?text=${message}`;
    }
}