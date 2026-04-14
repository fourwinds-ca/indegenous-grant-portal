"""Generate branded Green Buffalo PDF training documents.

Brand colors extracted from brand-guide.png:
  Green:  #64C46E  (primary)
  Blue:   #1577AE  (accent)
  Brown:  #544541  (dark text / headers)
  Tan:    #DBC5A2  (soft background)
"""

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak,
    Table, TableStyle, KeepTogether,
)
from reportlab.pdfgen import canvas

BRAND_GREEN = HexColor("#64C46E")
BRAND_BLUE = HexColor("#1577AE")
BRAND_BROWN = HexColor("#544541")
BRAND_TAN = HexColor("#DBC5A2")
LIGHT_GREEN = HexColor("#E8F3E2")
LIGHT_GRAY = HexColor("#F5F5F3")

LOGO_PATH = "docs/training/greenbuffalo_logo.png"


# -----------------------------------------------------------------------------
# Styles
# -----------------------------------------------------------------------------
def make_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="BrandTitle", parent=styles["Title"],
        fontName="Helvetica-Bold", fontSize=28, textColor=BRAND_BROWN,
        leading=34, spaceAfter=6, alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name="BrandSubtitle", parent=styles["Normal"],
        fontName="Helvetica", fontSize=13, textColor=BRAND_BLUE,
        leading=18, spaceAfter=18, alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name="H1", parent=styles["Heading1"],
        fontName="Helvetica-Bold", fontSize=18, textColor=BRAND_GREEN,
        leading=22, spaceBefore=14, spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        name="H2", parent=styles["Heading2"],
        fontName="Helvetica-Bold", fontSize=13, textColor=BRAND_BROWN,
        leading=16, spaceBefore=10, spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name="Body", parent=styles["Normal"],
        fontName="Helvetica", fontSize=10.5, textColor=BRAND_BROWN,
        leading=15, spaceAfter=6, alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name="BrandBullet", parent=styles["Normal"],
        fontName="Helvetica", fontSize=10.5, textColor=BRAND_BROWN,
        leading=15, leftIndent=14, bulletIndent=2, spaceAfter=3,
    ))
    styles.add(ParagraphStyle(
        name="Callout", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=10.5, textColor=BRAND_BROWN,
        leading=15, leftIndent=12, rightIndent=12,
        spaceBefore=6, spaceAfter=6,
        backColor=LIGHT_GREEN, borderPadding=10,
    ))
    styles.add(ParagraphStyle(
        name="Footer", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, textColor=BRAND_BROWN,
        alignment=TA_CENTER,
    ))
    return styles


# -----------------------------------------------------------------------------
# Page decorators (header / footer / cover)
# -----------------------------------------------------------------------------
def on_page(canv: canvas.Canvas, doc, title: str):
    canv.saveState()
    W, H = LETTER

    # Top band (brand green, thin)
    canv.setFillColor(BRAND_GREEN)
    canv.rect(0, H - 0.25 * inch, W, 0.25 * inch, fill=1, stroke=0)

    # Logo (top-right, small)
    try:
        canv.drawImage(
            LOGO_PATH, W - 1.25 * inch, H - 0.95 * inch,
            width=1.0 * inch, height=0.55 * inch,
            preserveAspectRatio=True, mask="auto",
        )
    except Exception:
        pass

    # Title bar text (top-left)
    canv.setFillColor(BRAND_BROWN)
    canv.setFont("Helvetica-Bold", 10)
    canv.drawString(0.75 * inch, H - 0.65 * inch, "Green Buffalo Grant Portal")
    canv.setFillColor(BRAND_BLUE)
    canv.setFont("Helvetica", 9)
    canv.drawString(0.75 * inch, H - 0.82 * inch, title)

    # Footer line
    canv.setStrokeColor(BRAND_TAN)
    canv.setLineWidth(0.5)
    canv.line(0.75 * inch, 0.6 * inch, W - 0.75 * inch, 0.6 * inch)

    # Footer text
    canv.setFillColor(BRAND_BROWN)
    canv.setFont("Helvetica", 8)
    canv.drawString(0.75 * inch, 0.42 * inch, "Green Buffalo  \u2022  Indigenous Grant Portal")
    canv.drawRightString(W - 0.75 * inch, 0.42 * inch, f"Page {doc.page}")

    canv.restoreState()


