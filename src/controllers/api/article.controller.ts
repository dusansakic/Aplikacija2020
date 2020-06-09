/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Req,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Article } from 'src/entities/article.entity';
import { ArticleService } from 'src/services/article/article.service';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { StorageConfig } from 'config/storage.config';
import { PhotoService } from 'src/services/photo/photo.service';
import { Photo } from 'src/entities/photo.entity';
import * as fileType from 'file-type';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { EditArticleDto } from 'src/dtos/article/edit.article.dto';
import { RoleCheckerGuard } from 'src/misc/role.checker.quard';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';

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
  routes: {
    only: ['getOneBase', 'getManyBase'],
    getOneBase: {
      decorators: [
        UseGuards(RoleCheckerGuard),
        AllowToRoles('administrator', 'user'),
      ],
    },
    getManyBase: {
      decorators: [
        UseGuards(RoleCheckerGuard),
        AllowToRoles('administrator', 'user'),
      ],
    },
  },
})
export class ArticleController {
  constructor(
    public service: ArticleService,
    public photoService: PhotoService,
  ) {}

  @Post()
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  createFullArticle(
    @Body() data: AddArticleDto,
  ): Promise<Article | ApiResponse> {
    return this.service.createFullArticle(data);
  }

  @Patch(':id')
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  editFullArticle(@Param('id') id: number, @Body() data: EditArticleDto) {
    return this.service.editFullArticle(id, data);
  }

  @Post(':id/uploadPhoto')
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: StorageConfig.photo.destination,
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
            .map(() => (Math.random() * 9).toFixed(0).toString())
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
          req.fileFilterError = 'Bad file content type !!';
          callback(null, false);
          return;
        }

        callback(null, true);
      },
      limits: {
        files: 1,
        fileSize: StorageConfig.photo.maxSize,
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

    const fileTypeResult = await fileType.fromFile(photo.path);
    if (!fileTypeResult) {
      fs.unlinkSync(photo.path);
      return new ApiResponse('error', -4003, 'Cannot detect file type !!');
    }
    const realMimeType = fileTypeResult.mime;
    if (!(realMimeType.includes('jpeg') || realMimeType.includes('png'))) {
      fs.unlinkSync(photo.path);
      return new ApiResponse('error', -4003, 'Bad file content type !!');
    }

    await this.createThumb(photo);
    await this.createSmallImage(photo);

    const newPhoto: Photo = new Photo();
    newPhoto.articleId = articleId;
    newPhoto.imagePath = photo.filename;

    const savedPhoto = await this.photoService.add(newPhoto);
    if (!savedPhoto) {
      return new ApiResponse('error', -4001);
    }

    return savedPhoto;
  }

  async createThumb(photo) {
    const originalFilePath = photo.path;
    const fileName = photo.filename;
    const destinationFilePath =
      StorageConfig.photo.destination +
      StorageConfig.photo.resize.thumb.directory +
      fileName;

    await sharp(originalFilePath)
      .resize({
        fit: 'cover',
        width: StorageConfig.photo.resize.thumb.width,
        height: StorageConfig.photo.resize.thumb.height,
        background: {
          r: 255,
          g: 255,
          b: 255,
          alpha: 0.0,
        },
      })
      .toFile(destinationFilePath);
  }
  async createSmallImage(photo) {
    const originalFilePath = photo.path;
    const fileName = photo.filename;
    const destinationFilePath =
      StorageConfig.photo.destination +
      StorageConfig.photo.resize.small.directory +
      fileName;

    await sharp(originalFilePath)
      .resize({
        fit: 'cover',
        width: StorageConfig.photo.resize.small.width,
        height: StorageConfig.photo.resize.small.height,
        background: {
          r: 255,
          g: 255,
          b: 255,
          alpha: 0.0,
        },
      })
      .toFile(destinationFilePath);
  }

  @Delete(':articleId/deletePhoto/:photoId')
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  async deletePhoto(
    @Param('articleId') articleId: number,
    @Param('photoId') photoId: number,
  ) {
    const photo = await this.photoService.findOne({
      articleId: articleId,
      photoId: photoId,
    });
    if (!photo) {
      return new ApiResponse('error', -4004, 'Photo not found');
    }
    try {
      fs.unlinkSync(StorageConfig.photo.destination + photo.imagePath);
      fs.unlinkSync(
        StorageConfig.photo.destination +
          StorageConfig.photo.resize.thumb.directory +
          photo.imagePath,
      );
      fs.unlinkSync(
        StorageConfig.photo.destination +
          StorageConfig.photo.resize.small.directory +
          photo.imagePath,
      );
    } catch (e) {}
    const deleteResult = await this.photoService.deleteById(photo.photoId);

    if (deleteResult.affected === 0) {
      return new ApiResponse('error', -4004, 'Photo not found');
    }

    return new ApiResponse('ok', 0, 'One photo deleted');
  }
}
