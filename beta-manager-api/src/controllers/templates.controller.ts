import { Request, Response, NextFunction } from 'express';
import { baserow } from '../services/baserow.service';
import { BaserowEmailTemplate } from '../types/baserow';

function transformTemplate(template: BaserowEmailTemplate) {
  return {
    id: template.id,
    name: template.name,
    subject: template.subject,
    body: template.body,
    variables: template.variables ? JSON.parse(template.variables) : [],
    is_active: template.is_active,
    created_at: template.created_on,
    updated_at: template.updated_on,
  };
}

export async function listTemplates(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await baserow.listRows<BaserowEmailTemplate>('email_templates', {
      size: 100,
    });

    res.json({
      results: result.results.map(transformTemplate),
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
}