def draw_cover(canv: canvas.Canvas, title: str, subtitle: str, audience: str):
    W, H = LETTER
    canv.saveState()

    # Full top band
    canv.setFillColor(BRAND_GREEN)
    canv.rect(0, H - 2.2 * inch, W, 2.2 * inch, fill=1, stroke=0)

    # Blue stripe
    canv.setFillColor(BRAND_BLUE)
    canv.rect(0, H - 2.45 * inch, W, 0.25 * inch, fill=1, stroke=0)

    # Logo centered
    try:
        canv.drawImage(
            LOGO_PATH, (W - 3.0 * inch) / 2, H - 2.0 * inch,
            width=3.0 * inch, height=1.65 * inch,
            preserveAspectRatio=True, mask="auto",
        )
    except Exception:
        pass

    # Title block
    canv.setFillColor(BRAND_BROWN)
    canv.setFont("Helvetica-Bold", 32)
    canv.drawCentredString(W / 2, H - 3.6 * inch, title)

    canv.setFillColor(BRAND_BLUE)
    canv.setFont("Helvetica", 16)
    canv.drawCentredString(W / 2, H - 4.1 * inch, subtitle)

    # Audience badge
    badge_w, badge_h = 3.0 * inch, 0.55 * inch
    bx, by = (W - badge_w) / 2, H - 5.0 * inch
    canv.setFillColor(BRAND_TAN)
    canv.roundRect(bx, by, badge_w, badge_h, 10, fill=1, stroke=0)
    canv.setFillColor(BRAND_BROWN)
    canv.setFont("Helvetica-Bold", 12)
    canv.drawCentredString(W / 2, by + 0.18 * inch, audience)

    # Bottom band
    canv.setFillColor(BRAND_BROWN)
    canv.rect(0, 0, W, 0.8 * inch, fill=1, stroke=0)
    canv.setFillColor(white)
    canv.setFont("Helvetica", 10)
    canv.drawCentredString(W / 2, 0.45 * inch, "Training Documentation  \u2022  v1.0  \u2022  April 2026")

    # Accent color squares on bottom band
    sw = 0.4 * inch
    for i, c in enumerate([BRAND_GREEN, BRAND_BLUE, BRAND_TAN]):
        canv.setFillColor(c)
        canv.rect(W - (i + 1) * (sw + 0.08 * inch) - 0.3 * inch,
                  0.2 * inch, sw, sw, fill=1, stroke=0)

    canv.restoreState()


# -----------------------------------------------------------------------------
# Content helpers
# -----------------------------------------------------------------------------
def h1(text, styles): return Paragraph(text, styles["H1"])
def h2(text, styles): return Paragraph(text, styles["H2"])
def p(text, styles): return Paragraph(text, styles["Body"])
def bullet(text, styles): return Paragraph(f"\u2022  {text}", styles["BrandBullet"])
def callout(text, styles): return Paragraph(f"<b>Tip:</b> {text}", styles["Callout"])


def step_table(steps, styles):
    """Numbered step table with green circular step numbers."""
    data = []
    for i, step in enumerate(steps, 1):
        num = Paragraph(
            f'<font color="white" size="12"><b>{i}</b></font>',
            ParagraphStyle("n", alignment=TA_CENTER, textColor=white),
        )
        txt = Paragraph(step, styles["Body"])
        data.append([num, txt])

    tbl = Table(data, colWidths=[0.5 * inch, 6.2 * inch])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), BRAND_GREEN),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (1, 0), (1, -1), 14),
        ("ROWBACKGROUNDS", (1, 0), (1, -1), [white, LIGHT_GRAY]),
        ("BOX", (0, 0), (-1, -1), 0.5, BRAND_TAN),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, BRAND_TAN),
    ]))
    return tbl


def info_table(rows, styles, col_widths=None):
    """Two-column key/value table."""
    widths = col_widths or [1.9 * inch, 4.8 * inch]
    data = [[Paragraph(f"<b>{k}</b>", styles["Body"]), Paragraph(v, styles["Body"])]
            for k, v in rows]
    tbl = Table(data, colWidths=widths)
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), BRAND_TAN),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.4, BRAND_BROWN),
    ]))
    return tbl


