export function ThemeScript() {
  const script = `
(function() {
  try {
    function getCookie(name) {
      var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    }
    var theme = getCookie('ch_theme');
    var accent = getCookie('ch_accent');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    if (accent && ['green','blue','terra','plum','ink'].indexOf(accent) !== -1) {
      document.documentElement.setAttribute('data-accent', accent);
    }
  } catch(e) {}
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
