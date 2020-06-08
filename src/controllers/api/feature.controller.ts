import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Feature } from 'src/entities/feature.entity';
import { FeatureService } from 'src/services/feature/feature.service';

@Controller('api/feature')
@Crud({
  model: {
    type: Feature,
  },
  params: {
    id: {
      field: 'featureId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      /* categories: {
        eager: true,
      },
      parentFeature: {
        eager: false,
      },
      features: {
        eager: true,
      },
      articles: {
        eager: false,
      }, */
      articleFeatures: {
        eager: false,
      },
      articles: {
        eager: false,
      },
      category: {
        eager: true,
      },
    },
  },
})
export class FeatureController {
  constructor(public service: FeatureService) {}
}
