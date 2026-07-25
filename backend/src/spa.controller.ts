import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Serves the built frontend's index.html for any non-API GET route so client-side
 * routing (react-router) works on hard refresh/direct URL — e.g. GET /dashboard.
 * Real static assets (JS/CSS/images) are already served by ServeStaticModule before
 * requests ever reach here; this only catches routes that aren't a file on disk.
 */
@Controller()
export class SpaController {
  @Get('*')
  serveIndex(@Res() res: Response) {
    const indexPath = join(__dirname, '..', 'public', 'index.html');
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Not found — frontend build not present on this server.');
    }
  }
}
