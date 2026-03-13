"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const booking_entity_1 = require("../bookings/booking.entity");
let Service = class Service {
    id;
    name;
    description;
    price;
    capacity;
    image;
    bookings;
    createdAt;
    updatedAt;
};
exports.Service = Service;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-v4' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Service.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Deluxe King Room' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Service.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Spacious room with ocean view' }),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Service.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 199.99 }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Service.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Service.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/room.jpg or data:image/jpeg;base64,...',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Service.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_entity_1.Booking, (booking) => booking.service),
    __metadata("design:type", Array)
], Service.prototype, "bookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Service.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Service.prototype, "updatedAt", void 0);
exports.Service = Service = __decorate([
    (0, typeorm_1.Entity)('services')
], Service);
//# sourceMappingURL=services.entity.js.map