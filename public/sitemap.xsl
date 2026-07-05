<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <xsl:output method="html" encoding="UTF-8" indent="yes"
    doctype-system="about:legacy-compat"/>

  <xsl:template match="/">
    <html lang="ro">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title>Sitemap · NuntaPlanner</title>
        <style>
          :root { --rose: #b04a6f; --ink: #1f2430; --muted: #6b7280;
                  --line: #e7e3e8; --bg: #faf7f9; --card: #ffffff; }
          * { box-sizing: border-box; }
          body { margin: 0; background: var(--bg); color: var(--ink);
                 font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
          a { color: var(--rose); text-decoration: none; }
          a:hover { text-decoration: underline; }
          .wrap { max-width: 1000px; margin: 0 auto; padding: 24px 20px 64px; }
          header.top { display: flex; align-items: center; justify-content: space-between;
                       gap: 16px; padding: 8px 0 20px; border-bottom: 1px solid var(--line); }
          .brand { display: flex; align-items: center; gap: 12px; }
          .brand img { height: 38px; width: auto; display: block; }
          .brand .name { font-weight: 700; font-size: 18px; color: var(--ink); }
          .home { font-size: 14px; font-weight: 600; }
          h1 { font-size: 22px; margin: 24px 0 4px; }
          .lead { color: var(--muted); margin: 0 0 20px; font-size: 14px; }
          .count { display: inline-block; background: #f3e9ee; color: var(--rose);
                   border-radius: 999px; padding: 2px 10px; font-size: 13px; font-weight: 600; }
          .card { background: var(--card); border: 1px solid var(--line);
                  border-radius: 12px; overflow: hidden; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th { text-align: left; font-size: 12px; text-transform: uppercase;
               letter-spacing: .04em; color: var(--muted); background: #f7f3f5;
               padding: 10px 14px; border-bottom: 1px solid var(--line); }
          td { padding: 11px 14px; border-bottom: 1px solid var(--line);
               vertical-align: top; }
          tr:last-child td { border-bottom: 0; }
          td.u { word-break: break-all; }
          td.meta { white-space: nowrap; color: var(--muted); }
          .tag { font-size: 12px; color: var(--muted); }
          footer { margin-top: 22px; color: var(--muted); font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <header class="top">
            <a class="brand" href="/">
              <img src="/logo.png" alt="NuntaPlanner"/>
              <span class="name">NuntaPlanner</span>
            </a>
            <a class="home" href="/">← Înapoi la site</a>
          </header>

          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <xsl:call-template name="index"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:call-template name="urls"/>
            </xsl:otherwise>
          </xsl:choose>

          <footer>Sitemap generat de NuntaPlanner · <a href="/">nuntaplanner</a></footer>
        </div>
      </body>
    </html>
  </xsl:template>

  <!-- Index: listă de sitemap-uri copil -->
  <xsl:template name="index">
    <h1>Index sitemap</h1>
    <p class="lead">
      <span class="count"><xsl:value-of select="count(s:sitemapindex/s:sitemap)"/> sitemap-uri</span>
    </p>
    <div class="card">
      <table>
        <tr><th>Sitemap</th><th>Actualizat</th></tr>
        <xsl:for-each select="s:sitemapindex/s:sitemap">
          <tr>
            <td class="u"><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
            <td class="meta"><xsl:value-of select="substring(s:lastmod,1,10)"/></td>
          </tr>
        </xsl:for-each>
      </table>
    </div>
  </xsl:template>

  <!-- Urlset: listă de pagini -->
  <xsl:template name="urls">
    <h1>Pagini</h1>
    <p class="lead">
      <span class="count"><xsl:value-of select="count(s:urlset/s:url)"/> URL-uri</span>
    </p>
    <div class="card">
      <table>
        <tr><th>URL</th><th>Media</th><th>Actualizat</th><th>Prioritate</th></tr>
        <xsl:for-each select="s:urlset/s:url">
          <tr>
            <td class="u"><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
            <td class="meta">
              <xsl:if test="count(image:image) &gt; 0">
                <span class="tag"><xsl:value-of select="count(image:image)"/> img</span>
              </xsl:if>
              <xsl:if test="count(video:video) &gt; 0">
                <span class="tag"> · <xsl:value-of select="count(video:video)"/> video</span>
              </xsl:if>
            </td>
            <td class="meta"><xsl:value-of select="substring(s:lastmod,1,10)"/></td>
            <td class="meta"><xsl:value-of select="s:priority"/></td>
          </tr>
        </xsl:for-each>
      </table>
    </div>
  </xsl:template>
</xsl:stylesheet>
