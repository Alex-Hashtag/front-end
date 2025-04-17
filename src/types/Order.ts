export interface Order
{
    id: number;
    productName: string;
    productPrice?: number;
    quantity: number;
    status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';
    paymentType: 'CASH' | 'PREPAID';
    createdAt: string;
    paidAt?: string;
    totalPrice: number;
    instructions: string;
    buyer?: {
        id: number;
        username: string;
        fullName?: string;
    };
    assignedRep?: {
        id: number;
        username: string;
        fullName?: string;
    };
    product?: {
        id: number;
        name: string;
        price: number;
    };
}