import { Test, TestingModule } from '@nestjs/testing';
import { HeroesService } from './heroes.service';

describe('HeroesService', () => {
  let service: HeroesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeroesService,
        {
          provide: 'DATABASE_POOL',
          useValue: { query: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<HeroesService>(HeroesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
