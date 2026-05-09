import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)

ROLE_EMAILS = {
    "admin": "admin@carlsberg.com",
    "procurement": "procurement@carlsberg.com",
    "it_security": "security@carlsberg.com",
    "legal": "legal@carlsberg.com",
    "ai_innovation": "innovation@carlsberg.com",
}

RISK_EMOJI = {"green": "🟢", "amber": "🟡", "red": "🔴"}
RISK_COLOR = {"green": "#22c55e", "amber": "#f59e0b", "red": "#ef4444"}


def _send_smtp(to: list[str], subject: str, html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.email_from
    msg["To"] = ", ".join(to)
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as s:
        s.sendmail(settings.email_from, to, msg.as_string())


async def send_assessment_complete(
    vendor_name: str,
    vendor_id: str,
    composite_score: float,
    risk_flag: str,
    dimension_scores: list,
    tasks: list,
):
    loop = asyncio.get_event_loop()
    try:
        emoji = RISK_EMOJI.get(risk_flag, "⚪")
        color = RISK_COLOR.get(risk_flag, "#888")

        dims_rows = ""
        for d in dimension_scores:
            dc = RISK_COLOR.get(d.get("risk_flag", ""), "#888")
            de = RISK_EMOJI.get(d.get("risk_flag", ""), "⚪")
            dims_rows += f"""
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid #eee">{d.get('label', d.get('dimension',''))}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;color:{dc};font-weight:bold">{de} {d.get('composite_score', 0):.0f}/100</td>
            </tr>"""

        high_tasks = [t for t in tasks if t.get("priority") == "high"]
        task_rows = ""
        for t in high_tasks[:5]:
            task_rows += f'<li style="margin-bottom:4px">🔴 <strong>{t.get("title","")}</strong> — {t.get("department","")}</li>'
        if len(tasks) > 5:
            task_rows += f"<li style='color:#888'>...and {len(tasks)-5} more tasks</li>"

        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1a1a2e;padding:24px;border-radius:8px 8px 0 0">
            <h1 style="color:white;margin:0;font-size:20px">🏢 Vendor Assessment Complete</h1>
          </div>
          <div style="background:#f8f9fa;padding:24px;border-radius:0 0 8px 8px;border:1px solid #eee">
            <h2 style="margin-top:0">{vendor_name}</h2>
            <div style="background:white;border-left:5px solid {color};padding:16px;border-radius:4px;margin-bottom:20px">
              <p style="margin:0;font-size:28px;font-weight:bold;color:{color}">{emoji} {composite_score:.1f}/100</p>
              <p style="margin:4px 0 0;color:#666;text-transform:uppercase;font-size:12px;letter-spacing:1px">{risk_flag} RISK</p>
            </div>

            <h3>Dimension Breakdown</h3>
            <table style="width:100%;border-collapse:collapse;background:white;border-radius:4px;overflow:hidden">
              <tr style="background:#f1f1f1">
                <th style="padding:8px;text-align:left;font-size:12px">Dimension</th>
                <th style="padding:8px;text-align:center;font-size:12px">Score</th>
              </tr>
              {dims_rows}
            </table>

            {"<h3>High-Priority Action Items</h3><ul style='padding-left:20px'>" + task_rows + "</ul>" if high_tasks else ""}

            <div style="margin-top:20px;padding:12px;background:#fff3cd;border-radius:4px;font-size:13px">
              <strong>Next step:</strong> Review the full report and action items in the Vendor Assessment portal.
            </div>
            <p style="color:#aaa;font-size:11px;margin-top:16px">
              Vendor ID: {vendor_id} · Carlsberg Vendor Assessment PoC
            </p>
          </div>
        </div>
        """

        subject = f"{emoji} Assessment Complete: {vendor_name} — {composite_score:.0f}/100 {risk_flag.upper()}"

        recipients = list(ROLE_EMAILS.values())

        await loop.run_in_executor(None, _send_smtp, recipients, subject, html)
        logger.info(f"Assessment email sent for {vendor_name} to {len(recipients)} recipients")

    except Exception as e:
        logger.warning(f"Email notification failed: {e}")


async def send_task_assigned(
    task_title: str,
    vendor_name: str,
    department: str,
    priority: str,
):
    loop = asyncio.get_event_loop()
    try:
        role = next((r for r, d in {
            "it_security": "it_security",
            "legal": "legal",
            "procurement": "procurement",
            "ai_innovation": "ai_innovation",
        }.items() if d == department), None)

        if not role:
            return

        to_email = ROLE_EMAILS.get(role)
        if not to_email:
            return

        priority_color = {"high": "#ef4444", "medium": "#f59e0b", "low": "#22c55e"}.get(priority, "#888")
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1a1a2e;padding:20px;border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0;font-size:16px">📋 New Task Assigned</h2>
          </div>
          <div style="background:#f8f9fa;padding:20px;border-radius:0 0 8px 8px;border:1px solid #eee">
            <p><strong>Vendor:</strong> {vendor_name}</p>
            <p><strong>Task:</strong> {task_title}</p>
            <p><strong>Priority:</strong> <span style="color:{priority_color};font-weight:bold">{priority.upper()}</span></p>
            <p><strong>Department:</strong> {department}</p>
            <p style="color:#aaa;font-size:11px">Carlsberg Vendor Assessment PoC</p>
          </div>
        </div>
        """
        subject = f"[{priority.upper()}] New task: {task_title}"
        await loop.run_in_executor(None, _send_smtp, [to_email], subject, html)

    except Exception as e:
        logger.warning(f"Task email failed: {e}")
