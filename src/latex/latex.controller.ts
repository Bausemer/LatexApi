import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { LatexService } from './latex.service';
import { PdfService } from './pdf.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { promises as fs } from 'fs';

@Controller('latex')
export class LatexController {
  constructor(
    private readonly latexService: LatexService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('create-document')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: async (req, file, cb) => {
        // Ensure uploads directory exists
        try {
          await fs.mkdir('./uploads', { recursive: true });
          cb(null, './uploads');
        } catch (error) {
          cb(error, './uploads');
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      }
    })
  }))
  async createDocument(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      // Parse the body if it's a string (from FormData)
      let documentData: CreateDocumentDto;
      
      if (typeof createDocumentDto === 'string') {
        documentData = JSON.parse(createDocumentDto);
      } else {
        documentData = createDocumentDto;
        
        // Handle case where chapters is sent as a stringified JSON
        if (documentData.chapters && typeof documentData.chapters === 'string') {
          documentData.chapters = JSON.parse(documentData.chapters);
        }
        
        // Handle case where pdfInserts is sent as a stringified JSON
        if (documentData.pdfInserts && typeof documentData.pdfInserts === 'string') {
          documentData.pdfInserts = JSON.parse(documentData.pdfInserts);
        }
      }

      // Map uploaded files to their original filenames if pdfInserts are provided
      let processedFiles = files;
      if (documentData.pdfInserts && documentData.pdfInserts.length > 0 && files && files.length > 0) {
        console.log('Processing PDF inserts:', documentData.pdfInserts);
        console.log('Uploaded files:', files.map(f => ({ 
          originalname: f.originalname, 
          filename: f.filename,
          fieldname: f.fieldname,
          mimetype: f.mimetype,
          size: f.size
        })));
        
        // Create a mapping between original filenames and uploaded files
        const fileMapping = new Map<string, Express.Multer.File>();
        
        // Map files by their original names
        files.forEach(file => {
          console.log(`Processing file: ${file.originalname} -> ${file.filename}`);
          // Find the corresponding pdfInsert entry
          const pdfInsert = documentData.pdfInserts.find(insert => 
            insert.filename === file.originalname
          );
          if (pdfInsert) {
            fileMapping.set(pdfInsert.filename, file);
            console.log(`Mapped ${pdfInsert.filename} to uploaded file ${file.filename}`);
          } else {
            console.log(`No pdfInsert found for file: ${file.originalname}`);
          }
        });
        
        // Update pdfInserts with the actual uploaded filenames
        documentData.pdfInserts.forEach(pdfInsert => {
          const uploadedFile = fileMapping.get(pdfInsert.filename);
          if (uploadedFile) {
            pdfInsert.filename = uploadedFile.filename; // Use the uploaded filename
            console.log(`Updated pdfInsert filename to: ${pdfInsert.filename}`);
          } else {
            console.log(`Warning: No uploaded file found for ${pdfInsert.filename}`);
          }
        });
      }

      const filename = await this.latexService.createDocument(documentData, files);
      
      return {
        success: true,
        filename,
        message: 'LaTeX document created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to create document: ${error.message}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('documents')
  async listDocuments() {
    try {
      const documents = await this.latexService.listDocuments();
      return {
        success: true,
        documents,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to list documents: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('document/:filename')
  async getDocument(@Param('filename') filename: string) {
    try {
      const content = await this.latexService.getDocument(filename);
      return {
        success: true,
        filename,
        content,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to get document: ${error.message}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('compile/:filename')
  async compileToPdf(@Param('filename') filename: string) {
    try {
      const pdfFilename = await this.pdfService.compileToPdf(filename);
      
      // Clean up auxiliary files
      await this.pdfService.deleteTexAuxFiles(filename);
      
      return {
        success: true,
        pdfFilename,
        message: 'PDF compiled successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to compile PDF: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pdf/:filename')
  async downloadPdf(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const pdfPath = await this.pdfService.getPdfPath(filename);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      return res.sendFile(pdfPath, { root: '.' });
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to download PDF: ${error.message}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('pdfs')
  async listPdfs() {
    try {
      const pdfs = await this.pdfService.listPdfs();
      return {
        success: true,
        pdfs,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to list PDFs: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('delete-document/:filename')
  async deleteDocument(@Param('filename') filename: string) {
    try {
      await this.latexService.deleteDocument(filename);
      
      return {
        success: true,
        message: 'Document deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to delete document: ${error.message}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('delete-pdf/:filename')
  async deletePdf(@Param('filename') filename: string) {
    try {
      await this.pdfService.deletePdf(filename);
      
      return {
        success: true,
        message: 'PDF deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to delete PDF: ${error.message}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('example-document')
  async createExampleDocument() {
    try {
      const exampleData: CreateDocumentDto = {
        title: 'Example Document',
        author: 'John Doe',
        chapters: [
          {
            title: 'Introduction',
            sections: [
              {
                title: 'Overview',
                content: 'This is an example document created with the LaTeX API.',
                tables: [
                  {
                    caption: 'Sample Data Table',
                    headers: ['Name', 'Age', 'City'],
                    rows: [
                      ['Alice', '25', 'New York'],
                      ['Bob', '30', 'Los Angeles'],
                      ['Charlie', '35', 'Chicago'],
                    ],
                  },
                ],
              },
            ],
          },
          {
            title: 'Results',
            sections: [
              {
                title: 'Data Analysis',
                content: 'Here we present the results of our analysis.',
              },
            ],
          },
        ],
      };

      const filename = await this.latexService.createDocument(exampleData);
      
      return {
        success: true,
        filename,
        message: 'Example document created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to create example document: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 