<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <!-- Basic style sheet that ensures that xsl:output attributes have proper capitalization
  and form, e.g. utf-8 instead of UTF-8. Formatting is done with prettier.
  at this time not a part of the github action workflow only called from the package.json
  npm run xmlStyle -->
  <xsl:output encoding="utf-8" indent="yes" />

  <xsl:template match="@* | node()">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()" />
    </xsl:copy>
  </xsl:template>
  <!-- Do not transform text from "<" or ">" into "&lt;" or "&gt;"
  for example arrow functions -->
  <xsl:template match="text()">
    <xsl:value-of select="." disable-output-escaping="yes" />
  </xsl:template>
</xsl:stylesheet>
