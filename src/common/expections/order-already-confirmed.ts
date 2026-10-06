import {OrderStatus} from "../../../enum/order-status.enum";

export class Order {
    private status: OrderStatus;

    constructor() { 
        this.status = OrderStatus.PENDING;
    }
    public getStatus(): OrderStatus {
        return this.status;
    }

    public confirmOrder(): void {
        this.status = status;
    }
    