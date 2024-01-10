import { Router, Request, Response } from 'express';

const router = Router()

router.get('/allusers', (
    req: Request,
    res: Response
) => {
    try {
        console.log("Getting all users()");
        res.status(200).json({ message: 'success' })
    } catch (error) {
        console.log({ error })
    }
})

export default router;