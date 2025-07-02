import { Module } from '@nestjs/common';
import { LatexController } from './latex.controller';
import { LatexService } from './latex.service';
import { PdfService } from './pdf.service';

@Module({
  controllers: [LatexController],
  providers: [LatexService, PdfService],
})
export class LatexModule {} 