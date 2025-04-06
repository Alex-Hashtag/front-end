// src/types.ts
import {Product} from "./Product.ts";

export interface PaginatedProducts
{
    content: Product[]
    totalPages: number
    totalElements: number
    number: number  // Current page number
    size: number    // Page size
    first: boolean
    last: boolean
}