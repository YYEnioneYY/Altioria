import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CategoriesService } from './categories.service';
import { AdminCategoryResponseDto } from './dto/admin-category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

const MAX_CATEGORY_IMAGE_SIZE = 100 * 1024 * 1024;

@ApiTags('Admin categories')
@Controller('admin/categories')
@UseGuards(AdminSessionGuard)
export class AdminCategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: MAX_CATEGORY_IMAGE_SIZE,
      },
    }),
  )
  @ApiOperation({
    summary: 'Создать категорию',
  })
  create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: MAX_CATEGORY_IMAGE_SIZE,
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode:
            HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image?: Express.Multer.File,
  ): Promise<AdminCategoryResponseDto> {
    return this.categoriesService.create(
      dto,
      image?.buffer,
    );
  }
}