import { OrderStatus } from "../../../enum/order-status.enum";

export class Order {
    private status: OrderStatus;

    constructor(
        public readonly orderId: string,
        public readonly customerId: string,
        status: OrderStatus,
        public readonly updatedAt: Date = new Date(),
        public readonly createdAt: Date = new Date(),
        public readonly deletedAt: Date | null = null
    ) {
        this.status = status ?? OrderStatus.PENDING;
    }

    public getStatus(): OrderStatus {
        return this.status;
    }

    public confirmOrder(): void {
        if (this.status !== OrderStatus.PENDING) {
            throw new Error('Order cannot be confirmed if it is not in PENDING status');
        }
        this.status = OrderStatus.CONFIRMED;
    }
}
