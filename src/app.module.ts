import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UserRolesController } from './user-roles/user-roles.controller';

@Module({
  imports: [ProductModule],
  controllers: [AppController, UserRolesController],
  providers: [AppService],
})
export class AppModule {}
