import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseUUIDPipe,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CategoriesService } from './categories.service';
import { AdminCategoryResponseDto } from './dto/admin-category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

import { UpdateCategoryDto } from './dto/update-category.dto';

const MAX_CATEGORY_IMAGE_SIZE = 20 * 1024 * 1024;

@ApiTags('Admin categories')
@Controller('admin/categories')
@UseGuards(AdminSessionGuard)
export class AdminCategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Получить все категории для админ-панели',
  })
  getAll(): Promise<AdminCategoryResponseDto[]> {
    return this.categoriesService.findAllForAdmin();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить категорию по ID для админ-панели',
  })
  getOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,
  ): Promise<AdminCategoryResponseDto> {
    return this.categoriesService.findOneForAdmin(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: MAX_CATEGORY_IMAGE_SIZE,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Создать категорию',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['slug', 'nameRu', 'nameEn'],
      properties: {
        slug: {
          type: 'string',
          example: 'tables',
        },
        nameRu: {
          type: 'string',
          example: 'Столы',
        },
        nameEn: {
          type: 'string',
          example: 'Tables',
        },
        sortOrder: {
          type: 'integer',
          example: 10,
        },
        isPublished: {
          type: 'boolean',
          example: false,
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
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

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: MAX_CATEGORY_IMAGE_SIZE,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Изменить категорию',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          example: 'tables',
        },
        nameRu: {
          type: 'string',
          example: 'Столы',
        },
        nameEn: {
          type: 'string',
          example: 'Tables',
        },
        sortOrder: {
          type: 'integer',
          example: 10,
        },
        isPublished: {
          type: 'boolean',
          example: true,
        },
        removeImage: {
          type: 'boolean',
          example: false,
          description: 'Удалить текущее изображение',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Новое изображение категории',
        },
      },
    },
  })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  
    @Body()
    dto: UpdateCategoryDto,
  
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
    return this.categoriesService.update(
      id,
      dto,
      image?.buffer,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить категорию',
  })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ): Promise<void> {
    await this.categoriesService.remove(id);
  }
}