# -----------------------------------------------------------------------------
# Admin Training Guide
# -----------------------------------------------------------------------------
def build_admin_guide(path: str):
    styles = make_styles()

    def first_page(canv, doc):
        draw_cover(canv, "Admin Training Guide",
                   "Running the Grant Portal Dashboard",
                   "For Portal Administrators")

    def later_page(canv, doc):
        on_page(canv, doc, "Admin Training Guide")

    doc = SimpleDocTemplate(
        path, pagesize=LETTER,
        leftMargin=0.75 * inch, rightMargin=0.75 * inch,
        topMargin=1.1 * inch, bottomMargin=0.85 * inch,
        title="Green Buffalo Grant Portal — Admin Training",
        author="Green Buffalo",
    )

    story = [PageBreak()]

    # Page 2 — Welcome + What is this
    story.append(h1("Welcome, Administrator", styles))
    story.append(p(
        "This guide will walk you through running the Green Buffalo Indigenous "
        "Grant Portal. As an admin, you are the quality control layer between "
        "our AI research pipeline and the communities who rely on accurate, "
        "current grant information.", styles))

    story.append(h2("What the Portal Does", styles))
    story.append(p(
        "The portal helps Indigenous communities across Canada discover and "
        "track government grants and funding programs. An AI research pipeline "
        "scans trusted government websites weekly and proposes new grants, "
        "updates, and deactivations for your review.", styles))

    story.append(h2("Your Four Responsibilities", styles))
    story.append(bullet("<b>Review AI findings</b> — approve, reject, or edit pending changes", styles))
    story.append(bullet("<b>Maintain the grants database</b> — fix errors, add manual entries", styles))
    story.append(bullet("<b>Respond to support requests</b> — from communities using the portal", styles))
    story.append(bullet("<b>Manage subscribers</b> — who gets notified when new grants are added", styles))

    story.append(callout(
        "Every AI-proposed change goes through you. Nothing gets published "
        "automatically — your review is the final gate.", styles))

    story.append(PageBreak())

    # Page 3 — Getting Started
    story.append(h1("Getting Started", styles))

    story.append(h2("Logging In", styles))
    story.append(step_table([
        "Navigate to the portal URL and add <b>/admin</b> to the end.",
        "Sign in with your approved admin email and password.",
        "If your email is not approved, contact the system administrator.",
    ], styles))

    story.append(Spacer(1, 10))
    story.append(h2("Dashboard Layout", styles))
    story.append(p("Once logged in you will see four tabs:", styles))
    story.append(info_table([
        ("Grants Database", "Your full list of grants. Edit, add, or remove entries."),
        ("AI Research", "Run the AI grant discovery and review pending changes."),
        ("Contact Messages", "Support requests from public portal visitors."),
        ("Subscriptions", "Email subscribers and their notification preferences."),
    ], styles))

    story.append(PageBreak())

    # Page 4 — AI Research
    story.append(h1("Running AI Grant Research", styles))
    story.append(p(
        "The AI research pipeline is the core of how the portal stays current. "
        "It runs through a 5-step process to find new grants, verify them, and "
        "propose changes for your approval.", styles))

    story.append(h2("The 5-Step Pipeline", styles))
    story.append(step_table([
        "<b>Discovery</b> — Perplexity searches all trusted government and Indigenous organization websites.",
        "<b>Comparison</b> — Claude compares findings with your existing database and applies quality filters.",
        "<b>Validation</b> — Every link is checked for 404/403/redirect-to-homepage issues.",
        "<b>Verification</b> — Flagged grants get a second Perplexity spot-check to confirm they exist.",
        "<b>Review</b> — Validated findings are saved as Pending Changes for your approval.",
    ], styles))

    story.append(Spacer(1, 10))
    story.append(h2("Starting a Research Run", styles))
    story.append(step_table([
        "Go to the <b>AI Research</b> tab.",
        "Click <b>Run Research Now</b>.",
        "Wait 3\u20135 minutes \u2014 you can leave the page and come back.",
        "When the run completes, Pending Changes will appear below.",
    ], styles))

    story.append(callout(
        "Once a week is a good cadence. Government grants don't change daily, "
        "and each run costs approximately $0.20\u20130.30 in AI usage fees.", styles))

    story.append(PageBreak())

    # Page 5 — Reviewing Pending Changes
    story.append(h1("Reviewing Pending Changes", styles))
    story.append(p(
        "Each pending change shows what the AI found, why it's recommending "
        "the change, and the source URL where the information came from.", styles))

    story.append(h2("Change Types", styles))
    story.append(info_table([
        ("New", "A grant the AI found that is not in your database."),
        ("Update", "A grant that exists but has a changed deadline, amount, or link."),
        ("Deactivate", "A grant that appears to be permanently discontinued."),
        ("Reclassify", "A recurring grant whose current window has closed \u2014 mark as recurring_closed."),
    ], styles))

    story.append(Spacer(1, 8))
    story.append(h2("Your Three Actions Per Change", styles))
    story.append(info_table([
        ("Eye icon (preview)", "Opens the full proposed grant details in a modal."),
        ("Green check (approve)", "Applies the change to the live grants database."),
        ("Red X (reject)", "Discards the change and records a rejection reason."),
    ], styles))

    story.append(h2("What to Check Before Approving", styles))
    story.append(bullet("Click the source URL and confirm the grant actually exists on the page.", styles))
    story.append(bullet("Verify the exact program name matches (watch for AI paraphrasing).", styles))
    story.append(bullet("Confirm the application deadline is realistic and current.", styles))
    story.append(bullet("Check that the application link goes to the specific grant page, not a generic homepage.", styles))
    story.append(bullet("Read the description \u2014 it should explain <i>how</i> to apply.", styles))

    story.append(callout(
        "If the AI auto-flags a grant with validation issues (broken link, "
        "unverified title), it will appear with a red warning badge. Most "
        "of these should be rejected \u2014 review carefully before approving.", styles))

    story.append(PageBreak())

    # Page 6 — Common tasks
    story.append(h1("Common Admin Tasks", styles))

    story.append(h2("Manually Adding a Grant", styles))
    story.append(step_table([
        "Go to the <b>Grants Database</b> tab.",
        "Click <b>Add Grant</b>.",
        "Fill in: title, agency, description, eligibility, amount, deadline, application link, province, category.",
        "Save. The grant appears immediately on the public portal.",
    ], styles))

    story.append(Spacer(1, 8))
    story.append(h2("Updating a Grant Deadline", styles))
    story.append(step_table([
        "Open the <b>Grants Database</b> tab.",
        "Search or filter to find the grant.",
        "Click <b>Edit</b>, update the deadline field, save.",
    ], styles))

    story.append(Spacer(1, 8))
    story.append(h2("Responding to a Support Request", styles))
    story.append(step_table([
        "Go to the <b>Contact Messages</b> tab.",
        "Click a message to read it.",
        "Reply to the sender's email directly from your own email client.",
        "Mark the message as <b>Responded</b> in the dashboard.",
    ], styles))

    story.append(PageBreak())

    # Page 7 — Trusted sources + FAQ
    story.append(h1("Trusted Sources & Guardrails", styles))
    story.append(p(
        "The AI is restricted to searching only trusted sources. It will "
        "never pull data from news articles, blogs, or third-party "
        "aggregators.", styles))

    story.append(h2("Source Categories", styles))
    story.append(bullet("<b>Federal government</b> \u2014 ISC, CIRNAC, NRCan, CMHC, ISED, Infrastructure Canada, and more", styles))
    story.append(bullet("<b>Provincial & territorial</b> \u2014 all 13 provinces and territories", styles))
    story.append(bullet("<b>Indigenous organizations</b> \u2014 NACCA, Indspire, First Nations Health Authority", styles))
    story.append(bullet("<b>Crown corporations</b> \u2014 BDC, Canada Council for the Arts, research councils", styles))
    story.append(bullet("<b>Regional development agencies</b> \u2014 FedDev, ACOA, CanNor, PacifiCan, PrairiesCan", styles))

    story.append(h2("Frequently Asked Questions", styles))
    story.append(p("<b>Can the AI make mistakes?</b>", styles))
    story.append(p("Yes. That is why every change goes through admin review. Confidence scores and reasoning are provided for each suggestion \u2014 use your judgement.", styles))
    story.append(p("<b>What if I accidentally approve a wrong change?</b>", styles))
    story.append(p("You can always edit or remove grants from the Grants Database tab. No change is permanent.", styles))
    story.append(p("<b>How much does each research run cost?</b>", styles))
    story.append(p("Approximately $0.20\u20130.30 in AI usage fees. Weekly runs cost roughly $2\u20135 per month.", styles))
    story.append(p("<b>Who can be an admin?</b>", styles))
    story.append(p("Only users whose email is in the admin allowlist. Contact the system administrator to add new admins.", styles))

    doc.build(story, onFirstPage=first_page, onLaterPages=later_page)
    print(f"Wrote {path}")


