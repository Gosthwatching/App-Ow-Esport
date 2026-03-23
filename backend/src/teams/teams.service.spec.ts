import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';

describe('TeamsService', () => {
  let service: TeamsService;

  const databasePoolMock = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: 'DATABASE_POOL',
          useValue: databasePoolMock,
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
