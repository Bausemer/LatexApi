export class CreateDocumentDto {
  title: string;
  author: string;
  filename?: string; // Optional custom filename (without extension)
  chapters: ChapterDto[];
  pdfInserts?: PdfInsertDto[]; // Array of PDF insertions with positions
}

export class PdfInsertDto {
  filename: string;
  insertAfterPage?: number; // Page number after which to insert (optional, defaults to end)
  insertAfterChapter?: number; // Chapter number after which to insert (alternative to page)
}

export class ChapterDto {
  title: string;
  sections: SectionDto[];
}

export class SectionDto {
  title: string;
  content?: string;
  tables?: TableDto[];
}

export class TableDto {
  caption: string;
  headers: string[];
  rows: string[][];
  alignment?: string;
} 