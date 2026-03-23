import { Test, TestingModule } from '@nestjs/testing';
import { ScrimsController } from './scrims.controller';

describe('ScrimsController', () => {
  let controller: ScrimsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrimsController],
    }).compile();

    controller = module.get<ScrimsController>(ScrimsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
