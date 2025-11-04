import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { CartService } from '../../services/cart.service';
import { Department, City } from '../../models/customer';

@Component({
    selector: 'app-customer-info',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './customer-info.component.html',
    styleUrls: ['./customer-info.component.css']
})
export class CustomerInfoComponent implements OnInit {
    customerForm: FormGroup;
    departments: Department[] = [];
    cities: City[] = [];
    districts: string[] = [];
    customDistrict = false;

    private fb = inject(FormBuilder);
    private customerService = inject(CustomerService);
    private cartService = inject(CartService);
    private router = inject(Router);
    
    showSummary = false;

    constructor() {
        this.customerForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            address: ['', Validators.required],
            department: ['', Validators.required],
            city: ['', Validators.required],
            district: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.departments = this.customerService.getDepartments();
        
        // Charger les informations client si elles existent
        this.customerService.getCustomerInfo().subscribe((customer: any) => {
            if (customer) {
                this.customerForm.patchValue(customer);
                this.onDepartmentChange();
                this.onCityChange();
            }
        });

        // Réagir aux changements de département
        this.customerForm.get('department')?.valueChanges.subscribe(() => {
            this.onDepartmentChange();
        });

        // Réagir aux changements de ville
        this.customerForm.get('city')?.valueChanges.subscribe(() => {
            this.onCityChange();
        });
    }

    onDepartmentChange(): void {
        const departmentId = this.customerForm.get('department')?.value;
        this.cities = this.customerService.getCitiesByDepartment(departmentId);
        this.customerForm.patchValue({ city: '', district: '' });
        this.districts = [];
    }

    onCityChange(): void {
        const departmentId = this.customerForm.get('department')?.value;
        const cityId = this.customerForm.get('city')?.value;
        this.districts = this.customerService.getDistrictsByCity(departmentId, cityId);
        this.customerForm.patchValue({ district: '' });
    }

    toggleCustomDistrict(): void {
        this.customDistrict = !this.customDistrict;
        if (this.customDistrict) {
            this.customerForm.get('district')?.setValue('');
        }
    }

    getFormattedValue(controlName: string): string {
        const value = this.customerForm.get(controlName)?.value;
        if (!value) return '-';
        
        if (controlName === 'department') {
            const dept = this.departments.find(d => d.id === value);
            return dept ? dept.name : value;
        }
        
        if (controlName === 'city') {
            const city = this.cities.find(c => c.id === value);
            return city ? city.name : value;
        }
        
        return value;
    }

    onSubmit(): void {
        if (this.customerForm.valid) {
            // Afficher le récapitulatif avant de soumettre
            this.showSummary = true;
        } else {
            // Marquer tous les champs comme touchés pour afficher les erreurs
            Object.keys(this.customerForm.controls).forEach(key => {
                this.customerForm.get(key)?.markAsTouched();
            });
        }
    }

    confirmOrder(): void {
        // Sauvegarder les informations client
        this.customerService.setCustomerInfo(this.customerForm.value);
        
        // Récupérer les articles du panier
        const cartItems = this.cartService.getItems()();
        if (!cartItems.length) {
            this.router.navigate(['/panier']);
            return;
        }

        // Préparer les données de commande
        const orderData = {
            items: cartItems,
            subtotal: this.cartService.getSubtotal(),
            shippingCost: this.cartService.getShippingCost(),
            total: this.cartService.total()
        };

        // Générer le message WhatsApp et rediriger
        const message = this.customerService.formatWhatsAppMessage(orderData);
        const whatsappLink = this.customerService.getWhatsAppLink(message);
        window.open(whatsappLink, '_blank');
        
        // Rediriger vers la page de confirmation après un court délai
        setTimeout(() => {
            this.router.navigate(['/envoye']);
        }, 500);
    }

    editInfo(): void {
        this.showSummary = false;
    }
}