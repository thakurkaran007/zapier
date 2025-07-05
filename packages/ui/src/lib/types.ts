import { z } from 'zod';

export const ZapCreateSchema = z.object({
    availableTriggerId: z.string(),
    triggerMetaData: z.any().optional(),
    actions: z.array(z.object({
        availableActionId: z.string(),
        actionMetaData: z.any().optional(),
    }))
})


export interface Zap {
    id: string;
    userId: string;
    name?: string;
    lastEditedAt?: string;
    trigger: {
      id: string;
      zapId: string;
      availableTriggerId: string;
      type: {
        id: string;
        image: string;
        name: string;
      };
    };
    actions: {
      id: string;
      zapId: string;
      availableActionId: string;
      sortingOrder: number;
      type: {
        id: string;
        image: string;
        name: string;
      };
    }[];
  }