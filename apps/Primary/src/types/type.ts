import { z } from 'zod';

export const ZapCreateSchema = z.object({
    availableTriggerId: z.string(),
    actions: z.array(z.object({
        availableActionId: z.string(),
        metaData: z.any().optional(),
    }))
})

