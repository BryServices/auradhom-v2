export interface Customer {
    firstName: string;
    lastName: string;
    address: string;
    department: string;
    city: string;
    district: string;
    phone: string;
}

export interface Department {
    id: string;
    name: string;
    cities: City[];
}

export interface City {
    id: string;
    name: string;
    districts: string[];
}

export const DEPARTMENTS: Department[] = [
    {
        id: 'brazzaville',
        name: 'Brazzaville',
        cities: [
            {
                id: 'brazzaville-city',
                name: 'Brazzaville',
                districts: [
                    'Bacongo',
                    'Makélékélé',
                    'Poto-Poto',
                    'Moungali',
                    'Ouenzé',
                    'Talangaï',
                    'Mfilou',
                    'Madibou',
                    'Djiri'
                ]
            }
        ]
    },
    {
        id: 'pointe-noire',
        name: 'Pointe-Noire',
        cities: [
            {
                id: 'pointe-noire-city',
                name: 'Pointe-Noire',
                districts: [
                    'Lumumba',
                    'Mvoumvou',
                    'Tié-Tié',
                    'Loandjili',
                    'Mongo-Mpoukou',
                    'Ngoyo'
                ]
            }
        ]
    }
    // Ajouter les autres départements du Congo-Brazzaville ici
];