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

NestJS এ Guard হলো এমন একটি component যেটা request কে controller এ যাওয়ার আগে check করে।

অর্থাৎ, কোনো user request করার permission আছে কি না তা Guard দিয়ে নির্ধারণ করা হয়।

---

#### NestJS Guard কি?

সহজভাবে বললে:

👉 Guard = Authorization Check

যখন client request পাঠায় তখন flow সাধারণত এমন হয়:

```
Client Request
      ↓
Middleware
      ↓
Guard
      ↓
Interceptor
      ↓
Controller
      ↓
Service
```

Guard এর কাজ হলো:

- User login করা আছে কি না
- User এর role আছে কি না
- User এর permission আছে কি না

এসব check করা।

---

#### একটি Guard এর সহজ উদাহরণ

```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean {

    const request = context.switchToHttp().getRequest();

    if(request.headers.authorization){
      return true;
    }

    return false;
  }
}
```

এখানে কি হচ্ছে:

1️⃣ request আসলো
2️⃣ header এ token আছে কিনা check করা হলো
3️⃣ থাকলে true → controller এ যাবে
4️⃣ না থাকলে false → request block

---

#### Guard কোথায় ব্যবহার করা হয়

Controller বা route এ।

```ts
@UseGuards(AuthGuard)
@Get('profile')
getProfile(){
  return "User Profile";
}
```

মানে:

👉 user যদি guard pass করে তাহলে profile দেখতে পারবে।

---

#### Middleware আর Guard কি একই?

না, **Middleware এবং Guard আলাদা**।

| বিষয়                     | Middleware         | Guard             |
| ------------------------ | ------------------ | ----------------- |
| কাজ                      | Request modify করা | Permission check  |
| কোথায় চলে                | Request এর শুরুতে  | Controller এর আগে |
| Authorization            | সাধারণত না         | হ্যাঁ             |
| Access to route metadata | না                 | হ্যাঁ             |

---

#### Middleware কি করে

Middleware সাধারণত:

- logging
- request modify
- headers add
- body parsing

Example:

```ts
export function logger(req, res, next){
  console.log("Request Received");
  next();
}
```

---

#### Guard কি করে

Guard সাধারণত:

- Authentication
- Authorization
- Role checking
- Permission control

Example:

Admin route
User route
SuperAdmin route

এগুলো Guard দিয়ে control করা হয়।

---

#### বাস্তব উদাহরণ

ধরো:

/products → সবাই দেখতে পারবে
/admin/products → শুধু admin

তখন Guard ব্যবহার করা হয়।

@Roles('admin')
@UseGuards(RolesGuard)

---

#### Middleware vs Guard (বাস্তব পার্থক্য)

Middleware:

সব request এ run হয়

Guard:

specific route বা controller এ run হয়

---

#### সহজভাবে মনে রাখার টেকনিক

Middleware = request modify

Guard = request allow / block

---