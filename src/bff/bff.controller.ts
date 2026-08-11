import { Controller, Get, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('api/v1/dashboard')
export class BffController {
  constructor(private readonly httpService: HttpService) {}

  @Get('product-details/:id')
  async getProductDetails(@Param('id') id: string) {
    const catalogUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:3000';
    const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003';

    // Ejecutar ambas peticiones HTTP en paralelo
    const [productRes, inventoryRes] = await Promise.allSettled([
      firstValueFrom(this.httpService.get(`${catalogUrl}/products/${id}`)),
      firstValueFrom(this.httpService.get(`${inventoryUrl}/inventory/${id}`)),
    ]);

    return {
      product: productRes.status === 'fulfilled' ? productRes.value.data : null,
      inventory: inventoryRes.status === 'fulfilled' ? inventoryRes.value.data : null,
    };
  }
}