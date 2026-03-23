import { Test, TestingModule } from '@nestjs/testing';
import { ScrimsService } from './scrims.service';

describe('ScrimsService', () => {
  let service: ScrimsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrimsService],
    }).compile();

    service = module.get<ScrimsService>(ScrimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
