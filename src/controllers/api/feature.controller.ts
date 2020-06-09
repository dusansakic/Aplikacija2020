import { Controller, UseGuards } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Feature } from 'src/entities/feature.entity';
import { FeatureService } from 'src/services/feature/feature.service';
import { RoleCheckerGuard } from 'src/misc/role.checker.quard';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';

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
  routes: {
    only: [
      'createManyBase',
      'createOneBase',
      'getManyBase',
      'getOneBase',
      'updateOneBase',
    ],
    createManyBase: {
      decorators: [UseGuards(RoleCheckerGuard), AllowToRoles('administrator')],
    },
    createOneBase: {
      decorators: [UseGuards(RoleCheckerGuard), AllowToRoles('administrator')],
    },
    getManyBase: {
      decorators: [
        UseGuards(RoleCheckerGuard),
        AllowToRoles('administrator', 'user'),
      ],
    },
    getOneBase: {
      decorators: [
        UseGuards(RoleCheckerGuard),
        AllowToRoles('administrator', 'user'),
      ],
    },
    updateOneBase: {
      decorators: [UseGuards(RoleCheckerGuard), AllowToRoles('administrator')],
    },
  },
})
export class FeatureController {
  constructor(public service: FeatureService) {}
}
