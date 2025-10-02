import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export interface InternalRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  userId: string;
  userName: string;
  userRole: string;
  createdAt: string;
  updatedAt: string;
  supplierDetails?: {
    supplierName: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
  };
}

@Controller('api/requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllRequests(@Request() req) {
    const user = req.user;
    
    // Проверяем, является ли пользователь менеджером
    const isManager = ['director', 'accountant', 'supply', 'developer', 'admin'].includes(user.role);
    
    if (isManager) {
      // Менеджеры видят все заявки
      const requests = await this.prisma.internalRequest.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return requests;
    } else {
      // Обычные пользователи видят только свои заявки
      const requests = await this.prisma.internalRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      return requests;
    }
  }

  @Post()
  async createRequest(@Body() requestData: Omit<InternalRequest, 'id' | 'createdAt' | 'updatedAt'>, @Request() req) {
    const user = req.user;
    
    const request = await this.prisma.internalRequest.create({
      data: {
        title: requestData.title,
        description: requestData.description,
        category: requestData.category,
        priority: requestData.priority,
        status: requestData.status,
        userId: user.id,
        userName: user.login,
        userRole: user.role,
        supplierDetails: requestData.supplierDetails ? JSON.stringify(requestData.supplierDetails) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return request;
  }

  @Put(':id')
  async updateRequest(@Param('id') id: string, @Body() requestData: Partial<InternalRequest>, @Request() req) {
    const user = req.user;
    
    // Проверяем права доступа
    const existingRequest = await this.prisma.internalRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      throw new Error('Заявка не найдена');
    }

    // Пользователь может редактировать только свои заявки, менеджеры - любые
    const isManager = ['director', 'accountant', 'supply', 'developer', 'admin'].includes(user.role);
    if (!isManager && existingRequest.userId !== user.id) {
      throw new Error('Нет прав для редактирования этой заявки');
    }

    const updatedRequest = await this.prisma.internalRequest.update({
      where: { id },
      data: {
        ...requestData,
        supplierDetails: requestData.supplierDetails ? JSON.stringify(requestData.supplierDetails) : existingRequest.supplierDetails,
        updatedAt: new Date()
      }
    });

    return updatedRequest;
  }

  @Delete(':id')
  async deleteRequest(@Param('id') id: string, @Request() req) {
    const user = req.user;
    
    // Проверяем права доступа
    const existingRequest = await this.prisma.internalRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      throw new Error('Заявка не найдена');
    }

    // Пользователь может удалять только свои заявки, менеджеры - любые
    const isManager = ['director', 'accountant', 'supply', 'developer', 'admin'].includes(user.role);
    if (!isManager && existingRequest.userId !== user.id) {
      throw new Error('Нет прав для удаления этой заявки');
    }

    await this.prisma.internalRequest.delete({
      where: { id }
    });

    return { message: 'Заявка удалена' };
  }
}
