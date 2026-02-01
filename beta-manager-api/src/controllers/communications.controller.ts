import { Request, Response, NextFunction } from 'express';
import { baserow, BaserowError } from '../services/baserow.service';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import {
  CreateCommunicationInput,
  CommunicationQueryInput,
} from '../schemas/communication.schema';
import { BaserowCommunication } from '../types/baserow';
import { CommunicationChannel, CommunicationDirection, CommunicationStatus } from '../config/constants';
import { formatDateForBaserow } from '../utils/dates';

// Helper to transform Baserow communication to API response
function transformCommunication(comm: BaserowCommunication) {
  return {
    id: comm.id,
    tester_id: comm.tester?.[0]?.id,
    tester_name: comm.tester?.[0]?.value,
    channel: comm.channel as CommunicationChannel,
    direction: comm.direction as CommunicationDirection,
    subject: comm.subject,
    content: comm.content,
    template_name: comm.template_name,
    status: comm.status as CommunicationStatus | undefined,
    sent_at: comm.sent_at,
    opened_at: comm.opened_at,
    clicked_at: comm.clicked_at,
    created_at: comm.created_on,
  };
}

export async function listCommunications(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tester_id, channel, direction, page = 1, size = 20 } = req.query as unknown as CommunicationQueryInput;

    const filters: Record<string, string> = {};
    if (tester_id) filters.tester = tester_id.toString();
    if (channel) filters.channel = channel;
    if (direction) filters.direction = direction;

    const result = await baserow.listRows<BaserowCommunication>('communications', {
      page,
      size,
      orderBy: '-sent_at',
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    res.json({
      results: result.results.map(transformCommunication),
      count: result.count,
      page,
      size,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCommunication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid communication ID');
    }

    const comm = await baserow.getRow<BaserowCommunication>('communications', id);
    res.json(transformCommunication(comm));
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Communication not found'));
    }
    next(error);
  }
}

export async function createCommunication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tester_id, channel, direction, subject, content, template_name, status } = req.body as CreateCommunicationInput;

    const comm = await baserow.createRow<BaserowCommunication>('communications', {
      tester: tester_id.toString(),
      channel,
      direction,
      subject,
      content,
      template_name,
      status: status || 'sent',
      sent_at: formatDateForBaserow(new Date()),
    });

    res.status(201).json(transformCommunication(comm));
  } catch (error) {
    next(error);
  }
}
