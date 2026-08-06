#!/usr/bin/env python3
"""Generador de páginas SEO estáticas para ruzafaclub.com.
Cluster: alquiler local por horas valencia + variantes transaccionales e informativas.
"""
import os, json, datetime

BASE = "https://www.ruzafaclub.com"
OUT = "/tmp/seo_pages"

CSS = "/assets/seo.css"

NAS = {
    "name": "Ruzafa Club House",
    "address": "Calle Matías Perelló, 32, 46005 Valencia, España",
    "phone": "+34622190802",
    "tel": "622190802",
    "phone_link": "tel:622190802",
    "wa": "https://wa.me/34622190802",
}

def local_business_schema(page_url, title, desc, btype="EventVenue"):
    return json.dumps({
        "@context": "https://schema.org",
        "@type": btype,
        "name": "Ruzafa Club House",
        "description": desc,
        "image": "https://www.ruzafaclub.com/img/ruzafa-cf-img1.jpg",
        "url": page_url,
        "telephone": NAS["phone"],
        "priceRange": "€€",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Calle Matías Perelló, 32",
            "addressLocality": "Valencia",
            "postalCode": "46005",
            "addressRegion": "Valencia",
            "addressCountry": "ES"
        },
        "geo": {"@type": "GeoCoordinates", "latitude": 39.4609, "longitude": -0.3755},
        "openingHours": "Mo-Su 10:00-22:00",
        "parentOrganization": {"@type": "Organization", "name": "MAT32"},
        "sameAs": ["https://www.mat32.com/", "https://www.instagram.com/ruzafaclub", "https://www.tiktok.com/@ruzafaclub"]
    }, ensure_ascii=False)

def faq_schema(qa):
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in qa
        ]
    }, ensure_ascii=False)

def render(tokens, title, meta, canonical, og, schema, content):
    t = open("/Users/josepujante/AGENCIA ORKESTRA/hostia-os/docs/seo/template.html").read()
    t = t.replace("__TITLE__", title)
    t = t.replace("__META_DESC__", meta)
    t = t.replace("__CANONICAL__", canonical)
    t = t.replace("__OG_TITLE__", og)
    t = t.replace("__SCHEMA__", schema)
    t = t.replace("__CSS__", CSS)
    t = t.replace("__CONTENT__", content)
    return t

def h1(text): return f"<h1>{text}</h1>"
def p(text): return f"<p>{text}</p>"
def h2(text): return f"<h2>{text}</h2>"
def ul(items): return "<ul>" + "".join(f"<li>{i}</li>" for i in items) + "</ul>"
def cta():
    return (f'<div class="cta-box"><p>¿Buscas alquilar el espacio? '
            f'<a class="cta" href="{NAS["phone_link"]}">Llámanos al {NAS["tel"]}</a> o '
            f'<a class="cta" href="{NAS["wa"]}" target="_blank" rel="noopener">escríbenos por WhatsApp</a>.</p></div>')

os.makedirs(OUT, exist_ok=True)

pages = {}

# ============ PILAR: alquiler local horas valencia ============
canon = f"{BASE}/alquiler-local-horas-valencia/"
content = h1("Alquiler de local por horas en Valencia")
content += p("Ruzafa Club House es un local boutique en pleno barrio de Ruzafa (Valencia) disponible para **alquiler por horas**. Un espacio diáfano con luz natural y estética industrial-chic, pensado para cumpleaños, eventos de empresa, rodajes y celebraciones privadas. Aforo hasta 100 personas en formato cóctel, ideal para grupos de 40 a 80.")
content += p("El espacio es la sede de **MAT32**, el bar Hi-Fi y dancehall underground de Ruzafa, y durante el día y fuera del horario de apertura del local se alquila por horas para eventos privados. Consulta el horario de apertura de <a href=\"https://www.mat32.com/\" rel=\"noopener\">MAT32</a> para conocer el bar al completo.")
content += cta()
content += h2("¿Cuánto cuesta alquilar un local por horas en Valencia?")
content += p("En Ruzafa Club House los alquileres por horas se contratan a partir de 75 €/h. El precio incluye mobiliario de diseño, sistema de sonido Hi-Fi, cabina de DJ profesional y zona de barra. La gestión de bebidas se realiza a través de nuestro propio staff para garantizar la excelencia del servicio.")
content += h2("¿Para qué se puede alquilar el local?")
content += ul([
    "Cumpleaños y celebraciones privadas",
    "Eventos de empresa y reuniones de equipo",
    "Producciones audiovisuales y rodajes",
    "Lanzamientos de producto y presentaciones",
    "Fiestas privadas y afters",
])
content += h2("Características del espacio")
content += ul([
    "Espacio diáfano con luz natural",
    "Mobiliario de autor",
    "Sonido Hi-Fi y cabina de DJ",
    "Zona de barra",
    "Ubicación privilegiada: Calle Matías Perelló, 32 — Ruzafa, 46005 Valencia",
    "Precio de alquiler desde 75 €/h",
])
content += cta()
content += h2("Cómo reservar")
content += p(f"Contacta por teléfono ({NAS['tel']}) o WhatsApp y cuéntanos tu plan: fecha, número de invitados y tipo de evento. Te confirmamos disponibilidad en menos de 1 hora y te ayudamos a montar tu evento perfecto.")
content += p("Más opciones: " + " · ".join([
    f'<a href="{BASE}/alquiler-local-eventos-valencia/">alquiler para eventos</a>',
    f'<a href="{BASE}/alquiler-local-cumpleanos-valencia/">cumpleaños</a>',
    f'<a href="{BASE}/alquiler-local-empresa-valencia/">eventos de empresa</a>',
    f'<a href="{BASE}/guia-alquiler-local-valencia/">guía de alquiler local en Valencia</a>',
]))
schema = local_business_schema(canon, "Alquiler de local por horas en Valencia", "Local boutique por horas en Ruzafa, Valencia. Cumpleaños, eventos de empresa, rodajes. Desde 75€/h.")
pages["alquiler-local-horas-valencia"] = render(
    {}, "Alquiler de Local por Horas en Valencia | Ruzafa Club House",
    "Local boutique por horas en Ruzafa (Valencia). Cumpleaños, eventos de empresa y rodajes. Desde 75€/h, aforo 100. Reserva por teléfono o WhatsApp.",
    canon, "Alquiler de Local por Horas en Valencia", schema, content)

