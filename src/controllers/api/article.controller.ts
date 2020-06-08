/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Article } from 'entities/article.entity';
import { ArticleService } from 'src/services/article/article.service';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { StorageConfig } from 'config/storage.config';
import { PhotoService } from 'src/services/photo/photo.service';
import { Photo } from 'entities/photo.entity';

@Controller('api/article')
@Crud({
  model: {
    type: Article,
  },
  params: {
    id: {
      field: 'articleId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      category: {
        eager: true,
      },
      photos: {
        eager: true,
      },
      articlePrices: {
        eager: true,
      },
      articleFeatures: {
        eager: true,
      },
      features: {
        eager: true,
      },
    },
  },
})
export class ArticleController {
  constructor(
    public service: ArticleService,
    public photoService: PhotoService,
  ) {}

  @Post('createFull')
  createFullArticle(
    @Body() data: AddArticleDto,
  ): Promise<Article | ApiResponse> {
    return this.service.createFullArticle(data);
  }

  @Post(':id/uploadPhoto')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: StorageConfig.photoDestination,
        filename: (req, file, callback) => {
          const original: string = file.originalname;
          let normalized = original.replace(/\s+/g, '-');
          normalized = normalized.replace(/[^A-z0-9\.\-]/g, '');
          const sada = new Date();
          let datePart = '';
          datePart += sada.getFullYear().toString();
          datePart += (sada.getMonth() + 1).toString();
          datePart += sada.getDate().toString();

          const randomPart: string = new Array(10)
            .fill(0)
            .map(e => (Math.random() * 9).toFixed(0).toString())
            .join('');

          const fileName = datePart + '-' + randomPart + '-' + normalized;

          callback(null, fileName.toLowerCase());
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.toLowerCase().match(/\.(jpg|png)$/)) {
          req.fileFilterError = 'Bad file extension !!';
          callback(null, false);
          return;
        }

        if (
          !(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))
        ) {
          req.fileFilterError = 'Bad file content !!';
          callback(null, false);
          return;
        }

        callback(null, true);
      },
      limits: {
        files: 1,
        fileSize: StorageConfig.photoMaxFileSize,
      },
    }),
  )
  async uploadPhoto(
    @Param('id') articleId: number,
    @UploadedFile() photo,
    @Req() req,
  ): Promise<ApiResponse | Photo> {
    if (req.fileFilterError) {
      return new ApiResponse('error', -4002, req.fileFilterError);
    }
    if (!photo) {
      return new ApiResponse('error', -4002, 'Photo not uploaded !!');
    }
    const newPhoto: Photo = new Photo();
    newPhoto.articleId = articleId;
    newPhoto.imagePath = photo.filename;

    const savedPhoto = await this.photoService.add(newPhoto);
    if (!savedPhoto) {
      return new ApiResponse('error', -4001);
    }

    return savedPhoto;
  }
}
