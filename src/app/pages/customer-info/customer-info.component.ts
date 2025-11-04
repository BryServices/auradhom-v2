import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Department, City } from '../../models/customer';

@Component({
    selector: 'app-customer-info',
    templateUrl: './customer-info.component.html',
    styleUrls: ['./customer-info.component.css']
})
export class CustomerInfoComponent implements OnInit {
    customerForm: FormGroup;
    departments: Department[] = [];
    cities: City[] = [];
    districts: string[] = [];
    customDistrict = false;

    constructor(
        private fb: FormBuilder,
        private customerService: CustomerService,
        private router: Router
    ) {
        this.customerForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            address: ['', Validators.required],
            department: ['', Validators.required],
            city: ['', Validators.required],
            district: ['', Validators.required],
            phone: ['+242 ', [Validators.required, Validators.pattern(/^\+242 [0-9]{8}$/)]]
        });
    }

    ngOnInit(): void {
        this.departments = this.customerService.getDepartments();
        
        // Charger les informations client si elles existent
        this.customerService.getCustomerInfo().subscribe(customer => {
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

    onSubmit(): void {
        if (this.customerForm.valid) {
            this.customerService.setCustomerInfo(this.customerForm.value);
            this.router.navigate(['/cart']);
        }
    }
}