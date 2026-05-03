"""
PDF catalogue generator using reportlab + Pillow.
Dark maroon theme with gold accents, diagonal watermarks on product images.
"""
import io
import base64
from datetime import datetime

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas as rl_canvas
    from reportlab.lib.utils import ImageReader
    REPORTLAB_OK = True
except ImportError:
    REPORTLAB_OK = False

try:
    from PIL import Image, ImageDraw, ImageFont
    PILLOW_OK = True
except ImportError:
    PILLOW_OK = False

# ── Colour palette (0–1 scale for reportlab) ─────────────────────────────────
BG      = (26/255,  7/255,  16/255)   # #1a0710 deep maroon
GOLD    = (212/255, 175/255, 55/255)  # #D4AF37
CREAM   = (0.92, 0.88, 0.80)
MUTED   = (0.55, 0.50, 0.45)
DARK    = (0.18, 0.08, 0.12)

PAGE_W, PAGE_H = A4 if REPORTLAB_OK else (595, 842)
MARGIN = 24


# ── Pillow helpers ────────────────────────────────────────────────────────────

def _load_font(size: int):
    if not PILLOW_OK:
        return None
    for path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()


def _watermark_image(img_b64: str, wm_text: str, size: int = 280) -> io.BytesIO:
    """Decode a base64 product image, resize, tile diagonal watermark, return JPEG BytesIO."""
    if not PILLOW_OK:
        buf = io.BytesIO()
        return buf

    try:
        raw = img_b64.split(",", 1)[-1] if "," in img_b64 else img_b64
        img_bytes = base64.b64decode(raw)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception:
        img = Image.new("RGB", (size, size), (40, 15, 25))

    img = img.resize((size, size), Image.LANCZOS)

    font = _load_font(13)
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    try:
        bbox = draw.textbbox((0, 0), wm_text, font=font)
        tw, th = bbox[2] - bbox[0] + 20, bbox[3] - bbox[1] + 8
    except Exception:
        tw, th = max(len(wm_text) * 8, 60), 20

    txt_img = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    txt_draw = ImageDraw.Draw(txt_img)
    txt_draw.text((10, 4), wm_text, fill=(212, 175, 55, 95), font=font)
    rotated = txt_img.rotate(32, expand=True)

    rw, rh = rotated.size
    for y in range(-rh, size + rh, 68):
        for x in range(-rw, size + rw, 110):
            overlay.paste(rotated, (x, y), rotated)

    result = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    buf = io.BytesIO()
    result.save(buf, format="JPEG", quality=82)
    buf.seek(0)
    return buf


def _placeholder_image(size: int = 280) -> io.BytesIO:
    """Return a dark placeholder image as JPEG BytesIO."""
    if not PILLOW_OK:
        return io.BytesIO()
    img = Image.new("RGB", (size, size), (40, 15, 25))
    draw = ImageDraw.Draw(img)
    draw.rectangle([60, 60, size-60, size-60], outline=(100, 80, 30), width=2)
    draw.line([60, 60, size-60, size-60], fill=(70, 55, 20), width=1)
    draw.line([size-60, 60, 60, size-60], fill=(70, 55, 20), width=1)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=75)
    buf.seek(0)
    return buf


# ── reportlab drawing helpers ─────────────────────────────────────────────────

def _fill_bg(c):
    c.setFillColorRGB(*BG)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)


def _gold_rule(c, x, y, w, h=0.75):
    c.setFillColorRGB(*GOLD)
    c.rect(x, y, w, h, fill=1, stroke=0)


