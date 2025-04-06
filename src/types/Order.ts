export interface Order
{
    productName: string;
    id: number
    quantity: number
    status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED'
    paymentType: 'CASH' | 'PREPAID'
    createdAt: string
    totalPrice: number
    instructions: string
}