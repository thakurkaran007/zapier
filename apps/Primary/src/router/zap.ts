import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { ZapCreateSchema } from '../types/type.js';
import { db } from '@repo/db/dist';

const router = Router();

router.post('/', authMiddleware, async (req:any, res:any) => {
    //@ts-ignore
    const id = req.id;  
    const body = req.body;
    const parsedData = ZapCreateSchema.safeParse(body);
    if (!parsedData.success) {  
        return res.status(400).json({ error: parsedData.error.errors });
    }
    
    const { availableTriggerId, actions } = parsedData.data;
    console.log("Creating zap for user:", id, "with trigger:", availableTriggerId, "and actions:", actions);

    try {
        const zap = await db.zap.create({
            data: {
                userId: id,
                trigger: {
                    create: {
                        availableTriggerId
                    } 
                },
                actions: {
                    create: actions.map((action, index) => ({
                        availableActionId: action.availableActionId,
                        metaData: action.metaData,
                        sortingOrder: index
                    })),
                },
            },
            include: {
                trigger: true,
                actions: true
            }
        });
        console.log("Zap created:", zap);
        return res.status(200).json(zap);
    } catch (error) {
        console.error("Error creating zap:", error);
        return res.status(500).json({ error: 'Failed to create zap' });
    }
});


router.get('/', authMiddleware, async (req:any, res:any) => {
    //@ts-ignore
    const id = req.id;
    console.log("req.id", id);
    const zaps = await db.zap.findMany({
        where: {
            userId: id,
        },
        include: {
            trigger: {
                include: {
                    type: true,
                }
            },
            actions: {
                include: {
                    type: true,
                }
            },
        }
    })

    if (!zaps) {
        return res.status(200).json([]);
    }
    console.log("zaps", zaps);
    return res.status(200).json(zaps);
})

router.get('/:zapId', authMiddleware, async (req:any, res:any) => {
    //@ts-ignore
    const id = req.id;

    const zapId = req.params.zapId;

    if (!zapId) {
        return res.status(400).json({ error: 'Zap ID is required' });
    }

    const zap = await db.zap.findFirst({
        where: {
            id: zapId,
            userId: id,
        },
        include: {
            trigger: {
                include: {
                    type: true,
                }
            },
            actions: {
                include: {
                    type: true,
                }
            },
        }
    })

    if (!zap) {
        return res.status(404).json({ error: 'Zap not found' });
    }

    return res.status(200).json(zap);
})

export const zapRouter = router;