def _draw_cell(c, product: dict, cx: float, cy: float, cw: float, ch: float,
               wm_text: str, k22_rate: float):
    """Draw one product cell at position (cx, cy) with given dimensions."""
    PAD = 8

    # Cell background
    c.setFillColorRGB(*DARK)
    c.roundRect(cx, cy, cw, ch, 4, fill=1, stroke=0)
    c.setStrokeColorRGB(*GOLD)
    c.setLineWidth(0.4)
    c.roundRect(cx, cy, cw, ch, 4, fill=0, stroke=1)

    # Image area
    img_h = ch * 0.60
    img_y = cy + ch - img_h
    img_x = cx + PAD
    img_w = cw - 2 * PAD

    images = product.get("images") or []
    img_b64 = images[0] if images else None

    try:
        if img_b64:
            img_buf = _watermark_image(img_b64, wm_text)
        else:
            img_buf = _placeholder_image()
        c.drawImage(ImageReader(img_buf), img_x, img_y, img_w, img_h - PAD,
                    preserveAspectRatio=True, anchor="c")
    except Exception:
        c.setFillColorRGB(0.15, 0.06, 0.1)
        c.rect(img_x, img_y, img_w, img_h - PAD, fill=1, stroke=0)

    # Gold rule under image
    _gold_rule(c, cx + PAD, img_y - 2, cw - 2 * PAD)

    # Text area
    text_y = cy + ch * 0.36

    # Name
    name = product.get("name", "Jewellery Item")
    if len(name) > 28:
        name = name[:26] + "…"
    c.setFillColorRGB(*GOLD)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(cx + PAD, text_y, name)

    # Weight + purity
    weight = product.get("weight", 0)
    purity = (product.get("purity") or "22k").upper()
    c.setFillColorRGB(*MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(cx + PAD, text_y - 13, f"{weight}g · {purity}")

    # Indicative price
    try:
        rate = float(k22_rate)
        w = float(weight)
        price = w * rate * 1.12 * 1.03  # making 12% + GST 3%
        price_str = f"~₹{int(price):,}"
    except Exception:
        price_str = "Price on request"

    c.setFillColorRGB(*GOLD)
    c.setFont("Helvetica", 7)
    c.drawString(cx + PAD, text_y - 26, price_str + " *")


# ── Main entry point ──────────────────────────────────────────────────────────

def generate_catalogue_pdf(
    products: list,
    customer_name: str,
    customer_phone: str,
    share_id: str,
    settings: dict,
    expires_at,
) -> str:
    """Generate a watermarked PDF catalogue. Returns base64-encoded PDF string."""

    if not REPORTLAB_OK:
        return ""

    business_name = settings.get("business_name", "Jewellers MB")
    whatsapp = settings.get("whatsapp", "")
    k22_rate = settings.get("k22_rate", 13835)
    wm_text = f"Jewellers MB · {customer_phone}"

    if isinstance(expires_at, datetime):
        expiry_str = expires_at.strftime("%d %b %Y")
    else:
        expiry_str = str(expires_at)[:10]

    buf = io.BytesIO()
    c = rl_canvas.Canvas(buf, pagesize=A4)

    # ── COVER PAGE ────────────────────────────────────────────────────────────
    _fill_bg(c)

    # Top accent bar
    c.setFillColorRGB(*GOLD)
    c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)

    # Business name
    c.setFillColorRGB(*GOLD)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 80, business_name.upper())

    # Gold rule
    _gold_rule(c, MARGIN * 2, PAGE_H - 96, PAGE_W - MARGIN * 4, 0.8)

    # Subtitle
    c.setFillColorRGB(*CREAM)
    c.setFont("Helvetica", 13)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 120, "Curated Catalogue")

    # Customer name
    c.setFillColorRGB(*GOLD)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 200, f"Prepared for {customer_name}")

    # Details
    c.setFillColorRGB(*MUTED)
    c.setFont("Helvetica", 11)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 230, f"Contains {len(products)} selected items")
    c.drawCentredString(PAGE_W / 2, PAGE_H - 250, f"Valid until {expiry_str}")

    # Gold rule divider
    _gold_rule(c, MARGIN * 2, PAGE_H - 270, PAGE_W - MARGIN * 4, 0.6)

    # Gold rate note
    c.setFillColorRGB(*MUTED)
    c.setFont("Helvetica", 9)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 300,
                        f"Current 22K rate: ₹{k22_rate}/g · Prices are indicative")

    # Bottom watermark band
    c.setFillColorRGB(*DARK)
    c.rect(0, 0, PAGE_W, 90, fill=1, stroke=0)
    _gold_rule(c, 0, 90, PAGE_W, 0.6)

    c.setFillColorRGB(*MUTED)
    c.setFont("Helvetica", 8)
    c.drawCentredString(PAGE_W / 2, 65, f"Ref: {share_id[:8].upper()}")
    c.drawCentredString(PAGE_W / 2, 50, "This catalogue is personal and non-transferable.")
    c.drawCentredString(PAGE_W / 2, 35, "Prices subject to change at actual time of purchase.")
    c.setFillColorRGB(*GOLD)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(PAGE_W / 2, 16, f"Jewellers MB · {customer_phone}")

    c.showPage()

    # ── PRODUCT PAGES (2 cols × 3 rows = 6 per page) ─────────────────────────
    HEADER_H = 32
    FOOTER_H = 28
    GRID_MARGIN = MARGIN
    COLS, ROWS = 2, 3
    GAP = 8

    usable_w = PAGE_W - 2 * GRID_MARGIN
    usable_h = PAGE_H - HEADER_H - FOOTER_H - 2 * GRID_MARGIN

    cell_w = (usable_w - (COLS - 1) * GAP) / COLS
    cell_h = (usable_h - (ROWS - 1) * GAP) / ROWS

    total_pages = (len(products) + 5) // 6

    for page_idx in range(total_pages):
        batch = products[page_idx * 6:(page_idx + 1) * 6]
        _fill_bg(c)

        # Header bar
        c.setFillColorRGB(*DARK)
        c.rect(0, PAGE_H - HEADER_H, PAGE_W, HEADER_H, fill=1, stroke=0)
        _gold_rule(c, 0, PAGE_H - HEADER_H, PAGE_W, 0.6)

        c.setFillColorRGB(*GOLD)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(MARGIN, PAGE_H - 20, f"{business_name.upper()}  ·  Curated Catalogue")

        c.setFillColorRGB(*MUTED)
        c.setFont("Helvetica", 8)
        page_label = f"Page {page_idx + 2} of {total_pages + 1}"
        c.drawRightString(PAGE_W - MARGIN, PAGE_H - 20, page_label)

        # Product cells
        for i, product in enumerate(batch):
            col = i % COLS
            row = i // COLS
            cx = GRID_MARGIN + col * (cell_w + GAP)
            cy = PAGE_H - HEADER_H - GRID_MARGIN - (row + 1) * cell_h - row * GAP
            _draw_cell(c, product, cx, cy, cell_w, cell_h, wm_text, k22_rate)

        # Footer
        c.setFillColorRGB(*DARK)
        c.rect(0, 0, PAGE_W, FOOTER_H, fill=1, stroke=0)
        _gold_rule(c, 0, FOOTER_H, PAGE_W, 0.5)

        c.setFillColorRGB(*MUTED)
        c.setFont("Helvetica", 7)
        c.drawCentredString(PAGE_W / 2, 10, f"Valid until {expiry_str}  ·  Ref {share_id[:8].upper()}  ·  * Indicative price, 12% making + 3% GST")

        c.showPage()

    # ── LAST PAGE: Contact & CTA ──────────────────────────────────────────────
    _fill_bg(c)

    c.setFillColorRGB(*GOLD)
    c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)

    c.setFillColorRGB(*GOLD)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 90, "Interested in any piece?")

    _gold_rule(c, MARGIN * 3, PAGE_H - 108, PAGE_W - MARGIN * 6, 0.8)

    c.setFillColorRGB(*CREAM)
    c.setFont("Helvetica", 12)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 145, "WhatsApp us to enquire about any item:")

    # WhatsApp number
    digits = "".join(d for d in whatsapp if d.isdigit())
    wa_link = f"wa.me/{digits}?text=Hi, I would like to enquire from catalogue {share_id[:8].upper()}"

    c.setFillColorRGB(*GOLD)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 175, whatsapp or "+91 XXXXX XXXXX")

    c.setFillColorRGB(*MUTED)
    c.setFont("Helvetica", 8)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 198, wa_link)

    _gold_rule(c, MARGIN * 2, PAGE_H - 218, PAGE_W - MARGIN * 4, 0.5)

    c.setFillColorRGB(*MUTED)
    c.setFont("Helvetica", 9)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 244, "All prices shown are indicative only.")
    c.drawCentredString(PAGE_W / 2, PAGE_H - 260, "Actual price depends on gold rate at time of purchase,")
    c.drawCentredString(PAGE_W / 2, PAGE_H - 274, "exact making charges, and stone/beads charges.")

    # Ref box
    c.setFillColorRGB(*DARK)
    c.roundRect(MARGIN * 4, PAGE_H - 360, PAGE_W - MARGIN * 8, 60, 5, fill=1, stroke=0)
    c.setStrokeColorRGB(*GOLD)
    c.setLineWidth(0.5)
    c.roundRect(MARGIN * 4, PAGE_H - 360, PAGE_W - MARGIN * 8, 60, 5, fill=0, stroke=1)

    c.setFillColorRGB(*MUTED)
    c.setFont("Helvetica", 8)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 315, "Catalogue Reference")
    c.setFillColorRGB(*GOLD)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 340, share_id[:8].upper())

    # Bottom
    c.setFillColorRGB(*DARK)
    c.rect(0, 0, PAGE_W, 70, fill=1, stroke=0)
    _gold_rule(c, 0, 70, PAGE_W, 0.5)
    c.setFillColorRGB(*MUTED)
    c.setFont("Helvetica", 8)
    c.drawCentredString(PAGE_W / 2, 48, f"Prepared for: {customer_name}  ·  {customer_phone}")
    c.drawCentredString(PAGE_W / 2, 32, f"Valid until {expiry_str}")
    c.drawCentredString(PAGE_W / 2, 16, "This catalogue is personal and non-transferable.")

    c.showPage()
    c.save()

    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")
