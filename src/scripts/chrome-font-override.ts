const lastSheet = document.styleSheets[document.styleSheets.length - 1]
lastSheet.insertRule(
    '* { font-family: inherit; }',
    lastSheet.cssRules.length,
)
