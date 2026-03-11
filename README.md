## Guards

```bash 
# create guard 
$ nest g guard [name]

# create guard with folder
$ nest g guard guards/auth
```

![](/public/Img/guard.png)

```bash
# auth.guard.ts

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    return authHeader === 'Bearer my-secret-token';
  }
}

```

```bash
$ nest g module product
$ nest g service product
$ nest g controller product
```

```bash
# product.service.ts
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
```

##### Note: product path e AuthGuard setup

```bash
# product.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService){}

    @Get()
    @UseGuards(AuthGuard)
    getAllProducts(){
        return this.productService.getAllProducts();
    }

    @Get(':id')
    getProduct(@Param('id') id: string){
        return this.productService.getProductById(Number(id));
    }
}
```

##### Note: Headers e token na dile path access kora jabe na
![](/public/Img/img.png)

##### Note: Headers e token dila path access kora jabe
![](/public/Img/img1.png)