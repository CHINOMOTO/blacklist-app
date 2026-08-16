import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

        if (!token) {
            return NextResponse.json({ success: true, message: "No token configured" });
        }

        if (!body.events || body.events.length === 0) {
            return NextResponse.json({ success: true });
        }

        for (const event of body.events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text.trim().toUpperCase();

                if (userMessage === 'ID' || userMessage === 'ＩＤ') {
                    const sourceId = event.source.groupId || event.source.userId;
                    
                    let replyText = `あなたのユーザーIDはこちらです：\n\n${sourceId}\n\nこの文字列をコピーして管理者に伝えてください。`;
                    
                    if (event.source.type === 'group') {
                        replyText = `このグループのIDはこちらです：\n\n${sourceId}\n\nこの文字列をコピーしてシステム（Vercel）に登録してください。`;
                    }

                    await fetch('https://api.line.me/v2/bot/message/reply', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            replyToken: event.replyToken,
                            messages: [{ type: "text", text: replyText }]
                        })
                    });
                }
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ success: true, error: "Internal Server Error" });
    }
}
