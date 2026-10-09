import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from pathlib import Path

uploads_dir = Path(r"d:\Aarva\backend\uploads")
uploads_dir.mkdir(parents=True, exist_ok=True)

pdf_path = uploads_dir / "nit_scada-635.pdf"

doc = SimpleDocTemplate(
    str(pdf_path),
    pagesize=letter,
    leftMargin=36,
    rightMargin=36,
    topMargin=36,
    bottomMargin=36
)

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    "DocTitle",
    parent=styles["Heading1"],
    fontSize=14,
    leading=18,
    textColor=colors.HexColor("#17142d"),
    alignment=1
)
table_label_style = ParagraphStyle(
    "TableLabel",
    parent=styles["Normal"],
    fontSize=9,
    leading=12,
    fontName="Helvetica-Bold",
    textColor=colors.black
)
table_body_style = ParagraphStyle(
    "TableBody",
    parent=styles["Normal"],
    fontSize=8.5,
    leading=11.5,
    textColor=colors.HexColor("#222222")
)
table_highlight_style = ParagraphStyle(
    "TableHighlight",
    parent=styles["Normal"],
    fontSize=8.5,
    leading=11.5,
    fontName="Helvetica-Bold",
    textColor=colors.HexColor("#b45309")
)

story = []

# Table Page 1 data matching screenshot
t_data = [
    [
        Paragraph("1.", table_label_style),
        Paragraph("Bid Enquiry No:", table_label_style),
        Paragraph("<font color='#b45309'><b>KPTCL/CEE/T&amp;P/SCADA/635/2022-23</b></font>", table_highlight_style)
    ],
    [
        Paragraph("2.", table_label_style),
        Paragraph("Scope", table_label_style),
        Paragraph(
            "Upgradation of existing SCADA system in KPTCL and ESCOMs for monitoring and real time operation of the Grid covering all 400kV, 220kV, 110kV, 66kV, 33 kV, IPPs and Major Generating stations conforming to KPTCL specifications.<br/><br/>"
            "The scope of work under this Project shall include Project Management having Survey, Planning, Design, Engineering, Documentation, Integration, Supply, Delivery to site, Unloading, Insurance, Storing, Handling, transportation to final locations, Installation, Termination, Testing, Demonstration for acceptance, and Commissioning of following:<br/>"
            "1. Setting up of Main &amp; Backup SCADA/EMS system hardware and software along with associated items at respective Control Centers as per proposed architecture and Bill of Quantities. The new system shall be deployed in such a way that the operation of the existing system at SLDC should not be disturbed.<br/>"
            "2. Setting up of ALDCs &amp; DCCs SCADA system hardware and software along with associated items at respective Control Centers as per proposed architecture and Bill of Quantities. The new system shall be deployed in such a way that the operation of the existing system at ALDCs and DCCs should not be disturbed.<br/>"
            "3. Engineering, Configuration and Integration of all existing RTUs of KPTCL and ESCOMs, Sub-station Automation systems to the SCADA system and PMU data through PDC at Main Control Centre and Backup Control Centre.<br/>"
            "4. Import and Adaption of database &amp; displays of existing SCADA/EMS system including import of RDBMS based configuration.",
            table_body_style
        )
    ]
]

table = Table(t_data, colWidths=[24, 110, 396])
table.setStyle(TableStyle([
    ('GRID', (0,0), (-1,-1), 0.8, colors.HexColor("#555555")),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('BACKGROUND', (2,0), (2,0), colors.HexColor("#fef3c7")),
]))

story.append(table)
story.append(Spacer(1, 15))

# Generate 15 pages in total matching screenshot
for page_num in range(2, 16):
    story.append(PageBreak())
    story.append(Paragraph(f"<b>SECTION {page_num}: TECHNICAL &amp; COMMERCIAL PROVISIONS</b>", title_style))
    story.append(Spacer(1, 15))
    
    sec_data = [
        [
            Paragraph(f"{page_num}.1", table_label_style),
            Paragraph("Financial Metric" if page_num == 2 else f"Clause {page_num}", table_label_style),
            Paragraph(
                ("<b>Budget / Estimated Cost:</b> INR 9230 Lakh<br/>"
                 "<b>Earnest Money Deposit (EMD):</b> INR 92.30 Lakh<br/>"
                 "<b>Bank Guarantee (BG):</b> INR 92.30 Lakh (10% of Contract Value)<br/>"
                 "<b>Liquidated Damages:</b> 0.5% per week subject to maximum of 10% of contract price.<br/>"
                 "<b>Performance Bond:</b> Not Specified" if page_num == 2 else
                 f"Detailed specification parameters for SCADA sub-system {page_num}. "
                 "All hardware components shall adhere to IEC 60870-5-104 and IEEE C37.118 communication protocols. "
                 "Redundant dual gigabit optical fiber links must provide hot-standby failover under 50 milliseconds."),
                table_body_style
            )
        ]
    ]
    sec_table = Table(sec_data, colWidths=[30, 110, 390])
    sec_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.8, colors.HexColor("#777777")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sec_table)

def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.drawString(270, 20, f"Page {doc.page} of 15")
    canvas.restoreState()

doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
print(f"Generated {pdf_path} ({os.path.getsize(pdf_path)} bytes)")

# Also overwrite test.pdf / test2.pdf so existing dummy IDs work seamlessly
for alias in ["12_test.pdf", "15_test2.pdf", "1_nit_scada-635.pdf", "2_nit_scada-635.pdf"]:
    dest = uploads_dir / alias
    with open(pdf_path, "rb") as f_in, open(dest, "wb") as f_out:
        f_out.write(f_in.read())
print("Updated dummy files with real PDF content.")
