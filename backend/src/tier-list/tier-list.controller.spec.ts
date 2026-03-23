import { Test, TestingModule } from '@nestjs/testing';
import { TierListController } from './tier-list.controller';
import { TierListService } from './tier-list.service';

describe('TierListController', () => {
  let controller: TierListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TierListController],
      providers: [
        {
          provide: TierListService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<TierListController>(TierListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
