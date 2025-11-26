
export interface Address {
    id: number;
    label: string; // e.g., 'Rumah', 'Kantor'
    fullAddress: string;
    city: string;
    postalCode: string;
    notes?: string;
}

export interface PaymentMethod {
    id: number;
    type: 'Credit Card' | 'E-Wallet' | 'Cash' | 'Bank Transfer';
    provider: string; // e.g., 'Visa', 'GoPay'
    last4: string;
    expiry?: string; // MM/YY for cards
}
