import fs from 'fs';
import { promisify } from 'util';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GlobalGuard } from '~/guards/global/global.guard';
import { UtilsService } from '~/services/utils.service';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { MetaApiLimiterGuard } from '~/guards/meta-api-limiter.guard';
import { PublicApiLimiterGuard } from '~/guards/public-api-limiter.guard';

@Controller()
export class UtilsController {
  private version: string;

  constructor(protected readonly utilsService: UtilsService) {}

  @UseGuards(PublicApiLimiterGuard)
  @Get('/api/v1/version')
  async getVersion() {
    if (process.env.NC_CLOUD !== 'true') {
      return this.utilsService.versionInfo();
    }

    if (!this.version) {
      try {
        this.version = await promisify(fs.readFile)('./public/nc.txt', 'utf-8');
      } catch {
        this.version = 'Not available';
      }
    }
    return this.version;
  }

  @UseGuards(MetaApiLimiterGuard, GlobalGuard)
  @Post(['/api/v1/db/meta/connection/test', '/api/v2/meta/connection/test'])
  @Acl('testConnection', {
    scope: 'org',
  })
  @HttpCode(200)
  async testConnection(@Body() body: any) {
    return await this.utilsService.testConnection({ body });
  }

  @UseGuards(PublicApiLimiterGuard)
  @Get([
    '/api/v1/db/meta/nocodb/info',
    '/api/v2/meta/nocodb/info',
    // todo: remove this once we added the health api
    '/api/v1/meta/nocodb/info',
  ])
  async appInfo(@Request() req) {
    return await this.utilsService.appInfo({
      req: {
        ncSiteUrl: (req as any).ncSiteUrl,
      },
    });
  }

  @UseGuards(PublicApiLimiterGuard)
  @Get('/api/v1/health')
  async appHealth() {
    return await this.utilsService.appHealth();
  }

  @UseGuards(PublicApiLimiterGuard)
  @Post(['/api/v1/db/meta/axiosRequestMake', '/api/v2/meta/axiosRequestMake'])
  @HttpCode(200)
  async axiosRequestMake(@Body() body: any) {
    return await this.utilsService.axiosRequestMake({ body });
  }

  @UseGuards(PublicApiLimiterGuard)
  @Post('/api/v1/url_to_config')
  @HttpCode(200)
  async urlToDbConfig(@Body() body: any) {
    return await this.utilsService.urlToDbConfig({
      body,
    });
  }

  @UseGuards(PublicApiLimiterGuard)
  @Get('/api/v1/aggregated-meta-info')
  async aggregatedMetaInfo() {
    // todo: refactor
    return (await this.utilsService.aggregatedMetaInfo()) as any;
  }
}
