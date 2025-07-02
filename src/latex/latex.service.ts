import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TexDocument, TexChapter, TexSection, TexTable } from './models/tex-document';
import { CreateDocumentDto, PdfInsertDto } from './dto/create-document.dto';

@Injectable()
export class LatexService {
  private readonly outputDir = './generated';

  constructor() {
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  async createDocument(documentData: CreateDocumentDto, uploadedFiles?: Express.Multer.File[]): Promise<string> {
    const document = new TexDocument(documentData.title, documentData.author);

    // Process chapters and sections
    documentData.chapters.forEach(chapterData => {
      const chapter = new TexChapter(chapterData.title);
      
      chapterData.sections.forEach(sectionData => {
        const section = new TexSection(sectionData.title, sectionData.content);
        
        // Add tables if any
        if (sectionData.tables) {
          sectionData.tables.forEach(tableData => {
            const table = new TexTable(tableData.caption, tableData.headers, tableData.alignment);
            tableData.rows.forEach(row => table.addRow(row));
            section.addTable(table);
          });
        }
        
        chapter.addSection(section);
      });
      
      document.addChapter(chapter);
    });

    // Handle PDF inserts with positions
    if (documentData.pdfInserts && documentData.pdfInserts.length > 0) {
      console.log('Processing PDF inserts in service:', documentData.pdfInserts);
      documentData.pdfInserts.forEach(pdfInsert => {
        const pdfPath = `../uploads/${pdfInsert.filename}`;
        console.log(`Adding PDF insert: ${pdfPath}`);
        
        // Determine insertion position
        let afterPage: number | undefined;
        
        if (pdfInsert.insertAfterChapter !== undefined) {
          // Insert after specific chapter
          afterPage = pdfInsert.insertAfterChapter;
          console.log(`Inserting after chapter: ${afterPage}`);
        } else if (pdfInsert.insertAfterPage !== undefined) {
          // Insert after specific page
          afterPage = pdfInsert.insertAfterPage;
          console.log(`Inserting after page: ${afterPage}`);
        } else {
          console.log('Inserting at end of document');
        }
        
        document.addPdfInsert(pdfPath, afterPage);
      });
    }
    
    // Handle legacy uploaded files (for backward compatibility)
    if (uploadedFiles && uploadedFiles.length > 0 && (!documentData.pdfInserts || documentData.pdfInserts.length === 0)) {
      console.log('Using legacy file handling for:', uploadedFiles.map(f => f.filename));
      uploadedFiles.forEach(file => {
        const pdfPath = `../uploads/${file.filename}`;
        document.addPdfInsert(pdfPath); // Insert at end
      });
    }

    // Generate LaTeX content
    const latexContent = document.generateLatex();
    
    // Generate filename - use custom name or generate UUID
    let baseFilename: string;
    if (documentData.filename && documentData.filename.trim()) {
      // Sanitize filename - remove invalid characters
      baseFilename = documentData.filename.trim()
        .replace(/[^a-zA-Z0-9\-_]/g, '_')
        .substring(0, 100); // Limit length
    } else {
      baseFilename = `document_${uuidv4()}`;
    }
    
    const filename = `${baseFilename}.tex`;
    const filepath = join(this.outputDir, filename);
    
    // Check if file exists and make unique if needed
    let counter = 1;
    let finalFilename = filename;
    let finalFilepath = filepath;
    
    while (await this.fileExists(finalFilepath)) {
      finalFilename = `${baseFilename}_${counter}.tex`;
      finalFilepath = join(this.outputDir, finalFilename);
      counter++;
    }
    
    await fs.writeFile(finalFilepath, latexContent, 'utf-8');
    
    return finalFilename;
  }

  async getDocument(filename: string): Promise<string> {
    const filepath = join(this.outputDir, filename);
    return await fs.readFile(filepath, 'utf-8');
  }

  async listDocuments(): Promise<string[]> {
    const files = await fs.readdir(this.outputDir);
    return files.filter(file => file.endsWith('.tex'));
  }

  getDocumentPath(filename: string): string {
    return join(this.outputDir, filename);
  }

  private async fileExists(filepath: string): Promise<boolean> {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  async deleteDocument(filename: string): Promise<void> {
    const filepath = join(this.outputDir, filename);
    await fs.unlink(filepath);
  }
} 