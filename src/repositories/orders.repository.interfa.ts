export class Oder AlreadyConfirmedException extends Error {
    constructor() {
        super('Order has already been confirmed.');
        this.name = 'OrderAlreadyConfirmedException';
    }