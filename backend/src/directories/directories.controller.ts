import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

// Интерфейсы для справочников
export interface Counterparty {
  id: string;
  name: string;
  fullName: string;
  type: 'client' | 'supplier';
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  inn?: string;
  kpp?: string;
  bankAccount?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConcreteGrade {
  id: string;
  name: string;
  description: string;
  strength: string;
  mobility: string;
  frostResistance: string;
  waterResistance: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  capacity: number;
  currentStock: number;
  manager: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  name: string;
  type: 'cement' | 'sand' | 'gravel' | 'water' | 'additive' | 'other';
  unit: 'kg' | 'ton' | 'm3' | 'liter' | 'piece';
  price: number;
  supplier?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Controller('api/directories')
@UseGuards(JwtAuthGuard)
export class DirectoriesController {
  constructor(private prisma: PrismaService) {}

  // ===== КОНТРАГЕНТЫ =====
  @Get('counterparties')
  async getCounterparties() {
    const counterparties = await this.prisma.counterparty.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    return counterparties;
  }

  @Post('counterparties')
  async createCounterparty(@Body() data: Omit<Counterparty, 'id' | 'createdAt' | 'updatedAt'>) {
    const counterparty = await this.prisma.counterparty.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return counterparty;
  }

  @Put('counterparties/:id')
  async updateCounterparty(@Param('id') id: string, @Body() data: Partial<Counterparty>) {
    const counterparty = await this.prisma.counterparty.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
    return counterparty;
  }

  @Delete('counterparties/:id')
  async deleteCounterparty(@Param('id') id: string) {
    await this.prisma.counterparty.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() }
    });
    return { message: 'Контрагент удален' };
  }

  // ===== МАРКИ БЕТОНА =====
  @Get('concrete-grades')
  async getConcreteGrades() {
    const grades = await this.prisma.concreteGrade.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    return grades;
  }

  @Post('concrete-grades')
  async createConcreteGrade(@Body() data: Omit<ConcreteGrade, 'id' | 'createdAt' | 'updatedAt'>) {
    const grade = await this.prisma.concreteGrade.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return grade;
  }

  // ===== СКЛАДЫ =====
  @Get('warehouses')
  async getWarehouses() {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    return warehouses;
  }

  @Post('warehouses')
  async createWarehouse(@Body() data: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) {
    const warehouse = await this.prisma.warehouse.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return warehouse;
  }

  // ===== МАТЕРИАЛЫ =====
  @Get('materials')
  async getMaterials() {
    const materials = await this.prisma.material.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    return materials;
  }

  @Post('materials')
  async createMaterial(@Body() data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) {
    const material = await this.prisma.material.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return material;
  }
}
