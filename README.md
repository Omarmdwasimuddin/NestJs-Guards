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


## Role-based Authorization

```bash
# create guard
$ nest g guard guards/roles
```

![](/public/Img/img2.png)

##### Note: add file- roles.decorator.ts & roles.enums.ts

![roles file](/public/Img/img3.png)


```bash
# roles.decorator.ts
// Custom decorator
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

```bash
# roles.enums.ts
export enum Role{
    User = 'user',
    Admin = 'admin'
}
```

```bash
# roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enums';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]
    );

    if(!requiredRoles) return true;
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const userRole = request.headers['x-user-role'] as Role;
    
    return requiredRoles.includes(userRole);
  }
}
```

```bash
# create controller
$ nest g controller user-roles
```

```bash
# user-roles.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/guards/roles/roles.decorator';
import { Role } from 'src/guards/roles/roles.enums';
import { RolesGuard } from 'src/guards/roles/roles.guard';

@Controller('user-roles')
export class UserRolesController {

    @Get('admin-data')
    @UseGuards(RolesGuard)
    @Roles(Role.Admin)
    getAdminData(){
        return { message: "Only Admins can access this data"};
    }

    @Get('user-data')
    getUserData(){
        return { message: 'Any authenticated user can access this data' };
    }

}
```

![](/public/Img/cannotaccessanyone.png)

##### Note: headers e x-user-role dite hobe & value dite hobe ekhane value hishabe admin ache
![](/public/Img/admincanaccess.png)

##### Note: jekono user ei access korte parbe
![](/public/Img/anyonecanaccess.png)