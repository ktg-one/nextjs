import { Resend } from 'resend';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const lead = req.body;

    if (!lead.name || !lead.phone) {
      return res.status(400).json({ error: 'Name and phone required' });
    }

    // Build the conversation summary
    const convoLines = (lead.conversation || [])
      .map(m => `${m.role === 'user' ? 'THEM' : 'US'}: ${m.content}`)
      .join('\n');

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Good\'ai Leads <leads@goodai.au>',
      to: process.env.LEAD_EMAIL || 'kevin.pl.tan@gmail.com',
      subject: `New lead: ${lead.name}${lead.business ? ' — ' + lead.business : ''}`,
      text: [
        `NEW LEAD FROM GOODAI.AU`,
        `─────────────────────`,
        ``,
        `Name:     ${lead.name}`,
        `Business: ${lead.business || '—'}`,
        `Phone:    ${lead.phone}`,
        `Email:    ${lead.email || '—'}`,
        `Time:     ${new Date(lead.timestamp).toLocaleString('en-AU', { timeZone: 'Australia/Perth' })}`,
        ``,
        `THEIR PROBLEM:`,
        `${lead.problem || '—'}`,
        ``,
        `FULL CONVERSATION:`,
        `─────────────────────`,
        convoLines || '(no conversation)',
      ].join('\n'),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Lead capture error:', error);
    return res.status(200).json({ ok: true });
  }
}
