import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { promises as fs } from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class PdfService {
  private readonly outputDir = './generated';

  async compileToPdf(texFilename: string): Promise<string> {
    const texPath = join(this.outputDir, texFilename);
    const pdfFilename = texFilename.replace('.tex', '.pdf');
    
    try {
      // Check if tex file exists
      await fs.access(texPath);
      
      // Compile with pdflatex (run twice for proper references and cleanup)
      const command = `cd ${this.outputDir} && pdflatex -interaction=nonstopmode -file-line-error "${texFilename}" && pdflatex -interaction=nonstopmode -file-line-error "${texFilename}"`;
      
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      
      if (stderr && stderr.includes('Error')) {
        throw new Error(`LaTeX compilation failed: ${stderr}`);
      }
      
      // Check if PDF was created
      const pdfPath = join(this.outputDir, pdfFilename);
      await fs.access(pdfPath);
      
      return pdfFilename;
    } catch (error) {
      console.error('PDF compilation error:', error);
      throw new Error(`Failed to compile PDF: ${error.message}`);
    }
  }

  async getPdfPath(pdfFilename: string): Promise<string> {
    const pdfPath = join(this.outputDir, pdfFilename);
    await fs.access(pdfPath); // Verify file exists
    return pdfPath;
  }

  async listPdfs(): Promise<string[]> {
    const files = await fs.readdir(this.outputDir);
    return files.filter(file => file.endsWith('.pdf'));
  }

  async deletePdf(pdfFilename: string): Promise<void> {
    const pdfPath = join(this.outputDir, pdfFilename);
    await fs.unlink(pdfPath);
  }

  async deleteTexAuxFiles(texFilename: string): Promise<void> {
    const baseName = texFilename.replace('.tex', '');
    const auxExtensions = ['.aux', '.log', '.out', '.toc', '.lof', '.lot'];
    
    for (const ext of auxExtensions) {
      try {
        const auxPath = join(this.outputDir, `${baseName}${ext}`);
        await fs.unlink(auxPath);
      } catch {
        // Ignore errors for non-existent files
      }
    }
  }
} 