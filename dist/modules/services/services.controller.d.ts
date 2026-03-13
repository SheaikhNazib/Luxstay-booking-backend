import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './services.entity';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAll(): Promise<Service[]>;
    findOne(id: string): Promise<Service>;
    create(dto: CreateServiceDto): Promise<Service>;
    update(id: string, dto: UpdateServiceDto): Promise<Service>;
    remove(id: string): Promise<void>;
}
