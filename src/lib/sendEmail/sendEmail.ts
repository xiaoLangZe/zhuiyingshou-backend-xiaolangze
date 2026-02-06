import { Resend } from 'resend';

// 这里本应该保密的（完成变成秘密变量）
const resend = new Resend('re_gGhri8wc_GimAAGy5VDTmjKe48bLvNk7XJx');

export async function sendEmail(to: [string], title: string, html: string){
    const { data, error } = await resend.emails.send({
        from: '追影兽 <noreply@xiaolangze.qzz.io>',
        to,
        subject: title,
        html,
    });

    if (error) {
        throw error
    }
    console.log(data);
}