# ============ eventos ============
canon = f"{BASE}/alquiler-local-eventos-valencia/"
content = h1("Alquiler de local para eventos en Valencia")
content += p("Organiza tu evento en Ruzafa Club House, un espacio exclusivo en el corazón de Ruzafa (Valencia). Disponible por horas para eventos privados y corporativos, con luz natural y estética industrial-chic. Aforo de 40 a 100 personas.")
content += cta()
content += h2("Eventos que acogemos")
content += ul([
    "Fiestas de cumpleaños",
    "Eventos de empresa",
    "Reuniones de equipo y team building",
    "Presentaciones y lanzamientos",
    "Rodajes y producciones audiovisuales",
    "Afterworks y eventos sociales",
])
content += h2("Servicios incluidos")
content += ul([
    "Mobiliario de diseño",
    "Sistema de sonido Hi-Fi",
    "Cabina de DJ profesional",
    "Zona de barra con staff",
    "Luz natural y decoración de autor",
])
content += cta()
content += h2("Ubicación y acceso")
content += p("Calle Matías Perelló, 32, 46005 Valencia — a un paso de la plaza de Ruzafa, con excelente conexión de transporte público.")
content += p("Ver también: " + " · ".join([
    f'<a href="{BASE}/alquiler-local-horas-valencia/">alquiler por horas</a>',
    f'<a href="{BASE}/alquiler-local-cumpleanos-valencia/">cumpleaños</a>',
    f'<a href="{BASE}/alquiler-local-empresa-valencia/">empresa</a>',
]))
schema = local_business_schema(canon, "Alquiler de local para eventos en Valencia", "Local para eventos por horas en Ruzafa, Valencia. Cumpleaños, empresa, rodajes. Aforo hasta 100.")
pages["alquiler-local-eventos-valencia"] = render(
    {}, "Alquiler de Local para Eventos en Valencia | Ruzafa Club House",
    "Local para eventos por horas en Ruzafa (Valencia). Fiestas, reuniones, rodajes. Aforo hasta 100 personas, desde 75€/h. Reserva ya.",
    canon, "Alquiler de Local para Eventos en Valencia", schema, content)

# ============ cumpleaños ============
canon = f"{BASE}/alquiler-local-cumpleanos-valencia/"
content = h1("Alquiler de local para cumpleaños en Valencia")
content += p("Celebra tu cumpleaños en Ruzafa Club House. Un local privado y de diseño en Ruzafa (Valencia) ideal para fiestas de 40 a 80 personas. Sonido, DJ, barra y un espacio único que tus invitados recordarán.")
content += cta()
content += h2("¿Por qué elegir nuestro local para tu cumpleaños?")
content += ul([
    "Espacio privado solo para ti y tus invitados",
    "Estética industrial-chic y luz natural",
    "Cabina de DJ y sonido Hi-Fi",
    "Zona de barra con servicio profesional",
    "Ubicación céntrica en Ruzafa",
])
content += h2("Consejos para tu fiesta")
content += p("Reserva con antelación, decide el número de invitados y comunícanos si quieres catering u otros servicios. Nuestro equipo te ayuda a montar la celebración perfecta.")
content += cta()
schema = local_business_schema(canon, "Alquiler de local para cumpleaños en Valencia", "Local privado por horas para cumpleaños en Ruzafa, Valencia. Desde 75€/h, aforo 40-80.")
pages["alquiler-local-cumpleanos-valencia"] = render(
    {}, "Alquiler de Local para Cumpleaños en Valencia | Ruzafa Club House",
    "Local privado para cumpleaños en Ruzafa (Valencia). Desde 75€/h, aforo 40-80, con DJ, sonido y barra. Reserva en minutos.",
    canon, "Alquiler de Local para Cumpleaños en Valencia", schema, content)

