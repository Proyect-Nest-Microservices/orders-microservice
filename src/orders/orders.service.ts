import { HttpStatus, Inject, Injectable, Logger, OnModuleInit, ParseUUIDPipe } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeStatusOrderDto } from './dto/change-status-order.dto';
import { PRODUCT_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Orders-Service')

  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy
  ) {
    super()
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('DataBase connected');
  }
  async create(createOrderDto: CreateOrderDto) {

    try {

      //* 1. Confirmar los ids de los productos
      const productIds = createOrderDto.items.map(item => item.productId)
      const products: any[] = await firstValueFrom(
        this.productClient.send({ cmd: 'validate_products' }, productIds)
      )

      console.log(products)

      //* 2. Calculo de los valores
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const price = products.find((product) => product.id === orderItem.productId).price;
        return acc + price * orderItem.quantity
      }, 0)

      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity
      }, 0)

      //* 3. Crear una transaccion de base de datos
      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price: products.find(product => product.id === orderItem.productId).price,
                producId: orderItem.productId,
                quantity: orderItem.quantity
              }))
            }
          }
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              producId: true,
              quantity: true
            }
          }

        }
      })

      return {
        ...order,
        OrderItem: order.OrderItem.map(orderItem => ({
          ...orderItem,
          name: products.find(product => product.id === orderItem.producId).name
        }))
      };

    } catch (error) {
      throw new RpcException({
        message: 'Check logs',
        status: HttpStatus.BAD_REQUEST
      })
    }


  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status
      }
    });

    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;

    return {
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status
        }
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage)
      }
    }
  }

  async findOne(id: string) {

    const order = await this.order.findFirst({
      where: { id },
      include: {
        OrderItem:
        {
          select: {
            price: true,
            producId: true,
            quantity: true
          }
        }
      }
    });


    if (!order) {
      throw new RpcException({
        message: `Order with id ${id} not found`,
        status: HttpStatus.NOT_FOUND
      })
    }

    const productIds = order.OrderItem.map(orderItem => orderItem.producId)
    const products: any[] = await firstValueFrom(
      this.productClient.send({ cmd: 'validate_products' }, productIds)
    )



    return {
      ...order,
      //OrderItem: order.OrderItem.map(orderItem => ({
      //  ...orderItem,
      //  name: products.find(product => product.id === orderItem.producId).name
      //}))
    };

  }

  async changeStatus(changeStatusOrderDto: ChangeStatusOrderDto) {
    const { id, status } = changeStatusOrderDto;

    const order = await this.findOne(id);
    if (order.status === status) {
      return order
    }
    return this.order.update({
      where: { id },
      data: { status: status }
    })


  }


}
