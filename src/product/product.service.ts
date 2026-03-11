import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
    private products = [
        { id:1101, name:"Mobile", price:15000 },
        { id:1102, name:"Laptop", price:80000 },
        { id:1103, name:"Tablet", price:19000 },
    ];

    getAllProducts(){
        return this.products;
    }

    getProductById(id: number){
        return this.products.find((p) => p.id === id)
    }
}