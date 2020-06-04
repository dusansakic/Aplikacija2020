import { Controller, Get } from '@nestjs/common';
import { AdministratorService } from '../services/administrator/administrator.service';

@Controller()
export class AppController {
  constructor(private administratorService: AdministratorService) {}

  @Get() //http://localhost:3000/
  getIndex(): string {
    return 'Home Page';
  }
}
