import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (
    req: Request,
    res: Response
) => {
    res.send('Welcome to the chat! Enter your message:');
});

router.get('/json', (
    req: Request,
    res: Response
) => {
    try {
        console.log('Hitting "/chat/json" endpoint');
        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.log({ error })
    }
})

router.post('/chat', (
    req: Request,
    res: Response
) => {
    const { message }: { message: string } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    res.json({ receivedMessage: message });
});

export default router;