# -----------------------------------------------------------------------------
# User Quick Start Guide
# -----------------------------------------------------------------------------
def build_user_guide(path: str):
    styles = make_styles()

    def first_page(canv, doc):
        draw_cover(canv, "Quick Start Guide",
                   "Finding Grants for Your Community",
                   "For Indigenous Communities")

    def later_page(canv, doc):
        on_page(canv, doc, "User Quick Start Guide")

    doc = SimpleDocTemplate(
        path, pagesize=LETTER,
        leftMargin=0.75 * inch, rightMargin=0.75 * inch,
        topMargin=1.1 * inch, bottomMargin=0.85 * inch,
        title="Green Buffalo Grant Portal — Quick Start",
        author="Green Buffalo",
    )

    story = [PageBreak()]

    story.append(h1("Welcome to the Grant Portal", styles))
    story.append(p(
        "The Green Buffalo Grant Portal helps Indigenous communities across "
        "Canada discover and track government grants and funding programs. "
        "All grants listed come from official government websites and trusted "
        "Indigenous organizations.", styles))

    story.append(h2("What You Will Find", styles))
    story.append(bullet("Grants from all 13 provinces and territories", styles))
    story.append(bullet("Federal funding from ISC, CIRNAC, CMHC, NRCan, and more", styles))
    story.append(bullet("Indigenous-specific programs from NACCA, Indspire, FNHA, and Crown corporations", styles))
    story.append(bullet("Direct links to official government application pages", styles))

    story.append(h1("Browsing Grants", styles))
    story.append(p("Each grant card on the portal shows:", styles))
    story.append(info_table([
        ("Grant name", "The official program title and administering agency."),
        ("Funding amount", "How much funding is available (or a range)."),
        ("Deadline", "When applications are due."),
        ("Province", "Whether it's federal or specific to a province/territory."),
        ("Category", "Housing, energy, education, health, economic development, etc."),
        ("Apply link", "Goes directly to the official government application page."),
    ], styles))

    story.append(callout(
        "Grants are sorted by nearest deadline first \u2014 the most urgent "
        "ones appear at the top.", styles))

    story.append(PageBreak())

    story.append(h1("Finding the Right Grant", styles))
    story.append(step_table([
        "Visit the portal and browse the grants list.",
        "Use the filters to narrow by <b>province</b>, <b>category</b>, or <b>status</b>.",
        "Click any grant card to see full details \u2014 eligibility, amount, how to apply.",
        "Click the <b>Apply</b> link to go directly to the government application page.",
        "If you need help, use the <b>Request Support</b> form on the portal.",
    ], styles))

    story.append(h1("Understanding Grant Status", styles))
    story.append(info_table([
        ("Active", "The application window is currently open. Apply now."),
        ("Recurring (closed)", "A legitimate annual program whose current window has closed. Check back later."),
        ("Inactive", "The program has been discontinued or is no longer accepting applications."),
    ], styles))

    story.append(h1("Getting Notified of New Grants", styles))
    story.append(p(
        "You can subscribe to email updates and be notified when:", styles))
    story.append(bullet("New grants are added to the portal", styles))
    story.append(bullet("An existing grant's deadline or amount changes", styles))
    story.append(bullet("A new program is announced in your province or category", styles))
    story.append(p("Click <b>Subscribe to Updates</b> on the homepage and choose your preferences.", styles))

    story.append(h1("Getting Help", styles))
    story.append(p(
        "If you have questions about applying for a grant, cannot find what "
        "you need, or want help understanding eligibility requirements, use "
        "the <b>Request Support</b> button on the portal. Our team reads every "
        "message and responds within a few business days.", styles))

    story.append(callout(
        "The portal is a starting point. For complex applications, we "
        "encourage you to reach out \u2014 our team can help you navigate "
        "government processes and improve your application.", styles))

    doc.build(story, onFirstPage=first_page, onLaterPages=later_page)
    print(f"Wrote {path}")


if __name__ == "__main__":
    build_admin_guide("docs/training/Admin-Training-Guide.pdf")
    build_user_guide("docs/training/User-Quick-Start-Guide.pdf")
