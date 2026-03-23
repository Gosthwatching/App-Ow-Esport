import { Test, TestingModule } from '@nestjs/testing';
import { TierListService } from './tier-list.service';

describe('TierListService', () => {
  let service: TierListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TierListService,
        {
          provide: 'DATABASE_POOL',
          useValue: { query: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TierListService>(TierListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
