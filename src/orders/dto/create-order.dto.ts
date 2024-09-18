import { ArrayMinSize, IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer";
import { OrderItemDto } from "./order-item.dto";

export class CreateOrderDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(()=> OrderItemDto)
    items:OrderItemDto[]
    
    //    @IsNumber()
    //    @IsPositive()
    //    totalAmount: number;
    
    
    //    @IsNumber()
    //    @IsPositive()
    //    totalItems: number;

    //    @IsOptional()
    //    @IsEnum(OrderStatusList, {
    //        message: `Possible status value are ${OrderStatusList}`
    //    })
    //    status: OrderStatus = OrderStatus.PENDING;

    //    @IsBoolean()
    //    @IsOptional()
    //    paid: boolean = false;

}