# ============ empresa ============
canon = f"{BASE}/alquiler-local-empresa-valencia/"
content = h1("Alquiler de local para eventos de empresa en Valencia")
content += p("Ruzafa Club House es el espacio perfecto para reuniones, presentaciones y eventos de empresa en Valencia. Un hub creativo con estética industrial-chic y luz natural en el centro de Ruzafa. Ideal para grupos de 40 a 80 personas.")
content += cta()
content += h2("Usos corporativos")
content += ul([
    "Reuniones de equipo y offsites",
    "Presentaciones de producto",
    "Lanzamientos de marca",
    "Afterworks y eventos de networking",
    "Team building",
])
content += h2("Equipamiento para tu evento")
content += ul([
    "Sonido Hi-Fi",
    "Cabina de DJ",
    "Mobiliario de diseño",
    "Zona de barra",
    "Conexión tecnológica",
])
content += cta()
schema = local_business_schema(canon, "Alquiler de local para eventos de empresa en Valencia", "Local por horas para eventos de empresa en Valencia. Reuniones, presentaciones, afterworks. Aforo 40-80, desde 75€/h.")
pages["alquiler-local-empresa-valencia"] = render(
    {}, "Alquiler de Local para Empresa en Valencia | Ruzafa Club House",
    "Local por horas para eventos de empresa en Valencia: reuniones, presentaciones, afterworks. Aforo 40-80, desde 75€/h. Reserva ya.",
    canon, "Alquiler de Local para Eventos de Empresa en Valencia", schema, content)

# ============ guía ============
canon = f"{BASE}/guia-alquiler-local-valencia/"
faq = [
    ("¿Cuánto cuesta alquilar un local por horas en Valencia?",
     "En Ruzafa Club House el alquiler por horas parte de 75 €/h e incluye mobiliario, sonido Hi-Fi, cabina de DJ y zona de barra."),
    ("¿Cuál es el aforo máximo del local?",
     "El local acoge hasta 100 personas en formato cóctel, ideal para grupos de 40 a 80 personas."),
    ("¿Qué incluye el alquiler?",
     "Incluye mobiliario de diseño, sistema de sonido Hi-Fi, cabina de DJ profesional y zona de barra. La gestión de bebidas se hace a través de nuestro staff."),
    ("¿Se puede contratar catering?",
     "Sí, se puede contratar catering u otros servicios adicionales. Consúltanos tu plan y lo personalizamos."),
    ("¿Dónde está el local?",
     "En Calle Matías Perelló, 32, 46005 Valencia, en pleno barrio de Ruzafa."),
]
content = h1("Guía: cómo alquilar un local por horas en Valencia")
content += p("Elegir un local por horas en Valencia puede parecer complicado. Esta guía te explica qué tener en cuenta y por qué Ruzafa Club House es una de las mejores opciones en el barrio de Ruzafa para eventos privados y corporativos.")
content += cta()
content += h2("¿Qué tener en cuenta al alquilar un local por horas?")
content += ul([
    "Aforo: asegúrate de que el espacio cabe tu número de invitados",
    "Equipamiento: sonido, DJ, mobiliario, barra",
    "Precio por hora y qué incluye",
    "Ubicación y accesibilidad",
    "Privacidad del espacio",
])
content += h2("Preguntas frecuentes")
content += "<div class='faq'>" + "".join(f"<h3>{q}</h3><p>{a}</p>" for q, a in faq) + "</div>"
content += p("Explora: " + " · ".join([
    f'<a href="{BASE}/alquiler-local-horas-valencia/">alquiler por horas</a>',
    f'<a href="{BASE}/alquiler-local-eventos-valencia/">eventos</a>',
    f'<a href="{BASE}/alquiler-local-empresa-valencia/">empresa</a>',
]))
schema = faq_schema(faq)
pages["guia-alquiler-local-valencia"] = render(
    {}, "Guía: Alquilar un Local por Horas en Valencia | Ruzafa Club House",
    "Guía para alquilar un local por horas en Valencia. Costes, aforo, equipamiento y preguntas frecuentes. Descubre Ruzafa Club House.",
    canon, "Guía: Alquilar un Local por Horas en Valencia", schema, content)

# escribir archivos
for name, html in pages.items():
    with open(f"{OUT}/{name}.html", "w") as f:
        f.write(html)
    print("escrito:", name, len(html), "bytes")
print("TOTAL páginas:", len(pages))
