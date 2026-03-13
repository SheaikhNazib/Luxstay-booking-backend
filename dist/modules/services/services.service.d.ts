import { Repository } from 'typeorm';
import { Service } from './services.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesService {
    private readonly serviceRepo;
    constructor(serviceRepo: Repository<Service>);
    findAll(): Promise<Service[]>;
    findOne(id: string): Promise<Service>;
    create(dto: CreateServiceDto): Promise<Service>;
    update(id: string, dto: UpdateServiceDto): Promise<Service>;
    remove(id: string): Promise<void>;
}
