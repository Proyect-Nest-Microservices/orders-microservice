import { OrderStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { OrderStatusList } from "../enum/orders.enum";
import { PaginationDto } from "src/common";


export class OrderPaginationDto extends PaginationDto{


    @IsOptional()
    @IsEnum(OrderStatusList, {
        message: `Valid status are ${OrderStatusList}`
    })
    status: OrderStatus;
}