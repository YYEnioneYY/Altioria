import {
  Controller,
  Get,
  Header,
} from '@nestjs/common';

import {
  ApiExcludeController,
} from '@nestjs/swagger';

import {
  SkipThrottle,
} from '@nestjs/throttler';

import {
  SitemapService,
} from './sitemap.service';

@ApiExcludeController()
@SkipThrottle()
@Controller('sitemap.xml')
export class SitemapController {
  constructor(
    private readonly sitemapService:
      SitemapService,
  ) {}

  @Get()
  @Header(
    'Content-Type',
    'application/xml; charset=utf-8',
  )
  @Header(
    'Cache-Control',
    'public, max-age=3600',
  )
  generate(): Promise<string> {
    return this.sitemapService.generate();
  }
}